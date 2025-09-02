-- Fix chat notifications system
-- This script recreates the chat_notifications table and fixes the triggers

-- Drop existing table if it exists
DROP TABLE IF EXISTS chat_notifications CASCADE;

-- Recreate chat_notifications table
CREATE TABLE chat_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON chat_notifications;
CREATE POLICY "Users can view their own notifications" ON chat_notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON chat_notifications;
CREATE POLICY "Users can update their own notifications" ON chat_notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_notifications_user ON chat_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_conversation ON chat_notifications(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_notifications_message ON chat_notifications(message_id);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_notification_on_message ON chat_messages;

-- Recreate the trigger function
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  other_participant UUID;
BEGIN
  -- Find the other participant in the conversation
  SELECT 
    CASE 
      WHEN participant1_id = NEW.sender_id THEN participant2_id
      ELSE participant1_id
    END INTO other_participant
  FROM chat_conversations
  WHERE id = NEW.conversation_id;
  
  -- Only create notification if we found the other participant
  IF other_participant IS NOT NULL THEN
    -- Insert notification for the other participant
    INSERT INTO chat_notifications (user_id, conversation_id, message_id)
    VALUES (other_participant, NEW.conversation_id, NEW.id);
    
    RAISE NOTICE 'Created notification for user % from message %', other_participant, NEW.id;
  ELSE
    RAISE WARNING 'Could not find other participant for conversation %', NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER create_notification_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- Test the trigger by inserting a test message
-- This will create a notification for the other participant
INSERT INTO chat_messages (conversation_id, sender_id, content) 
SELECT 
  c.id,
  '821f4716-abfa-4b1e-90db-547a0b2231b0', -- Joost (Rick)
  'Hey Chiel! Ik heb net een notificatie ontvangen van jouw bericht! 🎉'
FROM chat_conversations c 
WHERE (c.participant1_id = '550e8400-e29b-41d4-a716-446655440004' AND c.participant2_id = '821f4716-abfa-4b1e-90db-547a0b2231b0')
   OR (c.participant1_id = '821f4716-abfa-4b1e-90db-547a0b2231b0' AND c.participant2_id = '550e8400-e29b-41d4-a716-446655440004')
LIMIT 1;

COMMIT;
