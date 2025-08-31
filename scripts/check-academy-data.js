const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAcademyData() {
  console.log('🔍 Checking Academy Data for Chiel...\n');

  try {
    // First, find Chiel's user ID
    console.log('👤 Finding Chiel\'s user ID...');
    const { data: chielProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .or('full_name.ilike.%chiel%,email.ilike.%chiel%')
      .limit(1);

    if (profileError) {
      console.error('❌ Error finding Chiel:', profileError);
      return;
    }

    if (!chielProfile || chielProfile.length === 0) {
      console.error('❌ Chiel not found in profiles');
      return;
    }

    const chielId = chielProfile[0].id;
    console.log(`✅ Found Chiel: ${chielProfile[0].full_name} (${chielProfile[0].email})`);
    console.log(`   User ID: ${chielId}\n`);

    // Check Academy tables
    console.log('📚 Checking Academy Tables...\n');

    // 1. Check academy_modules
    console.log('1️⃣ Checking academy_modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching academy_modules:', modulesError);
    } else {
      console.log(`✅ Found ${modules.length} academy modules:`);
      modules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.title} (Order: ${module.order_index}, Lessons: ${module.lessons_count})`);
      });
    }

    // 2. Check academy_lessons
    console.log('\n2️⃣ Checking academy_lessons...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('*')
      .order('module_id, order_index');

    if (lessonsError) {
      console.error('❌ Error fetching academy_lessons:', lessonsError);
    } else {
      console.log(`✅ Found ${lessons.length} academy lessons:`);
      lessons.forEach((lesson, index) => {
        console.log(`   ${index + 1}. ${lesson.title} (Module: ${lesson.module_id}, Order: ${lesson.order_index})`);
      });
    }

    // 3. Check user_academy_progress for Chiel
    console.log('\n3️⃣ Checking user_academy_progress for Chiel...');
    const { data: userProgress, error: progressError } = await supabase
      .from('user_academy_progress')
      .select('*')
      .eq('user_id', chielId);

    if (progressError) {
      console.error('❌ Error fetching user_academy_progress:', progressError);
    } else {
      console.log(`✅ Found ${userProgress.length} progress records for Chiel:`);
      userProgress.forEach((progress, index) => {
        console.log(`   ${index + 1}. Module: ${progress.module_id}, Progress: ${progress.progress_percentage}%`);
      });
    }

    // 4. Check user_lesson_completions for Chiel
    console.log('\n4️⃣ Checking user_lesson_completions for Chiel...');
    const { data: lessonCompletions, error: completionsError } = await supabase
      .from('user_academy_lesson_completions')
      .select('*')
      .eq('user_id', chielId);

    if (completionsError) {
      console.error('❌ Error fetching user_lesson_completions:', completionsError);
    } else {
      console.log(`✅ Found ${lessonCompletions.length} lesson completions for Chiel:`);
      lessonCompletions.forEach((completion, index) => {
        console.log(`   ${index + 1}. Lesson: ${completion.lesson_id}, Completed: ${completion.completed_at}`);
      });
    }

    // 5. Check book_reviews for Chiel (current dashboard logic)
    console.log('\n5️⃣ Checking book_reviews for Chiel (current dashboard logic)...');
    const { data: bookReviews, error: booksError } = await supabase
      .from('book_reviews')
      .select('*')
      .eq('user_id', chielId);

    if (booksError) {
      console.error('❌ Error fetching book_reviews:', booksError);
    } else {
      console.log(`✅ Found ${bookReviews.length} book reviews for Chiel:`);
      bookReviews.forEach((review, index) => {
        console.log(`   ${index + 1}. Book: ${review.book_title}, Rating: ${review.rating}/5`);
      });
    }

    // 6. Check user_mission_logs for Chiel (current dashboard logic)
    console.log('\n6️⃣ Checking user_mission_logs for Chiel (current dashboard logic)...');
    const { data: missionLogs, error: missionsError } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', chielId);

    if (missionsError) {
      console.error('❌ Error fetching user_mission_logs:', missionsError);
    } else {
      console.log(`✅ Found ${missionLogs.length} mission logs for Chiel:`);
      missionLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. Mission: ${log.mission_id}, Completed: ${log.completed_at}`);
      });
    }

    // Calculate what the dashboard should show
    console.log('\n📊 DASHBOARD CALCULATION ANALYSIS:');
    
    const totalModules = modules?.length || 0;
    const completedModules = userProgress?.filter(p => p.progress_percentage >= 100).length || 0;
    const totalLessons = lessons?.length || 0;
    const completedLessons = lessonCompletions?.length || 0;
    
    // Current dashboard logic (incorrect)
    const currentTotalCourses = Math.max(bookReviews?.length || 0, 1);
    const currentCompletedCourses = Math.min(Math.round((bookReviews?.length || 0) / 2), currentTotalCourses);
    
    console.log(`\n🎯 CURRENT DASHBOARD LOGIC (INCORRECT):`);
    console.log(`   - Total Courses: ${currentTotalCourses} (based on book_reviews)`);
    console.log(`   - Completed Courses: ${currentCompletedCourses} (book_reviews / 2)`);
    console.log(`   - Shows: ${currentCompletedCourses}/${currentTotalCourses} cursussen`);
    
    console.log(`\n✅ CORRECT ACADEMY DATA:`);
    console.log(`   - Total Modules: ${totalModules}`);
    console.log(`   - Completed Modules: ${completedModules}`);
    console.log(`   - Total Lessons: ${totalLessons}`);
    console.log(`   - Completed Lessons: ${completedLessons}`);
    console.log(`   - Should show: ${completedModules}/${totalModules} modules`);
    
    console.log(`\n🔧 RECOMMENDATION:`);
    console.log(`   - Update fetchAcademyStats() to use academy data instead of book_reviews`);
    console.log(`   - Use user_academy_progress for module completion`);
    console.log(`   - Use user_lesson_completions for lesson completion`);

  } catch (error) {
    console.error('❌ Error checking academy data:', error);
  }
}

checkAcademyData();
