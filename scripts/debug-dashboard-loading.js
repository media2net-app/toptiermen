const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugDashboardLoading() {
  console.log('🔍 Debugging Dashboard Loading Issue...\n');

  try {
    // 1. Test basic connection
    console.log('1️⃣ Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1);

    if (testError) {
      console.error('❌ Supabase connection failed:', testError);
      return;
    }
    console.log('✅ Supabase connection successful');

    // 2. Get a test user
    console.log('\n2️⃣ Getting test user...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ No users found in database');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Using test user: ${testUser.email} (${testUser.id})`);

    // 3. Test each dashboard stat function individually
    console.log('\n3️⃣ Testing individual dashboard stat functions...');

    // Test missions stats
    console.log('\n   📊 Testing missions stats...');
    try {
      const { data: totalMissions, error: totalError } = await supabase
        .from('user_missions')
        .select('id')
        .eq('user_id', testUser.id)
        .eq('status', 'active');

      if (totalError) {
        console.error('   ❌ Missions query failed:', totalError);
      } else {
        console.log(`   ✅ Missions: ${totalMissions?.length || 0} active missions`);
      }
    } catch (error) {
      console.error('   ❌ Missions query error:', error.message);
    }

    // Test challenges stats
    console.log('\n   🏆 Testing challenges stats...');
    try {
      const { data: challenges, error: challengesError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', testUser.id);

      if (challengesError) {
        console.error('   ❌ Challenges query failed:', challengesError);
      } else {
        console.log(`   ✅ Challenges: ${challenges?.length || 0} total challenges`);
      }
    } catch (error) {
      console.error('   ❌ Challenges query error:', error.message);
    }

    // Test training stats
    console.log('\n   💪 Testing training stats...');
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('selected_schema_id')
        .eq('id', testUser.id)
        .single();

      if (profileError) {
        console.error('   ❌ Profile query failed:', profileError);
      } else {
        console.log(`   ✅ Profile: selected_schema_id = ${userProfile?.selected_schema_id || 'null'}`);
      }
    } catch (error) {
      console.error('   ❌ Profile query error:', error.message);
    }

    // Test academy stats (this might be the problematic one)
    console.log('\n   🎓 Testing academy stats...');
    try {
      // Test academy_modules query
      const { data: modules, error: modulesError } = await supabase
        .from('academy_modules')
        .select('id, title')
        .eq('status', 'published')
        .order('order_index');

      if (modulesError) {
        console.error('   ❌ Academy modules query failed:', modulesError);
      } else {
        console.log(`   ✅ Academy modules: ${modules?.length || 0} published modules`);
      }

      // Test user_lesson_progress query
      const { data: lessonProgress, error: lessonProgressError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', testUser.id)
        .eq('completed', true);

      if (lessonProgressError) {
        console.error('   ❌ Lesson progress query failed:', lessonProgressError);
      } else {
        console.log(`   ✅ Lesson progress: ${lessonProgress?.length || 0} completed lessons`);
      }

      // Test academy_lessons query
      if (lessonProgress && lessonProgress.length > 0) {
        const lessonIds = lessonProgress.map(p => p.lesson_id);
        const { data: lessonDetails, error: lessonDetailsError } = await supabase
          .from('academy_lessons')
          .select('id, module_id, title')
          .in('id', lessonIds);

        if (lessonDetailsError) {
          console.error('   ❌ Lesson details query failed:', lessonDetailsError);
        } else {
          console.log(`   ✅ Lesson details: ${lessonDetails?.length || 0} lesson details found`);
        }
      }
    } catch (error) {
      console.error('   ❌ Academy stats error:', error.message);
    }

    // Test brotherhood stats
    console.log('\n   👥 Testing brotherhood stats...');
    try {
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('   ❌ Total users query failed:', usersError);
      } else {
        console.log(`   ✅ Total users: ${totalUsers || 0}`);
      }
    } catch (error) {
      console.error('   ❌ Brotherhood stats error:', error.message);
    }

    // 4. Test the full dashboard API call
    console.log('\n4️⃣ Testing full dashboard API call...');
    try {
      const startTime = Date.now();
      
      // Simulate the API call by running all queries in parallel
      const [
        missionsStats,
        challengesStats,
        trainingStats,
        mindFocusStats,
        boekenkamerStats,
        financeStats,
        brotherhoodStats,
        academyStats,
        xpStats,
        userBadges
      ] = await Promise.all([
        // Missions stats
        supabase.from('user_missions').select('id').eq('user_id', testUser.id).eq('status', 'active'),
        // Challenges stats
        supabase.from('user_challenges').select('*').eq('user_id', testUser.id),
        // Training stats
        supabase.from('profiles').select('selected_schema_id').eq('id', testUser.id).single(),
        // Mind & Focus stats (placeholder)
        Promise.resolve({ data: null, error: null }),
        // Boekenkamer stats
        supabase.from('book_reviews').select('id').eq('user_id', testUser.id),
        // Finance stats
        supabase.from('profiles').select('points, rank').eq('id', testUser.id).single(),
        // Brotherhood stats
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        // Academy stats
        supabase.from('academy_modules').select('id, title').eq('status', 'published').order('order_index'),
        // XP stats
        supabase.from('profiles').select('points, rank').eq('id', testUser.id).single(),
        // User badges
        supabase.from('user_badges').select(`
          id,
          badge_id,
          unlocked_at,
          badges (
            id,
            title,
            description,
            icon_name,
            image_url,
            rarity_level,
            xp_reward
          )
        `).eq('user_id', testUser.id).order('unlocked_at', { ascending: false })
      ]);

      const endTime = Date.now();
      console.log(`✅ All dashboard queries completed in ${endTime - startTime}ms`);
      
      // Check for any errors
      const queries = [
        { name: 'Missions', result: missionsStats },
        { name: 'Challenges', result: challengesStats },
        { name: 'Training', result: trainingStats },
        { name: 'Mind Focus', result: mindFocusStats },
        { name: 'Boekenkamer', result: boekenkamerStats },
        { name: 'Finance', result: financeStats },
        { name: 'Brotherhood', result: brotherhoodStats },
        { name: 'Academy', result: academyStats },
        { name: 'XP', result: xpStats },
        { name: 'User Badges', result: userBadges }
      ];

      queries.forEach(query => {
        if (query.result.error) {
          console.error(`   ❌ ${query.name} query error:`, query.result.error);
        } else {
          console.log(`   ✅ ${query.name} query successful`);
        }
      });

    } catch (error) {
      console.error('❌ Full dashboard API test failed:', error.message);
    }

    console.log('\n🎯 Debug complete!');

  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
}

debugDashboardLoading();
