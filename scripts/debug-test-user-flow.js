const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugTestUserFlow() {
  console.log('🔍 Debugging test user flow...\n');

  try {
    const testEmail = 'test.user.1756630044380@toptiermen.test';
    
    console.log(`📧 Testing flow for: ${testEmail}\n`);

    // 1. Check if user exists
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    const testUser = users.users.find(user => user.email === testEmail);
    
    if (!testUser) {
      console.error('❌ Test user not found');
      return;
    }

    console.log('✅ Test user found:', testUser.id);

    // 2. Check onboarding status
    const { data: onboarding, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', testUser.id)
      .single();

    if (onboardingError) {
      console.error('❌ Error fetching onboarding status:', onboardingError.message);
      return;
    }

    console.log('✅ Onboarding status:', {
      onboarding_completed: onboarding.onboarding_completed,
      current_step: onboarding.current_step,
      welcome_video_watched: onboarding.welcome_video_watched
    });

    // 3. Test the logic that should trigger test video modal
    const isTestUser = testEmail.includes('@toptiermen.test');
    const shouldShowTestVideo = isTestUser && !onboarding.onboarding_completed;
    
    console.log('\n🔍 Logic check:');
    console.log(`   Is test user: ${isTestUser}`);
    console.log(`   Onboarding completed: ${onboarding.onboarding_completed}`);
    console.log(`   Should show test video: ${shouldShowTestVideo}`);

    if (shouldShowTestVideo) {
      console.log('✅ Test video modal should be shown!');
    } else {
      console.log('❌ Test video modal should NOT be shown');
      
      if (onboarding.onboarding_completed) {
        console.log('   Reason: Onboarding is already completed');
      } else if (!isTestUser) {
        console.log('   Reason: User is not a test user');
      }
    }

    // 4. Test API call that the frontend would make
    console.log('\n🌐 Testing API call...');
    
    const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/onboarding_status?user_id=eq.${testUser.id}&select=*`;
    
    console.log('   API URL:', apiUrl);
    console.log('   This is what the frontend would call to get onboarding status');

    // 5. Simulate the test video completion
    console.log('\n🎬 Simulating test video completion...');
    
    const { error: updateError } = await supabase
      .from('onboarding_status')
      .update({
        welcome_video_watched: true,
        current_step: 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', testUser.id);

    if (updateError) {
      console.error('❌ Error updating onboarding status:', updateError.message);
    } else {
      console.log('✅ Test video marked as watched');
      console.log('   Current step set to 1');
      console.log('   Normal onboarding should now start');
    }

    // 6. Check final status
    const { data: finalOnboarding, error: finalError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', testUser.id)
      .single();

    if (!finalError) {
      console.log('\n📋 Final status:');
      console.log(`   Welcome video watched: ${finalOnboarding.welcome_video_watched}`);
      console.log(`   Current step: ${finalOnboarding.current_step}`);
      console.log(`   Onboarding completed: ${finalOnboarding.onboarding_completed}`);
    }

    console.log('\n🎉 Debug complete!');
    console.log('\n📋 EXPECTED FRONTEND BEHAVIOR:');
    console.log('   1. User logs in with test credentials');
    console.log('   2. DashboardContent fetches onboarding status');
    console.log('   3. Detects @toptiermen.test email pattern');
    console.log('   4. Shows TestUserVideoModal');
    console.log('   5. After video completion, shows ForcedOnboardingModal');
    console.log('   6. Normal onboarding process begins');

  } catch (error) {
    console.error('❌ Error debugging test user flow:', error);
  }
}

debugTestUserFlow();
