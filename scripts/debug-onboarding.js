const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugOnboarding() {
  try {
    console.log('🔍 Debugging onboarding status table...\n');

    // Check all data in the table
    const { data, error } = await supabase
      .from('user_onboarding_status')
      .select('*');

    if (error) {
      console.error('❌ Error fetching data:', error.message);
      return;
    }

    console.log('📊 All data in user_onboarding_status table:');
    console.log('Total records:', data.length);
    
    data.forEach((record, index) => {
      console.log(`\n📝 Record ${index + 1}:`);
      console.log('   - id:', record.id);
      console.log('   - user_id:', record.user_id);
      console.log('   - onboarding_completed:', record.onboarding_completed);
      console.log('   - goal_set:', record.goal_set);
      console.log('   - missions_selected:', record.missions_selected);
      console.log('   - training_schema_selected:', record.training_schema_selected);
      console.log('   - nutrition_plan_selected:', record.nutrition_plan_selected);
      console.log('   - challenge_started:', record.challenge_started);
      console.log('   - completed_steps:', record.completed_steps);
      console.log('   - created_at:', record.created_at);
      console.log('   - updated_at:', record.updated_at);
    });

    // Check specific users
    const rick = data.find(u => u.user_id === '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c');
    const chiel = data.find(u => u.user_id === '061e43d5-c89a-42bb-8a4c-04be2ce99a7e');

    console.log('\n🎯 Specific user check:');
    if (rick) {
      console.log('   - Rick found:', rick.onboarding_completed ? '✅ Completed' : '❌ Not completed');
    } else {
      console.log('   - Rick: ❌ Not found');
    }
    
    if (chiel) {
      console.log('   - Chiel found:', chiel.onboarding_completed ? '✅ Completed' : '❌ Not completed');
    } else {
      console.log('   - Chiel: ❌ Not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugOnboarding(); 