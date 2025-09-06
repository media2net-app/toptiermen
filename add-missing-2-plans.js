require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissing2Plans() {
  console.log('➕ Adding the 2 missing plans to get exactly 6 total...');
  console.log('');

  try {
    // Current plans check
    const { data: currentPlans, error: fetchError } = await supabase
      .from('nutrition_plans')
      .select('plan_id, name, meals')
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching current plans:', fetchError);
      return;
    }

    console.log(`📋 Current ${currentPlans?.length || 0} plans:`);
    currentPlans?.forEach((plan, index) => {
      const goal = plan.meals?.goal || 'Unknown';
      const calories = plan.meals?.target_calories || 'N/A';
      console.log(`   ${index + 1}. ${plan.name} (${goal}, ${calories} kcal)`);
    });
    console.log('');

    // Add the 2 missing plans
    const missingPlans = [
      {
        plan_id: 'carnivoor-onderhoud',
        name: 'Carnivoor - Onderhoud',
        subtitle: 'Carnivoor voor lichaamscompositie behoud',
        description: 'Carnivoor dieet voor behoud van huidige lichaamscompositie. Gebalanceerde macro-verdeling binnen carnivoor kader.',
        icon: '⚖️',
        color: '#3b82f6',
        meals: {
          target_calories: 2200,
          target_protein: 165,
          target_carbs: 220,
          target_fat: 73,
          goal: 'Onderhoud',
          difficulty: 'beginner',
          duration_weeks: 12
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
      }
    ];

    console.log('➕ Adding missing plans:');
    
    for (const plan of missingPlans) {
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
      console.log('🎉 SUCCESS: Exactly 6 nutrition plans achieved!');
      console.log('   🔥 Droogtrainen: 2 plannen');
      console.log('   ⚖️ Onderhoud: 2 plannen');  
      console.log('   💪 Spiermassa: 2 plannen');
    } else {
      console.log(`⚠️ Warning: Expected 6 plans, but got ${finalPlans?.length}`);
    }

    console.log('✅ Update completed! Refresh the admin page.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addMissing2Plans();
