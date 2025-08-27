const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserNames() {
  try {
    console.log('🔍 Checking user names in database...\n');

    // Check profiles table
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, rank, points, missions_completed');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    console.log('📊 Users in database:');
    users.forEach(user => {
      console.log(`\n👤 User ID: ${user.id}`);
      console.log(`   - full_name: "${user.full_name}"`);
      console.log(`   - email: ${user.email}`);
      console.log(`   - rank: ${user.rank}`);
      console.log(`   - points: ${user.points}`);
      console.log(`   - missions_completed: ${user.missions_completed}`);
    });

    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, display_name, email, rank, points, missions_completed');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log('\n📊 Profiles in database:');
      profiles.forEach(profile => {
        console.log(`\n👤 Profile ID: ${profile.id}`);
        console.log(`   - full_name: "${profile.full_name}"`);
        console.log(`   - display_name: "${profile.display_name}"`);
        console.log(`   - email: ${profile.email}`);
        console.log(`   - rank: ${profile.rank}`);
        console.log(`   - points: ${profile.points}`);
        console.log(`   - missions_completed: ${profile.missions_completed}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserNames(); 