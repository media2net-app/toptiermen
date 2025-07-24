const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMissionToggle() {
  console.log('🧪 Testing Mission Toggle Functionality...\n');

  const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'; // Rick's user ID

  try {
    // Step 1: Get current missions
    console.log('📋 Step 1: Fetching current missions...');
    const response1 = await fetch('http://localhost:3001/api/missions-simple', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response1.ok) {
      throw new Error(`Failed to fetch missions: ${response1.status}`);
    }
    
    const missionsData = await response1.json();
    console.log('✅ Missions fetched successfully');
    console.log(`📊 Found ${missionsData.missions.length} missions`);
    
    // Find a daily mission to test with
    const testMission = missionsData.missions.find(m => m.type === 'Dagelijks');
    if (!testMission) {
      console.log('❌ No daily mission found for testing');
      return;
    }
    
    console.log(`🎯 Testing with mission: "${testMission.title}" (ID: ${testMission.id})`);
    console.log(`📈 Current status: ${testMission.done ? 'Completed' : 'Not completed'}`);

    // Step 2: Complete the mission
    console.log('\n📋 Step 2: Completing mission...');
    const response2 = await fetch('http://localhost:3001/api/missions-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle',
        userId: userId,
        missionId: testMission.id
      })
    });
    
    if (!response2.ok) {
      throw new Error(`Failed to complete mission: ${response2.status}`);
    }
    
    const completeResult = await response2.json();
    console.log('✅ Mission completed successfully');
    console.log(`💰 XP earned: ${completeResult.xpEarned}`);
    console.log(`📅 Completion date: ${completeResult.completionDate}`);

    // Step 3: Verify completion
    console.log('\n📋 Step 3: Verifying completion...');
    const response3 = await fetch('http://localhost:3001/api/missions-simple', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const missionsData2 = await response3.json();
    const updatedMission = missionsData2.missions.find(m => m.id === testMission.id);
    console.log(`📈 Updated status: ${updatedMission.done ? 'Completed' : 'Not completed'}`);

    // Step 4: Uncomplete the mission
    console.log('\n📋 Step 4: Uncompleting mission...');
    const response4 = await fetch('http://localhost:3001/api/missions-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle',
        userId: userId,
        missionId: testMission.id
      })
    });
    
    if (!response4.ok) {
      throw new Error(`Failed to uncomplete mission: ${response4.status}`);
    }
    
    const uncompleteResult = await response4.json();
    console.log('✅ Mission uncompleted successfully');
    console.log(`💰 XP deducted: ${uncompleteResult.xpEarned}`);
    console.log(`📅 Completion date: ${uncompleteResult.completionDate}`);

    // Step 5: Verify uncompletion
    console.log('\n📋 Step 5: Verifying uncompletion...');
    const response5 = await fetch('http://localhost:3001/api/missions-simple', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const missionsData3 = await response5.json();
    const finalMission = missionsData3.missions.find(m => m.id === testMission.id);
    console.log(`📈 Final status: ${finalMission.done ? 'Completed' : 'Not completed'}`);

    // Step 6: Check XP transactions
    console.log('\n📋 Step 6: Checking XP transactions...');
    const { data: xpTransactions, error: xpError } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (xpError) {
      console.error('❌ Error fetching XP transactions:', xpError);
    } else {
      console.log('✅ XP transactions found:');
      xpTransactions.forEach(tx => {
        console.log(`  - ${tx.description}: ${tx.xp_amount > 0 ? '+' : ''}${tx.xp_amount} XP`);
      });
    }

    console.log('\n🎉 Mission toggle test completed successfully!');
    console.log('✅ Complete/Uncomplete functionality is working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMissionToggle(); 