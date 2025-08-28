require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔧 FIXING CHIEL ONBOARDING DISPLAY');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixChielOnboardingDisplay() {
  console.log('📋 STEP 1: Finding Chiel\'s User ID');
  console.log('----------------------------------------');
  
  try {
    // Find Chiel's user ID
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
    
    const chielId = chielUser.id;
    
    console.log('\n📋 STEP 2: Current Onboarding Status');
    console.log('----------------------------------------');
    
    // Get current onboarding status
    const { data: currentStatus, error: statusError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', chielId);
    
    if (statusError) {
      console.error('❌ Error fetching onboarding status:', statusError.message);
      return;
    }
    
    if (!currentStatus || currentStatus.length === 0) {
      console.log('⚠️  No onboarding status record found - creating one');
      
      // Create new onboarding status record
      const { data: newStatus, error: createError } = await supabase
        .from('onboarding_status')
        .insert({
          user_id: chielId,
          welcome_video_watched: true,
          step_1_completed: true,
          step_2_completed: true,
          step_3_completed: true,
          step_4_completed: true,
          step_5_completed: true,
          onboarding_completed: true,
          current_step: 6,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating onboarding status:', createError.message);
        return;
      }
      
      console.log('✅ Created new onboarding status record');
      console.log(`   - Onboarding Completed: ${newStatus.onboarding_completed}`);
      return;
    }
    
    const status = currentStatus[0];
    console.log('✅ Current onboarding status:');
    console.log(`   - Onboarding Completed: ${status.onboarding_completed}`);
    console.log(`   - Current Step: ${status.current_step}`);
    console.log(`   - All steps completed: ${status.step_1_completed && status.step_2_completed && status.step_3_completed && status.step_4_completed && status.step_5_completed}`);
    
    console.log('\n📋 STEP 3: Fixing Onboarding Status');
    console.log('----------------------------------------');
    
    // Check if all steps are completed but onboarding_completed is false
    const allStepsCompleted = 
      status.step_1_completed &&
      status.step_2_completed &&
      status.step_3_completed &&
      status.step_4_completed &&
      status.step_5_completed;
    
    if (allStepsCompleted && !status.onboarding_completed) {
      console.log('🔧 Fixing inconsistency: All steps completed but onboarding_completed is false');
      
      const { data: updatedStatus, error: updateError } = await supabase
        .from('onboarding_status')
        .update({
          onboarding_completed: true,
          current_step: 6,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', status.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating onboarding status:', updateError.message);
        return;
      }
      
      console.log('✅ Fixed onboarding status');
      console.log(`   - Onboarding Completed: ${updatedStatus.onboarding_completed}`);
      console.log(`   - Current Step: ${updatedStatus.current_step}`);
    } else if (status.onboarding_completed) {
      console.log('✅ Onboarding status is already correct');
      console.log('   - No changes needed');
    } else {
      console.log('⚠️  Onboarding is not completed');
      console.log('   - This is expected if Chiel hasn\'t finished onboarding');
      console.log('   - The "Onboarding" menu item should be shown');
    }
    
    console.log('\n📋 STEP 4: Verification');
    console.log('----------------------------------------');
    
    // Verify the fix
    const { data: verifyStatus, error: verifyError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', chielId)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying status:', verifyError.message);
      return;
    }
    
    console.log('✅ Verification complete:');
    console.log(`   - Onboarding Completed: ${verifyStatus.onboarding_completed}`);
    console.log(`   - Current Step: ${verifyStatus.current_step}`);
    console.log(`   - Updated: ${verifyStatus.updated_at}`);
    
    if (verifyStatus.onboarding_completed) {
      console.log('\n🎯 RESULT:');
      console.log('✅ Chiel\'s onboarding is marked as completed');
      console.log('✅ The "Onboarding" menu item should NOT appear in the sidebar');
      console.log('');
      console.log('💡 If the menu item is still showing:');
      console.log('   1. Clear browser cache and cookies');
      console.log('   2. Refresh the page (Ctrl+F5 or Cmd+Shift+R)');
      console.log('   3. Check browser developer tools for JavaScript errors');
    } else {
      console.log('\n🎯 RESULT:');
      console.log('⚠️  Chiel\'s onboarding is NOT completed');
      console.log('✅ The "Onboarding" menu item SHOULD appear in the sidebar');
      console.log('   - This is the expected behavior');
    }
    
  } catch (error) {
    console.error('❌ Error fixing onboarding display:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting Chiel onboarding display fix...');
    console.log('');
    
    await fixChielOnboardingDisplay();
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

main();
