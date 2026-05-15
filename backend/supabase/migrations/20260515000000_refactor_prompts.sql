-- Refactoring prompt flow away from chat roles to deterministic string injection
-- Target requirements: context_mode replacing multi_turn, message_type replacing role

-- 1. Updates to prompts table
ALTER TABLE prompts 
  ADD COLUMN context_mode TEXT NOT NULL DEFAULT 'idea_only';

-- Migration path for old flag
UPDATE prompts SET context_mode = 'full_history_json' WHERE multi_turn = true;

ALTER TABLE prompts 
  DROP COLUMN multi_turn;

-- 2. Updates to chat_messages table
-- Drop the existing role constraint
ALTER TABLE chat_messages 
  DROP CONSTRAINT IF EXISTS chat_messages_role_check;

ALTER TABLE chat_messages 
  RENAME COLUMN role TO message_type;

-- Migration data over for old role values
UPDATE chat_messages SET message_type = 'idea' WHERE message_type = 'user';
UPDATE chat_messages SET message_type = 'prompt' WHERE message_type = 'system';
UPDATE chat_messages SET message_type = 'response' WHERE message_type = 'assistant';

-- Add new constraint for message_type
ALTER TABLE chat_messages
  ADD CONSTRAINT chat_messages_message_type_check 
  CHECK (message_type IN ('idea', 'prompt', 'response'));
