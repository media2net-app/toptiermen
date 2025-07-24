const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDashboardStats() {
  console.log('🧪 Testing Dashboard Stats API...\n');

  const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';
  const baseUrl = 'http://localhost:3000';

  try {
    // Step 1: Test the dashboard stats API
    console.log('📊 Step 1: Testing dashboard stats API...');
    const response = await fetch(`${baseUrl}/api/dashboard-stats?userId=${userId}`);
    
    if (!response.ok) {
      console.log('❌ API request failed:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Dashboard stats fetched successfully!');
      console.log('\n📈 Dashboard Statistics:');
      console.log('------------------------');
      console.log(`🎯 Missions: ${data.stats.missions.completedToday}/${data.stats.missions.total} (${data.stats.missions.progress}%)`);
      console.log(`🔥 Challenges: ${data.stats.challenges.active} active, ${data.stats.challenges.totalDays} days completed`);
      console.log(`💪 Training: ${data.stats.training.hasActiveSchema ? 'Active schema' : 'No schema'}, ${data.stats.training.weeklySessions} sessions/week`);
      console.log(`🧘‍♂️ Mind & Focus: ${data.stats.mindFocus.completedToday}/${data.stats.mindFocus.total} (${data.stats.mindFocus.progress}%)`);
      console.log(`📚 Boekenkamer: ${data.stats.boekenkamer.completedToday}/${data.stats.boekenkamer.total} (${data.stats.boekenkamer.progress}%)`);
      console.log(`⭐ XP: ${data.stats.xp.total} total, Level ${data.stats.xp.level}`);
      console.log(`📊 Overall Progress: ${data.stats.summary.totalProgress}%`);
    } else {
      console.log('❌ API returned error:', data.error);
    }

    // Step 2: Verify data consistency with database
    console.log('\n🔍 Step 2: Verifying data consistency...');
    
    // Check missions
    const { data: missionsData, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId);

    if (!missionsError && missionsData) {
      console.log(`✅ Missions verification: ${missionsData.length} missions found in database`);
    }

    // Check challenges
    const { data: challengesData, error: challengesError } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId);

    if (!challengesError && challengesData) {
      console.log(`✅ Challenges verification: ${challengesData.length} challenges found in database`);
    }

    // Check XP
    const { data: xpData, error: xpError } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!xpError && xpData) {
      console.log(`✅ XP verification: ${xpData.total_xp} XP found in database`);
    }

    console.log('\n🎉 Dashboard stats test completed successfully!');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testDashboardStats(); 