require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateMacroDistributions() {
  console.log('🔧 Updating macro distributions for maaltijdplan normaal...');
  console.log('');

  try {
    // Fetch current maaltijdplan normaal plans
    const { data: plans, error: fetchError } = await supabase
      .from('nutrition_plans')
      .select('plan_id, name, meals')
      .in('plan_id', ['maaltijdplan-droogtrainen', 'maaltijdplan-onderhoud', 'maaltijdplan-spiermassa']);

    if (fetchError) {
      console.error('❌ Error fetching plans:', fetchError);
      return;
    }

    console.log('📊 Current plans found:', plans?.length);
    console.log('');

    // New macro distributions for maaltijdplan normaal
    const macroDistributions = {
      'maaltijdplan-droogtrainen': {
        name: 'Maaltijdplan normaal - Droogtrainen',
        calories: 2360,
        protein_percent: 40,
        carbs_percent: 40,
        fat_percent: 20
      },
      'maaltijdplan-onderhoud': {
        name: 'Maaltijdplan normaal - Onderhoud',
        calories: 2860,
        protein_percent: 35,
        carbs_percent: 40,
        fat_percent: 25
      },
      'maaltijdplan-spiermassa': {
        name: 'Maaltijdplan normaal - Spiermassa',
        calories: 3260,
        protein_percent: 30,
        carbs_percent: 50,
        fat_percent: 20
      }
    };

    console.log('🎯 New macro distributions:');
    Object.entries(macroDistributions).forEach(([planId, config]) => {
      console.log(`   ${config.name}:`);
      console.log(`   Protein: ${config.protein_percent}% | Carbs: ${config.carbs_percent}% | Fat: ${config.fat_percent}%`);
      console.log('');
    });

    // Update each plan
    for (const plan of plans || []) {
      const config = macroDistributions[plan.plan_id];
      
      if (config) {
        const calories = config.calories;
        
        // Calculate macros based on percentages
        const proteinCals = calories * (config.protein_percent / 100);
        const carbsCals = calories * (config.carbs_percent / 100);
        const fatCals = calories * (config.fat_percent / 100);
        
        const protein = Math.round(proteinCals / 4); // 4 cal per gram protein
        const carbs = Math.round(carbsCals / 4); // 4 cal per gram carbs
        const fat = Math.round(fatCals / 9); // 9 cal per gram fat

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
          console.error(`❌ Error updating ${plan.plan_id}:`, updateError);
        } else {
          console.log(`✅ ${config.name}:`);
          console.log(`   ${calories} kcal | ${protein}g protein (${config.protein_percent}%) | ${carbs}g carbs (${config.carbs_percent}%) | ${fat}g fat (${config.fat_percent}%)`);
          
          // Verify percentages
          const actualProteinPercent = Math.round((protein * 4 / calories) * 100);
          const actualCarbsPercent = Math.round((carbs * 4 / calories) * 100);
          const actualFatPercent = Math.round((fat * 9 / calories) * 100);
          console.log(`   Actual: Protein ${actualProteinPercent}% | Carbs ${actualCarbsPercent}% | Fat ${actualFatPercent}%`);
        }
        console.log('');
      }
    }

    // Final verification
    console.log('✅ Final verification - Updated macro distributions:');
    const { data: finalPlans, error: finalError } = await supabase
      .from('nutrition_plans')
      .select('plan_id, name, meals')
      .in('plan_id', ['maaltijdplan-droogtrainen', 'maaltijdplan-onderhoud', 'maaltijdplan-spiermassa']);

    if (finalError) {
      console.error('❌ Error fetching final plans:', finalError);
      return;
    }

    finalPlans?.forEach((plan) => {
      const meals = plan.meals;
      if (meals) {
        const calories = meals.target_calories;
        const protein = meals.target_protein;
        const carbs = meals.target_carbs;
        const fat = meals.target_fat;
        
        const proteinPercent = Math.round((protein * 4 / calories) * 100);
        const carbsPercent = Math.round((carbs * 4 / calories) * 100);
        const fatPercent = Math.round((fat * 9 / calories) * 100);
        
        console.log(`📊 ${plan.name}:`);
        console.log(`   ${calories} kcal | ${protein}g protein (${proteinPercent}%) | ${carbs}g carbs (${carbsPercent}%) | ${fat}g fat (${fatPercent}%)`);
      }
    });

    console.log('');
    console.log('🎉 Macro distributions updated successfully!');
    console.log('🔄 Refresh the admin page to see new macro percentages!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateMacroDistributions();
