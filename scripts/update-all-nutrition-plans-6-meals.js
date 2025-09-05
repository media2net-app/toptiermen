#!/usr/bin/env node

/**
 * Script om alle voedingsplannen bij te werken naar 6 eetmomenten
 * Herverdeling van maaltijden en caloriën voor betere portieverdeling
 * 
 * Eetmomenten: ontbijt, ochtend_snack, lunch, lunch_snack, diner, avond_snack
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functie om ingrediënten te schalen
function scaleIngredients(ingredients, factor) {
  return ingredients.map(ingredient => ({
    ...ingredient,
    amount: Math.round(ingredient.amount * factor * 100) / 100
  }));
}

// Helper functie om maaltijd nutritie te berekenen
function calculateMealNutrition(ingredients) {
  return ingredients.reduce((totals, ingredient) => {
    const factor = ingredient.amount / 100; // Nutritie per 100g
    return {
      calories: totals.calories + (ingredient.calories || 0) * factor,
      protein: totals.protein + (ingredient.protein || 0) * factor,
      carbs: totals.carbs + (ingredient.carbs || 0) * factor,
      fat: totals.fat + (ingredient.fat || 0) * factor
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

// Verdeel een bestaande maaltijd in kleinere porties voor snacks
function createSnackFromMeal(mealIngredients, portion = 0.4) {
  return scaleIngredients(mealIngredients, portion);
}

// Basis ingrediënten voor snacks
const SNACK_INGREDIENTS = {
  carnivoor: {
    ochtend_snack: [
      { name: 'Beef Jerky', amount: 30, unit: 'gram', calories: 410, protein: 25, carbs: 11, fat: 26 },
      { name: 'Rundergehakt (mager)', amount: 50, unit: 'gram', calories: 158, protein: 21, carbs: 0, fat: 8 }
    ],
    lunch_snack: [
      { name: 'Kippenheart', amount: 40, unit: 'gram', calories: 153, protein: 15.6, carbs: 0, fat: 9.3 },
      { name: 'Salmon (rooklaks)', amount: 30, unit: 'gram', calories: 117, protein: 18.3, carbs: 0, fat: 4.3 }
    ],
    avond_snack: [
      { name: 'Biltong', amount: 25, unit: 'gram', calories: 251, protein: 54, carbs: 1.6, fat: 3 },
      { name: 'Kippenlever', amount: 40, unit: 'gram', calories: 119, protein: 17, carbs: 1, fat: 4.8 }
    ]
  },
  balanced: {
    ochtend_snack: [
      { name: 'Griekse yoghurt', amount: 150, unit: 'gram', calories: 59, protein: 10, carbs: 4, fat: 0.4 },
      { name: 'Blauwe bessen', amount: 50, unit: 'gram', calories: 57, protein: 0.7, carbs: 14, fat: 0.3 }
    ],
    lunch_snack: [
      { name: 'Amandelen', amount: 20, unit: 'gram', calories: 116, protein: 4.2, carbs: 4.4, fat: 10 },
      { name: 'Appel', amount: 100, unit: 'gram', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 }
    ],
    avond_snack: [
      { name: 'Hüttenkäse', amount: 100, unit: 'gram', calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
      { name: 'Walnoten', amount: 15, unit: 'gram', calories: 98, protein: 2.3, carbs: 2.1, fat: 9.8 }
    ]
  },
  keto: {
    ochtend_snack: [
      { name: 'Avocado', amount: 80, unit: 'gram', calories: 128, protein: 1.6, carbs: 7.2, fat: 12 },
      { name: 'Macadamia noten', amount: 20, unit: 'gram', calories: 148, protein: 1.5, carbs: 2.7, fat: 15.6 }
    ],
    lunch_snack: [
      { name: 'Olijven', amount: 50, unit: 'gram', calories: 81, protein: 0.8, carbs: 6, fat: 6.3 },
      { name: 'Kaas (oude kaas)', amount: 30, unit: 'gram', calories: 113, protein: 7.2, carbs: 0.4, fat: 9.3 }
    ],
    avond_snack: [
      { name: 'Zalm (gerookt)', amount: 40, unit: 'gram', calories: 117, protein: 18.3, carbs: 0, fat: 4.3 },
      { name: 'Pijnboompitten', amount: 15, unit: 'gram', calories: 103, protein: 2.4, carbs: 1.9, fat: 10.2 }
    ]
  }
};

// Herverdeelfuncties voor verschillende plan types
function redistributeMealsTo6(weekPlan, planType = 'carnivoor', targetCalories = 2000) {
  const newWeekPlan = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  days.forEach(day => {
    const dayPlan = weekPlan[day] || {};
    
    // Basis maaltijden (verkleind voor ruimte voor snacks)
    const ontbijt = dayPlan.ontbijt ? scaleIngredients(dayPlan.ontbijt, 0.85) : [];
    const lunch = dayPlan.lunch ? scaleIngredients(dayPlan.lunch, 0.85) : [];
    const diner = dayPlan.diner ? scaleIngredients(dayPlan.diner, 0.85) : [];

    // Snacks toevoegen
    const snacks = SNACK_INGREDIENTS[planType] || SNACK_INGREDIENTS.carnivoor;
    
    const ochtend_snack = snacks.ochtend_snack || createSnackFromMeal(ontbijt, 0.3);
    const lunch_snack = snacks.lunch_snack || createSnackFromMeal(lunch, 0.3);
    const avond_snack = snacks.avond_snack || createSnackFromMeal(diner, 0.3);

    // Bereken nutrition voor elke maaltijd
    const ontbijtNutrition = calculateMealNutrition(ontbijt);
    const ochtendSnackNutrition = calculateMealNutrition(ochtend_snack);
    const lunchNutrition = calculateMealNutrition(lunch);
    const lunchSnackNutrition = calculateMealNutrition(lunch_snack);
    const dinerNutrition = calculateMealNutrition(diner);
    const avondSnackNutrition = calculateMealNutrition(avond_snack);

    // Dagelijkse totalen
    const dailyTotals = {
      calories: Math.round(ontbijtNutrition.calories + ochtendSnackNutrition.calories + 
                          lunchNutrition.calories + lunchSnackNutrition.calories + 
                          dinerNutrition.calories + avondSnackNutrition.calories),
      protein: Math.round((ontbijtNutrition.protein + ochtendSnackNutrition.protein + 
                          lunchNutrition.protein + lunchSnackNutrition.protein + 
                          dinerNutrition.protein + avondSnackNutrition.protein) * 10) / 10,
      carbs: Math.round((ontbijtNutrition.carbs + ochtendSnackNutrition.carbs + 
                        lunchNutrition.carbs + lunchSnackNutrition.carbs + 
                        dinerNutrition.carbs + avondSnackNutrition.carbs) * 10) / 10,
      fat: Math.round((ontbijtNutrition.fat + ochtendSnackNutrition.fat + 
                      lunchNutrition.fat + lunchSnackNutrition.fat + 
                      dinerNutrition.fat + avondSnackNutrition.fat) * 10) / 10
    };

    newWeekPlan[day] = {
      ontbijt,
      ochtend_snack,
      lunch,
      lunch_snack, 
      diner,
      avond_snack,
      dailyTotals
    };
  });

  return newWeekPlan;
}

async function updateNutritionPlan(planId, planType = 'carnivoor') {
  try {
    console.log(`\n🔄 Updating nutrition plan: ${planId}`);
    
    // Haal het huidige plan op
    const { data: currentPlan, error: fetchError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('plan_id', planId)
      .single();

    if (fetchError || !currentPlan) {
      console.log(`❌ Plan ${planId} not found:`, fetchError?.message);
      return false;
    }

    if (!currentPlan.meals || !currentPlan.meals.weekly_plan) {
      console.log(`⚠️  Plan ${planId} has no weekly_plan data to update`);
      return false;
    }

    // Herverdeeel naar 6 eetmomenten
    const updatedWeekPlan = redistributeMealsTo6(
      currentPlan.meals.weekly_plan, 
      planType,
      currentPlan.meals.target_calories || 2000
    );

    // Update het plan in de database
    const updatedMeals = {
      ...currentPlan.meals,
      weekly_plan: updatedWeekPlan
    };

    const { error: updateError } = await supabase
      .from('nutrition_plans')
      .update({
        meals: updatedMeals,
        updated_at: new Date().toISOString()
      })
      .eq('plan_id', planId);

    if (updateError) {
      console.log(`❌ Failed to update ${planId}:`, updateError.message);
      return false;
    }

    console.log(`✅ Successfully updated ${planId} to 6 meals structure`);
    return true;

  } catch (error) {
    console.error(`❌ Error updating ${planId}:`, error.message);
    return false;
  }
}

async function updateAllNutritionPlans() {
  console.log('🚀 Starting nutrition plans update to 6 meals structure...');
  console.log('============================================================');

  // Plan mapping (planId => planType voor snack ingrediënten)
  const plansToUpdate = [
    { planId: 'carnivoor-droogtrainen', planType: 'carnivoor' },
    { planId: 'carnivoor-balans', planType: 'carnivoor' },
    { planId: 'carnivoor-spiermassa', planType: 'carnivoor' },
    { planId: 'voedingsplan-droogtrainen', planType: 'balanced' },
    { planId: 'voedingsplan-balans', planType: 'balanced' },
    { planId: 'voedingsplan-spiermassa', planType: 'balanced' }
  ];

  let successCount = 0;
  let totalCount = plansToUpdate.length;

  for (const plan of plansToUpdate) {
    const success = await updateNutritionPlan(plan.planId, plan.planType);
    if (success) {
      successCount++;
    }
    
    // Kleine pauze tussen updates
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n============================================================');
  console.log('🎉 Update completed!');
  console.log(`✅ Successfully updated: ${successCount}/${totalCount} plans`);
  console.log(`❌ Failed: ${totalCount - successCount} plans`);
  
  if (successCount === totalCount) {
    console.log('\n🎯 All nutrition plans now have 6 meals structure:');
    console.log('   • ontbijt (breakfast)');
    console.log('   • ochtend_snack (morning snack)');
    console.log('   • lunch');
    console.log('   • lunch_snack (afternoon snack)');
    console.log('   • diner');
    console.log('   • avond_snack (evening snack)');
  }
}

// Voer script uit
updateAllNutritionPlans().catch(console.error);
