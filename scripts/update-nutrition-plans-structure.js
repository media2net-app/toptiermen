require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const newPlans = [
  {
    name: "Carnivoor / Animal Based",
    description: "Een voedingsplan gebaseerd op dierlijke producten zoals vlees, vis, eieren en zuivel. Perfect voor mensen die een carnivoor of animal-based dieet willen volgen.",
    category: "carnivoor",
    target_calories: 2000,
    target_protein: 150,
    target_carbs: 50,
    target_fat: 120,
    duration_weeks: 12,
    difficulty: "Makkelijk",
    goal: "carnivoor",
    is_featured: true,
    is_public: true,
    sub_goals: ["droogtrainen", "onderhoud", "spiermassa"]
  },
  {
    name: "Voedingsplan op Maat",
    description: "Een flexibel voedingsplan dat aangepast kan worden aan verschillende doelen en voorkeuren. Geschikt voor alle voedingsstijlen en doelen.",
    category: "flexibel",
    target_calories: 2200,
    target_protein: 140,
    target_carbs: 200,
    target_fat: 80,
    duration_weeks: 12,
    difficulty: "Makkelijk",
    goal: "flexibel",
    is_featured: true,
    is_public: true,
    sub_goals: ["droogtrainen", "onderhoud", "spiermassa"]
  }
];

const subGoalConfigs = {
  droogtrainen: {
    calories_multiplier: 0.85,
    protein_multiplier: 1.2,
    carbs_multiplier: 0.7,
    fat_multiplier: 0.9,
    description: "Focus op vetverlies met behoud van spiermassa"
  },
  onderhoud: {
    calories_multiplier: 1.0,
    protein_multiplier: 1.0,
    carbs_multiplier: 1.0,
    fat_multiplier: 1.0,
    description: "Behoud van huidige lichaamscompositie"
  },
  spiermassa: {
    calories_multiplier: 1.15,
    protein_multiplier: 1.3,
    carbs_multiplier: 1.2,
    fat_multiplier: 1.1,
    description: "Focus op spiergroei en krachttoename"
  }
};

async function updateNutritionPlansStructure() {
  try {
    console.log('🥗 Updating nutrition plans structure...\n');

    // First, delete all existing plans
    console.log('🗑️ Deleting existing plans...');
    const { error: deleteError } = await supabase
      .from('nutrition_plans')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('❌ Error deleting existing plans:', deleteError);
      return;
    }

    console.log('✅ Existing plans deleted');

    // Create new plans with sub-goals
    console.log('\n📝 Creating new nutrition plans...');
    
    for (const plan of newPlans) {
      console.log(`\n📋 Creating plan: ${plan.name}`);
      
      // Create main plan
      const { data: mainPlan, error: mainError } = await supabase
        .from('nutrition_plans')
        .insert({
          name: plan.name,
          description: plan.description,
          target_calories: plan.target_calories,
          target_protein: plan.target_protein,
          target_carbs: plan.target_carbs,
          target_fat: plan.target_fat,
          duration_weeks: plan.duration_weeks,
          difficulty: plan.difficulty,
          goal: plan.goal
        })
        .select()
        .single();

      if (mainError) {
        console.error(`❌ Error creating main plan ${plan.name}:`, mainError);
        continue;
      }

      console.log(`✅ Main plan created: ${mainPlan.name}`);

      // Create sub-goal variations
      for (const subGoal of plan.sub_goals) {
        const config = subGoalConfigs[subGoal];
        const subPlanName = `${plan.name} - ${subGoal.charAt(0).toUpperCase() + subGoal.slice(1)}`;
        
        const { data: subPlan, error: subError } = await supabase
          .from('nutrition_plans')
          .insert({
            name: subPlanName,
            description: `${plan.description} ${config.description}.`,
            target_calories: Math.round(plan.target_calories * config.calories_multiplier),
            target_protein: Math.round(plan.target_protein * config.protein_multiplier),
            target_carbs: Math.round(plan.target_carbs * config.carbs_multiplier),
            target_fat: Math.round(plan.target_fat * config.fat_multiplier),
            duration_weeks: plan.duration_weeks,
            difficulty: plan.difficulty,
            goal: subGoal
          })
          .select()
          .single();

        if (subError) {
          console.error(`❌ Error creating sub-plan ${subPlanName}:`, subError);
          continue;
        }

        console.log(`  ✅ Sub-plan created: ${subPlan.name}`);
      }
    }

    // Verify all plans were created
    console.log('\n🔍 Verifying all plans...');
    const { data: allPlans, error: verifyError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying plans:', verifyError);
      return;
    }

    console.log('\n✅ Successfully updated nutrition plans structure:');
    console.log('================================================');
    
    // Group plans by goal
    const plansByGoal = {};
    allPlans.forEach(plan => {
      if (!plansByGoal[plan.goal]) {
        plansByGoal[plan.goal] = [];
      }
      plansByGoal[plan.goal].push(plan);
    });

    Object.entries(plansByGoal).forEach(([goal, plans]) => {
      console.log(`\n📂 ${goal.toUpperCase()}:`);
      plans.forEach(plan => {
        const isMain = plan.goal === 'carnivoor' || plan.goal === 'flexibel';
        const prefix = isMain ? '📋' : '  📄';
        console.log(`${prefix} ${plan.name}`);
        console.log(`     Calorieën: ${plan.target_calories}, Eiwit: ${plan.target_protein}g, Koolhydraten: ${plan.target_carbs}g, Vet: ${plan.target_fat}g`);
        console.log(`     Doel: ${plan.goal}`);
      });
    });

    console.log(`\n🎯 Summary:`);
    console.log(`- Total plans: ${allPlans.length}`);
    console.log(`- Main plans: ${allPlans.filter(p => p.goal === 'carnivoor' || p.goal === 'flexibel').length}`);
    console.log(`- Sub-plans: ${allPlans.filter(p => p.goal !== 'carnivoor' && p.goal !== 'flexibel').length}`);
    console.log(`- Goals: ${[...new Set(allPlans.map(p => p.goal))].join(', ')}`);

    console.log('\n💡 The nutrition plans structure has been updated successfully!');
    console.log('   Users can now choose between Carnivoor and Flexibel plans with specific goals.');

  } catch (error) {
    console.error('❌ Error updating nutrition plans structure:', error);
  }
}

updateNutritionPlansStructure();
