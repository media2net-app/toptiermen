-- Create workout videos bucket and policies
-- This script sets up storage for workout exercise videos

-- Create the workout-videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workout-videos',
  'workout-videos',
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload videos
CREATE POLICY "Allow authenticated users to upload workout videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'workout-videos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'exercises'
);

-- Policy to allow authenticated users to update their uploaded videos
CREATE POLICY "Allow authenticated users to update workout videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'workout-videos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'exercises'
);

-- Policy to allow authenticated users to delete their uploaded videos
CREATE POLICY "Allow authenticated users to delete workout videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'workout-videos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'exercises'
);

-- Policy to allow all authenticated users to view workout videos
CREATE POLICY "Allow authenticated users to view workout videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'workout-videos' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow public access to workout videos (for viewing)
CREATE POLICY "Allow public access to workout videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'workout-videos'
); 