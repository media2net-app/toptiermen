const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Looking for: NEXT_PUBLIC_SUPABASE_URL and (SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

console.log('🔑 Using', process.env.SUPABASE_SERVICE_KEY ? 'Service Key' : 'Anon Key');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Dry run mode - set to false to actually execute
const DRY_RUN = process.argv.includes('--execute') ? false : true;

async function resetAllUsersToOnboarding() {
  console.log('\n🔄 ====== USER DATA RESET SCRIPT ======\n');
  console.log(`Mode: ${DRY_RUN ? '🧪 DRY RUN (geen echte changes)' : '⚠️  LIVE EXECUTION (echte changes!)'}\n`);
  
  if (!DRY_RUN) {
    console.log('⚠️  WARNING: Dit script zal ALLE gebruikersdata resetten!');
    console.log('⚠️  Users moeten opnieuw door onboarding!\n');
  }

  try {
    // 1. Get all users (including admins!)
    console.log('1️⃣ Fetching all users...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role');

    if (profilesError) throw profilesError;
    
    console.log(`   Found ${profiles.length} users (including admins)\n`);

    // 2. Reset onboarding status
    console.log('2️⃣ Resetting onboarding status...');
    const onboardingResets = profiles.map(user => ({
      user_id: user.id,
      onboarding_completed: false,
      current_step: 1,
      step_1_completed: false,
      step_2_completed: false,
      step_3_completed: false,
      step_4_completed: false,
      step_5_completed: false,
      step_6_completed: false,
      completed_at: null,
      welcome_video_watched: false
    }));

    if (!DRY_RUN) {
      for (const reset of onboardingResets) {
        const { error } = await supabase
          .from('onboarding_status')
          .upsert(reset, { onConflict: 'user_id' });
        if (error) console.error(`   Error resetting ${reset.user_id}:`, error.message);
      }
    }
    console.log(`   ${DRY_RUN ? 'Would reset' : 'Reset'} ${profiles.length} onboarding statuses\n`);

    // 3. Clear selected training schemas
    console.log('3️⃣ Clearing selected training schemas...');
    if (!DRY_RUN) {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          selected_training_schema: null,
          training_goal: null
        })
        .in('id', profiles.map(p => p.id));
      if (error) console.error('   Error:', error.message);
    }
    console.log(`   ${DRY_RUN ? 'Would clear' : 'Cleared'} training schemas for ${profiles.length} users\n`);

    // 4. Clear selected nutrition plans
    console.log('4️⃣ Clearing selected nutrition plans...');
    if (!DRY_RUN) {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          selected_nutrition_plan: null,
          selected_nutrition_plan_v2: null
        })
        .in('id', profiles.map(p => p.id));
      if (error) console.error('   Error:', error.message);
    }
    console.log(`   ${DRY_RUN ? 'Would clear' : 'Cleared'} nutrition plans for ${profiles.length} users\n`);

    // 5. Delete user missions (goals)
    console.log('5️⃣ Deleting user missions (goals)...');
    const { data: missions, error: missionsCountError } = await supabase
      .from('user_missions')
      .select('id, user_id')
      .in('user_id', profiles.map(p => p.id));
    
    const missionCount = missions?.length || 0;
    
    if (!DRY_RUN && missionCount > 0) {
      const { error } = await supabase
        .from('user_missions')
        .delete()
        .in('user_id', profiles.map(p => p.id));
      if (error) console.error('   Error:', error.message);
    }
    console.log(`   ${DRY_RUN ? 'Would delete' : 'Deleted'} ${missionCount} missions\n`);

    // 6. Delete workout logs
    console.log('6️⃣ Deleting workout logs...');
    const { data: workoutLogs, error: workoutCountError } = await supabase
      .from('workout_logs')
      .select('id')
      .in('user_id', profiles.map(p => p.id));
    
    const workoutCount = workoutLogs?.length || 0;
    
    if (!DRY_RUN && workoutCount > 0) {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .in('user_id', profiles.map(p => p.id));
      if (error) console.error('   Error:', error.message);
    }
    console.log(`   ${DRY_RUN ? 'Would delete' : 'Deleted'} ${workoutCount} workout logs\n`);

    // 7. Delete custom nutrition plans
    console.log('7️⃣ Deleting custom nutrition plans...');
    const { data: customPlans, error: customPlansCountError } = await supabase
      .from('custom_nutrition_plans')
      .select('id')
      .in('user_id', profiles.map(p => p.id));
    
    const customPlanCount = customPlans?.length || 0;
    
    if (!DRY_RUN && customPlanCount > 0) {
      const { error } = await supabase
        .from('custom_nutrition_plans')
        .delete()
        .in('user_id', profiles.map(p => p.id));
      if (error) console.error('   Error:', error.message);
    }
    console.log(`   ${DRY_RUN ? 'Would delete' : 'Deleted'} ${customPlanCount} custom nutrition plans\n`);

    // 8. Reset academy progress
    console.log('8️⃣ Resetting academy progress...');
    const { data: academyProgress, error: academyCountError } = await supabase
      .from('academy_lesson_completions')
      .select('id')
      .in('user_id', profiles.map(p => p.id));
    
    const academyCount = academyProgress?.length || 0;
    
    if (!DRY_RUN && academyCount > 0) {
      const { error } = await supabase
        .from('academy_lesson_completions')
        .delete()
        .in('user_id', profiles.map(p => p.id));
      if (error) console.error('   Error:', error.message);
    }
    console.log(`   ${DRY_RUN ? 'Would delete' : 'Deleted'} ${academyCount} academy completions\n`);

    // Summary
    console.log('\n✅ ====== SUMMARY ======\n');
    console.log(`Mode: ${DRY_RUN ? '🧪 DRY RUN' : '⚠️  EXECUTED'}`);
    console.log(`Users affected: ${profiles.length}`);
    console.log(`\nData ${DRY_RUN ? 'that would be' : ''} reset:`);
    console.log(`  - Onboarding status: ${profiles.length} users`);
    console.log(`  - Training schemas: cleared`);
    console.log(`  - Nutrition plans: cleared`);
    console.log(`  - User missions: ${missionCount} deleted`);
    console.log(`  - Workout logs: ${workoutCount} deleted`);
    console.log(`  - Custom nutrition plans: ${customPlanCount} deleted`);
    console.log(`  - Academy progress: ${academyCount} deleted`);
    
    if (DRY_RUN) {
      console.log('\n💡 To execute for real, run: node reset-all-users-to-onboarding.js --execute\n');
    } else {
      console.log('\n🎉 All users have been reset! They will start at onboarding step 1.\n');
    }

    // List affected users
    console.log('\n📋 Affected users:');
    profiles.slice(0, 10).forEach(p => {
      console.log(`  - ${p.full_name || 'No name'} (${p.email})`);
    });
    if (profiles.length > 10) {
      console.log(`  ... and ${profiles.length - 10} more users`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

resetAllUsersToOnboarding();

