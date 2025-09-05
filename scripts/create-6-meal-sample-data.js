#!/usr/bin/env node

/**
 * Script om voorbeelddata met 6 eetmomenten toe te voegen aan voedingsplannen
 * die nog geen weekly_plan data hebben
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

// Voorbeelddata voor verschillende plan types
const SAMPLE_MEAL_DATA = {
  carnivoor: {
    ontbijt: [
      { name: 'Runderen gehakt', amount: 150, unit: 'gram', calories: 250, protein: 26, carbs: 0, fat: 15 },
      { name: 'Eieren', amount: 2, unit: 'stuks', calories: 140, protein: 12, carbs: 1, fat: 10 },
      { name: 'Boter', amount: 15, unit: 'gram', calories: 108, protein: 0.1, carbs: 0, fat: 12 }
    ],
    ochtend_snack: [
      { name: 'Beef Jerky', amount: 30, unit: 'gram', calories: 123, protein: 7.5, carbs: 3.3, fat: 7.8 },
      { name: 'Water', amount: 250, unit: 'ml', calories: 0, protein: 0, carbs: 0, fat: 0 }
    ],
    lunch: [
      { name: 'Zalm filet', amount: 150, unit: 'gram', calories: 208, protein: 25, carbs: 0, fat: 12 },
      { name: 'Rundervet', amount: 20, unit: 'gram', calories: 180, protein: 0, carbs: 0, fat: 20 }
    ],
    lunch_snack: [
      { name: 'Kippenheart', amount: 40, unit: 'gram', calories: 61, protein: 6.2, carbs: 0, fat: 3.7 },
      { name: 'Zout', amount: 1, unit: 'gram', calories: 0, protein: 0, carbs: 0, fat: 0 }
    ],
    diner: [
      { name: 'Entrecote', amount: 200, unit: 'gram', calories: 540, protein: 50, carbs: 0, fat: 38 },
      { name: 'Rundervet', amount: 15, unit: 'gram', calories: 135, protein: 0, carbs: 0, fat: 15 }
    ],
    avond_snack: [
      { name: 'Biltong', amount: 25, unit: 'gram', calories: 63, protein: 13.5, carbs: 0.4, fat: 0.8 },
      { name: 'Kippenlever', amount: 30, unit: 'gram', calories: 36, protein: 5.1, carbs: 0.3, fat: 1.4 }
    ]
  },
  balanced: {
    ontbijt: [
      { name: 'Havermout', amount: 60, unit: 'gram', calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
      { name: 'Melk', amount: 200, unit: 'ml', calories: 84, protein: 6.6, carbs: 9.4, fat: 3.2 },
      { name: 'Blauwe bessen', amount: 50, unit: 'gram', calories: 29, protein: 0.4, carbs: 7, fat: 0.2 },
      { name: 'Walnoten', amount: 15, unit: 'gram', calories: 98, protein: 2.3, carbs: 2.1, fat: 9.8 }
    ],
    ochtend_snack: [
      { name: 'Griekse yoghurt', amount: 150, unit: 'gram', calories: 89, protein: 15, carbs: 6, fat: 0.6 },
      { name: 'Banaan', amount: 100, unit: 'gram', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 }
    ],
    lunch: [
      { name: 'Volkoren brood', amount: 60, unit: 'gram', calories: 161, protein: 6, carbs: 28, fat: 3 },
      { name: 'Kipfilet', amount: 100, unit: 'gram', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      { name: 'Avocado', amount: 80, unit: 'gram', calories: 128, protein: 1.6, carbs: 7.2, fat: 12 },
      { name: 'Sla', amount: 50, unit: 'gram', calories: 8, protein: 0.6, carbs: 1.5, fat: 0.1 }
    ],
    lunch_snack: [
      { name: 'Amandelen', amount: 20, unit: 'gram', calories: 116, protein: 4.2, carbs: 4.4, fat: 10 },
      { name: 'Appel', amount: 150, unit: 'gram', calories: 78, protein: 0.4, carbs: 21, fat: 0.3 }
    ],
    diner: [
      { name: 'Zalm', amount: 150, unit: 'gram', calories: 208, protein: 25, carbs: 0, fat: 12 },
      { name: 'Zoete aardappel', amount: 150, unit: 'gram', calories: 129, protein: 2.3, carbs: 30, fat: 0.2 },
      { name: 'Broccoli', amount: 150, unit: 'gram', calories: 51, protein: 4.2, carbs: 10.5, fat: 0.6 },
      { name: 'Olijfolie', amount: 10, unit: 'ml', calories: 82, protein: 0, carbs: 0, fat: 9.2 }
    ],
    avond_snack: [
      { name: 'Hüttenkäse', amount: 100, unit: 'gram', calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
      { name: 'Walnoten', amount: 10, unit: 'gram', calories: 65, protein: 1.5, carbs: 1.4, fat: 6.5 }
    ]
  }
};

// Helper functie om maaltijd nutritie te berekenen
function calculateMealNutrition(ingredients) {
  return ingredients.reduce((totals, ingredient) => ({
    calories: totals.calories + (ingredient.calories || 0),
    protein: totals.protein + (ingredient.protein || 0),
    carbs: totals.carbs + (ingredient.carbs || 0),
    fat: totals.fat + (ingredient.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

// Create een week plan met 6 eetmomenten
function createWeekPlan(planType, targetCalories = 2000) {
  const mealData = SAMPLE_MEAL_DATA[planType] || SAMPLE_MEAL_DATA.carnivoor;
  const weekPlan = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  days.forEach(day => {
    // Bereken nutrition voor elke maaltijd
    const ontbijtNutrition = calculateMealNutrition(mealData.ontbijt);
    const ochtendSnackNutrition = calculateMealNutrition(mealData.ochtend_snack);
    const lunchNutrition = calculateMealNutrition(mealData.lunch);
    const lunchSnackNutrition = calculateMealNutrition(mealData.lunch_snack);
    const dinerNutrition = calculateMealNutrition(mealData.diner);
    const avondSnackNutrition = calculateMealNutrition(mealData.avond_snack);

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

    weekPlan[day] = {
      ontbijt: mealData.ontbijt,
      ochtend_snack: mealData.ochtend_snack,
      lunch: mealData.lunch,
      lunch_snack: mealData.lunch_snack, 
      diner: mealData.diner,
      avond_snack: mealData.avond_snack,
      dailyTotals
    };
  });

  return weekPlan;
}

async function addSampleDataToPlan(planId, planType) {
  try {
    console.log(`\n🔄 Adding 6-meal sample data to: ${planId}`);
    
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

    // Controleer of er al weekly_plan data is
    if (currentPlan.meals && currentPlan.meals.weekly_plan) {
      console.log(`⚠️  Plan ${planId} already has weekly_plan data`);
      return false;
    }

    // Maak de target calories aan de hand van het plan type
    let targetCalories = 2000;
    if (planId.includes('droogtrainen')) targetCalories = 1800;
    if (planId.includes('spiermassa')) targetCalories = 2500;
    if (planId.includes('balans')) targetCalories = 2000;

    // Creëer week plan met 6 eetmomenten
    const weekPlan = createWeekPlan(planType, targetCalories);

    // Bereken weekly averages
    const weeklyTotals = Object.values(weekPlan).reduce((totals, day) => ({
      calories: totals.calories + day.dailyTotals.calories,
      protein: totals.protein + day.dailyTotals.protein,
      carbs: totals.carbs + day.dailyTotals.carbs,
      fat: totals.fat + day.dailyTotals.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const weeklyAverages = {
      calories: Math.round(weeklyTotals.calories / 7),
      protein: Math.round((weeklyTotals.protein / 7) * 10) / 10,
      carbs: Math.round((weeklyTotals.carbs / 7) * 10) / 10,
      fat: Math.round((weeklyTotals.fat / 7) * 10) / 10
    };

    // Update het plan in de database
    const updatedMeals = {
      ...(currentPlan.meals || {}),
      target_calories: targetCalories,
      target_protein: weeklyAverages.protein,
      target_carbs: weeklyAverages.carbs,
      target_fat: weeklyAverages.fat,
      weekly_plan: weekPlan,
      weekly_averages: weeklyAverages
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

    console.log(`✅ Successfully added 6-meal structure to ${planId}`);
    console.log(`   Target calories: ${targetCalories}`);
    console.log(`   Weekly averages - Protein: ${weeklyAverages.protein}g, Carbs: ${weeklyAverages.carbs}g, Fat: ${weeklyAverages.fat}g`);
    return true;

  } catch (error) {
    console.error(`❌ Error updating ${planId}:`, error.message);
    return false;
  }
}

async function createSampleDataForAllPlans() {
  console.log('🚀 Creating 6-meal sample data for nutrition plans...');
  console.log('=====================================================');

  // Plan mapping
  const plansToUpdate = [
    { planId: 'carnivoor-balans', planType: 'carnivoor' },
    { planId: 'carnivoor-spiermassa', planType: 'carnivoor' },
    { planId: 'voedingsplan-droogtrainen', planType: 'balanced' },
    { planId: 'voedingsplan-balans', planType: 'balanced' },
    { planId: 'voedingsplan-spiermassa', planType: 'balanced' }
  ];

  let successCount = 0;
  let totalCount = plansToUpdate.length;

  for (const plan of plansToUpdate) {
    const success = await addSampleDataToPlan(plan.planId, plan.planType);
    if (success) {
      successCount++;
    }
    
    // Kleine pauze tussen updates
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n=====================================================');
  console.log('🎉 Sample data creation completed!');
  console.log(`✅ Successfully updated: ${successCount}/${totalCount} plans`);
  console.log(`❌ Failed: ${totalCount - successCount} plans`);
  
  if (successCount > 0) {
    console.log('\n🎯 Added plans now have 6 meals structure:');
    console.log('   • ontbijt (breakfast)');
    console.log('   • ochtend_snack (morning snack)');
    console.log('   • lunch');
    console.log('   • lunch_snack (afternoon snack)');
    console.log('   • diner');
    console.log('   • avond_snack (evening snack)');
  }
}

// Voer script uit
createSampleDataForAllPlans().catch(console.error);
