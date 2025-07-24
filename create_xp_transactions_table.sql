-- =============================================
-- Create XP Transactions Table for TopTiermen
-- Execute this in Supabase SQL Editor
-- =============================================

-- Create xp_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    xp_amount INTEGER NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created ON xp_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_source ON xp_transactions(source_type, source_id);

-- Enable Row Level Security
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view own XP transactions" ON xp_transactions 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own XP transactions" ON xp_transactions 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert some sample XP transactions for testing (optional)
-- Uncomment the lines below if you want to add sample data

/*
DO $$
DECLARE
    rick_user_id UUID;
BEGIN
    -- Get Rick's user ID
    SELECT id INTO rick_user_id FROM auth.users WHERE email = 'rick@toptiermen.nl' LIMIT 1;
    
    IF rick_user_id IS NOT NULL THEN
        -- Insert sample XP transactions
        INSERT INTO xp_transactions (
            user_id, xp_amount, source_type, source_id, description
        ) VALUES
        (rick_user_id, 2500, 'initial_setup', NULL, 'Initial XP setup'),
        (rick_user_id, 20, 'mission_completion', 1, 'Missie voltooid: 10.000 stappen per dag'),
        (rick_user_id, 20, 'mission_completion', 2, 'Missie voltooid: 30 min lezen'),
        (rick_user_id, 50, 'mission_completion', 3, 'Missie voltooid: 3x sporten'),
        (rick_user_id, 25, 'mission_completion', 4, 'Missie voltooid: 10 min mediteren'),
        (rick_user_id, 30, 'mission_completion', 5, 'Missie voltooid: Koud douchen')
        ON CONFLICT DO NOTHING;
            
        RAISE NOTICE 'Sample XP transactions created for Rick!';
    ELSE
        RAISE NOTICE 'Rick user not found, skipping sample data';
    END IF;
END $$;
*/

-- Success message
SELECT 'XP Transactions table created successfully! 🎉' as result; 