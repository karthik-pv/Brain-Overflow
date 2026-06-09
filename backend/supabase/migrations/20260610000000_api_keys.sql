-- Create api_keys table for per-provider encrypted API keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  encrypted_key TEXT NOT NULL,
  key_prefix TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Function: encrypt and store an API key
CREATE OR REPLACE FUNCTION store_api_key(
  p_provider TEXT,
  p_plaintext TEXT,
  p_key_prefix TEXT,
  p_encryption_key TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO api_keys (provider, encrypted_key, key_prefix)
  VALUES (p_provider, encode(pgp_sym_encrypt(p_plaintext, p_encryption_key), 'base64'), p_key_prefix)
  ON CONFLICT (provider)
  DO UPDATE SET
    encrypted_key = EXCLUDED.encrypted_key,
    key_prefix = EXCLUDED.key_prefix,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: decrypt and return an API key
CREATE OR REPLACE FUNCTION get_api_key(
  p_provider TEXT,
  p_encryption_key TEXT
) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT pgp_sym_decrypt(decode(encrypted_key, 'base64'), p_encryption_key)::TEXT
  INTO result
  FROM api_keys
  WHERE provider = p_provider;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
