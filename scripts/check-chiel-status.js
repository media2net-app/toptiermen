require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkChielStatus() {
  try {
    console.log('🔍 Checking Chiel\'s status...\n');
    
    const chielUserId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';
    
    // 1. Check user profile
    console.log('👤 Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', chielUserId)
      .single();
    
    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
    } else {
      console.log('✅ Profile found:', {
        email: profile.email,
        role: profile.role,
        main_goal: profile.main_goal
      });
    }
    
    // 2. Check onboarding status
    console.log('\n📋 Checking onboarding status...');
    const { data: onboarding, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', chielUserId)
      .single();
    
    if (onboardingError) {
      console.log('❌ Onboarding error:', onboardingError.message);
    } else {
      console.log('✅ Onboarding status:', {
        onboarding_completed: onboarding.onboarding_completed,
        current_step: onboarding.current_step,
        welcome_video_watched: onboarding.welcome_video_watched,
        step_1_completed: onboarding.step_1_completed,
        step_2_completed: onboarding.step_2_completed,
        step_3_completed: onboarding.step_3_completed,
        step_4_completed: onboarding.step_4_completed,
        step_5_completed: onboarding.step_5_completed
      });
    }
    
    // 3. Check user badges
    console.log('\n🏆 Checking user badges...');
    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', chielUserId);
    
    if (badgesError) {
      console.log('❌ Badges error:', badgesError.message);
    } else {
      console.log(`✅ Found ${badges.length} badges:`, badges.map(b => b.badge_name));
    }
    
    // 4. Check user missions
    console.log('\n🎯 Checking user missions...');
    const { data: missions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', chielUserId);
    
    if (missionsError) {
      console.log('❌ Missions error:', missionsError.message);
    } else {
      console.log(`✅ Found ${missions.length} missions:`, missions.map(m => m.mission_name));
    }
    
    // 5. Check user training schema
    console.log('\n💪 Checking training schema...');
    const { data: training, error: trainingError } = await supabase
      .from('user_training_schemas')
      .select('*')
      .eq('user_id', chielUserId);
    
    if (trainingError) {
      console.log('❌ Training error:', trainingError.message);
    } else {
      console.log(`✅ Found ${training.length} training schemas:`, training.map(t => t.schema_name));
    }
    
    // 6. Check user nutrition plan
    console.log('\n🥗 Checking nutrition plan...');
    const { data: nutrition, error: nutritionError } = await supabase
      .from('user_nutrition_plans')
      .select('*')
      .eq('user_id', chielUserId);
    
    if (nutritionError) {
      console.log('❌ Nutrition error:', nutritionError.message);
    } else {
      console.log(`✅ Found ${nutrition.length} nutrition plans:`, nutrition.map(n => n.plan_name));
    }
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));
    
    if (onboarding && onboarding.onboarding_completed) {
      console.log('✅ Onboarding: COMPLETED');
    } else {
      console.log('❌ Onboarding: NOT COMPLETED');
    }
    
    console.log(`🏆 Badges: ${badges ? badges.length : 0} earned`);
    console.log(`🎯 Missions: ${missions ? missions.length : 0} selected`);
    console.log(`💪 Training: ${training ? training.length : 0} schemas`);
    console.log(`🥗 Nutrition: ${nutrition ? nutrition.length : 0} plans`);
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('='.repeat(50));
    
    if (!onboarding || !onboarding.onboarding_completed) {
      console.log('🔧 ACTION NEEDED: Complete onboarding for Chiel');
    }
    
    if (!badges || badges.length === 0) {
      console.log('🏆 ACTION NEEDED: Assign badges to Chiel');
    }
    
    if (!missions || missions.length === 0) {
      console.log('🎯 ACTION NEEDED: Assign missions to Chiel');
    }
    
    if (!training || training.length === 0) {
      console.log('💪 ACTION NEEDED: Assign training schema to Chiel');
    }
    
    if (!nutrition || nutrition.length === 0) {
      console.log('🥗 ACTION NEEDED: Assign nutrition plan to Chiel');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkChielStatus();
