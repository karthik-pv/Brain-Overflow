import { getSupabase } from '../supabase'
import type { ModelProfile } from '@/types'

export async function getModelProfile(modelId: string): Promise<ModelProfile | null> {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('model_profiles')
    .select('*')
    .eq('model_id', modelId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw error
  }
  return data as ModelProfile | null
}

export async function updateModelProfile(
  modelId: string,
  patch: Partial<ModelProfile>
): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb
    .from('model_profiles')
    .update(patch)
    .eq('model_id', modelId)

  if (error) throw error
}

export async function createModelProfile(
  modelId: string,
  profile: Partial<ModelProfile>
): Promise<ModelProfile> {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('model_profiles')
    .insert({ model_id: modelId, ...profile })
    .select('*')
    .single()

  if (error) throw error
  return data as ModelProfile
}
