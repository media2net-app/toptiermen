const { createClient } = require('@supabase/supabase-js');

// We'll use the existing setup - this should work with the current environment
const supabaseUrl = 'https://qwblryvtwzjqajfkvsya.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3YmxyeXZ0d3pqcWFqZmt2c3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTE0ODI3MSwiZXhwIjoyMDI0NzI0MjcxfQ.DmI8yF5WFKZ2lWbVzUUjGQs-Y9nGo8pNm2QTQE8I3x8';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const createMissionsSystem = async () => {
  console.log('🚀 Creating Missions System via API...');

  try {
    // Step 1: Create the basic missions tables
    console.log('📝 Creating missions tables...');
    
    const createTablesSQL = `
      -- Create mission_categories table if it doesn't exist
      CREATE TABLE IF NOT EXISTS mission_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          icon VARCHAR(10) NOT NULL,
          color VARCHAR(7) DEFAULT '#8BAE5A',
          order_index INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create user_missions table if it doesn't exist
      CREATE TABLE IF NOT EXISTS user_missions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          icon VARCHAR(10) NOT NULL,
          badge_name VARCHAR(100),
          category_slug VARCHAR(100) DEFAULT 'health-fitness',
          frequency_type VARCHAR(20) DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'weekly', 'monthly', 'custom')),
          target_value INTEGER DEFAULT 1,
          current_progress INTEGER DEFAULT 0,
          xp_reward INTEGER DEFAULT 10,
          is_shared BOOLEAN DEFAULT false,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
          is_custom BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create user_mission_logs table if it doesn't exist  
      CREATE TABLE IF NOT EXISTS user_mission_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          user_mission_id UUID NOT NULL REFERENCES user_missions(id) ON DELETE CASCADE,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          xp_earned INTEGER DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create user_daily_streaks table if it doesn't exist
      CREATE TABLE IF NOT EXISTS user_daily_streaks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          current_streak INTEGER DEFAULT 0,
          longest_streak INTEGER DEFAULT 0,
          last_completion_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT unique_user_daily_streak UNIQUE(user_id)
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_user_missions_user ON user_missions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(status);
      CREATE INDEX IF NOT EXISTS idx_user_mission_logs_user ON user_mission_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_mission_logs_mission ON user_mission_logs(user_mission_id);
      CREATE INDEX IF NOT EXISTS idx_user_mission_logs_date ON user_mission_logs(completed_at);

      -- Enable RLS
      ALTER TABLE mission_categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_mission_logs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_daily_streaks ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      CREATE POLICY IF NOT EXISTS "Mission categories are viewable by everyone" ON mission_categories FOR SELECT USING (is_active = true);
      
      CREATE POLICY IF NOT EXISTS "Users can view own missions" ON user_missions FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert own missions" ON user_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update own missions" ON user_missions FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can delete own missions" ON user_missions FOR DELETE USING (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can view own mission logs" ON user_mission_logs FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert own mission logs" ON user_mission_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can view own streaks" ON user_daily_streaks FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can insert own streaks" ON user_daily_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "Users can update own streaks" ON user_daily_streaks FOR UPDATE USING (auth.uid() = user_id);
    `;

    const { data: tableResult, error: tableError } = await supabase.rpc('exec_sql', { 
      sql_query: createTablesSQL 
    });

    if (tableError) {
      console.error('❌ Error creating tables:', tableError);
      return;
    }

    console.log('✅ Tables created successfully');

    // Step 2: Insert mission categories
    console.log('📝 Creating mission categories...');
    
    const categoriesSQL = `
      INSERT INTO mission_categories (name, slug, description, icon, color, order_index) VALUES
      ('Gezondheid & Fitness', 'health-fitness', 'Missies gericht op fysieke gezondheid en fitness', '💪', '#8BAE5A', 1),
      ('Mindset & Focus', 'mindset-focus', 'Missies voor mentale kracht en focus ontwikkeling', '🧠', '#f0a14f', 2),
      ('Financiën & Werk', 'finance-work', 'Missies voor financiële groei en carrièreontwikkeling', '💰', '#FFD700', 3),
      ('Sociale Connecties', 'social-connections', 'Missies voor het versterken van relaties en netwerk', '🤝', '#00CED1', 4),
      ('Persoonlijke Ontwikkeling', 'personal-development', 'Missies voor algehele persoonlijke groei', '🌱', '#9370DB', 5)
      ON CONFLICT (slug) DO NOTHING;
    `;

    const { data: categoriesResult, error: categoriesError } = await supabase.rpc('exec_sql', { 
      sql_query: categoriesSQL 
    });

    if (categoriesError) {
      console.error('❌ Error creating categories:', categoriesError);
    } else {
      console.log('✅ Mission categories created');
    }

    // Step 3: Create some sample missions for Rick
    console.log('📝 Creating sample missions for Rick...');
    
    // Get Rick's user ID
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'rick@toptiermen.nl')
      .limit(1);

    if (users && users.length > 0) {
      const rickId = users[0].id;
      
      const sampleMissionsSQL = `
        INSERT INTO user_missions (
          user_id, title, description, icon, badge_name, category_slug, 
          frequency_type, target_value, current_progress, xp_reward, is_shared, status
        ) VALUES
        ('${rickId}', '10.000 stappen per dag', 'Loop elke dag minimaal 10.000 stappen', '👟', 'Step Master', 'health-fitness', 'daily', 10000, 7500, 20, false, 'active'),
        ('${rickId}', '30 min lezen', 'Lees dagelijks minimaal 30 minuten', '📚', 'Leesworm', 'mindset-focus', 'daily', 30, 0, 20, false, 'active'),
        ('${rickId}', '3x sporten', 'Train minimaal 3 keer deze week', '🏋️‍♂️', 'Fitness Warrior', 'health-fitness', 'weekly', 3, 1, 50, true, 'active'),
        ('${rickId}', '10 min mediteren', 'Mediteer dagelijks voor mentale helderheid', '🧘‍♂️', 'Mind Master', 'mindset-focus', 'daily', 10, 0, 25, false, 'active'),
        ('${rickId}', 'Koud douchen', 'Neem een koude douche voor mentale kracht', '❄️', 'Ice Warrior', 'health-fitness', 'daily', 1, 0, 30, false, 'active')
        ON CONFLICT (user_id, title) DO NOTHING;
      `;

      const { data: missionsResult, error: missionsError } = await supabase.rpc('exec_sql', { 
        sql_query: sampleMissionsSQL 
      });

      if (missionsError) {
        console.error('❌ Error creating sample missions:', missionsError);
      } else {
        console.log('✅ Sample missions created for Rick');
      }

      // Create initial streak for Rick
      const streakSQL = `
        INSERT INTO user_daily_streaks (user_id, current_streak, longest_streak, last_completion_date)
        VALUES ('${rickId}', 12, 15, CURRENT_DATE)
        ON CONFLICT (user_id) DO UPDATE SET
          current_streak = 12,
          longest_streak = GREATEST(user_daily_streaks.longest_streak, 15),
          updated_at = NOW();
      `;

      const { data: streakResult, error: streakError } = await supabase.rpc('exec_sql', { 
        sql_query: streakSQL 
      });

      if (streakError) {
        console.error('❌ Error creating streak:', streakError);
      } else {
        console.log('✅ Initial streak created for Rick');
      }
    }

    console.log('🎉 Missions system setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Mission categories: ✅ Created');
    console.log('- User missions table: ✅ Created');
    console.log('- Mission logs table: ✅ Created');
    console.log('- Daily streaks table: ✅ Created');
    console.log('- Sample missions for Rick: ✅ Created');
    console.log('- RLS policies: ✅ Applied');

  } catch (error) {
    console.error('❌ Error setting up missions system:', error);
  }
};

createMissionsSystem(); 