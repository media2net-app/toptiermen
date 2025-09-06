require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function create6PlansFresh() {
  console.log('🔄 Creating exactly 6 nutrition plans...');
  console.log('');

  try {
    // Define all 6 plans exactly as needed
    const allSixPlans = [
      {
        plan_id: 'carnivoor-droogtrainen',
        name: 'Carnivoor - Droogtrainen',
        subtitle: 'Carnivoor voor vetverlies',
        description: 'Carnivoor dieet geoptimaliseerd voor vetverlies met behoud van spiermassa. Focus op hoge eiwitinname en lage koolhydraten.',
        icon: '🔥',
        color: '#ef4444',
        meals: {
          target_calories: 1870,
          target_protein: 198,
          target_carbs: 154,
          target_fat: 66,
          goal: 'Droogtrainen',
          difficulty: 'intermediate',
          duration_weeks: 12
        },
        is_active: true
      },
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
      },
      {
        plan_id: 'carnivoor-spiermassa',
        name: 'Carnivoor - Spiermassa',
        subtitle: 'Carnivoor voor spiergroei',
        description: 'Carnivoor dieet geoptimaliseerd voor spiergroei en krachttoename. Verhoogde calorie- en eiwitinname.',
        icon: '💪',
        color: '#f59e0b',
        meals: {
          target_calories: 2530,
          target_protein: 215,
          target_carbs: 264,
          target_fat: 80,
          goal: 'Spiermassa',
          difficulty: 'intermediate',
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

    // Check which plans already exist
    const { data: existingPlans, error: fetchError } = await supabase
      .from('nutrition_plans')
      .select('plan_id, name')
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching existing plans:', fetchError);
      return;
    }

    console.log(`📋 Current ${existingPlans?.length || 0} plans found`);
    const existingPlanIds = existingPlans?.map(p => p.plan_id) || [];

    // Add missing plans
    console.log('➕ Adding/updating plans:');
    
    for (const plan of allSixPlans) {
      if (existingPlanIds.includes(plan.plan_id)) {
        console.log(`🔄 Updating existing: ${plan.name}`);
        
        const { error: updateError } = await supabase
          .from('nutrition_plans')
          .update({
            name: plan.name,
            subtitle: plan.subtitle,
            description: plan.description,
            icon: plan.icon,
            color: plan.color,
            meals: plan.meals,
            is_active: plan.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('plan_id', plan.plan_id);

        if (updateError) {
          console.error(`❌ Error updating ${plan.name}:`, updateError);
        } else {
          console.log(`✅ Updated: ${plan.name}`);
        }
      } else {
        console.log(`➕ Adding new: ${plan.name}`);
        
        const { error: insertError } = await supabase
          .from('nutrition_plans')
          .insert([plan]);

        if (insertError) {
          console.error(`❌ Error adding ${plan.name}:`, insertError);
        } else {
          console.log(`✅ Added: ${plan.name}`);
        }
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

    // Show all plans grouped by goal
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
      console.log('   🔥 Droogtrainen: 2 plannen (Carnivoor + Op maat)');
      console.log('   ⚖️ Onderhoud: 2 plannen (Carnivoor + Gebalanceerd)');  
      console.log('   💪 Spiermassa: 2 plannen (Carnivoor + High Protein)');
    } else {
      console.log(`⚠️ Expected 6 plans, but got ${finalPlans?.length}`);
    }

    console.log('✅ Complete! Refresh the admin page to see all 6 plans.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

create6PlansFresh();
