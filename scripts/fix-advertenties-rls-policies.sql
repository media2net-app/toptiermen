-- Fix Advertenties Bucket RLS Policies for Anonymous Access
-- Run this in Supabase SQL Editor

-- 1. First, let's check the current policies
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
WHERE tablename = 'objects' 
AND policyname LIKE '%advertenties%';

-- 2. Drop existing policies for advertenties bucket
DROP POLICY IF EXISTS "Public read access for advertenties" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload advertenties" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own advertenties" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own advertenties" ON storage.objects;

-- 3. Create new policies that allow anonymous access
-- Policy for public read access (anonymous users can read)
CREATE POLICY "Public read access for advertenties" ON storage.objects
FOR SELECT USING (bucket_id = 'advertenties');

-- Policy for authenticated upload
CREATE POLICY "Authenticated users can upload advertenties" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'advertenties' AND auth.role() = 'authenticated');

-- Policy for authenticated update
CREATE POLICY "Users can update their own advertenties" ON storage.objects
FOR UPDATE USING (bucket_id = 'advertenties' AND auth.role() = 'authenticated');

-- Policy for authenticated delete
CREATE POLICY "Users can delete their own advertenties" ON storage.objects
FOR DELETE USING (bucket_id = 'advertenties' AND auth.role() = 'authenticated');

-- 4. Verify the policies were created
SELECT 
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%advertenties%'
ORDER BY policyname;

-- 5. Check if the bucket exists and is public
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'advertenties';

-- 6. Test query to see if we can access files
SELECT 
    name,
    bucket_id,
    owner,
    created_at,
    updated_at
FROM storage.objects 
WHERE bucket_id = 'advertenties'
LIMIT 5;
