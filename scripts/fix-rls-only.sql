-- Fix RLS Policies for user_badges table (Only)
-- Run this script in Supabase SQL Editor

-- First, drop any existing policies on user_badges table
DROP POLICY IF EXISTS "Users can view their own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can insert their own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can update their own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can delete their own badges" ON user_badges;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_badges;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_badges;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_badges;

-- Create new policies

-- Policy 1: SELECT - Users can view their own badges
CREATE POLICY "Users can view their own badges" ON user_badges
FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: INSERT - Users can insert their own badges
CREATE POLICY "Users can insert their own badges" ON user_badges
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: UPDATE - Users can update their own badges
CREATE POLICY "Users can update their own badges" ON user_badges
FOR UPDATE USING (auth.uid() = user_id);

-- Policy 4: DELETE - Users can delete their own badges (optional)
CREATE POLICY "Users can delete their own badges" ON user_badges
FOR DELETE USING (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Show current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_badges';
