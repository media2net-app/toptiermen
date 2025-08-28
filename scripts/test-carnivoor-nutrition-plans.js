const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCarnivoorNutritionPlans() {
  try {
    console.log('🥗 Testing Carnivoor Nutrition Plans Setup...\n');

    // Test 1: Check if nutrition_plans table exists and has carnivore plans
    console.log('📋 Test 1: Checking nutrition_plans table...');
    
    const { data: plans, error: plansError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('category', 'carnivoor')
      .order('plan_id');

    if (plansError) {
      console.error('   ❌ Error fetching nutrition plans:', plansError);
    } else {
      console.log(`   ✅ Found ${plans.length} carnivore nutrition plans:`);
      plans.forEach(plan => {
        console.log(`      - ${plan.name} (${plan.plan_id})`);
        console.log(`        Calories: ${plan.target_calories}, Protein: ${plan.target_protein}g`);
        console.log(`        Carbs: ${plan.target_carbs}g, Fat: ${plan.target_fat}g`);
        console.log(`        Goal: ${plan.goal}`);
      });
    }

    // Test 2: Check nutrition_weekplans table
    console.log('\n📅 Test 2: Checking nutrition_weekplans table...');
    
    const { data: weekplans, error: weekplansError } = await supabase
      .from('nutrition_weekplans')
      .select('*')
      .order('plan_id, day_of_week');

    if (weekplansError) {
      console.error('   ❌ Error fetching week plans:', weekplansError);
    } else {
      console.log(`   ✅ Found ${weekplans.length} week plan entries`);
      
      // Group by plan
      const plansByPlanId = weekplans.reduce((acc, plan) => {
        if (!acc[plan.plan_id]) acc[plan.plan_id] = [];
        acc[plan.plan_id].push(plan);
        return acc;
      }, {});

      Object.keys(plansByPlanId).forEach(planId => {
        console.log(`      ${planId}: ${plansByPlanId[planId].length} days`);
      });
    }

    // Test 3: Check meals table
    console.log('\n🍽️ Test 3: Checking meals table...');
    
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .order('plan_id, meal_time');

    if (mealsError) {
      console.error('   ❌ Error fetching meals:', mealsError);
    } else {
      console.log(`   ✅ Found ${meals.length} meal entries`);
      
      // Group by plan
      const mealsByPlanId = meals.reduce((acc, meal) => {
        if (!acc[meal.plan_id]) acc[meal.plan_id] = [];
        acc[meal.plan_id].push(meal);
        return acc;
      }, {});

      Object.keys(mealsByPlanId).forEach(planId => {
        console.log(`      ${planId}: ${mealsByPlanId[planId].length} meals`);
        mealsByPlanId[planId].forEach(meal => {
          console.log(`        - ${meal.meal_name} (${meal.meal_time}) - ${meal.calories_percentage}%`);
        });
      });
    }

    // Test 4: Verify all 3 carnivore plans exist
    console.log('\n🎯 Test 4: Verifying all 3 carnivore plans...');
    
    const expectedPlans = ['carnivoor_droogtrainen', 'carnivoor_onderhoud', 'carnivoor_spiermassa'];
    const foundPlans = plans ? plans.map(p => p.plan_id) : [];
    
    expectedPlans.forEach(expectedPlan => {
      if (foundPlans.includes(expectedPlan)) {
        console.log(`   ✅ ${expectedPlan} - Found`);
      } else {
        console.log(`   ❌ ${expectedPlan} - Missing`);
      }
    });

    // Test 5: Check if tables exist
    console.log('\n🗄️ Test 5: Checking table structure...');
    
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', { sql_query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('nutrition_plans', 'nutrition_weekplans', 'meals')
        ORDER BY table_name;
      ` });

    if (tablesError) {
      console.error('   ❌ Error checking tables:', tablesError);
    } else {
      console.log('   ✅ Tables found:');
      tables.forEach(table => {
        console.log(`      - ${table.table_name}`);
      });
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   🥗 Nutrition Plans: ${plans ? plans.length : 0}/3 carnivore plans`);
    console.log(`   📅 Week Plans: ${weekplans ? weekplans.length : 0} entries`);
    console.log(`   🍽️ Meals: ${meals ? meals.length : 0} entries`);
    
    if (plans && plans.length === 3 && weekplans && weekplans.length > 0 && meals && meals.length > 0) {
      console.log('\n✅ SUCCESS: All carnivore nutrition plans are properly set up!');
    } else {
      console.log('\n⚠️ WARNING: Some data may be missing. Please run the SQL setup script.');
    }

  } catch (error) {
    console.error('❌ Error testing carnivore nutrition plans:', error);
  }
}

// Run the test
testCarnivoorNutritionPlans();
