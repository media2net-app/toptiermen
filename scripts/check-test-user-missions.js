const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTestUserMissions() {
  console.log('🔍 Checking test user missions...\n');

  try {
    const userId = 'd2fae82e-bef3-4658-b770-b235b364532b';

    // Check missions table
    console.log('1️⃣ Checking missions table...');
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', userId);

    if (missionsError) {
      console.error('❌ Missions table error:', missionsError);
    } else {
      console.log(`✅ Found ${missions.length} missions for test user:`);
      missions.forEach((mission, index) => {
        console.log(`   ${index + 1}. ${mission.title} (${mission.category}) - ${mission.done ? '✅ Done' : '⏳ Pending'}`);
      });
    }

    // Check user_missions table (if it exists)
    console.log('\n2️⃣ Checking user_missions table...');
    const { data: userMissions, error: userMissionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId);

    if (userMissionsError) {
      if (userMissionsError.code === '42P01') {
        console.log('ℹ️ user_missions table does not exist');
      } else {
        console.error('❌ User missions table error:', userMissionsError);
      }
    } else {
      console.log(`✅ Found ${userMissions.length} user missions:`);
      userMissions.forEach((userMission, index) => {
        console.log(`   ${index + 1}. ${userMission.title} (${userMission.category}) - ${userMission.status}`);
      });
    }

    // Check if missions are being saved correctly
    console.log('\n3️⃣ Testing mission creation...');
    const testMission = {
      user_id: userId,
      title: 'Test Mission - Auto Created',
      description: 'This is a test mission to verify the system works',
      category: 'Algemeen',
      type: 'daily',
      done: false,
      xp_reward: 15,
      created_at: new Date().toISOString()
    };

    const { data: newMission, error: createError } = await supabase
      .from('missions')
      .insert(testMission)
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating test mission:', createError);
    } else {
      console.log('✅ Test mission created successfully:');
      console.log(`   ID: ${newMission.id}`);
      console.log(`   Title: ${newMission.title}`);
      console.log(`   Category: ${newMission.category}`);
      
      // Clean up - delete the test mission
      await supabase
        .from('missions')
        .delete()
        .eq('id', newMission.id);
      
      console.log('🗑️ Test mission cleaned up');
    }

  } catch (error) {
    console.error('❌ Error checking test user missions:', error);
  }
}

checkTestUserMissions();
