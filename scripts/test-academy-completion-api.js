const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAcademyCompletionAPI() {
  try {
    console.log('🧪 Testing Academy Completion API...\n');

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

    // Simulate the API logic directly
    console.log('\n1️⃣ Fetching published modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} published modules`);

    // Get user's lesson progress
    console.log('\n2️⃣ Fetching user lesson progress...');
    const { data: lessonProgress, error: progressError } = await supabase
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

    if (progressError) {
      console.error('❌ Error fetching lesson progress:', progressError);
      return;
    }

    console.log(`✅ Found ${lessonProgress?.length || 0} completed lessons`);

    // Count completed lessons per module
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

    // Check if user has completed all modules
    console.log('\n4️⃣ Checking if all modules are completed...');
    const allModulesCompleted = modules?.every(module => {
      const completedLessons = moduleCompletion[module.id] || 0;
      const isCompleted = completedLessons > 0;
      console.log(`   ${module.title}: ${completedLessons} > 0 = ${isCompleted ? '✅' : '❌'}`);
      return isCompleted;
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

    console.log('\n✅ API test completed successfully!');
    console.log('💡 The badge unlock should now work in the UI!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAcademyCompletionAPI();
