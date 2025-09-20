// Direct database update to set user to step 4
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - using public URL and anon key for now
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNDcyODAwMCwiZXhwIjoyMDUwMzA0MDAwfQ.example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setToStep4() {
  const userEmail = 'onboarding.basic.1758346121028@toptiermen.eu';
  
  try {
    console.log(`🔄 Setting user ${userEmail} to step 4...`);

    // Get user ID from profiles table
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
      .upsert({
        user_id: profile.id,
        welcome_video_shown: true,
        onboarding_completed: false,
        goal_set: true,
        missions_selected: true,
        training_schema_selected: true,
        nutrition_plan_selected: false, // Step 4 - not yet selected
        challenge_started: false,
        completed_steps: [0, 1, 2, 3] // Steps 0-3 completed
      })
      .select();

    if (error) {
      console.error('❌ Error updating onboarding status:', error);
      return;
    }

    console.log('✅ Onboarding status updated to step 4:', data[0]);
    console.log('🎉 User is now on step 4 (Voedingsplannen)');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setToStep4();
