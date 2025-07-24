const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testChallengeXPStats() {
  console.log('🧪 Testing Challenge XP Statistics...\n');

  const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';
  const baseUrl = 'http://localhost:3000';

  try {
    // Step 1: Get current challenges and stats
    console.log('📋 Step 1: Fetching current challenges and stats...');
    const response1 = await fetch(`${baseUrl}/api/challenges?userId=${userId}`);
    const data1 = await response1.json();
    
    console.log('📊 Current Summary:');
    console.log(`- Total Challenges: ${data1.summary.totalChallenges}`);
    console.log(`- Active Challenges: ${data1.summary.activeChallenges}`);
    console.log(`- Completed Challenges: ${data1.summary.completedChallenges}`);
    console.log(`- Total XP Earned: ${data1.summary.totalXpEarned}`);
    console.log(`- Daily XP Earned: ${data1.summary.dailyXpEarned}`);
    console.log(`- Completed XP: ${data1.summary.completedXp}`);
    console.log(`- Average Progress: ${data1.summary.averageProgress}%`);

    // Step 2: Check active challenges and their streaks
    console.log('\n📋 Step 2: Checking active challenges and streaks...');
    const activeChallenges = data1.challenges.filter(c => c.status === 'active');
    console.log(`Active challenges: ${activeChallenges.length}`);
    
    activeChallenges.forEach(challenge => {
      console.log(`- "${challenge.title}": ${challenge.currentStreak} days streak (${challenge.currentStreak * 10} XP earned)`);
    });

    // Step 3: Verify XP calculation
    console.log('\n📋 Step 3: Verifying XP calculation...');
    const calculatedDailyXp = activeChallenges.reduce((sum, c) => sum + (c.currentStreak * 10), 0);
    const calculatedCompletedXp = data1.challenges.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.xpReward, 0);
    const calculatedTotalXp = calculatedDailyXp + calculatedCompletedXp;

    console.log(`Calculated Daily XP: ${calculatedDailyXp}`);
    console.log(`Calculated Completed XP: ${calculatedCompletedXp}`);
    console.log(`Calculated Total XP: ${calculatedTotalXp}`);
    console.log(`API Total XP: ${data1.summary.totalXpEarned}`);
    console.log(`✅ XP calculation ${calculatedTotalXp === data1.summary.totalXpEarned ? 'CORRECT' : 'INCORRECT'}`);

    // Step 4: Complete a day and check if stats update
    if (activeChallenges.length > 0) {
      const challengeToTest = activeChallenges[0];
      console.log(`\n📋 Step 4: Testing XP update by completing a day for "${challengeToTest.title}"...`);
      
      const response2 = await fetch(`${baseUrl}/api/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'complete-day', 
          userId: userId, 
          challengeId: challengeToTest.id 
        })
      });
      const data2 = await response2.json();
      
      if (data2.success) {
        console.log('✅ Day completed successfully');
        
        // Step 5: Check updated stats
        console.log('\n📋 Step 5: Checking updated stats...');
        const response3 = await fetch(`${baseUrl}/api/challenges?userId=${userId}`);
        const data3 = await response3.json();
        
        console.log('📊 Updated Summary:');
        console.log(`- Total XP Earned: ${data3.summary.totalXpEarned} (was: ${data1.summary.totalXpEarned})`);
        console.log(`- Daily XP Earned: ${data3.summary.dailyXpEarned} (was: ${data1.summary.dailyXpEarned})`);
        console.log(`- XP Increase: ${data3.summary.totalXpEarned - data1.summary.totalXpEarned}`);
        
        // Step 6: Undo the day to restore original state
        console.log('\n📋 Step 6: Undoing the day to restore original state...');
        const response4 = await fetch(`${baseUrl}/api/challenges`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'undo-day', 
            userId: userId, 
            challengeId: challengeToTest.id 
          })
        });
        const data4 = await response4.json();
        
        if (data4.success) {
          console.log('✅ Day undone successfully');
          
          // Step 7: Verify stats are restored
          console.log('\n📋 Step 7: Verifying stats are restored...');
          const response5 = await fetch(`${baseUrl}/api/challenges?userId=${userId}`);
          const data5 = await response5.json();
          
          console.log(`Final Total XP: ${data5.summary.totalXpEarned} (should be: ${data1.summary.totalXpEarned})`);
          console.log(`✅ Stats restoration ${data5.summary.totalXpEarned === data1.summary.totalXpEarned ? 'SUCCESSFUL' : 'FAILED'}`);
        } else {
          console.log('❌ Failed to undo day:', data4.message);
        }
      } else {
        console.log('❌ Failed to complete day:', data2.message);
      }
    } else {
      console.log('⚠️  No active challenges to test with');
    }

    console.log('\n🎉 Challenge XP Statistics test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testChallengeXPStats(); 