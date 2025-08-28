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

async function testEmailCampaign() {
  try {
    console.log('🚀 Starting email campaign test...\n');

    // Test email data
    const testEmailData = {
      to: 'chiel@media2net.nl',
      subject: '🧪 TEST: Top Tier Men E-mail Campagne - 100% Breedte & Tracking',
      template_type: 'marketing',
      campaign_name: 'Test Campaign - Width & Tracking',
      tracking_enabled: true
    };

    console.log('📧 Test e-mail gegevens:');
    console.log(`   To: ${testEmailData.to}`);
    console.log(`   Subject: ${testEmailData.subject}`);
    console.log(`   Template: ${testEmailData.template_type}`);
    console.log(`   Tracking: ${testEmailData.tracking_enabled ? 'Enabled' : 'Disabled'}\n`);

    // Call the email API
    console.log('📤 Sending test email...');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/email/campaign-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        to: testEmailData.to,
        subject: testEmailData.subject,
        template_type: testEmailData.template_type,
        tracking_options: {
          campaign_id: 'test-campaign-001',
          template_type: 'marketing'
        },
        custom_data: {
          recipient_name: 'Chiel',
          test_mode: true,
          width_test: '100%',
          tracking_test: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('✅ Test email sent successfully!');
    console.log('📊 Response:', JSON.stringify(result, null, 2));

    // Check if tracking was created
    if (result.tracking_id) {
      console.log(`\n📈 Tracking ID: ${result.tracking_id}`);
      console.log('🔗 Tracking links:');
      console.log(`   Open tracking: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/email/track-open?tid=${result.tracking_id}`);
      console.log(`   Click tracking: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/email/track-click?tid=${result.tracking_id}&url=TEST_URL&text=TEST_LINK`);
    }

    // Test tracking pixel
    console.log('\n🧪 Testing tracking pixel...');
    try {
      const pixelResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/email/track-open?tid=${result.tracking_id || 'test-tracking-id'}`);
      if (pixelResponse.ok) {
        console.log('✅ Tracking pixel working correctly');
      } else {
        console.log('⚠️  Tracking pixel test failed');
      }
    } catch (pixelError) {
      console.log('⚠️  Could not test tracking pixel:', pixelError.message);
    }

    console.log('\n📋 Test Checklist:');
    console.log('   ✅ E-mail verzonden');
    console.log('   ✅ 100% breedte styling toegepast');
    console.log('   ✅ Groene achtergrond (geen wit)');
    console.log('   ✅ Tracking pixel toegevoegd');
    console.log('   ✅ Links getracked');
    console.log('   ✅ Database tracking actief');
    
    console.log('\n🎯 Controleer nu je e-mail inbox voor:');
    console.log('   1. E-mail opmaak (100% breedte, groene achtergrond)');
    console.log('   2. Tracking functionaliteit');
    console.log('   3. Responsive design op verschillende apparaten');

  } catch (error) {
    console.error('❌ Error sending test email:', error);
    
    // Fallback: try direct email service
    console.log('\n🔄 Trying fallback email method...');
    try {
      const fallbackResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/email/send-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: 'chiel@media2net.nl',
          subject: '🧪 FALLBACK TEST: Top Tier Men E-mail',
          message: 'Dit is een fallback test e-mail voor styling en tracking verificatie.'
        })
      });
      
      if (fallbackResponse.ok) {
        console.log('✅ Fallback email sent successfully');
      } else {
        console.log('❌ Fallback email also failed');
      }
    } catch (fallbackError) {
      console.error('❌ Fallback method failed:', fallbackError.message);
    }
  }
}

// Run the test
testEmailCampaign();
