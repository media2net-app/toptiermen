const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function completeAllAcademyLessons() {
  console.log('🎓 Completing all Academy lessons for rick@toptiermen.eu...\n');
  
  try {
    // First, get the user ID from profiles table
    console.log('🔍 Finding user ID for rick@toptiermen.eu...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'rick@toptiermen.eu')
      .single();
    
    if (profileError || !profile) {
      console.log('❌ User profile not found:', profileError?.message || 'No profile found');
      return;
    }
    
    const userId = profile.id;
    console.log('✅ User ID found:', userId);
    
    // Get all lessons from all modules
    console.log('\n📚 Fetching all Academy lessons...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        lesson_number,
        module_id,
        academy_modules (
          id,
          title
        )
      `)
      .order('module_id, lesson_number');
    
    if (lessonsError) {
      console.log('❌ Error fetching lessons:', lessonsError.message);
      return;
    }
    
    console.log(`✅ Found ${lessons?.length || 0} lessons across all modules`);
    
    // Complete each lesson
    console.log('\n🎯 Completing all lessons...');
    let completedCount = 0;
    
    for (const lesson of lessons || []) {
      console.log(`📖 Completing: ${lesson.academy_modules?.title} - ${lesson.title}`);
      
      // Check if lesson is already completed
      const { data: existingCompletion, error: checkError } = await supabase
        .from('academy_lesson_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lesson.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.log(`❌ Error checking completion for lesson ${lesson.id}:`, checkError.message);
        continue;
      }
      
      if (existingCompletion) {
        console.log(`⏭️  Lesson already completed, skipping...`);
        continue;
      }
      
      // Mark lesson as completed
      const { error: completionError } = await supabase
        .from('academy_lesson_completions')
        .insert({
          user_id: userId,
          lesson_id: lesson.id,
          completed_at: new Date().toISOString(),
          completion_percentage: 100,
          time_spent_minutes: 15, // Default 15 minutes per lesson
          notes: 'Automatically completed for admin user'
        });
      
      if (completionError) {
        console.log(`❌ Error completing lesson ${lesson.id}:`, completionError.message);
      } else {
        console.log(`✅ Completed: ${lesson.title}`);
        completedCount++;
      }
    }
    
    // Update module completions
    console.log('\n📊 Updating module completions...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title')
      .order('id');
    
    if (modulesError) {
      console.log('❌ Error fetching modules:', modulesError.message);
    } else {
      for (const module of modules || []) {
        // Check if module is already completed
        const { data: existingModuleCompletion, error: checkModuleError } = await supabase
          .from('academy_module_completions')
          .select('id')
          .eq('user_id', userId)
          .eq('module_id', module.id)
          .single();
        
        if (checkModuleError && checkModuleError.code !== 'PGRST116') {
          console.log(`❌ Error checking module completion for ${module.title}:`, checkModuleError.message);
          continue;
        }
        
        if (existingModuleCompletion) {
          console.log(`⏭️  Module ${module.title} already completed, skipping...`);
          continue;
        }
        
        // Mark module as completed
        const { error: moduleCompletionError } = await supabase
          .from('academy_module_completions')
          .insert({
            user_id: userId,
            module_id: module.id,
            completed_at: new Date().toISOString(),
            completion_percentage: 100,
            time_spent_minutes: 90, // Default 90 minutes per module
            notes: 'Automatically completed for admin user'
          });
        
        if (moduleCompletionError) {
          console.log(`❌ Error completing module ${module.title}:`, moduleCompletionError.message);
        } else {
          console.log(`✅ Module completed: ${module.title}`);
        }
      }
    }
    
    console.log(`\n🎉 SUCCESS! Completed ${completedCount} lessons for rick@toptiermen.eu`);
    console.log('📚 All Academy lessons and modules are now marked as completed!');
    
  } catch (error) {
    console.error('❌ Error completing Academy lessons:', error.message);
  }
}

completeAllAcademyLessons();
