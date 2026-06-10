// Groq provider — with retry-after / exponential-backoff for 429/503,
// and context truncation for 413 (free tier TPM limit exceeded).
import type { Message, CompletionResult } from './fireworks.ts'

const RETRY_DELAYS_MS = [2000, 5000, 10000]

export async function generateCompletion(params: {
  modelId:     string
  messages:    Message[]
  temperature: number
  maxTokens:   number
  apiKey:      string
}): Promise<CompletionResult> {
  let messages = params.messages
  let maxTokens = params.maxTokens
  let lastError = ''
  let truncated = false

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model:       params.modelId,
        messages,
        temperature: params.temperature,
        max_tokens:  maxTokens,
      }),
    })

    if (resp.ok) {
      const json = await resp.json()
      const choice = json.choices?.[0]
      if (!choice) throw new Error('No choices in Groq response')
      return {
        content:      choice.message.content ?? '',
        inputTokens:  json.usage?.prompt_tokens     ?? 0,
        outputTokens: json.usage?.completion_tokens ?? 0,
      }
    }

    const text = await resp.text()
    lastError = `Groq API error ${resp.status}: ${text}`

    // 413 = request too large (free tier TPM limit). Keep system + idea +
    // last 2 exchanges, drop middle history to fit under the limit.
    if (resp.status === 413 && !truncated) {
      truncated = true
      const sysMsg = messages.find(m => m.role === 'system')
      const nonSystem = messages.filter(m => m.role !== 'system')
      // Keep the first user message (the idea) and last 2 exchanges
      const firstUser = nonSystem.find(m => m.role === 'user')
      const lastTwo = nonSystem.slice(-4) // up to 2 user+assistant pairs
      const kept = [firstUser, ...lastTwo].filter((m, i, arr) =>
        m && arr.findIndex(x => x === m) === i
      )
      messages = [
        ...(sysMsg ? [sysMsg] : []),
        ...kept,
      ]
      maxTokens = Math.min(maxTokens, 4096)
      console.log(`[groq] Request too large (413), retrying with truncated context (${messages.length} messages, ${maxTokens} max_tokens)`)
      continue
    }

    const isRetryable = resp.status === 429 || resp.status === 503
    if (!isRetryable || attempt >= RETRY_DELAYS_MS.length) {
      throw new Error(lastError)
    }

    const retryAfterSec = resp.headers.get('Retry-After')
    const delayMs = retryAfterSec
      ? parseInt(retryAfterSec, 10) * 1000
      : RETRY_DELAYS_MS[attempt]

    console.log(`[groq] Rate limited (${resp.status}), retrying in ${delayMs}ms (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length})`)
    await new Promise(res => setTimeout(res, delayMs))
  }

  throw new Error(lastError)
}