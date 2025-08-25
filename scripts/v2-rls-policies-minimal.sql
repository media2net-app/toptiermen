-- V2.0: Minimal RLS Policy Implementation (Only confirmed tables)
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/wkjvstuttbeyqzyjayxj/sql

-- ========================================
-- V2.0: USERS TABLE POLICIES (CONFIRMED)
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
-- V2.0: VERIFICATION QUERIES
-- ========================================
-- Check RLS status for confirmed tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'todo_tasks')
ORDER BY tablename;

-- Check policy count for confirmed tables
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
  AND tablename IN ('users', 'todo_tasks')
ORDER BY tablename, policyname;

-- Check which tables actually exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'user_badges', 'user_module_progress', 'todo_tasks',
    'push_subscriptions', 'chat_messages', 'nutrition_plans', 'meals',
    'training_schemas', 'training_schema_exercises', 'workout_sessions',
    'academy_modules', 'academy_lessons', 'forum_posts', 'forum_comments',
    'books', 'notifications', 'verification_codes'
  )
ORDER BY table_name;
