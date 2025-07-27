const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetRobOnboarding() {
  try {
    console.log('🔄 Resetting Rob\'s onboarding status...');

    // Find Rob's user ID
    const { data: robUser, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', 'rob@media2net.nl')
      .single();

    if (userError || !robUser) {
      console.error('❌ Rob not found in users table:', userError?.message);
      return;
    }

    console.log('✅ Found Rob:', robUser);

    // Reset onboarding status
    const { error: onboardingError } = await supabase
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
      .eq('user_id', robUser.id);

    if (onboardingError) {
      console.error('❌ Error resetting onboarding status:', onboardingError.message);
    } else {
      console.log('✅ Onboarding status reset');
    }

    // Clear user missions
    const { error: missionsError } = await supabase
      .from('user_missions')
      .delete()
      .eq('user_id', robUser.id);

    if (missionsError) {
      console.log('⚠️ Error clearing missions:', missionsError.message);
    } else {
      console.log('✅ User missions cleared');
    }

    // Clear user preferences
    const { error: preferencesError } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', robUser.id);

    if (preferencesError) {
      console.log('⚠️ Error clearing preferences:', preferencesError.message);
    } else {
      console.log('✅ User preferences cleared');
    }

    // Clear training progress
    const { error: trainingError } = await supabase
      .from('user_training_progress')
      .delete()
      .eq('user_id', robUser.id);

    if (trainingError) {
      console.log('⚠️ Error clearing training progress:', trainingError.message);
    } else {
      console.log('✅ Training progress cleared');
    }

    // Clear forum posts (introductions)
    const { error: forumError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('author_id', robUser.id)
      .eq('category', 'introductions');

    if (forumError) {
      console.log('⚠️ Error clearing forum posts:', forumError.message);
    } else {
      console.log('✅ Forum introduction posts cleared');
    }

    // Reset main goal in profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        main_goal: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', robUser.id);

    if (profileError) {
      console.log('⚠️ Error resetting profile:', profileError.message);
    } else {
      console.log('✅ Profile main goal reset');
    }

    console.log('🎉 Rob\'s onboarding has been completely reset!');
    console.log('📧 Rob can now log in again and will see the onboarding process');

  } catch (error) {
    console.error('❌ Error during reset:', error);
  }
}

resetRobOnboarding(); 