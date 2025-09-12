const nodemailer = require('nodemailer');

async function testSMTPConfig() {
  console.log('🧪 Testing SMTP configuration...');
  
  // Test configuration
  const config = {
    host: process.env.SMTP_HOST || 'toptiermen.eu',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true' || true,
    auth: {
      user: process.env.SMTP_USERNAME || 'platform@toptiermen.eu',
      pass: process.env.SMTP_PASSWORD
    }
  };
  
  console.log('📧 SMTP Config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    username: config.auth.user,
    password: config.auth.pass ? '***' : 'NOT SET'
  });
  
  if (!config.auth.pass) {
    console.error('❌ SMTP_PASSWORD environment variable is not set!');
    return false;
  }
  
  try {
    const transporter = nodemailer.createTransporter(config);
    
    // Test connection
    console.log('🔌 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Test sending email
    console.log('📧 Testing email send...');
    const result = await transporter.sendMail({
      from: 'Top Tier Men <platform@toptiermen.eu>',
      to: 'chielvanderzee@gmail.com',
      subject: '🧪 SMTP Test Email',
      html: '<h1>SMTP Test</h1><p>This is a test email to verify SMTP configuration.</p>',
      text: 'SMTP Test - This is a test email to verify SMTP configuration.'
    });
    
    console.log('✅ Test email sent successfully:', {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected
    });
    
    return true;
  } catch (error) {
    console.error('❌ SMTP test failed:', error);
    return false;
  }
}

testSMTPConfig().then(success => {
  if (success) {
    console.log('🎉 SMTP configuration is working correctly!');
  } else {
    console.log('💥 SMTP configuration has issues!');
  }
  process.exit(success ? 0 : 1);
});
