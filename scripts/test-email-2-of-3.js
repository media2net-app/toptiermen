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

async function sendTestEmail2Of3() {
  try {
    console.log('🚀 Sending test email 2 of 3 (Informatieve E-mail #1)...\n');

    // Test the marketing email template for email 2 of 3
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/email/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'chiel@media2net.nl',
        subject: '📧 TEST 2/3: Ontdek de kracht van het Top Tier Men platform',
        template: 'marketing',
        variables: {
          name: 'Chiel',
          test_mode: true,
          width_test: '100%',
          green_background: true,
          tracking_test: true,
          campaign_type: 'info_series',
          email_type: 'info_email_1',
          email_number: '2 van 3',
          launch_date: '10 september 2025',
          platform_features: true
        }
      })
    });

    console.log('📤 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test email 2 of 3 sent successfully!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      
      console.log('\n📋 Email 2 of 3 Test Details:');
      console.log('   📧 Template: Marketing (Info Email #1)');
      console.log('   🎨 Styling: 100% width, green background');
      console.log('   📱 Responsive: Yes');
      console.log('   📈 Tracking: Enabled');
      console.log('   🎯 Campaign: Info series (2 van 3)');
      console.log('   📅 Scheduled for: 2 september 2024');
      
      console.log('\n🎯 Controleer je e-mail inbox voor:');
      console.log('   1. ✅ 100% breedte styling (geen smalle e-mail)');
      console.log('   2. ✅ Groene achtergrond (geen wit)');
      console.log('   3. ✅ Responsive design op mobiel/desktop');
      console.log('   4. ✅ Tracking pixel (onzichtbaar)');
      console.log('   5. ✅ Getrackte links');
      console.log('   6. ✅ Top Tier Men branding');
      console.log('   7. ✅ Platform features uitleg');
      console.log('   8. ✅ Informatieve content (2 van 3)');
      
    } else {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Error sending test email 2 of 3:', error);
  }
}

// Run the test
sendTestEmail2Of3();
