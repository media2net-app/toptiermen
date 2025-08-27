const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugLedenbeheer() {
  console.log('🔍 Debugging ledenbeheer query...');
  
  // Test 1: Simple users query
  console.log('\n📋 Test 1: Simple users query');
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('*');
  
  if (usersError) {
    console.error('❌ Users query error:', usersError);
  } else {
    console.log('✅ Users found:', users.length);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}`);
      console.log(`    Name: ${user.full_name}`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Status: ${user.status}`);
      console.log(`    Created: ${user.created_at}`);
      console.log('');
    });
  }
  
  // Test 2: Profiles query
  console.log('\n📋 Test 2: Profiles query');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
  
  if (profilesError) {
    console.error('❌ Profiles query error:', profilesError);
  } else {
    console.log('✅ Profiles found:', profiles.length);
    profiles.forEach(profile => {
      console.log(`  - ID: ${profile.id}`);
      console.log(`    Name: ${profile.full_name}`);
      console.log(`    Rank: ${profile.rank}`);
      console.log(`    Points: ${profile.points}`);
      console.log('');
    });
  }
  
  // Test 3: Combined query (like the page uses)
  console.log('\n📋 Test 3: Combined query');
  const { data: combined, error: combinedError } = await supabase
    .from('profiles')
    .select(`
      *,
      profiles(*)
    `)
    .order('created_at', { ascending: false });
  
  if (combinedError) {
    console.error('❌ Combined query error:', combinedError);
  } else {
    console.log('✅ Combined data found:', combined.length);
    combined.forEach(user => {
      console.log(`  - User ID: ${user.id}`);
      console.log(`    User Name: ${user.full_name}`);
      console.log(`    Profile: ${user.profiles ? 'Yes' : 'No'}`);
      if (user.profiles) {
        console.log(`    Profile Name: ${user.profiles.full_name}`);
        console.log(`    Profile Rank: ${user.profiles.rank}`);
      }
      console.log('');
    });
  }
}

debugLedenbeheer().catch(console.error); 