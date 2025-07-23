const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkOnboardingStatus() {
  try {
    console.log('🔍 Checking onboarding status for all users...\n');

    // Check onboarding status for all users
    const { data, error } = await supabase
      .from('user_onboarding_status')
      .select('*');

    if (error) {
      console.error('❌ Error fetching onboarding status:', error.message);
      return;
    }

    console.log('📊 Current onboarding status:');
    data.forEach(user => {
      console.log(`\n👤 User ID: ${user.user_id}`);
      console.log(`   - onboarding_completed: ${user.onboarding_completed}`);
      console.log(`   - goal_set: ${user.goal_set}`);
      console.log(`   - missions_selected: ${user.missions_selected}`);
      console.log(`   - training_schema_selected: ${user.training_schema_selected}`);
      console.log(`   - nutrition_plan_selected: ${user.nutrition_plan_selected}`);
      console.log(`   - challenge_started: ${user.challenge_started}`);
      console.log(`   - completed_steps: ${user.completed_steps}`);
    });

    // Check if Rick and Chiel exist
    const rick = data.find(u => u.user_id === '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c');
    const chiel = data.find(u => u.user_id === '061e43d5-c89a-42bb-8a4c-04be2ce99a7e');

    console.log('\n🎯 Summary:');
    if (rick) {
      console.log(`   - Rick: ${rick.onboarding_completed ? '✅ Completed' : '❌ Not completed'}`);
    } else {
      console.log('   - Rick: ❌ No onboarding status found');
    }
    
    if (chiel) {
      console.log(`   - Chiel: ${chiel.onboarding_completed ? '✅ Completed' : '❌ Not completed'}`);
    } else {
      console.log('   - Chiel: ❌ No onboarding status found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOnboardingStatus(); 