require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixCalorieDisplay() {
  console.log('🔧 Fixing calorie display - ensuring correct values are shown...');
  console.log('');

  try {
    // Check current data
    console.log('📊 Current data in database:');
    const { data: currentPlans, error: fetchError } = await supabase
      .from('nutrition_plans')
      .select('plan_id, name, meals')
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching current plans:', fetchError);
      return;
    }

    currentPlans?.forEach((plan, index) => {
      const calories = plan.meals?.target_calories || 'N/A';
      const protein = plan.meals?.target_protein || 'N/A';
      console.log(`${index + 1}. ${plan.name}: ${calories} kcal, ${protein}g protein`);
    });
    console.log('');

    // Define the correct calorie values for each plan
    const correctValues = {
      'carnivoor-onderhoud': { calories: 2860, protein: 300 },
      'carnivoor-droogtrainen': { calories: 2360, protein: 300 },
      'carnivoor-spiermassa': { calories: 3260, protein: 300 },
      'maaltijdplan-onderhoud': { calories: 2860, protein: 220 },
      'maaltijdplan-droogtrainen': { calories: 2360, protein: 220 },
      'maaltijdplan-spiermassa': { calories: 3260, protein: 220 }
    };

    console.log('🔄 Updating plans with correct calorie values:');

    for (const plan of currentPlans || []) {
      const correctData = correctValues[plan.plan_id];
      
      if (correctData) {
        // Recalculate macros with correct calories and protein
        const calories = correctData.calories;
        const protein = correctData.protein;
        const proteinCals = protein * 4;
        const remainingCals = calories - proteinCals;
        
        // Determine goal for macro distribution
        const goal = plan.meals?.goal || 'Onderhoud';
        let carbsPercent, fatPercent;
        
        switch (goal) {
          case 'Droogtrainen':
            carbsPercent = 0.35; fatPercent = 0.65;
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

        // Update the plan
        const updatedMeals = {
          ...plan.meals,
          target_calories: calories,
          target_protein: protein,
          target_carbs: carbs,
          target_fat: fat,
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
          console.log(`✅ ${plan.name}: ${calories} kcal (was showing 2200)`);
          console.log(`   Macros: ${protein}g protein, ${carbs}g carbs, ${fat}g fat`);
        }
      } else {
        console.log(`⚠️ No correction data found for ${plan.plan_id}`);
      }
      console.log('');
    }

    // Verify final result
    console.log('✅ Final verification:');
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
      const carbs = plan.meals?.target_carbs || 'N/A';
      const fat = plan.meals?.target_fat || 'N/A';
      console.log(`${index + 1}. ${plan.name}:`);
      console.log(`   ${calories} kcal | ${protein}g protein | ${carbs}g carbs | ${fat}g fat`);
    });

    console.log('');
    console.log('🎉 Calorie display fixed! Expected results:');
    console.log('   🔥 Droogtrainen plannen: 2360 kcal');
    console.log('   ⚖️ Onderhoud plannen: 2860 kcal');
    console.log('   💪 Spiermassa plannen: 3260 kcal');
    console.log('');
    console.log('🔄 Refresh the admin page to see correct calorie values!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixCalorieDisplay();
