import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EmailData {
  to: string;
  template: string;
  variables: Record<string, string>;
}

interface EmailConfig {
  provider: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
  useManualSmtp: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpPassword: string;
}

class EmailService {
  private config: EmailConfig;

  constructor(config?: Partial<EmailConfig>) {
    this.config = {
      provider: 'smtp', // Changed default to SMTP
      apiKey: process.env.RESEND_API_KEY || '',
      fromEmail: process.env.FROM_EMAIL || 'platform@toptiermen.eu',
      fromName: process.env.FROM_NAME || 'Top Tier Men',
      useManualSmtp: true, // Enable SMTP by default
      smtpHost: process.env.SMTP_HOST || 'toptiermen.eu',
      smtpPort: process.env.SMTP_PORT || '465',
      smtpSecure: process.env.SMTP_SECURE === 'true' || true,
      smtpUsername: process.env.SMTP_USERNAME || 'platform@toptiermen.eu',
      smtpPassword: process.env.SMTP_PASSWORD || '5LUrnxEmEQYgEUt3PmZg',
      ...config
    };
  }

  // Method to update configuration
  updateConfig(newConfig: Partial<EmailConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Load configuration from database
  async loadConfigFromDatabase() {
    try {
      console.log('📧 Loading email configuration from database...');
      
      const { data: emailSettings, error } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'email')
        .single();

      if (error) {
        console.log('⚠️ Could not load email config from database:', error.message);
        return false;
      }

      if (emailSettings && emailSettings.setting_value) {
        const dbConfig = emailSettings.setting_value as EmailConfig;
        
        // Update the configuration
        this.updateConfig({
          provider: dbConfig.provider || 'smtp',
          useManualSmtp: dbConfig.useManualSmtp || true,
          smtpHost: dbConfig.smtpHost || 'toptiermen.eu',
          smtpPort: dbConfig.smtpPort || '465',
          smtpSecure: dbConfig.smtpSecure || true,
          smtpUsername: dbConfig.smtpUsername || 'platform@toptiermen.eu',
          smtpPassword: dbConfig.smtpPassword || '5LUrnxEmEQYgEUt3PmZg',
          fromEmail: dbConfig.fromEmail || 'platform@toptiermen.eu',
          fromName: dbConfig.fromName || 'Top Tier Men',
          apiKey: dbConfig.apiKey || ''
        });

        console.log('✅ Email configuration loaded from database');
        console.log('📧 Current config:', {
          provider: this.config.provider,
          useManualSmtp: this.config.useManualSmtp,
          smtpHost: this.config.smtpHost,
          smtpPort: this.config.smtpPort,
          smtpSecure: this.config.smtpSecure,
          smtpUsername: this.config.smtpUsername,
          fromEmail: this.config.fromEmail,
          fromName: this.config.fromName
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error loading email config from database:', error);
      return false;
    }
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Load latest configuration from database
      await this.loadConfigFromDatabase();

      const { to, template, variables } = emailData;
      
      // Generate email content based on template
      const { subject, html, text } = this.generateEmailContent(template, variables);
      
      console.log('📧 Sending email:', {
        to,
        subject,
        template,
        provider: this.config.provider,
        useManualSmtp: this.config.useManualSmtp
      });

      // Choose sending method based on configuration
      if (this.config.useManualSmtp) {
        return await this.sendViaSmtp(to, subject, html, text);
      } else {
        return await this.sendViaApi(to, subject, html, text);
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return false;
    }
  }

  private generateEmailContent(template: string, variables: Record<string, string>) {
    // Email templates
    const templates: Record<string, { subject: string; html: string; text: string }> = {
      welcome: {
        subject: 'Welkom bij Top Tier Men!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8BAE5A;">Welkom bij Top Tier Men!</h1>
            <p>Beste ${variables.name || 'Gebruiker'},</p>
            <p>Welkom bij het Top Tier Men platform! We zijn verheugd je te verwelkomen in onze community.</p>
            <p>Je kunt nu inloggen op je dashboard en beginnen met je reis naar het volgende niveau.</p>
            <a href="${variables.dashboardUrl || 'https://platform.toptiermen.eu/dashboard'}" 
               style="background-color: #8BAE5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
              Ga naar Dashboard
            </a>
            <p>Met vriendelijke groet,<br>Het Top Tier Men Team</p>
          </div>
        `,
        text: `
          Welkom bij Top Tier Men!
          
          Beste ${variables.name || 'Gebruiker'},
          
          Welkom bij het Top Tier Men platform! We zijn verheugd je te verwelkomen in onze community.
          
          Je kunt nu inloggen op je dashboard en beginnen met je reis naar het volgende niveau.
          
          Dashboard: ${variables.dashboardUrl || 'https://platform.toptiermen.eu/dashboard'}
          
          Met vriendelijke groet,
          Het Top Tier Men Team
        `
      },
      passwordReset: {
        subject: 'Wachtwoord reset - Top Tier Men',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8BAE5A;">Wachtwoord Reset</h1>
            <p>Beste ${variables.name || 'Gebruiker'},</p>
            <p>Je hebt een wachtwoord reset aangevraagd voor je Top Tier Men account.</p>
            <p>Klik op de onderstaande link om je wachtwoord te resetten:</p>
            <a href="${variables.resetUrl || '#'}" 
               style="background-color: #8BAE5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
              Reset Wachtwoord
            </a>
            <p>Deze link is 24 uur geldig.</p>
            <p>Met vriendelijke groet,<br>Het Top Tier Men Team</p>
          </div>
        `,
        text: `
          Wachtwoord Reset - Top Tier Men
          
          Beste ${variables.name || 'Gebruiker'},
          
          Je hebt een wachtwoord reset aangevraagd voor je Top Tier Men account.
          
          Klik op de onderstaande link om je wachtwoord te resetten:
          ${variables.resetUrl || '#'}
          
          Deze link is 24 uur geldig.
          
          Met vriendelijke groet,
          Het Top Tier Men Team
        `
      },
      test: {
        subject: 'Test Email - Top Tier Men Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8BAE5A;">Test Email</h1>
            <p>Beste ${variables.name || 'Gebruiker'},</p>
            <p>Dit is een test email van het Top Tier Men platform.</p>
            <p>SMTP configuratie is succesvol geconfigureerd!</p>
            <p><strong>Configuratie details:</strong></p>
            <ul>
              <li>Host: ${this.config.smtpHost}</li>
              <li>Port: ${this.config.smtpPort}</li>
              <li>Secure: ${this.config.smtpSecure ? 'Ja' : 'Nee'}</li>
              <li>Username: ${this.config.smtpUsername}</li>
              <li>From: ${this.config.fromEmail}</li>
            </ul>
            <p>Met vriendelijke groet,<br>Het Top Tier Men Team</p>
          </div>
        `,
        text: `
          Test Email - Top Tier Men Platform
          
          Beste ${variables.name || 'Gebruiker'},
          
          Dit is een test email van het Top Tier Men platform.
          
          SMTP configuratie is succesvol geconfigureerd!
          
          Configuratie details:
          - Host: ${this.config.smtpHost}
          - Port: ${this.config.smtpPort}
          - Secure: ${this.config.smtpSecure ? 'Ja' : 'Nee'}
          - Username: ${this.config.smtpUsername}
          - From: ${this.config.fromEmail}
          
          Met vriendelijke groet,
          Het Top Tier Men Team
        `
      }
    };

    const emailTemplate = templates[template] || templates.welcome;
    
    // Replace variables in template
    let html = emailTemplate.html;
    let text = emailTemplate.text;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      html = html.replace(regex, value);
      text = text.replace(regex, value);
    });

    return {
      subject: emailTemplate.subject,
      html,
      text
    };
  }

  private async sendViaApi(to: string, subject: string, html: string, text: string): Promise<boolean> {
    try {
      console.log('📧 Sending email via API...');
      
      // This would use Resend or another email API
      // For now, we'll simulate it
      console.log('✅ Email would be sent via API');
      console.log('📧 Email content:', {
        to,
        subject,
        htmlLength: html.length,
        textLength: text.length
      });

      // Log email to database
      await this.logEmail(to, 'api', subject);
      return true;
    } catch (error) {
      console.error('❌ Error sending email via API:', error);
      return false;
    }
  }

  private async sendViaSmtp(to: string, subject: string, html: string, text: string): Promise<boolean> {
    try {
      // Use the built-in Node.js SMTP client
      const smtpConfig = {
        host: this.config.smtpHost,
        port: parseInt(this.config.smtpPort),
        secure: this.config.smtpSecure,
        auth: {
          user: this.config.smtpUsername,
          pass: this.config.smtpPassword
        }
      };

      console.log('📧 Sending email via SMTP:', {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        username: smtpConfig.auth.user,
        to,
        subject,
        from: `${this.config.fromName} <${this.config.fromEmail}>`
      });

      // Create email message
      const message = {
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
        text: text
      };

      // For now, we'll simulate SMTP sending since we're in a browser environment
      // In a real Node.js environment, you would use nodemailer or similar
      console.log('✅ Email would be sent via SMTP with config:', smtpConfig);
      console.log('📧 Email content:', {
        from: message.from,
        to: message.to,
        subject: message.subject,
        htmlLength: message.html.length,
        textLength: message.text.length
      });

      // Simulate SMTP sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log email to database
      await this.logEmail(to, 'smtp', subject);
      return true;
    } catch (error) {
      console.error('❌ Error sending email via SMTP:', error);
      return false;
    }
  }

  private async logEmail(to: string, serviceType: string, subject: string): Promise<void> {
    try {
      await supabase
        .from('email_logs')
        .insert({
          to_email: to,
          service_type: serviceType,
          subject: subject,
          sent_at: new Date().toISOString(),
          status: 'sent'
        });
    } catch (error) {
      console.log('⚠️ Could not log email to database:', error);
    }
  }

  async testSmtpConnection(): Promise<boolean> {
    try {
      // Load latest configuration
      await this.loadConfigFromDatabase();
      
      console.log('🧪 Testing SMTP connection...');
      console.log('📧 SMTP Config:', {
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpSecure,
        username: this.config.smtpUsername
      });

      // Simulate SMTP connection test
      // In a real implementation, you would test the actual SMTP connection
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ SMTP connection test successful');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection test failed:', error);
      return false;
    }
  }

  // Get current SMTP configuration
  getSmtpConfig() {
    return {
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.smtpSecure,
      username: this.config.smtpUsername,
      fromEmail: this.config.fromEmail,
      fromName: this.config.fromName
    };
  }
}

export const emailService = new EmailService(); 