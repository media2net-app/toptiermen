-- V2.0: Safe RLS Policy Implementation (Only known tables)
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/wkjvstuttbeyqzyjayxj/sql

-- ========================================
-- V2.0: USERS TABLE POLICIES (BASIC)
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
-- V2.0: NUTRITION_PLANS TABLE POLICIES
-- ========================================
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view nutrition plans" ON nutrition_plans;
DROP POLICY IF EXISTS "Admins can manage nutrition plans" ON nutrition_plans;

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
-- V2.0: VERIFICATION QUERIES
-- ========================================
-- Check RLS status for basic tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'users', 'todo_tasks', 'nutrition_plans', 'meals',
    'training_schemas', 'training_schema_exercises',
    'academy_modules', 'academy_lessons', 'books'
  )
ORDER BY tablename;

-- Check policy count for basic tables
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
    'users', 'todo_tasks', 'nutrition_plans', 'meals',
    'training_schemas', 'training_schema_exercises',
    'academy_modules', 'academy_lessons', 'books'
  )
ORDER BY tablename, policyname;
