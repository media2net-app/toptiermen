const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkChielChallenges() {
  try {
    // Find Chiel's user ID
    const { data: chielUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'chiel@media2net.nl')
      .single();
    
    if (userError) {
      console.error('❌ Error finding Chiel:', userError.message);
      return;
    }
    
    console.log('👤 Found Chiel:', chielUser.email, chielUser.id);
    
    // Check all challenges in the system
    const { data: allChallenges, error: allChallengesError } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (allChallengesError) {
      console.error('❌ Error fetching all challenges:', allChallengesError.message);
    } else {
      console.log(`\n📋 Total challenges in system: ${allChallenges?.length || 0}`);
      allChallenges?.forEach((challenge, index) => {
        console.log(`  ${index + 1}. ${challenge.title} (${challenge.status})`);
      });
    }
    
    // Check Chiel's user challenges
    const { data: userChallenges, error: userChallengesError } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', chielUser.id);
    
    if (userChallengesError) {
      console.error('❌ Error fetching user challenges:', userChallengesError.message);
    } else {
      console.log(`\n🎯 Chiel's user challenges: ${userChallenges?.length || 0}`);
      userChallenges?.forEach((userChallenge, index) => {
        console.log(`  ${index + 1}. User Challenge ID: ${userChallenge.id}`);
        console.log(`     Challenge ID: ${userChallenge.challenge_id}`);
        console.log(`     Status: ${userChallenge.status}`);
        console.log(`     Progress: ${userChallenge.progress_percentage}%`);
      });
    }
    
    // Check challenge logs for Chiel
    const { data: challengeLogs, error: challengeLogsError } = await supabase
      .from('challenge_logs')
      .select('*')
      .eq('user_id', chielUser.id);
    
    if (challengeLogsError) {
      console.error('❌ Error fetching challenge logs:', challengeLogsError.message);
    } else {
      console.log(`\n📊 Chiel's challenge logs: ${challengeLogs?.length || 0}`);
      challengeLogs?.forEach((log, index) => {
        console.log(`  ${index + 1}. Date: ${log.activity_date}, Completed: ${log.completed}, XP: ${log.xp_earned}`);
      });
    }
    
    // Check user missions for Chiel
    const { data: userMissions, error: userMissionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', chielUser.id);
    
    if (userMissionsError) {
      console.error('❌ Error fetching user missions:', userMissionsError.message);
    } else {
      console.log(`\n🎯 Chiel's user missions: ${userMissions?.length || 0}`);
      userMissions?.forEach((mission, index) => {
        console.log(`  ${index + 1}. ${mission.title} (${mission.status})`);
      });
    }
    
    // Check what the dashboard API returns
    console.log('\n🔍 Testing dashboard API...');
    try {
      const response = await fetch(`http://localhost:3000/api/dashboard/challenges?userId=${chielUser.id}`);
      const data = await response.json();
      console.log('📊 Dashboard API response:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error testing dashboard API:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking Chiel challenges:', error);
  }
}

checkChielChallenges();
