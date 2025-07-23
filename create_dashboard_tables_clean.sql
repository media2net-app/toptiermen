-- Dashboard Database Tables - Clean Version
-- This script drops existing tables and recreates them
-- Run this SQL in your Supabase SQL editor

-- =====================================================
-- DROP EXISTING TABLES (if they exist)
-- =====================================================
DROP TABLE IF EXISTS user_challenge_logs CASCADE;
DROP TABLE IF EXISTS user_challenges CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_weekly_stats CASCADE;
DROP TABLE IF EXISTS user_daily_progress CASCADE;
DROP TABLE IF EXISTS user_onboarding_status CASCADE;
DROP TABLE IF EXISTS user_habit_logs CASCADE;
DROP TABLE IF EXISTS user_habits CASCADE;
DROP TABLE IF EXISTS user_missions CASCADE;
DROP TABLE IF EXISTS user_goals CASCADE;

-- =====================================================
-- 1. USER GOALS TABLE
-- =====================================================
CREATE TABLE user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'fitness', 'finance', 'mindset', 'business', 'relationships'
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20), -- 'kg', '€', '%', 'days', etc.
    deadline DATE,
    progress_percentage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE, -- Only one primary goal per user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. USER MISSIONS TABLE
-- =====================================================
CREATE TABLE user_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'challenge'
    difficulty VARCHAR(20) DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    points INTEGER DEFAULT 10,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'skipped')),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    proof TEXT, -- Description of how they completed it
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. USER HABITS TABLE
-- =====================================================
CREATE TABLE user_habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    target_count INTEGER DEFAULT 1, -- How many times per frequency period
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. USER HABIT LOGS TABLE
-- =====================================================
CREATE TABLE user_habit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES user_habits(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. USER ONBOARDING STATUS TABLE
-- =====================================================
CREATE TABLE user_onboarding_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    welcome_video_shown BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    goal_set BOOLEAN DEFAULT FALSE,
    missions_selected BOOLEAN DEFAULT FALSE,
    training_schema_selected BOOLEAN DEFAULT FALSE,
    nutrition_plan_selected BOOLEAN DEFAULT FALSE,
    challenge_started BOOLEAN DEFAULT FALSE,
    completed_steps JSONB DEFAULT '[]', -- Array of completed step IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- 6. USER DAILY PROGRESS TABLE
-- =====================================================
CREATE TABLE user_daily_progress (
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

-- =====================================================
-- 7. USER WEEKLY STATS TABLE
-- =====================================================
CREATE TABLE user_weekly_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL, -- Monday of the week
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

-- =====================================================
-- 8. USER ACHIEVEMENTS TABLE
-- =====================================================
CREATE TABLE user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL, -- 'streak', 'milestone', 'challenge', 'badge'
    title TEXT NOT NULL,
    description TEXT,
    icon VARCHAR(10), -- Emoji or icon identifier
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB, -- Additional data about the achievement
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. USER CHALLENGES TABLE
-- =====================================================
CREATE TABLE user_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_name VARCHAR(100) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50) NOT NULL, -- 'push_ups', 'plank', 'squats', 'meditation', etc.
    target_value INTEGER NOT NULL, -- Target number of reps/days/etc.
    current_value INTEGER DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. USER CHALLENGE LOGS TABLE
-- =====================================================
CREATE TABLE user_challenge_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
    value INTEGER NOT NULL, -- Number of reps/days/etc. completed
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_user_goals_active ON user_goals(is_active);
CREATE INDEX idx_user_goals_primary ON user_goals(is_primary);

CREATE INDEX idx_user_missions_user_id ON user_missions(user_id);
CREATE INDEX idx_user_missions_status ON user_missions(status);
CREATE INDEX idx_user_missions_due_date ON user_missions(due_date);

CREATE INDEX idx_user_habits_user_id ON user_habits(user_id);
CREATE INDEX idx_user_habits_active ON user_habits(is_active);

CREATE INDEX idx_user_habit_logs_user_id ON user_habit_logs(user_id);
CREATE INDEX idx_user_habit_logs_habit_id ON user_habit_logs(habit_id);
CREATE INDEX idx_user_habit_logs_date ON user_habit_logs(completed_at);

CREATE INDEX idx_user_onboarding_status_user_id ON user_onboarding_status(user_id);

CREATE INDEX idx_user_daily_progress_user_id ON user_daily_progress(user_id);
CREATE INDEX idx_user_daily_progress_date ON user_daily_progress(date);

CREATE INDEX idx_user_weekly_stats_user_id ON user_weekly_stats(user_id);
CREATE INDEX idx_user_weekly_stats_week ON user_weekly_stats(week_start_date);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON user_achievements(achievement_type);

CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_status ON user_challenges(status);

CREATE INDEX idx_user_challenge_logs_user_id ON user_challenge_logs(user_id);
CREATE INDEX idx_user_challenge_logs_challenge_id ON user_challenge_logs(challenge_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- User Goals Policies
CREATE POLICY "Users can view their own goals" ON user_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON user_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON user_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON user_goals
    FOR DELETE USING (auth.uid() = user_id);

-- User Missions Policies
CREATE POLICY "Users can view their own missions" ON user_missions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missions" ON user_missions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions" ON user_missions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own missions" ON user_missions
    FOR DELETE USING (auth.uid() = user_id);

-- User Habits Policies
CREATE POLICY "Users can view their own habits" ON user_habits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits" ON user_habits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" ON user_habits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" ON user_habits
    FOR DELETE USING (auth.uid() = user_id);

-- User Habit Logs Policies
CREATE POLICY "Users can view their own habit logs" ON user_habit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs" ON user_habit_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs" ON user_habit_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs" ON user_habit_logs
    FOR DELETE USING (auth.uid() = user_id);

-- User Onboarding Status Policies
CREATE POLICY "Users can view their own onboarding status" ON user_onboarding_status
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding status" ON user_onboarding_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding status" ON user_onboarding_status
    FOR UPDATE USING (auth.uid() = user_id);

-- User Daily Progress Policies
CREATE POLICY "Users can view their own daily progress" ON user_daily_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily progress" ON user_daily_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily progress" ON user_daily_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- User Weekly Stats Policies
CREATE POLICY "Users can view their own weekly stats" ON user_weekly_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly stats" ON user_weekly_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly stats" ON user_weekly_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- User Achievements Policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Challenges Policies
CREATE POLICY "Users can view their own challenges" ON user_challenges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges" ON user_challenges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" ON user_challenges
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges" ON user_challenges
    FOR DELETE USING (auth.uid() = user_id);

-- User Challenge Logs Policies
CREATE POLICY "Users can view their own challenge logs" ON user_challenge_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge logs" ON user_challenge_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge logs" ON user_challenge_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenge logs" ON user_challenge_logs
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_missions_updated_at BEFORE UPDATE ON user_missions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_habits_updated_at BEFORE UPDATE ON user_habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_onboarding_status_updated_at BEFORE UPDATE ON user_onboarding_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_daily_progress_updated_at BEFORE UPDATE ON user_daily_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_weekly_stats_updated_at BEFORE UPDATE ON user_weekly_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenges_updated_at BEFORE UPDATE ON user_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE user_goals IS 'Stores user goals and their progress';
COMMENT ON TABLE user_missions IS 'Stores user missions and their completion status';
COMMENT ON TABLE user_habits IS 'Stores user habits and their tracking data';
COMMENT ON TABLE user_habit_logs IS 'Stores individual habit completion logs';
COMMENT ON TABLE user_onboarding_status IS 'Tracks user onboarding completion status';
COMMENT ON TABLE user_daily_progress IS 'Stores daily progress tracking data';
COMMENT ON TABLE user_weekly_stats IS 'Stores weekly aggregated statistics';
COMMENT ON TABLE user_achievements IS 'Stores user achievements and badges';
COMMENT ON TABLE user_challenges IS 'Stores user challenges and their progress';
COMMENT ON TABLE user_challenge_logs IS 'Stores individual challenge completion logs'; 