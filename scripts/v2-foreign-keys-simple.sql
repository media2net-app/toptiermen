-- V2.0: Simple Foreign Key Constraints Implementation
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/wkjvstuttbeyqzyjayxj/sql

-- ========================================
-- V2.0: USER_BADGES FOREIGN KEYS
-- ========================================
-- Add foreign key for user_id
ALTER TABLE user_badges 
ADD CONSTRAINT fk_user_badges_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ========================================
-- V2.0: USER_MODULE_PROGRESS FOREIGN KEYS
-- ========================================
-- Add foreign key for user_id
ALTER TABLE user_module_progress 
ADD CONSTRAINT fk_user_module_progress_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add foreign key for module_id (if column exists)
ALTER TABLE user_module_progress 
ADD CONSTRAINT fk_user_module_progress_module_id 
FOREIGN KEY (module_id) REFERENCES academy_modules(id) ON DELETE CASCADE;

-- ========================================
-- V2.0: PUSH_SUBSCRIPTIONS FOREIGN KEYS
-- ========================================
-- Add foreign key for user_id
ALTER TABLE push_subscriptions 
ADD CONSTRAINT fk_push_subscriptions_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ========================================
-- V2.0: CHAT_MESSAGES FOREIGN KEYS
-- ========================================
-- Add foreign key for sender_id
ALTER TABLE chat_messages 
ADD CONSTRAINT fk_chat_messages_sender_id 
FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add foreign key for receiver_id (if column exists)
ALTER TABLE chat_messages 
ADD CONSTRAINT fk_chat_messages_receiver_id 
FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE;

-- ========================================
-- V2.0: WORKOUT_SESSIONS FOREIGN KEYS
-- ========================================
-- Add foreign key for user_id
ALTER TABLE workout_sessions 
ADD CONSTRAINT fk_workout_sessions_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add foreign key for schema_id (if column exists)
ALTER TABLE workout_sessions 
ADD CONSTRAINT fk_workout_sessions_schema_id 
FOREIGN KEY (schema_id) REFERENCES training_schemas(id) ON DELETE SET NULL;

-- ========================================
-- V2.0: TODO_TASKS FOREIGN KEYS
-- ========================================
-- Add foreign key for created_by
ALTER TABLE todo_tasks 
ADD CONSTRAINT fk_todo_tasks_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add foreign key for updated_by
ALTER TABLE todo_tasks 
ADD CONSTRAINT fk_todo_tasks_updated_by 
FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- ========================================
-- V2.0: TRAINING_SCHEMA_EXERCISES FOREIGN KEYS
-- ========================================
-- Add foreign key for schema_id
ALTER TABLE training_schema_exercises 
ADD CONSTRAINT fk_training_schema_exercises_schema_id 
FOREIGN KEY (schema_id) REFERENCES training_schemas(id) ON DELETE CASCADE;

-- ========================================
-- V2.0: TRAINING_SCHEMA_DAYS FOREIGN KEYS
-- ========================================
-- Add foreign key for schema_id
ALTER TABLE training_schema_days 
ADD CONSTRAINT fk_training_schema_days_schema_id 
FOREIGN KEY (schema_id) REFERENCES training_schemas(id) ON DELETE CASCADE;

-- ========================================
-- V2.0: ACADEMY_LESSONS FOREIGN KEYS
-- ========================================
-- Add foreign key for module_id
ALTER TABLE academy_lessons 
ADD CONSTRAINT fk_academy_lessons_module_id 
FOREIGN KEY (module_id) REFERENCES academy_modules(id) ON DELETE CASCADE;

-- ========================================
-- V2.0: ACADEMY_EBOOKS FOREIGN KEYS
-- ========================================
-- Add foreign key for module_id
ALTER TABLE academy_ebooks 
ADD CONSTRAINT fk_academy_ebooks_module_id 
FOREIGN KEY (module_id) REFERENCES academy_modules(id) ON DELETE CASCADE;

-- ========================================
-- V2.0: VERIFICATION QUERIES
-- ========================================
SELECT 'V2.0 Foreign Key Constraints Implementation Complete!' as status;

-- Check for orphaned records
SELECT 'Checking for orphaned records...' as info;

-- Orphaned user badges
SELECT COUNT(*) as orphaned_user_badges 
FROM user_badges ub 
LEFT JOIN users u ON ub.user_id = u.id 
WHERE u.id IS NULL;

-- Orphaned module progress
SELECT COUNT(*) as orphaned_module_progress 
FROM user_module_progress ump 
LEFT JOIN users u ON ump.user_id = u.id 
WHERE u.id IS NULL;

-- Orphaned push subscriptions
SELECT COUNT(*) as orphaned_push_subscriptions 
FROM push_subscriptions ps 
LEFT JOIN auth.users u ON ps.user_id = u.id 
WHERE u.id IS NULL;

-- Orphaned chat messages
SELECT COUNT(*) as orphaned_chat_messages 
FROM chat_messages cm 
LEFT JOIN users u ON cm.sender_id = u.id 
WHERE u.id IS NULL;

-- Orphaned workout sessions
SELECT COUNT(*) as orphaned_workout_sessions 
FROM workout_sessions ws 
LEFT JOIN users u ON ws.user_id = u.id 
WHERE u.id IS NULL;

-- Orphaned training schema exercises
SELECT COUNT(*) as orphaned_training_exercises 
FROM training_schema_exercises tse 
LEFT JOIN training_schemas ts ON tse.schema_id = ts.id 
WHERE ts.id IS NULL;

-- Orphaned academy lessons
SELECT COUNT(*) as orphaned_academy_lessons 
FROM academy_lessons al 
LEFT JOIN academy_modules am ON al.module_id = am.id 
WHERE am.id IS NULL;
