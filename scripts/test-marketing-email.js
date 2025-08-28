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

async function testMarketingEmail() {
  try {
    console.log('🚀 Testing marketing email template with 100% width styling...\n');

    // Test the marketing email template
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/email/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'chiel@media2net.nl',
        subject: '🎯 Top Tier Men - Jouw reis naar het volgende niveau begint hier',
        template: 'marketing',
        variables: {
          name: 'Chiel',
          test_mode: true,
          width_test: '100%',
          green_background: true,
          tracking_test: true,
          campaign_type: 'launch_preparation',
          email_type: 'welcome_campaign'
        }
      })
    });

    console.log('📤 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Marketing email sent successfully!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      
      console.log('\n📋 Email Test Details:');
      console.log('   📧 Template: Marketing');
      console.log('   🎨 Styling: 100% width, green background');
      console.log('   📱 Responsive: Yes');
      console.log('   📈 Tracking: Enabled');
      console.log('   🎯 Campaign: Launch preparation');
      
      console.log('\n🎯 Controleer je e-mail inbox voor:');
      console.log('   1. ✅ 100% breedte styling (geen smalle e-mail)');
      console.log('   2. ✅ Groene achtergrond (geen wit)');
      console.log('   3. ✅ Responsive design op mobiel/desktop');
      console.log('   4. ✅ Tracking pixel (onzichtbaar)');
      console.log('   5. ✅ Getrackte links');
      console.log('   6. ✅ Top Tier Men branding');
      
    } else {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Error sending marketing email:', error);
  }
}

// Run the test
testMarketingEmail();
