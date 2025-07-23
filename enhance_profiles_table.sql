-- Enhance profiles table with additional fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'Beginner';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS missions_completed INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;

-- Update Rick's profile with more data
UPDATE profiles 
SET 
  display_name = 'Rick Cuijpers',
  bio = 'Oprichter van Top Tier Men. Ik help mannen hun potentieel te bereiken door middel van fitness, mindset en persoonlijke ontwikkeling.',
  location = 'Nederland',
  website = 'https://toptiermen.com',
  interests = ARRAY['Fitness', 'Mindset', 'Ondernemerschap', 'Persoonlijke Ontwikkeling'],
  rank = 'Founder',
  points = 10000,
  missions_completed = 50,
  is_public = true,
  show_email = true
WHERE id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';

-- Update other user profile
UPDATE profiles 
SET 
  display_name = 'Test User',
  bio = 'Test gebruiker voor het forum.',
  location = 'Nederland',
  interests = ARRAY['Fitness', 'Gezondheid'],
  rank = 'Member',
  points = 150,
  missions_completed = 3,
  is_public = true,
  show_email = false
WHERE id = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'; 