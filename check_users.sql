-- Check all users in the database
SELECT 
  id,
  email,
  full_name,
  username,
  status,
  rank,
  created_at,
  last_login,
  avatar_url
FROM users
ORDER BY created_at DESC;

-- Check RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Check if current user has access to all users
SELECT 
  current_user,
  session_user,
  current_setting('role'); 