require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateToExact6Plans() {
  console.log('🎯 Updating to exact 6 plans as specified...');
  console.log('');

  try {
    // First, clear all existing plans
    console.log('🗑️ Clearing existing plans...');
    const { error: deleteError } = await supabase
      .from('nutrition_plans')
      .delete()
      .neq('id', 0); // Delete all

    if (deleteError) {
      console.error('❌ Error clearing plans:', deleteError);
      return;
    }
    console.log('✅ Existing plans cleared');
    console.log('');

    // Helper function to calculate macros based on calories
    const calculateMacros = (calories, goal) => {
      let proteinPercent, carbsPercent, fatPercent;
      
      switch (goal) {
        case 'Droogtrainen':
          proteinPercent = 0.35; // 35% protein
          carbsPercent = 0.25;   // 25% carbs  
          fatPercent = 0.40;     // 40% fat
          break;
        case 'Onderhoud':
          proteinPercent = 0.25; // 25% protein
          carbsPercent = 0.45;   // 45% carbs
          fatPercent = 0.30;     // 30% fat
          break;
        case 'Spiermassa':
          proteinPercent = 0.30; // 30% protein
          carbsPercent = 0.40;   // 40% carbs
          fatPercent = 0.30;     // 30% fat
          break;
        default:
          proteinPercent = 0.25;
          carbsPercent = 0.45;
          fatPercent = 0.30;
      }

      const protein = Math.round((calories * proteinPercent) / 4); // 4 kcal per gram protein
      const carbs = Math.round((calories * carbsPercent) / 4);     // 4 kcal per gram carbs
      const fat = Math.round((calories * fatPercent) / 9);         // 9 kcal per gram fat

      return { protein, carbs, fat };
    };

    // Define the exact 6 plans
    const exactPlans = [
      {
        plan_id: 'carnivoor-onderhoud',
        name: 'Carnivoor - Onderhoud',
        subtitle: 'Carnivoor voor lichaamscompositie behoud',
        description: 'Carnivoor dieet voor behoud van huidige lichaamscompositie. Gebalanceerde macro-verdeling binnen carnivoor kader.',
        icon: '⚖️',
        color: '#059669',
        calories: 2860,
        goal: 'Onderhoud'
      },
      {
        plan_id: 'carnivoor-droogtrainen',
        name: 'Carnivoor - Droogtrainen',
        subtitle: 'Carnivoor voor vetverlies',
        description: 'Carnivoor dieet geoptimaliseerd voor vetverlies met behoud van spiermassa. Focus op hoge eiwitinname en lage koolhydraten.',
        icon: '🔥',
        color: '#ef4444',
        calories: 2360,
        goal: 'Droogtrainen'
      },
      {
        plan_id: 'carnivoor-spiermassa',
        name: 'Carnivoor - Spiermassa',
        subtitle: 'Carnivoor voor spiergroei',
        description: 'Carnivoor dieet geoptimaliseerd voor spiergroei en krachttoename. Verhoogde calorie- en eiwitinname.',
        icon: '💪',
        color: '#f59e0b',
        calories: 3260,
        goal: 'Spiermassa'
      },
      {
        plan_id: 'maaltijdplan-onderhoud',
        name: 'Maaltijdplan normaal - Onderhoud',
        subtitle: 'Gebalanceerd voor duurzame energie',
        description: 'Gebalanceerd voedingsplan voor behoud van huidige lichaamscompositie. Mix van alle macronutriënten voor optimale gezondheid.',
        icon: '⚖️',
        color: '#3b82f6',
        calories: 2860,
        goal: 'Onderhoud'
      },
      {
        plan_id: 'maaltijdplan-droogtrainen',
        name: 'Maaltijdplan normaal - Droogtrainen',
        subtitle: 'Normaal dieet voor vetverlies',
        description: 'Gebalanceerd voedingsplan geoptimaliseerd voor vetverlies. Gezonde mix van alle voedingsgroepen voor duurzaam gewichtsverlies.',
        icon: '🔥',
        color: '#dc2626',
        calories: 2360,
        goal: 'Droogtrainen'
      },
      {
        plan_id: 'maaltijdplan-spiermassa',
        name: 'Maaltijdplan normaal - Spiermassa',
        subtitle: 'Normaal dieet voor spiergroei',
        description: 'Gebalanceerd voedingsplan geoptimaliseerd voor spiergroei. Verhoogde calorie-inname met focus op kwaliteitsvoeding.',
        icon: '💪',
        color: '#7c3aed',
        calories: 3260,
        goal: 'Spiermassa'
      }
    ];

    console.log('➕ Adding the 6 exact plans:');
    
    for (const planData of exactPlans) {
      const macros = calculateMacros(planData.calories, planData.goal);
      
      const plan = {
        plan_id: planData.plan_id,
        name: planData.name,
        subtitle: planData.subtitle,
        description: planData.description,
        icon: planData.icon,
        color: planData.color,
        meals: {
          target_calories: planData.calories,
          target_protein: macros.protein,
          target_carbs: macros.carbs,
          target_fat: macros.fat,
          goal: planData.goal,
          difficulty: 'intermediate',
          duration_weeks: 12
        },
        is_active: true
      };

      console.log(`   ➕ Adding: ${plan.name} (${planData.calories} kcal)`);
      console.log(`      Macros: ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fat}g fat`);
      
      const { error: insertError } = await supabase
        .from('nutrition_plans')
        .insert([plan]);

      if (insertError) {
        console.error(`❌ Error adding ${plan.name}:`, insertError);
      } else {
        console.log(`✅ Added: ${plan.name}`);
      }
      console.log('');
    }

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

    // Show all plans grouped by type
    const carnivoorPlans = finalPlans?.filter(p => p.name.includes('Carnivoor')) || [];
    const maaltijdPlans = finalPlans?.filter(p => p.name.includes('Maaltijdplan')) || [];

    console.log('🥩 CARNIVOOR PLANNEN:');
    carnivoorPlans.forEach((plan, index) => {
      const calories = plan.meals?.target_calories || 'N/A';
      const goal = plan.meals?.goal || 'Unknown';
      console.log(`   ${index + 1}. ${plan.name} - ${goal} - ${calories} kcal`);
    });
    console.log('');

    console.log('🍽️ MAALTIJDPLAN NORMAAL:');
    maaltijdPlans.forEach((plan, index) => {
      const calories = plan.meals?.target_calories || 'N/A';
      const goal = plan.meals?.goal || 'Unknown';
      console.log(`   ${index + 1}. ${plan.name} - ${goal} - ${calories} kcal`);
    });
    console.log('');

    if (finalPlans?.length === 6) {
      console.log('🎉 SUCCESS: Exactly 6 plans with correct calories!');
      console.log('   🥩 Carnivoor: 3 plannen (2860, 2360, 3260 kcal)');
      console.log('   🍽️ Maaltijdplan: 3 plannen (2860, 2360, 3260 kcal)');
    } else {
      console.log(`⚠️ Expected 6 plans, but got ${finalPlans?.length}`);
    }

    console.log('✅ Update completed! Refresh admin page to see changes.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateToExact6Plans();
