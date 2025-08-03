const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createPlatformSettingsTable() {
  console.log('🚀 Creating platform settings table...');

  try {
    // Create platform_settings table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
      `
    });

    if (tableError) {
      console.error('❌ Error creating platform_settings table:', tableError);
    } else {
      console.log('✅ platform_settings table created');
    }

    // Insert default settings
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO platform_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
        ('general', '{"platformName": "Top Tier Men", "logoUrl": "/logo.svg", "maintenanceMode": false}', 'general', 'General platform settings', true),
        ('gamification', '{"xpSystemEnabled": true, "xpDailyMission": 10, "xpAcademyLesson": 25, "xpForumPost": 5, "xpReceivedBoks": 1, "streakBonusDays": 7, "streakBonusXp": 100}', 'gamification', 'Gamification and XP system settings', true),
        ('community', '{"manualApprovalRequired": false, "wordFilter": "spam,scam,verkoop,reclame", "forumRules": "Welkom bij de Top Tier Men Brotherhood!\\n\\nOnze kernwaarden:\\n- Respect voor elkaar\\n- Constructieve feedback\\n- Geen spam of reclame\\n- Blijf on-topic\\n- Help elkaar groeien\\n\\nOvertredingen leiden tot waarschuwingen of uitsluiting."}', 'community', 'Community and moderation settings', true),
        ('email', '{"senderName": "Rick Cuijpers", "senderEmail": "rick@toptiermen.app", "smtp": {"host": "", "port": 587, "secure": false, "username": "", "password": ""}, "templates": {"welcome": {"subject": "Welkom bij Top Tier Men", "content": "Beste [Naam],\\n\\nWelkom bij Top Tier Men!"}, "passwordReset": {"subject": "Wachtwoord reset", "content": "Beste [Naam],\\n\\nJe hebt een wachtwoord reset aangevraagd."}, "weeklyReminder": {"subject": "Wekelijkse update", "content": "Beste [Naam],\\n\\nHier is je wekelijkse update."}}}', 'email', 'Email settings and templates', false),
        ('integrations', '{"googleAnalyticsId": "", "mailProviderApiKey": "", "paymentProviderApiKey": ""}', 'integrations', 'Third-party integration settings', false)
        ON CONFLICT (setting_key) DO NOTHING;
      `
    });

    if (insertError) {
      console.error('❌ Error inserting default settings:', insertError);
    } else {
      console.log('✅ Default settings inserted');
    }

    console.log('🎉 Platform settings table setup completed!');

  } catch (error) {
    console.error('❌ Error creating platform settings table:', error);
  }
}

createPlatformSettingsTable(); 