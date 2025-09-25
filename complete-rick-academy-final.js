const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function completeRickAcademy() {
  try {
    const rickUserId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'; // Rick's user ID
    
    console.log('🚀 Completing all Academy lessons and modules for Rick...');
    
    // First, get all lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('id, title, module_id')
      .order('module_id', { ascending: true })
      .order('order_index', { ascending: true });
    
    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError.message);
      return;
    }
    
    console.log(`📚 Found ${lessons.length} lessons to complete`);
    
    // Complete each lesson
    let completedLessons = 0;
    for (const lesson of lessons) {
      try {
        const { error: insertError } = await supabase
          .from('academy_lesson_completions')
          .upsert({
            user_id: rickUserId,
            lesson_id: lesson.id,
            completed_at: new Date().toISOString(),
            score: 100,
            time_spent: 300 // 5 minutes per lesson
          });
        
        if (insertError) {
          console.error(`❌ Error completing lesson ${lesson.title}:`, insertError.message);
        } else {
          console.log(`✅ Completed lesson: ${lesson.title}`);
          completedLessons++;
        }
      } catch (error) {
        console.error(`❌ Error with lesson ${lesson.title}:`, error.message);
      }
    }
    
    console.log(`🎉 Completed ${completedLessons} out of ${lessons.length} lessons for Rick!`);
    
    // Now complete modules
    console.log('🔍 Completing modules...');
    
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title')
      .order('positie', { ascending: true });
    
    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError.message);
      return;
    }
    
    let completedModules = 0;
    for (const module of modules) {
      try {
        // Count lessons in this module
        const { count: lessonCount } = await supabase
          .from('academy_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('module_id', module.id);
        
        const { error: moduleError } = await supabase
          .from('academy_module_completions')
          .upsert({
            user_id: rickUserId,
            module_id: module.id,
            completed_at: new Date().toISOString(),
            total_lessons: lessonCount || 0,
            completed_lessons: lessonCount || 0
          });
        
        if (moduleError) {
          console.error(`❌ Error completing module ${module.title}:`, moduleError.message);
        } else {
          console.log(`✅ Completed module: ${module.title} (${lessonCount} lessons)`);
          completedModules++;
        }
      } catch (error) {
        console.error(`❌ Error with module ${module.title}:`, error.message);
      }
    }
    
    console.log(`🎉 Completed ${completedModules} out of ${modules.length} modules for Rick!`);
    
    // Verify completion
    console.log('\n🔍 Verifying completion...');
    
    const { data: lessonCompletions, error: lessonCompletionsError } = await supabase
      .from('academy_lesson_completions')
      .select('*')
      .eq('user_id', rickUserId);
    
    if (lessonCompletionsError) {
      console.error('❌ Error verifying lesson completions:', lessonCompletionsError.message);
    } else {
      console.log(`✅ Rick has completed ${lessonCompletions?.length || 0} lessons`);
    }
    
    const { data: moduleCompletions, error: moduleCompletionsError } = await supabase
      .from('academy_module_completions')
      .select('*')
      .eq('user_id', rickUserId);
    
    if (moduleCompletionsError) {
      console.error('❌ Error verifying module completions:', moduleCompletionsError.message);
    } else {
      console.log(`✅ Rick has completed ${moduleCompletions?.length || 0} modules`);
    }
    
    console.log('\n🎉 Academy completion process finished for Rick!');
    
  } catch (error) {
    console.error('❌ Error completing Academy:', error);
  }
}

completeRickAcademy();
