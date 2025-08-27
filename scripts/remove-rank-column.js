const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeRankColumn() {
  try {
    console.log('🗑️  Removing rank column from users table...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE users DROP COLUMN IF EXISTS rank;'
    });

    if (error) {
      console.error('❌ Error removing rank column:', error);
      return;
    }

    console.log('✅ SQL executed successfully');
    
    // Verify the column has been removed
    console.log('🔍 Verifying column removal...');
    
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (userError) {
      console.error('❌ Error verifying removal:', userError);
      return;
    }

    if (userData && userData.length > 0) {
      const columns = Object.keys(userData[0]);
      
      if (columns.includes('rank')) {
        console.log('⚠️  Rank column still exists');
      } else {
        console.log('✅ Rank column successfully removed!');
        console.log('📋 Remaining columns:', columns.join(', '));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

removeRankColumn(); 