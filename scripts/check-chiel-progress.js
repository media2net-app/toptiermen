const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkChielProgress() {
  try {
    console.log('🔍 Checking Chiel\'s progress...\n');

    // 1. Find Chiel's user account
    console.log('1️⃣ Finding Chiel\'s user account...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, created_at')
      .ilike('email', '%chiel%');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ No users found with "chiel" in email');
      return;
    }

    console.log(`✅ Found ${users.length} user(s) with "chiel" in email:`);
    users.forEach(user => {
      console.log(`   - ID: ${user.id}, Email: ${user.email}, Created: ${user.created_at}`);
    });

    const chiel = users[0]; // Use first match
    console.log(`\n🎯 Using user: ${chiel.email} (ID: ${chiel.id})\n`);

    // 2. Check lesson progress
    console.log('2️⃣ Checking lesson progress...');
    const { data: lessonProgress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select(`
        lesson_id,
        completed,
        completed_at,
        academy_lessons!inner(
          id,
          title,
          order_index,
          module_id,
          academy_modules!inner(
            id,
            title,
            slug
          )
        )
      `)
      .eq('user_id', chiel.id);

    if (progressError) {
      console.error('❌ Error fetching lesson progress:', progressError);
      return;
    }

    console.log(`✅ Found ${lessonProgress?.length || 0} lesson progress records:`);
    if (lessonProgress && lessonProgress.length > 0) {
      lessonProgress.forEach(progress => {
        const lesson = progress.academy_lessons;
        const module = lesson.academy_modules;
        console.log(`   ✅ ${module.title} - ${lesson.title} (${progress.completed ? 'COMPLETED' : 'NOT COMPLETED'})`);
        if (progress.completed_at) {
          console.log(`      Completed at: ${progress.completed_at}`);
        }
      });
    } else {
      console.log('   ❌ No lesson progress found');
    }

    // 3. Check all modules and lessons
    console.log('\n3️⃣ Checking all modules and lessons...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select(`
        id,
        title,
        slug,
        order_index,
        academy_lessons(
          id,
          title,
          order_index,
          status
        )
      `)
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} modules:`);
    modules?.forEach(module => {
      const lessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      console.log(`\n   📚 ${module.title} (${module.slug})`);
      console.log(`      Lessons: ${lessons.length}`);
      
      // Check progress for this module
      const moduleProgress = lessonProgress?.filter(p => 
        p.academy_lessons.module_id === module.id && p.completed
      ) || [];
      
      console.log(`      Completed: ${moduleProgress.length}/${lessons.length}`);
      
      lessons.forEach(lesson => {
        const isCompleted = lessonProgress?.some(p => 
          p.lesson_id === lesson.id && p.completed
        );
        console.log(`         ${isCompleted ? '✅' : '❌'} ${lesson.title}`);
      });
    });

    // 4. Check if there are any issues with the progress calculation
    console.log('\n4️⃣ Analyzing progress calculation...');
    
    const totalLessons = modules?.reduce((total, module) => {
      const lessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      return total + lessons.length;
    }, 0) || 0;
    
    const completedLessons = lessonProgress?.filter(p => p.completed).length || 0;
    
    console.log(`📊 Progress Summary:`);
    console.log(`   Total lessons: ${totalLessons}`);
    console.log(`   Completed lessons: ${completedLessons}`);
    console.log(`   Completion rate: ${totalLessons > 0 ? ((completedLessons / totalLessons) * 100).toFixed(1) : 0}%`);

    // 5. Check for any missing progress records
    console.log('\n5️⃣ Checking for missing progress records...');
    const allLessonIds = modules?.flatMap(module => 
      module.academy_lessons?.filter(l => l.status === 'published').map(l => l.id) || []
    ) || [];
    
    const progressLessonIds = lessonProgress?.map(p => p.lesson_id) || [];
    const missingProgress = allLessonIds.filter(id => !progressLessonIds.includes(id));
    
    if (missingProgress.length > 0) {
      console.log(`⚠️ Found ${missingProgress.length} lessons without progress records:`);
      missingProgress.forEach(lessonId => {
        const module = modules?.find(m => 
          m.academy_lessons?.some(l => l.id === lessonId)
        );
        const lesson = module?.academy_lessons?.find(l => l.id === lessonId);
        console.log(`   - ${module?.title} - ${lesson?.title} (ID: ${lessonId})`);
      });
    } else {
      console.log('✅ All lessons have progress records');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkChielProgress();
