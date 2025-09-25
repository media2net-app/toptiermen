const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkRickAcademyProgress() {
  try {
    console.log('🔍 Checking Rick\'s Academy progress...\n');

    // Find Rick's user ID from profiles table
    const { data: rickProfile, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'rick@toptiermen.eu')
      .single();
    
    if (userError || !rickProfile) {
      console.error('❌ Error finding Rick:', userError?.message || 'User not found');
      return;
    }
    
    const rickUserId = rickProfile.id;
    console.log('👤 Found Rick:', rickProfile.email, rickUserId);

    // Check academy_lesson_completions
    const { data: lessonCompletions, error: lessonError } = await supabase
      .from('academy_lesson_completions')
      .select('*')
      .eq('user_id', rickUserId);

    if (lessonError) {
      console.error('❌ Error fetching lesson completions:', lessonError.message);
    } else {
      console.log(`\n📚 Lesson Completions: ${lessonCompletions?.length || 0}`);
      if (lessonCompletions && lessonCompletions.length > 0) {
        console.log('   Sample completions:');
        lessonCompletions.slice(0, 3).forEach(completion => {
          console.log(`   - Lesson ID: ${completion.lesson_id}, Score: ${completion.score}, Completed: ${completion.completed_at}`);
        });
      }
    }

    // Check academy_module_completions
    const { data: moduleCompletions, error: moduleError } = await supabase
      .from('academy_module_completions')
      .select('*')
      .eq('user_id', rickUserId);

    if (moduleError) {
      console.error('❌ Error fetching module completions:', moduleError.message);
    } else {
      console.log(`\n🎯 Module Completions: ${moduleCompletions?.length || 0}`);
      if (moduleCompletions && moduleCompletions.length > 0) {
        console.log('   Module completions:');
        moduleCompletions.forEach(completion => {
          console.log(`   - Module ID: ${completion.module_id}, Completed: ${completion.completed_lessons}/${completion.total_lessons} lessons`);
        });
      }
    }

    // Get all academy modules to show progress
    const { data: allModules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title, positie')
      .order('positie');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError.message);
    } else {
      console.log(`\n📖 Total Academy Modules: ${allModules?.length || 0}`);
      if (allModules && allModules.length > 0) {
        console.log('   Available modules:');
        allModules.forEach(module => {
          console.log(`   - ${module.positie}. ${module.title} (ID: ${module.id})`);
        });
      }
    }

    // Get all academy lessons to show progress
    const { data: allLessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('id, title, module_id, order_index')
      .order('module_id, order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError.message);
    } else {
      console.log(`\n📝 Total Academy Lessons: ${allLessons?.length || 0}`);
    }

    // Check if Rick has access to academy modules
    console.log('\n🔓 Checking module access...');
    if (allModules && moduleCompletions) {
      allModules.forEach(module => {
        const isCompleted = moduleCompletions.some(completion => completion.module_id === module.id);
        const status = isCompleted ? '✅ COMPLETED' : '🔒 LOCKED';
        console.log(`   ${module.positie}. ${module.title}: ${status}`);
      });
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   - Total modules: ${allModules?.length || 0}`);
    console.log(`   - Completed modules: ${moduleCompletions?.length || 0}`);
    console.log(`   - Total lessons: ${allLessons?.length || 0}`);
    console.log(`   - Completed lessons: ${lessonCompletions?.length || 0}`);
    
    const completionRate = allLessons?.length > 0 ? Math.round(((lessonCompletions?.length || 0) / allLessons.length) * 100) : 0;
    console.log(`   - Completion rate: ${completionRate}%`);

    if (completionRate === 100) {
      console.log('\n🎉 SUCCESS: Rick has completed ALL Academy lessons and modules!');
    } else if (completionRate > 0) {
      console.log(`\n⚠️  PARTIAL: Rick has completed ${completionRate}% of Academy content`);
    } else {
      console.log('\n❌ ISSUE: Rick has not completed any Academy content');
    }

  } catch (error) {
    console.error('❌ Error checking Rick\'s Academy progress:', error);
  }
}

checkRickAcademyProgress();
