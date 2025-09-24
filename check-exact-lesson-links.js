const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkExactLessonLinks() {
  console.log('🔍 CHECKING EXACT LESSON LINKS PER MODULE...');
  console.log('📋 This will show the actual ebook URLs behind each lesson button');
  console.log('');
  
  try {
    // Get all modules with their lessons and ebook links
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select(`
        id,
        title,
        order_index,
        academy_lessons!inner(
          id,
          title,
          order_index,
          academy_ebooks!inner(
            id,
            title,
            file_url,
            path,
            status
          )
        )
      `)
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
      console.log(`📖 Lessons: ${module.academy_lessons.length}`);
      console.log('');

      for (const lesson of module.academy_lessons) {
        console.log(`  📝 LESSON ${lesson.order_index}: ${lesson.title}`);
        console.log(`  🆔 Lesson ID: ${lesson.id}`);
        
        if (lesson.academy_ebooks && lesson.academy_ebooks.length > 0) {
          for (const ebook of lesson.academy_ebooks) {
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
    
    // Summary
    let totalLessons = 0;
    let totalEbooks = 0;
    let ebooksWithLinks = 0;
    
    for (const module of modules) {
      totalLessons += module.academy_lessons.length;
      for (const lesson of module.academy_lessons) {
        if (lesson.academy_ebooks && lesson.academy_ebooks.length > 0) {
          totalEbooks += lesson.academy_ebooks.length;
          for (const ebook of lesson.academy_ebooks) {
            if (ebook.file_url || ebook.path) {
              ebooksWithLinks++;
            }
          }
        }
      }
    }
    
    console.log('📊 SUMMARY:');
    console.log(`• Total modules: ${modules.length}`);
    console.log(`• Total lessons: ${totalLessons}`);
    console.log(`• Total ebooks: ${totalEbooks}`);
    console.log(`• Ebooks with links: ${ebooksWithLinks}`);
    console.log('');
    
    // Check if paths are /ebooks/ or /books/
    const ebookPaths = [];
    const booksPaths = [];
    
    for (const module of modules) {
      for (const lesson of module.academy_lessons) {
        if (lesson.academy_ebooks && lesson.academy_ebooks.length > 0) {
          for (const ebook of lesson.academy_ebooks) {
            if (ebook.path) {
              if (ebook.path.startsWith('/ebooks/')) {
                ebookPaths.push(ebook.path);
              } else if (ebook.path.startsWith('/books/')) {
                booksPaths.push(ebook.path);
              }
            }
          }
        }
      }
    }
    
    console.log('🔍 PATH ANALYSIS:');
    console.log(`• /ebooks/ paths: ${ebookPaths.length}`);
    console.log(`• /books/ paths: ${booksPaths.length}`);
    console.log('');
    
    if (ebookPaths.length > 0) {
      console.log('📁 EBOOKS PATHS:');
      ebookPaths.forEach(path => console.log(`  ${path}`));
      console.log('');
    }
    
    if (booksPaths.length > 0) {
      console.log('📁 BOOKS PATHS:');
      booksPaths.forEach(path => console.log(`  ${path}`));
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkExactLessonLinks();
