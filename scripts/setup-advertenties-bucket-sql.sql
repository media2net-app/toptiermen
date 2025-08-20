-- Setup Advertenties Storage Bucket and RLS Policies
-- Run this script in Supabase SQL Editor

-- 1. Create the advertenties bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'advertenties',
  'advertenties',
  true,
  1073741824, -- 1GB limit
  ARRAY['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/quicktime', 'video/wmv', 'video/flv', 'video/m4v']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for advertenties videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload advertenties videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own advertenties videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own advertenties videos" ON storage.objects;

-- 4. Create new policies
-- Policy for public read access
CREATE POLICY "Public read access for advertenties videos" ON storage.objects
FOR SELECT USING (bucket_id = 'advertenties');

-- Policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload advertenties videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'advertenties' 
  AND auth.role() = 'authenticated'
);

-- Policy for users to update their own videos
CREATE POLICY "Users can update their own advertenties videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'advertenties' 
  AND auth.role() = 'authenticated'
);

-- Policy for users to delete their own videos
CREATE POLICY "Users can delete their own advertenties videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'advertenties' 
  AND auth.role() = 'authenticated'
);

-- 5. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 6. Verify the setup
SELECT 
  'Bucket created successfully' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'advertenties';

-- 7. Show created policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%advertenties%'
ORDER BY policyname;
