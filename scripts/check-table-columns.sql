-- V2.0: Check table columns for accurate RLS policies
-- Execute this in Supabase SQL Editor to see which columns exist

-- Check columns for all tables
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'user_badges', 'user_module_progress', 'todo_tasks',
    'push_subscriptions', 'chat_messages', 'nutrition_plans', 'meals',
    'training_schemas', 'training_schema_exercises', 'workout_sessions',
    'academy_modules', 'academy_lessons', 'forum_posts', 'forum_comments',
    'books', 'notifications', 'verification_codes'
  )
ORDER BY table_name, ordinal_position;

-- Check if tables exist
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
