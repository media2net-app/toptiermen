import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { getEmailConfig } from './email-config';
import { emailService } from './email-service';

export class MailgunEmailService {
  private mailgun: any;
  private domain: string;
  private fromEmail: string;
  private fromName: string;
  private isConfigured: boolean = false;

  constructor() {
    try {
      const config = getEmailConfig();
      
      if (config.provider !== 'mailgun' || !config.mailgunApiKey || config.mailgunApiKey === 'key-4f8b2c1e3d9a7f6e5c4b3a2d1e0f9g8h') {
        console.log('⚠️ Mailgun not properly configured, will use SMTP fallback');
        this.isConfigured = false;
        return;
      }

      this.mailgun = new Mailgun(formData).client({
        username: 'api',
        key: config.mailgunApiKey
      });
      
      this.domain = config.mailgunDomain || 'toptiermen.eu';
      this.fromEmail = config.fromEmail;
      this.fromName = config.fromName;
      this.isConfigured = true;

      console.log('🚀 Mailgun Email Service initialized for domain:', this.domain);
    } catch (error) {
      console.error('❌ Failed to initialize Mailgun, using SMTP fallback:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent?: string,
    trackingId?: string
  ): Promise<boolean> {
    // If Mailgun is not configured, use SMTP fallback
    if (!this.isConfigured) {
      console.log('📧 Using SMTP fallback for email sending...');
      return await emailService.sendEmail({
        to: to,
        template: 'custom',
        variables: {
          subject: subject,
          htmlContent: htmlContent,
          trackingId: trackingId || ''
        }
      });
    }

    try {
      console.log('📧 Sending email via Mailgun:', {
        to,
        subject,
        domain: this.domain,
        trackingEnabled: !!trackingId
      });

      // Add tracking pixel if trackingId is provided
      let finalHtmlContent = htmlContent;
      if (trackingId) {
        const trackingPixel = `<img src="https://platform.toptiermen.eu/email-track/open?trackingId=${trackingId}" alt="" style="display:none;width:1px;height:1px;" />`;
        finalHtmlContent = htmlContent.replace('[TRACKING_ID]', trackingId);
        
        // If no [TRACKING_ID] placeholder found, append to body
        if (!finalHtmlContent.includes(trackingPixel)) {
          finalHtmlContent = finalHtmlContent.replace('</body>', `${trackingPixel}</body>`);
        }
      }

      const messageData = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: to,
        subject: subject,
        html: finalHtmlContent,
        text: textContent || this.htmlToText(htmlContent),
        'o:tracking': 'yes',
        'o:tracking-clicks': 'yes',
        'o:tracking-opens': 'yes'
      };

      const response = await this.mailgun.messages.create(this.domain, messageData);
      
      console.log('✅ Email sent successfully via Mailgun:', {
        messageId: response.id,
        to: to,
        subject: subject
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to send email via Mailgun, trying SMTP fallback:', error);
      
      // Fallback to SMTP
      return await emailService.sendEmail({
        to: to,
        template: 'custom',
        variables: {
          subject: subject,
          htmlContent: htmlContent,
          trackingId: trackingId || ''
        }
      });
    }
  }

  async sendBulkEmails(
    recipients: Array<{
      email: string;
      name?: string;
      trackingId?: string;
    }>,
    subject: string,
    htmlTemplate: string,
    textTemplate?: string,
    delayMs: number = 100
  ): Promise<{ sent: number; failed: number; results: Array<{ email: string; success: boolean; error?: string }> }> {
    const results: Array<{ email: string; success: boolean; error?: string }> = [];
    let sent = 0;
    let failed = 0;

    console.log(`🚀 Starting bulk email send via Mailgun to ${recipients.length} recipients`);

    for (const recipient of recipients) {
      try {
        // Replace placeholders in templates
        let personalizedHtml = htmlTemplate
          .replace(/\[NAAM\]/g, recipient.name || recipient.email.split('@')[0])
          .replace(/\[EMAIL\]/g, recipient.email);

        let personalizedText = textTemplate
          ?.replace(/\[NAAM\]/g, recipient.name || recipient.email.split('@')[0])
          .replace(/\[EMAIL\]/g, recipient.email);

        const success = await this.sendEmail(
          recipient.email,
          subject,
          personalizedHtml,
          personalizedText,
          recipient.trackingId
        );

        if (success) {
          sent++;
          results.push({ email: recipient.email, success: true });
        } else {
          failed++;
          results.push({ email: recipient.email, success: false, error: 'Send failed' });
        }

        // Delay between emails to avoid rate limiting
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }

      } catch (error) {
        failed++;
        results.push({ 
          email: recipient.email, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        console.error(`❌ Failed to send to ${recipient.email}:`, error);
      }
    }

    console.log(`✅ Bulk email send completed: ${sent} sent, ${failed} failed`);
    return { sent, failed, results };
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Mailgun connection...');
      
      // Test by getting domain info
      const response = await this.mailgun.domains.get(this.domain);
      
      console.log('✅ Mailgun connection test successful:', {
        domain: response.domain?.name,
        state: response.domain?.state
      });
      
      return true;
    } catch (error) {
      console.error('❌ Mailgun connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mailgunEmailService = new MailgunEmailService();
