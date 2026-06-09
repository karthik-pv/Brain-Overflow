import { createServiceClient } from './db.ts';

const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY') || '';

export async function storeApiKey(provider: string, plaintextKey: string): Promise<void> {
  const sb = createServiceClient();
  const keyPrefix = plaintextKey.substring(0, 4);
  const { error } = await sb.rpc('store_api_key', {
    p_provider: provider,
    p_plaintext: plaintextKey,
    p_key_prefix: keyPrefix,
    p_encryption_key: ENCRYPTION_KEY,
  });
  if (error) throw error;
}

export async function getApiKey(provider: string): Promise<string | null> {
  const sb = createServiceClient();
  const { data, error } = await sb.rpc('get_api_key', {
    p_provider: provider,
    p_encryption_key: ENCRYPTION_KEY,
  });
  if (error) return null;
  return data as string | null;
}

export async function deleteApiKey(provider: string): Promise<void> {
  const sb = createServiceClient();
  const { error } = await sb.from('api_keys').delete().eq('provider', provider);
  if (error) throw error;
}

export async function listApiKeys(): Promise<{ provider: string; key_prefix: string | null }[]> {
  const sb = createServiceClient();
  const { data, error } = await sb.from('api_keys').select('provider, key_prefix');
  if (error) throw error;
  return (data ?? []) as { provider: string; key_prefix: string | null }[];
}
