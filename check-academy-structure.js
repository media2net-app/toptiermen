const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAcademyStructure() {
  console.log('🔍 Checking Academy table structure...\n');
  
  try {
    // Check academy_lessons structure
    console.log('Checking academy_lessons...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('*')
      .limit(1);
    
    if (lessonsError) {
      console.log('❌ academy_lessons error:', lessonsError.message);
    } else {
      console.log('✅ academy_lessons accessible');
      if (lessons && lessons.length > 0) {
        console.log('📋 Sample lesson columns:', Object.keys(lessons[0]));
      }
    }
    
    // Check academy_modules structure
    console.log('\nChecking academy_modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .limit(1);
    
    if (modulesError) {
      console.log('❌ academy_modules error:', modulesError.message);
    } else {
      console.log('✅ academy_modules accessible');
      if (modules && modules.length > 0) {
        console.log('📋 Sample module columns:', Object.keys(modules[0]));
      }
    }
    
    // Check academy_lesson_completions structure
    console.log('\nChecking academy_lesson_completions...');
    const { data: completions, error: completionsError } = await supabase
      .from('academy_lesson_completions')
      .select('*')
      .limit(1);
    
    if (completionsError) {
      console.log('❌ academy_lesson_completions error:', completionsError.message);
    } else {
      console.log('✅ academy_lesson_completions accessible');
      if (completions && completions.length > 0) {
        console.log('📋 Sample completion columns:', Object.keys(completions[0]));
      }
    }
    
    // Get all lessons count
    console.log('\n📊 Getting lesson counts...');
    const { count: lessonCount, error: lessonCountError } = await supabase
      .from('academy_lessons')
      .select('*', { count: 'exact', head: true });
    
    if (lessonCountError) {
      console.log('❌ Error counting lessons:', lessonCountError.message);
    } else {
      console.log(`📚 Total lessons: ${lessonCount}`);
    }
    
    // Get all modules count
    const { count: moduleCount, error: moduleCountError } = await supabase
      .from('academy_modules')
      .select('*', { count: 'exact', head: true });
    
    if (moduleCountError) {
      console.log('❌ Error counting modules:', moduleCountError.message);
    } else {
      console.log(`📚 Total modules: ${moduleCount}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAcademyStructure();
