-- V2.0: Fixed RLS Policy Implementation (No is_active references)
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
DROP POLICY IF EXISTS "Users can create chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON chat_messages;

CREATE POLICY "Users can view chat messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can create chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all messages" ON chat_messages
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: NUTRITION_PLANS TABLE POLICIES
-- ========================================
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view nutrition plans" ON nutrition_plans;
DROP POLICY IF EXISTS "Admins can manage nutrition plans" ON nutrition_plans;

-- V2.0: Users can view nutrition plans (only if is_active column exists)
CREATE POLICY "Users can view nutrition plans" ON nutrition_plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage nutrition plans" ON nutrition_plans
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: MEALS TABLE POLICIES
-- ========================================
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
-- V2.0: WORKOUT_SESSIONS TABLE POLICIES
-- ========================================
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON workout_sessions;

CREATE POLICY "Users can view own sessions" ON workout_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions" ON workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON workout_sessions
  FOR SELECT USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

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
-- V2.0: FORUM_POSTS TABLE POLICIES
-- ========================================
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can create forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON forum_posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON forum_posts;

CREATE POLICY "Users can view forum posts" ON forum_posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create forum posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts" ON forum_posts
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: FORUM_COMMENTS TABLE POLICIES
-- ========================================
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view forum comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can create forum comments" ON forum_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON forum_comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON forum_comments;

CREATE POLICY "Users can view forum comments" ON forum_comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create forum comments" ON forum_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON forum_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" ON forum_comments
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
-- V2.0: NOTIFICATIONS TABLE POLICIES
-- ========================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ========================================
-- V2.0: VERIFICATION CODES TABLE POLICIES
-- ========================================
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own verification codes" ON verification_codes;
DROP POLICY IF EXISTS "Admins can view all verification codes" ON verification_codes;

CREATE POLICY "Users can manage own verification codes" ON verification_codes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification codes" ON verification_codes
  FOR SELECT USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

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
    'users', 'user_badges', 'user_module_progress', 'todo_tasks',
    'push_subscriptions', 'chat_messages', 'nutrition_plans', 'meals',
    'training_schemas', 'training_schema_exercises', 'workout_sessions',
    'academy_modules', 'academy_lessons', 'forum_posts', 'forum_comments',
    'books', 'notifications', 'verification_codes'
  )
ORDER BY tablename;

-- Check policy count for each table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'user_badges', 'user_module_progress', 'todo_tasks',
    'push_subscriptions', 'chat_messages', 'nutrition_plans', 'meals',
    'training_schemas', 'training_schema_exercises', 'workout_sessions',
    'academy_modules', 'academy_lessons', 'forum_posts', 'forum_comments',
    'books', 'notifications', 'verification_codes'
  )
ORDER BY tablename, policyname;
