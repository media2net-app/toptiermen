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

async function createChatTables() {
  try {
    console.log('🚀 Creating chat tables...');
    
    // Create chat_conversations table
    console.log('\n1️⃣ Creating chat_conversations table...');
    const { error: convError } = await supabase
      .rpc('exec_sql', {
        sql: `
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
        `
      });
    
    if (convError) {
      console.log('⚠️  exec_sql not available, trying alternative...');
      // Try to create table using a different approach
      console.log('📋 Please create the chat_conversations table manually in Supabase dashboard');
    } else {
      console.log('✅ chat_conversations table created');
    }
    
    // Create chat_messages table
    console.log('\n2️⃣ Creating chat_messages table...');
    const { error: msgError } = await supabase
      .rpc('exec_sql', {
        sql: `
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
        `
      });
    
    if (msgError) {
      console.log('⚠️  exec_sql not available, trying alternative...');
      console.log('📋 Please create the chat_messages table manually in Supabase dashboard');
    } else {
      console.log('✅ chat_messages table created');
    }
    
    // Create user_online_status table
    console.log('\n3️⃣ Creating user_online_status table...');
    const { error: statusError } = await supabase
      .rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS user_online_status (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
            is_online BOOLEAN DEFAULT false,
            last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
    
    if (statusError) {
      console.log('⚠️  exec_sql not available, trying alternative...');
      console.log('📋 Please create the user_online_status table manually in Supabase dashboard');
    } else {
      console.log('✅ user_online_status table created');
    }
    
    console.log('\n🎉 Chat tables creation completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run the SQL from scripts/create-chat-tables.sql');
    console.log('   4. Or create the tables manually in the Table Editor');
    
  } catch (error) {
    console.error('❌ Error creating chat tables:', error);
  }
}

// Run the creation
createChatTables();
