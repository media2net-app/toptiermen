const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testXPFix() {
  console.log('🧪 Testing XP Fix for Mission Toggle...\n');

  const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'; // Rick's user ID

  // Try different ports to find the running server
  const ports = [3000, 3001, 3002, 3003, 3004, 3005];
  let baseUrl = null;

  for (const port of ports) {
    try {
      console.log(`🔍 Trying port ${port}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`http://localhost:${port}/api/missions-simple`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        baseUrl = `http://localhost:${port}`;
        console.log(`✅ Found server on port ${port}`);
        break;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`⏰ Port ${port} timed out`);
      } else {
        console.log(`❌ Port ${port} not available`);
      }
    }
  }

  if (!baseUrl) {
    console.error('❌ No running server found on any port');
    return;
  }

  try {
    // Step 1: Get current XP
    console.log('📋 Step 1: Getting current XP...');
    const { data: currentXP, error: xpError } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    if (xpError) {
      console.error('❌ Error getting current XP:', xpError);
      return;
    }

    const initialXP = currentXP?.total_xp || 0;
    console.log(`💰 Current XP: ${initialXP}`);

    // Step 2: Get missions
    console.log('\n📋 Step 2: Getting missions...');
    const response = await fetch(`${baseUrl}/api/missions-simple`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch missions: ${response.status}`);
    }
    
    const missionsData = await response.json();
    console.log(`📊 Found ${missionsData.missions.length} missions`);
    
    // Find a daily mission to test with
    const testMission = missionsData.missions.find(m => m.type === 'Dagelijks');
    if (!testMission) {
      console.log('❌ No daily mission found for testing');
      return;
    }
    
    console.log(`🎯 Testing with mission: "${testMission.title}" (ID: ${testMission.id})`);
    console.log(`📈 Current status: ${testMission.done ? 'Completed' : 'Not completed'}`);

    // Step 3: Complete the mission
    console.log('\n📋 Step 3: Completing mission...');
    const response2 = await fetch(`${baseUrl}/api/missions-simple`, {
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

    // Step 4: Check XP after completion
    console.log('\n📋 Step 4: Checking XP after completion...');
    const { data: xpAfterComplete, error: xpError2 } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    if (xpError2) {
      console.error('❌ Error getting XP after completion:', xpError2);
    } else {
      const xpAfter = xpAfterComplete?.total_xp || 0;
      console.log(`💰 XP after completion: ${xpAfter}`);
      console.log(`📊 XP difference: ${xpAfter - initialXP}`);
    }

    // Step 5: Uncomplete the mission
    console.log('\n📋 Step 5: Uncompleting mission...');
    const response3 = await fetch(`${baseUrl}/api/missions-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle',
        userId: userId,
        missionId: testMission.id
      })
    });
    
    if (!response3.ok) {
      throw new Error(`Failed to uncomplete mission: ${response3.status}`);
    }
    
    const uncompleteResult = await response3.json();
    console.log('✅ Mission uncompleted successfully');
    console.log(`💰 XP deducted: ${uncompleteResult.xpEarned}`);

    // Step 6: Check XP after uncompletion
    console.log('\n📋 Step 6: Checking XP after uncompletion...');
    const { data: xpAfterUncomplete, error: xpError3 } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    if (xpError3) {
      console.error('❌ Error getting XP after uncompletion:', xpError3);
    } else {
      const finalXP = xpAfterUncomplete?.total_xp || 0;
      console.log(`💰 Final XP: ${finalXP}`);
      console.log(`📊 Total XP difference: ${finalXP - initialXP}`);
      
      if (finalXP === initialXP) {
        console.log('✅ XP correctly restored to original value!');
      } else {
        console.log('❌ XP not correctly restored!');
      }
    }

    // Step 7: Check XP transactions
    console.log('\n📋 Step 7: Checking XP transactions...');
    const { data: xpTransactions, error: xpTxError } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (xpTxError) {
      console.error('❌ Error fetching XP transactions:', xpTxError);
    } else {
      console.log('✅ Recent XP transactions:');
      xpTransactions.forEach(tx => {
        console.log(`  - ${tx.description}: ${tx.xp_amount > 0 ? '+' : ''}${tx.xp_amount} XP`);
      });
    }

    console.log('\n🎉 XP fix test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testXPFix(); 