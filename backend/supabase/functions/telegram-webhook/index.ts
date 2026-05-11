// ============================================================
// telegram-webhook — Entry point for all Telegram messages.
//
// Handles:
//   /flows          — list all available flows
//   /currentflow    — show active flow for this chat
//   /setflow <cmd>  — persist flow choice for this chat
//   <idea text>     — log an idea using resolved flow
//
// Flow resolution priority:
//   1. Explicit /command in message matching flows.telegram_command
//   2. Persistent telegram_chat_config for this chat_id
//   3. First flow in DB
// ============================================================

import { createServiceClient }        from '../_shared/db.ts'
import { corsPreflight, jsonResponse } from '../_shared/cors.ts'
import { log, logError }              from '../_shared/log.ts'

const FN = 'telegram-webhook'

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return corsPreflight()

  let body: Record<string, unknown>
  try { body = await req.json() }
  catch { return jsonResponse({ ok: true }) }

  const message = (body as any)?.message
  if (!message) return jsonResponse({ ok: true })

  const chatId    = String(message.chat?.id   ?? '')
  const messageId = String(message.message_id ?? '')
  const rawText   = (message.text ?? '').trim()

  if (!rawText || !chatId) return jsonResponse({ ok: true })

  log({ fn: FN, chatId, messageId }, 'Received Telegram message')

  const supabase = createServiceClient()
  const token    = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? ''

  try {
    // ── Management commands (respond and return immediately) ───────────────
    if (rawText === '/flows' || rawText.startsWith('/flows ') || rawText.startsWith('/flows@')) {
      await handleFlows(supabase, token, chatId)
      return jsonResponse({ ok: true })
    }

    if (rawText === '/currentflow' || rawText.startsWith('/currentflow ') || rawText.startsWith('/currentflow@')) {
      await handleCurrentFlow(supabase, token, chatId)
      return jsonResponse({ ok: true })
    }

    if (rawText.startsWith('/setflow')) {
      await handleSetFlow(supabase, token, chatId, rawText)
      return jsonResponse({ ok: true })
    }

    // ── Idea submission ────────────────────────────────────────────────────
    const { flowId, ideaText } = await resolveFlowAndIdea(supabase, chatId, rawText)

    if (!ideaText) {
      await sendTelegramMessage(token, chatId, 'Could not extract idea text. Please send your idea again.')
      return jsonResponse({ ok: true })
    }

    // Create idea row
    const { data: idea, error: ideaErr } = await supabase
      .from('ideas')
      .insert({
        idea:                ideaText,
        flow_id:             flowId,
        status:              flowId ? 'recorded' : 'completed',
        telegram_chat_id:    chatId,
        telegram_message_id: messageId,
      })
      .select('id')
      .single()

    if (ideaErr || !idea) {
      logError({ fn: FN }, ideaErr ?? new Error('idea insert returned null'))
      return jsonResponse({ ok: true })
    }

    const ideaId = idea.id
    log({ fn: FN, ideaId }, 'Idea created')

    // Store initial user message
    await supabase.from('chat_messages').insert({
      idea_id:         ideaId,
      message:         ideaText,
      role:            'user',
      prompt_id:       null,
      sequence_number: 1,
    })

    if (!flowId) {
      log({ fn: FN, ideaId }, 'No flow found — idea stored without processing')
      return jsonResponse({ ok: true })
    }

    // Mark processing and fire first prompt asynchronously
    await supabase.from('ideas').update({ status: 'processing' }).eq('id', ideaId)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')          ?? ''
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const chain = fetch(`${supabaseUrl}/functions/v1/process-prompt`, {
      method:  'POST',
      headers: { apikey: serviceKey, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ idea_id: ideaId, prompt_index: 0 }),
    }).then(r => {
      if (!r.ok) r.text().then(t =>
        logError({ fn: FN, ideaId }, new Error(`process-prompt invoke failed: ${r.status} ${t}`))
      )
    }).catch(err => logError({ fn: FN, ideaId }, err, 'process-prompt fetch threw'))

    // @ts-ignore
    if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(chain)

    log({ fn: FN, ideaId }, 'Idea logged, process-prompt(0) fired')
  } catch (err) {
    logError({ fn: FN }, err, 'Webhook handler threw')
  }

  return jsonResponse({ ok: true })
})

// ─── Management Command Handlers ─────────────────────────────────────────────

async function handleFlows(
  supabase: ReturnType<typeof createServiceClient>,
  token:   string,
  chatId:  string,
): Promise<void> {
  const { data: flows } = await supabase
    .from('flows')
    .select('flow_name, telegram_command')
    .order('created_at', { ascending: true })

  if (!flows || flows.length === 0) {
    await sendTelegramMessage(token, chatId, 'No flows configured yet.')
    return
  }

  const lines = flows.map(f =>
    f.telegram_command
      ? `• /${f.telegram_command}  →  ${f.flow_name}`
      : `• ${f.flow_name} (no command set)`
  )

  const text = `Available flows:\n\n${lines.join('\n')}\n\nUse /setflow <command> to set your default.\nExample: /setflow startup`
  await sendTelegramMessage(token, chatId, text)
}

async function handleCurrentFlow(
  supabase: ReturnType<typeof createServiceClient>,
  token:   string,
  chatId:  string,
): Promise<void> {
  const { data: config } = await supabase
    .from('telegram_chat_config')
    .select('flow_id, flows(flow_name, telegram_command)')
    .eq('telegram_chat_id', chatId)
    .maybeSingle()

  if (!config) {
    const { data: firstFlow } = await supabase
      .from('flows')
      .select('flow_name, telegram_command')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    const flowInfo = firstFlow
      ? `${firstFlow.flow_name}${firstFlow.telegram_command ? ` (/${firstFlow.telegram_command})` : ''} [default]`
      : 'None configured'

    await sendTelegramMessage(token, chatId, `No flow selected for this chat.\n\nFalling back to: ${flowInfo}\n\nRun /setflow <command> to set a persistent default.`)
    return
  }

  const flow = (config as any).flows
  const text = `Current flow:\n${flow?.flow_name ?? 'Unknown'}${flow?.telegram_command ? ` (/${flow.telegram_command})` : ''}`
  await sendTelegramMessage(token, chatId, text)
}

async function handleSetFlow(
  supabase: ReturnType<typeof createServiceClient>,
  token:   string,
  chatId:  string,
  rawText: string,
): Promise<void> {
  // Parse: /setflow startup  or  /setflow
  const parts   = rawText.trim().split(/\s+/)
  const cmdName = parts[1]?.toLowerCase()

  if (!cmdName) {
    await sendTelegramMessage(token, chatId, 'Usage: /setflow <command>\n\nRun /flows to see available commands.')
    return
  }

  const { data: flow } = await supabase
    .from('flows')
    .select('id, flow_name')
    .eq('telegram_command', cmdName)
    .maybeSingle()

  if (!flow) {
    await sendTelegramMessage(token, chatId, `No flow found with command: /${cmdName}\n\nRun /flows to see available commands.`)
    return
  }

  // Upsert the chat config
  const { error } = await supabase
    .from('telegram_chat_config')
    .upsert({
      telegram_chat_id: chatId,
      flow_id:          flow.id,
      updated_at:       new Date().toISOString(),
    }, { onConflict: 'telegram_chat_id' })

  if (error) {
    logError({ fn: FN, chatId }, error, 'Failed to upsert telegram_chat_config')
    await sendTelegramMessage(token, chatId, 'Something went wrong. Please try again.')
    return
  }

  await sendTelegramMessage(token, chatId, `✅ Default flow set to: ${flow.flow_name}\n\nAll your future messages will use this flow automatically.`)
  log({ fn: FN, chatId }, `Flow set to: ${flow.flow_name}`)
}

// ─── Flow Resolution ──────────────────────────────────────────────────────────

async function resolveFlowAndIdea(
  supabase: ReturnType<typeof createServiceClient>,
  chatId:   string,
  rawText:  string,
): Promise<{ flowId: string | null; ideaText: string }> {
  let explicitFlowId: string | null = null
  let ideaText = rawText

  // Check for an explicit flow command: /startup ... or /startup\nidea
  if (rawText.startsWith('/')) {
    const lines      = rawText.split('\n')
    const firstLine  = lines[0].trim()
    const restLines  = lines.slice(1).join('\n').trim()

    // Extract command: /startup some idea → cmdName='startup', inlineIdea='some idea'
    const afterSlash = firstLine.slice(1)                          // "startup some idea"
    const spaceIdx   = afterSlash.search(/\s/)
    const cmdName    = (spaceIdx === -1 ? afterSlash : afterSlash.slice(0, spaceIdx))
      .split('@')[0].toLowerCase()
    const inlineIdea = spaceIdx === -1 ? '' : afterSlash.slice(spaceIdx + 1).trim()

    const { data: flow } = await supabase
      .from('flows')
      .select('id')
      .eq('telegram_command', cmdName)
      .maybeSingle()

    if (flow) {
      explicitFlowId = flow.id
      // Prefer multiline body, then inline text
      ideaText = restLines || inlineIdea || rawText
    } else {
      // Not a flow command — treat remaining text as idea
      ideaText = restLines || inlineIdea || rawText
    }
  }

  // Priority 2: persistent config
  let persistedFlowId: string | null = null
  if (!explicitFlowId) {
    const { data: config } = await supabase
      .from('telegram_chat_config')
      .select('flow_id')
      .eq('telegram_chat_id', chatId)
      .maybeSingle()
    persistedFlowId = config?.flow_id ?? null
  }

  // Priority 3: first flow in DB
  let defaultFlowId: string | null = null
  if (!explicitFlowId && !persistedFlowId) {
    const { data: firstFlow } = await supabase
      .from('flows')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    defaultFlowId = firstFlow?.id ?? null
  }

  const flowId = explicitFlowId ?? persistedFlowId ?? defaultFlowId
  return { flowId, ideaText: ideaText.trim() || rawText.trim() }
}

// ─── Telegram API Helper ──────────────────────────────────────────────────────

async function sendTelegramMessage(token: string, chatId: string, text: string): Promise<void> {
  if (!token) { console.warn('TELEGRAM_BOT_TOKEN not set — cannot send message'); return }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ chat_id: chatId, text }),
    })
  } catch (err) {
    logError({ fn: FN }, err, 'sendTelegramMessage failed')
  }
}
