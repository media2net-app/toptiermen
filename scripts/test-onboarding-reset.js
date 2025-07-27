const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testOnboardingReset() {
  try {
    console.log('🧪 Testing onboarding reset functionality...\n');

    // Find a test user (you can change this to any user ID)
    const testUserId = '14d7c55b-4ccd-453f-b79f-403f306f1efb'; // Rob's ID
    
    console.log('📋 Checking current user data before reset...');
    
    // Check all tables for user data
    const tablesToCheck = [
      'onboarding_status',
      'user_missions',
      'user_preferences',
      'user_training_progress',
      'user_challenges',
      'challenge_logs',
      'user_daily_streaks',
      'user_xp',
      'forum_posts',
      'workout_sessions',
      'profiles',
      'user_presence',
      'user_badges',
      'user_goals',
      'user_habits',
      'user_habit_logs',
      'user_daily_progress',
      'user_weekly_stats',
      'user_achievements',
      'user_nutrition_plans',
      'user_meal_customizations',
      'user_nutrition_progress',
      'user_training_schema_progress',
      'user_training_day_progress',
      'user_mission_logs',
      'workout_exercises',
      'users',
      'user_onboarding_status'
    ];

    const beforeData = {};
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', testUserId);
        
        if (error) {
          console.log(`⚠️ Error checking ${table}:`, error.message);
          beforeData[table] = { error: error.message };
        } else {
          beforeData[table] = data || [];
          console.log(`✅ ${table}: ${data?.length || 0} records`);
        }
      } catch (err) {
        console.log(`❌ Exception checking ${table}:`, err.message);
        beforeData[table] = { error: err.message };
      }
    }

    console.log('\n🔄 Performing onboarding reset...');
    
    // Call the reset API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', 'http://localhost:3000')}/api/admin/reset-onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId
      }),
    });

    const resetResult = await response.json();
    
    if (response.ok) {
      console.log('✅ Reset completed successfully');
      console.log('📝 Reset message:', resetResult.message);
    } else {
      console.log('❌ Reset failed:', resetResult.error);
      return;
    }

    console.log('\n📋 Checking user data after reset...');
    
    const afterData = {};
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', testUserId);
        
        if (error) {
          console.log(`⚠️ Error checking ${table}:`, error.message);
          afterData[table] = { error: error.message };
        } else {
          afterData[table] = data || [];
          console.log(`✅ ${table}: ${data?.length || 0} records`);
        }
      } catch (err) {
        console.log(`❌ Exception checking ${table}:`, err.message);
        afterData[table] = { error: err.message };
      }
    }

    console.log('\n📊 Reset Summary:');
    console.log('================');
    
    let totalCleared = 0;
    let totalErrors = 0;
    
    for (const table of tablesToCheck) {
      const before = beforeData[table];
      const after = afterData[table];
      
      if (before.error || after.error) {
        console.log(`⚠️ ${table}: Error occurred`);
        totalErrors++;
        continue;
      }
      
      const beforeCount = Array.isArray(before) ? before.length : 0;
      const afterCount = Array.isArray(after) ? after.length : 0;
      
      if (beforeCount > 0 || afterCount > 0) {
        console.log(`${table}: ${beforeCount} → ${afterCount} records`);
        if (beforeCount > afterCount) {
          totalCleared += (beforeCount - afterCount);
        }
      }
    }

    console.log(`\n🎯 Total records cleared: ${totalCleared}`);
    console.log(`⚠️ Tables with errors: ${totalErrors}`);
    
    // Check specific onboarding status
    const { data: onboardingStatus } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    if (onboardingStatus) {
      console.log('\n📋 Onboarding Status After Reset:');
      console.log('================================');
      console.log(`Current Step: ${onboardingStatus.current_step}`);
      console.log(`Welcome Video Watched: ${onboardingStatus.welcome_video_watched}`);
      console.log(`Step 1 Completed: ${onboardingStatus.step_1_completed}`);
      console.log(`Step 2 Completed: ${onboardingStatus.step_2_completed}`);
      console.log(`Step 3 Completed: ${onboardingStatus.step_3_completed}`);
      console.log(`Step 4 Completed: ${onboardingStatus.step_4_completed}`);
      console.log(`Step 5 Completed: ${onboardingStatus.step_5_completed}`);
      console.log(`Onboarding Completed: ${onboardingStatus.onboarding_completed}`);
    }

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOnboardingReset(); 