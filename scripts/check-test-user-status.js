const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTestUserStatus() {
  console.log('🔍 Checking test user status...\n');

  try {
    const testEmail = 'test.user.1756630044380@toptiermen.test';
    
    console.log(`📧 Looking for test user: ${testEmail}\n`);

    // 1. Check if user exists in auth
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    const testUser = users.users.find(user => user.email === testEmail);
    
    if (!testUser) {
      console.error('❌ Test user not found in auth system');
      return;
    }

    console.log('✅ Test user found in auth system:');
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Email confirmed: ${testUser.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`   Created: ${testUser.created_at}`);
    console.log('');

    // 2. Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUser.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError.message);
    } else {
      console.log('✅ Profile found:');
      console.log(`   Full name: ${profile.full_name}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Created: ${profile.created_at}`);
      console.log('');
    }

    // 3. Check onboarding status
    const { data: onboarding, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', testUser.id)
      .single();

    if (onboardingError) {
      console.error('❌ Error fetching onboarding status:', onboardingError.message);
      console.log('🔧 Creating onboarding status for test user...');
      
      // Create onboarding status
      const { error: createError } = await supabase
        .from('onboarding_status')
        .insert({
          user_id: testUser.id,
          welcome_video_watched: false,
          step_1_completed: false,
          step_2_completed: false,
          step_3_completed: false,
          step_4_completed: false,
          step_5_completed: false,
          onboarding_completed: false,
          current_step: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        console.error('❌ Error creating onboarding status:', createError.message);
      } else {
        console.log('✅ Onboarding status created successfully');
      }
    } else {
      console.log('✅ Onboarding status found:');
      console.log(`   Welcome video watched: ${onboarding.welcome_video_watched}`);
      console.log(`   Current step: ${onboarding.current_step}`);
      console.log(`   Onboarding completed: ${onboarding.onboarding_completed}`);
      console.log(`   Step 1 completed: ${onboarding.step_1_completed}`);
      console.log(`   Step 2 completed: ${onboarding.step_2_completed}`);
      console.log(`   Step 3 completed: ${onboarding.step_3_completed}`);
      console.log(`   Step 4 completed: ${onboarding.step_4_completed}`);
      console.log(`   Step 5 completed: ${onboarding.step_5_completed}`);
      console.log('');
    }

    // 4. Check if test video file exists
    console.log('🎬 Checking test video file...');
    console.log('   Expected path: /public/testgebruikers-v2.mp4');
    console.log('   Note: This is a static file check - verify manually');
    console.log('');

    // 5. Summary
    console.log('📋 SUMMARY:');
    console.log('=====================================');
    console.log(`✅ Auth user: ${testUser ? 'Found' : 'Missing'}`);
    console.log(`✅ Profile: ${profile ? 'Found' : 'Missing'}`);
    console.log(`✅ Onboarding: ${onboarding ? 'Found' : 'Missing'}`);
    console.log('');
    console.log('🔧 EXPECTED BEHAVIOR:');
    console.log('   1. User logs in with test credentials');
    console.log('   2. DashboardContent detects @toptiermen.test email');
    console.log('   3. Shows TestUserVideoModal (test video)');
    console.log('   4. After watching video, shows ForcedOnboardingModal');
    console.log('   5. Normal onboarding process begins');
    console.log('');
    console.log('🐛 POTENTIAL ISSUES:');
    console.log('   - Onboarding status might be completed already');
    console.log('   - Test video file might be missing');
    console.log('   - Email pattern detection might not work');
    console.log('   - Modal state management might be broken');

  } catch (error) {
    console.error('❌ Error checking test user status:', error);
  }
}

checkTestUserStatus();
