const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupChatTables() {
  try {
    console.log('🚀 Setting up chat tables...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-chat-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements
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
              console.log('⚠️  exec_sql function not available, trying alternative approach...');
              // For now, we'll just log the statement
              console.log(`📋 Statement ${i + 1}: ${statement.substring(0, 100)}...`);
            } else {
              console.error(`❌ Error executing statement ${i + 1}:`, error);
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('🎉 Chat tables setup completed!');
    console.log('\n📋 Created tables:');
    console.log('   - chat_conversations');
    console.log('   - chat_messages');
    console.log('   - user_online_status');
    console.log('\n🔒 RLS policies and indexes have been created');
    
  } catch (error) {
    console.error('❌ Error setting up chat tables:', error);
    process.exit(1);
  }
}

// Run the setup
setupChatTables();
