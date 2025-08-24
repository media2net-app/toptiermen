require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testChatNotifications() {
  console.log('🧪 Testing Chat Notifications...\n');

  try {
    // Get all users
    console.log('1️⃣ Getting users...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name')
      .limit(5);

    if (usersError) {
      console.error('❌ Error getting users:', usersError);
      return;
    }

    console.log(`✅ Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.display_name || user.full_name} (${user.id})`);
    });

    if (users.length < 2) {
      console.log('❌ Need at least 2 users to test chat notifications');
      return;
    }

    // Get or create a conversation between the first two users
    console.log('\n2️⃣ Getting or creating conversation...');
    const user1 = users[0];
    const user2 = users[1];

    const { data: existingConversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('*')
      .or(`and(participant1_id.eq.${user1.id},participant2_id.eq.${user2.id}),and(participant1_id.eq.${user2.id},participant2_id.eq.${user1.id})`)
      .eq('is_active', true)
      .single();

    let conversationId;
    if (existingConversation) {
      conversationId = existingConversation.id;
      console.log(`✅ Using existing conversation: ${conversationId}`);
    } else {
      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          participant1_id: user1.id,
          participant2_id: user2.id,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating conversation:', createError);
        return;
      }

      conversationId = newConversation.id;
      console.log(`✅ Created new conversation: ${conversationId}`);
    }

    // Send a test message
    console.log('\n3️⃣ Sending test message...');
    const testMessage = `🧪 Test notificatie bericht - ${new Date().toLocaleTimeString()}`;
    
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user1.id,
        content: testMessage,
        message_type: 'text'
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Error sending test message:', messageError);
      return;
    }

    console.log(`✅ Test message sent successfully!`);
    console.log(`   Message ID: ${message.id}`);
    console.log(`   Content: "${testMessage}"`);
    console.log(`   Sender: ${user1.display_name || user1.full_name}`);
    console.log(`   Recipient: ${user2.display_name || user2.full_name}`);

    // Check if recipient has push subscription
    console.log('\n4️⃣ Checking push subscriptions...');
    const { data: pushSubscription, error: pushError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user2.id)
      .single();

    if (pushError || !pushSubscription) {
      console.log('⚠️  Recipient has no push subscription');
      console.log('💡 To test push notifications:');
      console.log('   1. Log in as the recipient user');
      console.log('   2. Go to inbox and enable push notifications');
      console.log('   3. Run this test again');
    } else {
      console.log('✅ Recipient has push subscription');
      console.log('   Endpoint:', pushSubscription.endpoint.substring(0, 50) + '...');
    }

    console.log('\n🎯 Test completed!');
    console.log('📱 Check the recipient user\'s inbox for the test message');
    console.log('🔔 If push notifications are enabled, they should receive a notification');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testChatNotifications();
