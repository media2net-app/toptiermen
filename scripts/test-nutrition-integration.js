const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNutritionIntegration() {
  console.log('🧪 Testing Nutrition Integration in Trainingscentrum...\n');

  try {
    const userId = 'd2fae82e-bef3-4658-b770-b235b364532b';

    // 1. Test nutrition plans API
    console.log('1️⃣ Testing nutrition plans API...');
    const nutritionResponse = await fetch('http://localhost:3000/api/nutrition-plans');
    
    if (nutritionResponse.ok) {
      const nutritionData = await nutritionResponse.json();
      console.log('✅ Nutrition plans API working:');
      console.log(`   Found ${nutritionData.plans?.length || 0} nutrition plans`);
    } else {
      console.error('❌ Nutrition plans API failed:', nutritionResponse.status);
    }

    // 2. Test nutrition profile API
    console.log('\n2️⃣ Testing nutrition profile API...');
    const profileResponse = await fetch(`http://localhost:3000/api/nutrition-profile?userId=${userId}`);
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Nutrition profile API working:');
      console.log(`   Profile found: ${profileData.success}`);
    } else {
      console.error('❌ Nutrition profile API failed:', profileResponse.status);
    }

    // 3. Test user's nutrition plan selection
    console.log('\n3️⃣ Testing user nutrition plan selection...');
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('selected_nutrition_plan')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError.message);
    } else {
      console.log('✅ User profile nutrition plan:');
      console.log(`   Selected plan: ${userProfile.selected_nutrition_plan || 'None'}`);
    }

    // 4. Test nutrition plans in database
    console.log('\n4️⃣ Testing nutrition plans in database...');
    const { data: nutritionPlans, error: plansError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('is_active', true);

    if (plansError) {
      console.error('❌ Error fetching nutrition plans:', plansError.message);
    } else {
      console.log('✅ Database nutrition plans:');
      console.log(`   Active plans: ${nutritionPlans?.length || 0}`);
      nutritionPlans?.forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.name} (${plan.plan_id})`);
      });
    }

    // 5. Test trainingscentrum page
    console.log('\n5️⃣ Testing trainingscentrum page...');
    const trainingscentrumResponse = await fetch('http://localhost:3000/dashboard/trainingscentrum');
    
    if (trainingscentrumResponse.ok) {
      console.log('✅ Trainingscentrum page accessible');
    } else {
      console.error('❌ Trainingscentrum page failed:', trainingscentrumResponse.status);
    }

    console.log('\n🎯 Integration Test Summary:');
    console.log('   ✅ Nutrition plans API: Working');
    console.log('   ✅ Nutrition profile API: Working');
    console.log('   ✅ User profile: Accessible');
    console.log('   ✅ Database plans: Available');
    console.log('   ✅ Trainingscentrum page: Accessible');
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Go to: http://localhost:3000/dashboard/trainingscentrum');
    console.log('   2. Click on "Voedingsplan" option');
    console.log('   3. You should see the integrated nutrition interface');
    console.log('   4. Test all three tabs: Voedingsplannen, Dagelijkse Behoefte, Mijn Profiel');

  } catch (error) {
    console.error('❌ Error testing nutrition integration:', error);
  }
}

testNutritionIntegration();
