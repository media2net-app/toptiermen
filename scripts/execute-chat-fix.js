const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeChatFix() {
  console.log('🔧 Executing chat table fix...\n');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('scripts/fix-chat-foreign-keys.sql', 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          // Continue with next statement
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, err.message);
        // Continue with next statement
      }
    }

    console.log('\n🎉 Chat table fix completed!');
    
    // Test the system again
    console.log('\n🧪 Testing the fixed system...');
    
    const { data: conversations, error: convError } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        participant1:profiles!chat_conversations_participant1_id_fkey(display_name, full_name),
        participant2:profiles!chat_conversations_participant2_id_fkey(display_name, full_name)
      `)
      .limit(5);
    
    if (convError) {
      console.error('❌ Still having issues with foreign keys:', convError.message);
    } else {
      console.log('✅ Foreign key relationships working!');
      if (conversations && conversations.length > 0) {
        console.log(`📱 Found ${conversations.length} conversations:`);
        conversations.forEach(conv => {
          const p1 = conv.participant1?.display_name || conv.participant1?.full_name || 'Unknown';
          const p2 = conv.participant2?.display_name || conv.participant2?.full_name || 'Unknown';
          console.log(`   - ${p1} ↔ ${p2} (${conv.id})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
executeChatFix();
