-- Migration: Idea Runs & Web Flow Selection
-- Date: 2026-05-17

-- 1. updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create idea_runs table
CREATE TABLE IF NOT EXISTS idea_runs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id          UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  flow_id          UUID REFERENCES flows(id),
  model_id         TEXT,
  status           TEXT NOT NULL DEFAULT 'queued'
                   CHECK (status IN ('queued','processing','completed','failed','partial')),
  category         TEXT,
  score            TEXT,
  validation_state TEXT NOT NULL DEFAULT 'valid'
                   CHECK (validation_state IN ('valid','recovered','partial','invalid')),
  total_tokens     INTEGER NOT NULL DEFAULT 0,
  error_message    TEXT,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idea_runs_idea_id ON idea_runs(idea_id);

CREATE TRIGGER idea_runs_updated_at
  BEFORE UPDATE ON idea_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Add run_id to chat_messages
ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS run_id UUID REFERENCES idea_runs(id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_run_id ON chat_messages(run_id);

-- 4. Add latest_run_id to ideas
ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS latest_run_id UUID REFERENCES idea_runs(id);
