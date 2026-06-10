-- ============================================================
-- Brain Overflow — Complete Schema (merged from 11 migrations)
-- ============================================================

-- Drop old tables if they exist (fresh start)
drop table if exists chat_messages cascade;
drop table if exists ideas cascade;
drop table if exists idea_runs cascade;
drop table if exists flows cascade;
drop table if exists prompts cascade;
drop table if exists prompt_schemas cascade;
drop table if exists models cascade;
drop table if exists model_profiles cascade;
drop table if exists api_keys cascade;
drop table if exists telegram_chat_config cascade;
drop table if exists prompt_executions cascade;
drop table if exists room_config cascade;
drop table if exists rooms cascade;
drop table if exists workspaces cascade;
drop table if exists idea_metadata cascade;

-- ============================================================
-- TABLES
-- ============================================================

create table flows (
  id               uuid primary key default gen_random_uuid(),
  flow_name        text not null,
  prompt_ids       jsonb not null default '[]',
  telegram_command text unique,
  created_at       timestamptz default now()
);

create table prompts (
  id                uuid primary key default gen_random_uuid(),
  prompt_name       text not null,
  prompt            text not null,
  context_mode      text not null default 'idea_only',
  use_system_format boolean not null default true,
  custom_schema     jsonb default null,
  created_at        timestamptz default now()
);

create table prompt_schemas (
  id                 uuid primary key default gen_random_uuid(),
  prompt_id          uuid references prompts(id) on delete cascade,
  field_aliases      jsonb not null default '{
    "analysis": ["analysis", "content", "response", "output"],
    "category": ["category", "type", "domain", "classification"],
    "score": ["score", "verdict", "rating", "assessment"]
  }',
  allowed_categories text[] default null,
  allowed_scores     text[] default null,
  created_at         timestamptz default now()
);

create table models (
  id         uuid primary key default gen_random_uuid(),
  model_name text not null,
  model_id   text not null,
  provider   text not null,
  is_active  boolean not null default false,
  created_at timestamptz default now()
);

create table model_profiles (
  id                   uuid primary key default gen_random_uuid(),
  model_id             uuid not null references models(id) on delete cascade,
  max_tokens           integer not null default 8192,
  reasoning_budget     integer not null default 0,
  temperature          float not null default 0.3,
  timeout_ms           integer not null default 60000,
  strip_reasoning      boolean not null default true,
  max_retries          integer not null default 2,
  prompt_format        text not null default 'json_schema'
    check (prompt_format in ('json_schema', 'xml_tags', 'markdown_sections')),
  normalization_config jsonb not null default '{
    "reasoning_patterns": {
      "tag_based": [" thinking"],
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
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create table ideas (
  id                  uuid primary key default gen_random_uuid(),
  idea                text not null,
  category            text check (category in ('startup_idea','automation','personal_tool','dev_tool','other')),
  score               text check (score in ('strong','weak','needs_pivot','needs_refinement')),
  flow_id             uuid references flows(id),
  status              text not null default 'recorded'
    check (status in ('recorded','processing','completed','failed')),
  latest_run_id       uuid,  -- FK added below after idea_runs is created
  telegram_chat_id    text,
  telegram_message_id text,
  created_at          timestamptz default now()
);

create table idea_runs (
  id               uuid primary key default gen_random_uuid(),
  idea_id          uuid not null references ideas(id) on delete cascade,
  flow_id          uuid references flows(id),
  model_id         text,
  status           text not null default 'queued'
    check (status in ('queued','processing','completed','failed','partial')),
  category         text,
  score            text,
  validation_state text not null default 'valid'
    check (validation_state in ('valid','recovered','partial','invalid')),
  total_tokens     integer not null default 0,
  error_message    text,
  completed_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- FK for ideas.latest_run_id (created after idea_runs exists)
alter table ideas
  add constraint ideas_latest_run_id_fkey
  foreign key (latest_run_id) references idea_runs(id) on delete set null;

create table chat_messages (
  id                uuid primary key default gen_random_uuid(),
  idea_id           uuid not null references ideas(id) on delete cascade,
  message           text not null,
  message_type      text not null check (message_type in ('idea','prompt','response')),
  prompt_id         uuid references prompts(id),
  run_id            uuid references idea_runs(id),
  sequence_number   integer not null,
  reasoning_content text default null,
  tokens_used       integer default null,
  created_at        timestamptz default now()
);

create table telegram_chat_config (
  telegram_chat_id text primary key,
  flow_id          uuid not null references flows(id),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table api_keys (
  id            uuid primary key default gen_random_uuid(),
  provider      text not null unique,
  encrypted_key text not null,
  key_prefix    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_idea_runs_idea_id on idea_runs(idea_id);
create index idx_chat_messages_run_id on chat_messages(run_id);
create index idx_model_profiles_model_id on model_profiles(model_id);
create index idx_prompt_schemas_prompt_id on prompt_schemas(prompt_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger idea_runs_updated_at
  before update on idea_runs
  for each row execute function update_updated_at();

-- Encrypt and store an API key
create or replace function store_api_key(
  p_provider text,
  p_plaintext text,
  p_key_prefix text,
  p_encryption_key text
) returns void as $$
begin
  insert into api_keys (provider, encrypted_key, key_prefix)
  values (p_provider, encode(pgp_sym_encrypt(p_plaintext, p_encryption_key), 'base64'), p_key_prefix)
  on conflict (provider)
  do update set
    encrypted_key = excluded.encrypted_key,
    key_prefix = excluded.key_prefix,
    updated_at = now();
end;
$$ language plpgsql security definer;

-- Decrypt and return an API key
create or replace function get_api_key(
  p_provider text,
  p_encryption_key text
) returns text as $$
declare
  result text;
begin
  select pgp_sym_decrypt(decode(encrypted_key, 'base64'), p_encryption_key)::text
  into result
  from api_keys
  where provider = p_provider;
  return result;
end;
$$ language plpgsql security definer;

revoke execute on function store_api_key from public, anon, authenticated;
revoke execute on function get_api_key from public, anon, authenticated;

-- ============================================================
-- RLS (disabled — trust-based system)
-- ============================================================

alter table flows               disable row level security;
alter table prompts             disable row level security;
alter table prompt_schemas      disable row level security;
alter table models              disable row level security;
alter table model_profiles      disable row level security;
alter table ideas               disable row level security;
alter table idea_runs           disable row level security;
alter table chat_messages       disable row level security;
alter table telegram_chat_config disable row level security;
alter table api_keys            disable row level security;

-- ============================================================
-- SEED: Default models (first-time setup only)
-- ============================================================

insert into models (model_name, model_id, provider, is_active)
select * from (values
  ('GPT-4o', 'gpt-4o', 'openai', false),
  ('GPT-4o Mini', 'gpt-4o-mini', 'openai', false),
  ('Claude Sonnet 4.5', 'claude-sonnet-4-5-20250929', 'anthropic', false),
  ('Claude Haiku 4.5', 'claude-haiku-4-5-20251001', 'anthropic', false),
  ('DeepSeek V4 Pro', 'accounts/fireworks/models/deepseek-v4-pro', 'fireworks', false),
  ('Kimi K2P6', 'accounts/fireworks/models/kimi-k2p6', 'fireworks', false),
  ('Llama 3.3 70B', 'llama-3.3-70b-versatile', 'groq', false),
  ('GPT-OSS 120B', 'gpt-oss-120b', 'groq', false)
) as v(model_name, model_id, provider, is_active)
where not exists (select 1 from models limit 1);

-- ============================================================
-- SEED: Model profiles for existing models (idempotent)
-- ============================================================

insert into model_profiles (model_id, max_tokens, reasoning_budget, temperature, timeout_ms, strip_reasoning, max_retries, prompt_format, normalization_config)
select
  id,
  case
    when model_id like '%kimi-k2p6%' then 16384
    when model_id like '%deepseek%' then 16384
    else 8192
  end,
  case
    when model_id like '%kimi-k2p6%' then 8000
    when model_id like '%deepseek%' then 6000
    else 0
  end,
  0.3,
  case
    when model_id like '%kimi-k2p6%' then 60000
    when model_id like '%deepseek%' then 45000
    else 30000
  end,
  case
    when model_id like '%kimi-k2p6%' then true
    when model_id like '%deepseek%' then true
    else false
  end,
  2,
  'json_schema',
  '{
    "reasoning_patterns": {
      "tag_based": [" thinking"],
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
from models
where not exists (
  select 1 from model_profiles mp where mp.model_id = models.id
);

-- ============================================================
-- SEED: Default prompt_schemas for existing prompts
-- ============================================================

insert into prompt_schemas (prompt_id, allowed_categories, allowed_scores)
select
  id,
  array['startup_idea', 'automation', 'personal_tool', 'dev_tool', 'other'],
  array['strong', 'weak', 'needs_pivot', 'needs_refinement']
from prompts
where not exists (
  select 1 from prompt_schemas ps where ps.prompt_id = prompts.id
);
