const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendTestUserEmail() {
  console.log('📧 Sending Test User Email to info@media2net.nl...\n');

  try {
    // Test user data
    const testUserData = {
      email: 'info@media2net.nl',
      name: 'Media2Net Team',
      testUserId: 'media2net-test-001',
      password: 'TestPassword123!' // Add password
    };

    console.log('📋 Test User Data:');
    console.log(`   Email: ${testUserData.email}`);
    console.log(`   Name: ${testUserData.name}`);
    console.log(`   Test User ID: ${testUserData.testUserId}`);
    console.log(`   Password: ${testUserData.password}`);
    console.log('');

    // Send test user email via API
    console.log('📤 Sending email via API...');
    
    const response = await fetch('http://localhost:3000/api/test-users/send-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test user email sent successfully!');
      console.log('📊 Response:', result);
      
      // Check if email was logged in database
      console.log('\n📊 Checking email logs...');
      const { data: emailLogs, error: logsError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('recipient_email', testUserData.email)
        .order('sent_at', { ascending: false })
        .limit(1);

      if (logsError) {
        console.warn('⚠️ Could not check email logs:', logsError.message);
      } else if (emailLogs && emailLogs.length > 0) {
        console.log('✅ Email logged in database:', emailLogs[0]);
      } else {
        console.log('ℹ️ Email not found in logs (might be disabled)');
      }

    } else {
      const errorText = await response.text();
      console.error('❌ Failed to send test user email:', response.status, response.statusText);
      console.error('Error details:', errorText);
    }

    console.log('\n🎯 Test complete!');
    console.log('📧 Check the inbox of info@media2net.nl for the test user email');

  } catch (error) {
    console.error('❌ Error sending test user email:', error);
  }
}

sendTestUserEmail();
