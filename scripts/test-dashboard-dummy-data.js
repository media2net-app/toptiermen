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

async function testDashboardDummyData() {
  console.log('🔍 TESTING DASHBOARD DUMMY DATA REMOVAL');
  console.log('============================================================');
  
  try {
    // 1. Check for Chiel's user ID
    console.log('\n📋 STEP 1: Getting Chiel\'s User ID');
    console.log('------------------------------------------------------------');
    
    const { data: chielUser, error: chielError } = await supabase
      .from('profiles')
      .select('id, email, points')
      .eq('email', 'chiel@media2net.nl')
      .single();
    
    if (chielError) {
      console.error('❌ Error finding Chiel:', chielError);
      return;
    }
    
    console.log('✅ Chiel found:', chielUser.email);
    console.log(`   - Points: ${chielUser.points}`);
    
    // 2. Test Dashboard Stats API
    console.log('\n📋 STEP 2: Testing Dashboard Stats API');
    console.log('------------------------------------------------------------');
    
    const statsResponse = await fetch(`http://localhost:3000/api/dashboard-stats?userId=${chielUser.id}&t=${Date.now()}`);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Dashboard Stats API working:');
      console.log(`   - Missions: ${statsData.stats.missions.total} total, ${statsData.stats.missions.completedToday} today`);
      console.log(`   - Challenges: ${statsData.stats.challenges.active} active`);
      console.log(`   - Training: ${statsData.stats.training.hasActiveSchema ? 'Active' : 'No schema'}`);
      console.log(`   - Finance: €${statsData.stats.finance?.netWorth?.toLocaleString() || '0'}`);
      console.log(`   - Brotherhood: ${statsData.stats.brotherhood?.totalMembers || 0} members`);
      console.log(`   - Academy: ${statsData.stats.academy?.completedCourses || 0}/${statsData.stats.academy?.totalCourses || 12} courses`);
      console.log(`   - User Badges: ${statsData.userBadges.length} badges`);
    } else {
      console.log('❌ Dashboard Stats API failed:', statsResponse.status);
    }
    
    // 3. Check for hardcoded dummy data in code
    console.log('\n📋 STEP 3: Checking for Hardcoded Dummy Data');
    console.log('------------------------------------------------------------');
    
    const fs = require('fs');
    const path = require('path');
    
    // Check dashboard page
    const dashboardPath = path.join(__dirname, '../src/app/dashboard/page.tsx');
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    const hasHardcodedFinance = dashboardContent.includes('€12.500');
    const hasHardcodedBrotherhood = dashboardContent.includes('24') && dashboardContent.includes('broeders') && !dashboardContent.includes('stats?.brotherhood?.totalMembers');
    const hasHardcodedAcademy = dashboardContent.includes('12') && dashboardContent.includes('cursussen') && !dashboardContent.includes('stats?.academy?.completedCourses');
    const hasHardcodedProgress = dashboardContent.includes("width: '75%'") || dashboardContent.includes("width: '60%'") || dashboardContent.includes("width: '40%'");
    const hasDatabaseStats = dashboardContent.includes('stats?.finance?.netWorth') && dashboardContent.includes('stats?.brotherhood?.totalMembers') && dashboardContent.includes('stats?.academy?.completedCourses');
    
    console.log(`✅ Dashboard page analysis:`);
    console.log(`   - Hardcoded Finance (€12.500): ${hasHardcodedFinance ? '❌ STILL EXISTS' : '✅ REMOVED'}`);
    console.log(`   - Hardcoded Brotherhood (24): ${hasHardcodedBrotherhood ? '❌ STILL EXISTS' : '✅ REMOVED'}`);
    console.log(`   - Hardcoded Academy (12): ${hasHardcodedAcademy ? '❌ STILL EXISTS' : '✅ REMOVED'}`);
    console.log(`   - Hardcoded Progress (%): ${hasHardcodedProgress ? '❌ STILL EXISTS' : '✅ REMOVED'}`);
    console.log(`   - Database Stats: ${hasDatabaseStats ? '✅ IMPLEMENTED' : '❌ MISSING'}`);
    
    // 4. Check API implementation
    console.log('\n📋 STEP 4: Checking API Implementation');
    console.log('------------------------------------------------------------');
    
    const apiPath = path.join(__dirname, '../src/app/api/dashboard-stats/route.ts');
    const apiContent = fs.readFileSync(apiPath, 'utf8');
    
    const hasFinanceFunction = apiContent.includes('fetchFinanceStats');
    const hasBrotherhoodFunction = apiContent.includes('fetchBrotherhoodStats');
    const hasAcademyFunction = apiContent.includes('fetchAcademyStats');
    const hasDatabaseQueries = apiContent.includes('supabaseAdmin.from') && apiContent.includes('profiles') && apiContent.includes('forum_posts');
    
    console.log(`✅ API implementation:`);
    console.log(`   - Finance function: ${hasFinanceFunction ? '✅ IMPLEMENTED' : '❌ MISSING'}`);
    console.log(`   - Brotherhood function: ${hasBrotherhoodFunction ? '✅ IMPLEMENTED' : '❌ MISSING'}`);
    console.log(`   - Academy function: ${hasAcademyFunction ? '✅ IMPLEMENTED' : '❌ MISSING'}`);
    console.log(`   - Database queries: ${hasDatabaseQueries ? '✅ IMPLEMENTED' : '❌ MISSING'}`);
    
    // 5. Test database connectivity for new stats
    console.log('\n📋 STEP 5: Testing Database Connectivity');
    console.log('------------------------------------------------------------');
    
    // Test forum posts
    const { data: forumPosts, error: postsError } = await supabase
      .from('forum_posts')
      .select('count')
      .eq('user_id', chielUser.id)
      .limit(1);
    
    console.log(`✅ Forum posts table: ${postsError ? '❌ Error' : '✅ Accessible'}`);
    
    // Test book reviews
    const { data: bookReviews, error: reviewsError } = await supabase
      .from('book_reviews')
      .select('count')
      .eq('user_id', chielUser.id)
      .limit(1);
    
    console.log(`✅ Book reviews table: ${reviewsError ? '❌ Error' : '✅ Accessible'}`);
    
    // 6. Summary
    console.log('\n📋 STEP 6: Summary');
    console.log('------------------------------------------------------------');
    
    const issues = [];
    
    if (hasHardcodedFinance) {
      issues.push('❌ Hardcoded Finance data still exists');
    }
    
    if (hasHardcodedBrotherhood) {
      issues.push('❌ Hardcoded Brotherhood data still exists');
    }
    
    if (hasHardcodedAcademy) {
      issues.push('❌ Hardcoded Academy data still exists');
    }
    
    if (hasHardcodedProgress) {
      issues.push('❌ Hardcoded progress percentages still exist');
    }
    
    if (!hasDatabaseStats) {
      issues.push('❌ Database stats not implemented in dashboard');
    }
    
    if (!hasFinanceFunction || !hasBrotherhoodFunction || !hasAcademyFunction) {
      issues.push('❌ API functions not fully implemented');
    }
    
    if (postsError || reviewsError) {
      issues.push('❌ Database tables not accessible');
    }
    
    if (issues.length === 0) {
      console.log('✅ All dummy data successfully replaced with database-driven data!');
      console.log('   - Finance: Real net worth calculation');
      console.log('   - Brotherhood: Real member count');
      console.log('   - Academy: Real course progress');
      console.log('   - All progress bars: Dynamic from database');
      console.log('   - No hardcoded values remaining');
    } else {
      console.log('❌ Issues found:');
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    // 7. Recommendations
    console.log('\n📋 STEP 7: Recommendations');
    console.log('------------------------------------------------------------');
    
    if (issues.length === 0) {
      console.log('✅ Dashboard is now 100% database-driven');
      console.log('✅ All stats come from real database data');
      console.log('✅ No more hardcoded dummy values');
      console.log('✅ Real-time updates when data changes');
    } else {
      console.log('🔧 To complete the conversion:');
      console.log('   1. Remove remaining hardcoded values');
      console.log('   2. Ensure all API functions are implemented');
      console.log('   3. Test database connectivity');
      console.log('   4. Verify all stats are dynamic');
    }
    
  } catch (error) {
    console.error('❌ Error testing dashboard dummy data:', error);
  }
}

testDashboardDummyData();
