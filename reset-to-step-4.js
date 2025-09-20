const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM0NzI4MDAwLCJleHAiOjIwNTAzMDQwMDB9.example';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetUserToStep4() {
  const userEmail = 'onboarding.basic.1758346121028@toptiermen.eu';
  
  try {
    console.log(`🔄 Resetting user ${userEmail} to step 4...`);

    // First, get the user ID
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !userData.users) {
      console.error('❌ Error fetching users:', userError);
      return;
    }

    const user = userData.users.find(u => u.email === userEmail);
    if (!user) {
      console.error('❌ User not found:', userEmail);
      return;
    }

    console.log('✅ Found user:', user.id);

    // Delete existing onboarding status
    const { error: deleteError } = await supabase
      .from('user_onboarding_status')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.log('⚠️ Error deleting onboarding status:', deleteError.message);
    } else {
      console.log('✅ Onboarding status deleted');
    }

    // Create new onboarding status for step 4 (Voedingsplannen)
    const { data: insertData, error: insertError } = await supabase
      .from('user_onboarding_status')
      .insert({
        user_id: user.id,
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

    if (insertError) {
      console.error('❌ Error creating onboarding status:', insertError);
      return;
    }

    console.log('✅ Onboarding status created for step 4:', insertData[0]);

    // Update profile to reflect step 4
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        main_goal: 'Test doel voor stap 4'
      })
      .eq('id', user.id);

    if (profileError) {
      console.log('⚠️ Error updating profile:', profileError.message);
    } else {
      console.log('✅ Profile updated');
    }

    console.log('🎉 User successfully reset to step 4 (Voedingsplannen)');
    console.log('📋 User should now see:');
    console.log('   - Onboarding completed: false');
    console.log('   - Current step: 4 (Voedingsplannen)');
    console.log('   - Steps 0-3 completed');
    console.log('   - Only Voedingsplannen menu item active');

  } catch (error) {
    console.error('❌ Error resetting user:', error);
  }
}

resetUserToStep4();
