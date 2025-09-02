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

async function testChatSystem() {
  console.log('🧪 Testing Chat System...\n');

  try {
    // 1. Check if chat tables exist
    console.log('📋 Checking chat tables...');
    
    const { data: conversations, error: convError } = await supabase
      .from('chat_conversations')
      .select('*')
      .limit(1);
    
    if (convError) {
      console.error('❌ chat_conversations table not found:', convError.message);
      return;
    }
    console.log('✅ chat_conversations table exists');

    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);
    
    if (msgError) {
      console.error('❌ chat_messages table not found:', msgError.message);
      return;
    }
    console.log('✅ chat_messages table exists');

    // 2. Check if users exist
    console.log('\n👥 Checking users...');
    
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.error('❌ No users found in profiles table');
      return;
    }
    
    console.log(`✅ Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ${user.display_name || user.full_name} (${user.id})`);
    });

    // 3. Check for existing conversations
    console.log('\n💬 Checking existing conversations...');
    
    const { data: existingConversations, error: convCheckError } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        participant1:profiles!chat_conversations_participant1_id_fkey(display_name, full_name),
        participant2:profiles!chat_conversations_participant2_id_fkey(display_name, full_name)
      `)
      .limit(5);
    
    if (convCheckError) {
      console.error('❌ Error checking conversations:', convCheckError.message);
    } else if (existingConversations && existingConversations.length > 0) {
      console.log(`✅ Found ${existingConversations.length} existing conversations:`);
      existingConversations.forEach(conv => {
        const p1 = conv.participant1?.display_name || conv.participant1?.full_name || 'Unknown';
        const p2 = conv.participant2?.display_name || conv.participant2?.full_name || 'Unknown';
        console.log(`   - ${p1} ↔ ${p2} (${conv.id})`);
      });
    } else {
      console.log('ℹ️  No existing conversations found');
    }

    // 4. Test creating a conversation between first two users
    if (users.length >= 2) {
      console.log('\n🔗 Testing conversation creation...');
      
      const user1 = users[0];
      const user2 = users[1];
      
      console.log(`   Creating conversation between ${user1.display_name || user1.full_name} and ${user2.display_name || user2.full_name}...`);
      
      const { data: newConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          participant1_id: user1.id,
          participant2_id: user2.id
        })
        .select()
        .single();
      
      if (createError) {
        if (createError.code === '23505') { // Unique constraint violation
          console.log('ℹ️  Conversation already exists between these users');
        } else {
          console.error('❌ Error creating conversation:', createError.message);
        }
      } else {
        console.log(`✅ Created conversation: ${newConversation.id}`);
        
        // 5. Test sending a message
        console.log('\n📝 Testing message sending...');
        
        const { data: newMessage, error: messageError } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: newConversation.id,
            sender_id: user1.id,
            content: 'Hey! Dit is een test bericht van het chat systeem! 🚀'
          })
          .select()
          .single();
        
        if (messageError) {
          console.error('❌ Error sending message:', messageError.message);
        } else {
          console.log(`✅ Sent message: ${newMessage.id}`);
          console.log(`   Content: "${newMessage.content}"`);
        }
      }
    }

    // 6. Check RLS policies
    console.log('\n🔒 Checking RLS policies...');
    
    const { data: policies, error: policyError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies 
        WHERE tablename IN ('chat_conversations', 'chat_messages', 'user_online_status', 'chat_notifications')
        ORDER BY tablename, policyname;
      `
    });
    
    if (policyError) {
      console.log('ℹ️  Could not check RLS policies (requires admin access)');
    } else if (policies && policies.length > 0) {
      console.log(`✅ Found ${policies.length} RLS policies:`);
      policies.forEach(policy => {
        console.log(`   - ${policy.tablename}: ${policy.policyname} (${policy.cmd})`);
      });
    }

    console.log('\n🎉 Chat system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testChatSystem();
