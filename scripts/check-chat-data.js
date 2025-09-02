const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkChatData() {
  console.log('🔍 Checking Chat Data and Notifications...\n');

  try {
    // 1. Check conversations
    console.log('📱 Conversations:');
    const { data: conversations, error: convError } = await supabase
      .from('chat_conversations')
      .select('*');
    
    if (convError) {
      console.error('❌ Error fetching conversations:', convError.message);
    } else {
      conversations.forEach(conv => {
        console.log(`   - ID: ${conv.id}`);
        console.log(`     Participant 1: ${conv.participant1_id}`);
        console.log(`     Participant 2: ${conv.participant2_id}`);
        console.log(`     Created: ${conv.created_at}`);
        console.log(`     Last message: ${conv.last_message_at}`);
        console.log('');
      });
    }

    // 2. Check messages
    console.log('💬 Messages:');
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (msgError) {
      console.error('❌ Error fetching messages:', msgError.message);
    } else {
      messages.forEach(msg => {
        console.log(`   - ID: ${msg.id}`);
        console.log(`     Conversation: ${msg.conversation_id}`);
        console.log(`     Sender: ${msg.sender_id}`);
        console.log(`     Content: ${msg.content.substring(0, 50)}...`);
        console.log(`     Is Read: ${msg.is_read}`);
        console.log(`     Created: ${msg.created_at}`);
        console.log('');
      });
    }

    // 3. Check notifications
    console.log('🔔 Chat Notifications:');
    const { data: notifications, error: notifError } = await supabase
      .from('chat_notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (notifError) {
      console.error('❌ Error fetching notifications:', notifError.message);
    } else {
      if (notifications.length === 0) {
        console.log('   ℹ️  No chat notifications found');
      } else {
        notifications.forEach(notif => {
          console.log(`   - ID: ${notif.id}`);
          console.log(`     User ID: ${notif.user_id}`);
          console.log(`     Conversation: ${notif.conversation_id}`);
          console.log(`     Message: ${notif.message_id}`);
          console.log(`     Is Read: ${notif.is_read}`);
          console.log(`     Created: ${notif.created_at}`);
          console.log('');
        });
      }
    }

    // 4. Check user IDs mapping
    console.log('👥 User ID Mapping:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, email')
      .in('id', ['550e8400-e29b-41d4-a716-446655440004', '821f4716-abfa-4b1e-90db-547a0b2231b0']);
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
    } else {
      profiles.forEach(profile => {
        console.log(`   - ${profile.id}: ${profile.display_name || profile.full_name} (${profile.email})`);
      });
    }

    // 5. Test notification creation logic
    console.log('\n🧪 Testing Notification Logic:');
    
    // Find a conversation between Chiel and Rick
    const chielRickConv = conversations?.find(conv => 
      (conv.participant1_id === '550e8400-e29b-41d4-a716-446655440004' && 
       conv.participant2_id === '821f4716-abfa-4b1e-90db-547a0b2231b0') ||
      (conv.participant1_id === '821f4716-abfa-4b1e-90db-547a0b2231b0' && 
       conv.participant2_id === '550e8400-e29b-41d4-a716-446655440004')
    );

    if (chielRickConv) {
      console.log(`   Found conversation: ${chielRickConv.id}`);
      
      // Find messages in this conversation
      const convMessages = messages?.filter(msg => msg.conversation_id === chielRickConv.id);
      console.log(`   Messages in conversation: ${convMessages?.length || 0}`);
      
      if (convMessages && convMessages.length > 0) {
        const latestMessage = convMessages[0]; // Most recent
        console.log(`   Latest message: "${latestMessage.content}" from ${latestMessage.sender_id}`);
        
        // Check if notification was created for the other participant
        const otherParticipantId = latestMessage.sender_id === '550e8400-e29b-41d4-a716-446655440004' 
          ? '821f4716-abfa-4b1e-90db-547a0b2231b0' 
          : '550e8400-e29b-41d4-a716-446655440004';
        
        console.log(`   Other participant should be: ${otherParticipantId}`);
        
        const notificationForOther = notifications?.find(notif => 
          notif.user_id === otherParticipantId && 
          notif.conversation_id === chielRickConv.id &&
          notif.message_id === latestMessage.id
        );
        
        if (notificationForOther) {
          console.log(`   ✅ Notification found for other participant`);
        } else {
          console.log(`   ❌ No notification found for other participant`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkChatData();
