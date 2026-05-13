alter table prompts
  add column if not exists multi_turn boolean not null default false;