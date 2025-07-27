const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfilesTable() {
  try {
    console.log('🔍 Checking profiles table structure...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profileError) {
      console.error('❌ Error querying profiles table:', profileError);
      return;
    }

    if (profileData && profileData.length > 0) {
      const columns = Object.keys(profileData[0]);
      console.log('📋 Available columns in profiles table:');
      columns.forEach(col => console.log(`   - ${col}`));
      
      if (columns.includes('badges')) {
        console.log('✅ Badges column exists in profiles table');
      } else {
        console.log('❌ Badges column missing from profiles table');
      }
      
      if (columns.includes('rank')) {
        console.log('✅ Rank column exists in profiles table');
      } else {
        console.log('❌ Rank column missing from profiles table');
      }
    } else {
      console.log('ℹ️  Profiles table is empty');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkProfilesTable(); 