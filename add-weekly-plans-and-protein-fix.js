require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addWeeklyPlansAndProteinFix() {
  console.log('🗓️ Adding weekly meal plans + fixing protein factors...');
  console.log('');

  try {
    // Helper function to calculate correct protein based on type and weight (100kg example)
    const calculateCorrectProtein = (type, weight = 100) => {
      if (type === 'carnivoor') {
        return weight * 3; // 3x gewicht voor carnivoor
      } else {
        return weight * 2.2; // 2.2x gewicht voor maaltijdplan normaal
      }
    };

    // Helper function to recalculate macros with correct protein
    const recalculateMacros = (calories, protein, goal) => {
      const proteinCals = protein * 4;
      const remainingCals = calories - proteinCals;
      
      let carbsPercent, fatPercent;
      switch (goal) {
        case 'Droogtrainen':
          carbsPercent = 0.35; fatPercent = 0.65; // Van remaining calories
          break;
        case 'Onderhoud':
          carbsPercent = 0.60; fatPercent = 0.40;
          break;
        case 'Spiermassa':
          carbsPercent = 0.65; fatPercent = 0.35;
          break;
        default:
          carbsPercent = 0.60; fatPercent = 0.40;
      }
      
      const carbs = Math.round((remainingCals * carbsPercent) / 4);
      const fat = Math.round((remainingCals * fatPercent) / 9);
      
      return { protein, carbs, fat };
    };

    // Create weekly meal template
    const createWeeklyMealPlan = (planType, goal) => {
      const mealTypes = ['Ontbijt', 'Ochtend Snack', 'Lunch', 'Middag Snack', 'Diner', 'Avond Snack'];
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const dayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
      
      const weeklyPlan = {};
      
      days.forEach((day, dayIndex) => {
        const dayMeals = {};
        
        mealTypes.forEach(mealType => {
          // Create base meal with example ingredients based on plan type
          let ingredients = [];
          
          if (planType === 'carnivoor') {
            // Carnivoor specific ingredients
            switch (mealType) {
              case 'Ontbijt':
                ingredients = [
                  { name: 'Eieren', amount: 3, unit: 'stuk', calories: 210, protein: 18, carbs: 1, fat: 15 },
                  { name: 'Spek', amount: 50, unit: 'g', calories: 270, protein: 12, carbs: 0, fat: 25 }
                ];
                break;
              case 'Lunch':
                ingredients = [
                  { name: 'Ribeye Steak', amount: 200, unit: 'g', calories: 540, protein: 50, carbs: 0, fat: 36 },
                  { name: 'Boter', amount: 20, unit: 'g', calories: 150, protein: 0, carbs: 0, fat: 17 }
                ];
                break;
              case 'Diner':
                ingredients = [
                  { name: 'Zalm', amount: 180, unit: 'g', calories: 370, protein: 50, carbs: 0, fat: 18 },
                  { name: 'Goudse kaas', amount: 30, unit: 'g', calories: 110, protein: 7, carbs: 1, fat: 9 }
                ];
                break;
              default:
                ingredients = [
                  { name: 'Goudse kaas', amount: 25, unit: 'g', calories: 95, protein: 6, carbs: 1, fat: 8 }
                ];
            }
          } else {
            // Maaltijdplan normaal ingredients
            switch (mealType) {
              case 'Ontbijt':
                ingredients = [
                  { name: 'Havermout', amount: 60, unit: 'g', calories: 220, protein: 8, carbs: 40, fat: 4 },
                  { name: 'Banaan', amount: 1, unit: 'stuk', calories: 95, protein: 1, carbs: 24, fat: 0 },
                  { name: 'Amandelen', amount: 20, unit: 'g', calories: 115, protein: 4, carbs: 2, fat: 10 }
                ];
                break;
              case 'Lunch':
                ingredients = [
                  { name: 'Kip filet', amount: 150, unit: 'g', calories: 250, protein: 46, carbs: 0, fat: 6 },
                  { name: 'Rijst', amount: 80, unit: 'g', calories: 290, protein: 6, carbs: 63, fat: 1 },
                  { name: 'Broccoli', amount: 100, unit: 'g', calories: 25, protein: 3, carbs: 3, fat: 0 }
                ];
                break;
              case 'Diner':
                ingredients = [
                  { name: 'Zalm', amount: 120, unit: 'g', calories: 245, protein: 33, carbs: 0, fat: 12 },
                  { name: 'Zoete aardappel', amount: 150, unit: 'g', calories: 130, protein: 2, carbs: 30, fat: 0 },
                  { name: 'Spinazie', amount: 100, unit: 'g', calories: 20, protein: 3, carbs: 2, fat: 0 }
                ];
                break;
              default:
                ingredients = [
                  { name: 'Griekse yoghurt', amount: 150, unit: 'g', calories: 95, protein: 10, carbs: 4, fat: 5 },
                  { name: 'Blauwe bessen', amount: 50, unit: 'g', calories: 30, protein: 0, carbs: 7, fat: 0 }
                ];
            }
          }
          
          // Calculate meal totals
          const totalCalories = ingredients.reduce((sum, ing) => sum + ing.calories, 0);
          const totalProtein = ingredients.reduce((sum, ing) => sum + ing.protein, 0);
          const totalCarbs = ingredients.reduce((sum, ing) => sum + ing.carbs, 0);
          const totalFat = ingredients.reduce((sum, ing) => sum + ing.fat, 0);
          
          dayMeals[mealType.toLowerCase().replace(' ', '_')] = {
            name: `${mealType} - ${dayNames[dayIndex]}`,
            ingredients: ingredients,
            nutrition: {
              calories: totalCalories,
              protein: Math.round(totalProtein * 10) / 10,
              carbs: Math.round(totalCarbs * 10) / 10,
              fat: Math.round(totalFat * 10) / 10
            },
            time: mealType === 'Ontbijt' ? '08:00' : 
                  mealType === 'Ochtend Snack' ? '10:30' :
                  mealType === 'Lunch' ? '13:00' :
                  mealType === 'Middag Snack' ? '15:30' :
                  mealType === 'Diner' ? '18:30' : '21:00'
          };
        });
        
        weeklyPlan[day] = dayMeals;
      });
      
      return weeklyPlan;
    };

    // Get all current plans
    const { data: currentPlans, error: fetchError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching plans:', fetchError);
      return;
    }

    console.log(`📋 Found ${currentPlans?.length || 0} plans to update`);
    console.log('');

    // Update each plan with correct protein and weekly meal plan
    for (const plan of currentPlans || []) {
      console.log(`🔄 Updating: ${plan.name}`);
      
      // Determine plan type
      const isCarnivoor = plan.name.toLowerCase().includes('carnivoor');
      const planType = isCarnivoor ? 'carnivoor' : 'maaltijdplan';
      
      // Get correct protein amount (for 100kg person example)
      const correctProtein = calculateCorrectProtein(planType);
      
      // Recalculate macros with correct protein
      const currentCalories = plan.meals?.target_calories || 2500;
      const currentGoal = plan.meals?.goal || 'Onderhoud';
      const newMacros = recalculateMacros(currentCalories, correctProtein, currentGoal);
      
      // Create weekly meal plan
      const weeklyPlan = createWeeklyMealPlan(planType, currentGoal);
      
      // Update plan with new data
      const updatedMeals = {
        ...plan.meals,
        target_protein: newMacros.protein,
        target_carbs: newMacros.carbs,
        target_fat: newMacros.fat,
        weekly_plan: weeklyPlan,
        protein_factor: isCarnivoor ? 3.0 : 2.2,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('nutrition_plans')
        .update({
          meals: updatedMeals,
          updated_at: new Date().toISOString()
        })
        .eq('plan_id', plan.plan_id);

      if (updateError) {
        console.error(`❌ Error updating ${plan.name}:`, updateError);
      } else {
        console.log(`✅ Updated: ${plan.name}`);
        console.log(`   Protein: ${newMacros.protein}g (${isCarnivoor ? '3x' : '2.2x'} gewicht)`);
        console.log(`   Carbs: ${newMacros.carbs}g, Fat: ${newMacros.fat}g`);
        console.log(`   Weekly plan: 7 dagen, 6 maaltijden per dag`);
      }
      console.log('');
    }

    // Verify final result
    console.log('✅ Verification of updated plans:');
    const { data: finalPlans, error: finalError } = await supabase
      .from('nutrition_plans')
      .select('plan_id, name, meals')
      .order('name');

    if (finalError) {
      console.error('❌ Error fetching final plans:', finalError);
      return;
    }

    finalPlans?.forEach((plan, index) => {
      const calories = plan.meals?.target_calories || 'N/A';
      const protein = plan.meals?.target_protein || 'N/A';
      const proteinFactor = plan.meals?.protein_factor || 'N/A';
      const hasWeeklyPlan = plan.meals?.weekly_plan ? 'Yes' : 'No';
      
      console.log(`${index + 1}. ${plan.name}`);
      console.log(`   ${calories} kcal | ${protein}g protein (${proteinFactor}x factor) | Weekly plan: ${hasWeeklyPlan}`);
    });
    console.log('');

    console.log('🎉 All plans updated with:');
    console.log('   ✅ Correct protein factors (3x carnivoor, 2.2x maaltijdplan)');
    console.log('   ✅ Complete weekly meal plans (Ma-Zo, 6 maaltijden/dag)');
    console.log('   ✅ Adjusted macro ratios based on new protein levels');
    console.log('');
    console.log('🔄 Refresh admin page to see all updates!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addWeeklyPlansAndProteinFix();
