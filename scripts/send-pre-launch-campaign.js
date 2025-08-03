const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

// SMTP Configuration (update with your actual settings)
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USERNAME || 'your-email@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'your-app-password',
  },
};

// Campaign Configuration
const campaignConfig = {
  fromName: 'Rick Cuijpers',
  fromEmail: process.env.SMTP_USERNAME || 'rick@toptiermen.app',
  subject: '🚀 Pre-Launch: Top Tier Men Brotherhood - Exclusieve Toegang!',
  delayBetweenEmails: 2000, // 2 seconds between emails to avoid rate limiting
};

// Example recipient list (replace with your actual list)
const recipients = [
  { email: 'test1@example.com', name: 'John Doe' },
  { email: 'test2@example.com', name: 'Jane Smith' },
  // Add more recipients here
];

// Pre-launch campaign email template
const campaignTemplate = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 30px; text-align: center;">
    <h1 style="color: #181F17; margin: 0; font-size: 28px; font-weight: bold;">🚀 Top Tier Men</h1>
    <p style="color: #181F17; margin: 10px 0 0 0; font-size: 16px;">Brotherhood Pre-Launch</p>
  </div>

  <!-- Main Content -->
  <div style="padding: 30px;">
    <h2 style="color: #181F17; margin-bottom: 20px;">Hallo [Naam],</h2>
    
    <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
      De tijd is gekomen! Na maanden van ontwikkeling en testing is de <strong>Top Tier Men Brotherhood</strong> bijna klaar voor de officiële lancering.
    </p>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #B6C948;">
      <h3 style="color: #181F17; margin-top: 0;">🎯 Wat je kunt verwachten:</h3>
      <ul style="color: #333; line-height: 1.8;">
        <li><strong>Persoonlijke Groei:</strong> Dagelijkse missies en uitdagingen</li>
        <li><strong>Fysieke Excellentie:</strong> Custom trainingsschema's en voedingsplannen</li>
        <li><strong>Mentale Kracht:</strong> Academy met lessen over mindset en discipline</li>
        <li><strong>Brotherhood:</strong> Connect met gelijkgestemde mannen</li>
        <li><strong>Gamification:</strong> XP systeem, badges en rangen</li>
      </ul>
    </div>

    <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
      Als early adopter krijg je <strong>exclusieve toegang</strong> tot de pre-launch versie en speciale voordelen die later niet meer beschikbaar zullen zijn.
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://toptiermen.app/pre-launch-access" 
         style="background-color: #B6C948; color: #181F17; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
        🚀 Krijg Exclusieve Toegang
      </a>
    </div>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      <strong>Pre-launch voordelen:</strong><br>
      • 50% korting op lifetime membership<br>
      • Exclusieve "Founding Member" badge<br>
      • Directe toegang tot Rick's persoonlijke coaching<br>
      • Invloed op toekomstige features
    </p>

    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
      <p style="color: #856404; margin: 0; font-size: 14px;">
        ⏰ <strong>Beperkte tijd:</strong> Deze pre-launch aanbieding is alleen beschikbaar voor de eerste 100 leden.
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color: #181F17; padding: 20px; text-align: center;">
    <p style="color: #8BAE5A; margin: 0; font-size: 14px;">
      © 2024 Top Tier Men. Alle rechten voorbehouden.
    </p>
    <p style="color: #666; margin: 10px 0 0 0; font-size: 12px;">
      Je ontvangt deze e-mail omdat je je hebt aangemeld voor de Top Tier Men pre-launch.
    </p>
    <p style="color: #666; margin: 5px 0 0 0; font-size: 12px;">
      <a href="[UNSUBSCRIBE_LINK]" style="color: #8BAE5A;">Uitschrijven</a> | 
      <a href="https://toptiermen.app/privacy" style="color: #8BAE5A;">Privacy Policy</a>
    </p>
  </div>
</div>
`;

async function sendPreLaunchCampaign() {
  console.log('🚀 Starting Pre-Launch Campaign...');
  console.log(`📧 SMTP Config: ${smtpConfig.host}:${smtpConfig.port}`);
  console.log(`👥 Recipients: ${recipients.length}`);
  console.log(`⏱️  Delay between emails: ${campaignConfig.delayBetweenEmails}ms`);

  try {
    // Create transporter
    const transporter = nodemailer.createTransporter(smtpConfig);

    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    let successCount = 0;
    let failureCount = 0;

    // Send emails to all recipients
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      try {
        // Personalize email content
        const personalizedContent = campaignTemplate
          .replace(/\[Naam\]/g, recipient.name)
          .replace(/\[EMAIL\]/g, recipient.email)
          .replace(/\[UNSUBSCRIBE_LINK\]/g, `https://toptiermen.app/unsubscribe?email=${encodeURIComponent(recipient.email)}`);

        const mailOptions = {
          from: `"${campaignConfig.fromName}" <${campaignConfig.fromEmail}>`,
          to: recipient.email,
          subject: campaignConfig.subject,
          html: personalizedContent,
        };

        console.log(`📤 Sending email ${i + 1}/${recipients.length} to ${recipient.email}...`);
        
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${recipient.email} (Message ID: ${result.messageId})`);
        successCount++;

        // Add delay between emails to avoid rate limiting
        if (i < recipients.length - 1) {
          console.log(`⏳ Waiting ${campaignConfig.delayBetweenEmails}ms before next email...`);
          await new Promise(resolve => setTimeout(resolve, campaignConfig.delayBetweenEmails));
        }

      } catch (error) {
        console.error(`❌ Failed to send email to ${recipient.email}:`, error.message);
        failureCount++;
      }
    }

    // Campaign summary
    console.log('\n📊 Campaign Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📧 Total: ${recipients.length}`);
    console.log(`📈 Success rate: ${((successCount / recipients.length) * 100).toFixed(1)}%`);

    if (failureCount > 0) {
      console.log('\n⚠️  Some emails failed to send. Check the logs above for details.');
    } else {
      console.log('\n🎉 All emails sent successfully!');
    }

  } catch (error) {
    console.error('❌ Campaign failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 Tip: Check your SMTP credentials in .env.local');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Tip: Check your SMTP host and port settings');
    }
  }
}

// Configuration validation
function validateConfig() {
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_USERNAME', 'SMTP_PASSWORD'];
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.log('💡 Please update your .env.local file with the required SMTP settings');
    return false;
  }

  if (recipients.length === 0) {
    console.error('❌ No recipients configured');
    console.log('💡 Please add recipients to the recipients array in this script');
    return false;
  }

  return true;
}

// Main execution
if (validateConfig()) {
  console.log('🔧 Configuration validated successfully');
  sendPreLaunchCampaign();
} else {
  console.log('❌ Configuration validation failed. Please fix the issues above.');
}