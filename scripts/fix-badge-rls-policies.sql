-- Fix RLS Policies for user_badges table
-- Run this script in Supabase SQL Editor

-- First, drop any existing policies on user_badges table
DROP POLICY IF EXISTS "Users can view their own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can insert their own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can update their own badges" ON user_badges;
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

-- Add some test badges for user Chiel (replace with actual user ID)
-- You can find Chiel's user ID by running: SELECT id FROM profiles WHERE full_name ILIKE '%Chiel%';

-- Example: Add badges for user (replace '061e43d5-c89a-42bb-8a4c-04be2ce99a7e' with actual user ID)
INSERT INTO user_badges (user_id, badge_id, status, unlocked_at)
VALUES 
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 1, 'unlocked', NOW()),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 2, 'unlocked', NOW()),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 3, 'unlocked', NOW()),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 4, 'unlocked', NOW()),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 5, 'unlocked', NOW())
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- Verify the badges were added
SELECT 
  ub.id,
  ub.unlocked_at,
  ub.status,
  b.title,
  b.icon_name,
  b.rarity_level,
  b.xp_reward
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE ub.user_id = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'
ORDER BY ub.unlocked_at DESC;
