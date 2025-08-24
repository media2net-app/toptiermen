const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLessonCompletion() {
  try {
    console.log('🧪 Testing Lesson Completion and Badge Unlock...\n');

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
    console.log(`👤 User: ${chiel.full_name} (ID: ${chiel.id})`);

    // Find the last lesson of the last module
    console.log('\n1️⃣ Finding the last lesson...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title, order_index')
      .eq('status', 'published')
      .order('order_index', { ascending: false })
      .limit(1);

    if (modulesError || !modules || modules.length === 0) {
      console.error('❌ No modules found:', modulesError);
      return;
    }

    const lastModule = modules[0];
    console.log(`📚 Last module: ${lastModule.title} (ID: ${lastModule.id})`);

    const { data: lessons, error: lessonsError } = await supabase
      .from('academy_lessons')
      .select('id, title, order_index')
      .eq('module_id', lastModule.id)
      .eq('status', 'published')
      .order('order_index', { ascending: false })
      .limit(1);

    if (lessonsError || !lessons || lessons.length === 0) {
      console.error('❌ No lessons found for the last module:', lessonsError);
      return;
    }

    const lastLesson = lessons[0];
    console.log(`📖 Last lesson: ${lastLesson.title} (ID: ${lastLesson.id})`);

    // Check current progress
    console.log('\n2️⃣ Checking current lesson progress...');
    const { data: currentProgress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('id, completed, completed_at')
      .eq('user_id', chiel.id)
      .eq('lesson_id', lastLesson.id)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      console.error('❌ Error checking current progress:', progressError);
      return;
    }

    if (currentProgress) {
      console.log(`📊 Current progress: ${currentProgress.completed ? 'Completed' : 'Not completed'}`);
      if (currentProgress.completed) {
        console.log('ℹ️ Lesson is already completed');
      }
    } else {
      console.log('📊 No progress record found');
    }

    // Complete the lesson
    console.log('\n3️⃣ Completing the lesson...');
    const { error: upsertError } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: chiel.id,
        lesson_id: lastLesson.id,
        completed: true,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' });

    if (upsertError) {
      console.error('❌ Error completing lesson:', upsertError);
      return;
    }

    console.log('✅ Lesson completed successfully!');

    // Check Academy completion
    console.log('\n4️⃣ Checking Academy completion...');
    const { data: modules2, error: modulesError2 } = await supabase
      .from('academy_modules')
      .select('id, title')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError2) {
      console.error('❌ Error fetching modules:', modulesError2);
      return;
    }

    const { data: lessonProgress, error: progressError2 } = await supabase
      .from('user_lesson_progress')
      .select(`
        lesson_id,
        completed,
        academy_lessons!inner(
          id,
          module_id,
          status
        )
      `)
      .eq('user_id', chiel.id)
      .eq('completed', true);

    if (progressError2) {
      console.error('❌ Error fetching lesson progress:', progressError2);
      return;
    }

    // Count completed lessons per module
    const moduleCompletion = {};
    lessonProgress?.forEach(progress => {
      const moduleId = progress.academy_lessons.module_id;
      moduleCompletion[moduleId] = (moduleCompletion[moduleId] || 0) + 1;
    });

    console.log('📊 Module completion counts:');
    modules2?.forEach(module => {
      const completedCount = moduleCompletion[module.id] || 0;
      console.log(`   ${module.title}: ${completedCount} lessons completed`);
    });

    // Check if all modules are completed
    const allModulesCompleted = modules2?.every(module => {
      const completedLessons = moduleCompletion[module.id] || 0;
      return completedLessons > 0;
    });

    console.log(`\n🎯 All modules completed: ${allModulesCompleted ? '✅ YES' : '❌ NO'}`);

    if (!allModulesCompleted) {
      console.log('❌ Academy not yet completed - no badge should be awarded');
      return;
    }

    // Check if user already has the Academy Master badge
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
      return;
    }

    if (existingBadge) {
      console.log('✅ User already has Academy Master badge:');
      console.log(`   Badge: ${existingBadge.badges.title}`);
      console.log(`   Unlocked at: ${existingBadge.unlocked_at}`);
      console.log('ℹ️ No new badge should be awarded');
      return;
    }

    // Award the badge
    console.log('\n6️⃣ Awarding Academy Master badge...');
    const { data: newUserBadge, error: awardError } = await supabase
      .from('user_badges')
      .insert({
        user_id: chiel.id,
        badge_id: 16, // Academy Master badge ID
        unlocked_at: new Date().toISOString(),
        status: 'unlocked'
      })
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
      .single();

    if (awardError) {
      console.error('❌ Error awarding badge:', awardError);
      return;
    }

    console.log('🎉 SUCCESS: Academy Master badge awarded!');
    console.log(`   Badge: ${newUserBadge.badges.title}`);
    console.log(`   Description: ${newUserBadge.badges.description}`);
    console.log(`   Icon: ${newUserBadge.badges.icon_name}`);
    console.log(`   XP Reward: ${newUserBadge.badges.xp_reward}`);
    console.log(`   Unlocked at: ${newUserBadge.unlocked_at}`);

    console.log('\n✅ Test completed successfully!');
    console.log('💡 The badge unlock modal should now appear in the UI!');
    console.log('🌐 Go to http://localhost:3000/dashboard/academy to see the modal!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testLessonCompletion();
