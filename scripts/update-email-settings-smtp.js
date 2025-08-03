const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateEmailSettingsWithSMTP() {
  console.log('🚀 Updating email settings with SMTP configuration...');

  try {
    // Get current email settings
    const { data: currentSettings, error: fetchError } = await supabase
      .from('platform_settings')
      .select('setting_value')
      .eq('setting_key', 'email')
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current email settings:', fetchError);
      return;
    }

    console.log('📧 Current email settings:', currentSettings.setting_value);

    // Update with SMTP configuration
    const updatedEmailSettings = {
      ...currentSettings.setting_value,
      smtp: {
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: ''
      }
    };

    // Update the database
    const { error: updateError } = await supabase
      .from('platform_settings')
      .update({ 
        setting_value: updatedEmailSettings,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', 'email');

    if (updateError) {
      console.error('❌ Error updating email settings:', updateError);
    } else {
      console.log('✅ Email settings updated with SMTP configuration');
      console.log('📧 Updated settings:', updatedEmailSettings);
    }

  } catch (error) {
    console.error('❌ Error updating email settings:', error);
  }
}

updateEmailSettingsWithSMTP();