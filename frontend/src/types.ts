export type IdeaStatus = 'recorded' | 'processing' | 'completed' | 'failed'
export type IdeaScore = 'strong' | 'weak' | 'needs_pivot' | 'needs_refinement'
export type IdeaCategory =
  | 'startup_idea'
  | 'automation'
  | 'personal_tool'
  | 'dev_tool'
  | 'other'

export interface Idea {
  id: string
  idea: string
  category: IdeaCategory | null
  score: IdeaScore | null
  flow_id: string | null
  status: IdeaStatus
  latest_run_id: string | null
  telegram_chat_id: string | null
  telegram_message_id: string | null
  created_at: string
}

export type MessageType = 'idea' | 'prompt' | 'response'

export interface ChatMessage {
  id: string
  idea_id: string
  message: string
  message_type: MessageType
  prompt_id: string | null
  sequence_number: number
  reasoning_content: string | null
  tokens_used: number | null
  run_id: string | null
  created_at: string
}

export type ContextMode =
  | 'idea_only'
  | 'previous_response'
  | 'full_history_json'

export interface Prompt {
  id: string
  prompt_name: string
  prompt: string
  context_mode: ContextMode
  use_system_format: boolean
  custom_schema: string | null
  created_at: string
}

export interface Flow {
  id: string
  flow_name: string
  telegram_command: string | null
  prompt_ids: string[]
  created_at: string
}

export type Provider = string // Allow dynamically added providers

export interface Model {
  id: string
  model_name: string
  model_id: string
  provider: Provider
  is_active: boolean
  created_at: string
}

export interface IdeaRun {
  id: string
  idea_id: string
  flow_id: string | null
  model_id: string | null
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partial'
  category: IdeaCategory | null
  score: IdeaScore | null
  validation_state: 'valid' | 'recovered' | 'partial' | 'invalid'
  total_tokens: number
  error_message: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  flow?: { flow_name: string }
}

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
  created_at: string
  updated_at: string
}

export interface PromptSchema {
  id: string
  prompt_id: string
  field_aliases: Record<string, string[]>
  allowed_categories: string[] | null
  allowed_scores: string[] | null
  created_at: string
}
