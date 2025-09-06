require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupNutritionPlansFinal() {
  console.log('🧹 Final cleanup: Ensuring exactly 6 plans with correct goals...');
  console.log('');

  try {
    // Get all current plans
    const { data: allPlans, error: fetchError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching plans:', fetchError);
      return;
    }

    console.log(`📋 Current ${allPlans?.length || 0} plans:`);
    allPlans?.forEach((plan, index) => {
      const goal = plan.meals?.goal || plan.goal || 'Unknown';
      const calories = plan.meals?.target_calories || plan.target_calories || 'N/A';
      console.log(`   ${index + 1}. ${plan.name} (${goal}, ${calories} kcal)`);
    });
    console.log('');

    // Define the exact 6 plans we want
    const targetPlans = [
      {
        plan_id: 'carnivoor-droogtrainen',
        name: 'Carnivoor - Droogtrainen',
        goal: 'Droogtrainen'
      },
      {
        plan_id: 'op-maat-droogtrainen', 
        name: 'Op maat - Droogtrainen',
        goal: 'Droogtrainen'
      },
      {
        plan_id: 'carnivoor-onderhoud',
        name: 'Carnivoor - Onderhoud', 
        goal: 'Onderhoud'
      },
      {
        plan_id: 'onderhoud-gebalanceerd',
        name: 'Onderhoud',
        goal: 'Onderhoud'
      },
      {
        plan_id: 'carnivoor-spiermassa',
        name: 'Carnivoor - Spiermassa',
        goal: 'Spiermassa'
      },
      {
        plan_id: 'high-protein',
        name: 'High Protein',
        goal: 'Spiermassa'
      }
    ];

    // Step 1: Update existing plans to correct goals
    console.log('🔄 Step 1: Updating plan goals...');
    for (const targetPlan of targetPlans) {
      const existingPlan = allPlans?.find(p => p.plan_id === targetPlan.plan_id);
      if (existingPlan) {
        // Update meals.goal if meals exists
        let updatedMeals = existingPlan.meals || {};
        updatedMeals.goal = targetPlan.goal;

        const { error: updateError } = await supabase
          .from('nutrition_plans')
          .update({
            name: targetPlan.name,
            meals: updatedMeals,
            updated_at: new Date().toISOString()
          })
          .eq('plan_id', targetPlan.plan_id);

        if (updateError) {
          console.error(`❌ Error updating ${targetPlan.plan_id}:`, updateError);
        } else {
          console.log(`✅ Updated: ${targetPlan.name} → ${targetPlan.goal}`);
        }
      }
    }
    console.log('');

    // Step 2: Remove unwanted plans
    console.log('🗑️ Step 2: Removing unwanted plans...');
    const targetPlanIds = targetPlans.map(p => p.plan_id);
    const plansToDelete = allPlans?.filter(p => !targetPlanIds.includes(p.plan_id));

    if (plansToDelete && plansToDelete.length > 0) {
      for (const planToDelete of plansToDelete) {
        console.log(`🗑️ Removing: ${planToDelete.name} (${planToDelete.plan_id})`);
        
        const { error: deleteError } = await supabase
          .from('nutrition_plans')
          .delete()
          .eq('plan_id', planToDelete.plan_id);

        if (deleteError) {
          console.error(`❌ Error deleting ${planToDelete.name}:`, deleteError);
        } else {
          console.log(`✅ Deleted: ${planToDelete.name}`);
        }
      }
    } else {
      console.log('ℹ️ No plans to delete');
    }
    console.log('');

    // Step 3: Verify final result
    console.log('✅ Step 3: Verifying final result...');
    const { data: finalPlans, error: finalError } = await supabase
      .from('nutrition_plans')
      .select('plan_id, name, meals')
      .order('name');

    if (finalError) {
      console.error('❌ Error fetching final plans:', finalError);
      return;
    }

    console.log(`🎉 Final result: ${finalPlans?.length || 0} plans total`);
    console.log('');

    // Group by goal
    const plansByGoal = {};
    finalPlans?.forEach(plan => {
      const goal = plan.meals?.goal || 'Unknown';
      if (!plansByGoal[goal]) plansByGoal[goal] = [];
      plansByGoal[goal].push(plan);
    });

    Object.keys(plansByGoal).sort().forEach(goal => {
      console.log(`🎯 ${goal}: ${plansByGoal[goal].length} plannen`);
      plansByGoal[goal].forEach((plan, index) => {
        const calories = plan.meals?.target_calories || 'N/A';
        console.log(`   ${index + 1}. ${plan.name} (${calories} kcal)`);
      });
      console.log('');
    });

    if (finalPlans?.length === 6) {
      console.log('🎉 SUCCESS: Exactly 6 nutrition plans configured!');
    } else {
      console.log(`⚠️ Warning: Expected 6 plans, but got ${finalPlans?.length}`);
    }

    console.log('✅ Cleanup completed! Refresh the admin page to see changes.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

cleanupNutritionPlansFinal();
