const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAcademyFix() {
  console.log('✅ Verifying Academy Fix for Chiel...\n');

  try {
    // Find Chiel's user ID
    const { data: chielProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .or('full_name.ilike.%chiel%,email.ilike.%chiel%')
      .limit(1);

    if (profileError || !chielProfile || chielProfile.length === 0) {
      console.error('❌ Chiel not found');
      return;
    }

    const chielId = chielProfile[0].id;
    console.log(`👤 Testing for: ${chielProfile[0].full_name} (${chielProfile[0].email})`);
    console.log(`   User ID: ${chielId}\n`);

    // 1. Test Dashboard API
    console.log('1️⃣ Testing Dashboard API...');
    let dashboardData = null;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/dashboard-stats?userId=${chielId}`);
      const data = await response.json();
      dashboardData = data;
      
      if (response.ok && data.stats) {
        console.log('✅ Dashboard API Response:');
        console.log(`   - Academy Total Courses: ${data.stats.academy?.totalCourses || 0}`);
        console.log(`   - Academy Completed Courses: ${data.stats.academy?.completedCourses || 0}`);
        console.log(`   - Academy Progress: ${data.stats.academy?.progress || 0}%`);
        console.log(`   - Dashboard Card: ${data.stats.academy?.completedCourses || 0}/${data.stats.academy?.totalCourses || 0} modules`);
        
        if (data.stats.academy?.completedCourses === 7 && data.stats.academy?.totalCourses === 7) {
          console.log('   🎉 SUCCESS: Dashboard shows correct 7/7 modules!');
        } else {
          console.log('   ❌ FAILED: Dashboard shows incorrect data');
        }
      } else {
        console.error('❌ Dashboard API error:', data.error);
      }
    } catch (apiError) {
      console.error('❌ Dashboard API test failed:', apiError.message);
    }

    // 2. Check Database Data
    console.log('\n2️⃣ Checking Database Data...');
    
    // Check user_academy_progress
    const { data: progress, error: progressError } = await supabase
      .from('user_academy_progress')
      .select('*')
      .eq('user_id', chielId);

    if (progressError) {
      console.error('❌ Error fetching progress:', progressError);
    } else {
      const completedModules = progress?.filter(p => p.progress_percentage >= 100).length || 0;
      const totalModules = progress?.length || 0;
      console.log(`✅ user_academy_progress: ${completedModules}/${totalModules} modules completed`);
      
      if (completedModules === 7) {
        console.log('   🎉 SUCCESS: All 7 modules marked as completed!');
      } else {
        console.log('   ❌ FAILED: Not all modules are completed');
      }
    }

    // Check user_lesson_progress
    const { data: lessonProgress, error: lessonError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', chielId)
      .eq('completed', true);

    if (lessonError) {
      console.error('❌ Error fetching lesson progress:', lessonError);
    } else {
      console.log(`✅ user_lesson_progress: ${lessonProgress?.length || 0} lessons completed`);
      
      if (lessonProgress?.length === 36) {
        console.log('   🎉 SUCCESS: All 36 lessons completed!');
      } else {
        console.log('   ❌ FAILED: Not all lessons are completed');
      }
    }

    // 3. Check Academy Modules
    console.log('\n3️⃣ Checking Academy Modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
    } else {
      console.log(`✅ Total published modules: ${modules.length}`);
      modules.forEach((module, index) => {
        const moduleProgress = progress?.find(p => p.course_id === module.id);
        const progressPercent = moduleProgress?.progress_percentage || 0;
        console.log(`   ${index + 1}. ${module.title}: ${progressPercent}%`);
      });
    }

    // 4. Check Badges
    console.log('\n4️⃣ Checking Academy Badges...');
    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', chielId);

    if (badgesError) {
      console.error('❌ Error fetching badges:', badgesError);
    } else {
      console.log(`✅ Total badges: ${badges?.length || 0}`);
      badges?.forEach((badge, index) => {
        console.log(`   ${index + 1}. Badge ${badge.badge_id}: Unlocked ${badge.unlocked_at}`);
      });
    }

    // 5. Final Summary
    console.log('\n📊 FINAL VERIFICATION SUMMARY:');
    console.log('================================');
    
    const dashboardShowsCorrect = dashboardData?.stats?.academy?.completedCourses === 7 && dashboardData?.stats?.academy?.totalCourses === 7;
    const allModulesCompleted = progress?.filter(p => p.progress_percentage >= 100).length === 7;
    const allLessonsCompleted = lessonProgress?.length === 36;
    const hasBadges = badges?.length > 0;
    
    console.log(`   Dashboard Card: ${dashboardShowsCorrect ? '✅' : '❌'} Shows 7/7 modules`);
    console.log(`   Database Modules: ${allModulesCompleted ? '✅' : '❌'} All 7 modules completed`);
    console.log(`   Database Lessons: ${allLessonsCompleted ? '✅' : '❌'} All 36 lessons completed`);
    console.log(`   Academy Badges: ${hasBadges ? '✅' : '❌'} Badges unlocked`);
    
    if (dashboardShowsCorrect && allModulesCompleted && allLessonsCompleted && hasBadges) {
      console.log('\n🎉 ALL TESTS PASSED! Academy completion is fully synchronized!');
    } else {
      console.log('\n❌ Some tests failed. Academy completion needs attention.');
    }

  } catch (error) {
    console.error('❌ Error in verification:', error);
  }
}

verifyAcademyFix();
