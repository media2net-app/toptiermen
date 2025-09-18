const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOnboardingStatus() {
  console.log('🔍 Checking onboarding status for test user...\n');

  try {
    const testEmail = 'test@toptiermen.eu';
    const userId = 'd2fae82e-bef3-4658-b770-b235b364532b';

    // 1. Check if user exists
    console.log('1️⃣ Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError);
    } else {
      console.log('✅ User profile found:');
      console.log(`   Email: ${profile.email}`);
      console.log(`   Name: ${profile.full_name}`);
      console.log(`   Role: ${profile.role}`);
    }

    // 2. Check onboarding status
    console.log('\n2️⃣ Checking onboarding status...');
    const { data: onboarding, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (onboardingError) {
      if (onboardingError.code === 'PGRST116') {
        console.log('⚠️ No onboarding status found, creating one...');
        
        // Create onboarding status
        const { data: newOnboarding, error: createError } = await supabase
          .from('onboarding_status')
          .insert({
            user_id: userId,
            welcome_video_watched: false,
            step_1_completed: false,
            step_2_completed: false,
            step_3_completed: false,
            step_4_completed: false,
            step_5_completed: false,
            onboarding_completed: false,
            current_step: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating onboarding status:', createError);
        } else {
          console.log('✅ Onboarding status created:');
          console.log(`   Welcome video watched: ${newOnboarding.welcome_video_watched}`);
          console.log(`   Current step: ${newOnboarding.current_step}`);
          console.log(`   Onboarding completed: ${newOnboarding.onboarding_completed}`);
        }
      } else {
        console.error('❌ Onboarding status error:', onboardingError);
      }
    } else {
      console.log('✅ Onboarding status found:');
      console.log(`   Welcome video watched: ${onboarding.welcome_video_watched}`);
      console.log(`   Current step: ${onboarding.current_step}`);
      console.log(`   Onboarding completed: ${onboarding.onboarding_completed}`);
      console.log(`   Step 1 completed: ${onboarding.step_1_completed}`);
      console.log(`   Step 2 completed: ${onboarding.step_2_completed}`);
      console.log(`   Step 3 completed: ${onboarding.step_3_completed}`);
      console.log(`   Step 4 completed: ${onboarding.step_4_completed}`);
      console.log(`   Step 5 completed: ${onboarding.step_5_completed}`);
    }

    // 3. Test API endpoint
    console.log('\n3️⃣ Testing onboarding API...');
    const response = await fetch(`http://localhost:3000/api/onboarding?userId=${userId}&t=${Date.now()}&v=2.0.1`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (response.ok) {
      const apiData = await response.json();
      console.log('✅ Onboarding API response:');
      console.log(JSON.stringify(apiData, null, 2));
    } else {
      const errorText = await response.text();
      console.error('❌ Onboarding API failed:', response.status, response.statusText);
      console.error('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Error checking onboarding status:', error);
  }
}

checkOnboardingStatus(); 