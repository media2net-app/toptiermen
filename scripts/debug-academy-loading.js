const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAcademyLoading() {
  console.log('🔍 Debugging Academy Loading Issue...\n');

  try {
    // 1. Check if user exists (using Chiel as test)
    console.log('1️⃣ Checking test user...');
    const { data: testUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'chiel@media2net.nl')
      .single();

    if (userError) {
      console.error('❌ Error finding test user:', userError);
      return;
    }

    console.log(`✅ Test user found: ${testUser.full_name} (${testUser.email})`);
    console.log(`   User ID: ${testUser.id}`);

    // 2. Check academy_modules table
    console.log('\n2️⃣ Checking academy_modules table...');
    try {
      const { data: modules, error: modulesError } = await supabase
        .from('academy_modules')
        .select('*')
        .eq('status', 'published')
        .order('order_index');

      if (modulesError) {
        console.error('❌ Error fetching academy_modules:', modulesError);
      } else {
        console.log(`✅ Found ${modules?.length || 0} published academy modules`);
        modules?.slice(0, 3).forEach((module, index) => {
          console.log(`   ${index + 1}. ${module.title} (${module.status})`);
        });
      }
    } catch (error) {
      console.error('❌ academy_modules table error:', error.message);
    }

    // 3. Check academy_lessons table
    console.log('\n3️⃣ Checking academy_lessons table...');
    try {
      const { data: lessons, error: lessonsError } = await supabase
        .from('academy_lessons')
        .select('*')
        .eq('status', 'published')
        .order('order_index');

      if (lessonsError) {
        console.error('❌ Error fetching academy_lessons:', lessonsError);
      } else {
        console.log(`✅ Found ${lessons?.length || 0} published academy lessons`);
        lessons?.slice(0, 3).forEach((lesson, index) => {
          console.log(`   ${index + 1}. ${lesson.title} (Module: ${lesson.module_id})`);
        });
      }
    } catch (error) {
      console.error('❌ academy_lessons table error:', error.message);
    }

    // 4. Check user_module_progress table
    console.log('\n4️⃣ Checking user_module_progress table...');
    try {
      const { data: moduleProgress, error: moduleProgressError } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', testUser.id);

      if (moduleProgressError) {
        console.error('❌ Error fetching user_module_progress:', moduleProgressError);
      } else {
        console.log(`✅ Found ${moduleProgress?.length || 0} module progress records for user`);
        moduleProgress?.slice(0, 3).forEach((progress, index) => {
          console.log(`   ${index + 1}. Module: ${progress.module_id}, Progress: ${progress.progress_percentage}%`);
        });
      }
    } catch (error) {
      console.error('❌ user_module_progress table error:', error.message);
    }

    // 5. Check user_lesson_progress table
    console.log('\n5️⃣ Checking user_lesson_progress table...');
    try {
      const { data: lessonProgress, error: lessonProgressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', testUser.id);

      if (lessonProgressError) {
        console.error('❌ Error fetching user_lesson_progress:', lessonProgressError);
      } else {
        console.log(`✅ Found ${lessonProgress?.length || 0} lesson progress records for user`);
        lessonProgress?.slice(0, 3).forEach((progress, index) => {
          console.log(`   ${index + 1}. Lesson: ${progress.lesson_id}, Completed: ${progress.completed}`);
        });
      }
    } catch (error) {
      console.error('❌ user_lesson_progress table error:', error.message);
    }

    // 6. Check user_module_unlocks table
    console.log('\n6️⃣ Checking user_module_unlocks table...');
    try {
      const { data: moduleUnlocks, error: moduleUnlocksError } = await supabase
        .from('user_module_unlocks')
        .select('*')
        .eq('user_id', testUser.id);

      if (moduleUnlocksError) {
        console.error('❌ Error fetching user_module_unlocks:', moduleUnlocksError);
      } else {
        console.log(`✅ Found ${moduleUnlocks?.length || 0} module unlock records for user`);
        moduleUnlocks?.slice(0, 3).forEach((unlock, index) => {
          console.log(`   ${index + 1}. Module: ${unlock.module_id}, Unlocked: ${unlock.unlocked_at}`);
        });
      }
    } catch (error) {
      console.error('❌ user_module_unlocks table error:', error.message);
    }

    // 7. Check what tables actually exist
    console.log('\n7️⃣ Checking available tables...');
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .ilike('table_name', '%academy%');

      if (tablesError) {
        console.log('   Note: Could not query information_schema, checking manually...');
      } else {
        console.log('   Tables with "academy" in name:', tables?.map(t => t.table_name) || []);
      }
    } catch (error) {
      console.log('   Note: Could not query information_schema');
    }

    // 8. Check user-related tables
    console.log('\n8️⃣ Checking user-related tables...');
    try {
      const { data: userTables, error: userTablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .ilike('table_name', '%user%');

      if (userTablesError) {
        console.log('   Note: Could not query information_schema, checking manually...');
      } else {
        console.log('   Tables with "user" in name:', userTables?.map(t => t.table_name) || []);
      }
    } catch (error) {
      console.log('   Note: Could not query information_schema');
    }

    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('================================');
    console.log('   - Checked all tables that Academy page tries to access');
    console.log('   - Identified which tables exist and which don\'t');
    console.log('   - Next step: Fix missing tables or update code');

  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugAcademyLoading();
