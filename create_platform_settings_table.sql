-- Create platform settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type VARCHAR(50) NOT NULL CHECK (setting_type IN ('general', 'gamification', 'community', 'email', 'integrations')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_type ON platform_settings(setting_type);

-- Enable Row Level Security
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Settings public read" ON platform_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Settings admin all" ON platform_settings FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Insert default settings
INSERT INTO platform_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('general', '{
  "platformName": "Top Tier Men",
  "logoUrl": "/logo.svg",
  "maintenanceMode": false
}', 'general', 'General platform settings', true),

('gamification', '{
  "xpSystemEnabled": true,
  "xpDailyMission": 10,
  "xpAcademyLesson": 25,
  "xpForumPost": 5,
  "xpReceivedBoks": 1,
  "streakBonusDays": 7,
  "streakBonusXp": 100
}', 'gamification', 'Gamification and XP system settings', true),

('community', '{
  "manualApprovalRequired": false,
  "wordFilter": "spam,scam,verkoop,reclame",
  "forumRules": "Welkom bij de Top Tier Men Brotherhood!\n\nOnze kernwaarden:\n- Respect voor elkaar\n- Constructieve feedback\n- Geen spam of reclame\n- Blijf on-topic\n- Help elkaar groeien\n\nOvertredingen leiden tot waarschuwingen of uitsluiting."
}', 'community', 'Community and moderation settings', true),

('email', '{
  "senderName": "Rick Cuijpers",
  "senderEmail": "rick@toptiermen.app",
  "templates": {
    "welcome": {
      "subject": "Welkom bij Top Tier Men - Je reis naar excellentie begint nu!",
      "content": "Beste [Naam],\n\nWelkom bij Top Tier Men! We zijn verheugd je te verwelkomen in onze community van mannen die streven naar excellentie.\n\nJe account is succesvol aangemaakt en je kunt nu beginnen met je reis naar persoonlijke groei.\n\nMet vriendelijke groet,\nHet Top Tier Men Team"
    },
    "passwordReset": {
      "subject": "Wachtwoord reset - Top Tier Men",
      "content": "Beste [Naam],\n\nJe hebt een wachtwoord reset aangevraagd. Klik op de onderstaande link om je wachtwoord te resetten:\n\n[RESET_LINK]\n\nDeze link is 24 uur geldig.\n\nMet vriendelijke groet,\nHet Top Tier Men Team"
    },
    "weeklyReminder": {
      "subject": "Je wekelijkse Top Tier Men update",
      "content": "Beste [Naam],\n\nHier is je wekelijkse update van Top Tier Men:\n\n- Nieuwe Academy lessen beschikbaar\n- Community highlights\n- Je voortgang en prestaties\n\nBlijf groeien en excelleren!\n\nMet vriendelijke groet,\nHet Top Tier Men Team"
    }
  }
}', 'email', 'Email settings and templates', false),

('integrations', '{
  "googleAnalyticsId": "",
  "mailProviderApiKey": "",
  "paymentProviderApiKey": ""
}', 'integrations', 'Third-party integration settings', false)

ON CONFLICT (setting_key) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON platform_settings TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 