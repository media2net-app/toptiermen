const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOnboardingStatus() {
  try {
    console.log('🔍 Checking onboarding status for all users...');
    
    // Get all onboarding statuses
    const { data: allStatuses, error: statusError } = await supabase
      .from('onboarding_status')
      .select('*');
    
    if (statusError) {
      console.log('❌ Error fetching onboarding statuses:', statusError.message);
      return;
    }
    
    console.log(`\n📊 Found ${allStatuses.length} onboarding statuses:`);
    
    allStatuses.forEach((status, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   User ID: ${status.user_id}`);
      console.log(`   Welcome Video: ${status.welcome_video_watched ? '✅' : '❌'}`);
      console.log(`   Step 1: ${status.step_1_completed ? '✅' : '❌'}`);
      console.log(`   Step 2: ${status.step_2_completed ? '✅' : '❌'}`);
      console.log(`   Step 3: ${status.step_3_completed ? '✅' : '❌'}`);
      console.log(`   Step 4: ${status.step_4_completed ? '✅' : '❌'}`);
      console.log(`   Step 5: ${status.step_5_completed ? '✅' : '❌'}`);
      console.log(`   Current Step: ${status.current_step}`);
      console.log(`   Completed: ${status.onboarding_completed ? '✅' : '❌'}`);
    });
    
    // Check specifically for rob
    const robStatus = allStatuses.find(s => s.user_id === '14d7c55b-4ccd-453f-b79f-403f306f1efb');
    
    if (robStatus) {
      console.log('\n🎯 Rob\'s onboarding status:');
      console.log(`   User ID: ${robStatus.user_id}`);
      console.log(`   Welcome Video: ${robStatus.welcome_video_watched ? '✅' : '❌'}`);
      console.log(`   Current Step: ${robStatus.current_step}`);
      console.log(`   Completed: ${robStatus.onboarding_completed ? '✅' : '❌'}`);
      
      if (!robStatus.onboarding_completed) {
        console.log('✅ Rob needs onboarding - this is correct!');
      } else {
        console.log('❌ Rob should need onboarding but is marked as completed');
      }
    } else {
      console.log('❌ Rob\'s onboarding status not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking onboarding status:', error);
  }
}

checkOnboardingStatus(); 