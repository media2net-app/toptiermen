require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 CHECKING CHIEL ONBOARDING STATUS');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkChielOnboardingStatus() {
  console.log('📋 STEP 1: Finding Chiel\'s User ID');
  console.log('----------------------------------------');
  
  try {
    // First, find Chiel's user ID
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }
    
    const chielUser = authUsers.users.find(user => user.email === 'chiel@media2net.nl');
    
    if (!chielUser) {
      console.error('❌ Chiel not found in auth users');
      return;
    }
    
    console.log('✅ Chiel found in auth users');
    console.log(`   - ID: ${chielUser.id}`);
    console.log(`   - Email: ${chielUser.email}`);
    console.log(`   - Created: ${chielUser.created_at}`);
    
    const chielId = chielUser.id;
    
    console.log('\n📋 STEP 2: Checking Onboarding Status');
    console.log('----------------------------------------');
    
    // Check onboarding status
    const { data: onboardingStatus, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', chielId);
    
    if (onboardingError) {
      console.error('❌ Error fetching onboarding status:', onboardingError.message);
      return;
    }
    
    if (!onboardingStatus || onboardingStatus.length === 0) {
      console.log('⚠️  No onboarding status record found for Chiel');
      console.log('   - This means onboarding_completed is undefined');
      console.log('   - The "Onboarding" menu item will be shown');
      return;
    }
    
    const status = onboardingStatus[0];
    console.log('✅ Onboarding status found:');
    console.log(`   - User ID: ${status.user_id}`);
    console.log(`   - Onboarding Completed: ${status.onboarding_completed}`);
    console.log(`   - Current Step: ${status.current_step}`);
    console.log(`   - Step 1 Completed: ${status.step_1_completed}`);
    console.log(`   - Step 2 Completed: ${status.step_2_completed}`);
    console.log(`   - Step 3 Completed: ${status.step_3_completed}`);
    console.log(`   - Step 4 Completed: ${status.step_4_completed}`);
    console.log(`   - Step 5 Completed: ${status.step_5_completed}`);
    console.log(`   - Welcome Video Watched: ${status.welcome_video_watched}`);
    console.log(`   - Created: ${status.created_at}`);
    console.log(`   - Updated: ${status.updated_at}`);
    
    console.log('\n📋 STEP 3: Analysis');
    console.log('----------------------------------------');
    
    if (status.onboarding_completed) {
      console.log('✅ Onboarding is completed');
      console.log('   - The "Onboarding" menu item should NOT be shown');
      console.log('   - If it\'s still showing, there might be a caching issue');
    } else {
      console.log('⚠️  Onboarding is NOT completed');
      console.log('   - The "Onboarding" menu item SHOULD be shown');
      console.log('   - This is the expected behavior');
    }
    
    // Check if all steps are completed
    const allStepsCompleted = 
      status.step_1_completed &&
      status.step_2_completed &&
      status.step_3_completed &&
      status.step_4_completed &&
      status.step_5_completed;
    
    console.log(`\n📊 Step Completion Analysis:`);
    console.log(`   - All steps completed: ${allStepsCompleted}`);
    console.log(`   - Onboarding completed flag: ${status.onboarding_completed}`);
    
    if (allStepsCompleted && !status.onboarding_completed) {
      console.log('⚠️  INCONSISTENCY DETECTED!');
      console.log('   - All steps are completed but onboarding_completed is false');
      console.log('   - This might be a bug in the onboarding completion logic');
    }
    
    console.log('\n📋 STEP 4: Recommendations');
    console.log('----------------------------------------');
    
    if (status.onboarding_completed) {
      console.log('✅ Everything looks correct');
      console.log('   - If "Onboarding" is still showing in the sidebar:');
      console.log('     1. Clear browser cache and cookies');
      console.log('     2. Refresh the page');
      console.log('     3. Check browser developer tools for errors');
    } else {
      console.log('💡 To complete onboarding:');
      console.log('   1. Go through the onboarding flow');
      console.log('   2. Complete all 5 steps');
      console.log('   3. The "Onboarding" menu item will disappear');
    }
    
  } catch (error) {
    console.error('❌ Error checking onboarding status:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting Chiel onboarding status check...');
    console.log('');
    
    await checkChielOnboardingStatus();
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

main();
