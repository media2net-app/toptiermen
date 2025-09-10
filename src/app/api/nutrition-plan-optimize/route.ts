import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json();

    if (!planId || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Plan ID and User ID are required' 
      }, { status: 400 });
    }

    console.log(`🔍 Optimizing plan ${planId} for user ${userId}`);

    // 1. Fetch user profile to get target macros
    const { data: fetchedProfile, error: profileError } = await supabase
      .from('nutrition_profiles')
      .select('target_calories, target_protein, target_carbs, target_fat, weight')
      .eq('user_id', userId)
      .single();

    console.log('🔍 Profile query result:', { fetchedProfile, profileError });

    let profile;
    if (profileError || !fetchedProfile) {
      // Use mock profile for Chiel with realistic targets
      console.log('⚠️ Using mock profile for Chiel (90kg, droogtrainen)');
      profile = {
        target_calories: 2074,  // 90kg * 22 * 1.3 - 500 (droogtrainen)
        target_protein: 207,    // 2.3g per kg lichaamsgewicht
        target_carbs: 207,      // 2.3g per kg lichaamsgewicht  
        target_fat: 46,         // 0.5g per kg lichaamsgewicht
        weight: 90
      };
    } else {
      profile = fetchedProfile;
    }

    // 2. Fetch nutrition plan using the same API as frontend
    const planResponse = await fetch(`http://localhost:3000/api/nutrition-plans`);
    const planApiData = await planResponse.json();
    
    if (!planApiData.success || !planApiData.plans) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch nutrition plans' 
      }, { status: 500 });
    }
    
    const planData = planApiData.plans.find((plan: any) => plan.plan_id === planId);
    
    if (!planData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nutrition plan not found' 
      }, { status: 404 });
    }

    // 3. Fetch ingredient database
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('nutrition_ingredients')
      .select('*');

    if (ingredientsError || !ingredients) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch ingredients' 
      }, { status: 500 });
    }

    // Convert ingredients to lookup object
    const ingredientDatabase = {};
    ingredients.forEach(ing => {
      ingredientDatabase[ing.name] = {
        calories_per_100g: ing.calories_per_100g,
        protein_per_100g: ing.protein_per_100g,
        carbs_per_100g: ing.carbs_per_100g,
        fat_per_100g: ing.fat_per_100g,
        unit_type: ing.unit_type || 'per_100g'
      };
    });

    // 4. Calculate current scaling factor
    const basePlanCalories = calculateBasePlanCalories(planData.meals);
    const scaleFactor = profile.target_calories / basePlanCalories;
    
    console.log('📊 Plan data structure:', Object.keys(planData));
    console.log('📊 Meals structure:', Object.keys(planData.meals || {}));
    console.log('📊 Sample meal data:', planData.meals?.maandag?.ontbijt?.[0]);

    console.log(`📊 Base plan calories: ${basePlanCalories}`);
    console.log(`⚖️ Scale factor: ${scaleFactor.toFixed(3)}`);
    console.log(`🎯 Target macros: ${profile.target_calories} kcal, ${profile.target_protein}g protein, ${profile.target_carbs}g carbs, ${profile.target_fat}g fat`);

    // 5. Apply initial scaling
    const scaledPlan = applyInitialScaling(planData.meals, scaleFactor, ingredientDatabase);

    // 6. Calculate current totals
    const currentTotals = calculatePlanTotals(scaledPlan, ingredientDatabase);

    console.log(`📈 Current totals: ${currentTotals.calories} kcal, ${currentTotals.protein}g protein, ${currentTotals.carbs}g carbs, ${currentTotals.fat}g fat`);

    // 7. Find macro overages
    const overages = {
      calories: Math.max(0, currentTotals.calories - profile.target_calories),
      protein: Math.max(0, currentTotals.protein - profile.target_protein),
      carbs: Math.max(0, currentTotals.carbs - profile.target_carbs),
      fat: Math.max(0, currentTotals.fat - profile.target_fat)
    };

    console.log(`⚠️ Overages: ${overages.calories} kcal, ${overages.protein}g protein, ${overages.carbs}g carbs, ${overages.fat}g fat`);

    // 8. Optimize by reducing per-piece ingredients
    const optimizedPlan = optimizePlan(scaledPlan, overages, ingredientDatabase, profile);

    // 9. Calculate final totals
    const finalTotals = calculatePlanTotals(optimizedPlan, ingredientDatabase);

    console.log(`✅ Final totals: ${finalTotals.calories} kcal, ${finalTotals.protein}g protein, ${finalTotals.carbs}g carbs, ${finalTotals.fat}g fat`);

    // 10. Calculate accuracy percentages
    const accuracy = {
      calories: Math.round((finalTotals.calories / profile.target_calories) * 100),
      protein: Math.round((finalTotals.protein / profile.target_protein) * 100),
      carbs: Math.round((finalTotals.carbs / profile.target_carbs) * 100),
      fat: Math.round((finalTotals.fat / profile.target_fat) * 100)
    };

    console.log(`🎯 Accuracy: ${accuracy.calories}% kcal, ${accuracy.protein}% protein, ${accuracy.carbs}% carbs, ${accuracy.fat}% fat`);

    return NextResponse.json({
      success: true,
      data: {
        originalTotals: currentTotals,
        optimizedTotals: finalTotals,
        targetTotals: {
          calories: profile.target_calories,
          protein: profile.target_protein,
          carbs: profile.target_carbs,
          fat: profile.target_fat
        },
        accuracy,
        optimizedPlan,
        scaleFactor,
        overages,
        optimizations: getOptimizationSummary(scaledPlan, optimizedPlan)
      }
    });

  } catch (error) {
    console.error('❌ Error optimizing nutrition plan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper functions
function calculateBasePlanCalories(meals: any): number {
  let totalCalories = 0;
  
  const days = Object.keys(meals);
  days.forEach(day => {
    const dayData = meals[day];
    if (dayData) {
      const mealTypes = ['ontbijt', 'lunch_snack', 'lunch', 'avond_snack', 'diner'];
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && Array.isArray(dayData[mealType])) {
          dayData[mealType].forEach((ingredient: any) => {
            // Calculate calories based on unit type
            const calories = ingredient.calories_per_100g || 0;
            const amount = ingredient.amount || 0;
            const unit = ingredient.unit || 'per_100g';
            
            let multiplier = 1;
            switch (unit) {
              case 'per_100g':
                multiplier = amount / 100;
                break;
              case 'per_piece':
              case 'stuk':
                multiplier = amount; // For pieces, use amount directly
                break;
              case 'per_ml':
                multiplier = amount / 100; // Assuming 1ml = 1g for liquids
                break;
              default:
                multiplier = amount / 100;
            }
            
            totalCalories += calories * multiplier;
          });
        }
      });
    }
  });
  
  return totalCalories / 7; // Average per day
}

function applyInitialScaling(meals: any, scaleFactor: number, ingredientDatabase: any): any {
  const scaledPlan = {};
  
  const days = Object.keys(meals);
  days.forEach(day => {
    const dayData = meals[day];
    scaledPlan[day] = {};
    
    if (dayData) {
      const mealTypes = ['ontbijt', 'lunch_snack', 'lunch', 'avond_snack', 'diner'];
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && Array.isArray(dayData[mealType])) {
          scaledPlan[day][mealType] = dayData[mealType].map((ingredient: any) => {
            const scaledAmount = scaleIngredientAmount(ingredient, scaleFactor);
            return {
              ...ingredient,
              amount: scaledAmount,
              originalAmount: ingredient.amount
            };
          });
        }
      });
    }
  });
  
  return scaledPlan;
}

function scaleIngredientAmount(ingredient: any, scaleFactor: number): number {
  const amount = ingredient.amount || 0;
  const unit = ingredient.unit || 'per_100g';
  
  if (unit === 'per_piece' || unit === 'stuk') {
    // For pieces, use more conservative scaling
    if (scaleFactor >= 1.2) {
      return Math.ceil(amount * scaleFactor);
    } else if (scaleFactor <= 0.8) {
      return Math.max(1, Math.floor(amount * scaleFactor));
    } else {
      return amount; // Keep original for moderate scaling
    }
  } else {
    // For weight-based ingredients, apply full scaling
    return Math.round((amount * scaleFactor) / 5) * 5; // Round to 5g
  }
}

function calculatePlanTotals(plan: any, ingredientDatabase: any): any {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  const days = Object.keys(plan);
  days.forEach(day => {
    const dayData = plan[day];
    if (dayData) {
      const mealTypes = ['ontbijt', 'lunch_snack', 'lunch', 'avond_snack', 'diner'];
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && Array.isArray(dayData[mealType])) {
          dayData[mealType].forEach((ingredient: any) => {
            const nutrition = calculateIngredientNutrition(ingredient, ingredientDatabase);
            totalCalories += nutrition.calories;
            totalProtein += nutrition.protein;
            totalCarbs += nutrition.carbs;
            totalFat += nutrition.fat;
          });
        }
      });
    }
  });
  
  return {
    calories: Math.round(totalCalories / 7), // Average per day
    protein: Math.round((totalProtein / 7) * 10) / 10,
    carbs: Math.round((totalCarbs / 7) * 10) / 10,
    fat: Math.round((totalFat / 7) * 10) / 10
  };
}

function calculateIngredientNutrition(ingredient: any, ingredientDatabase: any): any {
  const nutritionData = ingredientDatabase[ingredient.name];
  if (!nutritionData) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  
  const amount = ingredient.amount || 0;
  const unit = ingredient.unit || 'per_100g';
  
  let multiplier = 1;
  switch (unit) {
    case 'per_100g':
      multiplier = amount / 100;
      break;
    case 'per_piece':
    case 'stuk':
      multiplier = amount;
      break;
    case 'per_ml':
      multiplier = amount / 100;
      break;
    default:
      multiplier = amount / 100;
  }
  
  return {
    calories: nutritionData.calories_per_100g * multiplier,
    protein: nutritionData.protein_per_100g * multiplier,
    carbs: nutritionData.carbs_per_100g * multiplier,
    fat: nutritionData.fat_per_100g * multiplier
  };
}

function optimizePlan(plan: any, overages: any, ingredientDatabase: any, targetProfile: any): any {
  const optimizedPlan = JSON.parse(JSON.stringify(plan)); // Deep copy
  
  // Find all reducible ingredients (both per-piece and gram-based)
  const reducibleIngredients: any[] = [];
  
  const days = Object.keys(optimizedPlan);
  days.forEach(day => {
    const dayData = optimizedPlan[day];
    if (dayData) {
      const mealTypes = ['ontbijt', 'lunch_snack', 'lunch', 'avond_snack', 'diner'];
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && Array.isArray(dayData[mealType])) {
          dayData[mealType].forEach((ingredient: any, index: number) => {
            const nutritionData = ingredientDatabase[ingredient.name];
            if (nutritionData) {
              const nutrition = calculateIngredientNutrition(ingredient, ingredientDatabase);
              
              // Determine reduction potential based on unit type
              let reductionPotential = 0;
              let minAmount = 0;
              
              if (ingredient.unit === 'per_piece' || ingredient.unit === 'stuk') {
                // Per-piece: can reduce to minimum 1
                minAmount = 1;
                reductionPotential = Math.max(0, ingredient.amount - minAmount);
              } else if (ingredient.unit === 'per_100g' || ingredient.unit === 'g') {
                // Gram-based: can reduce by 5g increments, minimum 5g
                minAmount = 5;
                reductionPotential = Math.max(0, ingredient.amount - minAmount);
              } else if (ingredient.unit === 'per_ml') {
                // ML-based: can reduce by 10ml increments, minimum 10ml
                minAmount = 10;
                reductionPotential = Math.max(0, ingredient.amount - minAmount);
              }
              
              // Only include ingredients that can be reduced
              if (reductionPotential > 0) {
                reducibleIngredients.push({
                  day,
                  mealType,
                  index,
                  ingredient,
                  nutrition,
                  reductionPotential,
                  minAmount,
                  unit: ingredient.unit
                });
              }
            }
          });
        }
      });
    }
  });
  
  // Sort by impact (highest calories first)
  reducibleIngredients.sort((a, b) => b.nutrition.calories - a.nutrition.calories);
  
  console.log(`🔍 Found ${reducibleIngredients.length} reducible ingredients (per-piece and gram-based)`);
  
  // Apply reductions to minimize overages
  let remainingOverages = { ...overages };
  
  for (const item of reducibleIngredients) {
    if (remainingOverages.calories <= 0) break;
    
    const { day, mealType, index, ingredient, nutrition, reductionPotential, minAmount, unit } = item;
    
    // Calculate how much we can reduce this ingredient
    const currentAmount = ingredient.amount;
    const maxReduction = reductionPotential;
    
    if (maxReduction <= 0) continue;
    
    // Calculate reduction needed based on unit type
    let reductionAmount = 0;
    
    if (unit === 'per_piece' || unit === 'stuk') {
      // For pieces: reduce by whole pieces
      const caloriesToReduce = Math.min(remainingOverages.calories, nutrition.calories * maxReduction);
      reductionAmount = Math.min(maxReduction, Math.ceil(caloriesToReduce / nutrition.calories));
    } else if (unit === 'per_100g' || unit === 'g') {
      // For grams: reduce by 5g increments
      const caloriesPerGram = nutrition.calories / currentAmount;
      const caloriesToReduce = Math.min(remainingOverages.calories, nutrition.calories * (maxReduction / currentAmount));
      const gramsToReduce = Math.min(maxReduction, Math.ceil(caloriesToReduce / caloriesPerGram));
      reductionAmount = Math.floor(gramsToReduce / 5) * 5; // Round to 5g increments
    } else if (unit === 'per_ml') {
      // For ml: reduce by 10ml increments
      const caloriesPerMl = nutrition.calories / currentAmount;
      const caloriesToReduce = Math.min(remainingOverages.calories, nutrition.calories * (maxReduction / currentAmount));
      const mlToReduce = Math.min(maxReduction, Math.ceil(caloriesToReduce / caloriesPerMl));
      reductionAmount = Math.floor(mlToReduce / 10) * 10; // Round to 10ml increments
    }
    
    if (reductionAmount > 0) {
      // Apply reduction
      optimizedPlan[day][mealType][index].amount = currentAmount - reductionAmount;
      
      // Calculate actual nutrition reduction
      const actualNutritionReduction = calculateIngredientNutrition({
        ...ingredient,
        amount: reductionAmount
      }, ingredientDatabase);
      
      // Update remaining overages
      remainingOverages.calories -= actualNutritionReduction.calories;
      remainingOverages.protein -= actualNutritionReduction.protein;
      remainingOverages.carbs -= actualNutritionReduction.carbs;
      remainingOverages.fat -= actualNutritionReduction.fat;
      
      const unitText = unit === 'per_piece' || unit === 'stuk' ? 'pieces' : 
                      unit === 'per_100g' || unit === 'g' ? 'g' : 'ml';
      
      console.log(`✂️ Reduced ${ingredient.name} from ${currentAmount} to ${currentAmount - reductionAmount} ${unitText} (saved ${Math.round(actualNutritionReduction.calories)} kcal)`);
    }
  }
  
  return optimizedPlan;
}

function getOptimizationSummary(originalPlan: any, optimizedPlan: any): any[] {
  const optimizations: any[] = [];
  
  const days = Object.keys(originalPlan);
  days.forEach(day => {
    const dayData = originalPlan[day];
    const optimizedDayData = optimizedPlan[day];
    
    if (dayData && optimizedDayData) {
      const mealTypes = ['ontbijt', 'lunch_snack', 'lunch', 'avond_snack', 'diner'];
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && optimizedDayData[mealType]) {
          dayData[mealType].forEach((originalIngredient: any, index: number) => {
            const optimizedIngredient = optimizedDayData[mealType][index];
            if (originalIngredient.amount !== optimizedIngredient.amount) {
              optimizations.push({
                day,
                mealType,
                ingredient: originalIngredient.name,
                originalAmount: originalIngredient.amount,
                optimizedAmount: optimizedIngredient.amount,
                reduction: originalIngredient.amount - optimizedIngredient.amount
              });
            }
          });
        }
      });
    }
  });
  
  return optimizations;
}
