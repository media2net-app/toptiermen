const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateOnboardingStatus() {
  try {
    console.log('🔧 Updating onboarding status for Rick and Chiel (admin mode)...\n');

    // Update onboarding status for Rick (completed)
    const { error: rickError } = await supabase
      .from('user_onboarding_status')
      .update({
        welcome_video_shown: true,
        onboarding_completed: true,
        goal_set: true,
        missions_selected: true,
        training_schema_selected: true,
        nutrition_plan_selected: true,
        challenge_started: true,
        completed_steps: JSON.stringify(['goal', 'missions', 'training', 'nutrition', 'challenge'])
      })
      .eq('user_id', '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c');

    if (rickError) {
      console.error('❌ Error updating Rick\'s onboarding status:', rickError.message);
    } else {
      console.log('✅ Rick\'s onboarding status updated successfully!');
    }

    // Update onboarding status for Chiel (completed)
    const { error: chielError } = await supabase
      .from('user_onboarding_status')
      .update({
        welcome_video_shown: true,
        onboarding_completed: true,
        goal_set: true,
        missions_selected: true,
        training_schema_selected: true,
        nutrition_plan_selected: true,
        challenge_started: true,
        completed_steps: JSON.stringify(['goal', 'missions', 'training', 'nutrition', 'challenge'])
      })
      .eq('user_id', '061e43d5-c89a-42bb-8a4c-04be2ce99a7e');

    if (chielError) {
      console.error('❌ Error updating Chiel\'s onboarding status:', chielError.message);
    } else {
      console.log('✅ Chiel\'s onboarding status updated successfully!');
    }

    console.log('\n🎯 Onboarding status update completed!');
    console.log('📋 Both users now have completed onboarding status');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateOnboardingStatus(); 