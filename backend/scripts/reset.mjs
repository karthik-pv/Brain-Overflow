// reset.mjs — Truncate runtime data and redeploy edge functions
// Usage: npm run reset
// SAFE: does NOT touch prompts, flows, or models.
// Deletion order respects FK constraints:
//   chat_messages (refs idea_runs + ideas) → idea_runs (refs ideas) → ideas

import { execSync }               from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname }       from 'node:path'
import { fileURLToPath }          from 'node:url'

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

function run(cmd, label) {
  console.log(`\n[${label}] ${cmd}`)
  try { execSync(cmd, { cwd: ROOT, stdio: 'inherit' }) }
  catch { console.error(`FAILED: ${label}`); process.exit(1) }
}

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env

console.log('\n============================================================')
console.log('  Brain Overflow — Reset (ideas + idea_runs + chat_messages)')
console.log('============================================================\n')

// 1. Truncate runtime tables (order respects FK constraints)
console.log('[1/3 Truncate runtime tables]')
const { createClient } = await import('@supabase/supabase-js')
const sb = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  global: { headers: { apikey: SUPABASE_SECRET_KEY } }
})

const sentinel = '00000000-0000-0000-0000-000000000000'
const { error: cm } = await sb.from('chat_messages').delete().neq('id', sentinel)
const { error: ir } = await sb.from('idea_runs').delete().neq('id', sentinel)
const { error: id } = await sb.from('ideas').delete().neq('id', sentinel)

if (cm) console.error('  Warning truncating chat_messages:', cm.message)
if (ir) console.error('  Warning truncating idea_runs:', ir.message)
if (id) console.error('  Warning truncating ideas:', id.message)
console.log('  ✓ Runtime tables cleared (chat_messages, idea_runs, ideas)')

// 2. Redeploy edge functions
run('npx supabase functions deploy telegram-webhook --no-verify-jwt', '2/3 Redeploy telegram-webhook')
run('npx supabase functions deploy process-prompt   --no-verify-jwt', '2/3 Redeploy process-prompt')
run('npx supabase functions deploy start-run        --no-verify-jwt', '2/3 Redeploy start-run')

console.log('\n[3/3 Done]')
console.log('  ✓ Reset complete — prompts, flows, models, and model_profiles are preserved.')
