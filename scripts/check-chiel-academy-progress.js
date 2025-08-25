require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkChielAcademyProgress() {
  try {
    console.log('🔍 Checking Chiel\'s Academy Progress...\n');

    // 1. Find Chiel's user account
    console.log('1️⃣ Finding Chiel\'s user account...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .ilike('full_name', '%Chiel%')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.error('❌ User "Chiel" not found in profiles table');
      
      // Try users table as fallback
      const { data: authUsers, error: authError } = await supabase
        .from('users')
        .select('id, email')
        .ilike('email', '%chiel%')
        .limit(1);
      
      if (authError || !authUsers || authUsers.length === 0) {
        console.error('❌ User "Chiel" not found in any table');
        return;
      }
      
      console.log(`✅ Found Chiel in users table: ${authUsers[0].email} (ID: ${authUsers[0].id})`);
      const chiel = authUsers[0];
    } else {
      console.log(`✅ Found Chiel: ${users[0].full_name} (ID: ${users[0].id})`);
      const chiel = users[0];
    }

    const chiel = users?.[0] || authUsers?.[0];
    if (!chiel) {
      console.error('❌ Could not find Chiel\'s user account');
      return;
    }

    // 2. Get all published modules
    console.log('\n2️⃣ Fetching all published modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select(`
        id,
        title,
        slug,
        order_index,
        academy_lessons(
          id,
          title,
          order_index,
          status
        )
      `)
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} published modules:`);
    modules?.forEach(module => {
      const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      console.log(`   📚 ${module.title} (${module.slug}) - ${publishedLessons.length} lessons`);
    });

    // 3. Get Chiel's lesson progress
    console.log('\n3️⃣ Fetching Chiel\'s lesson progress...');
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
          academy_modules!inner(
            id,
            title,
            slug
          )
        )
      `)
      .eq('user_id', chiel.id);

    if (progressError) {
      console.error('❌ Error fetching lesson progress:', progressError);
      return;
    }

    console.log(`✅ Found ${lessonProgress?.length || 0} lesson progress records for Chiel`);

    // 4. Analyze progress per module
    console.log('\n4️⃣ Analyzing progress per module...');
    let totalLessons = 0;
    let totalCompleted = 0;

    modules?.forEach(module => {
      const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      const moduleProgress = lessonProgress?.filter(p => 
        p.academy_lessons.module_id === module.id
      ) || [];
      
      const completedLessons = moduleProgress.filter(p => p.completed);
      
      totalLessons += publishedLessons.length;
      totalCompleted += completedLessons.length;

      console.log(`\n   📚 ${module.title} (${module.slug}):`);
      console.log(`      Total lessons: ${publishedLessons.length}`);
      console.log(`      Completed: ${completedLessons.length}/${publishedLessons.length}`);
      console.log(`      Progress: ${publishedLessons.length > 0 ? Math.round((completedLessons.length / publishedLessons.length) * 100) : 0}%`);

      // Show individual lesson status
      publishedLessons.forEach(lesson => {
        const progress = moduleProgress.find(p => p.lesson_id === lesson.id);
        const status = progress?.completed ? '✅' : '❌';
        const completedAt = progress?.completed_at ? ` (${new Date(progress.completed_at).toLocaleDateString()})` : '';
        console.log(`         ${status} ${lesson.title}${completedAt}`);
      });
    });

    // 5. Overall completion summary
    console.log('\n5️⃣ Overall Completion Summary:');
    console.log(`📊 Total lessons across all modules: ${totalLessons}`);
    console.log(`✅ Total completed lessons: ${totalCompleted}`);
    console.log(`📈 Overall completion rate: ${totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0}%`);

    // 6. Check if Chiel has completed at least one lesson per module
    console.log('\n6️⃣ Checking module completion criteria...');
    const modulesWithProgress = modules?.filter(module => {
      const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      const moduleProgress = lessonProgress?.filter(p => 
        p.academy_lessons.module_id === module.id && p.completed
      ) || [];
      
      const hasCompletedLesson = moduleProgress.length > 0;
      console.log(`   ${module.title}: ${hasCompletedLesson ? '✅' : '❌'} (${moduleProgress.length} completed)`);
      return hasCompletedLesson;
    }) || [];

    console.log(`\n🎯 Modules with at least one completed lesson: ${modulesWithProgress.length}/${modules?.length || 0}`);
    
    const allModulesCompleted = modulesWithProgress.length === (modules?.length || 0);
    console.log(`🏆 All modules completed: ${allModulesCompleted ? '✅ YES' : '❌ NO'}`);

    // 7. Check existing Academy Master badge
    console.log('\n7️⃣ Checking existing Academy Master badge...');
    const { data: existingBadge, error: badgeError } = await supabase
      .from('user_badges')
      .select(`
        id,
        unlocked_at,
        badges!inner(
          id,
          title,
          description
        )
      `)
      .eq('user_id', chiel.id)
      .eq('badges.title', 'Academy Master')
      .single();

    if (badgeError && badgeError.code !== 'PGRST116') {
      console.error('❌ Error checking badge:', badgeError);
    } else if (existingBadge) {
      console.log(`✅ Academy Master badge already unlocked: ${new Date(existingBadge.unlocked_at).toLocaleDateString()}`);
    } else {
      console.log('❌ Academy Master badge not yet unlocked');
    }

    // 8. Recommendations
    console.log('\n8️⃣ Recommendations:');
    if (allModulesCompleted && !existingBadge) {
      console.log('🎉 Chiel should receive the Academy Master badge!');
      console.log('   Run the badge assignment script to grant it.');
    } else if (!allModulesCompleted) {
      const incompleteModules = modules?.filter(module => {
        const moduleProgress = lessonProgress?.filter(p => 
          p.academy_lessons.module_id === module.id && p.completed
        ) || [];
        return moduleProgress.length === 0;
      }) || [];
      
      console.log('📝 Chiel needs to complete at least one lesson in these modules:');
      incompleteModules.forEach(module => {
        console.log(`   - ${module.title} (${module.slug})`);
      });
    } else {
      console.log('✅ Everything looks good!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkChielAcademyProgress();
