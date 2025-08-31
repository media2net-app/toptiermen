-- Create Facebook Ads table
CREATE TABLE IF NOT EXISTS facebook_ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    ad_set_name VARCHAR(255),
    ad_name VARCHAR(255),
    date DATE NOT NULL,
    spent DECIMAL(10,2) DEFAULT 0.00,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0.0000,
    cpm DECIMAL(10,2) DEFAULT 0.00,
    cpc DECIMAL(10,2) DEFAULT 0.00,
    cpl DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'active',
    objective VARCHAR(100),
    target_audience TEXT,
    ad_copy TEXT,
    landing_page_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_facebook_ads_date ON facebook_ads(date);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_campaign ON facebook_ads(campaign_name);
CREATE INDEX IF NOT EXISTS idx_facebook_ads_status ON facebook_ads(status);

-- Enable Row Level Security
ALTER TABLE facebook_ads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access to all users" ON facebook_ads
    FOR SELECT USING (true);

CREATE POLICY "Allow insert access to authenticated users" ON facebook_ads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update access to authenticated users" ON facebook_ads
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete access to authenticated users" ON facebook_ads
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_facebook_ads_updated_at 
    BEFORE UPDATE ON facebook_ads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO facebook_ads (
    campaign_name,
    ad_set_name,
    ad_name,
    date,
    spent,
    impressions,
    clicks,
    leads,
    ctr,
    cpm,
    cpc,
    cpl,
    objective,
    target_audience,
    ad_copy
) VALUES 
(
    'Top Tier Men - Awareness Campaign',
    'Men 25-45 Netherlands',
    'Become a Top Tier Man',
    '2025-01-15',
    45.50,
    12500,
    234,
    12,
    0.0187,
    3.64,
    0.19,
    3.79,
    'LEAD_GENERATION',
    'Men aged 25-45 in Netherlands, interested in fitness and personal development',
    'Ready to become a Top Tier Man? Join our exclusive community of high-performing individuals.'
),
(
    'Top Tier Men - Awareness Campaign',
    'Men 25-45 Netherlands',
    'Become a Top Tier Man',
    '2025-01-16',
    52.30,
    14200,
    289,
    15,
    0.0204,
    3.68,
    0.18,
    3.49,
    'LEAD_GENERATION',
    'Men aged 25-45 in Netherlands, interested in fitness and personal development',
    'Ready to become a Top Tier Man? Join our exclusive community of high-performing individuals.'
),
(
    'Top Tier Men - Conversion Campaign',
    'Fitness Enthusiasts',
    'Transform Your Life',
    '2025-01-15',
    38.75,
    8900,
    156,
    8,
    0.0175,
    4.35,
    0.25,
    4.84,
    'CONVERSIONS',
    'Men aged 25-45 in Netherlands, interested in fitness, health, and personal growth',
    'Transform your life with our proven system. Join thousands of men who have already changed their lives.'
),
(
    'Top Tier Men - Conversion Campaign',
    'Fitness Enthusiasts',
    'Transform Your Life',
    '2025-01-16',
    41.20,
    9200,
    178,
    11,
    0.0193,
    4.48,
    0.23,
    3.75,
    'CONVERSIONS',
    'Men aged 25-45 in Netherlands, interested in fitness, health, and personal growth',
    'Transform your life with our proven system. Join thousands of men who have already changed their lives.'
),
(
    'Top Tier Men - Retargeting',
    'Website Visitors',
    'Don''t Miss Out',
    '2025-01-15',
    28.90,
    6500,
    89,
    6,
    0.0137,
    4.45,
    0.32,
    4.82,
    'LEAD_GENERATION',
    'Men who visited our website in the last 30 days',
    'Don''t miss out on becoming a Top Tier Man. Limited spots available.'
),
(
    'Top Tier Men - Retargeting',
    'Website Visitors',
    'Don''t Miss Out',
    '2025-01-16',
    31.45,
    7200,
    98,
    7,
    0.0136,
    4.37,
    0.32,
    4.49,
    'LEAD_GENERATION',
    'Men who visited our website in the last 30 days',
    'Don''t miss out on becoming a Top Tier Man. Limited spots available.'
);

-- Display the created data
SELECT 
    campaign_name,
    date,
    SUM(spent) as total_spent,
    SUM(impressions) as total_impressions,
    SUM(clicks) as total_clicks,
    SUM(leads) as total_leads,
    ROUND(SUM(spent) / SUM(leads), 2) as cost_per_lead
FROM facebook_ads 
GROUP BY campaign_name, date 
ORDER BY date DESC, campaign_name;
