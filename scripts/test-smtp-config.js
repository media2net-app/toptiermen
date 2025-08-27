require('dotenv').config({ path: '.env.local' });

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'toptiermen.eu',
  port: process.env.SMTP_PORT || '465',
  secure: process.env.SMTP_SECURE === 'true' || true,
  username: process.env.SMTP_USERNAME || 'platform@toptiermen.eu',
  password: process.env.SMTP_PASSWORD || '5LUrnxEmEQYgEUt3PmZg',
  fromEmail: process.env.FROM_EMAIL || 'platform@toptiermen.eu',
  fromName: process.env.FROM_NAME || 'Top Tier Men'
};

async function testSmtpConfiguration() {
  try {
    console.log('🧪 Testing SMTP Configuration...\n');
    
    console.log('📧 SMTP Settings:');
    console.log('==================');
    console.log(`Host: ${SMTP_CONFIG.host}`);
    console.log(`Port: ${SMTP_CONFIG.port}`);
    console.log(`Secure: ${SMTP_CONFIG.secure}`);
    console.log(`Username: ${SMTP_CONFIG.username}`);
    console.log(`Password: ${SMTP_CONFIG.password ? '***' : 'NOT SET'}`);
    console.log(`From Email: ${SMTP_CONFIG.fromEmail}`);
    console.log(`From Name: ${SMTP_CONFIG.fromName}`);
    console.log('');

    // Test API endpoint
    console.log('🔗 Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/email/test-smtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API Test Results:');
      console.log('==================');
      console.log(`Success: ${result.success}`);
      console.log(`Message: ${result.message}`);
      console.log(`Connection Test: ${result.connectionTest}`);
      console.log(`Email Test: ${result.emailTest}`);
      console.log('');
      console.log('📧 SMTP Config from API:');
      console.log(`Host: ${result.smtpConfig.host}`);
      console.log(`Port: ${result.smtpConfig.port}`);
      console.log(`Secure: ${result.smtpConfig.secure}`);
      console.log(`Username: ${result.smtpConfig.username}`);
      console.log(`From Email: ${result.smtpConfig.fromEmail}`);
      console.log(`From Name: ${result.smtpConfig.fromName}`);
    } else {
      console.error('❌ API test failed:', response.status, response.statusText);
      const error = await response.text();
      console.error('Error details:', error);
    }

    // Test sending a real email
    console.log('\n📧 Testing email sending...');
    const emailResponse = await fetch('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        template: 'welcome',
        variables: {
          name: 'Test User',
          dashboardUrl: 'https://platform.toptiermen.eu/dashboard'
        }
      })
    });

    if (emailResponse.ok) {
      const emailResult = await emailResponse.json();
      console.log('✅ Email Test Results:');
      console.log('====================');
      console.log(`Success: ${emailResult.success}`);
      console.log(`Message: ${emailResult.message}`);
    } else {
      console.error('❌ Email test failed:', emailResponse.status, emailResponse.statusText);
      const error = await emailResponse.text();
      console.error('Error details:', error);
    }

  } catch (error) {
    console.error('❌ Error testing SMTP configuration:', error);
  }
}

async function testMarketingEmail() {
  try {
    console.log('\n📧 Testing Marketing Email...');
    
    const marketingResponse = await fetch('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        template: 'marketing',
        variables: {
          name: 'Test User',
          subject: 'Nieuwe Top Tier Men Campagne',
          content: 'We hebben een nieuwe campagne gelanceerd die perfect bij jou past. Ontdek hoe je jezelf kunt transformeren tot een echte Top Tier Man.',
          ctaText: 'Bekijk de Campagne',
          ctaUrl: 'https://platform.toptiermen.eu/prelaunch'
        }
      })
    });

    if (marketingResponse.ok) {
      const result = await marketingResponse.json();
      console.log('✅ Marketing Email Test Results:');
      console.log('================================');
      console.log(`Success: ${result.success}`);
      console.log(`Message: ${result.message}`);
    } else {
      console.error('❌ Marketing email test failed:', marketingResponse.status, marketingResponse.statusText);
      const error = await marketingResponse.text();
      console.error('Error details:', error);
    }

  } catch (error) {
    console.error('❌ Error testing marketing email:', error);
  }
}

// Run tests
async function runTests() {
  await testSmtpConfiguration();
  await testMarketingEmail();
  
  console.log('\n🎉 SMTP Configuration Test Complete!');
  console.log('====================================');
  console.log('📧 Email service is now configured with:');
  console.log(`   • Host: ${SMTP_CONFIG.host}`);
  console.log(`   • Port: ${SMTP_CONFIG.port}`);
  console.log(`   • Username: ${SMTP_CONFIG.username}`);
  console.log(`   • From: ${SMTP_CONFIG.fromName} <${SMTP_CONFIG.fromEmail}>`);
  console.log('');
  console.log('🚀 Ready to send marketing emails!');
}

runTests().catch(console.error);
