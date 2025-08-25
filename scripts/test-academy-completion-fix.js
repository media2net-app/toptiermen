require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAcademyCompletionFix() {
  try {
    console.log('🧪 Testing fixed Academy completion logic...\n');

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

    // Simulate the fixed API logic
    console.log('\n1️⃣ Fetching published modules with lessons...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select(`
        id, 
        title,
        academy_lessons (
          id,
          title,
          status
        )
      `)
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

    // Check if user has completed ALL lessons in ALL modules
    console.log('\n4️⃣ Checking if ALL lessons in ALL modules are completed...');
    const allModulesCompleted = modules?.every(module => {
      const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      const completedLessons = moduleCompletion[module.id] || 0;
      const isCompleted = completedLessons === publishedLessons.length && publishedLessons.length > 0;
      
      console.log(`   ${module.title}: ${completedLessons}/${publishedLessons.length} lessons completed - ${isCompleted ? '✅' : '❌'}`);
      
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
      console.log('🏆 User already has Academy Master badge!');
      console.log(`   Badge: ${existingBadge.badges.title}`);
      console.log(`   Unlocked: ${existingBadge.unlocked_at}`);
      console.log('\n✅ Academy completion status should be: COMPLETED = true');
    } else {
      console.log('❌ User does not have Academy Master badge yet');
      console.log('   This means the badge assignment logic needs to be fixed');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAcademyCompletionFix();
