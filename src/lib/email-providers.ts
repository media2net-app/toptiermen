import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

export interface EmailProvider {
  sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    from: string;
    headers?: Record<string, string>;
  }): Promise<{ messageId: string; success: boolean; error?: string }>;
}

// SendGrid Provider
export class SendGridProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor(apiKey: string, fromEmail: string, fromName: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
    sgMail.setApiKey(apiKey);
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    from: string;
    headers?: Record<string, string>;
  }) {
    try {
      const msg = {
        to: options.to,
        from: `${this.fromName} <${this.fromEmail}>`,
        subject: options.subject,
        html: options.html,
        headers: options.headers || {}
      };

      const response = await sgMail.send(msg);
      return {
        messageId: response[0].headers['x-message-id'] || `sg_${Date.now()}`,
        success: true
      };
    } catch (error) {
      return {
        messageId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Mailgun Provider
export class MailgunProvider implements EmailProvider {
  private apiKey: string;
  private domain: string;
  private fromEmail: string;
  private fromName: string;
  private mailgun: any;

  constructor(apiKey: string, domain: string, fromEmail: string, fromName: string) {
    this.apiKey = apiKey;
    this.domain = domain;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
    this.mailgun = new Mailgun(formData).client({ username: 'api', key: apiKey });
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    from: string;
    headers?: Record<string, string>;
  }) {
    try {
      const messageData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        'h:List-Unsubscribe': options.headers?.['List-Unsubscribe'] || '',
        'h:List-Unsubscribe-Post': options.headers?.['List-Unsubscribe-Post'] || '',
        'h:X-Mailer': options.headers?.['X-Mailer'] || 'Top Tier Men Platform',
        'h:X-Priority': options.headers?.['X-Priority'] || '3',
        'h:Importance': options.headers?.['Importance'] || 'normal',
        'h:Message-ID': options.headers?.['Message-ID'] || `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${this.domain}>`,
        'h:Date': options.headers?.['Date'] || new Date().toUTCString(),
        'h:MIME-Version': options.headers?.['MIME-Version'] || '1.0'
      };

      const response = await this.mailgun.messages.create(this.domain, messageData);
      return {
        messageId: response.id || `mg_${Date.now()}`,
        success: true
      };
    } catch (error) {
      return {
        messageId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// SMTP Provider (Current)
export class SMTPProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private fromName: string;

  constructor(smtpConfig: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  }, fromEmail: string, fromName: string) {
    this.fromEmail = fromEmail;
    this.fromName = fromName;
    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password
      }
    });
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    from: string;
    headers?: Record<string, string>;
  }) {
    try {
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        headers: options.headers || {}
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        messageId: info.messageId || `smtp_${Date.now()}`,
        success: true
      };
    } catch (error) {
      return {
        messageId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Email Provider Factory
export class EmailProviderFactory {
  static createProvider(type: 'sendgrid' | 'mailgun' | 'smtp', config: any): EmailProvider {
    switch (type) {
      case 'sendgrid':
        return new SendGridProvider(
          config.apiKey,
          config.fromEmail,
          config.fromName
        );
      
      case 'mailgun':
        return new MailgunProvider(
          config.apiKey,
          config.domain,
          config.fromEmail,
          config.fromName
        );
      
      case 'smtp':
      default:
        return new SMTPProvider(
          {
            host: config.smtpHost,
            port: parseInt(config.smtpPort),
            secure: config.smtpSecure,
            username: config.smtpUsername,
            password: config.smtpPassword
          },
          config.fromEmail,
          config.fromName
        );
    }
  }
}
