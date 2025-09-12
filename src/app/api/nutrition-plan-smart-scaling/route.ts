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
    const nutritionData = ingredientDatabase[ingredient.name];
    if (!nutritionData) return;
    
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

function calculatePlanTotals(plan: any, ingredientDatabase: any): any {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  const days = Object.keys(plan);
  days.forEach(day => {
    const dayData = plan[day];
    if (!dayData) return;
    
    const mealTypes = ['ontbijt', 'lunch_snack', 'lunch', 'avond_snack', 'diner'];
    mealTypes.forEach(mealType => {
      if (dayData[mealType] && Array.isArray(dayData[mealType])) {
        const mealNutrition = calculateMealNutrition(dayData[mealType], ingredientDatabase);
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
  const categories = {
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
    const nutritionData = ingredientDatabase[ingredient.name];
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
          protein: proteinPercent,
          carbs: carbPercent,
          fat: fatPercent
        }
      });
    }
    
    return {
      ...ingredient,
      amount: newAmount,
      originalAmount: ingredient.amount,
      adjustmentFactor: adjustmentFactor,
      adjustmentReason: adjustmentReason
    };
  });
}

function calculateMacroAdjustments(originalTotals: any, targetTotals: any): any {
  const adjustments = {
    protein: 1,
    carbs: 1,
    fat: 1
  };
  
  // Calculate adjustment factors to get within 95-105% range
  const targetRanges = {
    protein: { min: targetTotals.protein * 0.95, max: targetTotals.protein * 1.05 },
    carbs: { min: targetTotals.carbs * 0.95, max: targetTotals.carbs * 1.05 },
    fat: { min: targetTotals.fat * 0.95, max: targetTotals.fat * 1.05 }
  };
  
  // Check if we need adjustments
  if (originalTotals.protein < targetRanges.protein.min) {
    adjustments.protein = targetRanges.protein.min / originalTotals.protein;
  } else if (originalTotals.protein > targetRanges.protein.max) {
    adjustments.protein = targetRanges.protein.max / originalTotals.protein;
  }
  
  if (originalTotals.carbs < targetRanges.carbs.min) {
    adjustments.carbs = targetRanges.carbs.min / originalTotals.carbs;
  } else if (originalTotals.carbs > targetRanges.carbs.max) {
    adjustments.carbs = targetRanges.carbs.max / originalTotals.carbs;
  }
  
  if (originalTotals.fat < targetRanges.fat.min) {
    adjustments.fat = targetRanges.fat.min / originalTotals.fat;
  } else if (originalTotals.fat > targetRanges.fat.max) {
    adjustments.fat = targetRanges.fat.max / originalTotals.fat;
  }
  
  return adjustments;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const userId = searchParams.get('userId');
    
    if (!planId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing planId or userId'
      }, { status: 400 });
    }
    
    console.log('🧠 Smart scaling for plan:', planId, 'user:', userId);
    
    // Load ingredient database
    INGREDIENT_DATABASE = await getIngredientsFromDatabase();
    console.log('📊 Loaded', Object.keys(INGREDIENT_DATABASE).length, 'ingredients');
    
    // Get user's nutrition profile
    const { data: userProfile, error: profileError } = await supabase
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError || !userProfile) {
      return NextResponse.json({
        success: false,
        error: 'User nutrition profile not found'
      }, { status: 404 });
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
    
    // Calculate original plan totals
    const originalTotals = calculatePlanTotals(basePlan, INGREDIENT_DATABASE);
    console.log('📊 Original plan totals:', originalTotals);
    
    // Target totals from user profile
    const targetTotals = {
      calories: userProfile.target_calories,
      protein: userProfile.target_protein,
      carbs: userProfile.target_carbs,
      fat: userProfile.target_fat
    };
    console.log('🎯 Target totals:', targetTotals);
    
    // Calculate macro adjustments needed
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
      const mealTypes = ['ontbijt', 'lunch_snack', 'lunch', 'avond_snack', 'diner'];
      
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && Array.isArray(dayData[mealType])) {
          const smartScaledIngredients = smartScaleIngredients(
            dayData[mealType], 
            macroAdjustments, 
            INGREDIENT_DATABASE,
            debugInfo
          );
          
          scaledPlan[day][mealType] = smartScaledIngredients;
        }
      });
    });
    
    // Calculate final totals
    const finalTotals = calculatePlanTotals(scaledPlan, INGREDIENT_DATABASE);
    console.log('✅ Final totals:', finalTotals);
    
    // Calculate final scale factor (for compatibility)
    const scaleFactor = finalTotals.calories / originalTotals.calories;
    
    const scalingInfo = {
      scaleFactor: Math.round(scaleFactor * 100) / 100,
      originalTotals,
      finalTotals,
      macroAdjustments,
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
