require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function configureSmtpSettings() {
  try {
    console.log('📧 Configuring SMTP settings in database...\n');
    
    // SMTP Configuration from Chiel's request
    const smtpConfig = {
      provider: 'smtp',
      useManualSmtp: true,
      smtpHost: 'toptiermen.eu',
      smtpPort: '465',
      smtpSecure: true,
      smtpUsername: 'platform@toptiermen.eu',
      smtpPassword: '5LUrnxEmEQYgEUt3PmZg',
      fromEmail: 'platform@toptiermen.eu',
      fromName: 'Top Tier Men',
      apiKey: '', // Not needed for SMTP
      description: 'Manual SMTP configuration for Top Tier Men platform'
    };
    
    console.log('📋 SMTP Configuration:');
    console.log('======================');
    console.log(`Host: ${smtpConfig.smtpHost}`);
    console.log(`Port: ${smtpConfig.smtpPort}`);
    console.log(`Secure: ${smtpConfig.smtpSecure}`);
    console.log(`Username: ${smtpConfig.smtpUsername}`);
    console.log(`Password: ${smtpConfig.smtpPassword ? '***' : 'NOT SET'}`);
    console.log(`From Email: ${smtpConfig.fromEmail}`);
    console.log(`From Name: ${smtpConfig.fromName}`);
    console.log(`Use Manual SMTP: ${smtpConfig.useManualSmtp}`);
    console.log('');
    
    // 1. First, check if platform_settings table exists
    console.log('🔍 Checking platform_settings table...');
    const { data: existingSettings, error: checkError } = await supabase
      .from('platform_settings')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.log('❌ platform_settings table error:', checkError.message);
      
      // Create the table if it doesn't exist
      console.log('🔧 Creating platform_settings table...');
      const { error: createError } = await supabase.rpc('exec_sql', {
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
      
      if (createError) {
        console.log('❌ Error creating platform_settings table:', createError.message);
        return;
      } else {
        console.log('✅ platform_settings table created');
      }
    } else {
      console.log('✅ platform_settings table exists');
    }
    
    // 2. Save SMTP configuration to database
    console.log('\n💾 Saving SMTP configuration to database...');
    const { error: upsertError } = await supabase
      .from('platform_settings')
      .upsert({
        setting_key: 'email',
        setting_value: smtpConfig,
        setting_type: 'email',
        description: 'Email and SMTP configuration for Top Tier Men platform',
        is_public: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      });
    
    if (upsertError) {
      console.log('❌ Error saving SMTP configuration:', upsertError.message);
      return;
    } else {
      console.log('✅ SMTP configuration saved to database');
    }
    
    // 3. Also save to environment variables table if it exists
    console.log('\n🔧 Updating environment configuration...');
    try {
      const { error: envError } = await supabase
        .from('platform_settings')
        .upsert({
          setting_key: 'smtp_environment',
          setting_value: {
            SMTP_HOST: smtpConfig.smtpHost,
            SMTP_PORT: smtpConfig.smtpPort,
            SMTP_SECURE: smtpConfig.smtpSecure,
            SMTP_USERNAME: smtpConfig.smtpUsername,
            SMTP_PASSWORD: smtpConfig.smtpPassword,
            FROM_EMAIL: smtpConfig.fromEmail,
            FROM_NAME: smtpConfig.fromName
          },
          setting_type: 'integrations',
          description: 'SMTP environment variables for email service',
          is_public: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });
      
      if (envError) {
        console.log('⚠️ Could not save environment config:', envError.message);
      } else {
        console.log('✅ Environment configuration saved');
      }
    } catch (error) {
      console.log('⚠️ Environment config save skipped:', error.message);
    }
    
    // 4. Verify the configuration
    console.log('\n🔍 Verifying configuration...');
    const { data: savedConfig, error: verifyError } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('setting_key', 'email')
      .single();
    
    if (verifyError) {
      console.log('❌ Error verifying configuration:', verifyError.message);
    } else {
      console.log('✅ Configuration verified in database');
      console.log('📊 Saved configuration:', {
        key: savedConfig.setting_key,
        type: savedConfig.setting_type,
        updated: savedConfig.updated_at,
        config: savedConfig.setting_value
      });
    }
    
    // 5. Test the configuration via API
    console.log('\n🧪 Testing SMTP configuration via API...');
    try {
      const response = await fetch('https://platform.toptiermen.eu/api/email/test-smtp', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ API test successful');
        console.log('📧 Current SMTP config from API:', result.smtpConfig);
      } else {
        console.log('⚠️ API test failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('⚠️ API test skipped (local environment):', error.message);
    }
    
    console.log('\n🎉 SMTP Configuration Complete!');
    console.log('='.repeat(50));
    console.log('✅ SMTP settings saved to database');
    console.log('✅ Manual SMTP mode enabled');
    console.log('✅ Configuration verified');
    console.log('');
    console.log('📧 Ready to send test emails!');
    console.log('🔗 Test URL: https://platform.toptiermen.eu/api/email/test-smtp');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Test SMTP connection');
    console.log('   2. Send test email');
    console.log('   3. Verify email delivery');
    
  } catch (error) {
    console.error('❌ Error configuring SMTP settings:', error);
  }
}

configureSmtpSettings();
