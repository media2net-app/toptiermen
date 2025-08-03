const nodemailer = require('nodemailer');

// Example SMTP configuration
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password', // Use App Password for Gmail
  },
};

async function testSMTPConfiguration() {
  console.log('🚀 Testing SMTP Configuration...');
  console.log('📧 SMTP Config:', {
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    user: smtpConfig.auth.user
  });

  try {
    // Create transporter
    const transporter = nodemailer.createTransporter(smtpConfig);

    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');

    // Example email
    const testEmail = {
      from: '"Top Tier Men" <your-email@gmail.com>',
      to: 'test@example.com',
      subject: 'SMTP Test - Top Tier Men Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #B6C948;">🎉 SMTP Test Succesvol!</h2>
          <p>De SMTP-configuratie van het Top Tier Men platform werkt correct.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Configuratie Details:</h3>
            <ul>
              <li><strong>Host:</strong> ${smtpConfig.host}</li>
              <li><strong>Port:</strong> ${smtpConfig.port}</li>
              <li><strong>Secure:</strong> ${smtpConfig.secure ? 'Ja' : 'Nee'}</li>
              <li><strong>Username:</strong> ${smtpConfig.auth.user}</li>
            </ul>
          </div>
          <p>Je kunt nu e-mails verzenden vanaf het platform voor de pre-launch campagne!</p>
        </div>
      `,
    };

    console.log('📤 Sending test email...');
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);

  } catch (error) {
    console.error('❌ SMTP test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 Tip: Voor Gmail, gebruik een App Password in plaats van je normale wachtwoord');
      console.log('   Ga naar: Google Account → Security → 2-Step Verification → App passwords');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Tip: Controleer of de host en port correct zijn');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Tip: Controleer of de SMTP hostnaam correct is');
    }
  }
}

// Popular SMTP providers configuration examples
const smtpProviders = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    note: 'Gebruik App Password voor 2FA accounts'
  },
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    note: 'Gebruik je normale Outlook wachtwoord'
  },
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false,
    note: 'Gebruik App Password voor Yahoo'
  },
  protonmail: {
    host: '127.0.0.1',
    port: 1025,
    secure: false,
    note: 'Voor development/testing'
  }
};

console.log('📋 Populaire SMTP Providers:');
Object.entries(smtpProviders).forEach(([name, config]) => {
  console.log(`   ${name}: ${config.host}:${config.port} (SSL: ${config.secure}) - ${config.note}`);
});

console.log('\n🔧 Om de SMTP configuratie te testen:');
console.log('1. Update de smtpConfig in dit script met je echte gegevens');
console.log('2. Run: node scripts/example-smtp-config.js');
console.log('3. Controleer je inbox voor de test e-mail');

// Uncomment the line below to run the test
// testSMTPConfiguration();