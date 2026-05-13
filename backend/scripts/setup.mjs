// setup.mjs — complete one-shot project setup
// Usage: npm run setup

import { execSync }             from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname }     from 'node:path'
import { fileURLToPath }        from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')

// ── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const p = resolve(ROOT, '.env')
  if (!existsSync(p)) { console.error('ERROR: .env not found. Copy .env.example → .env and fill it in.'); process.exit(1) }
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const m = line.trim().match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  }
}

loadEnv()

// ── Validate required env vars ───────────────────────────────────────────────
const REQUIRED = ['SUPABASE_PROJECT_REF','SUPABASE_URL','SUPABASE_SECRET_KEY','SUPABASE_PUBLISHABLE_KEY','TELEGRAM_BOT_TOKEN','AI_API_KEY','TELEGRAM_ALLOWED_USERS']
const missing  = REQUIRED.filter(k => !process.env[k])
if (missing.length) {
  console.error(`ERROR: Missing env vars: ${missing.join(', ')}`)
  process.exit(1)
}

const { SUPABASE_PROJECT_REF, SUPABASE_URL, SUPABASE_SECRET_KEY, TELEGRAM_BOT_TOKEN, AI_API_KEY, TELEGRAM_ALLOWED_USERS } = process.env

// ── Helpers ───────────────────────────────────────────────────────────────────
function run(cmd, label) {
  console.log(`\n[${label}] Running: ${cmd}`)
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' })
  } catch (e) {
    console.error(`\nFAILED at step: ${label}\n`)
    process.exit(1)
  }
}

async function fetchJson(url, opts = {}) {
  const r = await fetch(url, opts)
  const t = await r.text()
  try { return { ok: r.ok, data: JSON.parse(t) } }
  catch { return { ok: r.ok, data: t } }
}

// ── Steps ─────────────────────────────────────────────────────────────────────
console.log('\n============================================================')
console.log('  Brain Overflow — Idea Logger Setup')
console.log('============================================================\n')

// 1. Install root deps
if (!existsSync(resolve(ROOT, 'node_modules'))) {
  run('npm install', '1/8 Install root deps')
} else {
  console.log('[1/8 Install root deps] Already installed — skipping')
}

// 2. Link Supabase project
run(`npx supabase link --project-ref ${SUPABASE_PROJECT_REF}`, '2/8 Link Supabase')

// 3. Run migrations
run('npx supabase db push', '3/8 Run migrations')

// 4. Deploy edge functions (no-verify-jwt — we use apikey header, not user JWTs)
run('npx supabase functions deploy telegram-webhook --no-verify-jwt', '4/8 Deploy telegram-webhook')
run('npx supabase functions deploy process-prompt   --no-verify-jwt', '4/8 Deploy process-prompt')

// 5. Set secrets in Supabase
run(`npx supabase secrets set AI_API_KEY=${AI_API_KEY}`, '5/8 Set AI_API_KEY secret')
run(`npx supabase secrets set TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}`, '5/8 Set TELEGRAM_BOT_TOKEN secret')
run(`npx supabase secrets set TELEGRAM_ALLOWED_USERS=${TELEGRAM_ALLOWED_USERS}`, '5/8 Set TELEGRAM_ALLOWED_USERS secret')

// 6. Configure Telegram webhook
console.log('\n[6/8 Configure Telegram webhook]')
const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`
const tgUrl      = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`
const { ok, data } = await fetchJson(tgUrl, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify({ url: webhookUrl }),
})
if (!ok || !data?.ok) {
  console.error('  Failed to set Telegram webhook:', data)
  process.exit(1)
}
console.log(`  ✓ Webhook set to: ${webhookUrl}`)

// 7. Seed default model
console.log('\n[7/8 Seed default model]')
const { createClient } = await import('@supabase/supabase-js')
const sb = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  global: { headers: { apikey: SUPABASE_SECRET_KEY } }
})

const { data: existing } = await sb.from('models').select('id').limit(1)
if (!existing || existing.length === 0) {
  const { error } = await sb.from('models').insert({
    model_name: 'Llama 3.1 70B (Fireworks)',
    model_id:   'accounts/fireworks/models/llama-v3p1-70b-instruct',
    provider:   'fireworks',
  })
  if (error) { console.error('  Failed to seed model:', error.message); process.exit(1) }
  console.log('  ✓ Default model seeded')
} else {
  console.log('  Models already present — skipping seed')
}

// 8. Verify
console.log('\n[8/8 Verify]')
const { data: models } = await sb.from('models').select('model_name')
console.log(`  ✓ Models: ${models?.map(m => m.model_name).join(', ')}`)
const { data: ideas }  = await sb.from('ideas').select('id')
console.log(`  ✓ Ideas in DB: ${ideas?.length ?? 0}`)

console.log('\n============================================================')
console.log('  Setup complete!')
console.log(`  Telegram bot webhook: ${webhookUrl}`)
console.log(`  React dashboard: cd react-app && npm install && npm run dev`)
console.log('============================================================\n')
