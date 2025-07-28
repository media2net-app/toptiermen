-- Simple Workout Videos Storage Bucket Setup
-- This version is designed to avoid deadlocks

-- Step 1: Create bucket (only if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'workout-videos',
  'workout-videos',
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/quicktime']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'workout-videos'
);

-- Step 2: Create basic policies one by one (with proper error handling)
DO $$
BEGIN
  -- Upload policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'workout_videos_upload') THEN
    CREATE POLICY "workout_videos_upload" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'workout-videos' 
      AND auth.role() = 'authenticated'
    );
    RAISE NOTICE 'Upload policy created';
  ELSE
    RAISE NOTICE 'Upload policy already exists';
  END IF;

  -- View policy for authenticated users
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'workout_videos_view_auth') THEN
    CREATE POLICY "workout_videos_view_auth" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'workout-videos' 
      AND auth.role() = 'authenticated'
    );
    RAISE NOTICE 'View auth policy created';
  ELSE
    RAISE NOTICE 'View auth policy already exists';
  END IF;

  -- Public view policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'workout_videos_view_public') THEN
    CREATE POLICY "workout_videos_view_public" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'workout-videos'
    );
    RAISE NOTICE 'Public view policy created';
  ELSE
    RAISE NOTICE 'Public view policy already exists';
  END IF;

  -- Update policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'workout_videos_update') THEN
    CREATE POLICY "workout_videos_update" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'workout-videos' 
      AND auth.role() = 'authenticated'
    );
    RAISE NOTICE 'Update policy created';
  ELSE
    RAISE NOTICE 'Update policy already exists';
  END IF;

  -- Delete policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'workout_videos_delete') THEN
    CREATE POLICY "workout_videos_delete" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'workout-videos' 
      AND auth.role() = 'authenticated'
    );
    RAISE NOTICE 'Delete policy created';
  ELSE
    RAISE NOTICE 'Delete policy already exists';
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- Step 3: Verify setup
SELECT 
  'Bucket Status' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'workout-videos') 
    THEN '✅ Created' 
    ELSE '❌ Not found' 
  END as status
UNION ALL
SELECT 
  'Policies Status' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%workout_videos%') 
    THEN '✅ Created' 
    ELSE '❌ Not found' 
  END as status; 