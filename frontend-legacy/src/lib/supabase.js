// Central Supabase client — reads URL and key from localStorage.
// Call getSupabase() wherever you need the client.

import { createClient } from '@supabase/supabase-js'

let _client = null

export function getSupabase() {
  if (_client) return _client
  const url = localStorage.getItem('sb_url')
  const key = localStorage.getItem('sb_key')
  if (!url || !key) throw new Error('Supabase not configured')
  _client = createClient(url, key)
  return _client
}

export function clearSupabase() {
  _client = null
}

export function isConfigured() {
  return !!(localStorage.getItem('sb_url') && localStorage.getItem('sb_key'))
}
