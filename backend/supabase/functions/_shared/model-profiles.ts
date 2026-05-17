import { createServiceClient } from './db.ts'

export interface ModelProfile {
  id: string
  model_id: string
  max_tokens: number
  reasoning_budget: number
  temperature: number
  timeout_ms: number
  strip_reasoning: boolean
  max_retries: number
  prompt_format: 'json_schema' | 'xml_tags' | 'markdown_sections'
  normalization_config: {
    reasoning_patterns: {
      tag_based: string[]
      prefix_based: string[]
    }
    synonym_map: Record<string, string>
    double_verdict_strategy: string
  }
}

export async function loadModelProfile(modelId: string): Promise<ModelProfile | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('model_profiles')
    .select('*')
    .eq('model_id', modelId)
    .single()

  if (error || !data) return null
  return data as ModelProfile
}

export function computeOutputBudget(profile: ModelProfile): number {
  return profile.max_tokens - profile.reasoning_budget
}
