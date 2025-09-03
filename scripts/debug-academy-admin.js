const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAcademyAdmin() {
  console.log('🔍 Debugging Academy Admin Dashboard...\n');

  try {
    // 1. Test modules fetch
    console.log('1️⃣ Testing modules fetch...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Modules fetch error:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} modules`);
    if (modules && modules.length > 0) {
      console.log('   First module:', {
        id: modules[0].id,
        title: modules[0].title,
        order_index: modules[0].order_index
      });
    }

    // 2. Test lessons fetch
    console.log('\n2️⃣ Testing lessons fetch...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('*')
      .eq('status', 'published')
      .order('order_index');

    if (lessonsError) {
      console.error('❌ Lessons fetch error:', lessonsError);
      return;
    }

    console.log(`✅ Found ${lessons?.length || 0} lessons`);
    if (lessons && lessons.length > 0) {
      console.log('   First lesson:', {
        id: lessons[0].id,
        title: lessons[0].title,
        module_id: lessons[0].module_id,
        type: lessons[0].type
      });
    }

    // 3. Test specific module lessons
    if (modules && modules.length > 0) {
      const testModule = modules[0];
      console.log(`\n3️⃣ Testing lessons for module: ${testModule.title}`);
      
      const { data: moduleLessons, error: moduleLessonsError } = await supabase
        .from('academy_lessons')
        .select('*')
        .eq('module_id', testModule.id)
        .eq('status', 'published')
        .order('order_index');

      if (moduleLessonsError) {
        console.error('❌ Module lessons fetch error:', moduleLessonsError);
      } else {
        console.log(`✅ Found ${moduleLessons?.length || 0} lessons for module`);
        moduleLessons?.forEach((lesson, index) => {
          console.log(`   ${index + 1}. ${lesson.title} (${lesson.type})`);
        });
      }
    }

    // 4. Test lesson update (simulate)
    if (lessons && lessons.length > 0) {
      const testLesson = lessons[0];
      console.log(`\n4️⃣ Testing lesson update simulation for: ${testLesson.title}`);
      
      // Just check if we can access the lesson data
      console.log('   Lesson data structure:', {
        id: testLesson.id,
        title: testLesson.title,
        type: testLesson.type,
        video_url: testLesson.video_url,
        content: testLesson.content,
        status: testLesson.status,
        duration: testLesson.duration,
        attachments: testLesson.attachments,
        exam_questions: testLesson.exam_questions,
        worksheet_url: testLesson.worksheet_url
      });
    }

    // 5. Check database schema
    console.log('\n5️⃣ Checking database schema...');
    const { data: schemaInfo, error: schemaError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'academy_lessons' 
          ORDER BY ordinal_position
        `
      });

    if (schemaError) {
      console.log('⚠️ Could not check schema (RPC not available)');
    } else {
      console.log('✅ Database schema for academy_lessons:');
      schemaInfo?.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    console.log('\n🎉 Academy Admin Debug completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Check browser console for JavaScript errors');
    console.log('   2. Verify all required components are imported');
    console.log('   3. Test lesson edit functionality step by step');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

debugAcademyAdmin();
