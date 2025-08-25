require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAcademyCompletionStatus() {
  try {
    console.log('🔧 Fixing Academy completion status for all users...\n');

    // 1. Get all published modules and their lessons
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select(`
        *,
        academy_lessons (
          id,
          title,
          status,
          order_index
        )
      `)
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`✅ Found ${modules?.length || 0} published modules`);

    // 2. Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`✅ Found ${users?.length || 0} users\n`);

    let totalUsers = 0;
    let usersWith100Percent = 0;
    let usersFixed = 0;

    // 3. Check each user's Academy progress
    for (const user of users || []) {
      totalUsers++;
      console.log(`\n👤 Checking user: ${user.full_name || 'Unknown'} (${user.email})`);

      // Get user's lesson progress
      const { data: lessonProgress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select(`
          *,
          academy_lessons (
            id,
            title,
            module_id,
            status
          )
        `)
        .eq('user_id', user.id);

      if (progressError) {
        console.error(`❌ Error fetching progress for ${user.full_name || 'Unknown'}:`, progressError);
        continue;
      }

      // Calculate completion
      let totalLessons = 0;
      let completedLessons = 0;

      modules?.forEach(module => {
        const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
        const moduleProgress = lessonProgress?.filter(p => 
          p.lesson_id && publishedLessons.some(lesson => lesson.id === p.lesson_id)
        ) || [];
        
        const completedModuleLessons = moduleProgress.filter(p => p.completed);
        
        totalLessons += publishedLessons.length;
        completedLessons += completedModuleLessons.length;
        
        console.log(`   📚 ${module.title}: ${completedModuleLessons.length}/${publishedLessons.length} lessons completed`);
      });

      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      console.log(`   📊 Progress: ${completedLessons}/${totalLessons} lessons (${progressPercentage}%)`);

      // Check if user has 100% progress
      if (progressPercentage === 100) {
        usersWith100Percent++;
        console.log(`   ✅ User has 100% progress!`);

        // Check if Academy Master badge exists
        const { data: academyBadge, error: badgeError } = await supabase
          .from('badges')
          .select('*')
          .eq('title', 'Academy Master')
          .single();

        if (badgeError || !academyBadge) {
          console.error(`   ❌ Academy Master badge not found`);
          continue;
        }

        // Check if user already has the badge
        const { data: existingBadge, error: existingError } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id)
          .eq('badge_id', academyBadge.id)
          .single();

        if (existingError && existingError.code !== 'PGRST116') {
          console.error(`   ❌ Error checking existing badge:`, existingError);
          continue;
        }

        if (!existingBadge) {
          // Assign the Academy Master badge
          const { error: assignError } = await supabase
            .from('user_badges')
            .insert({
              user_id: user.id,
              badge_id: academyBadge.id,
              unlocked_at: new Date().toISOString()
            });

          if (assignError) {
            console.error(`   ❌ Error assigning badge:`, assignError);
          } else {
            console.log(`   🏆 Academy Master badge assigned!`);
            usersFixed++;
          }
        } else {
          console.log(`   🏆 User already has Academy Master badge`);
        }

        // Ensure all module progress records are marked as completed
        for (const module of modules || []) {
          const { data: existingModuleProgress, error: moduleProgressError } = await supabase
            .from('user_module_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('module_id', module.id)
            .single();

          if (moduleProgressError && moduleProgressError.code !== 'PGRST116') {
            console.error(`   ❌ Error checking module progress:`, moduleProgressError);
            continue;
          }

          if (existingModuleProgress) {
            // Update if not completed
            if (!existingModuleProgress.completed) {
              const { error: updateError } = await supabase
                .from('user_module_progress')
                .update({
                  completed: true,
                  completed_at: new Date().toISOString()
                })
                .eq('id', existingModuleProgress.id);

              if (updateError) {
                console.error(`   ❌ Error updating module progress:`, updateError);
              } else {
                console.log(`   ✅ Updated module progress for: ${module.title}`);
              }
            }
          } else {
            // Create new module progress record
            const { error: insertError } = await supabase
              .from('user_module_progress')
              .insert({
                user_id: user.id,
                module_id: module.id,
                completed: true,
                completed_at: new Date().toISOString()
              });

            if (insertError) {
              console.error(`   ❌ Error creating module progress:`, insertError);
            } else {
              console.log(`   ✅ Created module progress for: ${module.title}`);
            }
          }
        }
      } else {
        console.log(`   ⏳ User needs to complete more lessons`);
      }
    }

    console.log(`\n🎉 Academy completion status fix completed!`);
    console.log(`📊 Summary:`);
    console.log(`   Total users checked: ${totalUsers}`);
    console.log(`   Users with 100% progress: ${usersWith100Percent}`);
    console.log(`   Users fixed (badge assigned): ${usersFixed}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAcademyCompletionStatus();
