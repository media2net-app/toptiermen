const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetTestUserOnboarding() {
  const testUserId = 'dfac392f-631f-4c6c-a08f-0aef796f7b75'; // test.user.1756630044380@toptiermen.test
  
  console.log('🔧 Resetting onboarding status for test user...');
  
  try {
    // Reset onboarding status
    const { data, error } = await supabase
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
      .eq('user_id', testUserId)
      .select();

    if (error) {
      console.error('❌ Error resetting onboarding status:', error);
      return;
    }

    console.log('✅ Onboarding status reset successfully:');
    console.log('   - welcome_video_watched: false');
    console.log('   - step_1_completed: false');
    console.log('   - current_step: 0');
    console.log('   - onboarding_completed: false');

    // Also reset user profile main_goal
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ main_goal: null })
      .eq('id', testUserId);

    if (profileError) {
      console.error('⚠️ Error resetting profile main_goal:', profileError);
    } else {
      console.log('✅ Profile main_goal reset successfully');
    }

    console.log('\n🎉 Test user onboarding reset complete!');
    console.log('   The user will now see the test video again when logging in.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the reset
resetTestUserOnboarding();
