require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabasePlans() {
  console.log('🔄 Fixing database to show 6 nutrition plans...');
  console.log('');

  try {
    // Step 1: Check current plans
    console.log('📊 Step 1: Checking current plans...');
    const { data: currentPlans, error: fetchError } = await supabase
      .from('nutrition_plans')
      .select('id, name, target_calories, goal')
      .order('name');

    if (fetchError) {
      console.error('❌ Error fetching current plans:', fetchError);
      return;
    }

    console.log(`📋 Found ${currentPlans?.length || 0} existing plans:`);
    currentPlans?.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name} (${plan.target_calories} kcal, ${plan.goal})`);
    });
    console.log('');

    // Step 2: Update "Balans" to "Onderhoud" if exists
    console.log('🔄 Step 2: Updating "Balans" to "Onderhoud"...');
    const balansPlans = currentPlans?.filter(p => 
      p.name.toLowerCase().includes('balans') || 
      p.name === 'Voedingsplan op Maat - Balans'
    );

    if (balansPlans && balansPlans.length > 0) {
      for (const plan of balansPlans) {
        const newName = plan.name.replace(/balans/gi, 'Onderhoud');
        const { error: updateError } = await supabase
          .from('nutrition_plans')
          .update({
            name: newName,
            goal: 'Onderhoud',
            updated_at: new Date().toISOString()
          })
          .eq('id', plan.id);

        if (updateError) {
          console.error(`❌ Error updating plan ${plan.name}:`, updateError);
        } else {
          console.log(`✅ Updated "${plan.name}" → "${newName}"`);
        }
      }
    } else {
      console.log('ℹ️ No "Balans" plans found to update');
    }
    console.log('');

    // Step 3: Add missing plans
    console.log('➕ Step 3: Adding missing plans...');
    
    const requiredPlans = [
      {
        name: 'Op maat - Droogtrainen',
        description: 'Volledig aangepast voedingsplan voor optimaal vetverlies. Persoonlijke macro-verdeling op basis van jouw specifieke doelen en voorkeuren.',
        target_calories: 1650,
        target_protein: 175,
        target_carbs: 120,
        target_fat: 55,
        duration_weeks: 16,
        difficulty: 'intermediate',
        goal: 'Droogtrainen',
        is_featured: true,
        is_public: true
      },
      {
        name: 'High Protein',
        description: 'Eiwitrijk voedingsplan geoptimaliseerd voor spiergroei en herstel. Perfect voor intensieve trainingsperiodes.',
        target_calories: 2350,
        target_protein: 200,
        target_carbs: 200,
        target_fat: 75,
        duration_weeks: 12,
        difficulty: 'intermediate',
        goal: 'Spiermassa',
        is_featured: true,
        is_public: true
      },
      {
        name: 'Onderhoud',
        description: 'Gebalanceerd voedingsplan voor behoud van huidige lichaamscompositie. Mix van alle macronutriënten voor duurzame energie.',
        target_calories: 2100,
        target_protein: 140,
        target_carbs: 245,
        target_fat: 70,
        duration_weeks: 12,
        difficulty: 'beginner',
        goal: 'Onderhoud',
        is_featured: true,
        is_public: true
      }
    ];

    // Get updated list of current plans
    const { data: updatedCurrentPlans } = await supabase
      .from('nutrition_plans')
      .select('name')
      .order('name');

    const existingNames = updatedCurrentPlans?.map(p => p.name) || [];

    for (const plan of requiredPlans) {
      if (!existingNames.includes(plan.name)) {
        console.log(`➕ Adding plan: ${plan.name}`);
        const { error: insertError } = await supabase
          .from('nutrition_plans')
          .insert([plan]);

        if (insertError) {
          console.error(`❌ Error adding plan ${plan.name}:`, insertError);
        } else {
          console.log(`✅ Added: ${plan.name} (${plan.target_calories} kcal)`);
        }
      } else {
        console.log(`ℹ️ Plan already exists: ${plan.name}`);
      }
    }
    console.log('');

    // Step 4: Verify final result
    console.log('✅ Step 4: Verifying final result...');
    const { data: finalPlans, error: finalError } = await supabase
      .from('nutrition_plans')
      .select('id, name, target_calories, goal')
      .order('goal, name');

    if (finalError) {
      console.error('❌ Error fetching final plans:', finalError);
      return;
    }

    console.log(`📊 Final result: ${finalPlans?.length || 0} plans total`);
    console.log('');

    // Group by goal
    const plansByGoal = {};
    finalPlans?.forEach(plan => {
      if (!plansByGoal[plan.goal]) plansByGoal[plan.goal] = [];
      plansByGoal[plan.goal].push(plan);
    });

    Object.keys(plansByGoal).forEach(goal => {
      console.log(`🎯 ${goal}: ${plansByGoal[goal].length} plannen`);
      plansByGoal[goal].forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.name} (${plan.target_calories} kcal)`);
      });
      console.log('');
    });

    console.log('🎉 Database update completed successfully!');
    console.log('   Refresh the admin page to see the changes.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixDatabasePlans();
