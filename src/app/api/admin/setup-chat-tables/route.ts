import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up chat database tables...');

    // Create chat_conversations table
    const { error: convError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS chat_conversations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          participant1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          participant2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true,
          UNIQUE(participant1_id, participant2_id)
        );
      `
    });

    if (convError) {
      console.error('❌ Error creating chat_conversations table:', convError);
      return NextResponse.json({ error: 'Failed to create conversations table' }, { status: 500 });
    }

    // Create chat_messages table
    const { error: msgError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
          sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
          is_read BOOLEAN DEFAULT false,
          read_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (msgError) {
      console.error('❌ Error creating chat_messages table:', msgError);
      return NextResponse.json({ error: 'Failed to create messages table' }, { status: 500 });
    }

    // Create user_online_status table
    const { error: statusError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS user_online_status (
          user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          is_online BOOLEAN DEFAULT false,
          last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (statusError) {
      console.error('❌ Error creating user_online_status table:', statusError);
      return NextResponse.json({ error: 'Failed to create online status table' }, { status: 500 });
    }

    // Create chat_notifications table
    const { error: notifError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS chat_notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
          message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (notifError) {
      console.error('❌ Error creating chat_notifications table:', notifError);
      return NextResponse.json({ error: 'Failed to create notifications table' }, { status: 500 });
    }

    // Enable RLS
    await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_online_status ENABLE ROW LEVEL SECURITY;
        ALTER TABLE chat_notifications ENABLE ROW LEVEL SECURITY;
      `
    });

    // Create RLS policies
    await supabase.rpc('exec_sql', {
      sql_query: `
        DROP POLICY IF EXISTS "Users can view their own conversations" ON chat_conversations;
        CREATE POLICY "Users can view their own conversations" ON chat_conversations
          FOR SELECT USING (
            auth.uid() = participant1_id OR auth.uid() = participant2_id
          );

        DROP POLICY IF EXISTS "Users can create conversations" ON chat_conversations;
        CREATE POLICY "Users can create conversations" ON chat_conversations
          FOR INSERT WITH CHECK (
            auth.uid() = participant1_id OR auth.uid() = participant2_id
          );

        DROP POLICY IF EXISTS "Users can update their own conversations" ON chat_conversations;
        CREATE POLICY "Users can update their own conversations" ON chat_conversations
          FOR UPDATE USING (
            auth.uid() = participant1_id OR auth.uid() = participant2_id
          );
      `
    });

    await supabase.rpc('exec_sql', {
      sql_query: `
        DROP POLICY IF EXISTS "Users can view messages in their conversations" ON chat_messages;
        CREATE POLICY "Users can view messages in their conversations" ON chat_messages
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM chat_conversations 
              WHERE id = chat_messages.conversation_id 
              AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
            )
          );

        DROP POLICY IF EXISTS "Users can send messages in their conversations" ON chat_messages;
        CREATE POLICY "Users can send messages in their conversations" ON chat_messages
          FOR INSERT WITH CHECK (
            sender_id = auth.uid() AND
            EXISTS (
              SELECT 1 FROM chat_conversations 
              WHERE id = chat_messages.conversation_id 
              AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
            )
          );

        DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
        CREATE POLICY "Users can update their own messages" ON chat_messages
          FOR UPDATE USING (sender_id = auth.uid());
      `
    });

    await supabase.rpc('exec_sql', {
      sql_query: `
        DROP POLICY IF EXISTS "Users can view all online statuses" ON user_online_status;
        CREATE POLICY "Users can view all online statuses" ON user_online_status
          FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Users can update their own online status" ON user_online_status;
        CREATE POLICY "Users can update their own online status" ON user_online_status
          FOR ALL USING (user_id = auth.uid());
      `
    });

    await supabase.rpc('exec_sql', {
      sql_query: `
        DROP POLICY IF EXISTS "Users can view their own notifications" ON chat_notifications;
        CREATE POLICY "Users can view their own notifications" ON chat_notifications
          FOR SELECT USING (user_id = auth.uid());

        DROP POLICY IF EXISTS "Users can update their own notifications" ON chat_notifications;
        CREATE POLICY "Users can update their own notifications" ON chat_notifications
          FOR UPDATE USING (user_id = auth.uid());
      `
    });

    // Create helper functions
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_id UUID, user2_id UUID)
        RETURNS UUID AS $$
        DECLARE
          conversation_id UUID;
        BEGIN
          SELECT id INTO conversation_id
          FROM chat_conversations
          WHERE (participant1_id = user1_id AND participant2_id = user2_id)
             OR (participant1_id = user2_id AND participant2_id = user1_id)
          LIMIT 1;
          
          IF conversation_id IS NULL THEN
            INSERT INTO chat_conversations (participant1_id, participant2_id)
            VALUES (user1_id, user2_id)
            RETURNING id INTO conversation_id;
          END IF;
          
          RETURN conversation_id;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION mark_conversation_as_read(conv_id UUID, user_id UUID)
        RETURNS VOID AS $$
        BEGIN
          UPDATE chat_messages
          SET is_read = true, read_at = NOW()
          WHERE conversation_id = conv_id 
            AND sender_id != user_id 
            AND is_read = false;
            
          UPDATE chat_notifications
          SET is_read = true
          WHERE conversation_id = conv_id 
            AND user_id = user_id 
            AND is_read = false;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION update_user_online_status(is_online BOOLEAN)
        RETURNS VOID AS $$
        BEGIN
          INSERT INTO user_online_status (user_id, is_online, last_seen, updated_at)
          VALUES (auth.uid(), is_online, NOW(), NOW())
          ON CONFLICT (user_id)
          DO UPDATE SET
            is_online = EXCLUDED.is_online,
            last_seen = CASE WHEN EXCLUDED.is_online THEN NOW() ELSE last_seen END,
            updated_at = NOW();
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    // Create triggers
    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION update_conversation_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          UPDATE chat_conversations
          SET updated_at = NOW(), last_message_at = NOW()
          WHERE id = NEW.conversation_id;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_conversation_on_message ON chat_messages;
        CREATE TRIGGER update_conversation_on_message
          AFTER INSERT ON chat_messages
          FOR EACH ROW
          EXECUTE FUNCTION update_conversation_timestamp();
      `
    });

    await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION create_message_notification()
        RETURNS TRIGGER AS $$
        DECLARE
          other_participant UUID;
        BEGIN
          SELECT 
            CASE 
              WHEN participant1_id = NEW.sender_id THEN participant2_id
              ELSE participant1_id
            END INTO other_participant
          FROM chat_conversations
          WHERE id = NEW.conversation_id;
          
          INSERT INTO chat_notifications (user_id, conversation_id, message_id)
          VALUES (other_participant, NEW.conversation_id, NEW.id);
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS create_notification_on_message ON chat_messages;
        CREATE TRIGGER create_notification_on_message
          AFTER INSERT ON chat_messages
          FOR EACH ROW
          EXECUTE FUNCTION create_message_notification();
      `
    });

    console.log('✅ Chat database tables created successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Chat database tables created successfully' 
    });

  } catch (error) {
    console.error('❌ Error setting up chat tables:', error);
    return NextResponse.json({ 
      error: 'Failed to set up chat tables' 
    }, { status: 500 });
  }
}
