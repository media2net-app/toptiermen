require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllAcademyModules() {
  try {
    console.log('🔍 Checking all Academy modules and lessons...\n');

    // 1. Get all published modules
    console.log('1️⃣ Fetching all published modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select(`
        id,
        title,
        slug,
        order_index,
        status,
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

    console.log(`✅ Found ${modules?.length || 0} published modules:\n`);

    // 2. Check existing ebooks
    const fs = require('fs');
    const path = require('path');
    const booksDir = path.join(__dirname, '../public/books');
    
    // Get existing HTML ebooks
    const existingEbooks = fs.readdirSync(booksDir)
      .filter(file => file.endsWith('.html'))
      .map(file => file.replace('.html', ''));

    console.log('📚 Existing HTML ebooks:');
    existingEbooks.forEach(ebook => {
      console.log(`   ✅ ${ebook}.html`);
    });
    console.log('');

    // 3. Analyze each module
    let totalLessons = 0;
    let lessonsWithEbooks = 0;
    let modulesWithEbooks = 0;

    modules?.forEach((module, moduleIndex) => {
      const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      totalLessons += publishedLessons.length;
      
      console.log(`${moduleIndex + 1}. 📚 ${module.title} (${module.slug})`);
      console.log(`   Order: ${module.order_index}`);
      console.log(`   Lessons: ${publishedLessons.length}`);
      
      let moduleHasEbooks = false;
      let moduleEbookCount = 0;
      
      publishedLessons.forEach((lesson, lessonIndex) => {
        // Create expected ebook filename
        const moduleSlug = module.slug.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const lessonSlug = lesson.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const expectedEbookName = `${moduleSlug}-${lessonSlug}-ebook`;
        
        const hasEbook = existingEbooks.some(ebook => 
          ebook.includes(moduleSlug) && ebook.includes(lessonSlug)
        );
        
        if (hasEbook) {
          moduleEbookCount++;
          lessonsWithEbooks++;
          console.log(`      ✅ Lesson ${lessonIndex + 1}: ${lesson.title} (ebook: ${expectedEbookName})`);
        } else {
          console.log(`      ❌ Lesson ${lessonIndex + 1}: ${lesson.title} (MISSING: ${expectedEbookName})`);
        }
      });
      
      if (moduleEbookCount === publishedLessons.length && publishedLessons.length > 0) {
        modulesWithEbooks++;
        moduleHasEbooks = true;
        console.log(`   🎉 Module COMPLETE: All ${moduleEbookCount} lessons have ebooks`);
      } else if (moduleEbookCount > 0) {
        console.log(`   ⚠️  Module PARTIAL: ${moduleEbookCount}/${publishedLessons.length} lessons have ebooks`);
      } else {
        console.log(`   ❌ Module MISSING: No ebooks for ${publishedLessons.length} lessons`);
      }
      
      console.log('');
    });

    // 4. Summary
    console.log('📊 SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Total Modules: ${modules?.length || 0}`);
    console.log(`Modules with Complete Ebooks: ${modulesWithEbooks}`);
    console.log(`Total Lessons: ${totalLessons}`);
    console.log(`Lessons with Ebooks: ${lessonsWithEbooks}`);
    console.log(`Lessons Missing Ebooks: ${totalLessons - lessonsWithEbooks}`);
    console.log(`Completion Rate: ${totalLessons > 0 ? ((lessonsWithEbooks / totalLessons) * 100).toFixed(1) : 0}%`);

    // 5. Identify missing ebooks
    console.log('\n📝 MISSING EBOOKS:');
    console.log('-'.repeat(30));
    
    let missingEbooks = [];
    
    modules?.forEach(module => {
      const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      const moduleSlug = module.slug.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      publishedLessons.forEach(lesson => {
        const lessonSlug = lesson.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const expectedEbookName = `${moduleSlug}-${lessonSlug}-ebook`;
        
        const hasEbook = existingEbooks.some(ebook => 
          ebook.includes(moduleSlug) && ebook.includes(lessonSlug)
        );
        
        if (!hasEbook) {
          missingEbooks.push({
            module: module.title,
            moduleSlug: moduleSlug,
            lesson: lesson.title,
            lessonSlug: lessonSlug,
            expectedName: expectedEbookName
          });
        }
      });
    });

    if (missingEbooks.length === 0) {
      console.log('🎉 All lessons have ebooks!');
    } else {
      missingEbooks.forEach((missing, index) => {
        console.log(`${index + 1}. ${missing.module} → ${missing.lesson}`);
        console.log(`   Expected: ${missing.expectedName}.html`);
      });
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('-'.repeat(20));
    if (missingEbooks.length > 0) {
      console.log(`Create ${missingEbooks.length} missing HTML ebooks`);
      console.log('Use the existing ebooks as templates');
      console.log('Follow the naming convention: {module-slug}-{lesson-slug}-ebook.html');
    } else {
      console.log('All ebooks are complete! 🎉');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllAcademyModules();
