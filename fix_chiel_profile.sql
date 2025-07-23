-- Fix Chiel's profile data by updating the profiles table with correct data from users table
UPDATE profiles 
SET 
  email = 'chiel@media2net.nl',
  full_name = 'Chiel van der Zee',
  display_name = 'Chiel',
  avatar_url = 'https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/avatars/avatar-061e43d5-c89a-42bb-8a4c-04be2ce99a7e-1753195747338.jpg',
  cover_url = 'https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/covers/cover-061e43d5-c89a-42bb-8a4c-04be2ce99a7e-1753194653327.jpg',
  bio = 'Admin van Top Tier Men platform. Focus op community building en platform ontwikkeling.',
  location = 'Nederland',
  interests = ARRAY['Platform Development', 'Community Building', 'Admin Tools', 'User Experience'],
  rank = 'Admin',
  points = 5000,
  missions_completed = 25,
  is_public = true,
  show_email = true,
  updated_at = NOW()
WHERE id = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'; 