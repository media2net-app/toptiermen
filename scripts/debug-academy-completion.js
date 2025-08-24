const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAcademyCompletion() {
  try {
    console.log('🔍 Debugging Academy Completion Logic...\n');

    // Find user "Chiel"
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .ilike('full_name', '%Chiel%')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.error('❌ User "Chiel" not found:', usersError);
      return;
    }

    const chiel = users[0];
    console.log(`👤 User: ${chiel.full_name} (ID: ${chiel.id})\n`);

    // 1. Get all published modules
    console.log('1️⃣ Fetching published modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title, order_index')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} published modules:`);
    modules?.forEach(module => {
      console.log(`   📚 ${module.title} (ID: ${module.id}, Order: ${module.order_index})`);
    });

    // 2. Get user's completed lesson progress
    console.log('\n2️⃣ Fetching user lesson progress...');
    const { data: lessonProgress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select(`
        lesson_id,
        completed,
        completed_at,
        academy_lessons!inner(
          id,
          title,
          module_id,
          status
        )
      `)
      .eq('user_id', chiel.id)
      .eq('completed', true);

    if (progressError) {
      console.error('❌ Error fetching lesson progress:', progressError);
      return;
    }

    console.log(`✅ Found ${lessonProgress?.length || 0} completed lessons:`);
    lessonProgress?.forEach(progress => {
      const lesson = progress.academy_lessons;
      console.log(`   ✅ ${lesson.title} (Module ID: ${lesson.module_id})`);
    });

    // 3. Count completed lessons per module
    console.log('\n3️⃣ Counting completed lessons per module...');
    const moduleCompletion = {};
    lessonProgress?.forEach(progress => {
      const moduleId = progress.academy_lessons.module_id;
      moduleCompletion[moduleId] = (moduleCompletion[moduleId] || 0) + 1;
    });

    console.log('📊 Module completion counts:');
    modules?.forEach(module => {
      const completedCount = moduleCompletion[module.id] || 0;
      console.log(`   ${module.title}: ${completedCount} lessons completed`);
    });

    // 4. Check if all modules are completed
    console.log('\n4️⃣ Checking if all modules are completed...');
    const allModulesCompleted = modules?.every(module => {
      const completedLessons = moduleCompletion[module.id] || 0;
      const isCompleted = completedLessons > 0;
      console.log(`   ${module.title}: ${completedLessons} > 0 = ${isCompleted ? '✅' : '❌'}`);
      return isCompleted;
    });

    console.log(`\n🎯 All modules completed: ${allModulesCompleted ? '✅ YES' : '❌ NO'}`);

    // 5. Check if user already has the Academy Master badge
    console.log('\n5️⃣ Checking existing Academy Master badge...');
    const { data: existingBadge, error: badgeError } = await supabase
      .from('user_badges')
      .select(`
        id,
        unlocked_at,
        badges!inner(
          id,
          title,
          description,
          icon_name,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', chiel.id)
      .eq('badges.title', 'Academy Master')
      .single();

    if (badgeError && badgeError.code !== 'PGRST116') {
      console.error('❌ Error checking existing badge:', badgeError);
    } else if (existingBadge) {
      console.log('✅ User already has Academy Master badge:');
      console.log(`   Badge: ${existingBadge.badges.title}`);
      console.log(`   Unlocked at: ${existingBadge.unlocked_at}`);
    } else {
      console.log('❌ User does not have Academy Master badge yet');
    }

    // 6. Check if badge ID 16 exists
    console.log('\n6️⃣ Checking if Academy Master badge (ID: 16) exists...');
    const { data: badge, error: badgeCheckError } = await supabase
      .from('badges')
      .select('*')
      .eq('id', 16)
      .single();

    if (badgeCheckError) {
      console.error('❌ Error checking badge ID 16:', badgeCheckError);
    } else if (badge) {
      console.log('✅ Academy Master badge exists:');
      console.log(`   ID: ${badge.id}`);
      console.log(`   Title: ${badge.title}`);
      console.log(`   Description: ${badge.description}`);
    } else {
      console.log('❌ Academy Master badge (ID: 16) not found');
    }

    // 7. Summary and recommendation
    console.log('\n📋 SUMMARY:');
    console.log(`   Total modules: ${modules?.length || 0}`);
    console.log(`   Completed lessons: ${lessonProgress?.length || 0}`);
    console.log(`   All modules completed: ${allModulesCompleted ? 'YES' : 'NO'}`);
    console.log(`   Has Academy Master badge: ${existingBadge ? 'YES' : 'NO'}`);
    console.log(`   Academy Master badge exists: ${badge ? 'YES' : 'NO'}`);

    if (allModulesCompleted && !existingBadge && badge) {
      console.log('\n🎉 RECOMMENDATION: User should get the Academy Master badge!');
      console.log('   The API should award the badge when called.');
    } else if (!allModulesCompleted) {
      console.log('\n⚠️ ISSUE: Not all modules are completed');
      console.log('   Check which modules are missing completed lessons.');
    } else if (existingBadge) {
      console.log('\nℹ️ INFO: User already has the Academy Master badge');
    } else if (!badge) {
      console.log('\n❌ ISSUE: Academy Master badge (ID: 16) does not exist');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugAcademyCompletion();
