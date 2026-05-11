// Fireworks AI provider
// Fully compatible with OpenAI chat completions API format.

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface CompletionResult {
  content:      string
  inputTokens:  number
  outputTokens: number
}

export async function generateCompletion(params: {
  modelId:     string
  messages:    Message[]
  temperature: number
  maxTokens:   number
  apiKey:      string
}): Promise<CompletionResult> {
  const resp = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model:       params.modelId,
      messages:    params.messages,
      temperature: params.temperature,
      max_tokens:  params.maxTokens,
    }),
  })

  if (!resp.ok) {
    const body = await resp.text()
    throw new Error(`Fireworks API error ${resp.status}: ${body}`)
  }

  const json = await resp.json()
  const choice = json.choices?.[0]
  if (!choice) throw new Error('No choices in Fireworks response')

  return {
    content:      choice.message.content ?? '',
    inputTokens:  json.usage?.prompt_tokens     ?? 0,
    outputTokens: json.usage?.completion_tokens ?? 0,
  }
}
