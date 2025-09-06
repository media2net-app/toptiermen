-- Create table for test email tracking
CREATE TABLE IF NOT EXISTS test_email_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES bulk_email_campaigns(id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    tracking_id VARCHAR(255) UNIQUE NOT NULL,
    template VARCHAR(100) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE NULL,
    user_agent TEXT NULL,
    ip_address INET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_test_email_tracking_tracking_id ON test_email_tracking(tracking_id);
CREATE INDEX IF NOT EXISTS idx_test_email_tracking_campaign_id ON test_email_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_test_email_tracking_email ON test_email_tracking(email);

-- Insert existing test emails for Campaign 2
INSERT INTO test_email_tracking (campaign_id, email, name, tracking_id, template, sent_at, opened_at, user_agent) VALUES
('84bceade-eec6-4349-958f-6b04be0d3003', 'rick@toptiermen.eu', 'Rick Cuijpers', 'test_1757132471860_rick_at_toptiermen_dot_eu_c1jq7os05', 'sneak_preview', '2025-09-06 05:21:12+00', '2025-09-06 05:21:30+00', 'curl/8.7.1'),
('84bceade-eec6-4349-958f-6b04be0d3003', 'info@media2net.nl', 'Media2Net Team', 'test_1757132864145_info_at_media2net_dot_nl_6rs89zrqk', 'sneak_preview', '2025-09-06 05:27:44+00', '2025-09-06 05:27:51+00', 'curl/8.7.1'),
('84bceade-eec6-4349-958f-6b04be0d3003', 'info@media2net.nl', 'Media2Net Team (Test 2)', 'test_1757133610721_info_at_media2net_dot_nl_60mgu2u94', 'sneak_preview', '2025-09-06 05:40:11+00', '2025-09-06 05:40:31+00', 'curl/8.7.1')
ON CONFLICT (tracking_id) DO NOTHING;

-- Note: The latest test emails will be inserted when they are sent via the API
