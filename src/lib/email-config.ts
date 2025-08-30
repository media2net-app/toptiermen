// Email Configuration - Easy switching between providers
export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun';
  // SMTP Configuration
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
  // SendGrid Configuration
  sendgridApiKey?: string;
  // Mailgun Configuration
  mailgunApiKey?: string;
  mailgunDomain?: string;
  // Common Configuration
  fromEmail: string;
  fromName: string;
}

// Current SMTP Configuration (TopTierMen)
export const currentSmtpConfig: EmailConfig = {
  provider: 'smtp',
  smtpHost: 'toptiermen.eu',
  smtpPort: 465,
  smtpSecure: true,
  smtpUsername: 'platform@toptiermen.eu',
  smtpPassword: '5LUrnxEmEQYgEUt3PmZg',
  fromEmail: 'platform@toptiermen.eu',
  fromName: 'TopTierMen Platform'
};

// SendGrid Configuration Example
export const sendgridConfig: EmailConfig = {
  provider: 'sendgrid',
  sendgridApiKey: process.env.SENDGRID_API_KEY || 'SG.test_key_for_development',
  fromEmail: 'platform@toptiermen.eu',
  fromName: 'TopTierMen Platform'
};

// Mailgun Configuration - PRODUCTION READY
export const mailgunConfig: EmailConfig = {
  provider: 'mailgun',
  mailgunApiKey: process.env.MAILGUN_API_KEY || '',
  mailgunDomain: 'toptiermen.eu',
  fromEmail: 'platform@toptiermen.eu',
  fromName: 'Top Tier Men Platform'
};

// Function to get current email configuration
export function getEmailConfig(): EmailConfig {
  // You can switch providers here by changing the return value
  return currentSmtpConfig; // Currently using SMTP
  
  // To use SendGrid:
  // return sendgridConfig;
  
  // To use Mailgun:
  // return mailgunConfig;
}

// Function to create nodemailer config for SMTP
export function getNodemailerConfig() {
  const config = getEmailConfig();
  
  if (config.provider === 'smtp') {
    return {
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword
      }
    };
  }
  
  throw new Error(`Provider ${config.provider} not supported for nodemailer`);
}
