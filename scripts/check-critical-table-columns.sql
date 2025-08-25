-- V2.0: Check critical table columns for accurate RLS policies
-- Execute this in Supabase SQL Editor to see which columns exist

-- Check columns for critical user-related tables
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'profiles', 'todo_tasks', 'user_badges', 'user_module_progress',
    'user_activities', 'user_preferences', 'user_onboarding_status',
    'push_subscriptions', 'chat_messages', 'chat_conversations',
    'nutrition_plans', 'user_nutrition_plans', 'training_schemas',
    'training_schema_exercises', 'workout_sessions', 'academy_modules',
    'academy_lessons', 'user_academy_progress', 'forum_posts',
    'books', 'social_feed_posts'
  )
  AND column_name IN ('id', 'user_id', 'assigned_to', 'created_by', 'owner_id')
ORDER BY table_name, column_name;

-- Check all columns for a few key tables to understand the structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'profiles', 'todo_tasks', 'user_badges')
ORDER BY table_name, ordinal_position;

-- Check if there are any user-related columns with different names
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'profiles', 'todo_tasks', 'user_badges', 'user_module_progress',
    'user_activities', 'user_preferences', 'user_onboarding_status',
    'push_subscriptions', 'chat_messages', 'chat_conversations',
    'nutrition_plans', 'user_nutrition_plans', 'training_schemas',
    'training_schema_exercises', 'workout_sessions', 'academy_modules',
    'academy_lessons', 'user_academy_progress', 'forum_posts',
    'books', 'social_feed_posts'
  )
  AND (
    column_name LIKE '%user%' OR 
    column_name LIKE '%id%' OR 
    column_name LIKE '%owner%' OR 
    column_name LIKE '%created%' OR 
    column_name LIKE '%assigned%'
  )
ORDER BY table_name, column_name;
