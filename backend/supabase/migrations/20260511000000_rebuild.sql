-- Drop old tables if they exist to start fresh
drop table if exists chat_messages cascade;
drop table if exists ideas cascade;
drop table if exists flows cascade;
drop table if exists prompts cascade;
drop table if exists models cascade;
drop table if exists prompt_executions cascade;
drop table if exists room_config cascade;
drop table if exists rooms cascade;
drop table if exists workspaces cascade;
drop table if exists idea_metadata cascade;

-- ============================================================
-- Brain Overflow Idea Logger — Complete Schema
-- ============================================================

-- flows (created first, ideas references it)
create table flows (
  id          uuid primary key default gen_random_uuid(),
  flow_name   text not null,
  prompt_ids  jsonb not null default '[]',
  created_at  timestamptz default now()
);

-- prompts
create table prompts (
  id          uuid primary key default gen_random_uuid(),
  prompt_name text not null,
  prompt      text not null,
  created_at  timestamptz default now()
);

-- models
create table models (
  id          uuid primary key default gen_random_uuid(),
  model_name  text not null,
  model_id    text not null,
  provider    text not null,
  created_at  timestamptz default now()
);

-- ideas
create table ideas (
  id                  uuid primary key default gen_random_uuid(),
  idea                text not null,
  category            text check (category in ('startup_idea','automation','personal_tool','dev_tool','other')),
  score               text check (score in ('strong','weak','needs_pivot','needs_refinement')),
  flow_id             uuid references flows(id),
  status              text not null default 'recorded'
                        check (status in ('recorded','processing','completed','failed')),
  telegram_chat_id    text,
  telegram_message_id text,
  created_at          timestamptz default now()
);

-- chat_messages (full immutable conversation log)
create table chat_messages (
  id              uuid primary key default gen_random_uuid(),
  idea_id         uuid not null references ideas(id) on delete cascade,
  message         text not null,
  role            text not null check (role in ('user','system','assistant')),
  prompt_id       uuid references prompts(id),
  sequence_number integer not null,
  created_at      timestamptz default now()
);

-- Disable RLS — trust-based system, no user auth
alter table flows        disable row level security;
alter table prompts      disable row level security;
alter table models       disable row level security;
alter table ideas        disable row level security;
alter table chat_messages disable row level security;
