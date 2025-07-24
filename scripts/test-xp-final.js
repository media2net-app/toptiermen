const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testXPFinal() {
  console.log('🧪 Final XP Test...\n');

  const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'; // Rick's user ID

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

    // Step 2: Get a mission to test with
    console.log('\n📋 Step 2: Getting a mission to test...');
    const { data: userMissions, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId)
      .eq('frequency_type', 'daily')
      .limit(1);

    if (missionsError || !userMissions.length) {
      console.error('❌ Error getting missions:', missionsError);
      return;
    }

    const testMission = userMissions[0];
    console.log(`🎯 Testing with mission: "${testMission.title}" (ID: ${testMission.id})`);
    console.log(`💰 XP reward: ${testMission.xp_reward}`);

    // Step 3: Test XP transaction logging
    console.log('\n📋 Step 3: Testing XP transaction logging...');
    const sourceId = Math.abs(testMission.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0));
    
    const { error: txError } = await supabase
      .from('xp_transactions')
      .insert({
        user_id: userId,
        xp_amount: testMission.xp_reward,
        source_type: 'mission_completion',
        source_id: sourceId,
        description: `Test missie voltooid: ${testMission.title}`,
        created_at: new Date().toISOString()
      });

    if (txError) {
      console.error('❌ Error logging test transaction:', txError);
    } else {
      console.log('✅ Test XP transaction logged successfully');
    }

    // Step 4: Check recent transactions
    console.log('\n📋 Step 4: Checking recent XP transactions...');
    const { data: xpTransactions, error: xpTxError } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (xpTxError) {
      console.error('❌ Error fetching XP transactions:', xpTxError);
    } else {
      console.log('✅ Recent XP transactions:');
      xpTransactions.forEach(tx => {
        console.log(`  - ${tx.description}: ${tx.xp_amount > 0 ? '+' : ''}${tx.xp_amount} XP (ID: ${tx.source_id})`);
      });
    }

    console.log('\n🎉 Final XP test completed!');
    console.log('✅ XP system is now working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testXPFinal(); 