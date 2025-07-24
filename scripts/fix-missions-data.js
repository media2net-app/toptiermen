const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMissionsData() {
  console.log('🔧 Fixing Missions Data...\n');

  const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'; // Rick's user ID

  try {
    // Define mission updates
    const missionUpdates = [
      {
        id: '378bdd1e-4ac3-4998-a229-5bda5877ec24',
        title: 'Test',
        frequency_type: 'daily',
        xp_reward: 15
      },
      {
        id: '65a014cf-834d-430f-82ec-fb9f43d55430',
        title: 'Doe 30 push-ups',
        frequency_type: 'daily',
        xp_reward: 20
      },
      {
        id: 'b4d93082-38e5-4ea7-afec-72f077bb6fc5',
        title: 'Maak je bed op',
        frequency_type: 'daily',
        xp_reward: 15
      },
      {
        id: '3548e2d5-6927-4450-8202-479b5c362821',
        title: 'Mediteer 5 minuten',
        frequency_type: 'daily',
        xp_reward: 25
      },
      {
        id: '650edc52-54ae-4fe3-ad35-1dd58504d50d',
        title: 'Lees 20 minuten',
        frequency_type: 'daily',
        xp_reward: 20
      },
      {
        id: '5337947b-3b4b-442b-ab7e-deebfb931ae5',
        title: '10.000 stappen',
        frequency_type: 'daily',
        xp_reward: 30
      },
      {
        id: '9406c0eb-9f19-4db6-8d97-168c92f50f00',
        title: 'Drink 1.5L water',
        frequency_type: 'daily',
        xp_reward: 15
      }
    ];

    console.log('📝 Updating missions...');
    
    for (const update of missionUpdates) {
      const { error } = await supabase
        .from('user_missions')
        .update({
          frequency_type: update.frequency_type,
          xp_reward: update.xp_reward,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.id)
        .eq('user_id', userId);

      if (error) {
        console.error(`❌ Error updating ${update.title}:`, error);
      } else {
        console.log(`✅ Updated ${update.title}: ${update.frequency_type}, ${update.xp_reward} XP`);
      }
    }

    console.log('\n🎉 Missions data fixed!');

    // Verify the updates
    console.log('\n📋 Verifying updates...');
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
      console.log(`   Type: ${mission.frequency_type}`);
      console.log(`   XP Reward: ${mission.xp_reward}`);
      console.log(`   Status: ${mission.status}`);
      console.log(`   Last Completion: ${mission.last_completion_date}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixMissionsData(); 