import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Creates a Supabase client using the secret key.
// Inside edge functions, Supabase auto-injects SUPABASE_SERVICE_ROLE_KEY
// regardless of what the dashboard calls the key.
// We also pass it as 'apikey' header for compatibility with new sb_secret format.
export function createServiceClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { apikey: key } },
  })
}
