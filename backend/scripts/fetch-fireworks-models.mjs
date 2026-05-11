// fetch-fireworks-models.mjs — query Fireworks API for live serverless model list
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
function loadEnv() {
  const p = resolve(ROOT, '.env')
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const m = line.trim().match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  }
}
loadEnv()

const resp = await fetch('https://api.fireworks.ai/inference/v1/models', {
  headers: { Authorization: `Bearer ${process.env.AI_API_KEY}` }
})
const json = await resp.json()
// Show only serverless-capable models
const models = (json.data ?? []).filter(m => m.id?.includes('instruct') || m.id?.includes('chat'))
console.log('\nFireworks serverless models (instruct/chat):\n')
for (const m of models.slice(0, 30)) {
  console.log(m.id)
}
