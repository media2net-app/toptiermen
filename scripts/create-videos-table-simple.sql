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
  created_by UUID,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_videos_bucket_name ON videos(bucket_name);
CREATE INDEX IF NOT EXISTS idx_videos_campaign_status ON videos(campaign_status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view videos" ON videos
  FOR SELECT USING (true);

CREATE POLICY "Users can insert videos" ON videos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update videos" ON videos
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete videos" ON videos
  FOR DELETE USING (true);

-- Insert sample videos
INSERT INTO videos (name, original_name, file_path, file_size, mime_type, campaign_status, bucket_name, is_deleted) VALUES
('TTM_Het_Merk_Prelaunch_Reel_01_V2', 'TTM_Het_Merk_Prelaunch_Reel_01_V2.mov', '/videos/advertenties/TTM_Het_Merk_Prelaunch_Reel_01_V2.mov', 29068067, 'video/quicktime', 'active', 'advertenties', false),
('TTM_Het_Merk_Prelaunch_Reel_02_V2', 'TTM_Het_Merk_Prelaunch_Reel_02_V2.mov', '/videos/advertenties/TTM_Het_Merk_Prelaunch_Reel_02_V2.mov', 28255179, 'video/quicktime', 'active', 'advertenties', false),
('TTM_Het_Merk_Prelaunch_Reel_03_V2', 'TTM_Het_Merk_Prelaunch_Reel_03_V2.mov', '/videos/advertenties/TTM_Het_Merk_Prelaunch_Reel_03_V2.mov', 28295891, 'video/quicktime', 'active', 'advertenties', false),
('TTM_Het_Merk_Prelaunch_Reel_04_V2', 'TTM_Het_Merk_Prelaunch_Reel_04_V2.mov', '/videos/advertenties/TTM_Het_Merk_Prelaunch_Reel_04_V2.mov', 29115492, 'video/quicktime', 'inactive', 'advertenties', false),
('TTM_Het_Merk_Prelaunch_Reel_05_V2', 'TTM_Het_Merk_Prelaunch_Reel_05_V2.mov', '/videos/advertenties/TTM_Het_Merk_Prelaunch_Reel_05_V2.mov', 38721989, 'video/quicktime', 'inactive', 'advertenties', false),
('TTM_Jeugd_Prelaunch_Reel_01_V2', 'TTM_Jeugd_Prelaunch_Reel_01_V2.mov', '/videos/advertenties/TTM_Jeugd_Prelaunch_Reel_01_V2.mov', 32705119, 'video/quicktime', 'inactive', 'advertenties', false),
('TTM_Jeugd_Prelaunch_Reel_02_V2', 'TTM_Jeugd_Prelaunch_Reel_02_V2.mov', '/videos/advertenties/TTM_Jeugd_Prelaunch_Reel_02_V2.mov', 38990079, 'video/quicktime', 'inactive', 'advertenties', false),
('TTM_Vader_Prelaunch_Reel_01_V2', 'TTM_Vader_Prelaunch_Reel_01_V2.mov', '/videos/advertenties/TTM_Vader_Prelaunch_Reel_01_V2.mov', 32788453, 'video/quicktime', 'inactive', 'advertenties', false),
('TTM_Vader_Prelaunch_Reel_02_V2', 'TTM_Vader_Prelaunch_Reel_02_V2.mov', '/videos/advertenties/TTM_Vader_Prelaunch_Reel_02_V2.mov', 30234110, 'video/quicktime', 'inactive', 'advertenties', false),
('TTM_Zakelijk_Prelaunch_Reel_01_V2', 'TTM_Zakelijk_Prelaunch_Reel_01_V2.mov', '/videos/advertenties/TTM_Zakelijk_Prelaunch_Reel_01_V2.mov', 41052881, 'video/quicktime', 'inactive', 'advertenties', false),
('TTM_Zakelijk_Prelaunch_Reel_02_V2', 'TTM_Zakelijk_Prelaunch_Reel_02_V2.mov', '/videos/advertenties/TTM_Zakelijk_Prelaunch_Reel_02_V2.mov', 41056769, 'video/quicktime', 'inactive', 'advertenties', false)
ON CONFLICT (original_name) DO NOTHING;
