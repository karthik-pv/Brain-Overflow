-- ============================================================
-- Additions: telegram_command on flows, telegram_chat_config,
-- and is_active on models for dynamic model selection
-- ============================================================

-- 1. Add telegram_command to flows
alter table flows
  add column if not exists telegram_command text unique;

-- 2. Persistent per-chat flow selection
create table if not exists telegram_chat_config (
  telegram_chat_id  text primary key,
  flow_id           uuid not null references flows(id),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table telegram_chat_config disable row level security;

-- 3. Mark which model is active (process-prompt will use is_active=true first)
alter table models
  add column if not exists is_active boolean not null default false;
