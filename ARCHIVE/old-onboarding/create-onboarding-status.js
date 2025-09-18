const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createOnboardingStatus() {
  try {
    console.log('🔧 Creating onboarding status for Rick and Chiel...\n');

    // Create onboarding status for Rick (completed)
    const { error: rickError } = await supabase
      .from('user_onboarding_status')
      .insert({
        user_id: '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c',
        welcome_video_shown: true,
        onboarding_completed: true,
        goal_set: true,
        missions_selected: true,
        training_schema_selected: true,
        nutrition_plan_selected: true,
        challenge_started: true,
        completed_steps: JSON.stringify(['goal', 'missions', 'training', 'nutrition', 'challenge'])
      });

    if (rickError) {
      console.error('❌ Error creating Rick\'s onboarding status:', rickError.message);
    } else {
      console.log('✅ Rick\'s onboarding status created successfully!');
    }

    // Create onboarding status for Chiel (completed)
    const { error: chielError } = await supabase
      .from('user_onboarding_status')
      .insert({
        user_id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
        welcome_video_shown: true,
        onboarding_completed: true,
        goal_set: true,
        missions_selected: true,
        training_schema_selected: true,
        nutrition_plan_selected: true,
        challenge_started: true,
        completed_steps: JSON.stringify(['goal', 'missions', 'training', 'nutrition', 'challenge'])
      });

    if (chielError) {
      console.error('❌ Error creating Chiel\'s onboarding status:', chielError.message);
    } else {
      console.log('✅ Chiel\'s onboarding status created successfully!');
    }

    console.log('\n🎯 Onboarding status creation completed!');
    console.log('📋 Both users now have completed onboarding status');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createOnboardingStatus(); 