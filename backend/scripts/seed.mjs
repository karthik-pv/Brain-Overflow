// seed.mjs — populates the database with sample models, prompts, and flows
// Usage: npm run seed

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function loadEnv() {
  const p = resolve(ROOT, '.env')
  if (!existsSync(p)) { console.error('ERROR: .env not found'); process.exit(1) }
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const m = line.trim().match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  }
}

loadEnv()

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('ERROR: SUPABASE_URL or SUPABASE_SECRET_KEY missing in .env')
  process.exit(1)
}

console.log('\n============================================================')
console.log('  Brain Overflow — Seeding Sample Data')
console.log('============================================================\n')

const { createClient } = await import('@supabase/supabase-js')
const sb = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  global: { headers: { apikey: SUPABASE_SECRET_KEY } }
})

async function seed() {
  // ── 1. Seed Models ──────────────────────────────────────────────────────────
  console.log('[1/3] Seeding models...')
  const modelsToInsert = [
    { model_name: 'GPT-4o', model_id: 'gpt-4o', provider: 'openai', is_active: false },
    { model_name: 'GPT-4o Mini', model_id: 'gpt-4o-mini', provider: 'openai', is_active: false },
    { model_name: 'Claude Sonnet 4.5', model_id: 'claude-sonnet-4-5-20250929', provider: 'anthropic', is_active: false },
    { model_name: 'Claude Haiku 4.5', model_id: 'claude-haiku-4-5-20251001', provider: 'anthropic', is_active: false },
    { model_name: 'DeepSeek V4 Pro', model_id: 'accounts/fireworks/models/deepseek-v4-pro', provider: 'fireworks', is_active: false },
    { model_name: 'Kimi K2.6', model_id: 'accounts/fireworks/models/kimi-k2p6', provider: 'fireworks', is_active: false },
    { model_name: 'Llama 3.3 70B', model_id: 'llama-3.3-70b-versatile', provider: 'groq', is_active: false },
    { model_name: 'GPT-OSS 120B', model_id: 'gpt-oss-120b', provider: 'groq', is_active: false },
  ]

  for (const m of modelsToInsert) {
    const { data: existing } = await sb.from('models').select('id').eq('model_name', m.model_name).maybeSingle()
    if (!existing) {
      const { error } = await sb.from('models').insert(m)
      if (error) console.error(`  Error inserting model ${m.model_name}:`, error.message)
      else console.log(`  ✓ Inserted model: ${m.model_name}`)
    } else {
      console.log(`  - Model ${m.model_name} already exists`)
    }
  }

  // ── 2. Seed Prompts ─────────────────────────────────────────────────────────
  console.log('\n[2/3] Seeding prompts...')
  const promptsToInsert = [
    {
      prompt_name: 'Refiner',
      prompt: `GOVERNING LAW: You reveal the idea. You do not improve it, pivot it, or add to it. Every output must be traceable to something the user actually said or wrote.`,
      context_mode: 'idea_only',
      use_system_format: true,
    },
    {
      prompt_name: 'Paul Graham Evaluation',
      prompt: `You are a Paul Graham-style evaluator. Analyze the idea for founder-market fit, defensibility, and whether it solves a real problem. Be brutally honest.`,
      context_mode: 'previous_response',
      use_system_format: true,
    },
    {
      prompt_name: 'Compressor',
      prompt: `You are a ruthless information architect. Compress the pipeline outputs into one document any intelligent person can read cold in under four minutes. Nothing is added. Nothing invented. Only compression.`,
      context_mode: 'full_history_json',
      use_system_format: true,
    },
    {
      prompt_name: 'Weekend Architect',
      prompt: `You are a Senior Full-Stack Engineer and ruthless scoping expert. One rule: if it cannot be tested with a real user in 48 hours, it does not get built yet.`,
      context_mode: 'full_history_json',
      use_system_format: true,
    },
  ]

  const promptIds = {}

  for (const p of promptsToInsert) {
    const { data: existing } = await sb.from('prompts').select('id').eq('prompt_name', p.prompt_name).maybeSingle()
    if (!existing) {
      const { data, error } = await sb.from('prompts').insert(p).select('id').single()
      if (error) {
        console.error(`  Error inserting prompt ${p.prompt_name}:`, error.message)
      } else {
        console.log(`  ✓ Inserted prompt: ${p.prompt_name}`)
        promptIds[p.prompt_name] = data.id
      }
    } else {
      await sb.from('prompts').update({ context_mode: p.context_mode, use_system_format: p.use_system_format }).eq('id', existing.id)
      console.log(`  - Prompt ${p.prompt_name} already exists (updated)`)
      promptIds[p.prompt_name] = existing.id
    }
  }

  // ── 3. Seed Flows ───────────────────────────────────────────────────────────
  console.log('\n[3/3] Seeding flows...')

  const p1 = promptIds['Refiner']
  const p2 = promptIds['Paul Graham Evaluation']
  const p3 = promptIds['Compressor']
  const p4 = promptIds['Weekend Architect']

  if (p1 && p2 && p3 && p4) {
    const flow = {
      flow_name: 'Awaken',
      telegram_command: 'awaken',
      prompt_ids: [p1, p2, p3, p4],
    }

    const { data: existing } = await sb.from('flows').select('id').eq('flow_name', flow.flow_name).maybeSingle()
    if (!existing) {
      const { error } = await sb.from('flows').insert(flow)
      if (error) console.error(`  Error inserting flow ${flow.flow_name}:`, error.message)
      else console.log(`  ✓ Inserted flow: ${flow.flow_name} (/${flow.telegram_command})`)
    } else {
      await sb.from('flows').update({ prompt_ids: flow.prompt_ids, telegram_command: flow.telegram_command }).eq('id', existing.id)
      console.log(`  - Flow ${flow.flow_name} already exists (updated)`)
    }
  }

  console.log('\n============================================================')
  console.log('  Seed complete!')
  console.log('============================================================\n')
}

seed().catch(console.error)
