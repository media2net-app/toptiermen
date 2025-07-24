const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMissions() {
  console.log('🔍 Checking Missions in Database...\n');

  const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'; // Rick's user ID

  try {
    const { data: userMissions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId);

    if (missionsError) {
      console.error('❌ Error getting missions:', missionsError);
      return;
    }

    console.log(`📊 Found ${userMissions.length} missions:\n`);
    
    userMissions.forEach((mission, index) => {
      console.log(`${index + 1}. "${mission.title}"`);
      console.log(`   ID: ${mission.id}`);
      console.log(`   Type: ${mission.frequency_type}`);
      console.log(`   XP Reward: ${mission.xp_reward}`);
      console.log(`   Status: ${mission.status}`);
      console.log(`   Last Completion: ${mission.last_completion_date}`);
      console.log('');
    });

    // Group by frequency type
    const byType = userMissions.reduce((acc, mission) => {
      acc[mission.frequency_type] = acc[mission.frequency_type] || [];
      acc[mission.frequency_type].push(mission);
      return acc;
    }, {});

    console.log('📈 Summary by type:');
    Object.entries(byType).forEach(([type, missions]) => {
      console.log(`  ${type}: ${missions.length} missions`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMissions(); 