require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOnboardingProgress() {
  console.log('🔍 Checking onboarding progress for test user...\n');

  try {
    const testEmail = 'test.user.1756630044380@toptiermen.test';
    
    console.log(`📧 Checking user: ${testEmail}\n`);

    // 1. Find the test user
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

    console.log('📊 Onboarding Status:');
    console.log('=====================================');
    console.log(`   Welcome video watched: ${onboarding.welcome_video_watched ? '✅' : '❌'}`);
    console.log(`   Step 1 completed (Goal): ${onboarding.step_1_completed ? '✅' : '❌'}`);
    console.log(`   Step 2 completed (Missions): ${onboarding.step_2_completed ? '✅' : '❌'}`);
    console.log(`   Step 3 completed (Training): ${onboarding.step_3_completed ? '✅' : '❌'}`);
    console.log(`   Step 4 completed (Nutrition): ${onboarding.step_4_completed ? '✅' : '❌'}`);
    console.log(`   Step 5 completed (Forum): ${onboarding.step_5_completed ? '✅' : '❌'}`);
    console.log(`   Current step: ${onboarding.current_step}`);
    console.log(`   Onboarding completed: ${onboarding.onboarding_completed ? '✅' : '❌'}`);
    console.log('');

    // 3. Check user profile for main goal
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('main_goal')
      .eq('id', testUser.id)
      .single();

    if (profileError) {
      console.log('⚠️ Error fetching profile:', profileError.message);
    } else {
      console.log('🎯 Main Goal:');
      console.log(`   ${profile.main_goal || 'Not set'}`);
      console.log('');
    }

    // 4. Check user missions
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', testUser.id);

    if (missionsError) {
      console.log('⚠️ Error fetching missions:', missionsError.message);
    } else {
      console.log('🔥 User Missions:');
      console.log(`   Total missions: ${missions?.length || 0}`);
      if (missions && missions.length > 0) {
        missions.forEach((mission, index) => {
          console.log(`   ${index + 1}. ${mission.title} (${mission.type})`);
        });
      }
      console.log('');
    }

    // 5. Determine expected behavior
    console.log('🔧 Expected Behavior:');
    console.log('=====================================');
    
    if (!onboarding.welcome_video_watched) {
      console.log('   1. User should see test video modal first');
    } else if (!onboarding.step_1_completed) {
      console.log('   2. User should see onboarding modal for goal setting');
    } else if (!onboarding.step_2_completed) {
      console.log('   3. User should be on missions page with onboarding banner');
    } else if (!onboarding.step_3_completed) {
      console.log('   4. User should be on training center page with onboarding banner');
    } else if (!onboarding.step_4_completed) {
      console.log('   5. User should be on nutrition page with onboarding banner');
    } else if (!onboarding.step_5_completed) {
      console.log('   6. User should be on forum page with onboarding banner');
    } else {
      console.log('   7. Onboarding should be completed');
    }

    console.log('');
    console.log('📋 Current Step Instructions:');
    console.log('=====================================');
    
    if (!onboarding.welcome_video_watched) {
      console.log('   Watch the welcome video to learn about the platform');
    } else if (!onboarding.step_1_completed) {
      console.log('   Describe your main goal - what do you want to achieve?');
    } else if (!onboarding.step_2_completed) {
      console.log('   Add your first missions by clicking "Nieuwe Missie Toevoegen" or use "Missie Bibliotheek"');
    } else if (!onboarding.step_3_completed) {
      console.log('   Browse available training schemas and select one that fits you');
    } else if (!onboarding.step_4_completed) {
      console.log('   Select your nutrition plan and a challenge');
    } else if (!onboarding.step_5_completed) {
      console.log('   Make your first forum post to introduce yourself to the community');
    } else {
      console.log('   Onboarding completed! Welcome to Top Tier Men!');
    }

  } catch (error) {
    console.error('❌ Error checking onboarding progress:', error);
  }
}

checkOnboardingProgress();
