require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNutritionStatus() {
  try {
    console.log('🍽️ Testing Nutrition & Food Plans Status...\n');

    // 1. Test nutrition_plans table
    console.log('1️⃣ Testing nutrition_plans table...');
    try {
      const { data: nutritionPlans, error: plansError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .limit(10);

      if (plansError) {
        console.log('❌ nutrition_plans table error:', plansError.message);
      } else {
        console.log(`✅ nutrition_plans table exists - Found ${nutritionPlans?.length || 0} plans`);
        if (nutritionPlans && nutritionPlans.length > 0) {
          nutritionPlans.forEach(plan => {
            console.log(`   📋 ${plan.name} (${plan.plan_id || 'no plan_id'}) - ${plan.is_active ? 'Active' : 'Inactive'}`);
          });
        }
      }
    } catch (e) {
      console.log('❌ nutrition_plans table does not exist');
    }

    // 2. Test nutrition_ingredients table
    console.log('\n2️⃣ Testing nutrition_ingredients table...');
    try {
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('nutrition_ingredients')
        .select('*')
        .limit(10);

      if (ingredientsError) {
        console.log('❌ nutrition_ingredients table error:', ingredientsError.message);
      } else {
        console.log(`✅ nutrition_ingredients table exists - Found ${ingredients?.length || 0} ingredients`);
        if (ingredients && ingredients.length > 0) {
          ingredients.forEach(ingredient => {
            console.log(`   🥗 ${ingredient.name} (${ingredient.category})`);
          });
        }
      }
    } catch (e) {
      console.log('❌ nutrition_ingredients table does not exist');
    }

    // 3. Test nutrition_recipes table
    console.log('\n3️⃣ Testing nutrition_recipes table...');
    try {
      const { data: recipes, error: recipesError } = await supabase
        .from('nutrition_recipes')
        .select('*')
        .limit(10);

      if (recipesError) {
        console.log('❌ nutrition_recipes table error:', recipesError.message);
      } else {
        console.log(`✅ nutrition_recipes table exists - Found ${recipes?.length || 0} recipes`);
        if (recipes && recipes.length > 0) {
          recipes.forEach(recipe => {
            console.log(`   🍳 ${recipe.name} (${recipe.meal_type || 'no type'})`);
          });
        }
      }
    } catch (e) {
      console.log('❌ nutrition_recipes table does not exist');
    }

    // 4. Test nutrition_educational_hubs table
    console.log('\n4️⃣ Testing nutrition_educational_hubs table...');
    try {
      const { data: educationalHubs, error: hubsError } = await supabase
        .from('nutrition_educational_hubs')
        .select('*')
        .limit(10);

      if (hubsError) {
        console.log('❌ nutrition_educational_hubs table error:', hubsError.message);
      } else {
        console.log(`✅ nutrition_educational_hubs table exists - Found ${educationalHubs?.length || 0} articles`);
        if (educationalHubs && educationalHubs.length > 0) {
          educationalHubs.forEach(hub => {
            console.log(`   📚 ${hub.title} (${hub.category})`);
          });
        }
      }
    } catch (e) {
      console.log('❌ nutrition_educational_hubs table does not exist');
    }

    // 5. Test user_nutrition_plans table
    console.log('\n5️⃣ Testing user_nutrition_plans table...');
    try {
      const { data: userPlans, error: userPlansError } = await supabase
        .from('user_nutrition_plans')
        .select('*')
        .limit(5);

      if (userPlansError) {
        console.log('❌ user_nutrition_plans table error:', userPlansError.message);
      } else {
        console.log(`✅ user_nutrition_plans table exists - Found ${userPlans?.length || 0} user plans`);
      }
    } catch (e) {
      console.log('❌ user_nutrition_plans table does not exist');
    }

    // 6. Test API endpoints
    console.log('\n6️⃣ Testing nutrition API endpoints...');
    try {
      const response = await fetch('http://localhost:3000/api/admin/migrate-nutrition-plans');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ /api/admin/migrate-nutrition-plans endpoint working');
        if (data.plans) {
          console.log(`   📋 Found ${data.plans.length} plans via API`);
        }
      } else {
        console.log('❌ /api/admin/migrate-nutrition-plans endpoint not working');
      }
    } catch (e) {
      console.log('❌ Could not test API endpoint (server might not be running)');
    }

    // 7. Check frontend integration
    console.log('\n7️⃣ Checking frontend integration...');
    try {
      const { data: usersWithNutrition, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, selected_nutrition_plan')
        .not('selected_nutrition_plan', 'is', null)
        .limit(5);

      if (usersError) {
        console.log('❌ Could not check user nutrition plans:', usersError.message);
      } else {
        console.log(`✅ Found ${usersWithNutrition?.length || 0} users with nutrition plans`);
        if (usersWithNutrition && usersWithNutrition.length > 0) {
          usersWithNutrition.forEach(user => {
            console.log(`   👤 ${user.email} - Plan: ${user.selected_nutrition_plan}`);
          });
        }
      }
    } catch (e) {
      console.log('❌ Could not check user nutrition plans');
    }

    console.log('\n🎉 Nutrition Status Testing Completed!');
    console.log('📊 Summary:');
    console.log('   🍽️ Nutrition Plans - Check above for status');
    console.log('   🥗 Ingredients - Check above for status');
    console.log('   🍳 Recipes - Check above for status');
    console.log('   📚 Educational Content - Check above for status');
    console.log('   👤 User Plans - Check above for status');
    console.log('   🔗 API Endpoints - Check above for status');

  } catch (error) {
    console.error('❌ Error testing nutrition status:', error);
  }
}

testNutritionStatus();
