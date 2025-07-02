-- Create module-covers bucket for academy module cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'module-covers',
  'module-covers',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Policy to allow authenticated users to upload cover images
CREATE POLICY "Allow authenticated users to upload module covers" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'module-covers' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow public read access to module covers
CREATE POLICY "Allow public read access to module covers" ON storage.objects
FOR SELECT USING (bucket_id = 'module-covers');

-- Policy to allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated users to update module covers" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'module-covers' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated users to delete module covers" ON storage.objects
FOR DELETE USING (
  bucket_id = 'module-covers' 
  AND auth.role() = 'authenticated'
); 