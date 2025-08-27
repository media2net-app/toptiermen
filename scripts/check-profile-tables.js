require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfileTables() {
  console.log('🔍 Checking profile tables and data structure...\n');

  try {
    // Check profiles table
    console.log('1️⃣ Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`📊 Found ${profiles?.length || 0} profiles`);
      profiles?.forEach((profile, index) => {
        const name = profile.display_name || profile.full_name || 'Unknown';
        console.log(`   ${index + 1}. ${name} (${profile.email}) - ID: ${profile.id}`);
      });
    }

    // Check profiles table
    console.log('\n2️⃣ Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log(`📊 Found ${users?.length || 0} users`);
      users?.forEach((user, index) => {
        const name = user.full_name || user.email || 'Unknown';
        console.log(`   ${index + 1}. ${name} (${user.email}) - ID: ${user.id}`);
      });
    }

    // Check auth.profiles table (if accessible)
    console.log('\n3️⃣ Checking auth.users table...');
    try {
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('*')
        .order('created_at', { ascending: false });

      if (authError) {
        console.log('❌ Error fetching auth.users:', authError.message);
      } else {
        console.log(`📊 Found ${authUsers?.length || 0} auth users`);
        authUsers?.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} - ID: ${user.id}`);
        });
      }
    } catch (error) {
      console.log('❌ Cannot access auth.users table:', error.message);
    }

    // Check which table the API is actually using
    console.log('\n4️⃣ Checking which table the API uses...');
    console.log('Looking at the API code, it uses the "profiles" table');
    
    // Check if the new profiles we created are in the right table
    const newProfileIds = [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002', 
      '550e8400-e29b-41d4-a716-446655440003',
      '550e8400-e29b-41d4-a716-446655440004'
    ];

    console.log('\n5️⃣ Checking if new profiles exist in profiles table...');
    for (const profileId of newProfileIds) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        console.log(`❌ Profile ${profileId} not found in profiles table:`, error.message);
      } else {
        const name = profile.display_name || profile.full_name || 'Unknown';
        console.log(`✅ Profile ${profileId} found: ${name} (${profile.email})`);
      }
    }

    // Check the actual table structure
    console.log('\n6️⃣ Checking profiles table structure...');
    if (profiles && profiles.length > 0) {
      const firstProfile = profiles[0];
      console.log('📋 Profiles table columns:');
      Object.keys(firstProfile).forEach(key => {
        console.log(`   - ${key}: ${typeof firstProfile[key]}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkProfileTables();
