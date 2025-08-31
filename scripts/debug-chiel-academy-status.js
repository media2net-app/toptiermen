const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugChielAcademyStatus() {
  console.log('🔍 Debugging Chiel Academy Status...\n');

  try {
    // 1. Find Chiel's user ID
    console.log('1️⃣ Finding Chiel\'s user ID...');
    const { data: chielUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'chiel@media2net.nl')
      .single();

    if (userError || !chielUser) {
      console.error('❌ Error finding Chiel:', userError);
      return;
    }

    console.log(`✅ Found Chiel: ${chielUser.full_name} (${chielUser.email})`);
    console.log(`   User ID: ${chielUser.id}`);

    // 2. Check all modules and lessons
    console.log('\n2️⃣ Checking all modules and lessons...');
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select(`
        id, 
        title,
        order_index,
        status,
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

    // 3. Check Chiel's lesson progress
    console.log('\n3️⃣ Checking Chiel\'s lesson progress...');
    const { data: lessonProgress, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id, completed, completed_at')
      .eq('user_id', chielUser.id)
      .eq('completed', true);

    if (progressError) {
      console.error('❌ Error fetching lesson progress:', progressError);
      return;
    }

    console.log(`✅ Found ${lessonProgress?.length || 0} completed lessons`);

    // 4. Analyze completion per module
    console.log('\n4️⃣ Analyzing completion per module...');
    const moduleCompletion = {};
    
    // Get lesson details separately
    const lessonIds = lessonProgress?.map(p => p.lesson_id) || [];
    const { data: lessonDetails, error: lessonDetailsError } = await supabase
      .from('academy_lessons')
      .select('id, title, module_id, status')
      .in('id', lessonIds);
    
    if (lessonDetailsError) {
      console.error('❌ Error fetching lesson details:', lessonDetailsError);
      return;
    }
    
    // Create a map of lesson_id to lesson details
    const lessonDetailsMap = {};
    lessonDetails?.forEach(lesson => {
      lessonDetailsMap[lesson.id] = lesson;
    });
    
    modules?.forEach(module => {
      const publishedLessons = module.academy_lessons?.filter(l => l.status === 'published') || [];
      const completedLessons = lessonProgress?.filter(p => {
        const lessonDetail = lessonDetailsMap[p.lesson_id];
        return lessonDetail?.module_id === module.id;
      }) || [];
      
      moduleCompletion[module.id] = {
        title: module.title,
        publishedLessons: publishedLessons.length,
        completedLessons: completedLessons.length,
        isCompleted: completedLessons.length === publishedLessons.length && publishedLessons.length > 0
      };
      
      console.log(`   ${module.title}: ${completedLessons.length}/${publishedLessons.length} lessons - ${moduleCompletion[module.id].isCompleted ? '✅' : '❌'}`);
    });

    // 5. Check overall completion
    const totalModules = modules?.length || 0;
    const completedModules = Object.values(moduleCompletion).filter(m => m.isCompleted).length;
    const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    
    console.log(`\n📊 Overall Progress: ${completedModules}/${totalModules} modules (${overallProgress}%)`);
    
    const allModulesCompleted = completedModules === totalModules && totalModules > 0;
    console.log(`🎯 Academy Completed: ${allModulesCompleted ? '✅ YES' : '❌ NO'}`);

    // 6. Check Academy Master badge
    console.log('\n5️⃣ Checking Academy Master badge...');
    const { data: academyBadge, error: badgeError } = await supabase
      .from('user_badges')
      .select(`
        id,
        unlocked_at,
        status,
        badges!inner(
          id,
          title,
          description,
          icon_name,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', chielUser.id)
      .eq('badges.title', 'Academy Master')
      .single();

    if (badgeError && badgeError.code !== 'PGRST116') {
      console.error('❌ Error checking Academy Master badge:', badgeError);
    } else if (academyBadge) {
      console.log('✅ Academy Master badge found:');
      console.log(`   Badge: ${academyBadge.badges.title}`);
      console.log(`   Unlocked: ${academyBadge.unlocked_at}`);
      console.log(`   Status: ${academyBadge.status}`);
      console.log(`   Icon: ${academyBadge.badges.icon_name}`);
    } else {
      console.log('❌ Academy Master badge NOT found');
    }

    // 7. Test the API endpoint
    console.log('\n6️⃣ Testing API endpoint...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/badges/check-academy-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: chielUser.id }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:');
        console.log(`   Completed: ${data.completed}`);
        console.log(`   Already Unlocked: ${data.alreadyUnlocked || false}`);
        console.log(`   Newly Unlocked: ${data.newlyUnlocked || false}`);
        if (data.badge) {
          console.log(`   Badge: ${data.badge.title}`);
        }
      } else {
        console.error('❌ API Error:', response.status, response.statusText);
      }
    } catch (apiError) {
      console.error('❌ API test failed:', apiError.message);
    }

    // 8. Summary and recommendations
    console.log('\n📋 SUMMARY & RECOMMENDATIONS:');
    console.log('================================');
    console.log(`   - Chiel has ${completedModules}/${totalModules} modules completed`);
    console.log(`   - Overall progress: ${overallProgress}%`);
    console.log(`   - Academy completed: ${allModulesCompleted ? 'YES' : 'NO'}`);
    console.log(`   - Academy Master badge: ${academyBadge ? 'UNLOCKED' : 'NOT UNLOCKED'}`);
    
    if (allModulesCompleted && !academyBadge) {
      console.log('\n🔧 RECOMMENDATION:');
      console.log('   Chiel should have the Academy Master badge unlocked!');
      console.log('   The API endpoint should award it when called.');
    } else if (!allModulesCompleted) {
      console.log('\n🔧 RECOMMENDATION:');
      console.log('   Chiel needs to complete more modules to unlock the badge.');
    }

  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugChielAcademyStatus();
