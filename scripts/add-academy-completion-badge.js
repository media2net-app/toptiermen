const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addAcademyCompletionBadge() {
  try {
    console.log('🏆 Adding Academy Completion Badge...\n');

    // 1. Check if badge already exists
    console.log('1️⃣ Checking if Academy Completion badge already exists...');
    const { data: existingBadge, error: checkError } = await supabase
      .from('badges')
      .select('*')
      .eq('title', 'Academy Master')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing badge:', checkError);
      return;
    }

    if (existingBadge) {
      console.log('✅ Academy Completion badge already exists!');
      console.log(`   ID: ${existingBadge.id}`);
      console.log(`   Title: ${existingBadge.title}`);
      console.log(`   Description: ${existingBadge.description}`);
      return;
    }

    // 2. Add the Academy Completion badge
    console.log('2️⃣ Creating Academy Completion badge...');
    const { data: newBadge, error: insertError } = await supabase
      .from('badges')
      .insert({
        title: 'Academy Master',
        description: 'Je hebt alle Academy modules voltooid! Je bent nu een echte Top Tier Man met een solide fundament van kennis en vaardigheden.',
        icon_name: '🎓',
        rarity_level: 'legendary',
        xp_reward: 1000,
        requirements: {
          type: 'academy_completion',
          required_modules: 'all',
          required_lessons: 'all'
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating badge:', insertError);
      return;
    }

    console.log('✅ Academy Completion badge created successfully!');
    console.log(`   ID: ${newBadge.id}`);
    console.log(`   Title: ${newBadge.title}`);
    console.log(`   Description: ${newBadge.description}`);
    console.log(`   XP Reward: ${newBadge.xp_reward}`);
    console.log(`   Rarity: ${newBadge.rarity_level}`);

    // 3. Check for users who have completed all modules
    console.log('\n3️⃣ Checking for users who have completed all Academy modules...');
    
    // Get all published modules
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`   Found ${modules?.length || 0} published modules`);

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`   Found ${users?.length || 0} users`);

    // Check each user's completion status
    let usersWithBadge = 0;
    for (const user of users || []) {
      console.log(`\n   🔍 Checking user: ${user.email}`);
      
      // Get user's lesson progress
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
        .eq('user_id', user.id)
        .eq('completed', true);

      if (progressError) {
        console.error(`   ❌ Error fetching progress for ${user.email}:`, progressError);
        continue;
      }

      // Count completed lessons per module
      const moduleCompletion = {};
      lessonProgress?.forEach(progress => {
        const moduleId = progress.academy_lessons.module_id;
        moduleCompletion[moduleId] = (moduleCompletion[moduleId] || 0) + 1;
      });

      // Check if user has completed all modules
      const allModulesCompleted = modules?.every(module => {
        const completedLessons = moduleCompletion[module.id] || 0;
        const totalLessons = lessonProgress?.filter(p => 
          p.academy_lessons.module_id === module.id
        ).length || 0;
        
        console.log(`      ${module.title}: ${completedLessons}/${totalLessons} lessons completed`);
        return completedLessons > 0; // At least one lesson completed per module
      });

      if (allModulesCompleted) {
        console.log(`   ✅ ${user.email} has completed all modules!`);
        
        // Check if user already has this badge
        const { data: existingUserBadge, error: userBadgeError } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id)
          .eq('badge_id', newBadge.id)
          .single();

        if (userBadgeError && userBadgeError.code !== 'PGRST116') {
          console.error(`   ❌ Error checking user badge for ${user.email}:`, userBadgeError);
          continue;
        }

        if (existingUserBadge) {
          console.log(`   ℹ️ ${user.email} already has the Academy Master badge`);
          usersWithBadge++;
        } else {
          // Award the badge
          const { error: awardError } = await supabase
            .from('user_badges')
            .insert({
              user_id: user.id,
              badge_id: newBadge.id,
              unlocked_at: new Date().toISOString(),
              status: 'unlocked'
            });

          if (awardError) {
            console.error(`   ❌ Error awarding badge to ${user.email}:`, awardError);
          } else {
            console.log(`   🎉 Awarded Academy Master badge to ${user.email}!`);
            usersWithBadge++;
          }
        }
      } else {
        console.log(`   ❌ ${user.email} has not completed all modules yet`);
      }
    }

    console.log(`\n🎉 Academy Completion badge system setup complete!`);
    console.log(`   Badge created: Academy Master`);
    console.log(`   Users with badge: ${usersWithBadge}`);
    console.log(`   Total users checked: ${users?.length || 0}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addAcademyCompletionBadge();
