const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMissionLibrary() {
  console.log('🧪 Testing mission library functionality...\n');

  try {
    // Find a test user
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.log('❌ No users found to test with');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Using test user: ${testUser.email}`);

    // Test 1: Check if user_missions table exists
    console.log('\n📋 STEP 1: Checking user_missions table');
    console.log('----------------------------------------');
    
    try {
      const { data: missions, error: missionsError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', testUser.id)
        .limit(1);

      if (missionsError) {
        console.log('❌ user_missions table error:', missionsError.message);
      } else {
        console.log(`✅ user_missions table exists, found ${missions?.length || 0} missions for user`);
      }
    } catch (error) {
      console.log('❌ user_missions table does not exist or error:', error.message);
    }

    // Test 2: Try to create a mission via API
    console.log('\n📋 STEP 2: Testing mission creation via API');
    console.log('----------------------------------------');
    
    const testMission = {
      userId: testUser.id,
      action: 'create',
      mission: {
        title: 'Test Mission from Library',
        type: 'Dagelijks',
        category: 'Fitness & Gezondheid',
        icon: '💪',
        xp_reward: 50
      }
    };

    console.log('📝 Attempting to create mission:', testMission.mission.title);
    
    const response = await fetch('http://localhost:3000/api/missions-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMission),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Mission creation successful!');
      console.log('📊 Response:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Mission creation failed');
      console.log('📊 Error response:', errorText);
    }

    // Test 3: Check current missions
    console.log('\n📋 STEP 3: Checking current missions');
    console.log('----------------------------------------');
    
    const missionsResponse = await fetch(`http://localhost:3000/api/missions-simple?userId=${testUser.id}`);
    
    if (missionsResponse.ok) {
      const missionsData = await missionsResponse.json();
      console.log(`✅ Found ${missionsData.missions?.length || 0} missions for user`);
      
      if (missionsData.missions && missionsData.missions.length > 0) {
        console.log('📋 Current missions:');
        missionsData.missions.forEach((mission, index) => {
          console.log(`   ${index + 1}. ${mission.title} (${mission.type}) - XP: ${mission.xp_reward}`);
        });
      }
    } else {
      const errorText = await missionsResponse.text();
      console.log('❌ Failed to fetch missions:', errorText);
    }

    // Test 4: Check database directly
    console.log('\n📋 STEP 4: Checking database directly');
    console.log('----------------------------------------');
    
    try {
      const { data: dbMissions, error: dbError } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', testUser.id);

      if (dbError) {
        console.log('❌ Database error:', dbError.message);
      } else {
        console.log(`✅ Database has ${dbMissions?.length || 0} missions for user`);
        
        if (dbMissions && dbMissions.length > 0) {
          console.log('📋 Database missions:');
          dbMissions.forEach((mission, index) => {
            console.log(`   ${index + 1}. ${mission.title} (${mission.frequency_type}) - XP: ${mission.xp_reward}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Database check failed:', error.message);
    }

    console.log('\n🎯 Test completed!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

testMissionLibrary();
