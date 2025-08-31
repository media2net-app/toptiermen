const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetTestUserOnboarding() {
  console.log('🔄 Resetting test user onboarding status...\n');

  try {
    const userId = 'd2fae82e-bef3-4658-b770-b235b364532b';

    // Reset onboarding status to show test video
    const { data: updatedOnboarding, error: updateError } = await supabase
      .from('onboarding_status')
      .update({
        welcome_video_watched: false,
        step_1_completed: false,
        step_2_completed: false,
        step_3_completed: false,
        step_4_completed: false,
        step_5_completed: false,
        onboarding_completed: false,
        current_step: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error resetting onboarding status:', updateError);
    } else {
      console.log('✅ Test user onboarding status reset:');
      console.log(`   Welcome video watched: ${updatedOnboarding.welcome_video_watched}`);
      console.log(`   Current step: ${updatedOnboarding.current_step}`);
      console.log(`   Onboarding completed: ${updatedOnboarding.onboarding_completed}`);
      console.log(`   Step 1 completed: ${updatedOnboarding.step_1_completed}`);
      console.log(`   Step 2 completed: ${updatedOnboarding.step_2_completed}`);
      console.log(`   Step 3 completed: ${updatedOnboarding.step_3_completed}`);
      console.log(`   Step 4 completed: ${updatedOnboarding.step_4_completed}`);
      console.log(`   Step 5 completed: ${updatedOnboarding.step_5_completed}`);
      
      console.log('\n🎬 Test video should now be shown when you refresh the dashboard!');
      console.log('💡 Go to: http://localhost:3000/dashboard');
    }

  } catch (error) {
    console.error('❌ Error resetting test user onboarding:', error);
  }
}

resetTestUserOnboarding();
