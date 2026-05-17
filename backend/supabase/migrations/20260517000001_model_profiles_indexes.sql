-- Migration: Fix model_profiles indexes and NOT NULL constraint
-- Date: 2026-05-17

-- 1. Add NOT NULL constraint to model_profiles.model_id
ALTER TABLE model_profiles ALTER COLUMN model_id SET NOT NULL;

-- 2. Add covering indexes on FK columns for JOIN performance
CREATE INDEX IF NOT EXISTS idx_model_profiles_model_id ON model_profiles(model_id);
CREATE INDEX IF NOT EXISTS idx_prompt_schemas_prompt_id ON prompt_schemas(prompt_id);
