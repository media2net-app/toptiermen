const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkChielOnboardingStep3() {
  console.log('🔍 Checking why Chiel is seeing onboarding step 3...\n');

  const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

  try {
    // Check onboarding_status table
    console.log('📋 STEP 1: Checking onboarding_status table');
    console.log('----------------------------------------');
    
    const { data: onboardingStatus, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', chielId);

    if (onboardingError) {
      console.error('❌ Error fetching onboarding status:', onboardingError.message);
      return;
    }

    if (!onboardingStatus || onboardingStatus.length === 0) {
      console.log('⚠️ No onboarding status record found in onboarding_status table');
    } else {
      const status = onboardingStatus[0];
      console.log('✅ Onboarding status found:');
      console.log(`   - User ID: ${status.user_id}`);
      console.log(`   - Onboarding Completed: ${status.onboarding_completed}`);
      console.log(`   - Current Step: ${status.current_step}`);
      console.log(`   - Step 1 Completed: ${status.step_1_completed}`);
      console.log(`   - Step 2 Completed: ${status.step_2_completed}`);
      console.log(`   - Step 3 Completed: ${status.step_3_completed}`);
      console.log(`   - Step 4 Completed: ${status.step_4_completed}`);
      console.log(`   - Step 5 Completed: ${status.step_5_completed}`);
      console.log(`   - Welcome Video Watched: ${status.welcome_video_watched}`);
    }

    // Check user_onboarding_status table (old table)
    console.log('\n📋 STEP 2: Checking user_onboarding_status table');
    console.log('----------------------------------------');
    
    const { data: userOnboardingStatus, error: userOnboardingError } = await supabase
      .from('user_onboarding_status')
      .select('*')
      .eq('user_id', chielId);

    if (userOnboardingError) {
      console.log('ℹ️ user_onboarding_status table does not exist or error:', userOnboardingError.message);
    } else if (!userOnboardingStatus || userOnboardingStatus.length === 0) {
      console.log('ℹ️ No records found in user_onboarding_status table');
    } else {
      const status = userOnboardingStatus[0];
      console.log('✅ User onboarding status found:');
      console.log(`   - User ID: ${status.user_id}`);
      console.log(`   - Onboarding Completed: ${status.onboarding_completed}`);
      console.log(`   - Goal Set: ${status.goal_set}`);
      console.log(`   - Missions Selected: ${status.missions_selected}`);
      console.log(`   - Training Schema Selected: ${status.training_schema_selected}`);
      console.log(`   - Nutrition Plan Selected: ${status.nutrition_plan_selected}`);
      console.log(`   - Challenge Started: ${status.challenge_started}`);
    }

    // Check missions table
    console.log('\n📋 STEP 3: Checking missions table');
    console.log('----------------------------------------');
    
    const { data: missions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', chielId);

    if (missionsError) {
      console.error('❌ Error fetching missions:', missionsError.message);
    } else {
      console.log(`✅ Found ${missions?.length || 0} missions for Chiel`);
      if (missions && missions.length > 0) {
        missions.forEach((mission, index) => {
          console.log(`   ${index + 1}. ${mission.title} - Completed: ${mission.completed}`);
        });
      }
    }

    // Check if there are any forced onboarding components
    console.log('\n📋 STEP 4: Analysis');
    console.log('----------------------------------------');
    
    if (onboardingStatus && onboardingStatus.length > 0) {
      const status = onboardingStatus[0];
      
      if (status.onboarding_completed) {
        console.log('✅ Onboarding is marked as completed');
        console.log('   - This should NOT show onboarding step 3');
        console.log('   - The issue might be in the frontend logic');
      } else {
        console.log('⚠️ Onboarding is NOT marked as completed');
        console.log('   - This explains why step 3 is showing');
        console.log('   - Need to fix the onboarding status');
      }

      // Check if all steps are completed but onboarding_completed is false
      const allStepsCompleted = 
        status.step_1_completed &&
        status.step_2_completed &&
        status.step_3_completed &&
        status.step_4_completed &&
        status.step_5_completed;

      if (allStepsCompleted && !status.onboarding_completed) {
        console.log('\n🔧 ISSUE FOUND: All steps completed but onboarding_completed is false');
        console.log('   - This is a data inconsistency');
        console.log('   - Need to fix the onboarding status');
      }
    } else {
      console.log('⚠️ No onboarding status record found');
      console.log('   - This explains why onboarding step 3 is showing');
      console.log('   - Need to create an onboarding status record');
    }

    console.log('\n📋 STEP 5: Recommendations');
    console.log('----------------------------------------');
    
    if (!onboardingStatus || onboardingStatus.length === 0) {
      console.log('🔧 ACTION NEEDED: Create onboarding status record');
      console.log('   - Chiel needs an onboarding status record');
      console.log('   - Should mark onboarding as completed');
    } else {
      const status = onboardingStatus[0];
      if (!status.onboarding_completed) {
        console.log('🔧 ACTION NEEDED: Fix onboarding status');
        console.log('   - Mark onboarding as completed');
        console.log('   - Set current_step to 6');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkChielOnboardingStep3();
