-- Setup script for prelaunch_emails table
-- Run this in your Supabase SQL Editor

-- Create the prelaunch_emails table
CREATE TABLE IF NOT EXISTS public.prelaunch_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    source VARCHAR(100) NOT NULL DEFAULT 'Manual',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'unsubscribed')),
    package VARCHAR(50) CHECK (package IN ('Basic', 'Premium', 'Ultimate')),
    notes TEXT,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_email ON public.prelaunch_emails(email);
CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_status ON public.prelaunch_emails(status);
CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_source ON public.prelaunch_emails(source);
CREATE INDEX IF NOT EXISTS idx_prelaunch_emails_subscribed_at ON public.prelaunch_emails(subscribed_at);

-- Enable Row Level Security
ALTER TABLE public.prelaunch_emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Only admins can read all emails
CREATE POLICY "Admins can read all prelaunch emails" ON public.prelaunch_emails
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Only admins can insert emails
CREATE POLICY "Admins can insert prelaunch emails" ON public.prelaunch_emails
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Only admins can update emails
CREATE POLICY "Admins can update prelaunch emails" ON public.prelaunch_emails
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Only admins can delete emails
CREATE POLICY "Admins can delete prelaunch emails" ON public.prelaunch_emails
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Insert sample data
INSERT INTO public.prelaunch_emails (email, name, source, status, package, notes) VALUES
    ('info@vdweide-enterprise.com', 'Van der Weide Enterprise', 'Direct Contact', 'active', 'Premium', 'Enterprise client - interested in team packages'),
    ('fvanhouten1986@gmail.com', 'Frank van Houten', 'Direct Contact', 'active', 'Basic', 'Personal fitness goals - found via LinkedIn'),
    ('hortulanusglobalservices@gmail.com', 'Hortulanus Global Services', 'Direct Contact', 'active', 'Ultimate', 'Business client - looking for comprehensive solution'),
    ('chiel@media2net.nl', 'Chiel van der Weide', 'Website Form', 'active', 'Premium', 'Founder - early adopter'),
    ('rob@example.com', 'Rob van Dijk', 'Social Media', 'pending', 'Basic', 'Interested in basic package'),
    ('sarah@fitnesspro.nl', 'Sarah Johnson', 'Email Campaign', 'active', 'Ultimate', 'Professional trainer - high value prospect'),
    ('mike@startup.io', 'Mike Chen', 'Referral', 'active', 'Premium', 'Referred by existing client'),
    ('lisa@healthcoach.com', 'Lisa van der Berg', 'Website Form', 'unsubscribed', 'Basic', 'Changed mind about subscription'),
    ('david@corporate.nl', 'David Smith', 'Direct Contact', 'active', 'Ultimate', 'Corporate wellness program'),
    ('anna@personal.nl', 'Anna de Vries', 'Social Media', 'pending', 'Premium', 'Influencer - potential partnership');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_prelaunch_emails_updated_at 
    BEFORE UPDATE ON public.prelaunch_emails 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.prelaunch_emails TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 