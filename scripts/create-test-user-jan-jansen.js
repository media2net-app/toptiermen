require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUserJanJansen() {
  try {
    console.log('🧪 Creating comprehensive test user: Jan Jansen\n');
    
    const testUser = {
      email: 'jan.jansen@test.com',
      password: 'TestPassword123!',
      name: 'Jan Jansen',
      role: 'member'
    };
    
    console.log('👤 Test User Details:');
    console.log('=====================');
    console.log(`Email: ${testUser.email}`);
    console.log(`Name: ${testUser.name}`);
    console.log(`Role: ${testUser.role}`);
    console.log('');
    
    // 1. Create user account
    console.log('🔧 Step 1: Creating user account...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: {
        name: testUser.name,
        role: testUser.role
      }
    });
    
    if (authError) {
      console.log('❌ Error creating user:', authError.message);
      return;
    }
    
    console.log('✅ User account created:', authUser.user.id);
    
    // 2. Create profile
    console.log('\n📋 Step 2: Creating user profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        main_goal: 'Fysieke en mentale groei',
        created_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.log('❌ Error creating profile:', profileError.message);
    } else {
      console.log('✅ User profile created');
    }
    
    // 3. Set up onboarding status (not completed initially)
    console.log('\n📋 Step 3: Setting up onboarding status...');
    const { error: onboardingError } = await supabase
      .from('onboarding_status')
      .insert({
        user_id: authUser.user.id,
        welcome_video_watched: false,
        step_1_completed: false,
        step_2_completed: false,
        step_3_completed: false,
        step_4_completed: false,
        step_5_completed: false,
        onboarding_completed: false,
        current_step: 0
      });
    
    if (onboardingError) {
      console.log('❌ Error creating onboarding status:', onboardingError.message);
    } else {
      console.log('✅ Onboarding status created (not completed)');
    }
    
    // 4. Assign initial badges
    console.log('\n🏆 Step 4: Assigning initial badges...');
    const { data: availableBadges } = await supabase
      .from('badges')
      .select('id, title')
      .limit(3);
    
    if (availableBadges && availableBadges.length > 0) {
      for (const badge of availableBadges) {
        const { error: badgeError } = await supabase
          .from('user_badges')
          .insert({
            user_id: authUser.user.id,
            badge_id: badge.id,
            status: 'unlocked',
            progress_data: { completed: true },
            unlocked_at: new Date().toISOString()
          });
        
        if (badgeError) {
          console.log(`❌ Error assigning badge ${badge.title}:`, badgeError.message);
        } else {
          console.log(`✅ Badge assigned: ${badge.title}`);
        }
      }
    }
    
    // 5. Assign missions
    console.log('\n🎯 Step 5: Assigning missions...');
    const missions = [
      { title: 'Doe 30 push-ups', description: 'Complete 30 push-ups today', difficulty: 'medium', category: 'fitness' },
      { title: 'Mediteer 10 minuten', description: 'Meditate for 10 minutes', difficulty: 'easy', category: 'mindfulness' },
      { title: 'Lees 30 minuten', description: 'Read for 30 minutes', difficulty: 'easy', category: 'learning' },
      { title: 'Neem een koude douche', description: 'Take a cold shower', difficulty: 'hard', category: 'discipline' },
      { title: 'Maak je bed op', description: 'Make your bed', difficulty: 'easy', category: 'habits' }
    ];
    
    for (const mission of missions) {
      const { error: missionError } = await supabase
        .from('user_missions')
        .insert({
          user_id: authUser.user.id,
          title: mission.title,
          description: mission.description,
          difficulty: mission.difficulty,
          category: mission.category,
          status: 'active',
          points: 10,
          xp_reward: 50
        });
      
      if (missionError) {
        console.log(`❌ Error assigning mission ${mission.title}:`, missionError.message);
      } else {
        console.log(`✅ Mission assigned: ${mission.title}`);
      }
    }
    
    // 6. Assign nutrition plan
    console.log('\n🥗 Step 6: Assigning nutrition plan...');
    const { error: nutritionError } = await supabase
      .from('user_nutrition_plans')
      .insert({
        user_id: authUser.user.id,
        plan_type: 'balanced',
        nutrition_goals: { protein: 150, carbs: 200, fat: 60 },
        is_active: true
      });
    
    if (nutritionError) {
      console.log('❌ Error assigning nutrition plan:', nutritionError.message);
    } else {
      console.log('✅ Nutrition plan assigned');
    }
    
    // 7. Create user goals
    console.log('\n🎯 Step 7: Creating user goals...');
    const { error: goalsError } = await supabase
      .from('user_goals')
      .insert({
        user_id: authUser.user.id,
        goal_type: 'fitness',
        title: 'Bouw spiermassa op',
        description: 'Ik wil 5kg spiermassa aankomen in 3 maanden',
        target_value: 5,
        current_value: 0,
        unit: 'kg',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      });
    
    if (goalsError) {
      console.log('❌ Error creating user goals:', goalsError.message);
    } else {
      console.log('✅ User goals created');
    }
    
    // 8. Create user habits
    console.log('\n🔄 Step 8: Creating user habits...');
    const habits = [
      { name: 'Dagelijkse workout', description: 'Train elke dag minimaal 30 minuten', frequency: 'daily' },
      { name: 'Meditatie', description: 'Mediteer elke ochtend 10 minuten', frequency: 'daily' },
      { name: 'Water drinken', description: 'Drink 2L water per dag', frequency: 'daily' }
    ];
    
    for (const habit of habits) {
      const { error: habitError } = await supabase
        .from('user_habits')
        .insert({
          user_id: authUser.user.id,
          name: habit.name,
          description: habit.description,
          frequency: habit.frequency,
          status: 'active'
        });
      
      if (habitError) {
        console.log(`❌ Error creating habit ${habit.name}:`, habitError.message);
      } else {
        console.log(`✅ Habit created: ${habit.name}`);
      }
    }
    
    // 9. Create some habit logs (simulate activity)
    console.log('\n📊 Step 9: Creating habit logs...');
    const { data: userHabits } = await supabase
      .from('user_habits')
      .select('id')
      .eq('user_id', authUser.user.id);
    
    if (userHabits && userHabits.length > 0) {
      // Create logs for the last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        for (const habit of userHabits) {
          const { error: logError } = await supabase
            .from('user_habit_logs')
            .insert({
              user_id: authUser.user.id,
              habit_id: habit.id,
              completed_at: date.toISOString(),
              notes: 'Test log entry'
            });
          
          if (logError) {
            console.log(`❌ Error creating habit log:`, logError.message);
          }
        }
      }
      console.log('✅ Habit logs created (last 7 days)');
    }
    
    // 10. Create daily progress entries
    console.log('\n📈 Step 10: Creating daily progress...');
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const { error: progressError } = await supabase
        .from('user_daily_progress')
        .insert({
          user_id: authUser.user.id,
          date: date.toISOString().split('T')[0],
          missions_completed: Math.floor(Math.random() * 3) + 1,
          habits_completed: Math.floor(Math.random() * 3) + 1,
          xp_earned: Math.floor(Math.random() * 50) + 10,
          mood_score: Math.floor(Math.random() * 5) + 3,
          notes: 'Test progress entry'
        });
      
      if (progressError) {
        console.log(`❌ Error creating daily progress:`, progressError.message);
      }
    }
    console.log('✅ Daily progress entries created (last 7 days)');
    
    // 11. Create forum posts (simulate community activity)
    console.log('\n💬 Step 11: Creating forum posts...');
    const forumPosts = [
      {
        title: 'Mijn eerste week bij Top Tier Men',
        content: 'Hallo allemaal! Ik ben Jan en ben net begonnen met Top Tier Men. Wat een geweldig platform! Ik heb al mijn eerste missies voltooid en voel me al sterker.',
        category: 'introductions'
      },
      {
        title: 'Tips voor ochtendroutine',
        content: 'Ik ben op zoek naar tips voor een goede ochtendroutine. Wat doen jullie allemaal om de dag goed te beginnen?',
        category: 'lifestyle'
      }
    ];
    
    for (const post of forumPosts) {
      const { error: postError } = await supabase
        .from('forum_posts')
        .insert({
          user_id: authUser.user.id,
          title: post.title,
          content: post.content,
          category: post.category,
          status: 'published'
        });
      
      if (postError) {
        console.log(`❌ Error creating forum post:`, postError.message);
      } else {
        console.log(`✅ Forum post created: ${post.title}`);
      }
    }
    
    console.log('\n🎉 Test User Creation Complete!');
    console.log('='.repeat(50));
    console.log('✅ User account created');
    console.log('✅ Profile created');
    console.log('✅ Onboarding status set (not completed)');
    console.log('✅ Badges assigned');
    console.log('✅ Missions assigned');
    console.log('✅ Nutrition plan assigned');
    console.log('✅ Goals created');
    console.log('✅ Habits created');
    console.log('✅ Habit logs created');
    console.log('✅ Daily progress created');
    console.log('✅ Forum posts created');
    console.log('');
    console.log('📧 Login Details:');
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: ${testUser.password}`);
    console.log('');
    console.log('🔗 Test URL: https://platform.toptiermen.eu/login');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('1. Login with Jan Jansen account');
    console.log('2. Complete onboarding process');
    console.log('3. Test all platform features');
    console.log('4. Verify data consistency');
    console.log('5. Test email notifications');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUserJanJansen();
