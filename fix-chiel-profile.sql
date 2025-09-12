-- Fix Chiel's profile to have proper status field
UPDATE profiles 
SET 
  status = 'active',
  updated_at = NOW()
WHERE email = 'chielvanderzee@gmail.com';

-- Verify the update
SELECT id, email, full_name, package_type, status, created_at, updated_at 
FROM profiles 
WHERE email = 'chielvanderzee@gmail.com';
