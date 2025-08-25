-- Fix foreign key relationship for push_subscriptions table
-- Execute this in Supabase Dashboard > SQL Editor

-- First, let's check the current state
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'push_subscriptions';

-- If no foreign key exists, let's add it
-- First, check if the table exists and has the right structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'push_subscriptions'
ORDER BY ordinal_position;

-- Now let's add the foreign key constraint if it doesn't exist
DO $$
BEGIN
  -- Check if foreign key constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'push_subscriptions' 
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%user_id%'
  ) THEN
    -- Add foreign key constraint
    ALTER TABLE push_subscriptions 
    ADD CONSTRAINT push_subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Foreign key constraint added successfully';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists';
  END IF;
END $$;

-- Verify the foreign key was added
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'push_subscriptions';

-- Test the relationship by trying to select with join
SELECT 
  ps.id,
  ps.user_id,
  ps.endpoint,
  ps.created_at,
  p.full_name,
  p.email
FROM push_subscriptions ps
LEFT JOIN profiles p ON ps.user_id = p.id
LIMIT 5;
