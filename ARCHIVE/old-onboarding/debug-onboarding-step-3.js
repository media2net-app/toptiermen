const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugOnboardingStep3() {
  console.log('🔍 Debugging onboarding step 3 logic...\n');

  try {
    const userId = 'd2fae82e-bef3-4658-b770-b235b364532b';

    // 1. Check onboarding status
    console.log('1️⃣ Checking onboarding status...');
    const response = await fetch(`http://localhost:3000/api/onboarding?userId=${userId}&t=${Date.now()}&v=2.0.1`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (response.ok) {
      const onboardingData = await response.json();
      console.log('✅ Onboarding API response:');
      console.log(JSON.stringify(onboardingData, null, 2));
      
      // Check the logic
      const shouldShowStep3 = !onboardingData.onboarding_completed && onboardingData.current_step === 3;
      console.log('\n🔍 Onboarding Step 3 Logic Check:');
      console.log(`   onboarding_completed: ${onboardingData.onboarding_completed}`);
      console.log(`   current_step: ${onboardingData.current_step}`);
      console.log(`   Should show step 3: ${shouldShowStep3}`);
    } else {
      const errorText = await response.text();
      console.error('❌ Onboarding API failed:', response.status, response.statusText);
      console.error('Error details:', errorText);
    }

    // 2. Check missions count
    console.log('\n2️⃣ Checking missions count...');
    const missionsResponse = await fetch(`http://localhost:3000/api/missions-simple?userId=${userId}`, {
      cache: 'no-cache'
    });

    if (missionsResponse.ok) {
      const missionsData = await missionsResponse.json();
      console.log('✅ Missions API response:');
      console.log(`   Total missions: ${missionsData.missions.length}`);
      console.log(`   Summary:`, missionsData.summary);
      
      missionsData.missions.forEach((mission, index) => {
        console.log(`   ${index + 1}. ${mission.title} (${mission.category}) - ${mission.done ? '✅ Done' : '⏳ Pending'}`);
      });
      
      // Check if user has 3+ missions
      const hasEnoughMissions = missionsData.missions.length >= 3;
      console.log(`\n🔍 Missions Count Check:`);
      console.log(`   Missions count: ${missionsData.missions.length}`);
      console.log(`   Has 3+ missions: ${hasEnoughMissions}`);
    } else {
      const errorText = await missionsResponse.text();
      console.error('❌ Missions API failed:', missionsResponse.status, missionsResponse.statusText);
      console.error('Error details:', errorText);
    }

    // 3. Check database directly
    console.log('\n3️⃣ Checking database directly...');
    const { data: userMissions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId);

    if (missionsError) {
      console.error('❌ Database missions error:', missionsError);
    } else {
      console.log(`✅ Database missions: ${userMissions.length}`);
      userMissions.forEach((mission, index) => {
        console.log(`   ${index + 1}. ${mission.title} (${mission.category_slug}) - ${mission.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error debugging onboarding step 3:', error);
  }
}

debugOnboardingStep3();
