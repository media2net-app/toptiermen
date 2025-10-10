/**
 * Fix Nutrition Plans - Correct Ingredient Values
 * 
 * Dit script corrigeert alle voedingsplannen met de juiste ingredient waardes
 * uit de master nutrition_ingredients table.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixNutritionPlans() {
  console.log('🔧 Starting nutrition plans ingredient correction...\n');

  try {
    // 1. Fetch all master ingredients
    const { data: masterIngredients, error: ingredientsError } = await supabase
      .from('nutrition_ingredients')
      .select('*');

    if (ingredientsError) throw ingredientsError;

    console.log(`✅ Loaded ${masterIngredients.length} master ingredients\n`);

    // Create lookup map
    const ingredientMap = new Map();
    masterIngredients.forEach(ing => {
      ingredientMap.set(ing.id, ing);
    });

    // 2. Fetch all nutrition plans
    const { data: plans, error: plansError } = await supabase
      .from('nutrition_plans')
      .select('*');

    if (plansError) throw plansError;

    console.log(`📋 Found ${plans.length} plans to check\n`);

    let fixedCount = 0;
    let totalIssues = 0;

    // 3. Process each plan
    for (const plan of plans) {
      console.log(`\n📦 Checking Plan ${plan.id}: ${plan.name}`);
      
      if (!plan.meals || !plan.meals.weekly_plan) {
        console.log('  ⚠️  No weekly plan found, skipping');
        continue;
      }

      let planModified = false;
      const weeklyPlan = plan.meals.weekly_plan;

      // Loop through all days
      for (const day of Object.keys(weeklyPlan)) {
        const dayPlan = weeklyPlan[day];
        
        // Loop through all meals
        for (const mealType of Object.keys(dayPlan)) {
          const meal = dayPlan[mealType];
          
          if (!meal || !meal.ingredients || !Array.isArray(meal.ingredients)) {
            continue;
          }

          // Check each ingredient
          for (let i = 0; i < meal.ingredients.length; i++) {
            const ing = meal.ingredients[i];
            const masterIng = ingredientMap.get(ing.id);

            if (!masterIng) {
              console.log(`  ⚠️  ${day} - ${mealType}: Ingredient ${ing.name} not found in master list`);
              continue;
            }

            // Check if values match
            const needsUpdate = 
              ing.calories_per_100g !== masterIng.calories_per_100g ||
              ing.protein_per_100g !== masterIng.protein_per_100g ||
              ing.carbs_per_100g !== masterIng.carbs_per_100g ||
              ing.fat_per_100g !== masterIng.fat_per_100g;

            if (needsUpdate) {
              console.log(`  🔄 ${day} - ${mealType}: ${ing.name}`);
              console.log(`     OLD: ${ing.calories_per_100g} kcal | ${ing.protein_per_100g}p | ${ing.carbs_per_100g}c | ${ing.fat_per_100g}f`);
              console.log(`     NEW: ${masterIng.calories_per_100g} kcal | ${masterIng.protein_per_100g}p | ${masterIng.carbs_per_100g}c | ${masterIng.fat_per_100g}f`);

              // Update the ingredient values
              meal.ingredients[i].calories_per_100g = masterIng.calories_per_100g;
              meal.ingredients[i].protein_per_100g = masterIng.protein_per_100g;
              meal.ingredients[i].carbs_per_100g = masterIng.carbs_per_100g;
              meal.ingredients[i].fat_per_100g = masterIng.fat_per_100g;

              planModified = true;
              totalIssues++;
            }
          }

          // Recalculate meal nutrition if modified
          if (planModified && meal.ingredients) {
            meal.nutrition = calculateMealNutrition(meal.ingredients);
          }
        }
      }

      // Update plan if modified
      if (planModified) {
        const { error: updateError } = await supabase
          .from('nutrition_plans')
          .update({ meals: plan.meals })
          .eq('id', plan.id);

        if (updateError) {
          console.error(`  ❌ Error updating plan ${plan.id}:`, updateError);
        } else {
          console.log(`  ✅ Plan ${plan.id} updated successfully`);
          fixedCount++;
        }
      } else {
        console.log('  ✓ No issues found');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`  - Plans checked: ${plans.length}`);
    console.log(`  - Plans fixed: ${fixedCount}`);
    console.log(`  - Total ingredient issues corrected: ${totalIssues}`);
    console.log('='.repeat(60));
    console.log('\n✅ Nutrition plans correction complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Helper function to calculate meal nutrition
function calculateMealNutrition(ingredients) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  ingredients.forEach(ingredient => {
    const amount = ingredient.amount || 0;
    const unit = (ingredient.unit || 'per_100g').toLowerCase();
    let factor = 1;

    // Calculate factor based on unit type
    if (unit === 'per_100g' || unit === 'gram' || unit === 'g') {
      factor = amount / 100;
    } else if (unit === 'per_piece' || unit === 'stuks' || unit === 'stuk' || unit === 'per_plakje' || unit === 'plakje') {
      // 🔧 FIX: For piece units, factor is just the amount
      // calories_per_100g for pieces actually means "per piece", not per 100g
      factor = amount;
    } else if (unit === 'per_30g') {
      factor = amount * 0.3;
    } else if (unit === 'per_100ml' || unit === 'ml') {
      factor = amount / 100;
    } else {
      factor = amount / 100; // Default
    }

    totalCalories += (ingredient.calories_per_100g || 0) * factor;
    totalProtein += (ingredient.protein_per_100g || 0) * factor;
    totalCarbs += (ingredient.carbs_per_100g || 0) * factor;
    totalFat += (ingredient.fat_per_100g || 0) * factor;
  });

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10
  };
}

// Run the fix
fixNutritionPlans()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

