require('dotenv').config({ path: '.env.local' });

console.log('📧 TESTING SMTP SETTINGS');
console.log('========================\n');

const nodemailer = require('nodemailer');

// SMTP settings from environment or database
const smtpConfig = {
  host: 'toptiermen.eu',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: 'platform@toptiermen.eu',
    pass: '5LUrnxEmEQYgEUt3PmZg'
  }
};

async function testSMTPConnection() {
  try {
    console.log('📋 STEP 1: Testing SMTP Connection');
    console.log('----------------------------------');
    
    console.log('🔧 SMTP Configuration:');
    console.log(`   Host: ${smtpConfig.host}`);
    console.log(`   Port: ${smtpConfig.port}`);
    console.log(`   Secure: ${smtpConfig.secure}`);
    console.log(`   User: ${smtpConfig.auth.user}`);
    console.log(`   Password: ${smtpConfig.auth.pass ? '***' : 'Not set'}`);
    
    // Create transporter
    const transporter = nodemailer.createTransport(smtpConfig);
    
    console.log('\n🔄 Testing connection...');
    
    // Verify connection
    const verifyResult = await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    console.log('\n📋 STEP 2: Sending Test Email');
    console.log('-----------------------------');
    
    const testEmail = {
      from: smtpConfig.auth.user,
      to: 'chiel@media2net.nl', // Test recipient
      subject: 'Top Tier Men - SMTP Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8BAE5A;">Top Tier Men - SMTP Test</h2>
          <p>Dit is een test email om te controleren of de SMTP instellingen correct werken.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Test Details:</h3>
            <ul>
              <li><strong>Datum:</strong> ${new Date().toLocaleString('nl-NL')}</li>
              <li><strong>SMTP Host:</strong> ${smtpConfig.host}</li>
              <li><strong>SMTP Port:</strong> ${smtpConfig.port}</li>
              <li><strong>Van:</strong> ${smtpConfig.auth.user}</li>
              <li><strong>Naar:</strong> chiel@media2net.nl</li>
            </ul>
          </div>
          
          <p>Als je deze email ontvangt, werkt de SMTP configuratie correct!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>Platform 2.0.1 - SMTP Test</p>
          </div>
        </div>
      `
    };
    
    console.log('📤 Sending test email...');
    const sendResult = await transporter.sendMail(testEmail);
    
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${sendResult.messageId}`);
    console.log(`📧 Response: ${sendResult.response}`);
    
    console.log('\n📋 STEP 3: Testing API Endpoint');
    console.log('-------------------------------');
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/email/send-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'chiel@media2net.nl',
        subject: 'API Test Email',
        message: 'Dit is een test via de API endpoint.'
      })
    });
    
    const apiResult = await response.json();
    console.log('📊 API Response:', apiResult);
    
    if (apiResult.success) {
      console.log('✅ API endpoint working correctly!');
    } else {
      console.log('❌ API endpoint failed:', apiResult.error);
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('===========');
    console.log('✅ SMTP connection: Working');
    console.log('✅ Test email: Sent successfully');
    console.log('✅ API endpoint: Tested');
    console.log('\n📧 Check your email (chiel@media2net.nl) for the test message!');
    
  } catch (error) {
    console.error('❌ SMTP Test Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔍 AUTHENTICATION ERROR:');
      console.log('   - Check username and password');
      console.log('   - Verify SMTP credentials');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔍 CONNECTION ERROR:');
      console.log('   - Check SMTP host and port');
      console.log('   - Verify network connection');
      console.log('   - Check firewall settings');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n🔍 TIMEOUT ERROR:');
      console.log('   - SMTP server not responding');
      console.log('   - Check server status');
    }
    
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('   1. Verify SMTP credentials');
    console.log('   2. Check port 465 is open');
    console.log('   3. Test with different email client');
    console.log('   4. Contact hosting provider');
  }
}

// Run the test
testSMTPConnection();
