import { NextRequest, NextResponse } from 'next/server';

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

    // Fetch real profile from the actual API
    const realApiResponse = await fetch(`http://localhost:3000/api/nutrition-plan-dynamic?planId=${planId}&userId=${userId}`);
    const realApiData = await realApiResponse.json();
    
    if (!realApiData.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch real plan data' 
      }, { status: 500 });
    }
    
    const profile = {
      target_calories: realApiData.data.userProfile.targetCalories,
      target_protein: realApiData.data.userProfile.targetProtein,
      target_carbs: realApiData.data.userProfile.targetCarbs,
      target_fat: realApiData.data.userProfile.targetFat,
      weight: realApiData.data.userProfile.weight
    };
    
    console.log('🔍 Real profile data:', profile);

    // Use real plan data from the API
    const planData = realApiData.data.weekPlan;
    console.log('🔍 Real plan data:', planData);

    // Calculate base plan calories from real data
    const basePlanCalories = calculateBasePlanCalories(planData);
    const scaleFactor = profile.target_calories / basePlanCalories;

    console.log(`📊 Base plan calories: ${basePlanCalories}`);
    console.log(`⚖️ Scale factor: ${scaleFactor.toFixed(3)}`);
    console.log(`🎯 Target macros: ${profile.target_calories} kcal, ${profile.target_protein}g protein, ${profile.target_carbs}g carbs, ${profile.target_fat}g fat`);

    // Apply initial scaling
    const scaledPlan = applyInitialScaling(planData, scaleFactor);

    // Calculate current totals
    const currentTotals = calculatePlanTotals(scaledPlan);

    console.log(`📈 Current totals: ${currentTotals.calories} kcal, ${currentTotals.protein}g protein, ${currentTotals.carbs}g carbs, ${currentTotals.fat}g fat`);

    // Find macro overages
    const overages = {
      calories: Math.max(0, currentTotals.calories - profile.target_calories),
      protein: Math.max(0, currentTotals.protein - profile.target_protein),
      carbs: Math.max(0, currentTotals.carbs - profile.target_carbs),
      fat: Math.max(0, currentTotals.fat - profile.target_fat)
    };

    console.log(`⚠️ Overages: ${overages.calories} kcal, ${overages.protein}g protein, ${overages.carbs}g carbs, ${overages.fat}g fat`);

    // Optimize by reducing ingredients
    const optimizedPlan = optimizePlan(scaledPlan, overages, profile);

    // Calculate final totals
    const finalTotals = calculatePlanTotals(optimizedPlan);

    console.log(`✅ Final totals: ${finalTotals.calories} kcal, ${finalTotals.protein}g protein, ${finalTotals.carbs}g carbs, ${finalTotals.fat}g fat`);

    // Calculate accuracy percentages
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
        scaleFactor,
        overages,
        optimizations: getOptimizationSummary(scaledPlan, optimizedPlan),
        debug: {
          basePlanCalories,
          profile,
          reducibleIngredients: getReducibleIngredientsDebug(scaledPlan),
          optimizationSteps: getOptimizationStepsDebug(scaledPlan, optimizedPlan),
          ingredientDetails: getIngredientDetailsDebug(scaledPlan, optimizedPlan)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error optimizing nutrition plan:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
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
      const mealTypes = ['ontbijt', 'lunch', 'snack1', 'snack2', 'diner', 'avondsnack'];
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && dayData[mealType].ingredients && Array.isArray(dayData[mealType].ingredients)) {
          dayData[mealType].ingredients.forEach((ingredient: any) => {
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

function applyInitialScaling(meals: any, scaleFactor: number): any {
  const scaledPlan = {};
  
  const days = Object.keys(meals);
  days.forEach(day => {
    const dayData = meals[day];
    scaledPlan[day] = {};
    
    if (dayData) {
      const mealTypes = ['ontbijt', 'lunch', 'snack1', 'snack2', 'diner', 'avondsnack'];
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && dayData[mealType].ingredients && Array.isArray(dayData[mealType].ingredients)) {
          scaledPlan[day][mealType] = {
            ...dayData[mealType],
            ingredients: dayData[mealType].ingredients.map((ingredient: any) => {
              const scaledAmount = scaleIngredientAmount(ingredient, scaleFactor);
              return {
                ...ingredient,
                amount: scaledAmount,
                originalAmount: ingredient.amount
              };
            })
          };
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

function calculatePlanTotals(plan: any): any {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  const days = Object.keys(plan);
  days.forEach(day => {
    const dayData = plan[day];
    if (dayData) {
      const mealTypes = ['ontbijt', 'lunch', 'snack1', 'snack2', 'diner', 'avondsnack'];
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && dayData[mealType].ingredients && Array.isArray(dayData[mealType].ingredients)) {
          dayData[mealType].ingredients.forEach((ingredient: any) => {
            const nutrition = calculateIngredientNutrition(ingredient);
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

function calculateIngredientNutrition(ingredient: any): any {
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
    calories: ingredient.calories_per_100g * multiplier,
    protein: ingredient.protein_per_100g * multiplier,
    carbs: ingredient.carbs_per_100g * multiplier,
    fat: ingredient.fat_per_100g * multiplier
  };
}

function optimizePlan(plan: any, overages: any, targetProfile: any): any {
  const optimizedPlan = JSON.parse(JSON.stringify(plan)); // Deep copy
  
  // Find all reducible ingredients (both per-piece and gram-based)
  const reducibleIngredients: any[] = [];
  
  const days = Object.keys(optimizedPlan);
  days.forEach(day => {
    const dayData = optimizedPlan[day];
    if (dayData) {
      const mealTypes = ['ontbijt', 'lunch_snack', 'lunch', 'avond_snack', 'diner', 'ochtend_snack', 'avond_snack'];
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && Array.isArray(dayData[mealType])) {
          dayData[mealType].forEach((ingredient: any, index: number) => {
            const nutrition = calculateIngredientNutrition(ingredient);
            
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
      });
      
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
      const mealTypes = ['ontbijt', 'lunch_snack', 'lunch', 'avond_snack', 'diner', 'ochtend_snack', 'avond_snack'];
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
                reduction: originalIngredient.amount - optimizedIngredient.amount,
                unit: originalIngredient.unit
              });
            }
          });
        }
      });
    }
  });
  
  return optimizations;
}

function getReducibleIngredientsDebug(plan: any): any[] {
  const reducibleIngredients: any[] = [];
  
  const days = Object.keys(plan);
  days.forEach(day => {
    const dayData = plan[day];
    if (dayData) {
      const mealTypes = ['ontbijt', 'lunch', 'snack1', 'snack2', 'diner', 'avondsnack'];
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && dayData[mealType].ingredients && Array.isArray(dayData[mealType].ingredients)) {
          dayData[mealType].ingredients.forEach((ingredient: any, index: number) => {
            const nutrition = calculateIngredientNutrition(ingredient);
            
            // Determine reduction potential based on unit type
            let reductionPotential = 0;
            let minAmount = 0;
            
            if (ingredient.unit === 'per_piece' || ingredient.unit === 'stuk') {
              minAmount = 1;
              reductionPotential = Math.max(0, ingredient.amount - minAmount);
            } else if (ingredient.unit === 'per_100g' || ingredient.unit === 'g') {
              minAmount = 5;
              reductionPotential = Math.max(0, ingredient.amount - minAmount);
            } else if (ingredient.unit === 'per_ml') {
              minAmount = 10;
              reductionPotential = Math.max(0, ingredient.amount - minAmount);
            }
            
            if (reductionPotential > 0) {
              reducibleIngredients.push({
                day,
                mealType,
                ingredient: ingredient.name,
                unit: ingredient.unit,
                currentAmount: ingredient.amount,
                minAmount,
                reductionPotential,
                nutrition: {
                  calories: Math.round(nutrition.calories),
                  protein: Math.round(nutrition.protein * 10) / 10,
                  carbs: Math.round(nutrition.carbs * 10) / 10,
                  fat: Math.round(nutrition.fat * 10) / 10
                },
                caloriesPerUnit: ingredient.unit === 'per_piece' || ingredient.unit === 'stuk' 
                  ? Math.round(nutrition.calories / ingredient.amount)
                  : Math.round(nutrition.calories / ingredient.amount * 100) / 100
              });
            }
          });
        }
      });
    }
  });
  
  // Sort by impact (highest calories first)
  reducibleIngredients.sort((a, b) => b.nutrition.calories - a.nutrition.calories);
  
  return reducibleIngredients;
}

function getOptimizationStepsDebug(originalPlan: any, optimizedPlan: any): any[] {
  const steps: any[] = [];
  
  const days = Object.keys(originalPlan);
  days.forEach(day => {
    const dayData = originalPlan[day];
    const optimizedDayData = optimizedPlan[day];
    
    if (dayData && optimizedDayData) {
      const mealTypes = ['ontbijt', 'lunch', 'snack1', 'snack2', 'diner', 'avondsnack'];
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && optimizedDayData[mealType] && 
            dayData[mealType].ingredients && optimizedDayData[mealType].ingredients) {
          dayData[mealType].ingredients.forEach((originalIngredient: any, index: number) => {
            const optimizedIngredient = optimizedDayData[mealType].ingredients[index];
            if (originalIngredient.amount !== optimizedIngredient.amount) {
              const originalNutrition = calculateIngredientNutrition(originalIngredient);
              const optimizedNutrition = calculateIngredientNutrition(optimizedIngredient);
              const reduction = originalIngredient.amount - optimizedIngredient.amount;
              const nutritionReduction = {
                calories: Math.round(originalNutrition.calories - optimizedNutrition.calories),
                protein: Math.round((originalNutrition.protein - optimizedNutrition.protein) * 10) / 10,
                carbs: Math.round((originalNutrition.carbs - optimizedNutrition.carbs) * 10) / 10,
                fat: Math.round((originalNutrition.fat - optimizedNutrition.fat) * 10) / 10
              };
              
              steps.push({
                step: steps.length + 1,
                day,
                mealType,
                ingredient: originalIngredient.name,
                unit: originalIngredient.unit,
                originalAmount: originalIngredient.amount,
                optimizedAmount: optimizedIngredient.amount,
                reduction,
                originalNutrition: {
                  calories: Math.round(originalNutrition.calories),
                  protein: Math.round(originalNutrition.protein * 10) / 10,
                  carbs: Math.round(originalNutrition.carbs * 10) / 10,
                  fat: Math.round(originalNutrition.fat * 10) / 10
                },
                optimizedNutrition: {
                  calories: Math.round(optimizedNutrition.calories),
                  protein: Math.round(optimizedNutrition.protein * 10) / 10,
                  carbs: Math.round(optimizedNutrition.carbs * 10) / 10,
                  fat: Math.round(optimizedNutrition.fat * 10) / 10
                },
                nutritionReduction,
                impact: `${nutritionReduction.calories} kcal, ${nutritionReduction.protein}g protein, ${nutritionReduction.carbs}g carbs, ${nutritionReduction.fat}g fat`
              });
            }
          });
        }
      });
    }
  });
  
  return steps;
}

function getIngredientDetailsDebug(originalPlan: any, optimizedPlan: any): any {
  const details = {
    totalIngredients: 0,
    reducibleIngredients: 0,
    optimizedIngredients: 0,
    byUnitType: {
      per_piece: { total: 0, reducible: 0, optimized: 0 },
      per_100g: { total: 0, reducible: 0, optimized: 0 },
      per_ml: { total: 0, reducible: 0, optimized: 0 }
    },
    byMealType: {}
  };
  
  const days = Object.keys(originalPlan);
  days.forEach(day => {
    const dayData = originalPlan[day];
    const optimizedDayData = optimizedPlan[day];
    
    if (dayData && optimizedDayData) {
      const mealTypes = ['ontbijt', 'lunch', 'snack1', 'snack2', 'diner', 'avondsnack'];
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && optimizedDayData[mealType] && 
            dayData[mealType].ingredients && optimizedDayData[mealType].ingredients) {
          if (!details.byMealType[mealType]) {
            details.byMealType[mealType] = { total: 0, reducible: 0, optimized: 0 };
          }
          
          dayData[mealType].ingredients.forEach((originalIngredient: any, index: number) => {
            const optimizedIngredient = optimizedDayData[mealType].ingredients[index];
            const unit = originalIngredient.unit || 'per_100g';
            
            details.totalIngredients++;
            details.byMealType[mealType].total++;
            
            if (details.byUnitType[unit]) {
              details.byUnitType[unit].total++;
            }
            
            // Check if reducible
            let reductionPotential = 0;
            if (unit === 'per_piece' || unit === 'stuk') {
              reductionPotential = Math.max(0, originalIngredient.amount - 1);
            } else if (unit === 'per_100g' || unit === 'g') {
              reductionPotential = Math.max(0, originalIngredient.amount - 5);
            } else if (unit === 'per_ml') {
              reductionPotential = Math.max(0, originalIngredient.amount - 10);
            }
            
            if (reductionPotential > 0) {
              details.reducibleIngredients++;
              details.byMealType[mealType].reducible++;
              if (details.byUnitType[unit]) {
                details.byUnitType[unit].reducible++;
              }
            }
            
            // Check if optimized
            if (originalIngredient.amount !== optimizedIngredient.amount) {
              details.optimizedIngredients++;
              details.byMealType[mealType].optimized++;
              if (details.byUnitType[unit]) {
                details.byUnitType[unit].optimized++;
              }
            }
          });
        }
      });
    }
  });
  
  return details;
}
