const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testChallengeXP() {
  console.log('🧪 Testing Challenge XP System...\n');

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
    
    const availableChallenge = data1.challenges.find((c) => c.status === 'available');
    if (!availableChallenge) {
      console.log('⚠️  No available challenges found, using first challenge');
      const firstChallenge = data1.challenges[0];
      if (!firstChallenge) {
        console.error('❌ No challenges found at all');
        return;
      }
      console.log(`🎯 Using challenge: "${firstChallenge.title}"`);
    } else {
      console.log(`🎯 Using challenge: "${availableChallenge.title}"`);
    }

    const challengeToTest = availableChallenge || data1.challenges[0];

    // Step 3: Join the challenge
    console.log('\n📋 Step 3: Joining challenge...');
    const response2 = await fetch(`${baseUrl}/api/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'join', 
        userId: userId, 
        challengeId: challengeToTest.id 
      })
    });
    const data2 = await response2.json();
    console.log('✅ Join response:', data2.message);

    // Step 4: Complete a day
    console.log('\n📋 Step 4: Completing a day...');
    const response3 = await fetch(`${baseUrl}/api/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'complete-day', 
        userId: userId, 
        challengeId: challengeToTest.id,
        notes: 'Test dag voltooid'
      })
    });
    const data3 = await response3.json();
    console.log('✅ Complete day response:', data3.message);

    // Step 5: Check XP after completion
    console.log('\n📋 Step 5: Checking XP after completion...');
    const { data: newXp, error: newXpError } = await supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', userId)
      .single();

    if (newXpError) {
      console.error('❌ Error fetching new XP:', newXpError);
    } else {
      const xpGained = newXp.total_xp - currentXp.total_xp;
      console.log(`💰 New XP: ${newXp.total_xp}`);
      console.log(`💰 XP gained: ${xpGained}`);
      
      if (xpGained === 10) {
        console.log('✅ XP correctly added! (+10 XP)');
      } else {
        console.log(`⚠️  Unexpected XP gain: ${xpGained} (expected 10)`);
      }
    }

    // Step 6: Check XP transactions
    console.log('\n📋 Step 6: Checking XP transactions...');
    const { data: transactions, error: transError } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('source_type', 'challenge_daily')
      .order('created_at', { ascending: false })
      .limit(5);

    if (transError) {
      console.error('❌ Error fetching XP transactions:', transError);
    } else {
      console.log(`📊 Found ${transactions.length} challenge daily XP transactions`);
      if (transactions.length > 0) {
        const latest = transactions[0];
        console.log(`📝 Latest transaction: ${latest.description} (+${latest.xp_amount} XP)`);
      }
    }

    // Step 7: Check challenge logs
    console.log('\n📋 Step 7: Checking challenge logs...');
    const { data: challengeLogs, error: clError } = await supabase
      .from('challenge_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeToTest.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (clError) {
      console.error('❌ Error fetching challenge logs:', clError);
    } else {
      console.log(`📊 Found ${challengeLogs.length} challenge log entries`);
      if (challengeLogs.length > 0) {
        const latest = challengeLogs[0];
        console.log(`📝 Latest log: ${latest.notes} (XP: ${latest.xp_earned})`);
      }
    }

    console.log('\n🎉 Challenge XP test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testChallengeXP(); 