require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNutritionPlans() {
  try {
    console.log('🔍 Checking current nutrition plans...\n');

    // Check nutrition_plans table
    console.log('📋 Checking nutrition_plans table...');
    const { data: plans, error: plansError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (plansError) {
      console.error('❌ Error fetching nutrition plans:', plansError);
    } else {
      console.log(`✅ Found ${plans?.length || 0} nutrition plans:`);
      if (plans && plans.length > 0) {
        plans.forEach((plan, index) => {
          console.log(`   ${index + 1}. ${plan.name} (${plan.plan_id})`);
          console.log(`      - Category: ${plan.category}`);
          console.log(`      - Active: ${plan.is_active}`);
          console.log(`      - Created: ${plan.created_at}`);
          console.log('');
        });
      } else {
        console.log('   No nutrition plans found');
      }
    }

    // Check nutrition_weekplans table
    console.log('📅 Checking nutrition_weekplans table...');
    const { data: weekplans, error: weekplansError } = await supabase
      .from('nutrition_weekplans')
      .select('*')
      .order('created_at', { ascending: false });

    if (weekplansError) {
      console.error('❌ Error fetching nutrition weekplans:', weekplansError);
    } else {
      console.log(`✅ Found ${weekplans?.length || 0} nutrition weekplans:`);
      if (weekplans && weekplans.length > 0) {
        weekplans.forEach((weekplan, index) => {
          console.log(`   ${index + 1}. Plan: ${weekplan.plan_id} - Day: ${weekplan.day_of_week}`);
          console.log(`      - Calories: ${weekplan.total_calories}`);
          console.log(`      - Protein: ${weekplan.total_protein}g`);
          console.log(`      - Carbs: ${weekplan.total_carbs}g`);
          console.log(`      - Fat: ${weekplan.total_fat}g`);
          console.log('');
        });
      } else {
        console.log('   No nutrition weekplans found');
      }
    }

    // Check meals table
    console.log('🍽️ Checking meals table...');
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false });

    if (mealsError) {
      console.error('❌ Error fetching meals:', mealsError);
    } else {
      console.log(`✅ Found ${meals?.length || 0} meals:`);
      if (meals && meals.length > 0) {
        // Group meals by plan_type
        const mealsByPlan = meals.reduce((acc, meal) => {
          const planType = meal.plan_type || 'Unknown';
          if (!acc[planType]) {
            acc[planType] = [];
          }
          acc[planType].push(meal);
          return acc;
        }, {});

        Object.entries(mealsByPlan).forEach(([planType, planMeals]) => {
          console.log(`   📋 ${planType}: ${planMeals.length} meals`);
          planMeals.slice(0, 3).forEach((meal, index) => {
            console.log(`      ${index + 1}. ${meal.name} (${meal.meal_type})`);
          });
          if (planMeals.length > 3) {
            console.log(`      ... and ${planMeals.length - 3} more`);
          }
          console.log('');
        });
      } else {
        console.log('   No meals found');
      }
    }

    console.log('📊 SUMMARY:');
    console.log('============================================================');
    console.log(`   Nutrition Plans: ${plans?.length || 0}`);
    console.log(`   Nutrition Weekplans: ${weekplans?.length || 0}`);
    console.log(`   Meals: ${meals?.length || 0}`);
    console.log('');
    console.log('💡 RECOMMENDATIONS:');
    console.log('============================================================');
    console.log('1. We need exactly 3 nutrition plans:');
    console.log('   - Carnivoor / Animal Based');
    console.log('   - Voedingsplan op Maat');
    console.log('   - (Third plan to be determined)');
    console.log('');
    console.log('2. Each plan should have:');
    console.log('   - Complete week structure (7 days)');
    console.log('   - Multiple meals per day');
    console.log('   - Proper nutrition calculations');
    console.log('   - Carnivoor meals with organ meats, fatty cuts, etc.');

  } catch (error) {
    console.error('❌ Error checking nutrition plans:', error);
  }
}

checkNutritionPlans();
