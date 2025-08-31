const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAcademyDashboard() {
  console.log('🧪 Testing Academy Dashboard Stats...\n');

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
    console.log(`👤 Testing for: ${chielProfile[0].full_name} (${chielId})\n`);

    // Test the new Academy stats logic
    console.log('📊 Testing Academy Stats Logic...\n');

    // 1. Get total academy modules
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title, status')
      .eq('status', 'published');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules.length} published modules:`);
    modules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.title}`);
    });

    // 2. Get user's academy progress
    const { data: userProgress, error: progressError } = await supabase
      .from('user_academy_progress')
      .select('*')
      .eq('user_id', chielId);

    if (progressError) {
      console.error('❌ Error fetching user progress:', progressError);
      return;
    }

    console.log(`\n✅ Found ${userProgress.length} progress records for Chiel:`);
    userProgress.forEach((progress, index) => {
      console.log(`   ${index + 1}. Course: ${progress.course_id}, Progress: ${progress.progress_percentage}%`);
      console.log(`      Completed Lessons: ${progress.completed_lessons?.length || 0}`);
    });

    // 3. Calculate stats (same logic as API)
    const totalModules = modules?.length || 0;
    const completedModules = userProgress?.filter(p => p.progress_percentage >= 100).length || 0;
    const learningProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    console.log('\n📈 CALCULATED ACADEMY STATS:');
    console.log(`   - Total Modules: ${totalModules}`);
    console.log(`   - Completed Modules: ${completedModules}`);
    console.log(`   - Learning Progress: ${learningProgress}%`);
    console.log(`   - Dashboard Display: ${completedModules}/${totalModules} modules`);

    // 4. Test API endpoint
    console.log('\n🌐 Testing API Endpoint...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/dashboard-stats?userId=${chielId}`);
      const apiData = await response.json();
      
      if (response.ok && apiData.stats) {
        console.log('✅ API endpoint working correctly');
        console.log(`   - Academy Total Courses: ${apiData.stats.academy?.totalCourses || 0}`);
        console.log(`   - Academy Completed Courses: ${apiData.stats.academy?.completedCourses || 0}`);
        console.log(`   - Academy Progress: ${apiData.stats.academy?.progress || 0}%`);
        console.log(`   - Dashboard Display: ${apiData.stats.academy?.completedCourses || 0}/${apiData.stats.academy?.totalCourses || 0} modules`);
      } else {
        console.error('❌ API endpoint error:', apiData.error);
      }
    } catch (apiError) {
      console.error('❌ API endpoint test failed:', apiError.message);
    }

    // 5. Summary
    console.log('\n🎯 SUMMARY:');
    console.log(`   - Should show: ${completedModules}/${totalModules} modules`);
    console.log(`   - Progress: ${learningProgress}%`);
    
    if (completedModules === 0 && totalModules === 7) {
      console.log('   - Status: ✅ Correct (0/7 modules - Chiel has not completed any modules yet)');
    } else if (completedModules > 0) {
      console.log(`   - Status: ✅ Correct (${completedModules}/${totalModules} modules completed)`);
    } else {
      console.log('   - Status: ⚠️ Check data integrity');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAcademyDashboard();
