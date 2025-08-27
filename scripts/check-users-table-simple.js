const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsersTable() {
  try {
    console.log('🔍 Checking if rank column exists in users table...');
    
    // Try to select from profiles table to see what columns exist
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (userError) {
      console.error('❌ Error querying users table:', userError);
      return;
    }

    if (userData && userData.length > 0) {
      const columns = Object.keys(userData[0]);
      console.log('📋 Available columns in users table:');
      columns.forEach(col => console.log(`   - ${col}`));
      
      if (columns.includes('rank')) {
        console.log('⚠️  Rank column still exists in users table');
      } else {
        console.log('✅ Rank column successfully removed from users table');
      }
    } else {
      console.log('ℹ️  Users table is empty, checking table structure via profiles...');
      
      // Fallback: check via profiles table which should have similar structure
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
        
      if (profileData && profileData.length > 0) {
        const profileColumns = Object.keys(profileData[0]);
        console.log('📋 Available columns in profiles table:');
        profileColumns.forEach(col => console.log(`   - ${col}`));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsersTable(); 