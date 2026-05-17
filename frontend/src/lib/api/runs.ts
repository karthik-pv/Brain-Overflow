import { getSupabase, getEdgeFnHeaders, getSupabaseUrl } from '../supabase'
import type { IdeaRun } from '@/types'

export async function startRun(ideaId: string, flowId: string): Promise<{ run_id: string }> {
  const url = getSupabaseUrl()
  const headers = getEdgeFnHeaders()

  const resp = await fetch(`${url}/functions/v1/start-run`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ idea_id: ideaId, flow_id: flowId }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error ?? `start-run failed: ${resp.status}`)
  }

  return resp.json()
}

export async function listRuns(ideaId: string): Promise<IdeaRun[]> {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('idea_runs')
    .select('*, flow:flows(flow_name)')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as IdeaRun[]
}

export async function getRun(runId: string): Promise<IdeaRun | null> {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('idea_runs')
    .select('*, flow:flows(flow_name)')
    .eq('id', runId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as IdeaRun
}
