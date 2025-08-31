const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNavigationFix() {
  console.log('🔍 TESTING NAVIGATION FIXES');
  console.log('============================================================');
  
  try {
    // 1. Check Chiel's onboarding status
    console.log('\n📋 STEP 1: Checking Chiel\'s Onboarding Status');
    console.log('------------------------------------------------------------');
    
    const { data: chielUser, error: chielError } = await supabase
      .from('profiles')
      .select('id, email, created_at')
      .eq('email', 'chiel@media2net.nl')
      .single();
    
    if (chielError) {
      console.error('❌ Error finding Chiel:', chielError);
      return;
    }
    
    console.log('✅ Chiel found:', chielUser.email);
    
    const { data: chielOnboarding, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', chielUser.id)
      .single();
    
    if (onboardingError) {
      console.error('❌ Error finding Chiel\'s onboarding status:', onboardingError);
      return;
    }
    
    console.log('✅ Chiel\'s onboarding status:');
    console.log(`   - Onboarding Completed: ${chielOnboarding.onboarding_completed}`);
    console.log(`   - Current Step: ${chielOnboarding.current_step}`);
    console.log(`   - Should see Onboarding menu: ${!chielOnboarding.onboarding_completed}`);
    
    // 2. Check if Planning Lancering page exists in dashboard
    console.log('\n📋 STEP 2: Checking Planning Lancering Page');
    console.log('------------------------------------------------------------');
    
    const fs = require('fs');
    const path = require('path');
    
    const planningLanceringPath = path.join(__dirname, '../src/app/dashboard/planning-lancering/page.tsx');
    const planningLanceringExists = fs.existsSync(planningLanceringPath);
    
    console.log(`✅ Planning Lancering page in dashboard: ${planningLanceringExists ? '❌ EXISTS (should be removed)' : '✅ REMOVED (correct)'}`);
    
    // 3. Check admin Planning Lancering page
    const adminPlanningLanceringPath = path.join(__dirname, '../src/app/dashboard-admin/planning-lancering/page.tsx');
    const adminPlanningLanceringExists = fs.existsSync(adminPlanningLanceringPath);
    
    console.log(`✅ Planning Lancering page in admin: ${adminPlanningLanceringExists ? '✅ EXISTS (correct)' : '❌ MISSING'}`);
    
    // 4. Check navigation menu configuration
    console.log('\n📋 STEP 3: Checking Navigation Menu Configuration');
    console.log('------------------------------------------------------------');
    
    const dashboardContentPath = path.join(__dirname, '../src/app/dashboard/DashboardContent.tsx');
    const dashboardContent = fs.readFileSync(dashboardContentPath, 'utf8');
    
    const hasPlanningLancering = dashboardContent.includes("'Planning Lancering'");
    const hasOnboardingLogic = dashboardContent.includes("onboardingStatus?.onboarding_completed");
    
    console.log(`✅ Planning Lancering in menu: ${hasPlanningLancering ? '❌ STILL THERE' : '✅ REMOVED (correct)'}`);
    console.log(`✅ Onboarding logic present: ${hasOnboardingLogic ? '✅ YES' : '❌ NO'}`);
    
    // 5. Summary
    console.log('\n📋 STEP 4: Summary');
    console.log('------------------------------------------------------------');
    
    const issues = [];
    
    if (planningLanceringExists) {
      issues.push('❌ Planning Lancering page still exists in dashboard');
    }
    
    if (hasPlanningLancering) {
      issues.push('❌ Planning Lancering still in menu configuration');
    }
    
    if (!chielOnboarding.onboarding_completed) {
      issues.push('❌ Chiel\'s onboarding not completed');
    }
    
    if (issues.length === 0) {
      console.log('✅ All navigation fixes are working correctly!');
      console.log('   - Planning Lancering removed from dashboard');
      console.log('   - Onboarding menu will be hidden for completed users');
      console.log('   - Chiel should not see Onboarding menu');
    } else {
      console.log('❌ Issues found:');
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    // 6. Recommendations
    console.log('\n📋 STEP 5: Recommendations');
    console.log('------------------------------------------------------------');
    
    if (chielOnboarding.onboarding_completed) {
      console.log('✅ Chiel should NOT see "Onboarding" in the sidebar');
      console.log('✅ If he still sees it, try:');
      console.log('   1. Clear browser cache (Ctrl+Shift+R)');
      console.log('   2. Hard refresh the page');
      console.log('   3. Check browser developer tools for errors');
    }
    
    console.log('✅ Planning Lancering should only be visible in Admin Dashboard');
    console.log('✅ Regular users should not see Planning Lancering');
    
  } catch (error) {
    console.error('❌ Error testing navigation fixes:', error);
  }
}

testNavigationFix();
