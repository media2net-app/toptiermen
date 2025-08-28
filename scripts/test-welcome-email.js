const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testWelcomeEmail() {
  try {
    console.log('🚀 Testing welcome email template with 100% width styling...\n');

    // Test the welcome email template
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/email/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'chiel@media2net.nl',
        subject: '🎉 Welkom bij Top Tier Men - Jouw reis naar het volgende niveau begint hier',
        template: 'welcome',
        variables: {
          name: 'Chiel',
          test_mode: true,
          width_test: '100%',
          green_background: true,
          tracking_test: true,
          campaign_type: 'welcome_series',
          email_type: 'welcome_campaign',
          launch_date: '10 september 2024',
          early_access: true
        }
      })
    });

    console.log('📤 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Welcome email sent successfully!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      
      console.log('\n📋 Welcome Email Test Details:');
      console.log('   📧 Template: Welcome');
      console.log('   🎨 Styling: 100% width, green background');
      console.log('   📱 Responsive: Yes');
      console.log('   📈 Tracking: Enabled');
      console.log('   🎯 Campaign: Welcome series');
      console.log('   🚀 Launch date: 10 september 2024');
      
      console.log('\n🎯 Controleer je e-mail inbox voor:');
      console.log('   1. ✅ 100% breedte styling (geen smalle e-mail)');
      console.log('   2. ✅ Groene achtergrond (geen wit)');
      console.log('   3. ✅ Responsive design op mobiel/desktop');
      console.log('   4. ✅ Tracking pixel (onzichtbaar)');
      console.log('   5. ✅ Getrackte links');
      console.log('   6. ✅ Top Tier Men branding');
      console.log('   7. ✅ Welkomst bericht en platform introductie');
      
    } else {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
}

// Run the test
testWelcomeEmail();
