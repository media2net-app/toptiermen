const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_EMAILS = ['chiel@media2net.nl', 'rick@media2net.nl'];

async function resetAdminOnboarding() {
  console.log('\n🔧 ====== RESET ADMIN ONBOARDING ======\n');
  console.log(`Resetting onboarding voor: ${ADMIN_EMAILS.join(', ')}\n`);

  try {
    // 1. Get admin users
    console.log('1️⃣ Fetching admin users...');
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .in('email', ADMIN_EMAILS);

    if (adminsError) throw adminsError;
    
    if (!admins || admins.length === 0) {
      console.log('❌ Geen admin users gevonden met deze emails!');
      return;
    }

    console.log(`   Found ${admins.length} admin users:`);
    admins.forEach(admin => {
      console.log(`   - ${admin.full_name || 'No name'} (${admin.email})`);
    });
    console.log('');

    const adminIds = admins.map(a => a.id);

    // 2. Check current onboarding status
    console.log('2️⃣ Checking current onboarding status...');
    const { data: currentStatus, error: statusError } = await supabase
      .from('onboarding_status')
      .select('*')
      .in('user_id', adminIds);

    if (statusError) {
      console.log('   ⚠️  Error checking status:', statusError.message);
    } else {
      currentStatus?.forEach(status => {
        const admin = admins.find(a => a.id === status.user_id);
        console.log(`   ${admin?.email}: Step ${status.current_step}, Completed: ${status.onboarding_completed}`);
      });
    }
    console.log('');

    // 3. Delete existing onboarding status
    console.log('3️⃣ Deleting existing onboarding status...');
    const { error: deleteError } = await supabase
      .from('onboarding_status')
      .delete()
      .in('user_id', adminIds);

    if (deleteError) {
      console.log('   ⚠️  Error deleting:', deleteError.message);
    } else {
      console.log('   ✓ Deleted existing statuses');
    }
    console.log('');

    // 4. Reset profiles (clear training & nutrition)
    console.log('4️⃣ Clearing selected schemas and plans...');
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        selected_training_schema: null,
        training_goal: null,
        selected_nutrition_plan: null,
        selected_nutrition_plan_v2: null
      })
      .in('id', adminIds);

    if (profileUpdateError) {
      console.log('   ⚠️  Error updating profiles:', profileUpdateError.message);
    } else {
      console.log('   ✓ Cleared training schemas and nutrition plans');
    }
    console.log('');

    // 5. Create new onboarding status (step 1)
    console.log('5️⃣ Creating new onboarding status (Step 1)...');
    
    const newStatuses = adminIds.map(userId => ({
      user_id: userId,
      onboarding_completed: false,
      current_step: 1,
      welcome_video_watched: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error: insertError } = await supabase
      .from('onboarding_status')
      .insert(newStatuses);

    if (insertError) {
      console.log('   ❌ Error creating status:', insertError.message);
      console.log('   Trying SQL approach instead...');
    } else {
      console.log('   ✓ Created new onboarding status records');
    }
    console.log('');

    // 6. Delete user data (missions, workout logs, etc.)
    console.log('6️⃣ Deleting user data...');
    
    // Missions
    const { data: missions } = await supabase
      .from('user_missions')
      .select('id', { count: 'exact' })
      .in('user_id', adminIds);
    
    if (missions && missions.length > 0) {
      await supabase.from('user_missions').delete().in('user_id', adminIds);
      console.log(`   ✓ Deleted ${missions.length} missions`);
    }

    // Workout logs
    const { data: workouts } = await supabase
      .from('workout_logs')
      .select('id', { count: 'exact' })
      .in('user_id', adminIds);
    
    if (workouts && workouts.length > 0) {
      await supabase.from('workout_logs').delete().in('user_id', adminIds);
      console.log(`   ✓ Deleted ${workouts.length} workout logs`);
    }

    // Custom nutrition plans
    const { data: customPlans } = await supabase
      .from('custom_nutrition_plans')
      .select('id', { count: 'exact' })
      .in('user_id', adminIds);
    
    if (customPlans && customPlans.length > 0) {
      await supabase.from('custom_nutrition_plans').delete().in('user_id', adminIds);
      console.log(`   ✓ Deleted ${customPlans.length} custom plans`);
    }

    // Academy completions
    const { data: academyProgress } = await supabase
      .from('academy_completions')
      .select('id', { count: 'exact' })
      .in('user_id', adminIds);
    
    if (academyProgress && academyProgress.length > 0) {
      await supabase.from('academy_completions').delete().in('user_id', adminIds);
      console.log(`   ✓ Deleted ${academyProgress.length} academy completions`);
    }
    
    console.log('');

    // 7. Verify
    console.log('7️⃣ Verifying reset...');
    const { data: verifyStatus, error: verifyError } = await supabase
      .from('onboarding_status')
      .select('*')
      .in('user_id', adminIds);

    if (verifyError) {
      console.log('   ⚠️  Error verifying:', verifyError.message);
    } else {
      console.log('   Status after reset:');
      verifyStatus?.forEach(status => {
        const admin = admins.find(a => a.id === status.user_id);
        console.log(`   - ${admin?.email}: Step ${status.current_step}, Completed: ${status.onboarding_completed}`);
      });
    }

    console.log('\n✅ ====== SUMMARY ======\n');
    console.log(`Admins reset: ${admins.length}`);
    admins.forEach(admin => {
      console.log(`  ✓ ${admin.full_name || 'No name'} (${admin.email})`);
    });
    console.log('\nDeze admins moeten nu door onboarding vanaf stap 1! 🎯\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

resetAdminOnboarding();

