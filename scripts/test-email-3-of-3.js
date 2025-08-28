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

async function sendTestEmail3Of3() {
  try {
    console.log('🚀 Sending test email 3 of 3 (Informatieve E-mail #2 - Rick\'s achtergrond)...\n');

    // Test the marketing email template for email 3 of 3
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/email/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'chiel@media2net.nl',
        subject: '👨‍💼 TEST 3/3: Ontmoet Rick - De visie achter Top Tier Men',
        template: 'marketing',
        variables: {
          name: 'Chiel',
          test_mode: true,
          width_test: '100%',
          green_background: true,
          tracking_test: true,
          campaign_type: 'info_series',
          email_type: 'info_email_2',
          email_number: '3 van 3',
          launch_date: '10 september 2025',
          rick_background: true,
          vision_content: true
        }
      })
    });

    console.log('📤 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test email 3 of 3 sent successfully!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
      
      console.log('\n📋 Email 3 of 3 Test Details:');
      console.log('   📧 Template: Marketing (Info Email #2)');
      console.log('   🎨 Styling: 100% width, green background');
      console.log('   📱 Responsive: Yes');
      console.log('   📈 Tracking: Enabled');
      console.log('   🎯 Campaign: Info series (3 van 3)');
      console.log('   📅 Scheduled for: 5 september 2024');
      console.log('   👨‍💼 Content: Rick\'s achtergrond en visie');
      
      console.log('\n🎯 Controleer je e-mail inbox voor:');
      console.log('   1. ✅ 100% breedte styling (geen smalle e-mail)');
      console.log('   2. ✅ Groene achtergrond (geen wit)');
      console.log('   3. ✅ Responsive design op mobiel/desktop');
      console.log('   4. ✅ Tracking pixel (onzichtbaar)');
      console.log('   5. ✅ Getrackte links');
      console.log('   6. ✅ Top Tier Men branding');
      console.log('   7. ✅ Rick\'s achtergrond en ervaring');
      console.log('   8. ✅ Visie voor de community');
      console.log('   9. ✅ Informatieve content (3 van 3)');
      
    } else {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Error sending test email 3 of 3:', error);
  }
}

// Run the test
sendTestEmail3Of3();
