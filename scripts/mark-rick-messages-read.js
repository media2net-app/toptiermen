require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function markRickMessagesAsRead() {
  console.log('📖 Marking Rick messages as read for Chiel...\n');

  try {
    // Get Rick and Chiel's user IDs
    const rickId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';
    const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

    console.log('1️⃣ Finding conversation between Rick and Chiel...');
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('*')
      .or(`and(participant1_id.eq.${rickId},participant2_id.eq.${chielId}),and(participant1_id.eq.${chielId},participant2_id.eq.${rickId})`)
      .eq('is_active', true)
      .single();

    if (convError || !conversation) {
      console.error('❌ No conversation found between Rick and Chiel');
      return;
    }

    console.log(`✅ Found conversation: ${conversation.id}`);

    // Find all unread messages from Rick to Chiel
    console.log('\n2️⃣ Finding unread messages from Rick...');
    const { data: unreadMessages, error: msgError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .eq('sender_id', rickId)
      .eq('is_read', false);

    if (msgError) {
      console.error('❌ Error finding unread messages:', msgError);
      return;
    }

    console.log(`✅ Found ${unreadMessages?.length || 0} unread messages from Rick`);

    if (!unreadMessages || unreadMessages.length === 0) {
      console.log('✅ No unread messages to mark as read');
      return;
    }

    // Mark all unread messages as read
    console.log('\n3️⃣ Marking messages as read...');
    const messageIds = unreadMessages.map(msg => msg.id);
    
    const { data: updatedMessages, error: updateError } = await supabase
      .from('chat_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .in('id', messageIds)
      .select();

    if (updateError) {
      console.error('❌ Error marking messages as read:', updateError);
      return;
    }

    console.log(`✅ Successfully marked ${updatedMessages?.length || 0} messages as read`);
    
    // Show the messages that were marked as read
    console.log('\n📝 Messages marked as read:');
    updatedMessages?.forEach((msg, index) => {
      console.log(`   ${index + 1}. "${msg.content}" (${new Date(msg.created_at).toLocaleString()})`);
    });

    console.log('\n🎯 All Rick messages have been marked as read!');
    console.log('📱 Refresh your inbox to see the updated unread count');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

markRickMessagesAsRead();
