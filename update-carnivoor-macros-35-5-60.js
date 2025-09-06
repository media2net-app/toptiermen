const { createClient } = require('@supabase/supabase-js');

// Supabase configuratie - hardcoded for this update
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM0NzQ4MDAwLCJleHAiOjIwNTAzMjQwMDB9.example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCarnivoorMacros() {
  console.log('🔄 Updating Carnivoor macro percentages to 35% protein, 5% carbs, 60% fat...');
  
  try {
    // Update Carnivoor - Onderhoud (2860 kcal)
    const onderhoudUpdate = {
      target_protein: 250, // 35% van 2860 kcal (2860 * 0.35 / 4)
      target_carbs: 36,    // 5% van 2860 kcal (2860 * 0.05 / 4)
      target_fat: 191      // 60% van 2860 kcal (2860 * 0.60 / 9)
    };
    
    const { data: onderhoudData, error: onderhoudError } = await supabase
      .from('nutrition_plans')
      .update(onderhoudUpdate)
      .eq('name', 'Carnivoor - Onderhoud')
      .select();
    
    if (onderhoudError) {
      console.error('❌ Error updating Carnivoor - Onderhoud:', onderhoudError);
    } else {
      console.log('✅ Updated Carnivoor - Onderhoud:', onderhoudData?.[0]?.name);
      console.log(`   Protein: ${onderhoudUpdate.target_protein}g (35%)`);
      console.log(`   Carbs: ${onderhoudUpdate.target_carbs}g (5%)`);
      console.log(`   Fat: ${onderhoudUpdate.target_fat}g (60%)`);
    }
    
    // Update Carnivoor - Droogtrainen (2360 kcal)
    const droogtrainenUpdate = {
      target_protein: 207, // 35% van 2360 kcal (2360 * 0.35 / 4)
      target_carbs: 30,    // 5% van 2360 kcal (2360 * 0.05 / 4)
      target_fat: 157      // 60% van 2360 kcal (2360 * 0.60 / 9)
    };
    
    const { data: droogtrainenData, error: droogtrainenError } = await supabase
      .from('nutrition_plans')
      .update(droogtrainenUpdate)
      .eq('name', 'Carnivoor - Droogtrainen')
      .select();
    
    if (droogtrainenError) {
      console.error('❌ Error updating Carnivoor - Droogtrainen:', droogtrainenError);
    } else {
      console.log('✅ Updated Carnivoor - Droogtrainen:', droogtrainenData?.[0]?.name);
      console.log(`   Protein: ${droogtrainenUpdate.target_protein}g (35%)`);
      console.log(`   Carbs: ${droogtrainenUpdate.target_carbs}g (5%)`);
      console.log(`   Fat: ${droogtrainenUpdate.target_fat}g (60%)`);
    }
    
    console.log('\n🎯 Carnivoor macro update completed!');
    console.log('📊 New percentages: 35% protein, 5% carbs, 60% fat');
    
  } catch (error) {
    console.error('❌ Error updating carnivoor macros:', error);
  }
}

updateCarnivoorMacros();
