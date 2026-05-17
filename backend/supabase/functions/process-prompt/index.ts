// ============================================================
// process-prompt — Processes exactly ONE prompt in a flow chain.
//
// Input:  { idea_id, prompt_index }
// Steps:
//   1.  Load idea
//   2.  Load flow + prompt list
//   3.  Get prompt at prompt_index
//   4.  Load all prior chat_messages for accumulated context
//   5.  PREPARE: load model profile + schema, build system prompt
//   6.  CALL LLM → NORMALIZE → VALIDATE (with retry)
//   7.  Store: prompt (role='system') + response (role='assistant')
//   8.  Update idea category/score from parsed response
//   9.  If next prompt exists → invoke process-prompt(prompt_index+1)
//  10.  Else → mark idea 'completed'
//
// Each invocation is stateless — everything comes from the DB.
// ============================================================

import { createServiceClient }   from '../_shared/db.ts'
import { corsPreflight, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { log, logError }         from '../_shared/log.ts'
import * as fireworks            from '../_shared/providers/fireworks.ts'
import * as openai               from '../_shared/providers/openai.ts'
import * as anthropic            from '../_shared/providers/anthropic.ts'
import * as gemini               from '../_shared/providers/gemini.ts'
import * as groq                 from '../_shared/providers/groq.ts'
import { loadModelProfile, computeOutputBudget, type ModelProfile } from '../_shared/model-profiles.ts'
import {
  stripReasoning,
  extractResponse,
  normalizeResponse,
  normalizeVerdict,
  validateResponse,
  type NormalizedResponse
} from '../_shared/normalization.ts'

const FN = 'process-prompt'

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return corsPreflight()

  let body: { idea_id?: string; prompt_index?: number; custom_prompt_id?: string; run_id?: string }
  try { body = await req.json() }
  catch { return errorResponse('Invalid JSON body', 400) }

  const { idea_id, prompt_index, custom_prompt_id, run_id } = body
  if (!idea_id)              return errorResponse('Missing idea_id', 400)

  const ctx = { fn: FN, idea_id, prompt_index, custom_prompt_id, run_id }

  try {
    await runPrompt(idea_id, prompt_index, custom_prompt_id, run_id)
    return jsonResponse({ ok: true })
  } catch (err) {
    logError(ctx, err, 'process-prompt threw')
    return errorResponse('Internal error', 500)
  }
})

// ─── Main Logic ──────────────────────────────────────────────────────────────

async function runPrompt(idea_id: string, prompt_index?: number, custom_prompt_id?: string, run_id?: string): Promise<void> {
  const supabase = createServiceClient()
  const ctx      = { fn: FN, idea_id, prompt_index, custom_prompt_id, run_id }

  // 1. Load idea
  const { data: idea, error: ideaErr } = await supabase
    .from('ideas')
    .select('id, idea, flow_id, status')
    .eq('id', idea_id)
    .single()

  if (ideaErr || !idea) throw new Error(`Idea not found: ${ideaErr?.message}`)

  // 2. Load flow (only needed if we are running by index)
  let promptId = custom_prompt_id

  if (!promptId) {
    // Guard: skip if idea already failed or completed by another path and we are automating
    // (bypassed when run_id is present — runs have their own lifecycle independent of idea status)
    if (!run_id && (idea.status === 'failed' || idea.status === 'completed')) {
      log(ctx, `Idea already in terminal state '${idea.status}' — skipping`)
      return
    }

    if (prompt_index == null) throw new Error('Missing prompt_index or custom_prompt_id')

    const { data: flow, error: flowErr } = await supabase
      .from('flows')
      .select('id, flow_name, prompt_ids')
      .eq('id', idea.flow_id)
      .single()

    if (flowErr || !flow) throw new Error(`Flow not found: ${flowErr?.message}`)

    const promptIds: string[] = flow.prompt_ids as string[]

    if (prompt_index >= promptIds.length) {
      if (run_id) {
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('tokens_used')
          .eq('run_id', run_id)
        const totalTokens = msgs?.reduce((s, m) => s + (m.tokens_used ?? 0), 0) ?? 0

        const { data: runData } = await supabase
          .from('idea_runs')
          .select('category, score')
          .eq('id', run_id)
          .single()

        await supabase.from('idea_runs').update({
          status: 'completed',
          total_tokens: totalTokens,
          completed_at: new Date().toISOString(),
        }).eq('id', run_id)

        await supabase.from('ideas')
          .update({ category: runData?.category, score: runData?.score, status: 'completed' })
          .eq('id', idea_id)
          .eq('latest_run_id', run_id)
      } else {
        await markCompleted(supabase, idea_id)
      }
      log(ctx, 'No more prompts — idea completed')
      return
    }

    promptId = promptIds[prompt_index]
  }

  // 3. Get actual prompt
  const { data: prompt, error: promptErr } = await supabase
    .from('prompts')
    .select('id, prompt_name, prompt, context_mode, use_system_format, custom_schema')
    .eq('id', promptId)
    .single()

  if (promptErr || !prompt) throw new Error(`Prompt not found: ${promptErr?.message}`)

  log(ctx, `Running prompt '${prompt.prompt_name}'`)

  // 4. Load all prior chat_messages (global for sequence numbering)
  const { data: allMessages } = await supabase
    .from('chat_messages')
    .select('message_type, message, sequence_number, run_id')
    .eq('idea_id', idea_id)
    .order('sequence_number', { ascending: true })

  // Context is scoped to the current run when run_id is set, preventing cross-run context bleed
  const contextMessages = run_id
    ? (allMessages ?? []).filter(m => m.run_id === run_id || m.message_type === 'idea')
    : (allMessages ?? [])

  // 5. Build ONE explicit user message based on context_mode
  let finalInput = prompt.prompt

  if (prompt.context_mode === 'idea_only') {
    const ideaMsg = contextMessages.find(m => m.message_type === 'idea')
    finalInput += `\n\nIDEA:\n${ideaMsg?.message ?? ''}`
  } else if (prompt.context_mode === 'previous_response') {
    const prevResMsg = contextMessages.slice().reverse().find(m => m.message_type === 'response')
    finalInput += `\n\nPREVIOUS RESPONSE:\n${prevResMsg?.message ?? ''}`
  } else if (prompt.context_mode === 'full_history_json') {
    const ideaMsg = contextMessages.find(m => m.message_type === 'idea')
    const steps: { prompt: string; response: string }[] = []

    let currentPrompt = ''
    for (const m of contextMessages) {
      if (m.message_type === 'prompt') {
        currentPrompt = m.message
      } else if (m.message_type === 'response' && currentPrompt) {
        steps.push({ prompt: currentPrompt, response: m.message })
        currentPrompt = ''
      }
    }

    const historyData = {
      idea: ideaMsg?.message ?? '',
      steps
    }
    finalInput += `\n\nFULL CONTEXT JSON:\n${JSON.stringify(historyData, null, 2)}`
  }

  // 6. Load active model — prefers is_active=true, falls back to first row
  let model: { id: string; model_id: string; provider: string } | null = null
  const { data: activeModel } = await supabase
    .from('models')
    .select('id, model_id, provider')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (activeModel) {
    model = activeModel
  } else {
    const { data: firstModel } = await supabase
      .from('models')
      .select('id, model_id, provider')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    model = firstModel ?? null
  }

  if (!model) throw new Error('No model configured — add a model in the dashboard')

  // Transition run from queued → processing (only on first step — subsequent steps are already 'processing')
  if (run_id && (prompt_index ?? 0) === 0) {
    const { data: updatedRuns } = await supabase
      .from('idea_runs')
      .update({ status: 'processing' })
      .eq('id', run_id)
      .eq('status', 'queued')
      .select('id')

    if (!updatedRuns || updatedRuns.length === 0) {
      log(ctx, 'Run already claimed or not queued — aborting', { run_id })
      return
    }
  }

  const apiKey = Deno.env.get('AI_API_KEY') ?? ''
  if (!apiKey) throw new Error('AI_API_KEY secret not set')

  // 7. Load model profile (PREPARE stage)
  const profile = await loadModelProfile(model.id)
  if (!profile) log(ctx, 'No model profile found, using defaults')

  const effectiveProfile = profile ?? {
    id: '',
    model_id: model.id,
    max_tokens: 8192,
    reasoning_budget: 0,
    temperature: 0.3,
    timeout_ms: 60000,
    strip_reasoning: true,
    max_retries: 2,
    prompt_format: 'json_schema' as const,
    normalization_config: {
      reasoning_patterns: { tag_based: [] as string[], prefix_based: [] as string[] },
      synonym_map: {} as Record<string, string>,
      double_verdict_strategy: 'last_occurrence'
    }
  }

  // 8. Load prompt schema
  const schema = await loadPromptSchema(prompt.id)

  // 9. Build system prompt (PREPARE stage)
  const systemPrompt = buildSystemPrompt(effectiveProfile, prompt, schema)

  // 10. Process with retry (CALL LLM → NORMALIZE → VALIDATE)
  let aiAnalysis = ''
  let category: string | null = null
  let score: string | null = null
  let reasoningContent: string | null = null
  let rawContent = ''
  let succeeded = false
  let tokensUsed = 0
  let lastError = ''
  let attemptsTaken = 0

  for (let attempt = 1; attempt <= effectiveProfile.max_retries; attempt++) {
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: finalInput }
    ]

    if (attempt > 1) {
      messages.push({
        role: 'user',
        content: `Your previous response failed validation. Please respond ONLY with valid ${effectiveProfile.prompt_format} matching the required schema.`
      })
    }

    try {
      const result = await callProviderWithTimeout(
        model.provider,
        model.model_id,
        messages,
        effectiveProfile
      )

      rawContent = result.content
      tokensUsed = result.outputTokens

      // NORMALIZE stage
      const { cleaned, reasoning } = stripReasoning(
        rawContent,
        effectiveProfile.normalization_config.reasoning_patterns
      )
      reasoningContent = reasoning

      const extracted = extractResponse(cleaned, effectiveProfile.prompt_format)
      if (extracted.error) throw new Error(extracted.error)

      const normalized = normalizeResponse(extracted.content, schema.field_aliases)

      if (normalized.score) {
        normalized.score = normalizeVerdict(
          normalized.score,
          effectiveProfile.normalization_config.synonym_map
        )
      }

      // VALIDATE stage
      const validation = validateResponse(
        normalized,
        schema.allowed_categories || ['startup_idea', 'automation', 'personal_tool', 'dev_tool', 'other'],
        schema.allowed_scores || ['strong', 'weak', 'needs_pivot', 'needs_refinement']
      )

      if (validation.valid) {
        aiAnalysis = normalized.analysis || ''
        category = normalized.category || null
        score = normalized.score || null
        succeeded = true
        attemptsTaken = attempt
        log({ ...ctx, attempt }, 'Response validated successfully')
        break
      } else {
        throw new Error(`Validation failed: ${validation.errors.join('; ')}`)
      }

    } catch (err: any) {
      lastError = err?.message ?? String(err)
      logError({ ...ctx, attempt }, err, `Attempt ${attempt} failed`)
      if (attempt === effectiveProfile.max_retries) break
    }
  }

  if (!succeeded) {
    const debugContent = rawContent || `[ERROR: ${lastError}]`
    await supabase.from('chat_messages').insert([
      { idea_id, message: prompt.prompt, message_type: 'prompt', prompt_id: prompt.id, sequence_number: nextSeq(allMessages), run_id: run_id ?? null },
      { idea_id, message: debugContent, message_type: 'response', prompt_id: prompt.id, sequence_number: nextSeq(allMessages) + 1, run_id: run_id ?? null },
    ])

    if (run_id) {
      await supabase.from('idea_runs').update({
        status: 'failed',
        error_message: lastError,
        validation_state: 'invalid',
      }).eq('id', run_id)
    } else {
      await supabase.from('ideas').update({ status: 'failed' }).eq('id', idea_id)
    }

    throw new Error(`Failed after ${effectiveProfile.max_retries} attempts`)
  }

  // 11. Store messages with reasoning metadata
  const seqBase = nextSeq(allMessages)
  const { error: insertErr } = await supabase.from('chat_messages').insert([
    {
      idea_id,
      message: prompt.prompt,
      message_type: 'prompt',
      prompt_id: prompt.id,
      sequence_number: seqBase,
      run_id: run_id ?? null,
    },
    {
      idea_id,
      message: aiAnalysis,
      message_type: 'response',
      prompt_id: prompt.id,
      sequence_number: seqBase + 1,
      reasoning_content: reasoningContent,
      tokens_used: tokensUsed,
      run_id: run_id ?? null,
    },
  ])

  if (insertErr) throw new Error(`Failed to store messages: ${insertErr.message}`)

  // 12. Update idea with latest category/score (upserts on every step)
  const stepValidationState = attemptsTaken > 1 ? 'recovered' : 'valid'

  if (run_id) {
    await supabase.from('idea_runs').update({
      category,
      score,
      validation_state: stepValidationState,
    }).eq('id', run_id)
  } else {
    await supabase.from('ideas').update({ category, score }).eq('id', idea_id)
  }

  log(ctx, 'Messages stored', { category, score })

  // 13. Chain next prompt OR mark completed
  // If we ran a custom prompt, we don't automatically chain anything.
  if (custom_prompt_id) {
    if (run_id) {
      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('tokens_used')
        .eq('run_id', run_id)
      const totalTokens = msgs?.reduce((s, m) => s + (m.tokens_used ?? 0), 0) ?? 0

      await supabase.from('idea_runs').update({
        status: 'completed',
        total_tokens: totalTokens,
        completed_at: new Date().toISOString(),
      }).eq('id', run_id)

      await supabase.from('ideas')
        .update({ category, score, status: 'completed' })
        .eq('id', idea_id)
        .eq('latest_run_id', run_id)
    } else {
      await supabase.from('ideas').update({ status: 'completed' }).eq('id', idea_id)
    }
    log(ctx, 'Custom prompt complete — idea marked completed')
    return
  }

  // Otherwise, handle flow logic
  const { data: flow } = await supabase.from('flows').select('prompt_ids').eq('id', idea.flow_id).single()
  const promptIds = (flow?.prompt_ids as string[]) || []
  const isLast = (prompt_index || 0) + 1 >= promptIds.length

  if (isLast) {
    if (run_id) {
      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('tokens_used')
        .eq('run_id', run_id)
      const totalTokens = msgs?.reduce((s, m) => s + (m.tokens_used ?? 0), 0) ?? 0

      await supabase.from('idea_runs').update({
        status: 'completed',
        total_tokens: totalTokens,
        completed_at: new Date().toISOString(),
      }).eq('id', run_id)

      await supabase.from('ideas')
        .update({ category, score, status: 'completed' })
        .eq('id', idea_id)
        .eq('latest_run_id', run_id)
    } else {
      await markCompleted(supabase, idea_id)
    }
    log(ctx, 'Chain complete — idea completed')
  } else {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const nextCall = fetch(`${supabaseUrl}/functions/v1/process-prompt`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ idea_id, prompt_index: prompt_index + 1, run_id }),
    }).then(r => {
      if (!r.ok) r.text().then(t =>
        logError(ctx, new Error(`Next invoke failed: ${r.status} ${t}`))
      )
    }).catch(err => logError(ctx, err, 'Next chain fetch threw'))

    // @ts-ignore
    if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(nextCall)
    log(ctx, `Fired process-prompt(${prompt_index + 1}) asynchronously`)
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function markCompleted(supabase: ReturnType<typeof createServiceClient>, idea_id: string) {
  await supabase.from('ideas').update({ status: 'completed' }).eq('id', idea_id)
}

// Returns the next sequence_number for a new message
function nextSeq(msgs: { sequence_number: number }[] | null): number {
  if (!msgs || msgs.length === 0) return 2 // 1 is the initial user idea
  return Math.max(...msgs.map(m => m.sequence_number)) + 1
}

async function loadPromptSchema(promptId: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('prompt_schemas')
    .select('*')
    .eq('prompt_id', promptId)
    .single()

  return data ?? {
    field_aliases: {
      analysis: ['analysis', 'content', 'response', 'output'],
      category: ['category', 'type', 'domain', 'classification'],
      score: ['score', 'verdict', 'rating', 'assessment']
    },
    allowed_categories: ['startup_idea', 'automation', 'personal_tool', 'dev_tool', 'other'],
    allowed_scores: ['strong', 'weak', 'needs_pivot', 'needs_refinement']
  }
}

function buildSystemPrompt(profile: ModelProfile, prompt: any, schema: any): string {
  if (!prompt.use_system_format) {
    return prompt.custom_schema || ''
  }

  const categories = schema.allowed_categories?.join(', ') || 'startup_idea, automation, personal_tool, dev_tool, other'
  const scores = schema.allowed_scores?.join(', ') || 'strong, weak, needs_pivot, needs_refinement'

  switch (profile.prompt_format) {
    case 'xml_tags':
      return `IMPORTANT: Return your response in this exact XML format:
<response>
  <analysis>Your detailed analysis here</analysis>
  <category>One of: ${categories}</category>
  <score>One of: ${scores}</score>
</response>`

    case 'markdown_sections':
      return `IMPORTANT: Format your response with these exact sections:

## Analysis
[Your detailed analysis]

## Category
[MUST be exactly one of: ${categories}]

## Score
[MUST be exactly one of: ${scores}]`

    case 'json_schema':
    default:
      return `IMPORTANT: You MUST return ONLY a valid JSON object with exactly these three keys:
{
  "analysis": "your detailed analysis and response here (markdown supported)",
  "category": "MUST be exactly one of: ${categories}",
  "score": "MUST be exactly one of: ${scores}"
}
Do NOT wrap in markdown code fences. Return raw JSON only.`
  }
}

// Routes to the correct provider based on model.provider string
async function callProvider(
  provider: string,
  modelId:  string,
  messages: any[],
  options: { temperature: number; maxTokens: number; apiKey: string },
): Promise<{ content: string; outputTokens: number }> {
  const params = { modelId, messages, temperature: options.temperature, maxTokens: options.maxTokens, apiKey: options.apiKey }
  if (provider === 'openai')    return openai.generateCompletion(params)
  if (provider === 'anthropic') return anthropic.generateCompletion(params)
  if (provider === 'gemini')    return gemini.generateCompletion(params)
  if (provider === 'groq')      return groq.generateCompletion(params)
  return fireworks.generateCompletion(params)
}

async function callProviderWithTimeout(
  provider: string,
  modelId: string,
  messages: any[],
  profile: ModelProfile
): Promise<{ content: string; outputTokens: number }> {
  const apiKey = Deno.env.get('AI_API_KEY') || ''
  const outputBudget = computeOutputBudget(profile)

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${profile.timeout_ms}ms`)), profile.timeout_ms)
  )

  return Promise.race([
    callProvider(provider, modelId, messages, {
      temperature: profile.temperature,
      maxTokens: outputBudget,
      apiKey,
    }),
    timeoutPromise,
  ])
}
