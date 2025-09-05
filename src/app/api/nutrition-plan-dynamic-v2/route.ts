import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Complete ingrediënten database (carnivoor + voedingsplan op maat)
const INGREDIENT_DATABASE = {
  // Carnivoor ingrediënten
  'Eieren': { calories: 155, protein: 13, carbs: 1, fat: 11 },
  'Spek': { calories: 541, protein: 37, carbs: 0, fat: 42 },
  'Rundvlees': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Boter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  'Zalm': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'Ei': { calories: 155, protein: 13, carbs: 1, fat: 11 }, // Alias voor Eieren
  'Ham': { calories: 145, protein: 21, carbs: 0, fat: 6 },
  'Kipfilet': { calories: 165, protein: 31, carbs: 0, fat: 4 },
  'Varkensvlees': { calories: 242, protein: 27, carbs: 0, fat: 14 },
  'Tonijn': { calories: 144, protein: 30, carbs: 0, fat: 1 },
  'Olijfolie': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'Biefstuk': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Salami': { calories: 336, protein: 20, carbs: 0, fat: 28 },
  'Makreel': { calories: 205, protein: 19, carbs: 0, fat: 14 },
  'Lamsvlees': { calories: 294, protein: 25, carbs: 0, fat: 21 },
  'Bacon': { calories: 541, protein: 37, carbs: 0, fat: 42 }, // Alias voor Spek
  'Chorizo': { calories: 455, protein: 24, carbs: 2, fat: 38 },
  'Sardines': { calories: 208, protein: 25, carbs: 0, fat: 11 },
  'Ossenhaas': { calories: 258, protein: 26, carbs: 0, fat: 16 },
  'Kabeljauw': { calories: 82, protein: 18, carbs: 0, fat: 1 },
  'Entrecote': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Rookworst': { calories: 300, protein: 20, carbs: 0, fat: 25 },
  'Garnalen': { calories: 106, protein: 20, carbs: 1, fat: 2 },
  'Ribeye': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Ribeye Steak': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Mager Rundergehakt': { calories: 220, protein: 22, carbs: 0, fat: 14 },
  'Rundergehakt (20% vet)': { calories: 272, protein: 19, carbs: 0, fat: 21 },
  'Gerookte zalm': { calories: 117, protein: 18, carbs: 0, fat: 4 },
  'Goudse kaas': { calories: 356, protein: 25, carbs: 2, fat: 27 },
  'Roomboter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  'Droge worst': { calories: 336, protein: 20, carbs: 0, fat: 28 },
  'Worst': { calories: 300, protein: 20, carbs: 0, fat: 25 },
  'T-Bone Steak': { calories: 247, protein: 24, carbs: 0, fat: 16 },
  'Zalm (Wild)': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'Kalkoenfilet (Gegrild)': { calories: 135, protein: 30, carbs: 0, fat: 1 },
  'Lamskotelet': { calories: 294, protein: 25, carbs: 0, fat: 21 },
  'Kipfilet (Gegrild)': { calories: 165, protein: 31, carbs: 0, fat: 4 },
  'Tonijn in Olijfolie': { calories: 189, protein: 25, carbs: 0, fat: 9 },

  // Voedingsplan op maat ingrediënten
  'Havermout': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
  'Banaan': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'Amandelen': { calories: 579, protein: 21, carbs: 22, fat: 50 },
  'Melk': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  'Volkoren brood': { calories: 247, protein: 13, carbs: 41, fat: 4 },
  'Avocado': { calories: 160, protein: 2, carbs: 9, fat: 15 },
  'Tomaat': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  'Bruine rijst': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  'Broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  'Griekse yoghurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  'Blauwe bessen': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  'Walnoten': { calories: 654, protein: 15, carbs: 14, fat: 65 },
  'Honing': { calories: 304, protein: 0.3, carbs: 82, fat: 0 },
  'Quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9 },
  'Kikkererwten': { calories: 164, protein: 8, carbs: 27, fat: 2.6 },
  'Komkommer': { calories: 16, protein: 0.7, carbs: 4, fat: 0.1 },
  'Zoete aardappel': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  'Spinazie': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  'Volkoren toast': { calories: 247, protein: 13, carbs: 41, fat: 4 },
  'Feta kaas': { calories: 264, protein: 14, carbs: 4, fat: 21 },
  'Wraptortilla': { calories: 218, protein: 6, carbs: 36, fat: 6 },
  'Kalkoen': { calories: 135, protein: 30, carbs: 0, fat: 1 },
  'Hummus': { calories: 166, protein: 8, carbs: 14, fat: 10 },
  'Paprika': { calories: 31, protein: 1, carbs: 7, fat: 0.3 },
  'Aardappel': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  'Courgette': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  'Kruidenolie': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'Smoothie bowl': { calories: 150, protein: 4, carbs: 30, fat: 3 }, // Geschatte waarde per portie
  'Mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  'Chiazaad': { calories: 486, protein: 17, carbs: 42, fat: 31 },
  'Kokosmelk': { calories: 230, protein: 2.3, carbs: 6, fat: 24 },
  'Volkoren pasta': { calories: 124, protein: 5, carbs: 25, fat: 1.1 },
  'Cherrytomaatjes': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  'Basilicum pesto': { calories: 263, protein: 5, carbs: 4, fat: 25 },
  'Bulgur': { calories: 83, protein: 3, carbs: 19, fat: 0.2 },
  'Aubergine': { calories: 25, protein: 1, carbs: 6, fat: 0.2 },
  'Tahini': { calories: 595, protein: 17, carbs: 21, fat: 54 },
  'Pannenkoek': { calories: 227, protein: 6, carbs: 28, fat: 10 }, // Per pannenkoek
  'Aardbeien': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
  'Ricotta': { calories: 174, protein: 11, carbs: 3, fat: 13 },
  'Ahornstroop': { calories: 260, protein: 0, carbs: 67, fat: 0.2 },
  'Salade bowl': { calories: 50, protein: 2, carbs: 10, fat: 1 }, // Geschatte waarde per portie
  'Gegrilde kip': { calories: 165, protein: 31, carbs: 0, fat: 4 },
  'Rode bonen': { calories: 127, protein: 9, carbs: 23, fat: 0.5 },
  'Avocado dressing': { calories: 160, protein: 1, carbs: 3, fat: 16 },
  'Geroosterde groenten': { calories: 35, protein: 1.5, carbs: 7, fat: 0.5 },
  'Volkoren couscous': { calories: 112, protein: 3.8, carbs: 23, fat: 0.2 },
  'Rozemarijn olie': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'French toast': { calories: 200, protein: 6, carbs: 25, fat: 8 }, // Per snede
  'Kiwi': { calories: 61, protein: 1.1, carbs: 15, fat: 0.5 },
  'Gebroken lijnzaad': { calories: 534, protein: 18, carbs: 29, fat: 42 },
  'Sushi bowl': { calories: 250, protein: 12, carbs: 40, fat: 5 }, // Geschatte waarde per portie
  'Zalm sashimi': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'Sushi rijst': { calories: 130, protein: 2.4, carbs: 29, fat: 0.2 },
  'Edamame': { calories: 121, protein: 11, carbs: 8, fat: 5 },
  'Lamsbout': { calories: 294, protein: 25, carbs: 0, fat: 21 },
  'Mediterrane groenten': { calories: 35, protein: 1.5, carbs: 7, fat: 0.5 },
  'Wilde rijst': { calories: 101, protein: 4, carbs: 21, fat: 0.3 },
  'Harissa': { calories: 70, protein: 3, carbs: 14, fat: 1 },
  'Weekend omelet': { calories: 200, protein: 15, carbs: 2, fat: 15 }, // Geschatte waarde per portie
  'Champignons': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  'Geitenkaas': { calories: 364, protein: 22, carbs: 0.1, fat: 30 },
  'Burger': { calories: 250, protein: 20, carbs: 20, fat: 12 }, // Geschatte waarde per burger
  'Volkoren broodje': { calories: 247, protein: 13, carbs: 41, fat: 4 },
  'Lentils burger': { calories: 180, protein: 15, carbs: 20, fat: 6 },
  'Zoete aardappel friet': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  'Zeebaars': { calories: 97, protein: 18, carbs: 0, fat: 2.5 },
  'Risotto': { calories: 130, protein: 2.4, carbs: 29, fat: 0.2 },
  'Asperges': { calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1 },
  'Truffelolie': { calories: 884, protein: 0, carbs: 0, fat: 100 }
};

// Bereken nutritionele waarden voor een maaltijd
function calculateMealNutrition(ingredients: any[]) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  ingredients.forEach(ingredient => {
    const nutritionData = INGREDIENT_DATABASE[ingredient.name];
    if (nutritionData) {
      let multiplier = 0;
      
      if (ingredient.unit === 'stuks') {
        multiplier = ingredient.amount;
      } else if (ingredient.unit === 'portie') {
        multiplier = ingredient.amount;
      } else if (ingredient.unit === 'sneden') {
        multiplier = ingredient.amount;
      } else if (ingredient.unit === 'ml') {
        multiplier = ingredient.amount / 100; // ml naar 100ml
      } else {
        // gram
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

// Bereken het totaal aan calorieën van een plan
function calculatePlanTotalCalories(planMeals: any) {
  let totalCalories = 0;
  let dayCount = 0;
  
  if (!planMeals) {
    console.log('⚠️ No plan meals data provided');
    return 0;
  }
  
  Object.keys(planMeals).forEach(day => {
    let dayCalories = 0;
    const dayData = planMeals[day];
    
    if (!dayData) {
      console.log(`⚠️ No data for ${day}`);
      return;
    }
    
    // Check different meal structure formats
    const mealTypes = ['ontbijt', 'lunch_snack', 'lunch', 'avond_snack', 'diner'];
    
    mealTypes.forEach(mealType => {
      if (dayData[mealType]) {
        // Handle array of ingredients (database format)
        if (Array.isArray(dayData[mealType])) {
          const mealNutrition = calculateMealNutrition(dayData[mealType]);
          dayCalories += mealNutrition.calories;
        }
        // Handle object with ingredients property
        else if (dayData[mealType].ingredients) {
          const mealNutrition = calculateMealNutrition(dayData[mealType].ingredients);
          dayCalories += mealNutrition.calories;
        }
      }
    });
    
    // Also check dailyTotals if available
    if (dayData.dailyTotals && dayData.dailyTotals.calories) {
      dayCalories = dayData.dailyTotals.calories;
    }
    
    console.log(`📊 ${day} total calories: ${dayCalories}`);
    totalCalories += dayCalories;
    dayCount++;
  });
  
  const averageCalories = dayCount > 0 ? Math.round(totalCalories / dayCount) : 0;
  console.log(`📊 Average daily calories across ${dayCount} days: ${averageCalories}`);
  return averageCalories;
}

// Schaal ingrediënten op basis van calorie behoefte
function scaleIngredientAmounts(ingredients: any[], scaleFactor: number) {
  return ingredients.map(ingredient => {
    let scaledAmount;
    
    if (ingredient.unit === 'stuks' || ingredient.unit === 'portie' || ingredient.unit === 'sneden') {
      // Voor discrete items: gebruik meer flexibele afronding voor betere scaling
      const rawAmount = ingredient.amount * scaleFactor;
      if (rawAmount < 1.5) {
        scaledAmount = 1; // Minimum 1 stuk
      } else if (rawAmount < 2.5) {
        scaledAmount = 2; // 1.5-2.4 wordt 2
      } else {
        scaledAmount = Math.round(rawAmount); // 2.5+ wordt afgerond
      }
    } else if (ingredient.unit === 'ml') {
      // Voor vloeistoffen: rond af naar 5ml nauwkeurig
      scaledAmount = Math.round((ingredient.amount * scaleFactor) / 5) * 5;
      scaledAmount = Math.max(5, scaledAmount);
    } else {
      // Voor gewichten: rond af naar 5g nauwkeurig
      scaledAmount = Math.round((ingredient.amount * scaleFactor) / 5) * 5;
      scaledAmount = Math.max(5, scaledAmount);
    }
    
    return {
      ...ingredient,
      amount: scaledAmount
    };
  });
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

    console.log('🥗 Generating dynamic nutrition plan for:', { userId, planId });

    // Get user's nutrition profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('nutrition_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    let profile;
    if (profileError || !userProfile) {
      console.log('⚠️ User profile not found, using fallback profile');
      // Fallback profile if user hasn't filled out their details yet
      profile = {
        age: 30,
        weight: 70,
        height: 175,
        activity_level: 'moderate',
        goal: 'maintenance', 
        target_calories: 2000,
        target_protein: 150,
        target_carbs: 200,
        target_fat: 70
      };
    } else {
      console.log('✅ User profile found, using real data');
      profile = {
        age: userProfile.age,
        weight: userProfile.weight,
        height: userProfile.height,
        activity_level: userProfile.activity_level,
        goal: userProfile.goal,
        target_calories: userProfile.target_calories,
        target_protein: userProfile.target_protein,
        target_carbs: userProfile.target_carbs,
        target_fat: userProfile.target_fat
      };
    }

    // Get the nutrition plan from database
    const { data: planData, error: planError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('plan_id', planId)
      .single();

    if (planError || !planData) {
      return NextResponse.json({
        success: false,
        error: `Nutrition plan '${planId}' not found`
      }, { status: 404 });
    }

    if (!planData.meals) {
      return NextResponse.json({
        success: false,
        error: `Plan '${planId}' does not have meal data`
      }, { status: 400 });
    }

    console.log('👤 User profile found:', {
      targetCalories: profile.target_calories,
      age: profile.age,
      weight: profile.weight,
      goal: profile.goal
    });

    console.log('📋 Plan found:', {
      name: planData.name,
      goal: planData.goal
    });

    // Calculate base plan calories from weekly_plan
    const basePlanCalories = calculatePlanTotalCalories(planData.meals.weekly_plan || planData.meals);
    console.log('📊 Base plan average daily calories:', basePlanCalories);

    // Calculate scale factor with more flexible limits for better calorie matching
    let scaleFactor = profile.target_calories / basePlanCalories;
    
    // More flexible limits to better match user's calorie needs
    const minScaleFactor = 0.6; // Minimum 60% of base plan
    const maxScaleFactor = 2.0; // Maximum 200% of base plan (doubled portions)
    
    if (scaleFactor < minScaleFactor) {
      console.log(`⚠️ Scale factor ${scaleFactor.toFixed(2)} too low, capping at ${minScaleFactor}`);
      scaleFactor = minScaleFactor;
    } else if (scaleFactor > maxScaleFactor) {
      console.log(`⚠️ Scale factor ${scaleFactor.toFixed(2)} too high, capping at ${maxScaleFactor}`);
      scaleFactor = maxScaleFactor;
    }
    
    console.log('⚖️ Final scale factor:', scaleFactor.toFixed(2));
    console.log('🎯 Target calories:', profile.target_calories);
    console.log('📊 Base plan calories:', basePlanCalories);
    console.log('📈 Expected scaled calories:', Math.round(basePlanCalories * scaleFactor));

    // Generate scaled meal plan
    const scaledPlan = {};
    const weeklyPlan = planData.meals.weekly_plan || planData.meals;
    const days = Object.keys(weeklyPlan);
    
    console.log('🔄 Scaling plan for days:', days);
    
    days.forEach(day => {
      const dayData = weeklyPlan[day];
      scaledPlan[day] = {};
      
      if (!dayData) {
        console.log(`⚠️ No data for ${day}, skipping`);
        return;
      }
      
      const mealTypes = ['ontbijt', 'lunch_snack', 'lunch', 'avond_snack', 'diner'];
      
      mealTypes.forEach(mealType => {
        if (dayData[mealType] && Array.isArray(dayData[mealType])) {
          const scaledIngredients = scaleIngredientAmounts(dayData[mealType], scaleFactor);
          const mealNutrition = calculateMealNutrition(scaledIngredients);
          
          scaledPlan[day][mealType] = scaledIngredients.map(ing => ({
            ...ing,
            calories: Math.round((INGREDIENT_DATABASE[ing.name]?.calories || 0) * (ing.unit === 'stuks' ? ing.amount : ing.amount / 100)),
            protein: Math.round(((INGREDIENT_DATABASE[ing.name]?.protein || 0) * (ing.unit === 'stuks' ? ing.amount : ing.amount / 100)) * 10) / 10,
            carbs: Math.round(((INGREDIENT_DATABASE[ing.name]?.carbs || 0) * (ing.unit === 'stuks' ? ing.amount : ing.amount / 100)) * 10) / 10,
            fat: Math.round(((INGREDIENT_DATABASE[ing.name]?.fat || 0) * (ing.unit === 'stuks' ? ing.amount : ing.amount / 100)) * 10) / 10
          }));
          
          console.log(`📊 ${day} ${mealType}: ${mealNutrition.calories} kcal (${scaledIngredients.length} ingredients)`);
        }
      });
      
      // Calculate daily totals
      let dailyCalories = 0;
      let dailyProtein = 0;
      let dailyCarbs = 0;
      let dailyFat = 0;
      
      mealTypes.forEach(mealType => {
        if (scaledPlan[day][mealType] && Array.isArray(scaledPlan[day][mealType])) {
          scaledPlan[day][mealType].forEach(ingredient => {
            dailyCalories += ingredient.calories || 0;
            dailyProtein += ingredient.protein || 0;
            dailyCarbs += ingredient.carbs || 0;
            dailyFat += ingredient.fat || 0;
          });
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
      if (scaledPlan[day].dailyTotals) {
        const dailyTotals = scaledPlan[day].dailyTotals;
        weeklyCalories += dailyTotals.calories;
        weeklyProtein += dailyTotals.protein;
        weeklyCarbs += dailyTotals.carbs;
        weeklyFat += dailyTotals.fat;
      }
    });
    
    const weeklyAverages = {
      calories: Math.round(weeklyCalories / days.length),
      protein: Math.round((weeklyProtein / days.length) * 10) / 10,
      carbs: Math.round((weeklyCarbs / days.length) * 10) / 10,
      fat: Math.round((weeklyFat / days.length) * 10) / 10
    };

    console.log('📊 Final weekly averages:', weeklyAverages);
    console.log('🎯 Target vs Actual calories:', {
      target: profile.target_calories,
      actual: weeklyAverages.calories,
      difference: weeklyAverages.calories - profile.target_calories,
      percentage: Math.round(((weeklyAverages.calories / profile.target_calories) - 1) * 100)
    });

    return NextResponse.json({
      success: true,
      data: {
        planId: planData.plan_id,
        planName: planData.name,
        userProfile: {
          targetCalories: profile.target_calories,
          targetProtein: profile.target_protein,
          targetCarbs: profile.target_carbs,
          targetFat: profile.target_fat,
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          goal: profile.goal
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
