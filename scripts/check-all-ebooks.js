require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllEbooks() {
  try {
    console.log('🔍 CHECKING ALL EBOOKS ACROSS ALL MODULES');
    console.log('==========================================\n');

    // Get all modules ordered by order_index
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('status', 'published')
      .order('order_index', { ascending: true });

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    if (!modules || modules.length === 0) {
      console.log('⚠️ No modules found');
      return;
    }

    let totalLessons = 0;
    let lessonsWithEbooks = 0;
    let lessonsWithoutEbooks = 0;

    // Check each module
    for (const module of modules) {
      console.log(`📚 MODULE ${module.order_index.toString().padStart(2, '0')}: ${module.title}`);
      console.log('='.repeat(50));

      // Get all lessons for this module
      const { data: lessons, error: lessonsError } = await supabase
        .from('academy_lessons')
        .select(`
          id,
          title,
          order_index,
          status,
          content,
          academy_ebooks (
            id,
            title,
            status,
            file_url
          )
        `)
        .eq('module_id', module.id)
        .eq('status', 'published')
        .order('order_index', { ascending: true });

      if (lessonsError) {
        console.error(`❌ Error fetching lessons for module ${module.title}:`, lessonsError);
        continue;
      }

      if (!lessons || lessons.length === 0) {
        console.log('   ⚠️ No lessons found for this module\n');
        continue;
      }

      console.log(`   📖 Found ${lessons.length} lessons:\n`);

      // Check each lesson
      for (const lesson of lessons) {
        totalLessons++;
        const lessonNumber = lesson.order_index + 1;
        const ebooks = lesson.academy_ebooks || [];
        
        console.log(`   ${lessonNumber.toString().padStart(2, '0')}. ${lesson.title}`);
        
        if (ebooks.length > 0) {
          lessonsWithEbooks++;
          console.log(`      ✅ Has ${ebooks.length} ebook(s):`);
          ebooks.forEach(ebook => {
            const hasWebVersion = ebook.file_url && ebook.file_url.includes('.html');
            const hasPdfVersion = ebook.file_url && ebook.file_url.includes('.pdf');
            console.log(`         - ${ebook.title} (${ebook.status})`);
            console.log(`           Web: ${hasWebVersion ? '✅' : '❌'} | PDF: ${hasPdfVersion ? '✅' : '❌'}`);
            console.log(`           URL: ${ebook.file_url || 'None'}`);
          });
        } else {
          lessonsWithoutEbooks++;
          console.log(`      ❌ No ebooks found`);
        }
        
        // Show content length
        const contentLength = lesson.content?.length || 0;
        console.log(`      📝 Content: ${contentLength} characters`);
        console.log('');
      }

      console.log('');
    }

    // Summary
    console.log('📊 EBOOK SUMMARY');
    console.log('================');
    console.log(`Total modules: ${modules.length}`);
    console.log(`Total lessons: ${totalLessons}`);
    console.log(`Lessons with ebooks: ${lessonsWithEbooks}`);
    console.log(`Lessons without ebooks: ${lessonsWithoutEbooks}`);
    console.log(`Ebook coverage: ${totalLessons > 0 ? Math.round((lessonsWithEbooks / totalLessons) * 100) : 0}%`);

    // Show modules that need work
    console.log('\n🔧 MODULES THAT NEED EBOOK WORK:');
    console.log('================================');
    
    for (const module of modules) {
      const { data: lessons } = await supabase
        .from('academy_lessons')
        .select(`
          id,
          title,
          order_index,
          academy_ebooks (id)
        `)
        .eq('module_id', module.id)
        .eq('status', 'published');

      const lessonsWithoutEbooks = lessons?.filter(lesson => !lesson.academy_ebooks || lesson.academy_ebooks.length === 0) || [];
      
      if (lessonsWithoutEbooks.length > 0) {
        console.log(`\n📚 Module ${module.order_index.toString().padStart(2, '0')}: ${module.title}`);
        console.log(`   ❌ ${lessonsWithoutEbooks.length} lessons need ebooks:`);
        lessonsWithoutEbooks.forEach(lesson => {
          console.log(`      - ${lesson.title}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkAllEbooks().then(() => {
  console.log('\n✅ Ebook check completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
