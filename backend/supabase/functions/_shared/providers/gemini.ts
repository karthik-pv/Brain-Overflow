// Gemini provider — with retry-after / exponential-backoff for 429 & 503
import type { Message, CompletionResult } from './fireworks.ts'

// How long to wait (ms) before retrying a rate-limited request
const RETRY_DELAYS_MS = [2000, 5000, 10000] // 3 attempts total

export async function generateCompletion(params: {
  modelId:     string
  messages:    Message[]
  temperature: number
  maxTokens:   number
  apiKey:      string
}): Promise<CompletionResult> {
  const systemMsg = params.messages.find(m => m.role === 'system')
  const others    = params.messages.filter(m => m.role !== 'system')

  const contents = others.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }))

  const body: any = {
    contents,
    generationConfig: {
      temperature: params.temperature,
      maxOutputTokens: params.maxTokens,
    }
  }

  if (systemMsg) {
    body.systemInstruction = {
      parts: [{ text: systemMsg.content }]
    }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.modelId}:generateContent?key=${params.apiKey}`

  let lastError = ''
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const resp = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })

    if (resp.ok) {
      const json = await resp.json()
      const content = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      return {
        content,
        inputTokens:  json.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: json.usageMetadata?.candidatesTokenCount ?? 0,
      }
    }

    const isRetryable = resp.status === 429 || resp.status === 503
    const text = await resp.text()
    lastError = `Gemini API error ${resp.status}: ${text}`

    if (!isRetryable || attempt >= RETRY_DELAYS_MS.length) {
      throw new Error(lastError)
    }

    // Honour Retry-After if present, else use exponential backoff
    const retryAfterSec = resp.headers.get('Retry-After')
    const delayMs = retryAfterSec
      ? parseInt(retryAfterSec, 10) * 1000
      : RETRY_DELAYS_MS[attempt]

    console.log(`[gemini] Rate limited (${resp.status}), retrying in ${delayMs}ms (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length})`)
    await new Promise(res => setTimeout(res, delayMs))
  }

  throw new Error(lastError)
}