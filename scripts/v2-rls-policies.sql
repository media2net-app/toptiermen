-- V2.0: Comprehensive RLS Policy Implementation
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/wkjvstuttbeyqzyjayxj/sql

-- ========================================
-- V2.0: USERS TABLE POLICIES
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- V2.0: Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- V2.0: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- V2.0: Admins can manage all users
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: USER_BADGES TABLE POLICIES
-- ========================================
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
DROP POLICY IF EXISTS "Admins can manage all badges" ON user_badges;

CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all badges" ON user_badges
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: USER_MODULE_PROGRESS TABLE POLICIES
-- ========================================
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON user_module_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_module_progress;
DROP POLICY IF EXISTS "Admins can manage all progress" ON user_module_progress;

CREATE POLICY "Users can view own progress" ON user_module_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_module_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all progress" ON user_module_progress
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: TODO_TASKS TABLE POLICIES (CRITICAL FIX)
-- ========================================
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;

-- Drop the insecure policy
DROP POLICY IF EXISTS "Allow all operations for todo_tasks" ON todo_tasks;

-- V2.0: Users can view tasks assigned to them
CREATE POLICY "Users can view assigned tasks" ON todo_tasks
  FOR SELECT USING (auth.uid()::text = assigned_to OR auth.jwt() ->> 'role' = 'admin');

-- V2.0: Users can create tasks
CREATE POLICY "Users can create tasks" ON todo_tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- V2.0: Users can update tasks assigned to them
CREATE POLICY "Users can update assigned tasks" ON todo_tasks
  FOR UPDATE USING (auth.uid()::text = assigned_to OR auth.jwt() ->> 'role' = 'admin');

-- V2.0: Users can delete tasks assigned to them
CREATE POLICY "Users can delete assigned tasks" ON todo_tasks
  FOR DELETE USING (auth.uid()::text = assigned_to OR auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: PUSH_SUBSCRIPTIONS TABLE POLICIES
-- ========================================
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON push_subscriptions;

CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON push_subscriptions
  FOR SELECT USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: CHAT_MESSAGES TABLE POLICIES
-- ========================================
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON chat_messages;

CREATE POLICY "Users can view chat messages" ON chat_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Admins can manage all messages" ON chat_messages
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: WORKOUT_SESSIONS TABLE POLICIES
-- ========================================
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Admins can manage all sessions" ON workout_sessions;

CREATE POLICY "Users can view own sessions" ON workout_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions" ON workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all sessions" ON workout_sessions
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: NUTRITION_PLANS TABLE POLICIES
-- ========================================
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view active plans" ON nutrition_plans;
DROP POLICY IF EXISTS "Admins can manage all plans" ON nutrition_plans;

CREATE POLICY "Users can view active plans" ON nutrition_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all plans" ON nutrition_plans
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: MEALS TABLE POLICIES
-- ========================================
-- Note: meals table might not exist, so we'll create it if needed
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients JSONB,
  nutrition_info JSONB,
  category VARCHAR(100),
  difficulty VARCHAR(50),
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view meals" ON meals;
DROP POLICY IF EXISTS "Admins can manage meals" ON meals;

CREATE POLICY "Users can view meals" ON meals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage meals" ON meals
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: TRAINING_SCHEMAS TABLE POLICIES
-- ========================================
ALTER TABLE training_schemas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view training schemas" ON training_schemas;
DROP POLICY IF EXISTS "Admins can manage training schemas" ON training_schemas;

CREATE POLICY "Users can view training schemas" ON training_schemas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage training schemas" ON training_schemas
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: TRAINING_SCHEMA_EXERCISES TABLE POLICIES
-- ========================================
ALTER TABLE training_schema_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view exercises" ON training_schema_exercises;
DROP POLICY IF EXISTS "Admins can manage exercises" ON training_schema_exercises;

CREATE POLICY "Users can view exercises" ON training_schema_exercises
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage exercises" ON training_schema_exercises
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: TRAINING_SCHEMA_DAYS TABLE POLICIES
-- ========================================
ALTER TABLE training_schema_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view training days" ON training_schema_days;
DROP POLICY IF EXISTS "Admins can manage training days" ON training_schema_days;

CREATE POLICY "Users can view training days" ON training_schema_days
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage training days" ON training_schema_days
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: CHALLENGES TABLE POLICIES
-- ========================================
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view challenges" ON challenges;
DROP POLICY IF EXISTS "Admins can manage challenges" ON challenges;

CREATE POLICY "Users can view challenges" ON challenges
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage challenges" ON challenges
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: MISSIONS TABLE POLICIES
-- ========================================
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view missions" ON missions;
DROP POLICY IF EXISTS "Admins can manage missions" ON missions;

CREATE POLICY "Users can view missions" ON missions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage missions" ON missions
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: ACADEMY_MODULES TABLE POLICIES
-- ========================================
ALTER TABLE academy_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view academy modules" ON academy_modules;
DROP POLICY IF EXISTS "Admins can manage academy modules" ON academy_modules;

CREATE POLICY "Users can view academy modules" ON academy_modules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage academy modules" ON academy_modules
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: ACADEMY_LESSONS TABLE POLICIES
-- ========================================
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view academy lessons" ON academy_lessons;
DROP POLICY IF EXISTS "Admins can manage academy lessons" ON academy_lessons;

CREATE POLICY "Users can view academy lessons" ON academy_lessons
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage academy lessons" ON academy_lessons
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: ACADEMY_EBOOKS TABLE POLICIES
-- ========================================
ALTER TABLE academy_ebooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view academy ebooks" ON academy_ebooks;
DROP POLICY IF EXISTS "Admins can manage academy ebooks" ON academy_ebooks;

CREATE POLICY "Users can view academy ebooks" ON academy_ebooks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage academy ebooks" ON academy_ebooks
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: BOOKS TABLE POLICIES
-- ========================================
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view books" ON books;
DROP POLICY IF EXISTS "Admins can manage books" ON books;

CREATE POLICY "Users can view books" ON books
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage books" ON books
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: NUTRITION_INGREDIENTS TABLE POLICIES
-- ========================================
ALTER TABLE nutrition_ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view nutrition ingredients" ON nutrition_ingredients;
DROP POLICY IF EXISTS "Admins can manage nutrition ingredients" ON nutrition_ingredients;

CREATE POLICY "Users can view nutrition ingredients" ON nutrition_ingredients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage nutrition ingredients" ON nutrition_ingredients
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: VERIFICATION QUERIES
-- ========================================
SELECT 'V2.0 RLS Policies Implementation Complete!' as status;

-- Check which tables have RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'users', 'user_badges', 'user_module_progress', 'todo_tasks',
    'push_subscriptions', 'chat_messages', 'workout_sessions',
    'nutrition_plans', 'meals', 'training_schemas',
    'training_schema_exercises', 'training_schema_days',
    'challenges', 'missions', 'academy_modules',
    'academy_lessons', 'academy_ebooks', 'books',
    'nutrition_ingredients'
  )
ORDER BY tablename;

-- Count policies per table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'user_badges', 'user_module_progress', 'todo_tasks',
    'push_subscriptions', 'chat_messages', 'workout_sessions',
    'nutrition_plans', 'meals', 'training_schemas',
    'training_schema_exercises', 'training_schema_days',
    'challenges', 'missions', 'academy_modules',
    'academy_lessons', 'academy_ebooks', 'books',
    'nutrition_ingredients'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;
