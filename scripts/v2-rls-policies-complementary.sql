-- V2.0: Complementary RLS Policy Implementation (Only missing policies)
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/wkjvstuttbeyqzyjayxj/sql

-- ========================================
-- V2.0: CRITICAL SECURITY FIXES
-- ========================================

-- Fix the insecure todo_tasks policy (if it exists)
DROP POLICY IF EXISTS "Allow all operations for todo_tasks" ON todo_tasks;

-- ========================================
-- V2.0: TABLES THAT NEED RLS ENABLED
-- ========================================

-- Enable RLS for tables that might not have it enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_schema_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_feed_posts ENABLE ROW LEVEL SECURITY;

-- ========================================
-- V2.0: ADDITIONAL USER-RELATED TABLES THAT NEED RLS
-- ========================================

-- Enable RLS for additional user-related tables
ALTER TABLE user_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_training_schema_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meal_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_online_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_training_day_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- V2.0: ADD MISSING POLICIES FOR TABLES WITHOUT POLICIES
-- ========================================

-- Add policies for tables that might not have any policies yet
-- (Only add if they don't already exist)

-- USER_DAILY_PROGRESS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_daily_progress' 
        AND policyname = 'Users can manage own daily progress'
    ) THEN
        CREATE POLICY "Users can manage own daily progress" ON user_daily_progress
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_GOALS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_goals' 
        AND policyname = 'Users can manage own goals'
    ) THEN
        CREATE POLICY "Users can manage own goals" ON user_goals
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_HABITS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_habits' 
        AND policyname = 'Users can manage own habits'
    ) THEN
        CREATE POLICY "Users can manage own habits" ON user_habits
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_MISSIONS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_missions' 
        AND policyname = 'Users can manage own missions'
    ) THEN
        CREATE POLICY "Users can manage own missions" ON user_missions
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_CHALLENGES - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_challenges' 
        AND policyname = 'Users can manage own challenges'
    ) THEN
        CREATE POLICY "Users can manage own challenges" ON user_challenges
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_TRAINING_SCHEMA_PROGRESS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_training_schema_progress' 
        AND policyname = 'Users can manage own training progress'
    ) THEN
        CREATE POLICY "Users can manage own training progress" ON user_training_schema_progress
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_NUTRITION_PROGRESS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_nutrition_progress' 
        AND policyname = 'Users can manage own nutrition progress'
    ) THEN
        CREATE POLICY "Users can manage own nutrition progress" ON user_nutrition_progress
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_LESSON_PROGRESS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_lesson_progress' 
        AND policyname = 'Users can manage own lesson progress'
    ) THEN
        CREATE POLICY "Users can manage own lesson progress" ON user_lesson_progress
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_MEAL_CUSTOMIZATIONS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_meal_customizations' 
        AND policyname = 'Users can manage own meal customizations'
    ) THEN
        CREATE POLICY "Users can manage own meal customizations" ON user_meal_customizations
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_MODULE_UNLOCKS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_module_unlocks' 
        AND policyname = 'Users can manage own module unlocks'
    ) THEN
        CREATE POLICY "Users can manage own module unlocks" ON user_module_unlocks
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_ONLINE_STATUS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_online_status' 
        AND policyname = 'Users can manage own online status'
    ) THEN
        CREATE POLICY "Users can manage own online status" ON user_online_status
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_PRESENCE - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_presence' 
        AND policyname = 'Users can manage own presence'
    ) THEN
        CREATE POLICY "Users can manage own presence" ON user_presence
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_SESSION_LOGS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_session_logs' 
        AND policyname = 'Users can view own session logs'
    ) THEN
        CREATE POLICY "Users can view own session logs" ON user_session_logs
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_SESSION_SUMMARY - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_session_summary' 
        AND policyname = 'Users can view own session summary'
    ) THEN
        CREATE POLICY "Users can view own session summary" ON user_session_summary
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_STREAKS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_streaks' 
        AND policyname = 'Users can manage own streaks'
    ) THEN
        CREATE POLICY "Users can manage own streaks" ON user_streaks
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_TRAINING_DAY_PROGRESS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_training_day_progress' 
        AND policyname = 'Users can manage own training day progress'
    ) THEN
        CREATE POLICY "Users can manage own training day progress" ON user_training_day_progress
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_TRAINING_PROGRESS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_training_progress' 
        AND policyname = 'Users can manage own training progress'
    ) THEN
        CREATE POLICY "Users can manage own training progress" ON user_training_progress
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_WEEKLY_STATS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_weekly_stats' 
        AND policyname = 'Users can manage own weekly stats'
    ) THEN
        CREATE POLICY "Users can manage own weekly stats" ON user_weekly_stats
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- USER_XP - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_xp' 
        AND policyname = 'Users can view own xp'
    ) THEN
        CREATE POLICY "Users can view own xp" ON user_xp
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- XP_TRANSACTIONS - Add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'xp_transactions' 
        AND policyname = 'Users can view own xp transactions'
    ) THEN
        CREATE POLICY "Users can view own xp transactions" ON xp_transactions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- ========================================
-- V2.0: VERIFICATION QUERIES
-- ========================================
-- Check RLS status for all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'users', 'profiles', 'todo_tasks', 'user_badges', 'user_module_progress',
    'user_activities', 'user_preferences', 'user_onboarding_status',
    'push_subscriptions', 'chat_messages', 'chat_conversations',
    'nutrition_plans', 'user_nutrition_plans', 'training_schemas',
    'training_schema_exercises', 'workout_sessions', 'academy_modules',
    'academy_lessons', 'user_academy_progress', 'forum_posts',
    'books', 'social_feed_posts', 'user_daily_progress', 'user_goals',
    'user_habits', 'user_missions', 'user_challenges', 'user_training_schema_progress',
    'user_nutrition_progress', 'user_lesson_progress', 'user_meal_customizations',
    'user_module_unlocks', 'user_online_status', 'user_presence',
    'user_session_logs', 'user_session_summary', 'user_streaks',
    'user_training_day_progress', 'user_training_progress', 'user_weekly_stats',
    'user_xp', 'xp_transactions'
  )
ORDER BY tablename;

-- Check policy count for each table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'profiles', 'todo_tasks', 'user_badges', 'user_module_progress',
    'user_activities', 'user_preferences', 'user_onboarding_status',
    'push_subscriptions', 'chat_messages', 'chat_conversations',
    'nutrition_plans', 'user_nutrition_plans', 'training_schemas',
    'training_schema_exercises', 'workout_sessions', 'academy_modules',
    'academy_lessons', 'user_academy_progress', 'forum_posts',
    'books', 'social_feed_posts', 'user_daily_progress', 'user_goals',
    'user_habits', 'user_missions', 'user_challenges', 'user_training_schema_progress',
    'user_nutrition_progress', 'user_lesson_progress', 'user_meal_customizations',
    'user_module_unlocks', 'user_online_status', 'user_presence',
    'user_session_logs', 'user_session_summary', 'user_streaks',
    'user_training_day_progress', 'user_training_progress', 'user_weekly_stats',
    'user_xp', 'xp_transactions'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;
