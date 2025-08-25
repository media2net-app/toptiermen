-- V2.0: Foreign Key Constraints Implementation
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/wkjvstuttbeyqzyjayxj/sql

-- ========================================
-- V2.0: CRITICAL FOREIGN KEY CONSTRAINTS
-- ========================================

-- User-related foreign keys
ALTER TABLE user_badges 
ADD CONSTRAINT IF NOT EXISTS fk_user_badges_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_module_progress 
ADD CONSTRAINT IF NOT EXISTS fk_user_module_progress_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_activities 
ADD CONSTRAINT IF NOT EXISTS fk_user_activities_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_preferences 
ADD CONSTRAINT IF NOT EXISTS fk_user_preferences_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_onboarding_status 
ADD CONSTRAINT IF NOT EXISTS fk_user_onboarding_status_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE push_subscriptions 
ADD CONSTRAINT IF NOT EXISTS fk_push_subscriptions_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Chat-related foreign keys
ALTER TABLE chat_messages 
ADD CONSTRAINT IF NOT EXISTS fk_chat_messages_sender_id 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE chat_messages 
ADD CONSTRAINT IF NOT EXISTS fk_chat_messages_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE;

ALTER TABLE chat_conversations 
ADD CONSTRAINT IF NOT EXISTS fk_chat_conversations_participant1_id 
FOREIGN KEY (participant1_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE chat_conversations 
ADD CONSTRAINT IF NOT EXISTS fk_chat_conversations_participant2_id 
FOREIGN KEY (participant2_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Nutrition-related foreign keys
ALTER TABLE user_nutrition_plans 
ADD CONSTRAINT IF NOT EXISTS fk_user_nutrition_plans_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Training-related foreign keys
ALTER TABLE workout_sessions 
ADD CONSTRAINT IF NOT EXISTS fk_workout_sessions_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE workout_sessions 
ADD CONSTRAINT IF NOT EXISTS fk_workout_sessions_schema_id 
FOREIGN KEY (schema_id) REFERENCES training_schemas(id) ON DELETE SET NULL;

-- Academy-related foreign keys
ALTER TABLE user_academy_progress 
ADD CONSTRAINT IF NOT EXISTS fk_user_academy_progress_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Forum-related foreign keys
ALTER TABLE forum_posts 
ADD CONSTRAINT IF NOT EXISTS fk_forum_posts_author_id 
FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Social-related foreign keys
ALTER TABLE social_feed_posts 
ADD CONSTRAINT IF NOT EXISTS fk_social_feed_posts_author_id 
FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ========================================
-- V2.0: ADDITIONAL USER-RELATED FOREIGN KEYS
-- ========================================

-- User progress and data foreign keys
ALTER TABLE user_daily_progress 
ADD CONSTRAINT IF NOT EXISTS fk_user_daily_progress_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_goals 
ADD CONSTRAINT IF NOT EXISTS fk_user_goals_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_habits 
ADD CONSTRAINT IF NOT EXISTS fk_user_habits_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_missions 
ADD CONSTRAINT IF NOT EXISTS fk_user_missions_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_challenges 
ADD CONSTRAINT IF NOT EXISTS fk_user_challenges_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_training_schema_progress 
ADD CONSTRAINT IF NOT EXISTS fk_user_training_schema_progress_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_training_schema_progress 
ADD CONSTRAINT IF NOT EXISTS fk_user_training_schema_progress_schema_id 
FOREIGN KEY (schema_id) REFERENCES training_schemas(id) ON DELETE CASCADE;

ALTER TABLE user_nutrition_progress 
ADD CONSTRAINT IF NOT EXISTS fk_user_nutrition_progress_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_nutrition_progress 
ADD CONSTRAINT IF NOT EXISTS fk_user_nutrition_progress_plan_id 
FOREIGN KEY (plan_id) REFERENCES user_nutrition_plans(id) ON DELETE CASCADE;

ALTER TABLE user_lesson_progress 
ADD CONSTRAINT IF NOT EXISTS fk_user_lesson_progress_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_lesson_progress 
ADD CONSTRAINT IF NOT EXISTS fk_user_lesson_progress_lesson_id 
FOREIGN KEY (lesson_id) REFERENCES academy_lessons(id) ON DELETE CASCADE;

ALTER TABLE user_meal_customizations 
ADD CONSTRAINT IF NOT EXISTS fk_user_meal_customizations_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_meal_customizations 
ADD CONSTRAINT IF NOT EXISTS fk_user_meal_customizations_plan_id 
FOREIGN KEY (plan_id) REFERENCES user_nutrition_plans(id) ON DELETE CASCADE;

ALTER TABLE user_module_unlocks 
ADD CONSTRAINT IF NOT EXISTS fk_user_module_unlocks_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_module_unlocks 
ADD CONSTRAINT IF NOT EXISTS fk_user_module_unlocks_module_id 
FOREIGN KEY (module_id) REFERENCES academy_modules(id) ON DELETE CASCADE;

ALTER TABLE user_online_status 
ADD CONSTRAINT IF NOT EXISTS fk_user_online_status_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_presence 
ADD CONSTRAINT IF NOT EXISTS fk_user_presence_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_session_logs 
ADD CONSTRAINT IF NOT EXISTS fk_user_session_logs_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_session_summary 
ADD CONSTRAINT IF NOT EXISTS fk_user_session_summary_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_streaks 
ADD CONSTRAINT IF NOT EXISTS fk_user_streaks_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_training_day_progress 
ADD CONSTRAINT IF NOT EXISTS fk_user_training_day_progress_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_training_day_progress 
ADD CONSTRAINT IF NOT EXISTS fk_user_training_day_progress_schema_day_id 
FOREIGN KEY (schema_day_id) REFERENCES training_schema_days(id) ON DELETE CASCADE;

ALTER TABLE user_training_progress 
ADD CONSTRAINT IF NOT EXISTS fk_user_training_progress_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_weekly_stats 
ADD CONSTRAINT IF NOT EXISTS fk_user_weekly_stats_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_xp 
ADD CONSTRAINT IF NOT EXISTS fk_user_xp_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE xp_transactions 
ADD CONSTRAINT IF NOT EXISTS fk_xp_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ========================================
-- V2.0: CONTENT-RELATED FOREIGN KEYS
-- ========================================

-- Academy content foreign keys
ALTER TABLE academy_lessons 
ADD CONSTRAINT IF NOT EXISTS fk_academy_lessons_module_id 
FOREIGN KEY (module_id) REFERENCES academy_modules(id) ON DELETE CASCADE;

ALTER TABLE academy_lessons 
ADD CONSTRAINT IF NOT EXISTS fk_academy_lessons_created_by 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE academy_modules 
ADD CONSTRAINT IF NOT EXISTS fk_academy_modules_created_by 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Training content foreign keys
ALTER TABLE training_schema_exercises 
ADD CONSTRAINT IF NOT EXISTS fk_training_schema_exercises_schema_day_id 
FOREIGN KEY (schema_day_id) REFERENCES training_schema_days(id) ON DELETE CASCADE;

ALTER TABLE training_schema_exercises 
ADD CONSTRAINT IF NOT EXISTS fk_training_schema_exercises_exercise_id 
FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL;

ALTER TABLE training_schema_days 
ADD CONSTRAINT IF NOT EXISTS fk_training_schema_days_schema_id 
FOREIGN KEY (schema_id) REFERENCES training_schemas(id) ON DELETE CASCADE;

ALTER TABLE training_schemas 
ADD CONSTRAINT IF NOT EXISTS fk_training_schemas_created_by 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ========================================
-- V2.0: VERIFICATION QUERIES
-- ========================================

-- Check foreign key constraints
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'users', 'profiles', 'todo_tasks', 'user_badges', 'user_module_progress',
    'user_activities', 'user_preferences', 'user_onboarding_status',
    'push_subscriptions', 'chat_messages', 'chat_conversations',
    'nutrition_plans', 'user_nutrition_plans', 'training_schemas',
    'training_schema_exercises', 'workout_sessions', 'academy_modules',
    'academy_lessons', 'user_academy_progress', 'forum_posts',
    'books', 'social_feed_posts', 'user_daily_progress', 'user_goals',
    'user_habits', 'user_missions', 'user_challenges', 'user_training_schema_progress',
    'user_nutrition_progress', 'user_lesson_progress', 'user_meal_customizations',
    'user_module_unlocks', 'user_online_status', 'user_presence',
    'user_session_logs', 'user_session_summary', 'user_streaks',
    'user_training_day_progress', 'user_training_progress', 'user_weekly_stats',
    'user_xp', 'xp_transactions'
  )
ORDER BY tc.table_name, kcu.column_name;

-- Check for orphaned records (potential data integrity issues)
SELECT 
  'user_badges' as table_name,
  COUNT(*) as orphaned_count
FROM user_badges ub
LEFT JOIN auth.users u ON ub.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
  'user_module_progress' as table_name,
  COUNT(*) as orphaned_count
FROM user_module_progress ump
LEFT JOIN auth.users u ON ump.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
  'user_activities' as table_name,
  COUNT(*) as orphaned_count
FROM user_activities ua
LEFT JOIN auth.users u ON ua.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
  'push_subscriptions' as table_name,
  COUNT(*) as orphaned_count
FROM push_subscriptions ps
LEFT JOIN auth.users u ON ps.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
  'chat_messages' as table_name,
  COUNT(*) as orphaned_count
FROM chat_messages cm
LEFT JOIN auth.users u ON cm.sender_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
  'workout_sessions' as table_name,
  COUNT(*) as orphaned_count
FROM workout_sessions ws
LEFT JOIN auth.users u ON ws.user_id = u.id
WHERE u.id IS NULL;
