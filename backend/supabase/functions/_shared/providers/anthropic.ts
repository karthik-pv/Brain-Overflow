// Anthropic provider — stubbed, same interface as fireworks.ts
import type { Message, CompletionResult } from './fireworks.ts'

export async function generateCompletion(params: {
  modelId:     string
  messages:    Message[]
  temperature: number
  maxTokens:   number
  apiKey:      string
}): Promise<CompletionResult> {
  // Anthropic uses a slightly different format — system messages are separate
  const systemMsg = params.messages.find(m => m.role === 'system')
  const others    = params.messages.filter(m => m.role !== 'system')

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'x-api-key':         params.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type':      'application/json',
    },
    body: JSON.stringify({
      model:      params.modelId,
      max_tokens: params.maxTokens,
      system:     systemMsg?.content ?? '',
      messages:   others.map(m => ({ role: m.role, content: m.content })),
    }),
  })
  if (!resp.ok) throw new Error(`Anthropic error ${resp.status}: ${await resp.text()}`)
  const json = await resp.json()
  return {
    content:      json.content?.[0]?.text ?? '',
    inputTokens:  json.usage?.input_tokens  ?? 0,
    outputTokens: json.usage?.output_tokens ?? 0,
  }
}
