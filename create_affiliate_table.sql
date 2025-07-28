-- =====================================================
-- AFFILIATE SYSTEM DATABASE SETUP
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. AFFILIATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    affiliate_code VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    total_referrals INTEGER DEFAULT 0,
    active_referrals INTEGER DEFAULT 0,
    total_earned DECIMAL(10,2) DEFAULT 0.00,
    monthly_earnings DECIMAL(10,2) DEFAULT 0.00,
    last_referral TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- 2. AFFILIATE REFERRALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
    commission_earned DECIMAL(10,2) DEFAULT 0.00,
    monthly_commission DECIMAL(10,2) DEFAULT 0.00,
    last_payment TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referred_user_id) -- One referral per user
);

-- =====================================================
-- 3. AFFILIATE COMMISSION PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliate_commission_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    referral_id UUID REFERENCES affiliate_referrals(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('signup_bonus', 'monthly_commission', 'bonus')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    payment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commission_payments ENABLE ROW LEVEL SECURITY;

-- Affiliates policies
CREATE POLICY "Users can view their own affiliate data" ON affiliates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate data" ON affiliates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own affiliate data" ON affiliates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all affiliate data" ON affiliates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        )
    );

-- Affiliate referrals policies
CREATE POLICY "Users can view their own referrals" ON affiliate_referrals
    FOR SELECT USING (
        auth.uid() = referred_user_id OR
        EXISTS (
            SELECT 1 FROM affiliates 
            WHERE affiliates.id = affiliate_referrals.affiliate_id 
            AND affiliates.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all referrals" ON affiliate_referrals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        )
    );

-- Commission payments policies
CREATE POLICY "Users can view their own commission payments" ON affiliate_commission_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM affiliates 
            WHERE affiliates.id = affiliate_commission_payments.affiliate_id 
            AND affiliates.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all commission payments" ON affiliate_commission_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        )
    );

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred_user_id ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);

CREATE INDEX IF NOT EXISTS idx_commission_payments_affiliate_id ON affiliate_commission_payments(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_status ON affiliate_commission_payments(status);
CREATE INDEX IF NOT EXISTS idx_commission_payments_payment_date ON affiliate_commission_payments(payment_date);

-- =====================================================
-- 6. FUNCTIONS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update affiliate stats when referral is added
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update affiliate stats
    UPDATE affiliates 
    SET 
        total_referrals = (
            SELECT COUNT(*) 
            FROM affiliate_referrals 
            WHERE affiliate_id = NEW.affiliate_id
        ),
        active_referrals = (
            SELECT COUNT(*) 
            FROM affiliate_referrals 
            WHERE affiliate_id = NEW.affiliate_id 
            AND status = 'active'
        ),
        total_earned = (
            SELECT COALESCE(SUM(commission_earned), 0)
            FROM affiliate_referrals 
            WHERE affiliate_id = NEW.affiliate_id
        ),
        monthly_earnings = (
            SELECT COALESCE(SUM(monthly_commission), 0)
            FROM affiliate_referrals 
            WHERE affiliate_id = NEW.affiliate_id 
            AND status = 'active'
        ),
        last_referral = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.affiliate_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update affiliate stats
CREATE TRIGGER trigger_update_affiliate_stats
    AFTER INSERT OR UPDATE OR DELETE ON affiliate_referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_stats();

-- =====================================================
-- 7. SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample affiliate data for existing users (optional)
-- Uncomment the following lines if you want to create affiliate records for existing users

/*
INSERT INTO affiliates (user_id, affiliate_code, status)
SELECT 
    id as user_id,
    UPPER(REPLACE(full_name, ' ', '')) || SUBSTRING(id::text, -6) as affiliate_code,
    'active' as status
FROM auth.users 
WHERE full_name IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;
*/

-- =====================================================
-- 8. COMMENTS
-- =====================================================
COMMENT ON TABLE affiliates IS 'Stores affiliate information for users who can refer others';
COMMENT ON TABLE affiliate_referrals IS 'Tracks referrals made by affiliates';
COMMENT ON TABLE affiliate_commission_payments IS 'Tracks commission payments to affiliates';
COMMENT ON COLUMN affiliates.affiliate_code IS 'Unique code used in referral links';
COMMENT ON COLUMN affiliates.total_earned IS 'Total commission earned from all referrals';
COMMENT ON COLUMN affiliates.monthly_earnings IS 'Monthly recurring commission from active referrals'; 