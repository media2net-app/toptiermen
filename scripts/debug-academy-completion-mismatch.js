const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAcademyCompletionMismatch() {
  console.log('🔍 Debugging Academy Completion Mismatch for Chiel...\n');

  try {
    // Find Chiel's user ID
    const { data: chielProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .or('full_name.ilike.%chiel%,email.ilike.%chiel%')
      .limit(1);

    if (profileError || !chielProfile || chielProfile.length === 0) {
      console.error('❌ Chiel not found');
      return;
    }

    const chielId = chielProfile[0].id;
    console.log(`👤 Found Chiel: ${chielProfile[0].full_name} (${chielProfile[0].email})`);
    console.log(`   User ID: ${chielId}\n`);

    // 1. Check Academy Modules
    console.log('1️⃣ Checking Academy Modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('*')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules.length} published modules:`);
    modules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.title} (ID: ${module.id})`);
    });

    // 2. Check Academy Lessons
    console.log('\n2️⃣ Checking Academy Lessons...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('*')
      .order('module_id, order_index');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`✅ Found ${lessons.length} lessons total`);

    // 3. Check user_academy_progress (old system)
    console.log('\n3️⃣ Checking user_academy_progress (old system)...');
    const { data: oldProgress, error: oldProgressError } = await supabase
      .from('user_academy_progress')
      .select('*')
      .eq('user_id', chielId);

    if (oldProgressError) {
      console.error('❌ Error fetching old progress:', oldProgressError);
    } else {
      console.log(`✅ Found ${oldProgress?.length || 0} old progress records:`);
      oldProgress?.forEach((progress, index) => {
        console.log(`   ${index + 1}. Course: ${progress.course_id}, Progress: ${progress.progress_percentage}%`);
      });
    }

    // 4. Check user_lesson_progress (new system)
    console.log('\n4️⃣ Checking user_lesson_progress (new system)...');
    const { data: lessonProgress, error: lessonProgressError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', chielId);

    if (lessonProgressError) {
      console.error('❌ Error fetching lesson progress:', lessonProgressError);
    } else {
      console.log(`✅ Found ${lessonProgress?.length || 0} lesson progress records:`);
      lessonProgress?.forEach((progress, index) => {
        console.log(`   ${index + 1}. Lesson: ${progress.lesson_id}, Completed: ${progress.completed}`);
      });
    }

    // 5. Check user_academy_lesson_completions (another possible system)
    console.log('\n5️⃣ Checking user_academy_lesson_completions...');
    const { data: lessonCompletions, error: completionsError } = await supabase
      .from('user_academy_lesson_completions')
      .select('*')
      .eq('user_id', chielId);

    if (completionsError) {
      console.log('⚠️ user_academy_lesson_completions table does not exist or error:', completionsError.message);
    } else {
      console.log(`✅ Found ${lessonCompletions?.length || 0} lesson completions:`);
      lessonCompletions?.forEach((completion, index) => {
        console.log(`   ${index + 1}. Lesson: ${completion.lesson_id}, Completed: ${completion.completed_at}`);
      });
    }

    // 6. Check user_badges for Academy badge
    console.log('\n6️⃣ Checking user_badges for Academy badge...');
    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', chielId);

    if (badgesError) {
      console.error('❌ Error fetching badges:', badgesError);
    } else {
      console.log(`✅ Found ${badges?.length || 0} badges:`);
      badges?.forEach((badge, index) => {
        console.log(`   ${index + 1}. Badge: ${badge.badge_id}, Unlocked: ${badge.unlocked_at}`);
      });
    }

    // 7. Check all possible academy-related tables
    console.log('\n7️⃣ Checking all academy-related tables...');
    const academyTables = [
      'academy_progress',
      'user_academy_modules',
      'user_academy_lessons',
      'academy_completions',
      'user_academy_status'
    ];

    for (const tableName of academyTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', chielId)
          .limit(5);

        if (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`   ✅ ${tableName}: ${data?.length || 0} records`);
        }
      } catch (err) {
        console.log(`   ❌ ${tableName}: Table does not exist`);
      }
    }

    // 8. Calculate what the dashboard should show
    console.log('\n📊 ANALYSIS:');
    
    const totalModules = modules?.length || 0;
    const completedModulesOld = oldProgress?.filter(p => p.progress_percentage >= 100).length || 0;
    const completedLessons = lessonProgress?.filter(p => p.completed).length || 0;
    const totalLessons = lessons?.length || 0;
    
    console.log(`   - Total Modules: ${totalModules}`);
    console.log(`   - Completed Modules (old system): ${completedModulesOld}`);
    console.log(`   - Completed Lessons (new system): ${completedLessons}/${totalLessons}`);
    console.log(`   - Academy Badges: ${badges?.length || 0}`);
    
    console.log('\n🎯 RECOMMENDATION:');
    console.log('   - The dashboard uses the old system (user_academy_progress)');
    console.log('   - The Academy page uses the new system (user_lesson_progress)');
    console.log('   - Need to sync the data or update the dashboard logic');

  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugAcademyCompletionMismatch();
