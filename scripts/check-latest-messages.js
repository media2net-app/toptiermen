require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLatestMessages() {
  console.log('🔍 Checking latest messages in Rick-Chiel conversation...\n');

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

    // Get all messages in the conversation, ordered by creation time
    console.log('\n2️⃣ Fetching all messages in conversation...');
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('❌ Error fetching messages:', msgError);
      return;
    }

    console.log(`✅ Found ${messages?.length || 0} total messages`);

    if (!messages || messages.length === 0) {
      console.log('❌ No messages found in conversation');
      return;
    }

    // Show the last 10 messages
    console.log('\n📝 Last 10 messages in conversation:');
    const lastMessages = messages.slice(-10);
    
    lastMessages.forEach((msg, index) => {
      const sender = msg.sender_id === rickId ? 'Rick' : 'Chiel';
      const isRead = msg.is_read ? '✅' : '❌';
      const time = new Date(msg.created_at).toLocaleString();
      console.log(`   ${index + 1}. [${sender}] ${isRead} "${msg.content}" (${time})`);
    });

    // Check for unread messages
    const unreadMessages = messages.filter(msg => !msg.is_read && msg.sender_id === rickId);
    console.log(`\n📊 Unread messages from Rick: ${unreadMessages.length}`);

    if (unreadMessages.length > 0) {
      console.log('📝 Unread messages:');
      unreadMessages.forEach((msg, index) => {
        const time = new Date(msg.created_at).toLocaleString();
        console.log(`   ${index + 1}. "${msg.content}" (${time})`);
      });
    }

    // Check conversation last update
    console.log(`\n🕒 Conversation last updated: ${new Date(conversation.updated_at).toLocaleString()}`);
    console.log(`🕒 Conversation last message at: ${new Date(conversation.last_message_at).toLocaleString()}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkLatestMessages();
