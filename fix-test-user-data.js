const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTestUserData() {
  try {
    console.log('🔧 Fixing test user data...');
    
    const testUserId = 'dfac392f-631f-4c6c-a08f-0aef796f7b75';

    // 1. Create user profile
    console.log('👤 Creating user profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: testUserId,
        email: 'test.user.1756630044380@toptiermen.test',
        full_name: 'Test User',
        username: 'testuser',
        points: 150,
        rank: 'Beginner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
    } else {
      console.log('✅ Profile created successfully');
    }

    // 2. Add a challenge
    console.log('🏆 Adding a challenge...');
    const { error: challengeError } = await supabase
      .from('user_challenges')
      .insert({
        user_id: testUserId,
        challenge_id: 'daily-workout',
        status: 'active',
        current_streak: 5,
        total_days: 30,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (challengeError) {
      console.error('❌ Error adding challenge:', challengeError);
    } else {
      console.log('✅ Challenge added successfully');
    }

    // 3. Add some badges
    console.log('🏅 Adding badges...');
    const { error: badgesError } = await supabase
      .from('user_badges')
      .insert([
        {
          user_id: testUserId,
          badge_id: 'first-mission',
          unlocked_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          user_id: testUserId,
          badge_id: 'forum-intro',
          unlocked_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          user_id: testUserId,
          badge_id: 'onboarding-complete',
          unlocked_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ]);

    if (badgesError) {
      console.error('❌ Error adding badges:', badgesError);
    } else {
      console.log('✅ Badges added successfully');
    }

    // 4. Add training profile
    console.log('💪 Adding training profile...');
    const { error: trainingError } = await supabase
      .from('training_profiles')
      .insert({
        user_id: testUserId,
        experience_level: 'beginner',
        goals: ['strength', 'muscle_gain'],
        available_days: 3,
        session_duration: 60,
        equipment: ['dumbbells', 'barbell'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (trainingError) {
      console.error('❌ Error adding training profile:', trainingError);
    } else {
      console.log('✅ Training profile added successfully');
    }

    console.log('🎉 Test user data fixed! Dashboard should now show personal data.');

  } catch (error) {
    console.error('An unexpected error occurred:', error);
  } finally {
    process.exit(0);
  }
}

fixTestUserData();
