require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...\n');
    
    // Check user_badges table
    console.log('🏆 Checking user_badges table...');
    const { data: userBadgesSample, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('*')
      .limit(1);
    
    if (userBadgesError) {
      console.log('❌ user_badges error:', userBadgesError.message);
    } else {
      console.log('✅ user_badges columns:', Object.keys(userBadgesSample[0] || {}));
    }
    
    // Check user_missions table
    console.log('\n🎯 Checking user_missions table...');
    const { data: userMissionsSample, error: userMissionsError } = await supabase
      .from('user_missions')
      .select('*')
      .limit(1);
    
    if (userMissionsError) {
      console.log('❌ user_missions error:', userMissionsError.message);
    } else {
      console.log('✅ user_missions columns:', Object.keys(userMissionsSample[0] || {}));
    }
    
    // Check user_nutrition_plans table
    console.log('\n🥗 Checking user_nutrition_plans table...');
    const { data: userNutritionSample, error: userNutritionError } = await supabase
      .from('user_nutrition_plans')
      .select('*')
      .limit(1);
    
    if (userNutritionError) {
      console.log('❌ user_nutrition_plans error:', userNutritionError.message);
    } else {
      console.log('✅ user_nutrition_plans columns:', Object.keys(userNutritionSample[0] || {}));
    }
    
    // Check badges table
    console.log('\n🏆 Checking badges table...');
    const { data: badgesSample, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .limit(1);
    
    if (badgesError) {
      console.log('❌ badges error:', badgesError.message);
    } else {
      console.log('✅ badges columns:', Object.keys(badgesSample[0] || {}));
    }
    
    // Check onboarding_status table
    console.log('\n📋 Checking onboarding_status table...');
    const { data: onboardingSample, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .limit(1);
    
    if (onboardingError) {
      console.log('❌ onboarding_status error:', onboardingError.message);
    } else {
      console.log('✅ onboarding_status columns:', Object.keys(onboardingSample[0] || {}));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabaseSchema();
