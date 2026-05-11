// sync-telegram-commands.mjs
// Registers bot command menu with Telegram using setMyCommands.
// Usage: npm run sync-telegram-commands
//
// Registers:
//   /flows        — list all flows
//   /currentflow  — show active flow for this chat
//   /setflow      — set persistent flow for this chat
//   + one command per flow that has a telegram_command set

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname }         from 'node:path'
import { fileURLToPath }            from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')

function loadEnv() {
  const p = resolve(ROOT, '.env')
  if (!existsSync(p)) { console.error('ERROR: .env not found'); process.exit(1) }
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const m = line.trim().match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  }
}

loadEnv()

const { TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env
if (!TELEGRAM_BOT_TOKEN) { console.error('ERROR: TELEGRAM_BOT_TOKEN missing'); process.exit(1) }
if (!SUPABASE_URL)        { console.error('ERROR: SUPABASE_URL missing');        process.exit(1) }
if (!SUPABASE_SECRET_KEY) { console.error('ERROR: SUPABASE_SECRET_KEY missing'); process.exit(1) }

console.log('\n[sync-telegram-commands] Fetching flows from DB...')

const { createClient } = await import('@supabase/supabase-js')
const sb = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  global: { headers: { apikey: SUPABASE_SECRET_KEY } }
})

const { data: flows, error } = await sb
  .from('flows')
  .select('flow_name, telegram_command')
  .order('created_at', { ascending: true })

if (error) { console.error('Failed to fetch flows:', error.message); process.exit(1) }

// Build command list
const commands = [
  { command: 'flows',       description: 'List all available flows' },
  { command: 'currentflow', description: 'Show your active flow' },
  { command: 'setflow',     description: 'Set your default flow. Usage: /setflow <command>' },
]

// Add one entry per flow that has a telegram_command
for (const flow of (flows ?? [])) {
  if (!flow.telegram_command) continue
  commands.push({
    command:     flow.telegram_command,
    description: `Log an idea using the ${flow.flow_name} flow (one-time)`,
  })
}

console.log(`[sync-telegram-commands] Registering ${commands.length} command(s):`)
commands.forEach(c => console.log(`  /${c.command} — ${c.description}`))

const resp = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify({ commands }),
})

const result = await resp.json()
if (!result.ok) {
  console.error('setMyCommands failed:', result)
  process.exit(1)
}

console.log('[sync-telegram-commands] ✓ Telegram command menu updated\n')
