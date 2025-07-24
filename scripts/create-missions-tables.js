const { createClient } = require('@supabase/supabase-js');

// For testing, we'll hardcode the credentials
// In production, these should come from environment variables
const supabaseUrl = 'https://qwblryvtwzjqajfkvsya.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3YmxyeXZ0d3pqcWFqZmt2c3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTE0ODI3MSwiZXhwIjoyMDI0NzI0MjcxfQ.DmI8yF5WFKZ2lWbVzUUjGQs-Y9nGo8pNm2QTQE8I3x8'; // This is a placeholder

const supabase = createClient(supabaseUrl, serviceRoleKey);

const createMissionsTables = async () => {
  console.log('🚀 Creating missions tables...');

  try {
    // Create the tables using SQL
    const createTablesSQL = `
      -- Drop existing tables if they exist (for clean setup)
      DROP TABLE IF EXISTS user_mission_logs CASCADE;
      DROP TABLE IF EXISTS user_missions CASCADE;
      DROP TABLE IF EXISTS mission_templates CASCADE;
      DROP TABLE IF EXISTS mission_categories CASCADE;
      DROP TABLE IF EXISTS user_streaks CASCADE;

      -- Create mission_categories table
      CREATE TABLE mission_categories (
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

      -- Create mission_templates table
      CREATE TABLE mission_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          category_id UUID NOT NULL REFERENCES mission_categories(id) ON DELETE CASCADE,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          icon VARCHAR(10) NOT NULL,
          badge_name VARCHAR(100),
          difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'extreme')),
          frequency_type VARCHAR(20) DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'weekly', 'monthly', 'custom')),
          target_value INTEGER DEFAULT 1,
          target_unit VARCHAR(50) DEFAULT 'completion',
          xp_reward INTEGER DEFAULT 10,
          is_premium BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create user_missions table
      CREATE TABLE user_missions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          mission_template_id UUID REFERENCES mission_templates(id) ON DELETE SET NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          icon VARCHAR(10) NOT NULL,
          badge_name VARCHAR(100),
          category_id UUID NOT NULL REFERENCES mission_categories(id),
          frequency_type VARCHAR(20) DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'weekly', 'monthly', 'custom')),
          target_value INTEGER DEFAULT 1,
          target_unit VARCHAR(50) DEFAULT 'completion',
          current_progress INTEGER DEFAULT 0,
          xp_reward INTEGER DEFAULT 10,
          is_shared BOOLEAN DEFAULT false,
          accountability_partner_id UUID REFERENCES auth.users(id),
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
          start_date DATE DEFAULT CURRENT_DATE,
          end_date DATE,
          is_custom BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create user_mission_logs table
      CREATE TABLE user_mission_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          user_mission_id UUID NOT NULL REFERENCES user_missions(id) ON DELETE CASCADE,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          progress_value INTEGER DEFAULT 1,
          notes TEXT,
          xp_earned INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create user_streaks table
      CREATE TABLE user_streaks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          streak_type VARCHAR(50) NOT NULL,
          current_streak INTEGER DEFAULT 0,
          longest_streak INTEGER DEFAULT 0,
          last_completion_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT unique_user_streak UNIQUE(user_id, streak_type)
      );

      -- Create indexes
      CREATE INDEX idx_mission_templates_category ON mission_templates(category_id);
      CREATE INDEX idx_user_missions_user ON user_missions(user_id);
      CREATE INDEX idx_user_mission_logs_user ON user_mission_logs(user_id);
      CREATE INDEX idx_user_streaks_user ON user_streaks(user_id);

      -- Enable RLS
      ALTER TABLE mission_categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE mission_templates ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_mission_logs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

      -- RLS Policies
      CREATE POLICY "Mission categories are viewable by everyone" ON mission_categories FOR SELECT USING (is_active = true);
      CREATE POLICY "Mission templates are viewable by everyone" ON mission_templates FOR SELECT USING (is_active = true);
      
      CREATE POLICY "Users can view own missions" ON user_missions FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert own missions" ON user_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update own missions" ON user_missions FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY "Users can delete own missions" ON user_missions FOR DELETE USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can view own mission logs" ON user_mission_logs FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert own mission logs" ON user_mission_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert own streaks" ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update own streaks" ON user_streaks FOR UPDATE USING (auth.uid() = user_id);
    `;

    // Execute SQL using the rpc function
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: createTablesSQL 
    });

    if (error) {
      console.error('❌ Error creating tables:', error);
      return;
    }

    console.log('✅ Tables created successfully');
    console.log('📊 Response:', data);

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

createMissionsTables(); 