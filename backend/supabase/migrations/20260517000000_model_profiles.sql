-- Migration: Model Profiles & Output Normalization
-- Date: 2026-05-17

-- 1. Create model_profiles table
CREATE TABLE IF NOT EXISTS model_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id            UUID REFERENCES models(id) ON DELETE CASCADE,

  -- Token budgets
  max_tokens          INTEGER NOT NULL DEFAULT 8192,
  reasoning_budget    INTEGER NOT NULL DEFAULT 0,

  -- Behavior flags
  temperature         FLOAT NOT NULL DEFAULT 0.3,
  timeout_ms          INTEGER NOT NULL DEFAULT 60000,
  strip_reasoning     BOOLEAN NOT NULL DEFAULT TRUE,
  max_retries         INTEGER NOT NULL DEFAULT 2,

  -- Prompt formatting preference
  prompt_format       TEXT NOT NULL DEFAULT 'json_schema'
    CHECK (prompt_format IN ('json_schema', 'xml_tags', 'markdown_sections')),

  -- Normalization config (JSONB)
  normalization_config JSONB NOT NULL DEFAULT '{
    "reasoning_patterns": {
      "tag_based": ["<think>"],
      "prefix_based": ["Thinking:", "Reasoning:"]
    },
    "synonym_map": {
      "promising": "strong",
      "good": "strong",
      "viable": "strong",
      "bad": "weak",
      "poor": "weak",
      "needs work": "needs_refinement"
    },
    "double_verdict_strategy": "last_occurrence"
  }',

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Modify prompts table
ALTER TABLE prompts
  ADD COLUMN IF NOT EXISTS use_system_format BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS custom_schema JSONB DEFAULT NULL;

-- 3. Create prompt_schemas table
CREATE TABLE IF NOT EXISTS prompt_schemas (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id           UUID REFERENCES prompts(id) ON DELETE CASCADE,

  field_aliases       JSONB NOT NULL DEFAULT '{
    "analysis": ["analysis", "content", "response", "output"],
    "category": ["category", "type", "domain", "classification"],
    "score": ["score", "verdict", "rating", "assessment"]
  }',

  allowed_categories  TEXT[] DEFAULT NULL,
  allowed_scores      TEXT[] DEFAULT NULL,

  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Modify chat_messages table
ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS reasoning_content TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT NULL;

-- 5. Seed default profiles for known models
INSERT INTO model_profiles (model_id, max_tokens, reasoning_budget, temperature, timeout_ms, strip_reasoning, max_retries, prompt_format, normalization_config)
SELECT
  id,
  CASE
    WHEN model_id LIKE '%kimi-k2p6%' THEN 16384
    WHEN model_id LIKE '%deepseek%' THEN 16384
    ELSE 8192
  END,
  CASE
    WHEN model_id LIKE '%kimi-k2p6%' THEN 8000
    WHEN model_id LIKE '%deepseek%' THEN 6000
    ELSE 0
  END,
  0.3,
  CASE
    WHEN model_id LIKE '%kimi-k2p6%' THEN 60000
    WHEN model_id LIKE '%deepseek%' THEN 45000
    ELSE 30000
  END,
  CASE
    WHEN model_id LIKE '%kimi-k2p6%' THEN TRUE
    WHEN model_id LIKE '%deepseek%' THEN TRUE
    ELSE FALSE
  END,
  2,
  'json_schema',
  '{
    "reasoning_patterns": {
      "tag_based": ["<think>"],
      "prefix_based": ["Thinking:", "Reasoning:"]
    },
    "synonym_map": {
      "promising": "strong",
      "good": "strong",
      "viable": "strong",
      "bad": "weak",
      "poor": "weak",
      "needs work": "needs_refinement"
    },
    "double_verdict_strategy": "last_occurrence"
  }'
FROM models
WHERE NOT EXISTS (
  SELECT 1 FROM model_profiles mp WHERE mp.model_id = models.id
);

-- 6. Backfill existing prompts
UPDATE prompts SET use_system_format = TRUE WHERE use_system_format IS NULL;

-- 7. Create default prompt_schemas for existing prompts
INSERT INTO prompt_schemas (prompt_id, allowed_categories, allowed_scores)
SELECT
  id,
  ARRAY['startup_idea', 'automation', 'personal_tool', 'dev_tool', 'other'],
  ARRAY['strong', 'weak', 'needs_pivot', 'needs_refinement']
FROM prompts
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_schemas ps WHERE ps.prompt_id = prompts.id
);
