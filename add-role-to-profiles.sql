-- Add role column to profiles table
-- This script adds the missing role column that is referenced in the code

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for better performance on role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role: user or admin';

-- Update existing profiles to have 'user' role if they don't have one
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Set specific users as admin (adjust the IDs as needed)
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
  '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', -- Rick
  '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'  -- Chiel
);

-- Verify the changes
SELECT id, full_name, email, role FROM profiles ORDER BY role, full_name; 