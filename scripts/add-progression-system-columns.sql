-- Add columns for training schema progression system
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Add progression system columns to training_schemas table
ALTER TABLE training_schemas 
ADD COLUMN IF NOT EXISTS progression_cycle VARCHAR(50),
ADD COLUMN IF NOT EXISTS training_style VARCHAR(50),
ADD COLUMN IF NOT EXISTS intensity_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS volume_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR(20) DEFAULT '8 weeks',
ADD COLUMN IF NOT EXISTS target_audience VARCHAR(50) DEFAULT 'Intermediate to Advanced';

-- 2. Add progression tracking columns to user_training_schema_progress table
ALTER TABLE user_training_schema_progress 
ADD COLUMN IF NOT EXISTS current_week INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_weeks INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS progression_cycle VARCHAR(50),
ADD COLUMN IF NOT EXISTS next_schema_id UUID,
ADD COLUMN IF NOT EXISTS completed_cycles INTEGER DEFAULT 0;

-- 3. Create progression recommendations table
CREATE TABLE IF NOT EXISTS training_progression_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_schema_id UUID REFERENCES training_schemas(id) ON DELETE CASCADE,
  recommended_schema_id UUID REFERENCES training_schemas(id) ON DELETE CASCADE,
  progression_reason TEXT,
  estimated_completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create training cycle tracking table
CREATE TABLE IF NOT EXISTS training_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_name VARCHAR(100) NOT NULL,
  cycle_type VARCHAR(50) NOT NULL, -- 'weeks_1_8', 'weeks_9_16', 'weeks_17_24'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  current_week INTEGER DEFAULT 1,
  total_weeks INTEGER DEFAULT 8,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused'
  schema_id UUID REFERENCES training_schemas(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_schemas_progression_cycle ON training_schemas(progression_cycle);
CREATE INDEX IF NOT EXISTS idx_training_schemas_training_style ON training_schemas(training_style);
CREATE INDEX IF NOT EXISTS idx_training_schemas_intensity_level ON training_schemas(intensity_level);
CREATE INDEX IF NOT EXISTS idx_user_training_schema_progress_current_week ON user_training_schema_progress(current_week);
CREATE INDEX IF NOT EXISTS idx_training_cycles_user_id ON training_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_training_cycles_status ON training_cycles(status);

-- 6. Update existing schemas to have progression information
UPDATE training_schemas 
SET 
  progression_cycle = 'weeks_1_8',
  training_style = 'split_training',
  intensity_level = 'moderate',
  volume_level = 'high',
  estimated_duration = '8 weeks',
  target_audience = 'Intermediate to Advanced'
WHERE progression_cycle IS NULL 
AND name LIKE '%Spiermassa%';

-- 7. Create view for progression overview
CREATE OR REPLACE VIEW training_progression_overview AS
SELECT 
  ts.id,
  ts.name,
  ts.training_goal,
  ts.progression_cycle,
  ts.training_style,
  ts.intensity_level,
  ts.volume_level,
  ts.rep_range,
  ts.rest_time_seconds,
  ts.estimated_duration,
  ts.target_audience,
  COUNT(tsd.id) as total_days,
  COUNT(tse.id) as total_exercises
FROM training_schemas ts
LEFT JOIN training_schema_days tsd ON ts.id = tsd.schema_id
LEFT JOIN training_schema_exercises tse ON tsd.id = tse.schema_day_id
WHERE ts.status = 'published'
GROUP BY ts.id, ts.name, ts.training_goal, ts.progression_cycle, ts.training_style, 
         ts.intensity_level, ts.volume_level, ts.rep_range, ts.rest_time_seconds, 
         ts.estimated_duration, ts.target_audience;

-- 8. Verify the changes
SELECT 
  'Progression system columns added successfully!' as status,
  COUNT(*) as total_schemas,
  COUNT(CASE WHEN progression_cycle IS NOT NULL THEN 1 END) as schemas_with_progression,
  COUNT(CASE WHEN training_style IS NOT NULL THEN 1 END) as schemas_with_style,
  COUNT(CASE WHEN intensity_level IS NOT NULL THEN 1 END) as schemas_with_intensity
FROM training_schemas;

SELECT 
  'Progression tables created successfully!' as status,
  (SELECT COUNT(*) FROM training_progression_recommendations) as recommendations_count,
  (SELECT COUNT(*) FROM training_cycles) as cycles_count;
