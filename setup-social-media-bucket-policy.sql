-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on social-media" ON storage.objects;

-- Create a simple all-access policy for social-media bucket
CREATE POLICY "social-media-all-access"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'social-media')
WITH CHECK (bucket_id = 'social-media');

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%social-media%';

