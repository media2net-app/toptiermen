const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM0NzI4MDAwLCJleHAiOjIwNTAzMDQwMDB9.example';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateToStep4() {
  const userEmail = 'onboarding.basic.1758346121028@toptiermen.eu';
  
  try {
    console.log(`🔄 Updating user ${userEmail} to step 4...`);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }

    console.log('✅ Found user profile:', profile.id);

    // Update onboarding status to step 4
    const { data, error } = await supabase
      .from('user_onboarding_status')
      .update({
        welcome_video_shown: true,
        onboarding_completed: false,
        goal_set: true,
        missions_selected: true,
        training_schema_selected: true,
        nutrition_plan_selected: false, // Step 4 - not yet selected
        challenge_started: false,
        completed_steps: [0, 1, 2, 3] // Steps 0-3 completed
      })
      .eq('user_id', profile.id)
      .select();

    if (error) {
      console.error('❌ Error updating onboarding status:', error);
      return;
    }

    console.log('✅ Onboarding status updated to step 4:', data[0]);
    console.log('🎉 User is now on step 4 (Voedingsplannen)');
    console.log('📋 Status:');
    console.log('   - Onboarding completed: false');
    console.log('   - Current step: 4 (Voedingsplannen)');
    console.log('   - Steps 0-3 completed');
    console.log('   - Only Voedingsplannen menu item should be active');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateToStep4();
