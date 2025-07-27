-- Create onboarding_status table
CREATE TABLE IF NOT EXISTS onboarding_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    welcome_video_watched BOOLEAN DEFAULT FALSE,
    step_1_completed BOOLEAN DEFAULT FALSE,
    step_2_completed BOOLEAN DEFAULT FALSE,
    step_3_completed BOOLEAN DEFAULT FALSE,
    step_4_completed BOOLEAN DEFAULT FALSE,
    step_5_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    current_step INTEGER DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_status_user_id ON onboarding_status(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status_completed ON onboarding_status(onboarding_completed);

-- Enable RLS
ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own onboarding status" ON onboarding_status
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding status" ON onboarding_status
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding status" ON onboarding_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_onboarding_status_updated_at
    BEFORE UPDATE ON onboarding_status
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_status_updated_at();

-- Insert onboarding status for existing users (mark as completed)
INSERT INTO onboarding_status (user_id, welcome_video_watched, step_1_completed, step_2_completed, step_3_completed, step_4_completed, step_5_completed, onboarding_completed, current_step, completed_at)
SELECT 
    id as user_id,
    TRUE as welcome_video_watched,
    TRUE as step_1_completed,
    TRUE as step_2_completed,
    TRUE as step_3_completed,
    TRUE as step_4_completed,
    TRUE as step_5_completed,
    TRUE as onboarding_completed,
    6 as current_step,
    NOW() as completed_at
FROM auth.users
WHERE id != '14d7c55b-4ccd-453f-b79f-403f306f1efb' -- Exclude rob
ON CONFLICT (user_id) DO NOTHING;

-- Insert onboarding status for rob (new user, needs onboarding)
INSERT INTO onboarding_status (user_id, welcome_video_watched, step_1_completed, step_2_completed, step_3_completed, step_4_completed, step_5_completed, onboarding_completed, current_step)
VALUES (
    '14d7c55b-4ccd-453f-b79f-403f306f1efb', -- rob's user ID
    FALSE, -- welcome_video_watched
    FALSE, -- step_1_completed
    FALSE, -- step_2_completed
    FALSE, -- step_3_completed
    FALSE, -- step_4_completed
    FALSE, -- step_5_completed
    FALSE, -- onboarding_completed
    1 -- current_step
)
ON CONFLICT (user_id) DO NOTHING; 