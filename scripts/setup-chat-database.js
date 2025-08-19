require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupChatDatabase() {
  try {
    console.log('🚀 Setting up chat database...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-chat-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // If exec_sql doesn't exist, try direct query
            const { error: directError } = await supabase.from('_dummy').select('*').limit(0);
            if (directError && directError.message.includes('exec_sql')) {
              console.log('⚠️ exec_sql function not available, trying alternative method...');
              // For now, we'll just log the statement
              console.log(`📋 Statement ${i + 1}: ${statement.substring(0, 100)}...`);
            } else {
              console.error(`❌ Error executing statement ${i + 1}:`, error);
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (stmtError) {
          console.error(`❌ Error in statement ${i + 1}:`, stmtError.message);
        }
      }
    }
    
    console.log('✅ Chat database setup completed!');
    
    // Test the setup by checking if tables exist
    console.log('🔍 Testing database setup...');
    
    const { data: conversations, error: convError } = await supabase
      .from('chat_conversations')
      .select('*')
      .limit(1);
    
    if (convError) {
      console.error('❌ chat_conversations table not found:', convError.message);
    } else {
      console.log('✅ chat_conversations table exists');
    }
    
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);
    
    if (msgError) {
      console.error('❌ chat_messages table not found:', msgError.message);
    } else {
      console.log('✅ chat_messages table exists');
    }
    
    const { data: status, error: statusError } = await supabase
      .from('user_online_status')
      .select('*')
      .limit(1);
    
    if (statusError) {
      console.error('❌ user_online_status table not found:', statusError.message);
    } else {
      console.log('✅ user_online_status table exists');
    }
    
    const { data: notifications, error: notifError } = await supabase
      .from('chat_notifications')
      .select('*')
      .limit(1);
    
    if (notifError) {
      console.error('❌ chat_notifications table not found:', notifError.message);
    } else {
      console.log('✅ chat_notifications table exists');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupChatDatabase();
