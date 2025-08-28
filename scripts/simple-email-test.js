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

async function sendSimpleTestEmail() {
  try {
    console.log('🚀 Sending simple test email...\n');

    // Test the existing email API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/api/email/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'chiel@media2net.nl',
        subject: '🧪 TEST: Top Tier Men E-mail - 100% Breedte & Groene Achtergrond',
        template: 'marketing',
        variables: {
          name: 'Chiel',
          test_mode: true,
          width_test: '100%',
          green_background: true,
          tracking_test: true
        }
      })
    });

    console.log('📤 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test email sent successfully!');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Error sending test email:', error);
  }
}

// Run the test
sendSimpleTestEmail();
