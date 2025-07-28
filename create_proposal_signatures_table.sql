-- =====================================================
-- PROPOSAL SIGNATURES DATABASE SETUP
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROPOSAL SIGNATURES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS proposal_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proposal_type VARCHAR(100) NOT NULL, -- 'marketing', 'consulting', etc.
    proposal_amount DECIMAL(10,2) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_company VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    signature_date DATE NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    proposal_details JSONB, -- Store additional proposal information
    status VARCHAR(20) DEFAULT 'signed' CHECK (status IN ('draft', 'signed', 'cancelled', 'expired')),
    invoice_sent BOOLEAN DEFAULT FALSE,
    invoice_sent_at TIMESTAMP WITH TIME ZONE,
    payment_received BOOLEAN DEFAULT FALSE,
    payment_received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_proposal_signatures_user_id ON proposal_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_signatures_status ON proposal_signatures(status);
CREATE INDEX IF NOT EXISTS idx_proposal_signatures_signed_at ON proposal_signatures(signed_at);
CREATE INDEX IF NOT EXISTS idx_proposal_signatures_proposal_type ON proposal_signatures(proposal_type);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE proposal_signatures ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================
-- Users can view their own signatures
CREATE POLICY "Users can view own signatures" ON proposal_signatures
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own signatures
CREATE POLICY "Users can insert own signatures" ON proposal_signatures
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own signatures
CREATE POLICY "Users can update own signatures" ON proposal_signatures
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all signatures
CREATE POLICY "Admins can view all signatures" ON proposal_signatures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Admins can update all signatures
CREATE POLICY "Admins can update all signatures" ON proposal_signatures
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =====================================================
-- 5. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proposal_signatures_updated_at 
    BEFORE UPDATE ON proposal_signatures 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 