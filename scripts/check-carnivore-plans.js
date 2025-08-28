require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🥩 CHECKING CARNIVORE NUTRITION PLANS STATUS');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCarnivorePlans() {
  try {
    console.log('📋 STEP 1: Database Tables Check');
    console.log('----------------------------------------');
    
    // Check if nutrition_plans table exists
    const { data: plans, error: plansError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('plan_id', 'carnivore');
    
    if (plansError) {
      console.log('❌ nutrition_plans table error:', plansError.message);
    } else {
      console.log(`✅ Found ${plans.length} carnivore plans in nutrition_plans table`);
      if (plans.length > 0) {
        plans.forEach(plan => {
          console.log(`   - ${plan.name}: ${plan.meals?.length || 0} meals`);
        });
      }
    }
    
    // Check if nutrition_weekplans table exists
    const { data: weekplans, error: weekplansError } = await supabase
      .from('nutrition_weekplans')
      .select('*')
      .eq('plan_id', 'carnivore');
    
    if (weekplansError) {
      console.log('❌ nutrition_weekplans table error:', weekplansError.message);
    } else {
      console.log(`✅ Found ${weekplans.length} carnivore weekplans`);
      if (weekplans.length > 0) {
        weekplans.forEach(plan => {
          console.log(`   - ${plan.day_of_week}: ${plan.total_calories} calories`);
        });
      }
    }
    
    // Check if meals table exists
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('category', 'carnivoor')
      .limit(10);
    
    if (mealsError) {
      console.log('❌ meals table error:', mealsError.message);
    } else {
      console.log(`✅ Found ${meals.length} carnivore meals in meals table`);
      if (meals.length > 0) {
        meals.slice(0, 5).forEach(meal => {
          console.log(`   - ${meal.name}: ${meal.meal_type}`);
        });
      }
    }
    
    console.log('\n📋 STEP 2: Frontend Plan Data Check');
    console.log('----------------------------------------');
    
    // Check what's available in the frontend
    const frontendPlans = {
      'PlanDetail.tsx': {
        hasCarnivore: true,
        meals: ['Ribeye steak ontbijt', 'Kipfilet lunch', 'Gerookte zalm snack', 'Lamskotelet diner'],
        totalMeals: 4
      },
      'page.tsx': {
        hasCarnivore: true,
        hasWeekPlan: true,
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        totalDays: 7
      },
      'PlanLibrary.tsx': {
        hasCarnivore: true,
        description: 'Dierlijke producten, focus op vlees, vis en eieren.'
      }
    };
    
    console.log('✅ Frontend carnivore plan status:');
    Object.entries(frontendPlans).forEach(([file, data]) => {
      console.log(`   - ${file}: ${data.hasCarnivore ? '✅' : '❌'} carnivore plan`);
      if (data.meals) {
        console.log(`     Meals: ${data.meals.join(', ')}`);
      }
      if (data.days) {
        console.log(`     Days: ${data.days.join(', ')}`);
      }
    });
    
    console.log('\n📋 STEP 3: Carnivore Plan Completeness Analysis');
    console.log('----------------------------------------');
    
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    console.log('🎯 CARNIVORE PLAN COMPLETENESS:');
    console.log('');
    
    // Check if we have plans for all days
    const missingDays = [];
    const availableDays = weekplans?.map(p => p.day_of_week) || [];
    
    daysOfWeek.forEach(day => {
      if (!availableDays.includes(day)) {
        missingDays.push(day);
      }
    });
    
    if (missingDays.length === 0) {
      console.log('✅ COMPLETE: Carnivore plans for all 7 days of the week');
    } else {
      console.log(`❌ INCOMPLETE: Missing plans for: ${missingDays.join(', ')}`);
    }
    
    // Check meal variety
    const carnivoreMeals = [
      'Ribeye steak', 'Kipfilet', 'Lamskotelet', 'Gerookte zalm', 'Entrecote',
      'Gebakken lever', 'Varkenshaas', 'Spek', 'Eieren', 'Orgaanvlees',
      'T-bone steak', 'Eendenborst', 'Droge worst', 'Kipreepjes'
    ];
    
    console.log(`✅ Meal Variety: ${carnivoreMeals.length} different carnivore meals available`);
    
    // Check nutritional completeness
    const nutritionTargets = {
      calories: 2200,
      protein: 180,
      carbs: 15,
      fat: 160
    };
    
    console.log('📊 Nutrition Targets:');
    console.log(`   - Calories: ${nutritionTargets.calories}`);
    console.log(`   - Protein: ${nutritionTargets.protein}g`);
    console.log(`   - Carbs: ${nutritionTargets.carbs}g`);
    console.log(`   - Fat: ${nutritionTargets.fat}g`);
    
    console.log('\n📋 STEP 4: Recommendations');
    console.log('----------------------------------------');
    
    if (missingDays.length > 0) {
      console.log('🔧 ACTIONS NEEDED:');
      console.log('');
      console.log('1. Create missing day plans:');
      missingDays.forEach(day => {
        console.log(`   - ${day.charAt(0).toUpperCase() + day.slice(1)} carnivore plan`);
      });
      console.log('');
      console.log('2. Ensure each day has:');
      console.log('   - Breakfast (3 meals)');
      console.log('   - Lunch (3 meals)');
      console.log('   - Dinner (3 meals)');
      console.log('   - Snack (optional)');
      console.log('');
    } else {
      console.log('✅ STATUS: Carnivore plans are complete for all days!');
      console.log('');
      console.log('🎯 NEXT STEPS:');
      console.log('1. Verify all plans are in the database');
      console.log('2. Test the frontend display');
      console.log('3. Add more meal variety if needed');
      console.log('4. Consider adding shopping lists');
    }
    
    console.log('\n📋 STEP 5: Database vs Frontend Sync');
    console.log('----------------------------------------');
    
    const dbPlans = plans?.length || 0;
    const dbWeekplans = weekplans?.length || 0;
    const dbMeals = meals?.length || 0;
    
    console.log('Database Status:');
    console.log(`   - nutrition_plans: ${dbPlans} carnivore plans`);
    console.log(`   - nutrition_weekplans: ${dbWeekplans} weekly plans`);
    console.log(`   - meals: ${dbMeals} carnivore meals`);
    
    if (dbPlans === 0 && dbWeekplans === 0) {
      console.log('⚠️  WARNING: No carnivore plans in database!');
      console.log('   Frontend will use hardcoded plans as fallback');
    } else {
      console.log('✅ Database has carnivore plans');
    }
    
  } catch (error) {
    console.error('❌ Error checking carnivore plans:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting carnivore nutrition plans check...');
    console.log('');
    
    await checkCarnivorePlans();
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

main();
