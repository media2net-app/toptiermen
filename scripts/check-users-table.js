const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsersTable() {
  try {
    console.log('🔍 Checking users table structure...');
    
    // Check table structure
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (error) {
      console.error('❌ Error checking table structure:', error);
      return;
    }

    console.log('📋 Users table columns:');
    console.table(data);
    
    // Check if rank column exists
    const hasRankColumn = data.some(col => col.column_name === 'rank');
    
    if (hasRankColumn) {
      console.log('⚠️  Rank column still exists in users table');
    } else {
      console.log('✅ Rank column successfully removed from users table');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsersTable(); 