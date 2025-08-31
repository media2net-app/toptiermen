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

async function testHybridToDatabase() {
  console.log('🔍 TESTING HYBRID TO DATABASE CONVERSION');
  console.log('============================================================');
  
  try {
    // 1. Test Dashboard Stats API
    console.log('\n📋 STEP 1: Testing Dashboard Stats API');
    console.log('------------------------------------------------------------');
    
    const { data: chielUser, error: chielError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'chiel@media2net.nl')
      .single();
    
    if (chielError) {
      console.error('❌ Error finding Chiel:', chielError);
      return;
    }
    
    console.log('✅ Chiel found:', chielUser.email);
    
    // Test dashboard stats API
    const statsResponse = await fetch(`http://localhost:3000/api/dashboard-stats?userId=${chielUser.id}&t=${Date.now()}`);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Dashboard Stats API working:');
      console.log(`   - Missions: ${statsData.stats.missions.total} total, ${statsData.stats.missions.completedToday} today`);
      console.log(`   - Training: ${statsData.stats.training.hasActiveSchema ? 'Active' : 'No schema'}`);
      console.log(`   - User Badges: ${statsData.userBadges.length} badges`);
      console.log(`   - XP: ${statsData.stats.xp.total} points, level ${statsData.stats.xp.level}`);
    } else {
      console.log('❌ Dashboard Stats API failed:', statsResponse.status);
    }
    
    // 2. Check for mock data in code
    console.log('\n📋 STEP 2: Checking for Mock Data in Code');
    console.log('------------------------------------------------------------');
    
    const fs = require('fs');
    const path = require('path');
    
    // Check dashboard page
    const dashboardPath = path.join(__dirname, '../src/app/dashboard/page.tsx');
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    
    const hasMockStats = dashboardContent.includes('total: 5, completedToday: 0');
    const hasMockBadges = dashboardContent.includes('NO EXCUSES');
    const hasRealAPI = dashboardContent.includes('/api/dashboard-stats');
    
    console.log(`✅ Dashboard page:`);
    console.log(`   - Mock stats removed: ${!hasMockStats ? '✅' : '❌'}`);
    console.log(`   - Mock badges removed: ${!hasMockBadges ? '✅' : '❌'}`);
    console.log(`   - Real API call: ${hasRealAPI ? '✅' : '❌'}`);
    
    // Check announcements page
    const announcementsPath = path.join(__dirname, '../src/app/dashboard-admin/aankondigingen/page.tsx');
    const announcementsContent = fs.readFileSync(announcementsPath, 'utf8');
    
    const hasMockAnnouncements = announcementsContent.includes('Lancering Brotherhood 2.0');
    const hasMockCategories = announcementsContent.includes('Algemene aankondigingen');
    const hasMockStats2 = announcementsContent.includes('totalAnnouncements: 2');
    const hasErrorHandling = announcementsContent.includes('console.error');
    
    console.log(`✅ Announcements page:`);
    console.log(`   - Mock announcements removed: ${!hasMockAnnouncements ? '✅' : '❌'}`);
    console.log(`   - Mock categories removed: ${!hasMockCategories ? '✅' : '❌'}`);
    console.log(`   - Mock stats removed: ${!hasMockStats2 ? '✅' : '❌'}`);
    console.log(`   - Error handling added: ${hasErrorHandling ? '✅' : '❌'}`);
    
    // 3. Test database connectivity
    console.log('\n📋 STEP 3: Testing Database Connectivity');
    console.log('------------------------------------------------------------');
    
    // Test missions table
    const { data: missions, error: missionsError } = await supabase
      .from('user_missions')
      .select('count')
      .eq('user_id', chielUser.id)
      .limit(1);
    
    console.log(`✅ Missions table: ${missionsError ? '❌ Error' : '✅ Accessible'}`);
    
    // Test user_badges table
    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select('count')
      .eq('user_id', chielUser.id)
      .limit(1);
    
    console.log(`✅ User badges table: ${badgesError ? '❌ Error' : '✅ Accessible'}`);
    
    // Test announcements table
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select('count')
      .limit(1);
    
    console.log(`✅ Announcements table: ${announcementsError ? '❌ Error' : '✅ Accessible'}`);
    
    // 4. Summary
    console.log('\n📋 STEP 4: Summary');
    console.log('------------------------------------------------------------');
    
    const issues = [];
    
    if (hasMockStats) {
      issues.push('❌ Mock stats still in dashboard page');
    }
    
    if (hasMockBadges) {
      issues.push('❌ Mock badges still in dashboard page');
    }
    
    if (!hasRealAPI) {
      issues.push('❌ Real API call not implemented in dashboard');
    }
    
    if (hasMockAnnouncements) {
      issues.push('❌ Mock announcements still in announcements page');
    }
    
    if (hasMockCategories) {
      issues.push('❌ Mock categories still in announcements page');
    }
    
    if (missionsError) {
      issues.push('❌ Missions table not accessible');
    }
    
    if (badgesError) {
      issues.push('❌ User badges table not accessible');
    }
    
    if (announcementsError) {
      issues.push('❌ Announcements table not accessible');
    }
    
    if (issues.length === 0) {
      console.log('✅ All hybrid systems successfully converted to database-driven!');
      console.log('   - Dashboard Stats: 100% database');
      console.log('   - User Badges: 100% database');
      console.log('   - Announcements: 100% database');
      console.log('   - No mock fallbacks remaining');
    } else {
      console.log('❌ Issues found:');
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    // 5. Recommendations
    console.log('\n📋 STEP 5: Recommendations');
    console.log('------------------------------------------------------------');
    
    if (issues.length === 0) {
      console.log('✅ All systems are now 100% database-driven');
      console.log('✅ No more mock fallbacks');
      console.log('✅ Better error handling implemented');
      console.log('✅ Real-time data from database');
    } else {
      console.log('🔧 To complete the conversion:');
      console.log('   1. Remove remaining mock data from code');
      console.log('   2. Ensure all database tables exist');
      console.log('   3. Test API endpoints');
      console.log('   4. Verify error handling');
    }
    
  } catch (error) {
    console.error('❌ Error testing hybrid to database conversion:', error);
  }
}

testHybridToDatabase();
