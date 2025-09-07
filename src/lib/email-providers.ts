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

// Enormail Provider
export class EnormailProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private baseUrl: string = 'https://api.enormail.eu/api/1.0';

  constructor(apiKey: string, fromEmail: string, fromName: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    from: string;
    headers?: Record<string, string>;
  }) {
    try {
      // Enormail uses mailings API for sending emails
      const mailingData = {
        name: `Email to ${options.to}`,
        subject: options.subject,
        html: options.html,
        from_email: this.fromEmail,
        from_name: this.fromName,
        reply_to: this.fromEmail,
        to: [options.to]
      };

      // First create a mailing
      const createResponse = await fetch(`${this.baseUrl}/mailings.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`
        },
        body: JSON.stringify(mailingData)
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({}));
        throw new Error(`Enormail API error: ${createResponse.status} - ${errorData.message || createResponse.statusText}`);
      }

      const createResult = await createResponse.json();
      const mailingId = createResult.mailingid;

      // Then send the mailing
      const sendResponse = await fetch(`${this.baseUrl}/mailings/${mailingId}/send.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`
        },
        body: JSON.stringify({
          to: [options.to]
        })
      });

      if (!sendResponse.ok) {
        const errorData = await sendResponse.json().catch(() => ({}));
        throw new Error(`Enormail send error: ${sendResponse.status} - ${errorData.message || sendResponse.statusText}`);
      }

      return {
        messageId: mailingId || `enormail_${Date.now()}`,
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

  // Additional Enormail-specific methods for campaigns
  async createCampaign(campaignData: {
    name: string;
    subject: string;
    htmlContent: string;
    fromEmail: string;
    fromName: string;
    replyTo?: string;
  }) {
    try {
      const mailingData = {
        name: campaignData.name,
        subject: campaignData.subject,
        html: campaignData.htmlContent,
        from_email: campaignData.fromEmail,
        from_name: campaignData.fromName,
        reply_to: campaignData.replyTo || campaignData.fromEmail
      };

      const response = await fetch(`${this.baseUrl}/mailings.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`
        },
        body: JSON.stringify(mailingData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Enormail API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendCampaign(campaignId: string, recipientList: string[]) {
    try {
      const response = await fetch(`${this.baseUrl}/mailings/${campaignId}/send.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`
        },
        body: JSON.stringify({
          to: recipientList
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Enormail API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to send campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCampaignStats(campaignId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/mailings/${campaignId}/stats.json`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Enormail API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get campaign stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Test connection method
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/ping.json`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: 'Enormail connection successful',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Add contact to list
  async addContactToList(listId: string, contactData: {
    email: string;
    name?: string;
    lastname?: string;
    company?: string;
    address?: string;
    postal?: string;
    city?: string;
    country?: string;
    telephone?: string;
    mobile?: string;
    custom1?: string;
    custom2?: string;
    custom3?: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/add.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`
        },
        body: JSON.stringify({
          ...contactData,
          listid: listId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Enormail API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: 'Contact successfully added to list',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add contact: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get all lists
  async getLists(page: number = 1) {
    try {
      const response = await fetch(`${this.baseUrl}/lists.json?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Enormail API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get lists: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Create a new list
  async createList(listData: {
    title: string;
    description?: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/lists.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`
        },
        body: JSON.stringify(listData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Enormail API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: 'List successfully created',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create list: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Email Provider Factory
export class EmailProviderFactory {
  static createProvider(type: 'sendgrid' | 'mailgun' | 'smtp' | 'enormail', config: any): EmailProvider {
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
      
      case 'enormail':
        return new EnormailProvider(
          config.apiKey,
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
