import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Ingredient database - will be loaded from database
let INGREDIENT_DATABASE: any = {};

async function getIngredientsFromDatabase() {
  try {
    const { data, error } = await supabase
      .from('nutrition_ingredients')
      .select('*');
    
    if (error) {
      console.error('Error loading ingredients:', error);
      return {};
    }
    
    const db: any = {};
    data.forEach(ingredient => {
      db[ingredient.name] = {
        calories: ingredient.calories_per_100g,
        protein: ingredient.protein_per_100g,
        carbs: ingredient.carbs_per_100g,
        fat: ingredient.fat_per_100g,
        unit_type: ingredient.unit_type
      };
    });
    
    return db;
  } catch (error) {
    console.error('Error in getIngredientsFromDatabase:', error);
    return {};
  }
}

interface SmartScalingResult {
  scaledPlan: any;
  scalingInfo: {
    scaleFactor: number;
    originalTotals: any;
    finalTotals: any;
    macroAdjustments: any;
    debugInfo: any;
  };
}

function calculateMealNutrition(ingredients: any[], ingredientDatabase: any): any {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  ingredients.forEach(ingredient => {
    
    // Try exact match first
    let nutritionData = ingredientDatabase[ingredient.name];
    
    // If not found, try trimmed version
    if (!nutritionData) {
      const trimmedName = ingredient.name.trim();
      nutritionData = ingredientDatabase[trimmedName];
    }
    
    // If still not found, try case-insensitive match
    if (!nutritionData) {
      const lowerName = ingredient.name.toLowerCase().trim();
      for (const [dbName, dbData] of Object.entries(ingredientDatabase)) {
        if (dbName.toLowerCase() === lowerName) {
          nutritionData = dbData;
          break;
        }
      }
    }
    
    if (!nutritionData) {
      console.log('❌ Ingredient not found in calculateMealNutrition:', ingredient.name, 'Available:', Object.keys(ingredientDatabase).slice(0, 5));
      return;
    }
    
    let multiplier = 1;
    const amount = ingredient.amount || 0;
    
    switch (nutritionData.unit_type) {
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
      case 'per_tbsp':
        multiplier = (amount * 15) / 100;
        break;
      case 'per_tsp':
        multiplier = (amount * 5) / 100;
        break;
      case 'per_cup':
        multiplier = (amount * 240) / 100;
        break;
      case 'per_plakje':
        multiplier = amount;
        break;
      default:
        multiplier = amount / 100;
    }
    
    totalCalories += nutritionData.calories * multiplier;
    totalProtein += nutritionData.protein * multiplier;
    totalCarbs += nutritionData.carbs * multiplier;
    totalFat += nutritionData.fat * multiplier;
  });
  
  return {
    calories: Math.round(totalCalories * 10) / 10,
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10
  };
}

function getMealName(mealType: string): string {
  const mealNames: Record<string, string> = {
    ontbijt: 'Ontbijt',
    ochtend_snack: 'Ochtend Snack',
    lunch: 'Lunch',
    lunch_snack: 'Lunch Snack',
    diner: 'Diner'
  };
  return mealNames[mealType] || mealType;
}

function calculatePlanTotals(plan: any, ingredientDatabase: any): any {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  const days = Object.keys(plan);
  days.forEach(day => {
    const dayData = plan[day];
    if (!dayData) return;
    
    const mealTypes = ['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner'];
    mealTypes.forEach(mealType => {
      if (dayData[mealType] && dayData[mealType].ingredients && Array.isArray(dayData[mealType].ingredients)) {
        const mealNutrition = calculateMealNutrition(dayData[mealType].ingredients, ingredientDatabase);
        totalCalories += mealNutrition.calories;
        totalProtein += mealNutrition.protein;
        totalCarbs += mealNutrition.carbs;
        totalFat += mealNutrition.fat;
      }
    });
  });
  
  // Return average per day
  const dayCount = days.length;
  return {
    calories: Math.round((totalCalories / dayCount) * 10) / 10,
    protein: Math.round((totalProtein / dayCount) * 10) / 10,
    carbs: Math.round((totalCarbs / dayCount) * 10) / 10,
    fat: Math.round((totalFat / dayCount) * 10) / 10
  };
}

function categorizeIngredientsByMacro(ingredients: any[], ingredientDatabase: any): any {
  const categories: {
    proteinRich: any[];
    carbRich: any[];
    fatRich: any[];
    balanced: any[];
  } = {
    proteinRich: [],
    carbRich: [],
    fatRich: [],
    balanced: []
  };
  
  ingredients.forEach(ingredient => {
    const nutritionData = ingredientDatabase[ingredient.name];
    if (!nutritionData) return;
    
    const calories = nutritionData.calories;
    const protein = nutritionData.protein;
    const carbs = nutritionData.carbs;
    const fat = nutritionData.fat;
    
    // Calculate macro percentages
    const proteinCalories = protein * 4;
    const carbCalories = carbs * 4;
    const fatCalories = fat * 9;
    const totalMacroCalories = proteinCalories + carbCalories + fatCalories;
    
    if (totalMacroCalories === 0) return;
    
    const proteinPercent = (proteinCalories / totalMacroCalories) * 100;
    const carbPercent = (carbCalories / totalMacroCalories) * 100;
    const fatPercent = (fatCalories / totalMacroCalories) * 100;
    
    // Categorize based on dominant macro
    if (proteinPercent > 40) {
      categories.proteinRich.push({ ...ingredient, macroPercent: proteinPercent });
    } else if (carbPercent > 40) {
      categories.carbRich.push({ ...ingredient, macroPercent: carbPercent });
    } else if (fatPercent > 40) {
      categories.fatRich.push({ ...ingredient, macroPercent: fatPercent });
    } else {
      categories.balanced.push(ingredient);
    }
  });
  
  return categories;
}

function smartScaleIngredients(
  ingredients: any[], 
  macroAdjustments: any, 
  ingredientDatabase: any,
  debugInfo: any
): any[] {
  const categorized = categorizeIngredientsByMacro(ingredients, ingredientDatabase);
  
  return ingredients.map(ingredient => {
    // Try exact match first
    let nutritionData = ingredientDatabase[ingredient.name];
    
    // If not found, try trimmed version
    if (!nutritionData) {
      const trimmedName = ingredient.name.trim();
      nutritionData = ingredientDatabase[trimmedName];
    }
    
    // If still not found, try case-insensitive match
    if (!nutritionData) {
      const lowerName = ingredient.name.toLowerCase().trim();
      for (const [dbName, dbData] of Object.entries(ingredientDatabase)) {
        if (dbName.toLowerCase() === lowerName) {
          nutritionData = dbData;
          break;
        }
      }
    }
    
    if (!nutritionData) return ingredient;
    
    let adjustmentFactor = 1;
    let adjustmentReason = 'no_adjustment';
    
    // Determine which macro this ingredient primarily contributes to
    const calories = nutritionData.calories;
    const protein = nutritionData.protein;
    const carbs = nutritionData.carbs;
    const fat = nutritionData.fat;
    
    const proteinCalories = protein * 4;
    const carbCalories = carbs * 4;
    const fatCalories = fat * 9;
    const totalMacroCalories = proteinCalories + carbCalories + fatCalories;
    
    if (totalMacroCalories > 0) {
      const proteinPercent = (proteinCalories / totalMacroCalories) * 100;
      const carbPercent = (carbCalories / totalMacroCalories) * 100;
      const fatPercent = (fatCalories / totalMacroCalories) * 100;
      
      // Apply macro-specific adjustments
      if (proteinPercent > 40 && macroAdjustments.protein !== 1) {
        adjustmentFactor = macroAdjustments.protein;
        adjustmentReason = 'protein_adjustment';
      } else if (carbPercent > 40 && macroAdjustments.carbs !== 1) {
        adjustmentFactor = macroAdjustments.carbs;
        adjustmentReason = 'carb_adjustment';
      } else if (fatPercent > 40 && macroAdjustments.fat !== 1) {
        adjustmentFactor = macroAdjustments.fat;
        adjustmentReason = 'fat_adjustment';
      }
    }
    
    // Apply the adjustment
    let newAmount = ingredient.amount * adjustmentFactor;
    
    // Round to reasonable values based on unit type
    const unit = nutritionData.unit_type || ingredient.unit || 'per_100g';
    
    if (unit === 'per_piece' || unit === 'stuk' || unit === 'per_plakje') {
      // For discrete items, round to whole numbers
      newAmount = Math.round(newAmount);
      newAmount = Math.max(1, newAmount);
    } else if (unit === 'per_100g' || unit === 'g') {
      // For weight-based items, round to 5g
      newAmount = Math.round(newAmount / 5) * 5;
      newAmount = Math.max(5, newAmount);
    } else if (unit === 'per_ml') {
      // For liquids, round to 10ml
      newAmount = Math.round(newAmount / 10) * 10;
      newAmount = Math.max(10, newAmount);
    } else {
      newAmount = Math.round(newAmount);
      newAmount = Math.max(1, newAmount);
    }
    
    // Store debug information
    if (adjustmentFactor !== 1) {
      debugInfo.ingredientAdjustments.push({
        name: ingredient.name,
        originalAmount: ingredient.amount,
        newAmount: newAmount,
        adjustmentFactor: adjustmentFactor,
        reason: adjustmentReason,
        macroPercentages: {
          protein: totalMacroCalories > 0 ? (proteinCalories / totalMacroCalories) * 100 : 0,
          carbs: totalMacroCalories > 0 ? (carbCalories / totalMacroCalories) * 100 : 0,
          fat: totalMacroCalories > 0 ? (fatCalories / totalMacroCalories) * 100 : 0
        }
      });
    }
    
    return {
      ...ingredient,
      amount: newAmount,
      originalAmount: ingredient.amount,
      adjustmentFactor: adjustmentFactor,
      adjustmentReason: adjustmentReason,
      unit: nutritionData.unit_type // Ensure unit type is passed through
    };
  });
}

function calculateMacroAdjustments(originalTotals: any, targetTotals: any): any {
  // Calculate overall scale factor to get calories close to target
  const targetCalories = targetTotals.calories;
  const originalCalories = originalTotals.calories;
  
  // Calculate base scale factor to get calories within 95-105% range
  const targetCalorieRange = { min: targetCalories * 0.95, max: targetCalories * 1.05 };
  let baseScaleFactor = 1;
  
  if (originalCalories < targetCalorieRange.min) {
    baseScaleFactor = targetCalorieRange.min / originalCalories;
  } else if (originalCalories > targetCalorieRange.max) {
    baseScaleFactor = targetCalorieRange.max / originalCalories;
  }
  
  // Apply base scaling to get close to target calories
  const scaledTotals = {
    protein: originalTotals.protein * baseScaleFactor,
    carbs: originalTotals.carbs * baseScaleFactor,
    fat: originalTotals.fat * baseScaleFactor
  };
  
  // Now calculate fine-tuning adjustments for each macro
  const adjustments = {
    protein: 1,
    carbs: 1,
    fat: 1
  };
  
  // Target ranges for individual macros (95-105%)
  const targetRanges = {
    protein: { min: targetTotals.protein * 0.95, max: targetTotals.protein * 1.05 },
    carbs: { min: targetTotals.carbs * 0.95, max: targetTotals.carbs * 1.05 },
    fat: { min: targetTotals.fat * 0.95, max: targetTotals.fat * 1.05 }
  };
  
  // Calculate adjustments to bring each macro into range (target 100% for each macro)
  if (scaledTotals.protein < targetRanges.protein.min) {
    adjustments.protein = targetTotals.protein / scaledTotals.protein; // Target exact amount
  } else if (scaledTotals.protein > targetRanges.protein.max) {
    adjustments.protein = targetTotals.protein / scaledTotals.protein; // Target exact amount
  }
  
  if (scaledTotals.carbs < targetRanges.carbs.min) {
    adjustments.carbs = targetTotals.carbs / scaledTotals.carbs; // Target exact amount
  } else if (scaledTotals.carbs > targetRanges.carbs.max) {
    adjustments.carbs = targetTotals.carbs / scaledTotals.carbs; // Target exact amount
  }
  
  if (scaledTotals.fat < targetRanges.fat.min) {
    adjustments.fat = targetTotals.fat / scaledTotals.fat; // Target exact amount
  } else if (scaledTotals.fat > targetRanges.fat.max) {
    adjustments.fat = targetTotals.fat / scaledTotals.fat; // Target exact amount
  }
  
  return adjustments;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const userId = searchParams.get('userId');
    const weightParam = searchParams.get('weight');
    
    if (!planId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing planId or userId'
      }, { status: 400 });
    }
    
    console.log('🧠 Smart scaling for plan:', planId, 'user:', userId, 'weight:', weightParam);
    
    // Load ingredient database
    INGREDIENT_DATABASE = await getIngredientsFromDatabase();
    console.log('📊 Loaded', Object.keys(INGREDIENT_DATABASE).length, 'ingredients');
    
    // Get user's nutrition profile or use default values
    let userProfile;
    if (weightParam) {
      // Use weight parameter for testing/admin purposes
      const weight = parseFloat(weightParam);
      userProfile = {
        user_id: userId,
        weight: weight,
        age: 30, // Default age
        height: 180, // Default height
        target_calories: 2500, // Default calories
        target_protein: 0,
        target_carbs: 0,
        target_fat: 0,
        goal: 'cut',
        activity_level: 'moderate'
      };
      console.log('🎯 Using weight parameter for testing:', weight);
    } else {
      // Get from database
      const { data: profileData, error: profileError } = await supabase
        .from('nutrition_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError || !profileData) {
        return NextResponse.json({
          success: false,
          error: 'User nutrition profile not found'
        }, { status: 404 });
      }
      userProfile = profileData;
    }
    
    // Get the plan from database
    const { data: planData, error: planError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('plan_id', planId)
      .single();
    
    if (planError || !planData) {
      return NextResponse.json({
        success: false,
        error: 'Plan not found'
      }, { status: 404 });
    }
    
    // Get base plan structure
    let basePlan = planData.meals;
    if (planData.meals && planData.meals.weekly_plan) {
      basePlan = planData.meals.weekly_plan;
    }
    
    console.log('🔍 Base plan structure:', Object.keys(basePlan));
    console.log('🔍 Maandag structure:', basePlan.maandag ? Object.keys(basePlan.maandag) : 'No maandag');
    console.log('🔍 Maandag ontbijt:', basePlan.maandag?.ontbijt ? 'Found' : 'Not found');
    
    // Calculate original plan totals
    const originalTotals = calculatePlanTotals(basePlan, INGREDIENT_DATABASE);
    console.log('📊 Original plan totals:', originalTotals);
    
    // Calculate macro targets if not set in user profile
    let targetProtein = userProfile.target_protein;
    let targetCarbs = userProfile.target_carbs;
    let targetFat = userProfile.target_fat;
    
    // If macro targets are not set, calculate them based on goal and weight
    if (!targetProtein || targetProtein === 0) {
      if (userProfile.goal === 'cut') {
        targetProtein = Math.round(userProfile.weight * 2.2); // 2.2g per kg for cutting
      } else if (userProfile.goal === 'bulk') {
        targetProtein = Math.round(userProfile.weight * 2.0); // 2.0g per kg for bulking
      } else {
        targetProtein = Math.round(userProfile.weight * 2.1); // 2.1g per kg for maintenance
      }
    }
    
    if (!targetCarbs || targetCarbs === 0) {
      if (userProfile.goal === 'cut') {
        targetCarbs = Math.round(userProfile.weight * 0.3); // Low carb for cutting
      } else if (userProfile.goal === 'bulk') {
        targetCarbs = Math.round(userProfile.weight * 3.0); // High carb for bulking
      } else {
        targetCarbs = Math.round(userProfile.weight * 2.0); // Moderate carb for maintenance
      }
    }
    
    if (!targetFat || targetFat === 0) {
      // Calculate fat based on remaining calories
      const proteinCalories = targetProtein * 4;
      const carbCalories = targetCarbs * 4;
      const remainingCalories = userProfile.target_calories - proteinCalories - carbCalories;
      targetFat = Math.round(remainingCalories / 9); // 9 calories per gram of fat
    }
    
    // Target totals from user profile
    const targetTotals = {
      calories: userProfile.target_calories,
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat
    };
    console.log('🎯 Target totals:', targetTotals);
    
    // Calculate base scaling factor to get calories in range
    const targetCalories = targetTotals.calories;
    const originalCalories = originalTotals.calories;
    const targetCalorieRange = { min: targetCalories * 0.95, max: targetCalories * 1.05 };
    let baseScaleFactor = 1;
    
    if (originalCalories < targetCalorieRange.min) {
      baseScaleFactor = targetCalorieRange.min / originalCalories;
    } else if (originalCalories > targetCalorieRange.max) {
      baseScaleFactor = targetCalorieRange.max / originalCalories;
    }
    
    console.log('📊 Base scale factor:', baseScaleFactor);
    
    // Calculate macro adjustments needed (on top of base scaling)
    const macroAdjustments = calculateMacroAdjustments(originalTotals, targetTotals);
    console.log('⚖️ Macro adjustments:', macroAdjustments);
    
    // Initialize debug info
    const debugInfo = {
      originalTotals,
      targetTotals,
      macroAdjustments,
      ingredientAdjustments: []
    };
    
    // Apply smart scaling
    const scaledPlan = {};
    const days = Object.keys(basePlan);
    
    days.forEach(day => {
      const dayData = basePlan[day];
      if (!dayData) return;
      
      scaledPlan[day] = {};
      const mealTypes = ['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner'];
      const mealTypeMapping = {
        'ontbijt': 'ontbijt',
        'ochtend_snack': 'snack1',
        'lunch': 'lunch',
        'lunch_snack': 'snack2',
        'diner': 'diner'
      };
      
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && dayData[mealType].ingredients && Array.isArray(dayData[mealType].ingredients)) {
          // First apply base scaling to all ingredients
          const baseScaledIngredients = dayData[mealType].ingredients.map(ingredient => ({
            ...ingredient,
            amount: ingredient.amount * baseScaleFactor
          }));
          
          // Then apply macro-specific adjustments
          const smartScaledIngredients = smartScaleIngredients(
            baseScaledIngredients, 
            macroAdjustments, 
            INGREDIENT_DATABASE,
            debugInfo
          );
          
          // Calculate meal nutrition
          const mealNutrition = calculateMealNutrition(smartScaledIngredients, INGREDIENT_DATABASE);
          
          // Create complete meal structure with mapped meal type
          const mappedMealType = mealTypeMapping[mealType] || mealType;
          scaledPlan[day][mappedMealType] = {
            name: getMealName(mealType),
            ingredients: smartScaledIngredients,
            nutrition: mealNutrition,
            ...mealNutrition
          };
        }
      });
      
      // Calculate daily totals for this day
      let dailyCalories = 0;
      let dailyProtein = 0;
      let dailyCarbs = 0;
      let dailyFat = 0;
      
      mealTypes.forEach(mealType => {
        const mappedMealType = mealTypeMapping[mealType] || mealType;
        if (scaledPlan[day][mappedMealType] && scaledPlan[day][mappedMealType].nutrition) {
          dailyCalories += scaledPlan[day][mappedMealType].nutrition.calories;
          dailyProtein += scaledPlan[day][mappedMealType].nutrition.protein;
          dailyCarbs += scaledPlan[day][mappedMealType].nutrition.carbs;
          dailyFat += scaledPlan[day][mappedMealType].nutrition.fat;
        }
      });
      
      // Add daily totals to the day
      scaledPlan[day].dailyTotals = {
        calories: Math.round(dailyCalories * 10) / 10,
        protein: Math.round(dailyProtein * 10) / 10,
        carbs: Math.round(dailyCarbs * 10) / 10,
        fat: Math.round(dailyFat * 10) / 10
      };
    });
    
    // Calculate final totals
    const finalTotals = calculatePlanTotals(scaledPlan, INGREDIENT_DATABASE);
    console.log('✅ Final totals:', finalTotals);
    
    // Calculate weight-based scale factor
    const planBaseWeight = 100; // Plans are based on 100kg
    const userWeight = userProfile.weight;
    const weightScaleFactor = userWeight / planBaseWeight;
    
    // Calculate final scale factor (for compatibility)
    const scaleFactor = finalTotals.calories / originalTotals.calories;
    
    // Calculate plan percentages from original totals
    const totalMacroCalories = originalTotals.protein * 4 + originalTotals.carbs * 4 + originalTotals.fat * 9;
    const planPercentages = {
      protein: totalMacroCalories > 0 ? Math.round(((originalTotals.protein * 4) / totalMacroCalories) * 100) : 0,
      carbs: totalMacroCalories > 0 ? Math.round(((originalTotals.carbs * 4) / totalMacroCalories) * 100) : 0,
      fat: totalMacroCalories > 0 ? Math.round(((originalTotals.fat * 9) / totalMacroCalories) * 100) : 0
    };

    const scalingInfo = {
      scaleFactor: Math.round(weightScaleFactor * 100) / 100, // Use weight-based factor
      originalTotals,
      finalTotals,
      macroAdjustments,
      userWeight,
      planBaseWeight,
      targetCalories: targetTotals.calories,
      targetProtein: targetTotals.protein,
      targetCarbs: targetTotals.carbs,
      targetFat: targetTotals.fat,
      planPercentages,
      debugInfo
    };
    
    return NextResponse.json({
      success: true,
      plan: scaledPlan,
      scalingInfo,
      userProfile
    });
    
  } catch (error) {
    console.error('Error in smart scaling:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
