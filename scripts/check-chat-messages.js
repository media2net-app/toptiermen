const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkChatMessages() {
  console.log('🔍 Checking chat messages in database...\n');

  try {
    // Check conversations
    console.log('1️⃣ Checking conversations...');
    const { data: conversations, error: convError } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('created_at', { ascending: false });

    if (convError) {
      console.error('❌ Error fetching conversations:', convError);
    } else {
      console.log(`✅ Found ${conversations.length} conversations`);
      if (conversations.length > 0) {
        console.log('📋 Conversations:');
        conversations.forEach((conv, index) => {
          console.log(`   ${index + 1}. ID: ${conv.id}`);
          console.log(`      Participants: ${conv.participant1_id} <-> ${conv.participant2_id}`);
          console.log(`      Created: ${conv.created_at}`);
          console.log(`      Last message: ${conv.last_message_at}`);
          console.log('');
        });
      }
    }

    // Check messages
    console.log('2️⃣ Checking messages...');
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (msgError) {
      console.error('❌ Error fetching messages:', msgError);
    } else {
      console.log(`✅ Found ${messages.length} messages`);
      if (messages.length > 0) {
        console.log('💬 Messages:');
        messages.forEach((msg, index) => {
          console.log(`   ${index + 1}. ID: ${msg.id}`);
          console.log(`      Conversation: ${msg.conversation_id}`);
          console.log(`      Sender: ${msg.sender_id}`);
          console.log(`      Content: "${msg.content}"`);
          console.log(`      Created: ${msg.created_at}`);
          console.log(`      Read: ${msg.is_read}`);
          console.log('');
        });
      }
    }

    // Check online status
    console.log('3️⃣ Checking online status...');
    const { data: onlineStatus, error: statusError } = await supabase
      .from('user_online_status')
      .select('*');

    if (statusError) {
      console.error('❌ Error fetching online status:', statusError);
    } else {
      console.log(`✅ Found ${onlineStatus.length} online status records`);
      if (onlineStatus.length > 0) {
        console.log('🟢 Online status:');
        onlineStatus.forEach((status, index) => {
          console.log(`   ${index + 1}. User: ${status.user_id}`);
          console.log(`      Online: ${status.is_online}`);
          console.log(`      Last seen: ${status.last_seen}`);
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkChatMessages();
