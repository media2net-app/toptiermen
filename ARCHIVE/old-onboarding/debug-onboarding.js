const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugOnboarding() {
  const testUserId = 'dfac392f-631f-4c6c-a08f-0aef796f7b75'; // test.user.1756630044380@toptiermen.test
  
  console.log('🔍 Debugging onboarding status...\n');
  
  try {
    // Get onboarding status
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (onboardingError) {
      console.error('❌ Error fetching onboarding status:', onboardingError);
      return;
    }

    console.log('📊 Onboarding Status:');
    console.log('   - User ID:', onboardingData.user_id);
    console.log('   - Welcome video watched:', onboardingData.welcome_video_watched);
    console.log('   - Step 1 completed:', onboardingData.step_1_completed);
    console.log('   - Step 2 completed:', onboardingData.step_2_completed);
    console.log('   - Step 3 completed:', onboardingData.step_3_completed);
    console.log('   - Step 4 completed:', onboardingData.step_4_completed);
    console.log('   - Step 5 completed:', onboardingData.step_5_completed);
    console.log('   - Onboarding completed:', onboardingData.onboarding_completed);
    console.log('   - Current step:', onboardingData.current_step);

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
    } else {
      console.log('\n👤 User Profile:');
      console.log('   - Email:', profileData.email);
      console.log('   - Main goal:', profileData.main_goal);
      console.log('   - Role:', profileData.role);
    }

    // Calculate expected banner visibility
    const isOnboarding = !onboardingData.onboarding_completed;
    let expectedCurrentStep = 0;

    if (!onboardingData.welcome_video_watched) {
      expectedCurrentStep = 0;
    } else if (!onboardingData.step_1_completed) {
      expectedCurrentStep = 1;
    } else if (!onboardingData.step_2_completed) {
      expectedCurrentStep = 2;
    } else if (!onboardingData.step_3_completed) {
      expectedCurrentStep = 3;
    } else if (!onboardingData.step_4_completed) {
      expectedCurrentStep = 4;
    } else if (!onboardingData.step_5_completed) {
      expectedCurrentStep = 5;
    } else {
      expectedCurrentStep = 5;
    }

    console.log('\n🎯 Expected Banner Behavior:');
    console.log('   - Should show banner:', isOnboarding);
    console.log('   - Expected current step:', expectedCurrentStep);
    console.log('   - Actual current step:', onboardingData.current_step);
    console.log('   - Step mismatch:', expectedCurrentStep !== onboardingData.current_step);

    if (isOnboarding) {
      console.log('\n✅ Banner should be visible!');
      console.log('   - Check the top of the page for the onboarding banner');
      console.log('   - It should show "Stap X van 6" with progress bar');
      console.log('   - Instructions and "Stap Voltooien" button should be visible');
    } else {
      console.log('\n❌ Banner should NOT be visible (onboarding completed)');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the debug
debugOnboarding(); 