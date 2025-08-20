-- Create videos table for advertisement material
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  duration_seconds INTEGER,
  width INTEGER,
  height INTEGER,
  target_audience TEXT,
  campaign_status VARCHAR(20) DEFAULT 'inactive' CHECK (campaign_status IN ('active', 'inactive')),
  bucket_name VARCHAR(100) DEFAULT 'advertenties',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_videos_bucket_name ON videos(bucket_name);
CREATE INDEX IF NOT EXISTS idx_videos_campaign_status ON videos(campaign_status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own videos" ON videos
  FOR SELECT USING (auth.uid() = created_by OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin' OR role = 'marketing'
  ));

CREATE POLICY "Users can insert their own videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own videos" ON videos
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin' OR role = 'marketing'
  ));

CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE USING (auth.uid() = created_by OR auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin' OR role = 'marketing'
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_videos_updated_at 
  BEFORE UPDATE ON videos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
