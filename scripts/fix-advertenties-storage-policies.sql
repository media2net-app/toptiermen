-- Fix Advertenties Storage Bucket RLS Policies
-- This script adds the necessary policies to allow authenticated users to upload, read, and delete files

-- First, ensure the bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'advertenties',
  'advertenties',
  false, -- Private bucket for security
  536870912, -- 500MB limit
  ARRAY['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv', 'video/m4v']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to upload files to advertenties bucket
CREATE POLICY "Allow authenticated users to upload to advertenties" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'advertenties' 
  AND auth.role() = 'authenticated'
);

-- Policy for authenticated users to read files from advertenties bucket
CREATE POLICY "Allow authenticated users to read from advertenties" ON storage.objects
FOR SELECT USING (
  bucket_id = 'advertenties' 
  AND auth.role() = 'authenticated'
);

-- Policy for authenticated users to update their own files in advertenties bucket
CREATE POLICY "Allow authenticated users to update advertenties" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'advertenties' 
  AND auth.role() = 'authenticated'
);

-- Policy for authenticated users to delete their own files from advertenties bucket
CREATE POLICY "Allow authenticated users to delete from advertenties" ON storage.objects
FOR DELETE USING (
  bucket_id = 'advertenties' 
  AND auth.role() = 'authenticated'
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Verify the policies were created
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
