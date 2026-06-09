import { corsPreflight, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { storeApiKey, getApiKey, deleteApiKey, listApiKeys } from '../_shared/keys.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsPreflight();

  try {
    const method = req.method;

    if (method === 'GET') {
      const keys = await listApiKeys();
      return jsonResponse(keys);
    }

    if (method === 'POST') {
      const body = await req.json();
      const { provider, api_key } = body;

      if (!provider || !api_key) {
        return errorResponse('provider and api_key are required', 400);
      }

      await storeApiKey(provider, api_key);
      return jsonResponse({ success: true, provider });
    }

    if (method === 'DELETE') {
      const body = await req.json();
      const { provider } = body;

      if (!provider) {
        return errorResponse('provider is required', 400);
      }

      await deleteApiKey(provider);
      return jsonResponse({ success: true, provider });
    }

    return errorResponse('Method not allowed', 405);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Internal error', 500);
  }
});
