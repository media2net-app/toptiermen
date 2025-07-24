const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testChallenges() {
  console.log('🧪 Testing Challenges System...\n');

  const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'; // Rick's user ID

  try {
    // Step 1: Get available challenges
    console.log('📋 Step 1: Fetching available challenges...');
    const response1 = await fetch('http://localhost:3000/api/challenges?userId=' + userId);
    
    if (!response1.ok) {
      throw new Error(`Failed to fetch challenges: ${response1.status}`);
    }
    
    const data1 = await response1.json();
    console.log('📊 Available challenges:', data1.challenges.length);
    console.log('📈 Summary:', data1.summary);

    // Find a challenge to test with
    const challengeToTest = data1.challenges.find(c => c.status === 'available');
    if (!challengeToTest) {
      console.log('⚠️ No available challenge found to test. Exiting.');
      return;
    }
    console.log(`🎯 Testing with challenge: "${challengeToTest.title}" (ID: ${challengeToTest.id})`);

    // Step 2: Join the challenge
    console.log('\n📋 Step 2: Joining challenge...');
    const response2 = await fetch('http://localhost:3000/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join',
        userId: userId,
        challengeId: challengeToTest.id
      })
    });

    if (!response2.ok) {
      throw new Error(`Failed to join challenge: ${response2.status}`);
    }
    const data2 = await response2.json();
    console.log('✅ Join response:', data2);

    // Step 3: Verify challenge status after joining
    console.log('\n📋 Step 3: Verifying challenge status after joining...');
    const response3 = await fetch('http://localhost:3000/api/challenges?userId=' + userId);
    const data3 = await response3.json();
    const updatedChallenge1 = data3.challenges.find(c => c.id === challengeToTest.id);
    if (updatedChallenge1 && updatedChallenge1.status === 'active') {
      console.log(`✅ Challenge "${updatedChallenge1.title}" is now active.`);
    } else {
      console.log(`⚠️ Challenge "${challengeToTest.title}" status: ${updatedChallenge1?.status}`);
    }

    // Step 4: Complete a day
    console.log('\n📋 Step 4: Completing a day...');
    const response4 = await fetch('http://localhost:3000/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'complete-day',
        userId: userId,
        challengeId: challengeToTest.id,
        notes: 'Test completion'
      })
    });

    if (!response4.ok) {
      throw new Error(`Failed to complete day: ${response4.status}`);
    }
    const data4 = await response4.json();
    console.log('✅ Complete day response:', data4);

    // Step 5: Verify progress after completion
    console.log('\n📋 Step 5: Verifying progress after completion...');
    const response5 = await fetch('http://localhost:3000/api/challenges?userId=' + userId);
    const data5 = await response5.json();
    const updatedChallenge2 = data5.challenges.find(c => c.id === challengeToTest.id);
    if (updatedChallenge2) {
      console.log(`✅ Challenge "${updatedChallenge2.title}" progress: ${updatedChallenge2.progress}%`);
      console.log(`✅ Current streak: ${updatedChallenge2.currentStreak} days`);
      console.log(`✅ Completed today: ${updatedChallenge2.isCompletedToday}`);
    }

    // Step 6: Check database directly
    console.log('\n📋 Step 6: Checking database directly...');
    const { data: userChallenges, error: userChallengesError } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenges (*)
      `)
      .eq('user_id', userId)
      .eq('challenge_id', challengeToTest.id);

    if (userChallengesError) {
      console.error('❌ Error fetching user challenges:', userChallengesError);
    } else {
      console.log('📊 User challenges in database:', userChallenges.length);
      if (userChallenges.length > 0) {
        const uc = userChallenges[0];
        console.log(`✅ Status: ${uc.status}`);
        console.log(`✅ Progress: ${uc.progress_percentage}%`);
        console.log(`✅ Current streak: ${uc.current_streak}`);
        console.log(`✅ Start date: ${uc.start_date}`);
      }
    }

    // Step 7: Check challenge logs
    console.log('\n📋 Step 7: Checking challenge logs...');
    const today = new Date().toISOString().split('T')[0];
    const { data: logs, error: logsError } = await supabase
      .from('challenge_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeToTest.id)
      .eq('activity_date', today);

    if (logsError) {
      console.error('❌ Error fetching challenge logs:', logsError);
    } else {
      console.log('📊 Challenge logs for today:', logs.length);
      if (logs.length > 0) {
        console.log(`✅ Log entry: ${logs[0].completed ? 'Completed' : 'Not completed'}`);
        console.log(`✅ XP earned: ${logs[0].xp_earned}`);
      }
    }

    console.log('\n🎉 Challenges test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testChallenges(); 