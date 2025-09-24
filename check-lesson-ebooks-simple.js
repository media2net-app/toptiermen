const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLessonEbooks() {
  console.log('🔍 CHECKING LESSON EBOOK LINKS...');
  console.log('📋 This will show the actual ebook URLs behind each lesson button');
  console.log('');
  
  try {
    // Get all modules first
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`📊 Found ${modules.length} modules`);
    console.log('');

    for (const module of modules) {
      console.log(`📚 MODULE ${module.order_index}: ${module.title}`);
      console.log(`🆔 Module ID: ${module.id}`);
      console.log('');

      // Get lessons for this module
      const { data: lessons, error: lessonsError } = await supabase
        .from('academy_lessons')
        .select('*')
        .eq('module_id', module.id)
        .order('order_index');

      if (lessonsError) {
        console.error(`❌ Error fetching lessons for module ${module.title}:`, lessonsError);
        continue;
      }

      console.log(`📖 Lessons: ${lessons.length}`);
      console.log('');

      for (const lesson of lessons) {
        console.log(`  📝 LESSON ${lesson.order_index}: ${lesson.title}`);
        console.log(`  🆔 Lesson ID: ${lesson.id}`);
        
        // Get ebooks for this lesson
        const { data: ebooks, error: ebooksError } = await supabase
          .from('academy_ebooks')
          .select('*')
          .eq('lesson_id', lesson.id);

        if (ebooksError) {
          console.log(`  ❌ Error fetching ebooks: ${ebooksError.message}`);
        } else if (ebooks && ebooks.length > 0) {
          for (const ebook of ebooks) {
            console.log(`  📖 Ebook: ${ebook.title}`);
            console.log(`  🔗 File URL: ${ebook.file_url}`);
            console.log(`  📁 Path: ${ebook.path}`);
            console.log(`  📊 Status: ${ebook.status}`);
            console.log(`  🌐 Full URL: https://platform.toptiermen.eu${ebook.path}`);
            console.log('');
          }
        } else {
          console.log(`  ❌ No ebook found for this lesson`);
          console.log('');
        }
      }
      
      console.log('---');
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkLessonEbooks();
