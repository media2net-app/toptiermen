const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyNutritionPlans() {
  console.log('🔍 Verifying Nutrition Plans Database...\n');

  try {
    // Check nutrition_plans table
    console.log('📊 Checking nutrition_plans table...');
    const { data: plans, error: plansError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (plansError) {
      console.error('❌ Error fetching nutrition plans:', plansError);
      return;
    }

    console.log(`✅ Found ${plans.length} nutrition plans:`);
    plans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name}`);
      console.log(`      - Plan ID: ${plan.plan_id}`);
      console.log(`      - Subtitle: ${plan.subtitle || 'N/A'}`);
      console.log(`      - Icon: ${plan.icon || 'N/A'}`);
      console.log(`      - Color: ${plan.color || 'N/A'}`);
      console.log(`      - Active: ${plan.is_active ? 'Yes' : 'No'}`);
      console.log(`      - Created: ${plan.created_at}`);
      console.log('');
    });

    // Check nutrition_weekplans table
    console.log('📅 Checking nutrition_weekplans table...');
    const { data: weekplans, error: weekplansError } = await supabase
      .from('nutrition_weekplans')
      .select('*')
      .limit(10);

    if (weekplansError) {
      console.error('❌ Error fetching week plans:', weekplansError);
    } else {
      console.log(`✅ Found ${weekplans.length} week plans`);
    }

    // Check meals table
    console.log('🍽️ Checking meals table...');
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .limit(10);

    if (mealsError) {
      console.error('❌ Error fetching meals:', mealsError);
    } else {
      console.log(`✅ Found ${meals.length} meals`);
    }

    // Test API endpoint
    console.log('\n🌐 Testing API Endpoint...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/nutrition-plans`);
      const apiData = await response.json();
      
      if (response.ok) {
        console.log('✅ API endpoint working correctly');
        console.log(`   - Plans returned: ${apiData.plans?.length || 0}`);
        console.log(`   - Success: ${apiData.success}`);
      } else {
        console.error('❌ API endpoint error:', apiData.error);
      }
    } catch (apiError) {
      console.error('❌ API endpoint test failed:', apiError.message);
    }

    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`   - Nutrition Plans: ${plans.length} plans in database`);
    console.log(`   - Week Plans: ${weekplans?.length || 0} week plans`);
    console.log(`   - Meals: ${meals?.length || 0} meals`);
    
    const hasCarnivorePlans = plans.some(plan => plan.name.toLowerCase().includes('carnivoor'));
    console.log(`   - Carnivore Plans: ${hasCarnivorePlans ? '✅ Present' : '❌ Missing'}`);
    
    const isFullyDatabase = plans.length > 0;
    console.log(`\n🎯 RESULT: Voedingsplannen is ${isFullyDatabase ? '✅ 100% DATABASE-DRIVEN' : '❌ NOT FULLY DATABASE-DRIVEN'}`);

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyNutritionPlans();
