import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to check if ingredients have been updated since a given timestamp
async function checkIngredientsUpdatedSince(timestamp: string) {
  try {
    const { data: ingredients, error } = await supabase
      .from('nutrition_ingredients')
      .select('updated_at')
      .eq('is_active', true)
      .gt('updated_at', timestamp)
      .limit(1);
    
    if (error) {
      console.error('❌ Error checking ingredient updates:', error);
      return false; // Assume no updates if we can't check
    }
    
    return ingredients && ingredients.length > 0;
  } catch (error) {
    console.error('❌ Error in checkIngredientsUpdatedSince:', error);
    return false;
  }
}

// Function to fetch ingredients from database
async function getIngredientsFromDatabase() {
  try {
    const { data: ingredients, error } = await supabase
      .from('nutrition_ingredients')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error('❌ Error fetching ingredients from database:', error);
      return {};
    }
    
    // Convert database format to lookup object by both name and ID
    const ingredientLookup = {};
    const ingredientByIdLookup = {};
    
    ingredients?.forEach(ingredient => {
      const nutritionData = {
        id: ingredient.id,
        name: ingredient.name,
        calories: ingredient.calories_per_100g,
        protein: ingredient.protein_per_100g,
        carbs: ingredient.carbs_per_100g,
        fat: ingredient.fat_per_100g,
        unit_type: ingredient.unit_type,
        updated_at: ingredient.updated_at
      };
      
      // Lookup by name (for backward compatibility)
      ingredientLookup[ingredient.name] = nutritionData;
      
      // Lookup by ID (preferred method)
      ingredientByIdLookup[ingredient.id] = nutritionData;
    });
    
    console.log('✅ Loaded', Object.keys(ingredientLookup).length, 'ingredients from database');
    return {
      byName: ingredientLookup,
      byId: ingredientByIdLookup
    };
  } catch (error) {
    console.error('❌ Error in getIngredientsFromDatabase:', error);
    return { byName: {}, byId: {} };
  }
}

// Basis weekplan voor Carnivoor - Droogtrainen (met verhoudingen)
const BASE_CARNIVOOR_DROOGTRAINEN_PLAN = {
  monday: {
    ontbijt: [
      { name: '1 Ei', baseAmount: 3, unit: 'stuks' },
      { name: 'Spek', baseAmount: 50, unit: 'gram' }
    ],
    ontbijt_snack: [
      { name: '1 Handje Macadamia Noten', baseAmount: 1, unit: 'handje' }
    ],
    lunch: [
      { name: 'Kipfilet (Gegrild)', baseAmount: 150, unit: 'gram' },
      { name: '1 Handje Walnoten', baseAmount: 1, unit: 'handje' }
    ],
    lunch_snack: [
      { name: '1 Handje Pistachenoten', baseAmount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'Ribeye Steak', baseAmount: 200, unit: 'gram' },
      { name: 'Orgaanvlees (Lever)', baseAmount: 50, unit: 'gram' }
    ],
    diner_snack: [
      { name: '1 Handje Macadamia Noten', baseAmount: 1, unit: 'handje' }
    ]
  },
  tuesday: {
    ontbijt: [
      { name: '1 Ei', baseAmount: 2, unit: 'stuks' },
      { name: 'Ham', baseAmount: 75, unit: 'gram' }
    ],
    lunch: [
      { name: 'Zalm (Wild)', baseAmount: 150, unit: 'gram' },
      { name: '1 Handje Amandelen', baseAmount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'Mager Rundergehakt', baseAmount: 200, unit: 'gram' },
      { name: 'Orgaanvlees (Hart)', baseAmount: 50, unit: 'gram' }
    ]
  },
  wednesday: {
    ontbijt: [
      { name: '1 Ei', baseAmount: 3, unit: 'stuks' },
      { name: 'Salami', baseAmount: 40, unit: 'gram' }
    ],
    lunch: [
      { name: 'Kalkoenfilet (Gegrild)', baseAmount: 150, unit: 'gram' },
      { name: '1 Handje Macadamia Noten', baseAmount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'T-Bone Steak', baseAmount: 200, unit: 'gram' },
      { name: 'Makreel', baseAmount: 100, unit: 'gram' }
    ]
  },
  thursday: {
    ontbijt: [
      { name: '1 Ei', baseAmount: 2, unit: 'stuks' },
      { name: 'Worst', baseAmount: 60, unit: 'gram' }
    ],
    lunch: [
      { name: 'Lamsvlees', baseAmount: 150, unit: 'gram' },
      { name: '1 Handje Hazelnoten', baseAmount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'Biefstuk', baseAmount: 200, unit: 'gram' },
      { name: 'Tonijn in Olijfolie', baseAmount: 100, unit: 'gram' }
    ]
  },
  friday: {
    ontbijt: [
      { name: '1 Ei', baseAmount: 3, unit: 'stuks' },
      { name: 'Tartaar', baseAmount: 50, unit: 'gram' }
    ],
    lunch: [
      { name: 'Varkenshaas', baseAmount: 150, unit: 'gram' },
      { name: '1 Handje Cashewnoten', baseAmount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'Rundergehakt (15% vet)', baseAmount: 200, unit: 'gram' },
      { name: 'Haring', baseAmount: 100, unit: 'gram' }
    ]
  },
  saturday: {
    ontbijt: [
      { name: '1 Ei', baseAmount: 2, unit: 'stuks' },
      { name: 'Duitse Biefstuk', baseAmount: 60, unit: 'gram' }
    ],
    lunch: [
      { name: 'Kippendijen', baseAmount: 150, unit: 'gram' },
      { name: '1 Handje Pecannoten', baseAmount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'Eendenborst', baseAmount: 200, unit: 'gram' },
      { name: 'Sardines', baseAmount: 100, unit: 'gram' }
    ]
  },
  sunday: {
    ontbijt: [
      { name: '1 Ei', baseAmount: 3, unit: 'stuks' },
      { name: 'Carpaccio', baseAmount: 50, unit: 'gram' }
    ],
    lunch: [
      { name: 'Gans', baseAmount: 150, unit: 'gram' },
      { name: '1 Handje Pistachenoten', baseAmount: 1, unit: 'handje' }
    ],
    diner: [
      { name: 'Rundergehakt (20% vet)', baseAmount: 200, unit: 'gram' },
      { name: 'Witvis', baseAmount: 120, unit: 'gram' }
    ]
  }
};

// Bereken calories van basis plan
function calculateBasePlanCalories(ingredientDatabase = {}) {
  let totalCalories = 0;
  const days = Object.keys(BASE_CARNIVOOR_DROOGTRAINEN_PLAN);
  
  days.forEach(day => {
    const dayPlan = BASE_CARNIVOOR_DROOGTRAINEN_PLAN[day];
    ['ontbijt', 'lunch', 'diner', 'ontbijt_snack', 'lunch_snack', 'diner_snack'].forEach(mealType => {
      if (dayPlan[mealType]) {
        dayPlan[mealType].forEach(ingredient => {
          const nutritionData = ingredientDatabase[ingredient.name];
          if (nutritionData) {
            let calories = 0;
            if (ingredient.unit === 'stuks' && ingredient.name === '1 Ei') {
              calories = nutritionData.calories * ingredient.baseAmount;
            } else if (ingredient.unit === 'handje') {
              calories = nutritionData.calories * ingredient.baseAmount;
            } else {
              calories = (nutritionData.calories * ingredient.baseAmount) / 100;
            }
            totalCalories += calories;
          }
        });
      }
    });
  });
  
  return Math.round(totalCalories / 7); // Gemiddelde per dag
}


// Function to get ingredient nutrition data from database (preferred method)
function getIngredientNutritionData(ingredient, ingredientDatabase) {
  // First try to get by ID (preferred method)
  if (ingredient.id && ingredientDatabase.byId && ingredientDatabase.byId[ingredient.id]) {
    return ingredientDatabase.byId[ingredient.id];
  }
  
  // Fallback to name lookup (for backward compatibility)
  if (ingredientDatabase.byName && ingredientDatabase.byName[ingredient.name]) {
    return ingredientDatabase.byName[ingredient.name];
  }
  
  console.warn(`⚠️ Nutrition data not found for ingredient: ${ingredient.name} (ID: ${ingredient.id})`);
  return null;
}

// Function to enrich ingredient with fresh data from database
function enrichIngredientWithDatabaseData(ingredient, ingredientDatabase) {
  const nutritionData = getIngredientNutritionData(ingredient, ingredientDatabase);
  
  if (nutritionData) {
    return {
      ...ingredient,
      // Override stored nutrition data with fresh database data
      calories_per_100g: nutritionData.calories,
      protein_per_100g: nutritionData.protein,
      carbs_per_100g: nutritionData.carbs,
      fat_per_100g: nutritionData.fat,
      unit: nutritionData.unit_type, // Use database unit_type as source of truth
      name: nutritionData.name, // Use database name as source of truth
      // Keep original amount and other properties
      amount: ingredient.amount,
      id: ingredient.id
    };
  }
  
  // If no database data found, return original ingredient with warning
  console.warn(`⚠️ Using stored data for ingredient: ${ingredient.name} (ID: ${ingredient.id})`);
  return ingredient;
}

// Bereken nutritionele waarden voor een maaltijd
function calculateMealNutrition(ingredients, ingredientDatabase) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  ingredients.forEach(ingredient => {
    const nutritionData = getIngredientNutritionData(ingredient, ingredientDatabase);
    if (nutritionData) {
      let multiplier = 0;
      
      // Handle different unit types based on database unit_type (not ingredient.unit)
      if (nutritionData.unit_type === 'per_piece' || nutritionData.unit_type === 'per_plakje' || nutritionData.unit_type === 'stuk') {
        multiplier = ingredient.amount;
      } else if (nutritionData.unit_type === 'per_100g' || nutritionData.unit_type === 'g') {
        multiplier = ingredient.amount / 100;
      } else if (nutritionData.unit_type === 'per_ml') {
        multiplier = ingredient.amount / 100; // Assuming 1ml = 1g for liquids
      } else if (nutritionData.unit_type === 'handje') {
        multiplier = ingredient.amount;
      } else {
        // Default to per 100g calculation
        multiplier = ingredient.amount / 100;
      }
      
      totalCalories += nutritionData.calories * multiplier;
      totalProtein += nutritionData.protein * multiplier;
      totalCarbs += nutritionData.carbs * multiplier;
      totalFat += nutritionData.fat * multiplier;
    }
  });
  
  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10
  };
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const planId = searchParams.get('planId');
    
    if (!userId || !planId) {
      return NextResponse.json({
        success: false,
        error: 'userId and planId are required'
      }, { status: 400 });
    }

    console.log('🗑️ Deleting custom plan:', { planId, userId });

    // Delete custom plan
    const { error } = await supabase
      .from('user_nutrition_plans')
      .delete()
      .eq('user_id', userId)
      .eq('plan_type', planId);

    if (error) {
      console.error('❌ Error deleting custom plan:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ Custom plan deleted successfully');
    return NextResponse.json({
      success: true,
      message: 'Custom plan deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting custom plan:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const planId = searchParams.get('planId');
    
    if (!userId || !planId) {
      return NextResponse.json({
        success: false,
        error: 'userId and planId are required'
      }, { status: 400 });
    }

    console.log('🔍 Fetching dynamic plan:', { planId, userId });

    // First check if user has a custom plan
    const { data: customPlanData, error: customError } = await supabase
      .from('user_nutrition_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_type', planId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!customError && customPlanData && customPlanData.length > 0) {
      console.log('✅ Custom plan found, checking if user profile has been updated');
      
      // Get current user profile to check if it has been updated
      const { data: currentProfile, error: profileError } = await supabase
        .from('nutrition_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profileError && currentProfile) {
        const customPlan = customPlanData[0];
        const customPlanWeekData = customPlan.week_plan;
        
        // Check if the custom plan's user profile matches current profile
        // Also check if ingredients have been updated since plan creation
        const ingredientsUpdated = await checkIngredientsUpdatedSince(customPlan.created_at);
        
        if (customPlanWeekData.userProfile && 
            customPlanWeekData.userProfile.weight === currentProfile.weight &&
            customPlanWeekData.userProfile.targetCalories === currentProfile.target_calories &&
            !ingredientsUpdated) {
          console.log('✅ Custom plan is up to date, returning custom data');
          return NextResponse.json({
            success: true,
            data: customPlanWeekData,
            isCustomPlan: true,
            lastUpdated: customPlan.updated_at
          });
        } else {
          if (ingredientsUpdated) {
            console.log('🔄 Custom plan is outdated due to ingredient updates, will regenerate');
          } else {
            console.log('🔄 Custom plan is outdated due to profile changes, will regenerate');
          }
        }
      } else {
        console.log('⚠️ Could not fetch current profile, proceeding with custom plan');
        const customPlan = customPlanData[0];
        return NextResponse.json({
          success: true,
          data: customPlan.week_plan,
          isCustomPlan: true,
          lastUpdated: customPlan.updated_at
        });
      }
    }

    console.log('ℹ️ No custom plan found, generating base plan');

    // Load ingredients from database
    const ingredientDatabase = await getIngredientsFromDatabase();

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


    // Get user's nutrition profile
    const { data: userProfile, error: profileError } = await supabase
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // For testing purposes, create a default profile if not found
    let profile = userProfile;
    if (profileError || !userProfile) {
      profile = {
        user_id: userId,
        age: 30,
        weight: 80,
        height: 180,
        gender: 'male',
        activity_level: 'moderate',
        fitness_goal: 'spiermassa',
        target_calories: planData.target_calories,
        target_protein: planData.target_protein,
        target_carbs: planData.target_carbs,
        target_fat: planData.target_fat,
        is_carnivore: true
      };
    }


    // Use the database plan - check for weekly_plan structure first
    let basePlan = planData.meals;
    if (planData.meals && planData.meals.weekly_plan) {
      basePlan = planData.meals.weekly_plan;
    }

    // Calculate base plan calories from database plan
    const basePlanCalories = calculateBasePlanCaloriesFromDatabase(basePlan);

    // Calculate scale factor based on weight ratio (90kg vs 100kg = 0.9)
    // This ensures the scaling factor reflects the weight difference, not calorie difference
    const standardWeight = 100; // Standard plan is based on 100kg
    const scaleFactor = profile.weight / standardWeight;

    // Generate scaled meal plan
    const scaledPlan = {};
    const days = Object.keys(basePlan);
    
    days.forEach(day => {
      const dayPlan = basePlan[day];
      scaledPlan[day] = {};
      
      // Process meal structure - handle both formats
      let mealTypes: string[] = [];
      
      // Check if this day has the maandag format (with meals object)
      if (dayPlan.meals && typeof dayPlan.meals === 'object') {
        mealTypes = Object.keys(dayPlan.meals);
        mealTypes.forEach(mealType => {
          const meal = dayPlan.meals[mealType];
          if (meal) {
            // Map database meal types to frontend expected types
            let frontendMealType = mealType;
            if (mealType === 'ochtend_snack') frontendMealType = 'snack1';
            else if (mealType === 'lunch_snack') frontendMealType = 'snack2';
            else if (mealType === 'avond_snack') frontendMealType = 'avondsnack';
            
            // Use nutrition data directly from database (maandag format)
            const baseNutrition = meal;
          
            // If nutrition data exists, use it directly
            let mealNutrition;
            if (baseNutrition && baseNutrition.calories !== undefined) {
              mealNutrition = {
                calories: baseNutrition.calories || 0,
                protein: baseNutrition.protein || 0,
                carbs: baseNutrition.carbs || 0,
                fat: baseNutrition.fat || 0
              };
            } else {
              // Fallback to 0 if no nutrition data
              mealNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            }
            
            scaledPlan[day][frontendMealType] = {
              name: meal.name || frontendMealType,
              ingredients: scaleIngredientAmounts(meal.ingredients || [], scaleFactor, {
                calories: profile.target_calories / 7,
                protein: (profile.target_calories * (planData.protein_percentage || 0) / 100) / 4 / 7,
                carbs: (profile.target_calories * (planData.carbs_percentage || 0) / 100) / 4 / 7,
                fat: (profile.target_calories * (planData.fat_percentage || 0) / 100) / 9 / 7
              }, ingredientDatabase),
              nutrition: mealNutrition
            };
          }
        });
      } else {
        // Process direct meal structure (weekly_plan format for other days)
        mealTypes = Object.keys(dayPlan).filter(key => 
          !['dailyTotals', 'time'].includes(key)
        );
        
        mealTypes.forEach(mealType => {
          if (dayPlan[mealType]) {
            const meal = dayPlan[mealType];
            
            // Map database meal types to frontend expected types
            let frontendMealType = mealType;
            if (mealType === 'ochtend_snack') frontendMealType = 'snack1';
            else if (mealType === 'lunch_snack') frontendMealType = 'snack2';
            else if (mealType === 'avond_snack') frontendMealType = 'avondsnack';
            
            // Use nutrition data directly from database (other days format)
            const baseNutrition = meal.nutrition || meal;
            
            // If nutrition data exists, use it directly
            let mealNutrition;
            if (baseNutrition && baseNutrition.calories !== undefined) {
              mealNutrition = {
                calories: baseNutrition.calories || 0,
                protein: baseNutrition.protein || 0,
                carbs: baseNutrition.carbs || 0,
                fat: baseNutrition.fat || 0
              };
            } else {
              // Fallback to 0 if no nutrition data
              mealNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            }
            
            scaledPlan[day][frontendMealType] = {
              name: meal.name || frontendMealType,
              ingredients: scaleIngredientAmounts(meal.ingredients || [], scaleFactor, {
                calories: profile.target_calories / 7,
                protein: (profile.target_calories * (planData.protein_percentage || 0) / 100) / 4 / 7,
                carbs: (profile.target_calories * (planData.carbs_percentage || 0) / 100) / 4 / 7,
                fat: (profile.target_calories * (planData.fat_percentage || 0) / 100) / 9 / 7
              }, ingredientDatabase),
              nutrition: mealNutrition
            };
          }
        });
      }
      
      // Calculate daily totals including all meals and snacks
      let dailyCalories = 0;
      let dailyProtein = 0;
      let dailyCarbs = 0;
      let dailyFat = 0;
      
      // Sum up all meals for this day
      Object.values(scaledPlan[day]).forEach(meal => {
        if (meal && typeof meal === 'object' && 'nutrition' in meal && meal.nutrition) {
          const nutrition = meal.nutrition as { calories: number; protein: number; carbs: number; fat: number };
          dailyCalories += nutrition.calories;
          dailyProtein += nutrition.protein;
          dailyCarbs += nutrition.carbs;
          dailyFat += nutrition.fat;
        }
      });
      
      scaledPlan[day].dailyTotals = {
        calories: Math.round(dailyCalories),
        protein: Math.round(dailyProtein * 10) / 10,
        carbs: Math.round(dailyCarbs * 10) / 10,
        fat: Math.round(dailyFat * 10) / 10
      };
    });

    // Calculate weekly averages
    let weeklyCalories = 0;
    let weeklyProtein = 0;
    let weeklyCarbs = 0;
    let weeklyFat = 0;
    
    days.forEach(day => {
      const dailyTotals = scaledPlan[day].dailyTotals;
      weeklyCalories += dailyTotals.calories;
      weeklyProtein += dailyTotals.protein;
      weeklyCarbs += dailyTotals.carbs;
      weeklyFat += dailyTotals.fat;
    });
    
    const weeklyAverages = {
      calories: Math.round(weeklyCalories / 7),
      protein: Math.round((weeklyProtein / 7) * 10) / 10,
      carbs: Math.round((weeklyCarbs / 7) * 10) / 10,
      fat: Math.round((weeklyFat / 7) * 10) / 10
    };

    console.log('🔍 Debug scalingInfo:', {
      basePlanCalories,
      scaleFactor,
      targetCalories: profile.target_calories,
      planTargetCalories: profile.target_calories
    });

    // Calculate macro targets based on plan percentages and user's target calories
    const targetProtein = Math.round((profile.target_calories * (planData.protein_percentage || 0) / 100) / 4);
    const targetCarbs = Math.round((profile.target_calories * (planData.carbs_percentage || 0) / 100) / 4);
    const targetFat = Math.round((profile.target_calories * (planData.fat_percentage || 0) / 100) / 9);

    return NextResponse.json({
      success: true,
      data: {
        planId: planData.plan_id,
        planName: planData.name,
        userProfile: {
          targetCalories: profile.target_calories,
          targetProtein: targetProtein,
          targetCarbs: targetCarbs,
          targetFat: targetFat,
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          goal: profile.fitness_goal
        },
        scalingInfo: {
          basePlanCalories,
          scaleFactor: scaleFactor ? Math.round(scaleFactor * 100) / 100 : 1,
          targetCalories: profile.target_calories,
          planTargetCalories: planData.target_calories // Standard plan calories for 100kg
        },
        // Plan-specific macro data
        planPercentages: {
          protein: planData.protein_percentage || 0,
          carbs: planData.carbs_percentage || 0,
          fat: planData.fat_percentage || 0
        },
        planTargets: {
          target_calories: profile.target_calories,
          target_protein: Math.round((profile.target_calories * (planData.protein_percentage || 0) / 100) / 4),
          target_carbs: Math.round((profile.target_calories * (planData.carbs_percentage || 0) / 100) / 4),
          target_fat: Math.round((profile.target_calories * (planData.fat_percentage || 0) / 100) / 9)
        },
        weekPlan: scaledPlan,
        weeklyAverages,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error generating dynamic nutrition plan:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Function to calculate nutrition for ingredients
function calculateIngredientNutrition(ingredients, ingredientDatabase) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  ingredients.forEach(ingredient => {
    const nutritionData = getIngredientNutritionData(ingredient, ingredientDatabase);
    if (nutritionData) {
      let multiplier = 0;
      
      // Handle different unit types based on database unit_type (not ingredient.unit)
      if (nutritionData.unit_type === 'per_piece' || nutritionData.unit_type === 'per_plakje' || nutritionData.unit_type === 'stuk') {
        multiplier = ingredient.amount;
      } else if (nutritionData.unit_type === 'per_100g' || nutritionData.unit_type === 'g') {
        multiplier = ingredient.amount / 100;
      } else if (nutritionData.unit_type === 'per_ml') {
        multiplier = ingredient.amount / 100;
      } else {
        multiplier = ingredient.amount / 100;
      }
      
      totalCalories += nutritionData.calories * multiplier;
      totalProtein += nutritionData.protein * multiplier;
      totalCarbs += nutritionData.carbs * multiplier;
      totalFat += nutritionData.fat * multiplier;
    }
  });
  
  return { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat };
}

// Function to enrich all ingredients with fresh database data
function enrichIngredientsWithDatabaseData(ingredients, ingredientDatabase) {
  if (!ingredients) return ingredients;
  
  return ingredients.map(ingredient => enrichIngredientWithDatabaseData(ingredient, ingredientDatabase));
}

// Function to intelligently scale ingredient amounts with macro optimization
function scaleIngredientAmounts(ingredients, scaleFactor, targetNutrition: any = null, ingredientDatabase = {}) {
  if (!ingredients || scaleFactor === 1) return ingredients;
  
  // Step 1: Basic scaling
  let scaledIngredients = ingredients.map(ingredient => {
    if (ingredient.amount) {
      const originalAmount = ingredient.amount; // Store original amount
      
      // Get nutrition data to determine unit type
      const nutritionData = getIngredientNutritionData(ingredient, ingredientDatabase);
      
      // Handle piece-based ingredients (stuk, per_piece, per_plakje) with smart scaling
      if (nutritionData && (nutritionData.unit_type === 'per_piece' || nutritionData.unit_type === 'per_plakje' || nutritionData.unit_type === 'stuk')) {
        // For plakjes, be more conservative with scaling to avoid showing 1 instead of 2
        if (nutritionData.unit_type === 'per_plakje') {
          // Only scale plakjes if factor is very significant
          if (scaleFactor >= 1.5) {
            // Round up for significant scaling (e.g., 1.6 -> 3 plakjes)
            const scaledAmount = Math.ceil(ingredient.amount * scaleFactor);
            return {
              ...ingredient,
              amount: scaledAmount,
              unit: nutritionData ? nutritionData.unit_type : ingredient.unit, // Use database unit_type
              originalAmount: originalAmount // Store original for debug
            };
          } else if (scaleFactor <= 0.6) {
            // Round down for significant reduction (e.g., 0.5 -> 1 plakje)
            const scaledAmount = Math.max(1, Math.floor(ingredient.amount * scaleFactor));
            return {
              ...ingredient,
              amount: scaledAmount,
              unit: nutritionData ? nutritionData.unit_type : ingredient.unit, // Use database unit_type
              originalAmount: originalAmount // Store original for debug
            };
          } else {
            // Keep original for moderate scaling (0.6 < factor < 1.5)
            return {
              ...ingredient,
              unit: nutritionData ? nutritionData.unit_type : ingredient.unit, // Use database unit_type
              originalAmount: originalAmount // Store original for debug
            };
          }
        } else {
          // Original logic for other piece-based ingredients
          if (scaleFactor >= 1.2) {
            // Round up for significant scaling (e.g., 1.4 -> 2 pieces)
            const scaledAmount = Math.ceil(ingredient.amount * scaleFactor);
            return {
              ...ingredient,
              amount: scaledAmount,
              unit: nutritionData ? nutritionData.unit_type : ingredient.unit, // Use database unit_type
              originalAmount: originalAmount // Store original for debug
            };
          } else if (scaleFactor <= 0.8) {
            // Round down for significant reduction (e.g., 0.7 -> 1 piece, but could be 0)
            const scaledAmount = Math.max(1, Math.floor(ingredient.amount * scaleFactor));
            return {
              ...ingredient,
              amount: scaledAmount,
              unit: nutritionData ? nutritionData.unit_type : ingredient.unit, // Use database unit_type
              originalAmount: originalAmount // Store original for debug
            };
          } else {
            // Keep original for moderate scaling (0.8 < factor < 1.2)
            return {
              ...ingredient,
              unit: nutritionData ? nutritionData.unit_type : ingredient.unit, // Use database unit_type
              originalAmount: originalAmount // Store original for debug
            };
          }
        }
      }

      let scaledAmount = ingredient.amount * scaleFactor;

      // Round to reasonable values based on unit type from database
      if (nutritionData && (nutritionData.unit_type === 'per_100g' || nutritionData.unit_type === 'g')) {
        scaledAmount = Math.round(scaledAmount / 5) * 5;
        scaledAmount = Math.max(5, scaledAmount);
      } else if (nutritionData && nutritionData.unit_type === 'per_ml') {
        scaledAmount = Math.round(scaledAmount / 10) * 10;
        scaledAmount = Math.max(10, scaledAmount);
      } else {
        scaledAmount = Math.round(scaledAmount);
        scaledAmount = Math.max(1, scaledAmount);
      }

      return {
        ...ingredient,
        amount: scaledAmount,
        unit: nutritionData ? nutritionData.unit_type : ingredient.unit, // Use database unit_type
        originalAmount: originalAmount // Store original for debug
      };
    }
    return ingredient;
  });
  
  // Step 2: Macro optimization (if target nutrition provided)
  if (targetNutrition && Object.keys(ingredientDatabase).length > 0) {
    const currentNutrition = calculateIngredientNutrition(scaledIngredients, ingredientDatabase);
    
    // Calculate differences
    const calorieDiff = targetNutrition.calories - currentNutrition.calories;
    const proteinDiff = targetNutrition.protein - currentNutrition.protein;
    const carbsDiff = targetNutrition.carbs - currentNutrition.carbs;
    const fatDiff = targetNutrition.fat - currentNutrition.fat;
    
    
    // If we're within 5% of targets, no optimization needed
    const caloriePercentage = Math.abs(calorieDiff / targetNutrition.calories * 100);
    const proteinPercentage = Math.abs(proteinDiff / targetNutrition.protein * 100);
    const carbsPercentage = Math.abs(carbsDiff / targetNutrition.carbs * 100);
    const fatPercentage = Math.abs(fatDiff / targetNutrition.fat * 100);
    
    if (caloriePercentage <= 5 && proteinPercentage <= 5 && carbsPercentage <= 5 && fatPercentage <= 5) {
      return scaledIngredients;
    }
    
    // Find ingredients that can be adjusted for specific macros
    scaledIngredients = scaledIngredients.map(ingredient => {
      if (!ingredient.nutrition || !ingredient.amount) return ingredient;
      
      let adjustmentFactor = 1;
      
      // Protein-rich ingredients (adjust for protein deficit/surplus)
      if (ingredient.nutrition.protein > 10 && Math.abs(proteinDiff) > 5) {
        if (proteinDiff > 0) {
          // Need more protein - increase protein-rich foods
          adjustmentFactor = 1 + (proteinDiff / 100) * 0.1; // Small adjustment
        } else {
          // Too much protein - decrease protein-rich foods
          adjustmentFactor = 1 + (proteinDiff / 100) * 0.1;
        }
      }
      
      // Carb-rich ingredients (adjust for carb deficit/surplus)
      if (ingredient.nutrition.carbs > 10 && Math.abs(carbsDiff) > 5) {
        if (carbsDiff > 0) {
          // Need more carbs - increase carb-rich foods
          adjustmentFactor = 1 + (carbsDiff / 100) * 0.1;
        } else {
          // Too much carbs - decrease carb-rich foods
          adjustmentFactor = 1 + (carbsDiff / 100) * 0.1;
        }
      }
      
      // Fat-rich ingredients (adjust for fat deficit/surplus)
      if (ingredient.nutrition.fat > 5 && Math.abs(fatDiff) > 3) {
        if (fatDiff > 0) {
          // Need more fat - increase fat-rich foods
          adjustmentFactor = 1 + (fatDiff / 100) * 0.1;
        } else {
          // Too much fat - decrease fat-rich foods
          adjustmentFactor = 1 + (fatDiff / 100) * 0.1;
        }
      }
      
      // Apply adjustment with constraints
      if (adjustmentFactor !== 1) {
        let adjustedAmount = ingredient.amount * adjustmentFactor;
        
        // Apply same rounding rules
        if (ingredient.unit === 'per_piece' || ingredient.unit === 'stuk') {
          adjustedAmount = Math.round(adjustedAmount);
          adjustedAmount = Math.max(1, adjustedAmount);
        } else if (ingredient.unit === 'per_100g' || ingredient.unit === 'g') {
          adjustedAmount = Math.round(adjustedAmount / 5) * 5;
          adjustedAmount = Math.max(5, adjustedAmount);
        } else if (ingredient.unit === 'per_ml') {
          adjustedAmount = Math.round(adjustedAmount / 10) * 10;
          adjustedAmount = Math.max(10, adjustedAmount);
        } else {
          adjustedAmount = Math.round(adjustedAmount);
          adjustedAmount = Math.max(1, adjustedAmount);
        }
        
        return {
          ...ingredient,
          amount: adjustedAmount
        };
      }
      
      return ingredient;
    });
  }
  
  // Enrich with fresh database data before returning
  return enrichIngredientsWithDatabaseData(scaledIngredients, ingredientDatabase);
}

// Function to calculate base plan calories from database
function calculateBasePlanCaloriesFromDatabase(basePlan) {
  const days = Object.keys(basePlan);
  let totalCalories = 0;
  let daysWithData = 0;
  
  days.forEach(day => {
    const dayPlan = basePlan[day];
    let dayCalories = 0;
    
    // Check if this is the new weekly_plan structure
    if (dayPlan.dailyTotals && dayPlan.dailyTotals.calories > 0) {
      dayCalories = dayPlan.dailyTotals.calories;
    } else if (dayPlan.meals && typeof dayPlan.meals === 'object') {
      // Handle maandag format with meals object
      Object.values(dayPlan.meals).forEach(meal => {
        if (meal && typeof meal === 'object' && 'calories' in meal && meal.calories) {
          dayCalories += (meal as any).calories;
        }
      });
    } else {
      // Fallback to old structure - check all possible meal types
      const mealTypes = ['ontbijt', 'lunch', 'diner', 'avondsnack', 'snack1', 'snack2'];
      mealTypes.forEach(mealType => {
        if (dayPlan[mealType]) {
          const meal = dayPlan[mealType];
          if (meal.calories) {
            dayCalories += meal.calories;
          } else if (meal.nutrition && meal.nutrition.calories) {
            dayCalories += meal.nutrition.calories;
          }
        }
      });
    }
    
    // Only count days that have actual data (calories > 0)
    if (dayCalories > 0) {
      totalCalories += dayCalories;
      daysWithData++;
    }
  });
  
  // Return average of days with data, or use plan target calories as fallback
  return daysWithData > 0 ? totalCalories / daysWithData : 0;
}
