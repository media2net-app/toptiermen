-- Create workout videos bucket (simple version)
-- This script only creates the bucket without policies

-- Create the workout-videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workout-videos',
  'workout-videos',
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING; 