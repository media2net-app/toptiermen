const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyReset() {
  console.log('\n🔍 ====== VERIFICATION SCRIPT ======\n');
  console.log('Checking if all users are properly reset...\n');

  let allGood = true;
  const issues = [];

  try {
    // 1. Check all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role');

    if (profilesError) throw profilesError;
    console.log(`✓ Found ${profiles.length} users\n`);

    // 2. Check onboarding status
    console.log('1️⃣ Checking onboarding status...');
    const { data: onboardingStatuses, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .in('user_id', profiles.map(p => p.id));

    if (onboardingError) {
      console.log('   ⚠️  Error fetching onboarding:', onboardingError.message);
    }

    let onboardingOk = 0;
    let onboardingIssues = 0;
    
    profiles.forEach(user => {
      const status = onboardingStatuses?.find(s => s.user_id === user.id);
      if (!status) {
        issues.push(`${user.email}: No onboarding status found`);
        onboardingIssues++;
      } else if (status.onboarding_completed || status.current_step > 1) {
        issues.push(`${user.email}: Still at step ${status.current_step}, completed: ${status.onboarding_completed}`);
        onboardingIssues++;
      } else {
        onboardingOk++;
      }
    });

    console.log(`   ✓ ${onboardingOk} users at step 1`);
    if (onboardingIssues > 0) {
      console.log(`   ✗ ${onboardingIssues} users NOT at step 1`);
      allGood = false;
    }
    console.log('');

    // 3. Check for remaining missions
    console.log('2️⃣ Checking user missions...');
    const { data: missions, error: missionsError } = await supabase
      .from('user_missions')
      .select('id, user_id')
      .in('user_id', profiles.map(p => p.id));

    if (missionsError) {
      console.log('   ⚠️  Error fetching missions:', missionsError.message);
    }

    if (missions && missions.length > 0) {
      console.log(`   ✗ Found ${missions.length} remaining missions (should be 0)`);
      allGood = false;
      issues.push(`${missions.length} missions still exist`);
    } else {
      console.log(`   ✓ No missions found (correct)`);
    }
    console.log('');

    // 4. Check workout logs
    console.log('3️⃣ Checking workout logs...');
    const { data: workoutLogs, error: workoutError } = await supabase
      .from('workout_logs')
      .select('id, user_id')
      .in('user_id', profiles.map(p => p.id));

    if (workoutError) {
      console.log('   ⚠️  Error fetching workout logs:', workoutError.message);
    }

    if (workoutLogs && workoutLogs.length > 0) {
      console.log(`   ✗ Found ${workoutLogs.length} remaining workout logs (should be 0)`);
      allGood = false;
      issues.push(`${workoutLogs.length} workout logs still exist`);
    } else {
      console.log(`   ✓ No workout logs found (correct)`);
    }
    console.log('');

    // 5. Check custom nutrition plans
    console.log('4️⃣ Checking custom nutrition plans...');
    const { data: customPlans, error: customPlansError } = await supabase
      .from('custom_nutrition_plans')
      .select('id, user_id')
      .in('user_id', profiles.map(p => p.id));

    if (customPlansError) {
      console.log('   ⚠️  Error fetching custom plans:', customPlansError.message);
    }

    if (customPlans && customPlans.length > 0) {
      console.log(`   ✗ Found ${customPlans.length} remaining custom plans (should be 0)`);
      allGood = false;
      issues.push(`${customPlans.length} custom plans still exist`);
    } else {
      console.log(`   ✓ No custom plans found (correct)`);
    }
    console.log('');

    // 6. Check academy progress
    console.log('5️⃣ Checking academy progress...');
    const { data: academyProgress, error: academyError } = await supabase
      .from('academy_lesson_completions')
      .select('id, user_id')
      .in('user_id', profiles.map(p => p.id));

    if (academyError) {
      console.log('   ⚠️  Error fetching academy progress:', academyError.message);
    }

    if (academyProgress && academyProgress.length > 0) {
      console.log(`   ✗ Found ${academyProgress.length} remaining academy completions (should be 0)`);
      allGood = false;
      issues.push(`${academyProgress.length} academy completions still exist`);
    } else {
      console.log(`   ✓ No academy progress found (correct)`);
    }
    console.log('');

    // 7. Sample check: Get detailed info for first 3 users
    console.log('6️⃣ Sample user details (first 3)...');
    for (let i = 0; i < Math.min(3, profiles.length); i++) {
      const user = profiles[i];
      const status = onboardingStatuses?.find(s => s.user_id === user.id);
      
      console.log(`\n   User: ${user.full_name || 'No name'} (${user.email})`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   Onboarding: Step ${status?.current_step || 'unknown'}, Completed: ${status?.onboarding_completed || false}`);
      console.log(`   Welcome video watched: ${status?.welcome_video_watched || false}`);
    }
    console.log('');

    // Final Summary
    console.log('\n✅ ====== SUMMARY ======\n');
    if (allGood) {
      console.log('🎉 ALL CHECKS PASSED!');
      console.log('✓ All users are at onboarding step 1');
      console.log('✓ All user data has been cleared');
      console.log('✓ Platform is ready for re-launch!\n');
    } else {
      console.log('⚠️  SOME ISSUES FOUND:\n');
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('\n💡 You may want to run the reset script again or fix these manually.\n');
    }

  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
    console.error(error);
  }
}

verifyReset();

