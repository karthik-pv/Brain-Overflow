import { getEdgeFnHeaders, getSupabaseUrl } from '../supabase';

export interface ApiKeyInfo {
  provider: string;
  key_prefix: string | null;
}

export async function listApiKeys(): Promise<ApiKeyInfo[]> {
  const url = getSupabaseUrl();
  const headers = getEdgeFnHeaders();
  const resp = await fetch(`${url}/functions/v1/manage-api-keys`, {
    method: 'GET',
    headers,
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `listApiKeys failed: ${resp.status}`);
  }
  return resp.json();
}

export async function saveApiKey(provider: string, apiKey: string): Promise<void> {
  const url = getSupabaseUrl();
  const headers = getEdgeFnHeaders();
  const resp = await fetch(`${url}/functions/v1/manage-api-keys`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ provider, api_key: apiKey }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `saveApiKey failed: ${resp.status}`);
  }
}

export async function removeApiKey(provider: string): Promise<void> {
  const url = getSupabaseUrl();
  const headers = getEdgeFnHeaders();
  const resp = await fetch(`${url}/functions/v1/manage-api-keys`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ provider }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `removeApiKey failed: ${resp.status}`);
  }
}
