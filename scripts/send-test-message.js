require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendTestMessage() {
  console.log('📨 Sending test message from Rick to Chiel...\n');

  try {
    // Get Rick and Chiel's user IDs
    const rickId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';
    const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

    console.log('1️⃣ Getting conversation between Rick and Chiel...');
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

    // Send test message from Rick to Chiel
    console.log('\n2️⃣ Sending test message...');
    const testMessage = `🧪 Test bericht - Real-time chat test! Tijd: ${new Date().toLocaleTimeString()}`;
    
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: rickId, // Rick is the sender
        content: testMessage,
        message_type: 'text'
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Error sending message:', messageError);
      return;
    }

    console.log(`✅ Test message sent successfully!`);
    console.log(`   Message ID: ${message.id}`);
    console.log(`   Content: "${testMessage}"`);
    console.log(`   Time: ${new Date(message.created_at).toLocaleString()}`);

    console.log('\n🎯 Test message sent!');
    console.log('📱 Check your inbox to see if it appears automatically');
    console.log('🔔 If real-time updates work, you should see it without refreshing!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

sendTestMessage();
