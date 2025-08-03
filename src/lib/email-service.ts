import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}

interface EmailConfig {
  senderName: string;
  senderEmail: string;
  smtp: SMTPConfig;
  templates: {
    welcome: { subject: string; content: string };
    passwordReset: { subject: string; content: string };
    weeklyReminder: { subject: string; content: string };
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;

  async initialize() {
    try {
      // Fetch email configuration from platform settings
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'email')
        .single();

      if (error || !data) {
        throw new Error('Email configuration not found');
      }

      this.config = data.setting_value as EmailConfig;

      // Create transporter if SMTP is configured
      if (this.config.smtp.host && this.config.smtp.username && this.config.smtp.password) {
        this.transporter = nodemailer.createTransporter({
          host: this.config.smtp.host,
          port: this.config.smtp.port,
          secure: this.config.smtp.secure,
          auth: {
            user: this.config.smtp.username,
            pass: this.config.smtp.password,
          },
        });

        // Verify connection
        await this.transporter.verify();
        console.log('✅ SMTP connection verified');
      } else {
        console.warn('⚠️ SMTP not configured, emails will not be sent');
      }
    } catch (error) {
      console.error('❌ Error initializing email service:', error);
      throw error;
    }
  }

  async sendEmail(options: EmailOptions) {
    if (!this.transporter || !this.config) {
      throw new Error('Email service not initialized or SMTP not configured');
    }

    const mailOptions = {
      from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, userName: string) {
    if (!this.config) {
      throw new Error('Email configuration not found');
    }

    const template = this.config.templates.welcome;
    const html = template.content
      .replace(/\[Naam\]/g, userName)
      .replace(/\n/g, '<br>');

    return this.sendEmail({
      to,
      subject: template.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #B6C948; padding: 20px; text-align: center;">
            <h1 style="color: #181F17; margin: 0;">Top Tier Men</h1>
          </div>
          <div style="padding: 20px;">
            ${html}
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login" 
                 style="background-color: #B6C948; color: #181F17; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Inloggen
              </a>
            </div>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #666;">
            <p>© 2024 Top Tier Men. Alle rechten voorbehouden.</p>
          </div>
        </div>
      `
    });
  }

  async sendPasswordResetEmail(to: string, userName: string, resetLink: string) {
    if (!this.config) {
      throw new Error('Email configuration not found');
    }

    const template = this.config.templates.passwordReset;
    const html = template.content
      .replace(/\[Naam\]/g, userName)
      .replace(/\[RESET_LINK\]/g, resetLink)
      .replace(/\n/g, '<br>');

    return this.sendEmail({
      to,
      subject: template.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #B6C948; padding: 20px; text-align: center;">
            <h1 style="color: #181F17; margin: 0;">Top Tier Men</h1>
          </div>
          <div style="padding: 20px;">
            ${html}
            <div style="margin-top: 30px; text-align: center;">
              <a href="${resetLink}" 
                 style="background-color: #B6C948; color: #181F17; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Wachtwoord Resetten
              </a>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Als je geen wachtwoord reset hebt aangevraagd, kun je deze e-mail negeren.
            </p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #666;">
            <p>© 2024 Top Tier Men. Alle rechten voorbehouden.</p>
          </div>
        </div>
      `
    });
  }

  async sendWeeklyReminderEmail(to: string, userName: string) {
    if (!this.config) {
      throw new Error('Email configuration not found');
    }

    const template = this.config.templates.weeklyReminder;
    const html = template.content
      .replace(/\[Naam\]/g, userName)
      .replace(/\n/g, '<br>');

    return this.sendEmail({
      to,
      subject: template.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #B6C948; padding: 20px; text-align: center;">
            <h1 style="color: #181F17; margin: 0;">Top Tier Men</h1>
          </div>
          <div style="padding: 20px;">
            ${html}
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
                 style="background-color: #B6C948; color: #181F17; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Ga naar Dashboard
              </a>
            </div>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #666;">
            <p>© 2024 Top Tier Men. Alle rechten voorbehouden.</p>
          </div>
        </div>
      `
    });
  }

  async sendCustomEmail(to: string, subject: string, content: string) {
    return this.sendEmail({
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #B6C948; padding: 20px; text-align: center;">
            <h1 style="color: #181F17; margin: 0;">Top Tier Men</h1>
          </div>
          <div style="padding: 20px;">
            ${content}
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #666;">
            <p>© 2024 Top Tier Men. Alle rechten voorbehouden.</p>
          </div>
        </div>
      `
    });
  }

  isConfigured(): boolean {
    return this.transporter !== null && this.config !== null;
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService; 