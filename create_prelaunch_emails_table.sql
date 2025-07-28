-- Create prelaunch_emails table
CREATE TABLE IF NOT EXISTS prelaunch_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    source VARCHAR(100) NOT NULL DEFAULT 'Manual',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'pending')),
    package VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_email ON prelaunch_emails(email);
CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_status ON prelaunch_emails(status);
CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_subscribed_at ON prelaunch_emails(subscribed_at);
CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_source ON prelaunch_emails(source);

-- Enable RLS
ALTER TABLE prelaunch_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only admins can read all emails
CREATE POLICY "Admins can read all prelaunch emails" ON prelaunch_emails
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Only admins can insert emails
CREATE POLICY "Admins can insert prelaunch emails" ON prelaunch_emails
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Only admins can update emails
CREATE POLICY "Admins can update prelaunch emails" ON prelaunch_emails
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Only admins can delete emails
CREATE POLICY "Admins can delete prelaunch emails" ON prelaunch_emails
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Insert initial real data
INSERT INTO prelaunch_emails (email, name, source, status, package, notes) VALUES
('info@vdweide-enterprise.com', 'Van der Weide Enterprise', 'Direct Contact', 'active', 'Premium', 'Enterprise client - interested in team packages'),
('fvanhouten1986@gmail.com', 'Frank van Houten', 'Direct Contact', 'active', 'Basic', 'Personal fitness goals - found via LinkedIn'),
('hortulanusglobalservices@gmail.com', 'Hortulanus Global Services', 'Direct Contact', 'active', 'Ultimate', 'Business client - looking for comprehensive solution');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prelaunch_emails_updated_at 
    BEFORE UPDATE ON prelaunch_emails 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 