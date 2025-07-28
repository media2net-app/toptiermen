-- =====================================================
-- ADD AFFILIATE FIELDS TO PROFILES TABLE
-- =====================================================

-- Add affiliate fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS affiliate_code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS affiliate_status VARCHAR(20) DEFAULT 'inactive' CHECK (affiliate_status IN ('active', 'inactive', 'suspended')),
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS monthly_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_referral TIMESTAMP WITH TIME ZONE;

-- Create index for affiliate code lookups
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON profiles(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_status ON profiles(affiliate_status);

-- Update existing profiles with default affiliate codes
UPDATE profiles 
SET affiliate_code = UPPER(REPLACE(COALESCE(full_name, 'USER'), ' ', '')) || SUBSTRING(id::text, -6)
WHERE affiliate_code IS NULL;

-- Set specific affiliate code for Chiel
UPDATE profiles 
SET affiliate_code = 'CHIEL10'
WHERE full_name ILIKE '%chiel%' OR email ILIKE '%chiel%';

-- Add comments
COMMENT ON COLUMN profiles.affiliate_code IS 'Unique affiliate code for referral links';
COMMENT ON COLUMN profiles.affiliate_status IS 'Status of affiliate account';
COMMENT ON COLUMN profiles.total_referrals IS 'Total number of successful referrals';
COMMENT ON COLUMN profiles.active_referrals IS 'Number of active referrals';
COMMENT ON COLUMN profiles.total_earned IS 'Total commission earned from referrals';
COMMENT ON COLUMN profiles.monthly_earnings IS 'Monthly recurring commission from active referrals';
COMMENT ON COLUMN profiles.last_referral IS 'Date of last successful referral'; 