const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixChielAcademyCompletion() {
  console.log('🔧 Fixing Chiel Academy Completion...\n');

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
    console.log(`👤 Found Chiel: ${chielProfile[0].full_name} (${chielProfile[0].email})`);
    console.log(`   User ID: ${chielId}\n`);

    // 1. Get all academy modules
    console.log('1️⃣ Getting all academy modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules.length} modules`);

    // 2. Get Chiel's lesson progress
    console.log('\n2️⃣ Getting Chiel\'s lesson progress...');
    const { data: lessonProgress, error: lessonProgressError } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', chielId)
      .eq('completed', true);

    if (lessonProgressError) {
      console.error('❌ Error fetching lesson progress:', lessonProgressError);
      return;
    }

    console.log(`✅ Found ${lessonProgress?.length || 0} completed lessons`);

    // Get lesson details separately
    const lessonIds = lessonProgress?.map(p => p.lesson_id) || [];
    const { data: lessonDetails, error: lessonDetailsError } = await supabase
      .from('academy_lessons')
      .select('id, module_id, title')
      .in('id', lessonIds);

    if (lessonDetailsError) {
      console.error('❌ Error fetching lesson details:', lessonDetailsError);
      return;
    }

    // Create a map of lesson_id to lesson details
    const lessonDetailsMap = {};
    lessonDetails?.forEach(lesson => {
      lessonDetailsMap[lesson.id] = lesson;
    });

    if (lessonProgressError) {
      console.error('❌ Error fetching lesson progress:', lessonProgressError);
      return;
    }

    console.log(`✅ Found ${lessonProgress?.length || 0} completed lessons`);

    // 3. Calculate which modules are completed
    console.log('\n3️⃣ Calculating completed modules...');
    const completedModules = new Set();
    const moduleProgress = {};

    lessonProgress?.forEach(progress => {
      const lessonDetail = lessonDetailsMap[progress.lesson_id];
      if (lessonDetail?.module_id) {
        completedModules.add(lessonDetail.module_id);
        
        if (!moduleProgress[lessonDetail.module_id]) {
          moduleProgress[lessonDetail.module_id] = 0;
        }
        moduleProgress[lessonDetail.module_id]++;
      }
    });

    console.log(`✅ Completed modules: ${completedModules.size}/${modules.length}`);

    // 4. Get total lessons per module
    console.log('\n4️⃣ Getting total lessons per module...');
    const { data: allLessons, error: allLessonsError } = await supabase
      .from('academy_lessons')
      .select('id, module_id')
      .order('module_id, order_index');

    if (allLessonsError) {
      console.error('❌ Error fetching all lessons:', allLessonsError);
      return;
    }

    const lessonsPerModule = {};
    allLessons?.forEach(lesson => {
      if (!lessonsPerModule[lesson.module_id]) {
        lessonsPerModule[lesson.module_id] = 0;
      }
      lessonsPerModule[lesson.module_id]++;
    });

    console.log('✅ Lessons per module calculated');

    // 5. Update user_academy_progress for all modules
    console.log('\n5️⃣ Updating user_academy_progress...');
    
    for (const module of modules) {
      const completedLessons = moduleProgress[module.id] || 0;
      const totalLessons = lessonsPerModule[module.id] || 0;
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      console.log(`   Module: ${module.title} - ${completedLessons}/${totalLessons} lessons (${progressPercentage}%)`);
      
      // Get completed lessons for this module
      const moduleCompletedLessons = lessonProgress?.filter(p => {
        const lessonDetail = lessonDetailsMap[p.lesson_id];
        return lessonDetail?.module_id === module.id;
      }).map(p => p.lesson_id) || [];

      // Upsert the progress record
      const { error: upsertError } = await supabase
        .from('user_academy_progress')
        .upsert({
          user_id: chielId,
          course_id: module.id,
          progress_percentage: progressPercentage,
          completed_lessons: moduleCompletedLessons,
          last_accessed: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,course_id'
        });

      if (upsertError) {
        console.error(`   ❌ Error updating module ${module.title}:`, upsertError);
      } else {
        console.log(`   ✅ Updated module ${module.title}`);
      }
    }

    // 6. Verify the fix
    console.log('\n6️⃣ Verifying the fix...');
    const { data: updatedProgress, error: verifyError } = await supabase
      .from('user_academy_progress')
      .select('*')
      .eq('user_id', chielId);

    if (verifyError) {
      console.error('❌ Error verifying progress:', verifyError);
    } else {
      console.log(`✅ Verification: ${updatedProgress?.length || 0} progress records found`);
      updatedProgress?.forEach(progress => {
        console.log(`   - ${progress.course_id}: ${progress.progress_percentage}%`);
      });
    }

    // 7. Test the dashboard API
    console.log('\n7️⃣ Testing dashboard API...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/dashboard-stats?userId=${chielId}`);
      const data = await response.json();
      
      if (response.ok && data.stats) {
        console.log('✅ Dashboard API Response:');
        console.log(`   - Academy Total Courses: ${data.stats.academy?.totalCourses || 0}`);
        console.log(`   - Academy Completed Courses: ${data.stats.academy?.completedCourses || 0}`);
        console.log(`   - Academy Progress: ${data.stats.academy?.progress || 0}%`);
        console.log(`   - Should show: ${data.stats.academy?.completedCourses || 0}/${data.stats.academy?.totalCourses || 0} modules`);
      } else {
        console.error('❌ Dashboard API error:', data.error);
      }
    } catch (apiError) {
      console.error('❌ Dashboard API test failed:', apiError.message);
    }

    console.log('\n🎯 SUMMARY:');
    console.log(`   - Chiel has completed ${completedModules.size}/${modules.length} modules`);
    console.log(`   - All progress records updated in user_academy_progress`);
    console.log(`   - Dashboard should now show ${completedModules.size}/${modules.length} modules`);
    console.log(`   - Academy completion should be 100%`);

  } catch (error) {
    console.error('❌ Error in fix:', error);
  }
}

fixChielAcademyCompletion();
