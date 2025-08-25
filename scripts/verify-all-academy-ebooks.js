require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAllAcademyEbooks() {
  try {
    console.log('🔍 Verifying all Academy ebooks implementation...\n');

    // 1. Get all published modules with lessons
    console.log('1️⃣ Fetching all published modules and lessons...');
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

    console.log(`✅ Found ${modules?.length || 0} published modules\n`);

    // 2. Get all ebooks from database
    console.log('2️⃣ Fetching all ebooks from database...');
    const { data: ebooks, error: ebooksError } = await supabase
      .from('academy_ebooks')
      .select('id, lesson_id, title, file_url');

    if (ebooksError) {
      console.error('❌ Error fetching ebooks:', ebooksError);
      return;
    }

    console.log(`✅ Found ${ebooks?.length || 0} ebooks in database\n`);

    // 3. Check filesystem
    console.log('3️⃣ Checking filesystem for HTML files...');
    const booksDir = path.join(__dirname, '../public/books');
    const htmlFiles = fs.readdirSync(booksDir)
      .filter(file => file.endsWith('.html'))
      .map(file => file);

    console.log(`✅ Found ${htmlFiles.length} HTML files in filesystem\n`);

    // 4. Analyze each module
    let totalLessons = 0;
    let lessonsWithEbooks = 0;
    let lessonsWithFiles = 0;
    let lessonsWithDatabaseRecords = 0;

    console.log('📚 MODULE ANALYSIS:');
    console.log('='.repeat(60));

    for (const module of modules || []) {
      const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      totalLessons += publishedLessons.length;
      
      console.log(`\n📚 ${module.title} (${module.slug})`);
      console.log(`   Lessons: ${publishedLessons.length}`);
      
      let moduleEbookCount = 0;
      let moduleFileCount = 0;
      let moduleDatabaseCount = 0;
      
      for (const lesson of publishedLessons) {
        // Check database record
        const databaseEbook = ebooks?.find(ebook => ebook.lesson_id === lesson.id);
        const hasDatabaseRecord = !!databaseEbook;
        
        // Check filesystem
        const moduleSlug = module.slug.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const lessonSlug = lesson.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const expectedFilename = `${moduleSlug}-${lessonSlug}-ebook.html`;
        const hasFile = htmlFiles.includes(expectedFilename);
        
        if (hasDatabaseRecord) {
          moduleDatabaseCount++;
          lessonsWithDatabaseRecords++;
        }
        
        if (hasFile) {
          moduleFileCount++;
          lessonsWithFiles++;
        }
        
        if (hasDatabaseRecord && hasFile) {
          moduleEbookCount++;
          lessonsWithEbooks++;
        }
        
        const status = hasDatabaseRecord && hasFile ? '✅' : 
                      hasDatabaseRecord ? '⚠️  (no file)' : 
                      hasFile ? '⚠️  (no DB)' : '❌';
        
        console.log(`   ${status} ${lesson.title}`);
      }
      
      const moduleStatus = moduleEbookCount === publishedLessons.length ? '🎉 COMPLETE' :
                          moduleEbookCount > 0 ? '⚠️  PARTIAL' : '❌ MISSING';
      
      console.log(`   Status: ${moduleStatus} (${moduleEbookCount}/${publishedLessons.length} complete)`);
      console.log(`   Database: ${moduleDatabaseCount}, Files: ${moduleFileCount}`);
    }

    // 5. Summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`Total Modules: ${modules?.length || 0}`);
    console.log(`Total Lessons: ${totalLessons}`);
    console.log(`Lessons with Complete Ebooks: ${lessonsWithEbooks}`);
    console.log(`Lessons with Database Records: ${lessonsWithDatabaseRecords}`);
    console.log(`Lessons with HTML Files: ${lessonsWithFiles}`);
    console.log(`HTML Files in Filesystem: ${htmlFiles.length}`);
    console.log(`Database Records: ${ebooks?.length || 0}`);
    console.log(`Completion Rate: ${totalLessons > 0 ? ((lessonsWithEbooks / totalLessons) * 100).toFixed(1) : 0}%`);

    // 6. Issues found
    console.log('\n🔍 ISSUES FOUND:');
    console.log('-'.repeat(30));
    
    let issues = [];
    
    for (const module of modules || []) {
      const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      
      for (const lesson of publishedLessons) {
        const databaseEbook = ebooks?.find(ebook => ebook.lesson_id === lesson.id);
        const moduleSlug = module.slug.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const lessonSlug = lesson.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const expectedFilename = `${moduleSlug}-${lessonSlug}-ebook.html`;
        const hasFile = htmlFiles.includes(expectedFilename);
        
        if (!databaseEbook && !hasFile) {
          issues.push(`❌ ${module.title} → ${lesson.title} (no DB record, no file)`);
        } else if (!databaseEbook) {
          issues.push(`⚠️  ${module.title} → ${lesson.title} (no DB record)`);
        } else if (!hasFile) {
          issues.push(`⚠️  ${module.title} → ${lesson.title} (no HTML file)`);
        }
      }
    }
    
    if (issues.length === 0) {
      console.log('🎉 No issues found! All ebooks are properly implemented.');
    } else {
      issues.forEach(issue => console.log(issue));
    }

    // 7. Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('-'.repeat(30));
    
    if (lessonsWithEbooks === totalLessons) {
      console.log('✅ All ebooks are complete and properly implemented!');
      console.log('✅ Users can now download ebooks for all lessons');
      console.log('✅ Database and filesystem are in sync');
    } else {
      console.log('⚠️  Some ebooks are missing or incomplete');
      console.log('📝 Consider running the creation scripts again');
      console.log('🔧 Check for any database or filesystem errors');
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('-'.repeat(20));
    if (lessonsWithEbooks === totalLessons) {
      console.log('✅ All ebooks are ready for use!');
      console.log('✅ Test ebook downloads in the Academy interface');
      console.log('✅ Monitor user engagement with ebooks');
    } else {
      console.log('🔧 Fix any missing ebooks before going live');
      console.log('📝 Ensure all lessons have both HTML files and database records');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyAllAcademyEbooks();
