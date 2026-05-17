import { getSupabase } from '../supabase'
import type { PromptSchema } from '@/types'

export async function getPromptSchema(promptId: string): Promise<PromptSchema | null> {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('prompt_schemas')
    .select('*')
    .eq('prompt_id', promptId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw error
  }
  return data as PromptSchema | null
}

export async function updatePromptSchema(
  promptId: string,
  patch: Partial<PromptSchema>
): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb
    .from('prompt_schemas')
    .update(patch)
    .eq('prompt_id', promptId)

  if (error) throw error
}
