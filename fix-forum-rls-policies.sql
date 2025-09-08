-- Fix RLS Policies for Forum Posts
-- This script fixes the Row Level Security policies for forum_posts table

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'forum_posts';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can create forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can update their own forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can delete their own forum posts" ON forum_posts;

-- Create new policies that work correctly

-- 1. Allow authenticated users to view all forum posts
CREATE POLICY "Users can view forum posts" ON forum_posts
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- 2. Allow authenticated users to create forum posts
CREATE POLICY "Users can create forum posts" ON forum_posts
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND author_id = auth.uid()
    );

-- 3. Allow users to update their own forum posts
CREATE POLICY "Users can update their own forum posts" ON forum_posts
    FOR UPDATE 
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() = author_id
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = author_id
    );

-- 4. Allow users to delete their own forum posts
CREATE POLICY "Users can delete their own forum posts" ON forum_posts
    FOR DELETE 
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() = author_id
    );

-- Also fix forum_topics policies if needed
DROP POLICY IF EXISTS "Users can view forum topics" ON forum_topics;
DROP POLICY IF EXISTS "Users can create forum topics" ON forum_topics;
DROP POLICY IF EXISTS "Users can update their own forum topics" ON forum_topics;
DROP POLICY IF EXISTS "Users can delete their own forum topics" ON forum_topics;

-- Create forum_topics policies
CREATE POLICY "Users can view forum topics" ON forum_topics
    FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create forum topics" ON forum_topics
    FOR INSERT 
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() IS NOT NULL
        AND author_id = auth.uid()
    );

CREATE POLICY "Users can update their own forum topics" ON forum_topics
    FOR UPDATE 
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() = author_id
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = author_id
    );

CREATE POLICY "Users can delete their own forum topics" ON forum_topics
    FOR DELETE 
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() = author_id
    );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('forum_posts', 'forum_topics')
ORDER BY tablename, policyname;
