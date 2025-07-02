-- Create academy-werkbladen bucket and policies
-- This script sets up storage for PDF workbooks and lesson materials

-- Create the academy-werkbladen bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'academy-werkbladen',
  'academy-werkbladen',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload PDFs
CREATE POLICY "Allow authenticated users to upload workbooks" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'academy-werkbladen' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to update their uploaded PDFs
CREATE POLICY "Allow authenticated users to update workbooks" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'academy-werkbladen' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete their uploaded PDFs
CREATE POLICY "Allow authenticated users to delete workbooks" ON storage.objects
FOR DELETE USING (
  bucket_id = 'academy-werkbladen' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow all authenticated users to view workbooks
CREATE POLICY "Allow authenticated users to view workbooks" ON storage.objects
FOR SELECT USING (
  bucket_id = 'academy-werkbladen' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow public access to workbooks (for viewing/downloading)
CREATE POLICY "Allow public access to workbooks" ON storage.objects
FOR SELECT USING (
  bucket_id = 'academy-werkbladen'
); 