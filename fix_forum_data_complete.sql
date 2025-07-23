-- Complete fix for forum data issues
-- This script creates profiles table, updates author_ids, and ensures everything works

-- Drop and recreate profiles table
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Insert Rick's profile
INSERT INTO profiles (id, email, full_name, avatar_url)
VALUES (
  '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c',
  'rick@toptiermen.com',
  'Rick Cuijpers',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
);

-- Update all forum topics to have Rick as author
UPDATE forum_topics 
SET author_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'::uuid
WHERE author_id IS NULL;

-- Update all forum posts to have Rick as author
UPDATE forum_posts 
SET author_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'::uuid
WHERE author_id IS NULL;

-- Update all forum likes to have Rick as user
UPDATE forum_likes 
SET user_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'::uuid
WHERE user_id IS NULL;

-- Update all forum views to have Rick as user
UPDATE forum_views 
SET user_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'::uuid
WHERE user_id IS NULL; 