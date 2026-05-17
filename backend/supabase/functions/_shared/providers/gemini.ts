// Gemini provider
import type { Message, CompletionResult } from './fireworks.ts'

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
  const resp = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Gemini API error ${resp.status}: ${text}`)
  }

  const json = await resp.json()
  
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  
  return {
    content,
    inputTokens:  json.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: json.usageMetadata?.candidatesTokenCount ?? 0,
  }
}