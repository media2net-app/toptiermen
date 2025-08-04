-- Push Notifications Setup for Top Tier Men
-- Execute this in Supabase Dashboard > SQL Editor

-- Create push_subscriptions table for storing user push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all push subscriptions" ON push_subscriptions;

-- Create policy to allow users to manage their own subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Create policy to allow service role to manage all push subscriptions (for sending notifications)
CREATE POLICY "Service role can manage all push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Get a valid user ID from the profiles table for testing
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Try to get a user ID from profiles table
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    -- If no user found in profiles, try auth.users
    IF test_user_id IS NULL THEN
        SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    END IF;
    
    -- If we found a valid user, insert test data
    IF test_user_id IS NOT NULL THEN
        INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key)
        VALUES (
            test_user_id,
            'https://test.endpoint.com',
            'test-p256dh-key',
            'test-auth-key'
        ) ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Test data inserted with user_id: %', test_user_id;
    ELSE
        RAISE NOTICE 'No valid user found for testing. Table created successfully.';
    END IF;
END $$;

-- Show all push subscriptions (if any)
SELECT * FROM push_subscriptions;

-- Show final table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'push_subscriptions' 
ORDER BY ordinal_position;

-- Show available users for reference
SELECT 'Available users in profiles:' as info;
SELECT id, email, full_name FROM profiles LIMIT 5;

SELECT 'Available users in auth.users:' as info;
SELECT id, email FROM auth.users LIMIT 5; 