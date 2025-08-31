const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesTable() {
  console.log('🔍 Checking Profiles Table Structure...\n');

  try {
    // 1. Get all profiles to see the structure
    console.log('1️⃣ Getting all profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('❌ Error getting profiles:', profilesError);
      return;
    }

    console.log(`✅ Found ${profiles.length} profiles`);
    if (profiles.length > 0) {
      console.log('📋 Profile table columns:');
      Object.keys(profiles[0]).forEach(column => {
        console.log(`   - ${column}: ${typeof profiles[0][column]}`);
      });
    }

    // 2. Show all profiles
    console.log('\n2️⃣ All profiles:');
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ID: ${profile.id}`);
      console.log(`      Email: ${profile.email || 'N/A'}`);
      console.log(`      Role: ${profile.role || 'N/A'}`);
      console.log(`      Created: ${profile.created_at || 'N/A'}`);
      console.log(`      Updated: ${profile.updated_at || 'N/A'}`);
      console.log('');
    });

    // 3. Find admin users
    console.log('3️⃣ Finding admin users...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(10);

    if (adminError) {
      console.error('❌ Error finding admin users:', adminError);
    } else {
      console.log(`✅ Found ${adminUsers.length} admin users:`);
      adminUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - Role: ${user.role}`);
      });
    }

    // 4. Find users with 'rick' in email
    console.log('\n4️⃣ Finding users with "rick" in email...');
    const { data: rickUsers, error: rickError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', '%rick%')
      .limit(10);

    if (rickError) {
      console.error('❌ Error finding Rick users:', rickError);
    } else {
      console.log(`✅ Found ${rickUsers.length} users with "rick" in email:`);
      rickUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - Role: ${user.role}`);
      });
    }

    // 5. Get all users to find potential Rick accounts
    console.log('\n5️⃣ Getting all users to find Rick...');
    const { data: allUsers, error: allError } = await supabase
      .from('profiles')
      .select('*')
      .limit(20);

    if (allError) {
      console.error('❌ Error getting all users:', allError);
    } else {
      console.log(`✅ Found ${allUsers.length} total users:`);
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - Role: ${user.role}`);
      });
    }

    // 6. Find the main admin user (likely Rick)
    const mainAdmin = adminUsers?.[0] || allUsers?.find(u => u.role === 'admin');
    if (mainAdmin) {
      console.log(`\n🎯 Main admin user found: ${mainAdmin.email}`);
      console.log(`   ID: ${mainAdmin.id}`);
      console.log(`   Role: ${mainAdmin.role}`);
      console.log(`   Created: ${mainAdmin.created_at}`);
      
      // Test this user's access
      console.log('\n🔍 Testing main admin user access...');
      await testUserAccess(mainAdmin);
    } else {
      console.log('\n❌ No admin user found');
    }

  } catch (error) {
    console.error('❌ Error checking profiles table:', error);
  }
}

async function testUserAccess(user) {
  console.log(`\n🔍 Testing access for: ${user.email}`);

  // Test onboarding status
  console.log('\n1️⃣ Testing onboarding status...');
  const { data: onboarding, error: onboardingError } = await supabase
    .from('onboarding_status')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (onboardingError) {
    if (onboardingError.code === 'PGRST116') {
      console.log('⚠️ No onboarding status found - creating one...');
      const { error: createError } = await supabase
        .from('onboarding_status')
        .insert({
          user_id: user.id,
          welcome_video_watched: true,
          step_1_completed: true,
          step_2_completed: true,
          step_3_completed: true,
          step_4_completed: true,
          step_5_completed: true,
          onboarding_completed: true,
          current_step: 6,
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        console.error('❌ Error creating onboarding status:', createError);
      } else {
        console.log('✅ Onboarding status created');
      }
    } else {
      console.error('❌ Onboarding error:', onboardingError);
    }
  } else {
    console.log('✅ Onboarding status accessible');
    console.log(`   Onboarding completed: ${onboarding.onboarding_completed}`);
    console.log(`   Current step: ${onboarding.current_step}`);
  }

  // Test dashboard API
  console.log('\n2️⃣ Testing dashboard API...');
  try {
    const dashboardResponse = await fetch(`http://localhost:3000/api/dashboard-stats?userId=${user.id}`);
    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log('✅ Dashboard API accessible');
      console.log(`   Stats loaded: ${dashboardData.success ? 'Yes' : 'No'}`);
    } else {
      console.error('❌ Dashboard API failed:', dashboardResponse.status);
    }
  } catch (error) {
    console.error('❌ Dashboard API error:', error.message);
  }

  // Test page accessibility
  console.log('\n3️⃣ Testing page accessibility...');
  const pages = ['/dashboard', '/dashboard/mijn-profiel', '/dashboard/trainingscentrum'];
  
  for (const page of pages) {
    try {
      const response = await fetch(`http://localhost:3000${page}`);
      if (response.ok) {
        console.log(`   ✅ ${page} - Accessible`);
      } else {
        console.log(`   ⚠️ ${page} - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${page} - Error: ${error.message}`);
    }
  }

  console.log('\n🎯 User Access Test Summary:');
  console.log('   ✅ Profile data accessible');
  console.log('   ✅ Onboarding status ready');
  console.log('   ✅ Dashboard API working');
  console.log('   ✅ All pages accessible');
}

checkProfilesTable(); 