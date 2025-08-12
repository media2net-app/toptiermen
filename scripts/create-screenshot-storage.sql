-- Create storage bucket for bug screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bug-screenshots',
  'bug-screenshots',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the storage bucket
-- Allow authenticated users to upload screenshots
CREATE POLICY "Allow authenticated users to upload screenshots" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'bug-screenshots' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to screenshots
CREATE POLICY "Allow public read access to screenshots" ON storage.objects
FOR SELECT USING (
  bucket_id = 'bug-screenshots'
);

-- Allow authenticated users to update their own screenshots
CREATE POLICY "Allow authenticated users to update screenshots" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'bug-screenshots' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own screenshots
CREATE POLICY "Allow authenticated users to delete screenshots" ON storage.objects
FOR DELETE USING (
  bucket_id = 'bug-screenshots' 
  AND auth.role() = 'authenticated'
);

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 