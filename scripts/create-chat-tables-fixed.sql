-- Create chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    participant2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(participant1_id, participant2_id)
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user online status table
CREATE TABLE IF NOT EXISTS user_online_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_conversations_participants') THEN
        CREATE INDEX idx_chat_conversations_participants ON chat_conversations(participant1_id, participant2_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_conversation') THEN
        CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_sender') THEN
        CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_created_at') THEN
        CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_online_status_user_id') THEN
        CREATE INDEX idx_user_online_status_user_id ON user_online_status(user_id);
    END IF;
END $$;

-- Enable RLS (Row Level Security)
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_online_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat_conversations (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users can view conversations they participate in') THEN
        CREATE POLICY "Users can view conversations they participate in" ON chat_conversations
            FOR SELECT USING (
                auth.uid() = participant1_id OR auth.uid() = participant2_id
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users can create conversations') THEN
        CREATE POLICY "Users can create conversations" ON chat_conversations
            FOR INSERT WITH CHECK (
                auth.uid() = participant1_id OR auth.uid() = participant2_id
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_conversations' AND policyname = 'Users can update conversations they participate in') THEN
        CREATE POLICY "Users can update conversations they participate in" ON chat_conversations
            FOR UPDATE USING (
                auth.uid() = participant1_id OR auth.uid() = participant2_id
            );
    END IF;
END $$;

-- Create RLS policies for chat_messages (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can view messages in their conversations') THEN
        CREATE POLICY "Users can view messages in their conversations" ON chat_messages
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM chat_conversations 
                    WHERE id = conversation_id 
                    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can send messages in their conversations') THEN
        CREATE POLICY "Users can send messages in their conversations" ON chat_messages
            FOR INSERT WITH CHECK (
                sender_id = auth.uid() AND
                EXISTS (
                    SELECT 1 FROM chat_conversations 
                    WHERE id = conversation_id 
                    AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can update their own messages') THEN
        CREATE POLICY "Users can update their own messages" ON chat_messages
            FOR UPDATE USING (sender_id = auth.uid());
    END IF;
END $$;

-- Create RLS policies for user_online_status (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_online_status' AND policyname = 'Users can view online status') THEN
        CREATE POLICY "Users can view online status" ON user_online_status
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_online_status' AND policyname = 'Users can update their own online status') THEN
        CREATE POLICY "Users can update their own online status" ON user_online_status
            FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_online_status' AND policyname = 'Users can update their own online status update') THEN
        CREATE POLICY "Users can update their own online status update" ON user_online_status
            FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- Create function to update conversation's last_message_at (only if it doesn't exist)
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_conversations 
    SET last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_message_at (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversation_last_message_trigger') THEN
        CREATE TRIGGER update_conversation_last_message_trigger
            AFTER INSERT ON chat_messages
            FOR EACH ROW
            EXECUTE FUNCTION update_conversation_last_message();
    END IF;
END $$;
