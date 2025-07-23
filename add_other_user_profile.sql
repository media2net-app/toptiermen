-- Add profile for the other user who has written posts
INSERT INTO profiles (id, email, full_name, avatar_url)
VALUES (
  '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
  'user@example.com',
  'Test User',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW(); 