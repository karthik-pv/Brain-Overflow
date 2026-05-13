// ============================================================
// process-prompt — Processes exactly ONE prompt in a flow chain.
//
// Input:  { idea_id, prompt_index }
// Steps:
//   1.  Load idea
//   2.  Load flow + prompt list
//   3.  Get prompt at prompt_index
//   4.  Load all prior chat_messages for accumulated context
//   5.  Call LLM with full history + current prompt
//   6.  Validate JSON response (retry up to 3x)
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

const FN              = 'process-prompt'
const MAX_TOKENS      = 4096
const TEMPERATURE     = 0.7

const VALID_CATEGORIES = ['startup_idea', 'automation', 'personal_tool', 'dev_tool', 'other'] as const
const VALID_SCORES     = ['strong', 'weak', 'needs_pivot', 'needs_refinement'] as const

// System instruction appended to every prompt — forces structured JSON output
const JSON_FORMAT_INSTRUCTION = `

IMPORTANT: You MUST return ONLY a valid JSON object with exactly these three keys:
{
  "analysis": "your detailed analysis and response here (markdown supported)",
  "category": "MUST be exactly one of: startup_idea, automation, personal_tool, dev_tool, other",
  "score":    "MUST be exactly one of: strong, weak, needs_pivot, needs_refinement"
}
Do NOT wrap in markdown code fences. Return raw JSON only.`

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return corsPreflight()

  let body: { idea_id?: string; prompt_index?: number }
  try { body = await req.json() }
  catch { return errorResponse('Invalid JSON body', 400) }

  const { idea_id, prompt_index } = body
  if (!idea_id)              return errorResponse('Missing idea_id', 400)
  if (prompt_index == null)  return errorResponse('Missing prompt_index', 400)

  const ctx = { fn: FN, idea_id, prompt_index }

  try {
    await runPrompt(idea_id, prompt_index)
    return jsonResponse({ ok: true })
  } catch (err) {
    logError(ctx, err, 'process-prompt threw')
    return errorResponse('Internal error', 500)
  }
})

// ─── Main Logic ──────────────────────────────────────────────────────────────

async function runPrompt(idea_id: string, prompt_index: number): Promise<void> {
  const supabase = createServiceClient()
  const ctx      = { fn: FN, idea_id, prompt_index }

  // 1. Load idea
  const { data: idea, error: ideaErr } = await supabase
    .from('ideas')
    .select('id, idea, flow_id, status')
    .eq('id', idea_id)
    .single()

  if (ideaErr || !idea) throw new Error(`Idea not found: ${ideaErr?.message}`)

  // Guard: skip if idea already failed or completed by another path
  if (idea.status === 'failed' || idea.status === 'completed') {
    log(ctx, `Idea already in terminal state '${idea.status}' — skipping`)
    return
  }

  // 2. Load flow
  const { data: flow, error: flowErr } = await supabase
    .from('flows')
    .select('id, flow_name, prompt_ids')
    .eq('id', idea.flow_id)
    .single()

  if (flowErr || !flow) throw new Error(`Flow not found: ${flowErr?.message}`)

  const promptIds: string[] = flow.prompt_ids as string[]

  if (prompt_index >= promptIds.length) {
    // Past end of chain — mark completed
    await markCompleted(supabase, idea_id)
    log(ctx, 'No more prompts — idea completed')
    return
  }

  // 3. Get prompt at current index
  const promptId = promptIds[prompt_index]
  const { data: prompt, error: promptErr } = await supabase
    .from('prompts')
    .select('id, prompt_name, prompt, multi_turn')
    .eq('id', promptId)
    .single()

  if (promptErr || !prompt) throw new Error(`Prompt not found: ${promptErr?.message}`)

  log(ctx, `Running prompt '${prompt.prompt_name}' (${prompt_index + 1}/${promptIds.length})`)

  // 4. Load all prior chat_messages
  const { data: allMessages } = await supabase
    .from('chat_messages')
    .select('role, message, sequence_number')
    .eq('idea_id', idea_id)
    .order('sequence_number', { ascending: true })
    
  let contextMessages = allMessages ?? []
  
  if (!prompt.multi_turn) {
    if (contextMessages.length <= 1) {
      // First prompt: just the idea
      contextMessages = contextMessages.filter(m => m.sequence_number === 1)
    } else {
      // Single response: only the response of the previous prompt (the last assistant message)
      const lastAssistantResponse = contextMessages.slice().reverse().find(m => m.role === 'assistant')
      contextMessages = lastAssistantResponse ? [lastAssistantResponse] : []
    }
  }

  // 5. Build LLM messages array
  //    DB roles:  user → user, system (stored prompt) → user, assistant → assistant
  const llmMessages: fireworks.Message[] = contextMessages.map(m => ({
    role:    (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
    content: m.message,
  }))

  // Append current prompt as the next user turn
  llmMessages.push({ role: 'user', content: prompt.prompt + JSON_FORMAT_INSTRUCTION })

  // 6. Load active model — prefers is_active=true, falls back to first row
  let model: { model_id: string; provider: string } | null = null
  const { data: activeModel } = await supabase
    .from('models')
    .select('model_id, provider')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (activeModel) {
    model = activeModel
  } else {
    const { data: firstModel } = await supabase
      .from('models')
      .select('model_id, provider')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    model = firstModel ?? null
  }

  if (!model) throw new Error('No model configured — add a model in the dashboard')

  const apiKey = Deno.env.get('AI_API_KEY') ?? ''
  if (!apiKey) throw new Error('AI_API_KEY secret not set')

  // 7. Call LLM with retry + validation
  let aiAnalysis = ''
  let category:  string | null = null
  let score:     string | null = null
  let rawContent = ''
  let succeeded  = false

  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = await callProvider(model.provider, model.model_id, llmMessages, apiKey)
    rawContent   = result.content

    try {
      let json = rawContent.trim()
      if (json.startsWith('```json')) json = json.slice(7)
      if (json.startsWith('```'))     json = json.slice(3)
      if (json.endsWith('```'))       json = json.slice(0, -3)

      const parsed = JSON.parse(json.trim())
      if (!parsed.analysis)                          throw new Error("Missing 'analysis'")

      const c = parsed.category?.toString().toLowerCase().trim()
      const s = parsed.score?.toString().toLowerCase().trim()
      if (!VALID_CATEGORIES.includes(c as any))      throw new Error(`Invalid category: ${c}`)
      if (!VALID_SCORES.includes(s as any))           throw new Error(`Invalid score: ${s}`)

      aiAnalysis = parsed.analysis
      category   = c
      score      = s
      succeeded  = true
      log({ ...ctx, attempt }, 'JSON response validated')
      break
    } catch (err) {
      logError({ ...ctx, attempt }, err, 'JSON validation failed — retrying')
    }
  }

  if (!succeeded) {
    // Store raw response and mark failed so the chain is debuggable
    await supabase.from('chat_messages').insert([
      { idea_id, message: prompt.prompt,  role: 'system',    prompt_id: prompt.id, sequence_number: nextSeq(allMessages) },
      { idea_id, message: rawContent,     role: 'assistant', prompt_id: prompt.id, sequence_number: nextSeq(allMessages) + 1 },
    ])
    await supabase.from('ideas').update({ status: 'failed' }).eq('id', idea_id)
    throw new Error('Failed to get valid JSON after 3 attempts')
  }

  // 8. Store prompt (role='system') + response (role='assistant')
  //    AFTER storing → trigger next (ensures context is in DB before next call)
  const seqBase = nextSeq(allMessages)
  const { error: insertErr } = await supabase.from('chat_messages').insert([
    {
      idea_id,
      message:         prompt.prompt,
      role:            'system',
      prompt_id:       prompt.id,
      sequence_number: seqBase,
    },
    {
      idea_id,
      message:         aiAnalysis,
      role:            'assistant',
      prompt_id:       prompt.id,
      sequence_number: seqBase + 1,
    },
  ])

  if (insertErr) throw new Error(`Failed to store messages: ${insertErr.message}`)

  // 9. Update idea with latest category/score (upserts on every step)
  await supabase.from('ideas').update({ category, score }).eq('id', idea_id)

  log(ctx, 'Messages stored', { category, score })

  // 10. Chain next prompt OR mark completed
  const isLast = prompt_index + 1 >= promptIds.length

  if (isLast) {
    await markCompleted(supabase, idea_id)
    log(ctx, 'Chain complete — idea completed')
  } else {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const nextCall = fetch(`${supabaseUrl}/functions/v1/process-prompt`, {
      method:  'POST',
      headers: { apikey: serviceKey, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ idea_id, prompt_index: prompt_index + 1 }),
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

// Routes to the correct provider based on model.provider string
async function callProvider(
  provider: string,
  modelId:  string,
  messages: fireworks.Message[],
  apiKey:   string,
): Promise<{ content: string }> {
  const params = { modelId, messages, temperature: TEMPERATURE, maxTokens: MAX_TOKENS, apiKey }
  if (provider === 'openai')    return openai.generateCompletion(params)
  if (provider === 'anthropic') return anthropic.generateCompletion(params)
  return fireworks.generateCompletion(params)  // default
}
