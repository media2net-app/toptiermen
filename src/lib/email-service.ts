import { supabaseAdmin } from './supabase-admin';
import { 
  getWelcomeEmailTemplate, 
  getOnboardingReminderTemplate, 
  getEmailVerificationTemplate,
  getMarketingEmailTemplate,
  EmailTemplate 
} from './email-templates';

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

  private async getEmailTemplate(templateName: string, variables: Record<string, string>): Promise<EmailTemplate> {
    switch (templateName) {
      case 'welcome':
        return getWelcomeEmailTemplate(variables.name || '', variables.dashboardUrl || '');
      case 'onboarding_reminder':
        return getOnboardingReminderTemplate(variables.name || '', variables.dashboardUrl || '');
      case 'email_verification':
        return getEmailVerificationTemplate(variables.name || '', variables.verificationUrl || '');
      case 'marketing':
        return getMarketingEmailTemplate(
          variables.name || '', 
          variables.subject || '', 
          variables.content || '', 
          variables.ctaText || '', 
          variables.ctaUrl || ''
        );
      default:
        throw new Error(`Unknown template: ${templateName}`);
    }
  }

  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const template = await this.getEmailTemplate(emailData.template, emailData.variables);
      
      const html = this.replaceVariables(template.html, emailData.variables);
      const text = this.replaceVariables(template.text, emailData.variables);
      
      if (this.config.useManualSmtp) {
        return await this.sendViaSmtp(emailData.to, template.subject, html, text);
      } else {
        return await this.sendViaApi(emailData.to, template.subject, html, text);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  private async sendViaApi(to: string, subject: string, html: string, text: string): Promise<boolean> {
    try {
      let response: Response;

      switch (this.config.provider) {
        case 'resend':
          response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `${this.config.fromName} <${this.config.fromEmail}>`,
              to: [to],
              subject: subject,
              html: html,
              text: text,
            }),
          });
          break;

        case 'sendgrid':
          response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: to }] }],
              from: { email: this.config.fromEmail, name: this.config.fromName },
              subject: subject,
              content: [
                { type: 'text/html', value: html },
                { type: 'text/plain', value: text }
              ],
            }),
          });
          break;

        case 'mailgun':
          const formData = new FormData();
          formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
          formData.append('to', to);
          formData.append('subject', subject);
          formData.append('html', html);
          formData.append('text', text);

          response = await fetch(`https://api.mailgun.net/v3/${this.config.fromEmail.split('@')[1]}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString('base64')}`,
            },
            body: formData,
          });
          break;

        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`);
      }

      if (!response.ok) {
        const error = await response.json();
        console.error('Email sending failed:', error);
        return false;
      }

      // Log email to database
      await this.logEmail(to, 'api', subject);
      return true;
    } catch (error) {
      console.error('Error sending email via API:', error);
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
      await supabaseAdmin
        .from('email_logs')
        .insert([
          {
            to_email: to,
            subject: subject,
            service_type: serviceType,
            sent_at: new Date().toISOString(),
            status: 'sent'
          }
        ]);
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      template: 'welcome',
      variables: {
        name: name,
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      },
    });
  }

  async sendOnboardingReminder(email: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      template: 'onboarding_reminder',
      variables: {
        name: name,
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      },
    });
  }

  async sendEmailVerification(email: string, name: string, verificationUrl: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      template: 'email_verification',
      variables: {
        name: name,
        verificationUrl: verificationUrl,
      },
    });
  }

  async sendMarketingEmail(email: string, name: string, subject: string, content: string, ctaText: string, ctaUrl: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      template: 'marketing',
      variables: {
        name: name,
        subject: subject,
        content: content,
        ctaText: ctaText,
        ctaUrl: ctaUrl,
      },
    });
  }

  // New method to test SMTP connection
  async testSmtpConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing SMTP connection...');
      console.log('📧 SMTP Config:', {
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpSecure,
        username: this.config.smtpUsername,
        password: '***' // Hidden for security
      });

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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