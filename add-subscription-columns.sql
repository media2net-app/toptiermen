-- Add subscription columns to profiles table
-- Run this in Supabase SQL Editor

-- Add subscription columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'basic';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(100);

-- Set default values for existing users
UPDATE profiles 
SET subscription_tier = 'basic', 
    subscription_status = 'active'
WHERE subscription_tier IS NULL;

-- Set chielvanderzee@gmail.com to basic tier explicitly
UPDATE profiles 
SET subscription_tier = 'basic', 
    subscription_status = 'active'
WHERE email = 'chielvanderzee@gmail.com';

-- Show results
SELECT email, subscription_tier, subscription_status 
FROM profiles 
WHERE email = 'chielvanderzee@gmail.com';
