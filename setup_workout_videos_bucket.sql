-- Setup Workout Videos Storage Bucket (Deadlock Safe)
-- Run this script in your Supabase SQL Editor to create the storage bucket for workout videos

-- First, check if bucket already exists to avoid conflicts
DO $$
BEGIN
  -- Only create bucket if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'workout-videos') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'workout-videos',
      'workout-videos',
      true,
      524288000, -- 500MB limit
      ARRAY['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/quicktime']
    );
    RAISE NOTICE 'Workout videos bucket created successfully';
  ELSE
    RAISE NOTICE 'Workout videos bucket already exists';
  END IF;
END $$;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to upload workout videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update workout videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete workout videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view workout videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to workout videos" ON storage.objects;

-- Create policies with proper error handling
DO $$
BEGIN
  -- Policy to allow authenticated users to upload videos
  CREATE POLICY "Allow authenticated users to upload workout videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'workout-videos' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'exercises'
  );
  RAISE NOTICE 'Upload policy created';

  -- Policy to allow authenticated users to update their uploaded videos
  CREATE POLICY "Allow authenticated users to update workout videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'workout-videos' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'exercises'
  );
  RAISE NOTICE 'Update policy created';

  -- Policy to allow authenticated users to delete their uploaded videos
  CREATE POLICY "Allow authenticated users to delete workout videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'workout-videos' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'exercises'
  );
  RAISE NOTICE 'Delete policy created';

  -- Policy to allow all authenticated users to view workout videos
  CREATE POLICY "Allow authenticated users to view workout videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'workout-videos' 
    AND auth.role() = 'authenticated'
  );
  RAISE NOTICE 'View policy created';

  -- Policy to allow public access to workout videos (for viewing)
  CREATE POLICY "Allow public access to workout videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'workout-videos'
  );
  RAISE NOTICE 'Public access policy created';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- Verify the bucket was created
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'workout-videos'; 