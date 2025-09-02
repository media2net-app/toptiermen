-- Fix foreign key relationships for chat tables
-- This script adds explicit foreign key constraints

-- Drop existing foreign key constraints if they exist
ALTER TABLE chat_conversations DROP CONSTRAINT IF EXISTS chat_conversations_participant1_id_fkey;
ALTER TABLE chat_conversations DROP CONSTRAINT IF EXISTS chat_conversations_participant2_id_fkey;
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_conversation_id_fkey;
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;
ALTER TABLE user_online_status DROP CONSTRAINT IF EXISTS user_online_status_user_id_fkey;
ALTER TABLE chat_notifications DROP CONSTRAINT IF EXISTS chat_notifications_user_id_fkey;
ALTER TABLE chat_notifications DROP CONSTRAINT IF EXISTS chat_notifications_conversation_id_fkey;
ALTER TABLE chat_notifications DROP CONSTRAINT IF EXISTS chat_notifications_message_id_fkey;

-- Add explicit foreign key constraints
ALTER TABLE chat_conversations 
ADD CONSTRAINT chat_conversations_participant1_id_fkey 
FOREIGN KEY (participant1_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE chat_conversations 
ADD CONSTRAINT chat_conversations_participant2_id_fkey 
FOREIGN KEY (participant2_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_conversation_id_fkey 
FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE;

ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_online_status 
ADD CONSTRAINT user_online_status_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE chat_notifications 
ADD CONSTRAINT chat_notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE chat_notifications 
ADD CONSTRAINT chat_notifications_conversation_id_fkey 
FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE;

ALTER TABLE chat_notifications 
ADD CONSTRAINT chat_notifications_message_id_fkey 
FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_participants ON chat_conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_user ON chat_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_online_status_online ON user_online_status(is_online);

-- Insert test conversation if it doesn't exist
INSERT INTO chat_conversations (participant1_id, participant2_id) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440004', '821f4716-abfa-4b1e-90db-547a0b2231b0')
ON CONFLICT (participant1_id, participant2_id) DO NOTHING;

-- Insert test messages
INSERT INTO chat_messages (conversation_id, sender_id, content) 
SELECT 
  c.id,
  '550e8400-e29b-41d4-a716-446655440004', -- Thomas (Chiel)
  'Hey Rick! Hoe gaat het met je training vandaag? 💪'
FROM chat_conversations c 
WHERE (c.participant1_id = '550e8400-e29b-41d4-a716-446655440004' AND c.participant2_id = '821f4716-abfa-4b1e-90db-547a0b2231b0')
   OR (c.participant1_id = '821f4716-abfa-4b1e-90db-547a0b2231b0' AND c.participant2_id = '550e8400-e29b-41d4-a716-446655440004')
LIMIT 1;

INSERT INTO chat_messages (conversation_id, sender_id, content) 
SELECT 
  c.id,
  '821f4716-abfa-4b1e-90db-547a0b2231b0', -- Joost (Rick)
  'Hey Chiel! Gaat goed hoor, net klaar met deadlifts. Jij ook al getraind?'
FROM chat_conversations c 
WHERE (c.participant1_id = '550e8400-e29b-41d4-a716-446655440004' AND c.participant2_id = '821f4716-abfa-4b1e-90db-547a0b2231b0')
   OR (c.participant1_id = '821f4716-abfa-4b1e-90db-547a0b2231b0' AND c.participant2_id = '550e8400-e29b-41d4-a716-446655440004')
LIMIT 1;

INSERT INTO chat_messages (conversation_id, sender_id, content) 
SELECT 
  c.id,
  '550e8400-e29b-41d4-a716-446655440004', -- Thomas (Chiel)
  'Ja man, net klaar met squats! Voel me als een beest 💪🔥'
FROM chat_conversations c 
WHERE (c.participant1_id = '550e8400-e29b-41d4-a716-446655440004' AND c.participant2_id = '821f4716-abfa-4b1e-90db-547a0b2231b0')
   OR (c.participant1_id = '821f4716-abfa-4b1e-90db-547a0b2231b0' AND c.participant2_id = '550e8400-e29b-41d4-a716-446655440004')
LIMIT 1;

COMMIT;
