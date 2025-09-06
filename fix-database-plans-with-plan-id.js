require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabasePlansWithPlanId() {
  console.log('🔄 Adding missing plans with proper plan_id...');
  console.log('');

  try {
    // Check current plans
    const { data: currentPlans, error: fetchError } = await supabase
      .from('nutrition_plans')
      .select('plan_id, name, target_calories, goal')
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching current plans:', fetchError);
      return;
    }

    console.log(`📋 Current ${currentPlans?.length || 0} plans:`);
    currentPlans?.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name} (plan_id: ${plan.plan_id})`);
    });
    console.log('');

    // Define missing plans with plan_id
    const missingPlans = [
      {
        plan_id: 'op-maat-droogtrainen',
        name: 'Op maat - Droogtrainen',
        subtitle: 'Volledig aangepast voor optimaal vetverlies',
        description: 'Volledig aangepast voedingsplan voor optimaal vetverlies. Persoonlijke macro-verdeling op basis van jouw specifieke doelen en voorkeuren.',
        icon: '🎯',
        color: '#dc2626',
        meals: {
          target_calories: 1650,
          target_protein: 175,
          target_carbs: 120,
          target_fat: 55,
          goal: 'Droogtrainen',
          difficulty: 'intermediate',
          duration_weeks: 16
        },
        is_active: true
      },
      {
        plan_id: 'high-protein',
        name: 'High Protein',
        subtitle: 'Eiwitrijk voor spiergroei en herstel',
        description: 'Eiwitrijk voedingsplan geoptimaliseerd voor spiergroei en herstel. Perfect voor intensieve trainingsperiodes.',
        icon: '💪',
        color: '#7c3aed',
        meals: {
          target_calories: 2350,
          target_protein: 200,
          target_carbs: 200,
          target_fat: 75,
          goal: 'Spiermassa',
          difficulty: 'intermediate',
          duration_weeks: 12
        },
        is_active: true
      },
      {
        plan_id: 'onderhoud-gebalanceerd',
        name: 'Onderhoud',
        subtitle: 'Gebalanceerd voor duurzame energie',
        description: 'Gebalanceerd voedingsplan voor behoud van huidige lichaamscompositie. Mix van alle macronutriënten voor duurzame energie.',
        icon: '⚖️',
        color: '#059669',
        meals: {
          target_calories: 2100,
          target_protein: 140,
          target_carbs: 245,
          target_fat: 70,
          goal: 'Onderhoud',
          difficulty: 'beginner',
          duration_weeks: 12
        },
        is_active: true
      }
    ];

    // Check which plans need to be added
    const existingPlanIds = currentPlans?.map(p => p.plan_id) || [];
    const plansToAdd = missingPlans.filter(plan => !existingPlanIds.includes(plan.plan_id));

    console.log(`➕ Adding ${plansToAdd.length} missing plans:`);
    
    for (const plan of plansToAdd) {
      console.log(`   Adding: ${plan.name} (${plan.plan_id})`);
      
      const { error: insertError } = await supabase
        .from('nutrition_plans')
        .insert([plan]);

      if (insertError) {
        console.error(`❌ Error adding ${plan.name}:`, insertError);
      } else {
        console.log(`✅ Successfully added: ${plan.name}`);
      }
    }
    console.log('');

    // Verify final result
    const { data: finalPlans, error: finalError } = await supabase
      .from('nutrition_plans')
      .select('plan_id, name, meals')
      .order('name');

    if (finalError) {
      console.error('❌ Error fetching final plans:', finalError);
      return;
    }

    console.log(`🎉 Final result: ${finalPlans?.length || 0} plans total`);
    
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

    console.log('✅ Database update completed! Refresh the admin page.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixDatabasePlansWithPlanId();
