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
    const userId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'; // Rick's user ID
    
    console.log('🚀 Completing all Academy lessons for Rick...');
    
    // First, let's check if the tables exist by trying to insert
    console.log('🔍 Checking if academy_lesson_completions table exists...');
    
    // Get all lessons
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
    
    // Try to complete each lesson
    let completedCount = 0;
    for (const lesson of lessons) {
      try {
        const { error: insertError } = await supabase
          .from('academy_lesson_completions')
          .insert({
            user_id: userId,
            lesson_id: lesson.id,
            completed_at: new Date().toISOString(),
            score: 100,
            time_spent: 300 // 5 minutes per lesson
          });
        
        if (insertError) {
          console.log(`⚠️  Lesson ${lesson.title}: ${insertError.message}`);
        } else {
          console.log(`✅ Completed: ${lesson.title}`);
          completedCount++;
        }
      } catch (error) {
        console.log(`❌ Error with lesson ${lesson.title}:`, error.message);
      }
    }
    
    console.log(`🎉 Completed ${completedCount} out of ${lessons.length} lessons for Rick!`);
    
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
    
    for (const module of modules) {
      try {
        // Count lessons in this module
        const { count: lessonCount } = await supabase
          .from('academy_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('module_id', module.id);
        
        const { error: moduleError } = await supabase
          .from('academy_module_completions')
          .insert({
            user_id: userId,
            module_id: module.id,
            completed_at: new Date().toISOString(),
            total_lessons: lessonCount || 0,
            completed_lessons: lessonCount || 0
          });
        
        if (moduleError) {
          console.log(`⚠️  Module ${module.title}: ${moduleError.message}`);
        } else {
          console.log(`✅ Completed module: ${module.title}`);
        }
      } catch (error) {
        console.log(`❌ Error with module ${module.title}:`, error.message);
      }
    }
    
    console.log('🎉 Academy completion process finished!');
    
  } catch (error) {
    console.error('❌ Error completing Academy:', error);
  }
}

completeRickAcademy();
