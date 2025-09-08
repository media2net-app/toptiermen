import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Carnivoor ingrediënten database met nutritionele waarden per 100g
const CARNIVOOR_INGREDIENTS = {
  'Ribeye Steak': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Biefstuk': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'T-Bone Steak': { calories: 247, protein: 24, carbs: 0, fat: 16 },
  'Rundergehakt (15% vet)': { calories: 254, protein: 20, carbs: 0, fat: 18 },
  'Rundergehakt (20% vet)': { calories: 272, protein: 19, carbs: 0, fat: 21 },
  'Mager Rundergehakt': { calories: 220, protein: 22, carbs: 0, fat: 14 },
  'Eendenborst': { calories: 337, protein: 19, carbs: 0, fat: 28 },
  
  // Vis
  'Zalm (Wild)': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'Haring': { calories: 158, protein: 18, carbs: 0, fat: 9 },
  'Makreel': { calories: 205, protein: 19, carbs: 0, fat: 14 },
  'Sardines': { calories: 208, protein: 25, carbs: 0, fat: 11 },
  'Tonijn in Olijfolie': { calories: 189, protein: 25, carbs: 0, fat: 9 },
  'Witvis': { calories: 82, protein: 18, carbs: 0, fat: 1 },
  
  // Gevogelte
  'Kipfilet (Gegrild)': { calories: 165, protein: 31, carbs: 0, fat: 4 },
  'Kalkoenfilet (Gegrild)': { calories: 135, protein: 30, carbs: 0, fat: 1 },
  'Kippendijen': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Gans': { calories: 259, protein: 25, carbs: 0, fat: 17 },
  
  // Varkensvlees
  'Varkenshaas': { calories: 143, protein: 26, carbs: 0, fat: 4 },
  'Spek': { calories: 541, protein: 37, carbs: 0, fat: 42 },
  'Ham': { calories: 145, protein: 21, carbs: 0, fat: 6 },
  'Worst': { calories: 300, protein: 20, carbs: 0, fat: 25 },
  'Duitse Biefstuk': { calories: 250, protein: 16, carbs: 0, fat: 20 },
  'Salami': { calories: 336, protein: 20, carbs: 0, fat: 28 },
  
  // Lam
  'Lamsvlees': { calories: 294, protein: 25, carbs: 0, fat: 21 },
  'Lamskotelet': { calories: 294, protein: 25, carbs: 0, fat: 21 },
  
  // Orgaanvlees
  'Orgaanvlees (Lever)': { calories: 135, protein: 20, carbs: 4, fat: 4 },
  'Orgaanvlees (Hart)': { calories: 112, protein: 17, carbs: 0, fat: 4 },
  'Runderlever': { calories: 135, protein: 20, carbs: 4, fat: 4 },
  'Runderhart': { calories: 112, protein: 17, carbs: 0, fat: 4 },
  
  // Overig
  'Tartaar': { calories: 220, protein: 22, carbs: 0, fat: 14 },
  'Carpaccio': { calories: 120, protein: 21, carbs: 0, fat: 4 },
  '1 Ei': { calories: 155, protein: 13, carbs: 1, fat: 11 }, // per stuk
  
  // Noten (kleine hoeveelheden in carnivoor)
  '1 Handje Walnoten': { calories: 26, protein: 0.6, carbs: 0.5, fat: 2.6 }, // per handje (4g)
  '1 Handje Amandelen': { calories: 23, protein: 0.8, carbs: 0.9, fat: 2.0 },
  '1 Handje Cashewnoten': { calories: 22, protein: 0.7, carbs: 1.2, fat: 1.8 },
  '1 Handje Hazelnoten': { calories: 25, protein: 0.6, carbs: 0.7, fat: 2.4 },
  '1 Handje Pecannoten': { calories: 28, protein: 0.4, carbs: 0.6, fat: 2.8 },
  '1 Handje Pistachenoten': { calories: 23, protein: 0.8, carbs: 1.1, fat: 1.8 },
  '1 Handje Macadamia Noten': { calories: 30, protein: 0.3, carbs: 0.6, fat: 3.0 },
  
  // Supplements
  'Whey Eiwit Shakes': { calories: 120, protein: 25, carbs: 3, fat: 1 },
  'Whey Protein': { calories: 120, protein: 25, carbs: 3, fat: 1 }
};

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
function calculateBasePlanCalories() {
  let totalCalories = 0;
  const days = Object.keys(BASE_CARNIVOOR_DROOGTRAINEN_PLAN);
  
  days.forEach(day => {
    const dayPlan = BASE_CARNIVOOR_DROOGTRAINEN_PLAN[day];
    ['ontbijt', 'lunch', 'diner', 'ontbijt_snack', 'lunch_snack', 'diner_snack'].forEach(mealType => {
      dayPlan[mealType].forEach(ingredient => {
        const nutritionData = CARNIVOOR_INGREDIENTS[ingredient.name];
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
    });
  });
  
  return Math.round(totalCalories / 7); // Gemiddelde per dag
}

// Schaal ingredients op basis van calorie behoefte
function scaleIngredientAmounts(ingredients, scaleFactor) {
  return ingredients.map(ingredient => {
    let scaledAmount;
    
    if (ingredient.unit === 'stuks') {
      // Voor eieren: rond af naar hele eieren, minimum 1
      scaledAmount = Math.max(1, Math.round(ingredient.baseAmount * scaleFactor));
    } else if (ingredient.unit === 'handje') {
      // Voor noten: altijd 1 handje (blijft constant)
      scaledAmount = 1;
    } else {
      // Voor gram: rond af naar 5g nauwkeurig
      scaledAmount = Math.round((ingredient.baseAmount * scaleFactor) / 5) * 5;
      scaledAmount = Math.max(25, scaledAmount); // Minimum 25g
    }
    
    return {
      ...ingredient,
      amount: scaledAmount
    };
  });
}

// Bereken nutritionele waarden voor een maaltijd
function calculateMealNutrition(ingredients) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  ingredients.forEach(ingredient => {
    const nutritionData = CARNIVOOR_INGREDIENTS[ingredient.name];
    if (nutritionData) {
      let multiplier = 0;
      
      if (ingredient.unit === 'stuks' && ingredient.name === '1 Ei') {
        multiplier = ingredient.amount;
      } else if (ingredient.unit === 'stuks' && (ingredient.name.includes('Whey') || ingredient.name.includes('Protein'))) {
        // Whey protein is per scoop (stuk)
        multiplier = ingredient.amount;
      } else if (ingredient.unit === 'handje') {
        multiplier = ingredient.amount;
      } else {
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

    console.log('🥩 Generating dynamic carnivoor-droogtrainen plan for user:', userId);

    // Get user's nutrition profile
    const { data: userProfile, error: profileError } = await supabase
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // For testing purposes, create a default profile if not found
    let profile = userProfile;
    if (profileError || !userProfile) {
      console.log('⚠️ User profile not found, using default profile for testing');
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

    console.log('👤 User profile found:', {
      targetCalories: profile.target_calories,
      age: profile.age,
      weight: profile.weight
    });

    // Use the database plan - check for weekly_plan structure first
    let basePlan = planData.meals;
    if (planData.meals && planData.meals.weekly_plan) {
      basePlan = planData.meals.weekly_plan;
      console.log('📊 Using weekly_plan structure for:', planData.name);
    } else {
      console.log('📊 Using legacy meals structure for:', planData.name);
    }

    // Calculate base plan calories from database plan
    const basePlanCalories = calculateBasePlanCaloriesFromDatabase(basePlan);
    console.log('📊 Base plan average daily calories:', basePlanCalories);

    // Calculate scale factor - use plan target calories, not user profile
    const scaleFactor = planData.target_calories / basePlanCalories;
    console.log('⚖️ Scale factor:', scaleFactor.toFixed(2));

    // Generate scaled meal plan
    const scaledPlan = {};
    const days = Object.keys(basePlan);
    
    days.forEach(day => {
      const dayPlan = basePlan[day];
      scaledPlan[day] = {};
      
      console.log(`🔍 Processing day: ${day}`, JSON.stringify(dayPlan, null, 2));
      
      // Process all meal types - check if dayPlan has meals object or direct meal structure
      if (dayPlan.meals) {
        const mealTypes = Object.keys(dayPlan.meals);
        
        mealTypes.forEach(mealType => {
          const meal = dayPlan.meals[mealType];
          
          // Use the meal data directly from our database structure
          // Check if nutrition data exists in meal.nutrition (new structure) or meal directly (old structure)
          const baseNutrition = meal.nutrition || meal;
          const mealNutrition = {
            calories: Math.round((baseNutrition.calories || 0) * scaleFactor),
            protein: Math.round(((baseNutrition.protein || 0) * scaleFactor) * 10) / 10,
            carbs: Math.round(((baseNutrition.carbs || 0) * scaleFactor) * 10) / 10,
            fat: Math.round(((baseNutrition.fat || 0) * scaleFactor) * 10) / 10
          };
          
          scaledPlan[day][mealType] = {
            name: meal.name || mealType,
            ingredients: meal.ingredients || [],
            nutrition: mealNutrition
          };
        });
      } else {
        // Process direct meal structure (weekly_plan format)
        const mealTypes = Object.keys(dayPlan).filter(key => 
          !['dailyTotals', 'time'].includes(key)
        );
        
        mealTypes.forEach(mealType => {
          if (dayPlan[mealType]) {
            const meal = dayPlan[mealType];
            
            // Check if nutrition data exists in meal.nutrition (new structure) or meal directly (old structure)
            const baseNutrition = meal.nutrition || meal;
            console.log(`🍽️ Processing meal: ${mealType}`, JSON.stringify(meal, null, 2));
            console.log(`🍽️ Base nutrition:`, JSON.stringify(baseNutrition, null, 2));
            
            const mealNutrition = {
              calories: Math.round((baseNutrition.calories || 0) * scaleFactor),
              protein: Math.round(((baseNutrition.protein || 0) * scaleFactor) * 10) / 10,
              carbs: Math.round(((baseNutrition.carbs || 0) * scaleFactor) * 10) / 10,
              fat: Math.round(((baseNutrition.fat || 0) * scaleFactor) * 10) / 10
            };
            
            console.log(`🍽️ Calculated nutrition:`, JSON.stringify(mealNutrition, null, 2));
            
            scaledPlan[day][mealType] = {
              name: meal.name || mealType,
              ingredients: meal.ingredients || [],
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

    return NextResponse.json({
      success: true,
      data: {
        planId: 'carnivoor-droogtrainen',
        planName: 'Carnivoor - Droogtrainen',
        userProfile: {
          targetCalories: profile.target_calories,
          targetProtein: profile.target_protein,
          targetCarbs: profile.target_carbs,
          targetFat: profile.target_fat,
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          goal: profile.fitness_goal
        },
        scalingInfo: {
          basePlanCalories,
          scaleFactor: Math.round(scaleFactor * 100) / 100,
          targetCalories: profile.target_calories
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
    } else {
      // Fallback to old structure
      ['ontbijt', 'lunch', 'diner', 'avondsnack'].forEach(mealType => {
        if (dayPlan[mealType] && dayPlan[mealType].calories) {
          dayCalories += dayPlan[mealType].calories;
        }
      });
    }
    
    // Only count days that have actual data (calories > 0)
    if (dayCalories > 0) {
      totalCalories += dayCalories;
      daysWithData++;
    }
  });
  
  // Return average of days with data, or 0 if no days have data
  return daysWithData > 0 ? totalCalories / daysWithData : 0;
}
