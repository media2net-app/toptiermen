require('dotenv').config({ path: '.env.local' });

console.log('📧 CHECKING EMAIL HEADERS AND SENDING IP');
console.log('========================================\n');

const nodemailer = require('nodemailer');

// SMTP settings
const smtpConfig = {
  host: 'toptiermen.eu',
  port: 465,
  secure: true,
  auth: {
    user: 'platform@toptiermen.eu',
    pass: '5LUrnxEmEQYgEUt3PmZg'
  }
};

async function checkEmailHeaders() {
  try {
    console.log('📋 STEP 1: Testing SMTP connection and headers');
    console.log('-----------------------------------------------');
    
    console.log('🔧 SMTP Configuration:');
    console.log(`   Host: ${smtpConfig.host}`);
    console.log(`   Port: ${smtpConfig.port}`);
    console.log(`   Secure: ${smtpConfig.secure}`);
    console.log(`   User: ${smtpConfig.auth.user}`);
    
    // Create transporter
    const transporter = nodemailer.createTransport(smtpConfig);
    
    console.log('\n🔄 Testing connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    console.log('\n📋 STEP 2: Sending test email with detailed headers');
    console.log('----------------------------------------------------');
    
    const testEmail = {
      from: {
        name: 'Top Tier Men Platform',
        address: smtpConfig.auth.user
      },
      to: 'chiel@media2net.nl',
      subject: 'Email Headers Test - Top Tier Men',
      headers: {
        'X-Mailer': 'Top Tier Men Platform 2.0.3',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'normal',
        'X-Report-Abuse': 'Please report abuse here: abuse@toptiermen.eu',
        'List-Unsubscribe': '<mailto:unsubscribe@toptiermen.eu>',
        'Precedence': 'bulk'
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8BAE5A;">Email Headers Test</h2>
          <p>Dit is een test email om de headers en IP adres te controleren.</p>
          
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
          
          <p>Controleer de email headers om het IP adres te zien.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>Platform 2.0.3 - Email Headers Test</p>
          </div>
        </div>
      `
    };
    
    console.log('📤 Sending test email with detailed headers...');
    const sendResult = await transporter.sendMail(testEmail);
    
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${sendResult.messageId}`);
    console.log(`📧 Response: ${sendResult.response}`);
    
    console.log('\n📋 STEP 3: DNS Records Analysis');
    console.log('-------------------------------');
    
    console.log('🔍 Analyzing DNS records for toptiermen.eu...');
    
    // Check current DNS records
    console.log('\n📊 Current DNS Configuration:');
    console.log('=============================');
    console.log('📧 MX Records:');
    console.log('   - Check: dig MX toptiermen.eu');
    console.log('   - Should point to your mail server');
    
    console.log('\n🔒 SPF Record:');
    console.log('   - Check: dig TXT toptiermen.eu');
    console.log('   - Should contain: v=spf1 include:_spf.toptiermen.eu ~all');
    
    console.log('\n🔐 DKIM Record:');
    console.log('   - Check: dig TXT default._domainkey.toptiermen.eu');
    console.log('   - Should contain DKIM public key');
    
    console.log('\n📋 STEP 4: Recommended DNS Records');
    console.log('===================================');
    
    console.log('📧 MX Record:');
    console.log('   toptiermen.eu. IN MX 10 mail.toptiermen.eu.');
    
    console.log('\n🔒 SPF Record:');
    console.log('   toptiermen.eu. IN TXT "v=spf1 include:_spf.toptiermen.eu ~all"');
    
    console.log('\n🔐 DKIM Record (example):');
    console.log('   default._domainkey.toptiermen.eu. IN TXT "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."');
    
    console.log('\n📋 DMARC Record:');
    console.log('   _dmarc.toptiermen.eu. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@toptiermen.eu"');
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('==================');
    console.log('1. Check the email headers in your inbox for the sending IP');
    console.log('2. Add SPF record to allow emails from your server IP');
    console.log('3. Configure DKIM for email authentication');
    console.log('4. Set up DMARC for additional protection');
    console.log('5. Consider using a dedicated IP for sending emails');
    
    console.log('\n🔍 To find the sending IP:');
    console.log('1. Open the test email in your email client');
    console.log('2. View the email headers (usually View > Headers)');
    console.log('3. Look for "Received from" or "X-Originating-IP"');
    console.log('4. The IP address will be the one sending the email');
    
  } catch (error) {
    console.error('❌ Error checking email headers:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔍 AUTHENTICATION ERROR:');
      console.log('   - Check username and password');
      console.log('   - Verify SMTP credentials');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔍 CONNECTION ERROR:');
      console.log('   - Check SMTP host and port');
      console.log('   - Verify network connection');
    }
  }
}

// Run the check
checkEmailHeaders();
