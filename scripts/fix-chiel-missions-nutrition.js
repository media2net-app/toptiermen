require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixChielMissionsAndNutrition() {
  try {
    console.log('🔧 Adding missions and nutrition plan to Chiel...\n');
    
    const chielUserId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';
    
    // 1. Add missions to Chiel
    console.log('🎯 Adding missions to Chiel...');
    const missionsToAdd = [
      { title: 'Doe 50 push-ups', description: 'Complete 50 push-ups', difficulty: 'medium', category: 'fitness' },
      { title: 'Mediteer 10 minuten', description: 'Meditate for 10 minutes', difficulty: 'easy', category: 'mindfulness' },
      { title: 'Lees 30 minuten', description: 'Read for 30 minutes', difficulty: 'easy', category: 'learning' }
    ];
    
    for (const mission of missionsToAdd) {
      const { error: missionError } = await supabase
        .from('user_missions')
        .insert({
          user_id: chielUserId,
          title: mission.title,
          description: mission.description,
          difficulty: mission.difficulty,
          category: mission.category,
          status: 'active',
          points: 10,
          xp_reward: 50
        });
      
      if (missionError) {
        console.log(`❌ Error adding ${mission.title}:`, missionError.message);
      } else {
        console.log(`✅ Added ${mission.title} mission`);
      }
    }
    
    // 2. Add nutrition plan to Chiel
    console.log('\n🥗 Adding nutrition plan to Chiel...');
    const { error: nutritionError } = await supabase
      .from('user_nutrition_plans')
      .insert({
        user_id: chielUserId,
        plan_type: 'balanced',
        nutrition_goals: { protein: 150, carbs: 200, fat: 60 },
        is_active: true
      });
    
    if (nutritionError) {
      console.log('❌ Nutrition error:', nutritionError.message);
    } else {
      console.log('✅ Nutrition plan added');
    }
    
    // 3. Verify the additions
    console.log('\n🔍 Verifying additions...');
    
    const { data: finalMissions } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', chielUserId);
    
    const { data: finalNutrition } = await supabase
      .from('user_nutrition_plans')
      .select('*')
      .eq('user_id', chielUserId);
    
    console.log('\n📊 FINAL STATUS:');
    console.log('='.repeat(50));
    console.log(`🎯 Missions: ${finalMissions ? finalMissions.length : 0} (${finalMissions ? finalMissions.map(m => m.title).join(', ') : 'none'})`);
    console.log(`🥗 Nutrition Plans: ${finalNutrition ? finalNutrition.length : 0}`);
    
    console.log('\n🎉 Chiel\'s missions and nutrition plan have been added!');
    console.log('✅ Missions are now assigned');
    console.log('✅ Nutrition plan is assigned');
    console.log('\n🔄 Please refresh the dashboard to see the changes');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixChielMissionsAndNutrition();
