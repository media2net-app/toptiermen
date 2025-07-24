const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testChallengeUndo() {
  console.log('🧪 Testing Challenge Undo Functionality...\n');

  const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';
  const baseUrl = 'http://localhost:3000';

  try {
    // Step 1: Check current XP
    console.log('📋 Step 1: Checking current XP...');
    const { data: currentXp, error: xpError } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    if (xpError) {
      console.error('❌ Error fetching current XP:', xpError);
      return;
    }

    console.log(`💰 Current XP: ${currentXp.total_xp}`);

    // Step 2: Get available challenges
    console.log('\n📋 Step 2: Fetching available challenges...');
    const response1 = await fetch(`${baseUrl}/api/challenges?userId=${userId}`);
    const data1 = await response1.json();
    
    const challengeToTest = data1.challenges.find((c) => c.title === "30 Dagen Dankbaarheid");
    if (!challengeToTest) {
      console.error('❌ Challenge "30 Dagen Dankbaarheid" not found.');
      return;
    }
    console.log(`🎯 Testing with challenge: "${challengeToTest.title}" (ID: ${challengeToTest.id})`);

    // Step 3: Join the challenge if not already active
    if (challengeToTest.status === 'available') {
      console.log('\n📋 Step 3: Joining challenge...');
      const response2 = await fetch(`${baseUrl}/api/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', userId: userId, challengeId: challengeToTest.id })
      });
      const data2 = await response2.json();
      console.log('✅ Join response:', data2);
    } else {
      console.log('\n📋 Step 3: Challenge already active, skipping join');
    }

    // Step 4: Complete a day
    console.log('\n📋 Step 4: Completing a day...');
    const response3 = await fetch(`${baseUrl}/api/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete-day', userId: userId, challengeId: challengeToTest.id })
    });
    const data3 = await response3.json();
    console.log('✅ Complete day response:', data3);

    // Step 5: Check XP after completion
    console.log('\n📋 Step 5: Checking XP after completion...');
    const { data: xpAfterComplete, error: xpAfterError } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    if (xpAfterError) {
      console.error('❌ Error fetching XP after completion:', xpAfterError);
    } else {
      console.log(`💰 XP after completion: ${xpAfterComplete.total_xp}`);
      console.log(`📈 XP gained: ${xpAfterComplete.total_xp - currentXp.total_xp}`);
    }

    // Step 6: Check challenge progress after completion
    console.log('\n📋 Step 6: Checking challenge progress after completion...');
    const response4 = await fetch(`${baseUrl}/api/challenges?userId=${userId}`);
    const data4 = await response4.json();
    const updatedChallenge1 = data4.challenges.find((c) => c.id === challengeToTest.id);
    if (updatedChallenge1) {
      console.log(`✅ Challenge progress: ${updatedChallenge1.progress}%`);
      console.log(`✅ Current streak: ${updatedChallenge1.currentStreak} days`);
    }

    // Step 7: Undo the day
    console.log('\n📋 Step 7: Undoing the day...');
    const response5 = await fetch(`${baseUrl}/api/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'undo-day', userId: userId, challengeId: challengeToTest.id })
    });
    const data5 = await response5.json();
    console.log('✅ Undo day response:', data5);

    // Step 8: Check XP after undo
    console.log('\n📋 Step 8: Checking XP after undo...');
    const { data: xpAfterUndo, error: xpAfterUndoError } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    if (xpAfterUndoError) {
      console.error('❌ Error fetching XP after undo:', xpAfterUndoError);
    } else {
      console.log(`💰 XP after undo: ${xpAfterUndo.total_xp}`);
      console.log(`📉 XP removed: ${xpAfterComplete.total_xp - xpAfterUndo.total_xp}`);
      console.log(`🔄 Net XP change: ${xpAfterUndo.total_xp - currentXp.total_xp}`);
    }

    // Step 9: Check challenge progress after undo
    console.log('\n📋 Step 9: Checking challenge progress after undo...');
    const response6 = await fetch(`${baseUrl}/api/challenges?userId=${userId}`);
    const data6 = await response6.json();
    const updatedChallenge2 = data6.challenges.find((c) => c.id === challengeToTest.id);
    if (updatedChallenge2) {
      console.log(`✅ Challenge progress after undo: ${updatedChallenge2.progress}%`);
      console.log(`✅ Current streak after undo: ${updatedChallenge2.currentStreak} days`);
    }

    // Step 10: Check XP transactions
    console.log('\n📋 Step 10: Checking XP transactions...');
    const { data: transactions, error: transError } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .in('source_type', ['challenge_daily', 'challenge_daily_undo'])
      .order('created_at', { ascending: false })
      .limit(5);

    if (transError) {
      console.error('❌ Error fetching transactions:', transError);
    } else {
      console.log('📊 Recent challenge XP transactions:');
      transactions.forEach(t => {
        console.log(`- ${t.description}: ${t.xp_amount > 0 ? '+' : ''}${t.xp_amount} XP (${new Date(t.created_at).toLocaleString()})`);
      });
    }

    console.log('\n🎉 Challenge undo test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testChallengeUndo(); 