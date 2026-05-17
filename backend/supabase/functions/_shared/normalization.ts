export interface NormalizedResponse {
  analysis?: string
  category?: string
  score?: string
  reasoning?: string | null
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface ExtractionResult {
  content: any | null
  prose: string | null
  error: string | null
}

export function stripReasoning(
  text: string,
  config: { tag_based: string[]; prefix_based: string[] }
): { cleaned: string; reasoning: string | null } {
  let cleaned = text
  let reasoning: string | null = null

  // Tag-based patterns
  for (const tag of config.tag_based) {
    const tagName = tag.replace(/[<>]/g, '')
    const regex = new RegExp(`${tag}[\\s\\S]*?<\\/${tagName}>`, 'gi')
    const matches = cleaned.match(regex)
    if (matches) {
      reasoning = matches.join('\n')
      cleaned = cleaned.replace(regex, '').trim()
    }
  }

  // Prefix-based patterns
  for (const prefix of config.prefix_based) {
    const regex = new RegExp(`^${prefix}[\\s\\S]*?(?=\\n\\n|$)`, 'gim')
    const matches = cleaned.match(regex)
    if (matches) {
      reasoning = (reasoning ? reasoning + '\n' : '') + matches.join('\n')
      cleaned = cleaned.replace(regex, '').trim()
    }
  }

  return { cleaned, reasoning }
}

export function extractResponse(text: string, format: string): ExtractionResult {
  if (format === 'xml_tags') {
    return extractXml(text)
  }
  return extractJson(text)
}

function extractJson(text: string): ExtractionResult {
  // Try fenced JSON first
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) {
    try {
      return {
        content: JSON.parse(fenced[1].trim()),
        prose: text.replace(fenced[0], '').trim() || null,
        error: null,
      }
    } catch (e: any) {
      return { content: null, prose: text.trim(), error: `JSON parse error: ${e.message}` }
    }
  }

  // Try raw JSON object
  const raw = text.match(/\{[\s\S]*\}/)
  if (raw) {
    try {
      return {
        content: JSON.parse(raw[0].trim()),
        prose: text.replace(raw[0], '').trim() || null,
        error: null,
      }
    } catch (e: any) {
      return { content: null, prose: text.trim(), error: `JSON parse error: ${e.message}` }
    }
  }

  return { content: null, prose: text.trim(), error: 'No JSON found in response' }
}

function extractXml(text: string): ExtractionResult {
  const responseMatch = text.match(/<response>([\s\S]*?)<\/response>/)
  if (!responseMatch) {
    return { content: null, prose: text.trim(), error: 'No XML response tag found' }
  }

  const xmlContent = responseMatch[1]
  const result: any = {}

  const fields = ['analysis', 'category', 'score']
  for (const field of fields) {
    const match = xmlContent.match(new RegExp(`<${field}>([\\s\\S]*?)<\\/${field}>`))
    if (match) {
      result[field] = match[1].trim()
    }
  }

  return {
    content: result,
    prose: text.replace(responseMatch[0], '').trim() || null,
    error: null,
  }
}

export function normalizeResponse(
  parsed: any,
  aliases: Record<string, string[]>
): NormalizedResponse {
  const result: NormalizedResponse = {}

  for (const [coreField, aliasList] of Object.entries(aliases)) {
    for (const alias of aliasList) {
      if (parsed[alias] !== undefined) {
        result[coreField as keyof NormalizedResponse] = parsed[alias]
        break
      }
    }
  }

  return result
}

export function normalizeVerdict(
  verdict: string,
  synonymMap: Record<string, string>
): string {
  const normalized = verdict.toLowerCase().trim()
  return synonymMap[normalized] || normalized
}

export function extractVerdict(text: string, strategy: string): string | null {
  const matches = text.match(/VERDICT:\s*(\w+)/gi)
  if (!matches || matches.length === 0) return null

  if (strategy === 'last_occurrence') {
    const lastMatch = matches[matches.length - 1]
    return lastMatch.replace(/VERDICT:\s*/i, '').toLowerCase()
  }

  if (strategy === 'first_occurrence') {
    return matches[0].replace(/VERDICT:\s*/i, '').toLowerCase()
  }

  return null
}

export function validateResponse(
  normalized: NormalizedResponse,
  allowedCategories: string[],
  allowedScores: string[]
): ValidationResult {
  const errors: string[] = []

  if (!normalized.analysis) errors.push("Missing 'analysis' field")
  if (!normalized.category) errors.push("Missing 'category' field")
  if (!normalized.score) errors.push("Missing 'score' field")

  if (normalized.category && !allowedCategories.includes(normalized.category)) {
    errors.push(`Invalid category: ${normalized.category}`)
  }

  if (normalized.score && !allowedScores.includes(normalized.score)) {
    errors.push(`Invalid score: ${normalized.score}`)
  }

  return { valid: errors.length === 0, errors }
}
