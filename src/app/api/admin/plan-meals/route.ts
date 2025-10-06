import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET: Haal alle maaltijd data op voor een plan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    console.log(`🔍 Fetching meals for plan ${planId}...`);

    const { data: plan, error } = await supabaseAdmin
      .from('nutrition_plans')
      .select(`
        id,
        plan_id,
        name,
        description,
        target_calories,
        target_protein,
        target_carbs,
        target_fat,
        protein_percentage,
        carbs_percentage,
        fat_percentage,
        duration_weeks,
        difficulty,
        goal,
        is_featured,
        is_public,
        meals,
        created_at,
        updated_at
      `)
      .eq('id', planId)
      .single();

    if (error) {
      console.error('❌ Error fetching plan:', error);
      return NextResponse.json({ error: `Failed to fetch plan: ${error.message}` }, { status: 500 });
    }

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    console.log('✅ Plan meals fetched successfully');
    return NextResponse.json({ 
      success: true, 
      plan: {
        ...plan,
        meals: plan.meals || {
          weekly_plan: {
            maandag: {},
            dinsdag: {},
            woensdag: {},
            donderdag: {},
            vrijdag: {},
            zaterdag: {},
            zondag: {}
          },
          weekly_averages: { calories: 0, protein: 0, carbs: 0, fat: 0 }
        }
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in GET /api/admin/plan-meals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Voeg ingrediënt toe aan een maaltijd
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, day, meal, ingredient } = body;

    if (!planId || !day || !meal || !ingredient) {
      return NextResponse.json({ 
        error: 'planId, day, meal, and ingredient are required' 
      }, { status: 400 });
    }

    console.log(`🍽️ Adding ingredient to ${day} ${meal} for plan ${planId}:`, ingredient);

    // Get current plan data
    const { data: currentPlan, error: fetchError } = await supabaseAdmin
      .from('nutrition_plans')
      .select('meals')
      .eq('id', planId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current plan:', fetchError);
      return NextResponse.json({ error: `Failed to fetch plan: ${fetchError.message}` }, { status: 500 });
    }

    if (!currentPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Initialize meals structure if it doesn't exist
    const currentMeals = currentPlan.meals || {};
    const weeklyPlan = currentMeals.weekly_plan || {
      maandag: {},
      dinsdag: {},
      woensdag: {},
      donderdag: {},
      vrijdag: {},
      zaterdag: {},
      zondag: {}
    };

    // Initialize day if it doesn't exist
    if (!weeklyPlan[day]) {
      weeklyPlan[day] = {};
    }

    // Initialize meal if it doesn't exist
    if (!weeklyPlan[day][meal]) {
      weeklyPlan[day][meal] = {
        time: getMealTime(meal),
        ingredients: [],
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
      };
    }

    // Add ingredient to the meal
    weeklyPlan[day][meal].ingredients.push(ingredient);

    // Recalculate nutrition for this meal
    weeklyPlan[day][meal].nutrition = calculateMealNutrition(weeklyPlan[day][meal].ingredients);

    // Recalculate weekly averages
    const weeklyAverages = calculateWeeklyAverages(weeklyPlan);

    // Update the plan
    const updatedMeals = {
      ...currentMeals,
      weekly_plan: weeklyPlan,
      weekly_averages: weeklyAverages
    };

    const { data: updatedPlan, error: updateError } = await supabaseAdmin
      .from('nutrition_plans')
      .update({ meals: updatedMeals })
      .eq('id', planId)
      .select('meals')
      .single();

    if (updateError) {
      console.error('❌ Error updating plan:', updateError);
      return NextResponse.json({ error: `Failed to update plan: ${updateError.message}` }, { status: 500 });
    }

    console.log(`✅ Ingredient added successfully to ${day} ${meal}`);
    return NextResponse.json({ 
      success: true, 
      meals: updatedPlan.meals,
      message: `Ingredient added to ${day} ${meal}`
    });

  } catch (error) {
    console.error('❌ Unexpected error in POST /api/admin/plan-meals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update een hele maaltijd
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, day, meal, ingredients } = body;

    if (!planId || !day || !meal || !Array.isArray(ingredients)) {
      return NextResponse.json({ 
        error: 'planId, day, meal, and ingredients array are required' 
      }, { status: 400 });
    }

    console.log(`🍽️ Updating ${day} ${meal} for plan ${planId} with ${ingredients.length} ingredients`);

    // Get current plan data
    const { data: currentPlan, error: fetchError } = await supabaseAdmin
      .from('nutrition_plans')
      .select('meals')
      .eq('id', planId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current plan:', fetchError);
      return NextResponse.json({ error: `Failed to fetch plan: ${fetchError.message}` }, { status: 500 });
    }

    if (!currentPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Initialize meals structure if it doesn't exist
    const currentMeals = currentPlan.meals || {};
    const weeklyPlan = currentMeals.weekly_plan || {
      maandag: {},
      dinsdag: {},
      woensdag: {},
      donderdag: {},
      vrijdag: {},
      zaterdag: {},
      zondag: {}
    };

    // Initialize day if it doesn't exist
    if (!weeklyPlan[day]) {
      weeklyPlan[day] = {};
    }

    // Update the meal with new ingredients
    weeklyPlan[day][meal] = {
      time: getMealTime(meal),
      ingredients: ingredients,
      nutrition: calculateMealNutrition(ingredients)
    };

    // Recalculate weekly averages
    const weeklyAverages = calculateWeeklyAverages(weeklyPlan);

    // Update the plan
    const updatedMeals = {
      ...currentMeals,
      weekly_plan: weeklyPlan,
      weekly_averages: weeklyAverages
    };

    const { data: updatedPlan, error: updateError } = await supabaseAdmin
      .from('nutrition_plans')
      .update({ meals: updatedMeals })
      .eq('id', planId)
      .select('meals')
      .single();

    if (updateError) {
      console.error('❌ Error updating plan:', updateError);
      return NextResponse.json({ error: `Failed to update plan: ${updateError.message}` }, { status: 500 });
    }

    console.log(`✅ Meal updated successfully: ${day} ${meal}`);
    return NextResponse.json({ 
      success: true, 
      meals: updatedPlan.meals,
      message: `Meal updated: ${day} ${meal}`
    });

  } catch (error) {
    console.error('❌ Unexpected error in PUT /api/admin/plan-meals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Verwijder ingrediënt uit een maaltijd
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const day = searchParams.get('day');
    const meal = searchParams.get('meal');
    const ingredientIndex = searchParams.get('ingredientIndex');

    if (!planId || !day || !meal || !ingredientIndex) {
      return NextResponse.json({ 
        error: 'planId, day, meal, and ingredientIndex are required' 
      }, { status: 400 });
    }

    console.log(`🗑️ Removing ingredient ${ingredientIndex} from ${day} ${meal} for plan ${planId}`);

    // Get current plan data
    const { data: currentPlan, error: fetchError } = await supabaseAdmin
      .from('nutrition_plans')
      .select('meals')
      .eq('id', planId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current plan:', fetchError);
      return NextResponse.json({ error: `Failed to fetch plan: ${fetchError.message}` }, { status: 500 });
    }

    if (!currentPlan || !currentPlan.meals || !currentPlan.meals.weekly_plan) {
      return NextResponse.json({ error: 'Plan or meal data not found' }, { status: 404 });
    }

    const weeklyPlan = currentPlan.meals.weekly_plan;
    const mealData = weeklyPlan[day]?.[meal];

    if (!mealData || !mealData.ingredients) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    // Remove ingredient by index
    const index = parseInt(ingredientIndex);
    if (index < 0 || index >= mealData.ingredients.length) {
      return NextResponse.json({ error: 'Invalid ingredient index' }, { status: 400 });
    }

    mealData.ingredients.splice(index, 1);

    // Recalculate nutrition
    mealData.nutrition = calculateMealNutrition(mealData.ingredients);

    // Recalculate weekly averages
    const weeklyAverages = calculateWeeklyAverages(weeklyPlan);

    // Update the plan
    const updatedMeals = {
      ...currentPlan.meals,
      weekly_plan: weeklyPlan,
      weekly_averages: weeklyAverages
    };

    const { data: updatedPlan, error: updateError } = await supabaseAdmin
      .from('nutrition_plans')
      .update({ meals: updatedMeals })
      .eq('id', planId)
      .select('meals')
      .single();

    if (updateError) {
      console.error('❌ Error updating plan:', updateError);
      return NextResponse.json({ error: `Failed to update plan: ${updateError.message}` }, { status: 500 });
    }

    console.log(`✅ Ingredient removed successfully from ${day} ${meal}`);
    return NextResponse.json({ 
      success: true, 
      meals: updatedPlan.meals,
      message: `Ingredient removed from ${day} ${meal}`
    });

  } catch (error) {
    console.error('❌ Unexpected error in DELETE /api/admin/plan-meals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function getMealTime(meal: string): string {
  const mealTimes: { [key: string]: string } = {
    ontbijt: '08:00',
    ochtend_snack: '10:00',
    lunch: '12:30',
    lunch_snack: '15:00',
    diner: '18:30',
    avond_snack: '21:00'
  };
  return mealTimes[meal] || '12:00';
}

function calculateMealNutrition(ingredients: any[]): any {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  ingredients.forEach(ingredient => {
    const amount = parseFloat(ingredient.amount) || 0;
    const unit = ingredient.unit || 'per_100g';
    
    let factor = 1;
    const u = String(unit).toLowerCase();

    // Calculate factor based on unit type (aligned with frontend logic)
    if (u === 'per_100g' || u === 'gram' || u === 'g') {
      factor = amount / 100;
    } else if (u === 'per_piece' || u === 'stuks' || u === 'stuk' || u === 'piece' || u === 'pieces') {
      // Treat per-piece style items as already normalized to per piece in *_per_100g fields
      factor = amount;
    } else if (u === 'per_handful' || u === 'handje' || u === 'handjes') {
      factor = amount;
    } else if (u === 'per_plakje' || u === 'plakje' || u === 'plakjes' || u === 'per_sneedje' || u === 'sneedje') {
      factor = amount;
    } else if (u === 'per_30g') {
      factor = (amount * 30) / 100; // 30g portions
    } else if (u === 'per_100ml' || u === 'ml' || u === 'per_ml') {
      factor = amount / 100; // assume 1ml ≈ 1g for density
    } else if (u === 'per_eetlepel_15g' || u === 'per_tbsp' || u === 'tbsp' || u === 'eetlepel' || u === 'el' || u === 'per_eetlepel') {
      factor = (amount * 15) / 100; // 1 tbsp = 15g/ml
    } else if (u === 'per_tsp' || u === 'tsp' || u === 'theelepel' || u === 'tl' || u === 'per_theelepel') {
      factor = (amount * 5) / 100; // 1 tsp = 5g/ml
    } else if (u === 'per_cup' || u === 'cup' || u === 'kop') {
      factor = (amount * 240) / 100; // 1 cup ≈ 240ml
    } else if (u === 'per_blikje') {
      factor = amount; // treat as per unit
    } else {
      // Default to per 100g calculation
      factor = amount / 100;
    }

    // Sum macros first
    totalProtein += (ingredient.protein_per_100g || 0) * factor;
    totalCarbs += (ingredient.carbs_per_100g || 0) * factor;
    totalFat += (ingredient.fat_per_100g || 0) * factor;
  });

  // Derive calories from macros to keep consistency: kcal = 4P + 4C + 9F
  const proteinRounded = Math.round(totalProtein * 10) / 10;
  const carbsRounded = Math.round(totalCarbs * 10) / 10;
  const fatRounded = Math.round(totalFat * 10) / 10;
  const caloriesFromMacros = Math.round(proteinRounded * 4 + carbsRounded * 4 + fatRounded * 9);

  return {
    calories: caloriesFromMacros,
    protein: proteinRounded,
    carbs: carbsRounded,
    fat: fatRounded
  };
}

function calculateWeeklyAverages(weeklyPlan: any): any {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let dayCount = 0;

  const days = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
  
  days.forEach(day => {
    const dayData = weeklyPlan[day];
    if (dayData && Object.keys(dayData).length > 0) {
      dayCount++;
      
      const meals = ['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner', 'avond_snack'];
      meals.forEach(meal => {
        if (dayData[meal] && dayData[meal].nutrition) {
          totalCalories += dayData[meal].nutrition.calories || 0;
          totalProtein += dayData[meal].nutrition.protein || 0;
          totalCarbs += dayData[meal].nutrition.carbs || 0;
          totalFat += dayData[meal].nutrition.fat || 0;
        }
      });
    }
  });

  if (dayCount === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  return {
    calories: Math.round(totalCalories / dayCount),
    protein: Math.round((totalProtein / dayCount) * 10) / 10,
    carbs: Math.round((totalCarbs / dayCount) * 10) / 10,
    fat: Math.round((totalFat / dayCount) * 10) / 10
  };
}
