-- Simple Advertenties Bucket Setup
-- Run this script in Supabase SQL Editor
-- This script only creates the bucket and basic policies

-- 1. Create the advertenties bucket (if not exists)
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

-- 2. Create video upload logs table if not exists
CREATE TABLE IF NOT EXISTS video_upload_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  bucket_name TEXT NOT NULL,
  upload_status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  upload_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on video_upload_logs
ALTER TABLE video_upload_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for video_upload_logs
DROP POLICY IF EXISTS "Users can view their own video upload logs" ON video_upload_logs;
DROP POLICY IF EXISTS "Users can insert their own video upload logs" ON video_upload_logs;
DROP POLICY IF EXISTS "Users can update their own video upload logs" ON video_upload_logs;
DROP POLICY IF EXISTS "Users can delete their own video upload logs" ON video_upload_logs;

CREATE POLICY "Users can view their own video upload logs" ON video_upload_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video upload logs" ON video_upload_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video upload logs" ON video_upload_logs
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video upload logs" ON video_upload_logs
FOR DELETE USING (auth.uid() = user_id);

-- 5. Grant necessary permissions
GRANT ALL ON video_upload_logs TO authenticated;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_upload_logs_user_id ON video_upload_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_video_upload_logs_status ON video_upload_logs(upload_status);
CREATE INDEX IF NOT EXISTS idx_video_upload_logs_created_at ON video_upload_logs(created_at);

-- 7. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_video_upload_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_video_upload_logs_updated_at_trigger ON video_upload_logs;
CREATE TRIGGER update_video_upload_logs_updated_at_trigger
  BEFORE UPDATE ON video_upload_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_video_upload_logs_updated_at();

-- 9. Verify the setup
SELECT 
  'Bucket created successfully' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'advertenties';

-- 10. Show video upload logs table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'video_upload_logs'
ORDER BY ordinal_position;

-- 11. Note about storage policies
SELECT 
  'IMPORTANT: Storage policies need to be set via Supabase Dashboard' as note,
  'Go to Storage > Policies and add policies for advertenties bucket' as action;
