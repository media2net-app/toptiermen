require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function assignAcademyMasterBadges() {
  try {
    console.log('🏆 Assigning Academy Master badges to eligible users...\n');

    // 1. Get the Academy Master badge
    console.log('1️⃣ Fetching Academy Master badge...');
    const { data: academyBadge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('title', 'Academy Master')
      .single();

    if (badgeError || !academyBadge) {
      console.error('❌ Academy Master badge not found:', badgeError);
      return;
    }

    console.log(`✅ Found Academy Master badge: "${academyBadge.title}" (ID: ${academyBadge.id})`);

    // 2. Get all published modules
    console.log('\n2️⃣ Fetching all published modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title, slug')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} published modules`);

    // 3. Get all users
    console.log('\n3️⃣ Fetching all users...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('created_at');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`✅ Found ${users?.length || 0} users`);

    // 4. Check each user's completion status
    console.log('\n4️⃣ Checking completion status for each user...');
    let eligibleUsers = [];
    let alreadyHaveBadge = [];
    let notEligible = [];

    for (const user of users || []) {
      console.log(`\n🔍 Checking user: ${user.full_name} (${user.email})`);

      // Check if user already has the badge
      const { data: existingBadge, error: existingBadgeError } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_id', academyBadge.id)
        .single();

      if (existingBadgeError && existingBadgeError.code !== 'PGRST116') {
        console.error(`❌ Error checking existing badge for ${user.email}:`, existingBadgeError);
        continue;
      }

      if (existingBadge) {
        console.log(`   ✅ Already has Academy Master badge`);
        alreadyHaveBadge.push(user);
        continue;
      }

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
        console.error(`❌ Error fetching progress for ${user.email}:`, progressError);
        continue;
      }

      // Count completed lessons per module
      const moduleCompletion = {};
      lessonProgress?.forEach(progress => {
        if (progress.academy_lessons && Array.isArray(progress.academy_lessons)) {
          progress.academy_lessons.forEach(lesson => {
            const moduleId = lesson.module_id;
            moduleCompletion[moduleId] = (moduleCompletion[moduleId] || 0) + 1;
          });
        }
      });

      // Check if user has completed at least one lesson per module
      const allModulesCompleted = modules?.every(module => {
        const completedLessons = moduleCompletion[module.id] || 0;
        return completedLessons > 0;
      });

      if (allModulesCompleted) {
        console.log(`   🎉 ELIGIBLE for Academy Master badge!`);
        console.log(`      Completed lessons per module:`);
        modules?.forEach(module => {
          const completedCount = moduleCompletion[module.id] || 0;
          console.log(`         ${module.title}: ${completedCount} lessons`);
        });
        eligibleUsers.push(user);
      } else {
        console.log(`   ❌ Not eligible - missing progress in some modules`);
        const incompleteModules = modules?.filter(module => {
          const completedLessons = moduleCompletion[module.id] || 0;
          return completedLessons === 0;
        }) || [];
        console.log(`      Missing: ${incompleteModules.map(m => m.title).join(', ')}`);
        notEligible.push(user);
      }
    }

    // 5. Assign badges to eligible users
    console.log('\n5️⃣ Assigning Academy Master badges...');
    let assignedCount = 0;
    let failedCount = 0;

    for (const user of eligibleUsers) {
      console.log(`\n🏆 Assigning badge to: ${user.full_name} (${user.email})`);
      
      const { error: assignError } = await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_id: academyBadge.id,
          unlocked_at: new Date().toISOString(),
          xp_earned: academyBadge.xp_reward || 0
        });

      if (assignError) {
        console.error(`❌ Failed to assign badge to ${user.email}:`, assignError);
        failedCount++;
      } else {
        console.log(`✅ Successfully assigned Academy Master badge to ${user.email}`);
        assignedCount++;
      }
    }

    // 6. Summary
    console.log('\n🎉 Academy Master Badge Assignment Complete!');
    console.log('=' .repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   Total users checked: ${users?.length || 0}`);
    console.log(`   Already have badge: ${alreadyHaveBadge.length}`);
    console.log(`   Eligible for badge: ${eligibleUsers.length}`);
    console.log(`   Not eligible: ${notEligible.length}`);
    console.log(`   Badges assigned: ${assignedCount}`);
    console.log(`   Failed assignments: ${failedCount}`);

    if (eligibleUsers.length > 0) {
      console.log('\n🏆 Users who received the Academy Master badge:');
      eligibleUsers.forEach(user => {
        console.log(`   ✅ ${user.full_name} (${user.email})`);
      });
    }

    if (alreadyHaveBadge.length > 0) {
      console.log('\n👑 Users who already had the Academy Master badge:');
      alreadyHaveBadge.forEach(user => {
        console.log(`   👑 ${user.full_name} (${user.email})`);
      });
    }

    console.log('\n🎯 Next steps:');
    console.log('   - Users will see the badge in their profile');
    console.log('   - Badge unlock notifications will be triggered');
    console.log('   - XP rewards have been added to their accounts');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

assignAcademyMasterBadges();

