const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixChielOnboarding() {
  try {
    console.log('🔧 Fixing Chiel\'s onboarding status...\n');

    // Update Chiel's onboarding status to completed
    const { error } = await supabase
      .from('user_onboarding_status')
      .update({
        onboarding_completed: true,
        goal_set: true,
        missions_selected: true,
        training_schema_selected: true,
        nutrition_plan_selected: true,
        challenge_started: true,
        completed_steps: JSON.stringify(['goal', 'missions', 'training', 'nutrition', 'challenge'])
      })
      .eq('user_id', '061e43d5-c89a-42bb-8a4c-04be2ce99a7e');

    if (error) {
      console.error('❌ Error updating Chiel\'s onboarding status:', error.message);
      return;
    }

    console.log('✅ Chiel\'s onboarding status updated successfully!');
    console.log('📋 Changes made:');
    console.log('   - onboarding_completed: true');
    console.log('   - goal_set: true');
    console.log('   - missions_selected: true');
    console.log('   - training_schema_selected: true');
    console.log('   - nutrition_plan_selected: true');
    console.log('   - challenge_started: true');
    console.log('   - completed_steps: all steps completed\n');

    console.log('🎯 Now when you refresh the dashboard:');
    console.log('   - Chiel will no longer see the "Gefeliciteerd!" block');
    console.log('   - The onboarding will be marked as completed');
    console.log('   - The dashboard will show the normal content');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixChielOnboarding(); 