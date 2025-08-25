require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTestosteronEbooks() {
  try {
    console.log('🔍 Verifying Testosteron ebooks...\n');

    // 1. Find the Testosteron module
    const { data: testosteronModule, error: moduleError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('slug', 'test')
      .single();

    if (moduleError) {
      console.error('❌ Error finding testosteron module:', moduleError);
      return;
    }

    console.log(`✅ Found module: ${testosteronModule.title} (ID: ${testosteronModule.id})\n`);

    // 2. Get all lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select(`
        id,
        title,
        order_index,
        status
      `)
      .eq('module_id', testosteronModule.id)
      .eq('status', 'published')
      .order('order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons\n`);

    // 3. Check ebooks for each lesson
    let totalEbooks = 0;
    let missingEbooks = 0;

    for (const lesson of lessons || []) {
      console.log(`📚 Checking lesson: ${lesson.title}`);

      const { data: ebook, error: ebookError } = await supabase
        .from('academy_ebooks')
        .select('*')
        .eq('lesson_id', lesson.id)
        .eq('status', 'published')
        .single();

      if (ebookError && ebookError.code === 'PGRST116') {
        console.log(`   ❌ No ebook found for: ${lesson.title}`);
        missingEbooks++;
      } else if (ebookError) {
        console.error(`   ❌ Error checking ebook for ${lesson.title}:`, ebookError);
        missingEbooks++;
      } else {
        console.log(`   ✅ Ebook found: ${ebook.title}`);
        console.log(`      File URL: ${ebook.file_url}`);
        console.log(`      Description: ${ebook.description?.substring(0, 100)}...`);
        totalEbooks++;
      }
      console.log('');
    }

    // 4. Summary
    console.log('📊 Summary:');
    console.log(`   Total lessons: ${lessons?.length || 0}`);
    console.log(`   Ebooks found: ${totalEbooks}`);
    console.log(`   Missing ebooks: ${missingEbooks}`);
    console.log(`   Completion rate: ${lessons?.length ? Math.round((totalEbooks / lessons.length) * 100) : 0}%`);

    if (missingEbooks === 0) {
      console.log('\n🎉 All Testosteron lessons have ebooks!');
    } else {
      console.log(`\n⚠️  ${missingEbooks} lessons are missing ebooks.`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyTestosteronEbooks();
