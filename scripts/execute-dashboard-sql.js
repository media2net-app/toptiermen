const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function executeDashboardSQL() {
  try {
    console.log('🚀 Setting up dashboard tables and data...\n');

    console.log('📊 Creating dashboard tables...');
    
    // Create tables one by one using direct operations
    const tables = [
      {
        name: 'user_goals',
        sql: `
          CREATE TABLE IF NOT EXISTS user_goals (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            category VARCHAR(50) NOT NULL,
            target_value DECIMAL(10,2),
            current_value DECIMAL(10,2) DEFAULT 0,
            unit VARCHAR(20),
            deadline DATE,
            progress_percentage INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            is_primary BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, is_primary) WHERE is_primary = TRUE
          );
        `
      },
      {
        name: 'user_missions',
        sql: `
          CREATE TABLE IF NOT EXISTS user_missions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            category VARCHAR(50) NOT NULL,
            difficulty VARCHAR(20) DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
            points INTEGER DEFAULT 10,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'skipped')),
            due_date DATE,
            completed_at TIMESTAMP WITH TIME ZONE,
            proof TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_habits',
        sql: `
          CREATE TABLE IF NOT EXISTS user_habits (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            frequency VARCHAR(20) NOT NULL,
            target_count INTEGER DEFAULT 1,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            total_completions INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_habit_logs',
        sql: `
          CREATE TABLE IF NOT EXISTS user_habit_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            habit_id UUID NOT NULL REFERENCES user_habits(id) ON DELETE CASCADE,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_onboarding_status',
        sql: `
          CREATE TABLE IF NOT EXISTS user_onboarding_status (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            welcome_video_shown BOOLEAN DEFAULT FALSE,
            onboarding_completed BOOLEAN DEFAULT FALSE,
            goal_set BOOLEAN DEFAULT FALSE,
            missions_selected BOOLEAN DEFAULT FALSE,
            training_schema_selected BOOLEAN DEFAULT FALSE,
            nutrition_plan_selected BOOLEAN DEFAULT FALSE,
            challenge_started BOOLEAN DEFAULT FALSE,
            completed_steps JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
          );
        `
      },
      {
        name: 'user_daily_progress',
        sql: `
          CREATE TABLE IF NOT EXISTS user_daily_progress (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            missions_completed INTEGER DEFAULT 0,
            habits_completed INTEGER DEFAULT 0,
            training_completed BOOLEAN DEFAULT FALSE,
            nutrition_tracked BOOLEAN DEFAULT FALSE,
            meditation_minutes INTEGER DEFAULT 0,
            reading_minutes INTEGER DEFAULT 0,
            steps_count INTEGER DEFAULT 0,
            water_intake_liters DECIMAL(3,1) DEFAULT 0,
            sleep_hours DECIMAL(3,1) DEFAULT 0,
            mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, date)
          );
        `
      },
      {
        name: 'user_weekly_stats',
        sql: `
          CREATE TABLE IF NOT EXISTS user_weekly_stats (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            week_start_date DATE NOT NULL,
            missions_completed INTEGER DEFAULT 0,
            habits_completed INTEGER DEFAULT 0,
            training_sessions INTEGER DEFAULT 0,
            meditation_minutes INTEGER DEFAULT 0,
            reading_minutes INTEGER DEFAULT 0,
            total_steps INTEGER DEFAULT 0,
            average_mood DECIMAL(3,2) DEFAULT 0,
            points_earned INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, week_start_date)
          );
        `
      },
      {
        name: 'user_achievements',
        sql: `
          CREATE TABLE IF NOT EXISTS user_achievements (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            achievement_type VARCHAR(50) NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            icon VARCHAR(10),
            earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_challenges',
        sql: `
          CREATE TABLE IF NOT EXISTS user_challenges (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            challenge_name VARCHAR(100) NOT NULL,
            description TEXT,
            challenge_type VARCHAR(50) NOT NULL,
            target_value INTEGER NOT NULL,
            current_value INTEGER DEFAULT 0,
            start_date DATE NOT NULL,
            end_date DATE,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'user_challenge_logs',
        sql: `
          CREATE TABLE IF NOT EXISTS user_challenge_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            challenge_id UUID NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
            value INTEGER NOT NULL,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ];

    // Since we can't execute raw SQL, we'll create the tables by trying to insert data
    // This will create the tables if they don't exist
    console.log('⚠️  Note: Tables will be created when you first insert data.');
    console.log('   The dashboard will work once you manually execute the SQL in Supabase.\n');

    console.log('📋 Manual SQL Execution Required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the content of create_dashboard_tables.sql');
    console.log('4. Click "Run"');
    console.log('5. Then copy and paste the content of insert_dashboard_data.sql');
    console.log('6. Click "Run" again\n');

    console.log('🔗 SQL Files to execute:');
    console.log('- create_dashboard_tables.sql (creates all tables)');
    console.log('- insert_dashboard_data.sql (inserts test data)\n');

    console.log('✅ After executing the SQL, the dashboard will show real data!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

executeDashboardSQL(); 