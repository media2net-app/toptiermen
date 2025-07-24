const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createChallengesTables() {
  console.log('🚀 Creating Challenges Tables...\n');

  try {
    // 1. Create challenges table
    console.log('📝 Creating challenges table...');
    const { error: challengesError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS challenges (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            category_slug VARCHAR(100) DEFAULT 'general',
            difficulty_level VARCHAR(50) DEFAULT 'medium',
            duration_days INTEGER NOT NULL,
            xp_reward INTEGER DEFAULT 100,
            badge_name VARCHAR(100),
            badge_icon VARCHAR(50),
            is_community_challenge BOOLEAN DEFAULT false,
            max_participants INTEGER,
            start_date DATE,
            end_date DATE,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

    if (challengesError) {
      console.error('❌ Error creating challenges table:', challengesError);
      return;
    }
    console.log('✅ Challenges table created');

    // 2. Create user_challenges table
    console.log('📝 Creating user_challenges table...');
    const { error: userChallengesError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS user_challenges (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
            status VARCHAR(50) DEFAULT 'active',
            progress_percentage INTEGER DEFAULT 0,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            start_date DATE DEFAULT CURRENT_DATE,
            completion_date DATE,
            last_activity_date DATE DEFAULT CURRENT_DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, challenge_id)
          );
        `
      });

    if (userChallengesError) {
      console.error('❌ Error creating user_challenges table:', userChallengesError);
      return;
    }
    console.log('✅ User challenges table created');

    // 3. Create challenge_logs table
    console.log('📝 Creating challenge_logs table...');
    const { error: logsError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS challenge_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
            user_challenge_id UUID REFERENCES user_challenges(id) ON DELETE CASCADE,
            activity_date DATE NOT NULL,
            completed BOOLEAN DEFAULT false,
            notes TEXT,
            xp_earned INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

    if (logsError) {
      console.error('❌ Error creating challenge_logs table:', logsError);
      return;
    }
    console.log('✅ Challenge logs table created');

    // 4. Create indexes
    console.log('📝 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category_slug);',
      'CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);',
      'CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);',
      'CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);',
      'CREATE INDEX IF NOT EXISTS idx_user_challenges_dates ON user_challenges(start_date, completion_date);',
      'CREATE INDEX IF NOT EXISTS idx_challenge_logs_user ON challenge_logs(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_challenge_logs_challenge ON challenge_logs(challenge_id);',
      'CREATE INDEX IF NOT EXISTS idx_challenge_logs_date ON challenge_logs(activity_date);'
    ];

    for (const index of indexes) {
      const { error: indexError } = await supabase
        .rpc('exec_sql', { sql_query: index });

      if (indexError) {
        console.error('⚠️  Error creating index:', indexError);
      }
    }
    console.log('✅ Indexes created');

    // 5. Enable RLS
    console.log('📝 Enabling RLS...');
    const rlsCommands = [
      'ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE challenge_logs ENABLE ROW LEVEL SECURITY;'
    ];

    for (const command of rlsCommands) {
      const { error: rlsError } = await supabase
        .rpc('exec_sql', { sql_query: command });

      if (rlsError) {
        console.error('⚠️  Error enabling RLS:', rlsError);
      }
    }
    console.log('✅ RLS enabled');

    // 6. Create RLS policies
    console.log('📝 Creating RLS policies...');
    const policies = [
      // Challenges policies
      `CREATE POLICY "Challenges are viewable by everyone" ON challenges FOR SELECT USING (true);`,
      `CREATE POLICY "Challenges can be created by authenticated users" ON challenges FOR INSERT WITH CHECK (auth.role() = 'authenticated');`,
      `CREATE POLICY "Challenges can be updated by authenticated users" ON challenges FOR UPDATE USING (auth.role() = 'authenticated');`,
      
      // User challenges policies
      `CREATE POLICY "Users can view their own challenges" ON user_challenges FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert their own challenges" ON user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update their own challenges" ON user_challenges FOR UPDATE USING (auth.uid() = user_id);`,
      
      // Challenge logs policies
      `CREATE POLICY "Users can view their own challenge logs" ON challenge_logs FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert their own challenge logs" ON challenge_logs FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update their own challenge logs" ON challenge_logs FOR UPDATE USING (auth.uid() = user_id);`
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase
        .rpc('exec_sql', { sql_query: policy });

      if (policyError && !policyError.message.includes('already exists')) {
        console.error('⚠️  Error creating policy:', policyError);
      }
    }
    console.log('✅ RLS policies created');

    // 7. Insert sample challenges
    console.log('📝 Inserting sample challenges...');
    const sampleChallenges = [
      {
        title: '30 Dagen Hardlopen',
        description: 'Hardloop elke dag 30 dagen lang. Begin met 5 minuten en bouw op naar 30 minuten.',
        category_slug: 'fitness',
        difficulty_level: 'medium',
        duration_days: 30,
        xp_reward: 300,
        badge_name: 'Running Warrior',
        badge_icon: '🏃‍♂️',
        is_community_challenge: false
      },
      {
        title: '21 Dagen Geen Social Media',
        description: 'Gebruik 21 dagen lang geen social media. Focus op echte connecties en productiviteit.',
        category_slug: 'mindset',
        difficulty_level: 'medium',
        duration_days: 21,
        xp_reward: 200,
        badge_name: 'Digital Detox Master',
        badge_icon: '🧠',
        is_community_challenge: false
      },
      {
        title: 'Brotherhood 30 Dagen Challenge',
        description: 'Doe samen met de Brotherhood 30 dagen lang elke dag een goede daad.',
        category_slug: 'community',
        difficulty_level: 'medium',
        duration_days: 30,
        xp_reward: 400,
        badge_name: 'Brotherhood Hero',
        badge_icon: '🤝',
        is_community_challenge: true
      },
      {
        title: '21 Dagen Push-up Challenge',
        description: 'Doe elke dag push-ups. Begin met 10 en voeg elke dag 5 toe.',
        category_slug: 'fitness',
        difficulty_level: 'easy',
        duration_days: 21,
        xp_reward: 150,
        badge_name: 'Push-up Pro',
        badge_icon: '🏋️‍♂️',
        is_community_challenge: false
      },
      {
        title: '30 Dagen Dankbaarheid',
        description: 'Schrijf elke dag 3 dingen op waar je dankbaar voor bent.',
        category_slug: 'mindset',
        difficulty_level: 'easy',
        duration_days: 30,
        xp_reward: 150,
        badge_name: 'Gratitude Guru',
        badge_icon: '🙏',
        is_community_challenge: false
      }
    ];

    for (const challenge of sampleChallenges) {
      const { error: insertError } = await supabase
        .from('challenges')
        .insert(challenge);

      if (insertError && !insertError.message.includes('duplicate key')) {
        console.error('⚠️  Error inserting challenge:', insertError);
      }
    }
    console.log('✅ Sample challenges inserted');

    console.log('\n🎉 Challenges Tables created successfully!');
    console.log('📊 Tables created: challenges, user_challenges, challenge_logs');
    console.log('🔒 RLS enabled with appropriate policies');
    console.log('📝 Sample challenges inserted');

  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

createChallengesTables(); 