-- Add image_url column to social_posts table if it doesn't exist
ALTER TABLE social_posts 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add video_url column to social_posts table if it doesn't exist (for future use)
ALTER TABLE social_posts 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add location column to social_posts table if it doesn't exist
ALTER TABLE social_posts 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add tags column to social_posts table if it doesn't exist
ALTER TABLE social_posts 
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create social-media storage bucket if it doesn't exist
-- Note: This needs to be run manually in Supabase Dashboard > Storage
-- Bucket name: social-media
-- Public: yes
-- File size limit: 10MB
-- Allowed MIME types: image/*

