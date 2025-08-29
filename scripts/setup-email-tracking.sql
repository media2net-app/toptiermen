-- EMAIL TRACKING DATABASE SETUP
-- This script creates all necessary tables for comprehensive email tracking

-- 1. EMAIL CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template_type VARCHAR(100) NOT NULL DEFAULT 'marketing',
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    bounce_count INTEGER DEFAULT 0,
    unsubscribe_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. EMAIL TRACKING TABLE (individual emails)
CREATE TABLE IF NOT EXISTS email_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    template_type VARCHAR(100) NOT NULL,
    tracking_id VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address VARCHAR(45),
    location_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. EMAIL OPENS TABLE (detailed open tracking)
CREATE TABLE IF NOT EXISTS email_opens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_id UUID REFERENCES email_tracking(id) ON DELETE CASCADE,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address VARCHAR(45),
    location_data JSONB,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100)
);

-- 4. EMAIL CLICKS TABLE (detailed click tracking)
CREATE TABLE IF NOT EXISTS email_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_id UUID REFERENCES email_tracking(id) ON DELETE CASCADE,
    link_url TEXT NOT NULL,
    link_text VARCHAR(255),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address VARCHAR(45),
    location_data JSONB,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100)
);

-- 5. EMAIL BOUNCES TABLE
CREATE TABLE IF NOT EXISTS email_bounces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_id UUID REFERENCES email_tracking(id) ON DELETE CASCADE,
    bounce_type VARCHAR(50) NOT NULL CHECK (bounce_type IN ('hard', 'soft', 'blocked')),
    bounce_reason TEXT,
    bounced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    smtp_response TEXT
);

-- 6. EMAIL UNSUBSCRIBES TABLE
CREATE TABLE IF NOT EXISTS email_unsubscribes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_id UUID REFERENCES email_tracking(id) ON DELETE CASCADE,
    reason TEXT,
    unsubscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- 7. EMAIL ANALYTICS SUMMARY TABLE (daily aggregated data)
CREATE TABLE IF NOT EXISTS email_analytics_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    open_rate DECIMAL(5,2) DEFAULT 0,
    click_rate DECIMAL(5,2) DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    unsubscribe_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, date)
);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON email_campaigns(sent_at);

CREATE INDEX IF NOT EXISTS idx_email_tracking_campaign_id ON email_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_recipient_email ON email_tracking(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_tracking_status ON email_tracking(status);
CREATE INDEX IF NOT EXISTS idx_email_tracking_tracking_id ON email_tracking(tracking_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_sent_at ON email_tracking(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_tracking_opened_at ON email_tracking(opened_at);

CREATE INDEX IF NOT EXISTS idx_email_opens_tracking_id ON email_opens(tracking_id);
CREATE INDEX IF NOT EXISTS idx_email_opens_opened_at ON email_opens(opened_at);

CREATE INDEX IF NOT EXISTS idx_email_clicks_tracking_id ON email_clicks(tracking_id);
CREATE INDEX IF NOT EXISTS idx_email_clicks_clicked_at ON email_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_email_clicks_link_url ON email_clicks(link_url);

CREATE INDEX IF NOT EXISTS idx_email_bounces_tracking_id ON email_bounces(tracking_id);
CREATE INDEX IF NOT EXISTS idx_email_bounces_bounced_at ON email_bounces(bounced_at);

CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_tracking_id ON email_unsubscribes(tracking_id);
CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_unsubscribed_at ON email_unsubscribes(unsubscribed_at);

CREATE INDEX IF NOT EXISTS idx_email_analytics_summary_campaign_id ON email_analytics_summary(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_analytics_summary_date ON email_analytics_summary(date);

-- 9. Enable Row Level Security
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_opens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_bounces ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_unsubscribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics_summary ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for admin access
CREATE POLICY "Admins can manage email campaigns" ON email_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view email tracking" ON email_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Public can track email opens" ON email_opens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can track email clicks" ON email_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view email analytics" ON email_analytics_summary
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 11. Create functions for tracking
CREATE OR REPLACE FUNCTION track_email_open(tracking_id_param VARCHAR(100))
RETURNS VOID AS $$
BEGIN
    -- Update the main tracking record
    UPDATE email_tracking 
    SET 
        status = 'opened',
        opened_at = COALESCE(opened_at, NOW()),
        open_count = open_count + 1,
        updated_at = NOW()
    WHERE tracking_id = tracking_id_param;
    
    -- Insert detailed open record
    INSERT INTO email_opens (tracking_id, opened_at)
    SELECT id, NOW()
    FROM email_tracking 
    WHERE tracking_id = tracking_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION track_email_click(tracking_id_param VARCHAR(100), link_url_param TEXT, link_text_param VARCHAR(255))
RETURNS VOID AS $$
BEGIN
    -- Update the main tracking record
    UPDATE email_tracking 
    SET 
        status = 'clicked',
        clicked_at = COALESCE(clicked_at, NOW()),
        click_count = click_count + 1,
        updated_at = NOW()
    WHERE tracking_id = tracking_id_param;
    
    -- Insert detailed click record
    INSERT INTO email_clicks (tracking_id, link_url, link_text, clicked_at)
    SELECT id, link_url_param, link_text_param, NOW()
    FROM email_tracking 
    WHERE tracking_id = tracking_id_param;
END;
$$ LANGUAGE plpgsql;

-- 12. Create function to update analytics summary
CREATE OR REPLACE FUNCTION update_email_analytics_summary()
RETURNS VOID AS $$
BEGIN
    -- Insert or update daily summary
    INSERT INTO email_analytics_summary (
        campaign_id, 
        date, 
        total_sent, 
        total_delivered, 
        total_opened, 
        total_clicked, 
        total_bounced, 
        total_unsubscribed,
        open_rate,
        click_rate,
        bounce_rate,
        unsubscribe_rate
    )
    SELECT 
        et.campaign_id,
        DATE(et.sent_at) as date,
        COUNT(*) as total_sent,
        COUNT(CASE WHEN et.status IN ('delivered', 'opened', 'clicked') THEN 1 END) as total_delivered,
        COUNT(CASE WHEN et.status IN ('opened', 'clicked') THEN 1 END) as total_opened,
        COUNT(CASE WHEN et.status = 'clicked' THEN 1 END) as total_clicked,
        COUNT(CASE WHEN et.status = 'bounced' THEN 1 END) as total_bounced,
        COUNT(CASE WHEN et.status = 'unsubscribed' THEN 1 END) as total_unsubscribed,
        ROUND(
            (COUNT(CASE WHEN et.status IN ('opened', 'clicked') THEN 1 END)::DECIMAL / 
             COUNT(CASE WHEN et.status IN ('delivered', 'opened', 'clicked') THEN 1 END)::DECIMAL) * 100, 2
        ) as open_rate,
        ROUND(
            (COUNT(CASE WHEN et.status = 'clicked' THEN 1 END)::DECIMAL / 
             COUNT(CASE WHEN et.status IN ('delivered', 'opened', 'clicked') THEN 1 END)::DECIMAL) * 100, 2
        ) as click_rate,
        ROUND(
            (COUNT(CASE WHEN et.status = 'bounced' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
        ) as bounce_rate,
        ROUND(
            (COUNT(CASE WHEN et.status = 'unsubscribed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
        ) as unsubscribe_rate
    FROM email_tracking et
    WHERE et.sent_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY et.campaign_id, DATE(et.sent_at)
    ON CONFLICT (campaign_id, date) DO UPDATE SET
        total_sent = EXCLUDED.total_sent,
        total_delivered = EXCLUDED.total_delivered,
        total_opened = EXCLUDED.total_opened,
        total_clicked = EXCLUDED.total_clicked,
        total_bounced = EXCLUDED.total_bounced,
        total_unsubscribed = EXCLUDED.total_unsubscribed,
        open_rate = EXCLUDED.open_rate,
        click_rate = EXCLUDED.click_rate,
        bounce_rate = EXCLUDED.bounce_rate,
        unsubscribe_rate = EXCLUDED.unsubscribe_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 13. Create trigger to update analytics when tracking changes
CREATE OR REPLACE FUNCTION trigger_update_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_email_analytics_summary();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_tracking_analytics_trigger
    AFTER INSERT OR UPDATE ON email_tracking
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_analytics();

-- 14. Insert sample campaign for testing
INSERT INTO email_campaigns (name, subject, template_type, status, total_recipients)
VALUES 
    ('Test Campaign', 'Test Email Subject', 'marketing', 'active', 0)
ON CONFLICT DO NOTHING;

-- 15. Create view for easy analytics
CREATE OR REPLACE VIEW email_analytics_view AS
SELECT 
    ec.id as campaign_id,
    ec.name as campaign_name,
    ec.subject,
    ec.status as campaign_status,
    ec.total_recipients,
    ec.sent_count,
    ec.open_count,
    ec.click_count,
    ec.bounce_count,
    ec.unsubscribe_count,
    CASE 
        WHEN ec.sent_count > 0 THEN ROUND((ec.open_count::DECIMAL / ec.sent_count::DECIMAL) * 100, 2)
        ELSE 0 
    END as open_rate,
    CASE 
        WHEN ec.sent_count > 0 THEN ROUND((ec.click_count::DECIMAL / ec.sent_count::DECIMAL) * 100, 2)
        ELSE 0 
    END as click_rate,
    CASE 
        WHEN ec.sent_count > 0 THEN ROUND((ec.bounce_count::DECIMAL / ec.sent_count::DECIMAL) * 100, 2)
        ELSE 0 
    END as bounce_rate,
    CASE 
        WHEN ec.sent_count > 0 THEN ROUND((ec.unsubscribe_count::DECIMAL / ec.sent_count::DECIMAL) * 100, 2)
        ELSE 0 
    END as unsubscribe_rate,
    ec.created_at,
    ec.sent_at,
    ec.completed_at
FROM email_campaigns ec
ORDER BY ec.created_at DESC;

-- 16. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON email_analytics_view TO authenticated;

-- 17. Create function to generate tracking ID
CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS VARCHAR(100) AS $$
BEGIN
    RETURN 'ttm_' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 18. Create increment functions for counters
CREATE OR REPLACE FUNCTION increment_open_count(tracking_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE email_tracking 
    SET open_count = open_count + 1
    WHERE id = tracking_id
    RETURNING open_count INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_click_count(tracking_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE email_tracking 
    SET click_count = click_count + 1
    WHERE id = tracking_id
    RETURNING click_count INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE email_campaigns IS 'Email campaigns for tracking and analytics';
COMMENT ON TABLE email_tracking IS 'Individual email tracking records';
COMMENT ON TABLE email_opens IS 'Detailed email open tracking';
COMMENT ON TABLE email_clicks IS 'Detailed email click tracking';
COMMENT ON TABLE email_bounces IS 'Email bounce tracking';
COMMENT ON TABLE email_unsubscribes IS 'Email unsubscribe tracking';
COMMENT ON TABLE email_analytics_summary IS 'Daily aggregated email analytics';
COMMENT ON VIEW email_analytics_view IS 'Easy view for email campaign analytics';
