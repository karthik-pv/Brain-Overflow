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
// Core: needed for database and CLI to work
const CORE_REQUIRED = ['SUPABASE_PROJECT_REF','SUPABASE_URL','SUPABASE_SECRET_KEY','SUPABASE_PUBLISHABLE_KEY','ENCRYPTION_KEY']
const missing  = CORE_REQUIRED.filter(k => !process.env[k])
if (missing.length) {
  console.error(`ERROR: Missing core env vars: ${missing.join(', ')}`)
  console.error('  These are required for the database connection to work.')
  process.exit(1)
}

// Telegram: optional — skip if not provided
const HAS_TELEGRAM = !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ALLOWED_USERS)
if (!HAS_TELEGRAM) {
  console.log('ℹ  TELEGRAM_BOT_TOKEN or TELEGRAM_ALLOWED_USERS not set — skipping Telegram setup.')
  console.log('   You can still use the web dashboard. Add them later to enable the bot.\n')
}

const { SUPABASE_PROJECT_REF, SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_PUBLISHABLE_KEY, ENCRYPTION_KEY } = process.env

// ── Helpers ───────────────────────────────────────────────────────────────────
function run(cmd, label) {
  console.log(`\n[${label}] Running: ${cmd}`)
  try {
    // Inject SUPABASE_ACCESS_TOKEN so the CLI authenticates without `supabase login`
    const env = { ...process.env }
    if (process.env.SUPABASE_ACCESS_TOKEN) {
      env.SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
    }
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', env })
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
  run('npm install', '1/9 Install root deps')
} else {
  console.log('[1/9 Install root deps] Already installed — skipping')
}

// 2. Link Supabase project
if (!process.env.SUPABASE_ACCESS_TOKEN) {
  console.warn('\n⚠  SUPABASE_ACCESS_TOKEN not set in .env.')
  console.warn('   Add it from https://supabase.com/dashboard/account/tokens')
  console.warn('   Without it, the supabase CLI needs to be logged in via `npx supabase login`.\n')
}
run(`npx supabase link --project-ref ${SUPABASE_PROJECT_REF}`, '2/9 Link Supabase')

// 3. Run migrations
run('npx supabase db push', '3/9 Run migrations')

// 4. Deploy edge functions (no-verify-jwt — we use apikey header, not user JWTs)
run('npx supabase functions deploy telegram-webhook  --no-verify-jwt', '4/9 Deploy telegram-webhook')
run('npx supabase functions deploy process-prompt    --no-verify-jwt', '4/9 Deploy process-prompt')
run('npx supabase functions deploy start-run         --no-verify-jwt', '4/9 Deploy start-run')
run('npx supabase functions deploy manage-api-keys   --no-verify-jwt', '4/9 Deploy manage-api-keys')

// 5. Set secrets in Supabase
run(`npx supabase secrets set ENCRYPTION_KEY=${ENCRYPTION_KEY}`, '5/9 Set ENCRYPTION_KEY secret')
if (HAS_TELEGRAM) {
  run(`npx supabase secrets set TELEGRAM_BOT_TOKEN=${process.env.TELEGRAM_BOT_TOKEN}`, '5/9 Set TELEGRAM_BOT_TOKEN secret')
  run(`npx supabase secrets set TELEGRAM_ALLOWED_USERS=${process.env.TELEGRAM_ALLOWED_USERS}`, '5/9 Set TELEGRAM_ALLOWED_USERS secret')
}

// 6. Configure Telegram webhook (optional)
let webhookUrl = ''
if (HAS_TELEGRAM) {
  console.log('\n[6/9 Configure Telegram webhook]')
  webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`
  const tgUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`
  const { ok, data } = await fetchJson(tgUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ url: webhookUrl }),
  })
  if (!ok || !data?.ok) {
    console.error('  Failed to set Telegram webhook:', data)
    console.error('  Skipping — you can configure it manually later.')
  } else {
    console.log(`  ✓ Webhook set to: ${webhookUrl}`)
  }
} else {
  console.log('\n[6/9 Telegram webhook] Skipped — no Telegram configured')
}

// 7. Seed default model
console.log('\n[7/9 Seed default model]')
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
console.log('\n[8/9 Verify]')
const { data: models } = await sb.from('models').select('model_name')
console.log(`  ✓ Models: ${models?.map(m => m.model_name).join(', ')}`)
const { data: ideas }  = await sb.from('ideas').select('id')
console.log(`  ✓ Ideas in DB: ${ideas?.length ?? 0}`)
const { error: runsErr } = await sb.from('idea_runs').select('id').limit(1)
console.log(runsErr ? `  ✗ idea_runs table: ${runsErr.message}` : '  ✓ idea_runs table: OK')

console.log('\n============================================================')
console.log('  Setup complete!')
if (webhookUrl) console.log(`  Telegram bot webhook: ${webhookUrl}`)
console.log(`  React dashboard: cd frontend && npm run dev`)
console.log('============================================================\n')
