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
  console.log('  Cleaning up existing models...')
  const { data: oldProfiles } = await sb.from('model_profiles').select('id')
  if (oldProfiles?.length) await sb.from('model_profiles').delete().in('id', oldProfiles.map(r => r.id))
  const { data: oldModels } = await sb.from('models').select('id')
  if (oldModels?.length) await sb.from('models').delete().in('id', oldModels.map(r => r.id))
  console.log('  Inserting new models...')
  const modelsToInsert = [
    {
      model_name: 'GPT-4o',
      model_id: 'gpt-4o',
      provider: 'openai',
      is_active: false,
    },
    {
      model_name: 'GPT-4o Mini',
      model_id: 'gpt-4o-mini',
      provider: 'openai',
      is_active: false,
    },
    {
      model_name: 'Claude Sonnet 4.5',
      model_id: 'claude-sonnet-4-5-20250929',
      provider: 'anthropic',
      is_active: false,
    },
    {
      model_name: 'Claude Haiku 4.5',
      model_id: 'claude-haiku-4-5-20251001',
      provider: 'anthropic',
      is_active: false,
    },
    {
      model_name: 'Gemma 4 31B',
      model_id: 'gemma-4-31b-it',
      provider: 'gemini',
      is_active: false,
    },
    {
      model_name: 'Gemini 2.5 Flash',
      model_id: 'gemini-2.5-flash',
      provider: 'gemini',
      is_active: false,
    },
    {
      model_name: 'DeepSeek V4 Pro',
      model_id: 'accounts/fireworks/models/deepseek-v4-pro',
      provider: 'fireworks',
      is_active: false,
    },
    {
      model_name: 'Kimi K2.6',
      model_id: 'accounts/fireworks/models/kimi-k2p6',
      provider: 'fireworks',
      is_active: false,
    },
  ]

  for (const m of modelsToInsert) {
    const { data: existing } = await sb.from('models').select('id').eq('model_name', m.model_name).maybeSingle()
    if (!existing) {
      const { error } = await sb.from('models').insert(m)
      if (error) console.error(`  Error inserting model ${m.model_name}:`, error.message)
      else console.log(`  ✓ Inserted model: ${m.model_name}${m.is_active ? ' [ACTIVE]' : ''}`)
    } else {
      console.log(`  - Model ${m.model_name} already exists`)
    }
  }

  // ── 2. Seed Prompts ─────────────────────────────────────────────────────────
  console.log('\n[2/3] Seeding prompts...')
  const promptsToInsert = [
    {
      prompt_name: 'Step 1: Initial Categorization & Roast',
      prompt: `You are a blunt, highly critical startup advisor.
Analyze the user's idea. Point out the biggest immediate flaw or assumption.
Be concise.`,
      multi_turn: false
    },
    {
      prompt_name: 'Step 2: Market & Competitor Analysis',
      prompt: `You are a market researcher.
Based on the original idea and the previous critique, list 2-3 potential real-world competitors or existing solutions.
Explain why this idea might struggle against them, or what unique angle it needs to win.`,
      multi_turn: true
    },
    {
      prompt_name: 'Step 3: Actionable Next Steps',
      prompt: `You are a pragmatic product manager.
Given the full context of the idea, the critique, and the market analysis, provide exactly 3 concrete, low-cost next steps the user should take to validate this idea THIS WEEK.`,
      multi_turn: true
    }
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
      await sb.from('prompts').update({ multi_turn: p.multi_turn }).eq('id', existing.id)
      console.log(`  - Prompt ${p.prompt_name} already exists (updated multi_turn)`)
      promptIds[p.prompt_name] = existing.id
    }
  }

  // ── 3. Seed Flows ───────────────────────────────────────────────────────────
  console.log('\n[3/3] Seeding flows...')

  const p1 = promptIds['Step 1: Initial Categorization & Roast']
  const p2 = promptIds['Step 2: Market & Competitor Analysis']
  const p3 = promptIds['Step 3: Actionable Next Steps']

  const flowsToInsert = []

  if (p1 && p2 && p3) {
    flowsToInsert.push({
      flow_name:        'Startup Analysis',
      telegram_command: 'startup',
      prompt_ids:       [p1, p2, p3],
    })
    flowsToInsert.push({
      flow_name:        'Quick Roast',
      telegram_command: 'roast',
      prompt_ids:       [p1],
    })
    flowsToInsert.push({
      flow_name:        'Default',
      telegram_command: 'default',
      prompt_ids:       [p1, p3],
    })
  }

  for (const f of flowsToInsert) {
    const { data: existing } = await sb.from('flows').select('id').eq('telegram_command', f.telegram_command).maybeSingle()
    if (!existing) {
      // Also check by old flow_name for idempotency
      const { data: byName } = await sb.from('flows').select('id').ilike('flow_name', f.telegram_command).maybeSingle()
      if (byName) {
        // Update existing row to add telegram_command and rename
        const { error } = await sb.from('flows').update({
          flow_name: f.flow_name, telegram_command: f.telegram_command, prompt_ids: f.prompt_ids
        }).eq('id', byName.id)
        if (error) console.error(`  Error updating flow ${f.flow_name}:`, error.message)
        else console.log(`  ✓ Updated existing flow → ${f.flow_name} (/${f.telegram_command})`)
      } else {
        const { error } = await sb.from('flows').insert(f)
        if (error) console.error(`  Error inserting flow ${f.flow_name}:`, error.message)
        else console.log(`  ✓ Inserted flow: ${f.flow_name} (/${f.telegram_command})`)
      }
    } else {
      console.log(`  - Flow /${f.telegram_command} already exists`)
    }
  }

  console.log('\n============================================================')
  console.log('  Seed complete!')
  console.log('============================================================\n')
}

seed().catch(console.error)
