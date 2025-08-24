const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChatTables() {
  try {
    console.log('🧪 Testing chat tables...');
    
    // Test 1: Check if profiles table exists and has data
    console.log('\n1️⃣ Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError);
    } else {
      console.log(`✅ Profiles table OK - Found ${profiles?.length || 0} profiles`);
      if (profiles && profiles.length > 0) {
        console.log('   Sample profiles:', profiles.map(p => p.display_name || p.full_name));
      }
    }
    
    // Test 2: Check if chat_conversations table exists
    console.log('\n2️⃣ Testing chat_conversations table...');
    const { data: conversations, error: convError } = await supabase
      .from('chat_conversations')
      .select('id')
      .limit(1);
    
    if (convError) {
      console.error('❌ Chat conversations table error:', convError);
      console.log('💡 This table might not exist yet. Run setup-chat-tables.js first.');
    } else {
      console.log(`✅ Chat conversations table OK - Found ${conversations?.length || 0} conversations`);
    }
    
    // Test 3: Check if chat_messages table exists
    console.log('\n3️⃣ Testing chat_messages table...');
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1);
    
    if (msgError) {
      console.error('❌ Chat messages table error:', msgError);
      console.log('💡 This table might not exist yet. Run setup-chat-tables.js first.');
    } else {
      console.log(`✅ Chat messages table OK - Found ${messages?.length || 0} messages`);
    }
    
    // Test 4: Check if user_online_status table exists
    console.log('\n4️⃣ Testing user_online_status table...');
    const { data: onlineStatus, error: statusError } = await supabase
      .from('user_online_status')
      .select('id')
      .limit(1);
    
    if (statusError) {
      console.error('❌ User online status table error:', statusError);
      console.log('💡 This table might not exist yet. Run setup-chat-tables.js first.');
    } else {
      console.log(`✅ User online status table OK - Found ${onlineStatus?.length || 0} status records`);
    }
    
    console.log('\n🎯 Test completed!');
    
  } catch (error) {
    console.error('❌ Error testing chat tables:', error);
  }
}

// Run the test
testChatTables();
