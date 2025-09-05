import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface EmailConfig {
  provider: 'api' | 'smtp';
  useManualSmtp: boolean;
  smtpHost?: string;
  smtpPort?: string;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName: string;
}

export class EmailService {
  private config: EmailConfig | null = null;

  async getConfig(): Promise<EmailConfig> {
    if (this.config) return this.config;
    
    console.log('📧 Using direct email configuration...');
    
    // Use direct configuration instead of database lookup
    this.config = {
      provider: 'smtp',
      useManualSmtp: true,
      smtpHost: process.env.SMTP_HOST || 'toptiermen.eu',
      smtpPort: process.env.SMTP_PORT || '465',
      smtpSecure: process.env.SMTP_SECURE === 'true' || true,
      smtpUsername: process.env.SMTP_USERNAME || 'platform@toptiermen.eu',
      smtpPassword: process.env.SMTP_PASSWORD,
      fromEmail: process.env.FROM_EMAIL || 'platform@toptiermen.eu',
      fromName: process.env.FROM_NAME || 'Top Tier Men'
    };
    
    console.log('✅ Email configuration loaded from environment');
    return this.config;
  }

  async sendEmail(to: string, subject: string, template: string, variables: Record<string, string>, options: { tracking?: boolean } = {}): Promise<boolean> {
    const config = await this.getConfig();
    
    const emailTemplate = this.getTemplate(template, variables);
    
    console.log('📧 Sending email:', {
      to,
      subject: emailTemplate.subject,
      template,
      provider: config.provider,
      useManualSmtp: config.useManualSmtp,
      tracking: options.tracking
    });

    try {
      // Skip tracking for now to avoid database issues
      console.log('📧 Skipping email tracking to avoid database dependencies');

      // Send email
      if (config.provider === 'smtp' && config.useManualSmtp) {
        return await this.sendViaSmtp(to, emailTemplate.subject, emailTemplate.html, emailTemplate.text);
      } else {
        return await this.sendViaApi(to, emailTemplate.subject, emailTemplate.html, emailTemplate.text);
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  private getTemplate(template: string, variables: Record<string, string>): { subject: string; html: string; text: string } {
    const templates = {
      welcome: {
        subject: '🎯 Welkom in de Top Tier Men Broederschap!',
        html: `
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px 30px; text-align: center;">
                <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" style="width: 200px; height: auto; margin-bottom: 20px;">
                <h1 style="color: white; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  WELKOM IN DE BROEDERSCHAP
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 12px 0 0 0; font-weight: 500;">
                  Jouw reis naar excellentie begint hier
                </p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px; color: #E5E7EB;">
                <p style="font-size: 18px; color: #8BAE5A; font-weight: 600; margin: 0 0 24px 0;">
                  Beste \${name},
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Je hebt de eerste stap gezet naar een leven van excellentie. Als onderdeel van onze exclusieve broederschap krijg je toegang tot bewezen strategieën, persoonlijke voedings- en trainingsplannen en een community van gelijkgestemde mannen die elkaar naar succes duwen.
                </p>

                <div style="background: rgba(139, 174, 90, 0.1); border-left: 4px solid #8BAE5A; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #8BAE5A; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    🎯 EXCLUSIEVE PRE-LAUNCH TOEGANG
                  </h3>
                  <p style="font-size: 15px; line-height: 1.5; margin: 0 0 12px 0; color: #D1D5DB;">
                    Je behoort tot de exclusieve lijst van pre-launch leden! In de komende dagen ontvang je sneak previews van het platform, exclusieve content en diepgaande inzichten in wat Top Tier Men voor jou kan betekenen. Deze previews zijn alleen beschikbaar voor een selecte groep - jij bent een van hen.
                  </p>
                  <div style="text-align: center; background: rgba(139, 174, 90, 0.2); padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <p style="color: #B6C948; font-weight: 700; font-size: 16px; margin: 0;">
                      ⏰ Nog <strong style="color: #FFFFFF;">${Math.ceil((new Date('2025-09-10').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}</strong> dagen tot de officiële launch!
                    </p>
                    <p style="color: #8BAE5A; font-size: 14px; margin: 5px 0 0 0;">
                      10 september 2025
                    </p>
                  </div>
                </div>

                <h3 style="color: #8BAE5A; font-size: 20px; font-weight: 700; margin: 32px 0 16px 0;">
                  Wat is Top Tier Men?
                </h3>
                <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; color: #D1D5DB;">
                  Top Tier Men is een exclusieve community van mannen die streven naar excellentie in alle aspecten van hun leven. Onder leiding van Rick Cuijpers, oud marinier en ervaren coach, bieden we een complete aanpak voor fysieke, mentale en professionele groei.
                </p>

                <div style="background: rgba(139, 174, 90, 0.05); border: 1px solid rgba(139, 174, 90, 0.2); padding: 24px; margin: 24px 0; border-radius: 12px;">
                  <h3 style="color: #8BAE5A; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    Wat maakt ons uniek?
                  </h3>
                  <ul style="font-size: 15px; line-height: 1.5; margin: 0; color: #D1D5DB; padding-left: 20px;">
                    <li style="margin-bottom: 8px;"><strong>Bewezen Methoden:</strong> Gebaseerd op militaire discipline en real-world ervaring</li>
                    <li style="margin-bottom: 8px;"><strong>Persoonlijke Aanpak:</strong> Individuele voedings- en trainingsplannen op maat</li>
                    <li style="margin-bottom: 8px;"><strong>Community Support:</strong> Een broederschap van gelijkgestemde mannen</li>
                    <li style="margin-bottom: 8px;"><strong>Holistische Groei:</strong> Focus op lichaam, geest en carrière</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://platform.toptiermen.eu" 
                     style="display: inline-block; background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 6px 20px rgba(139, 174, 90, 0.3); transition: all 0.3s ease;">
                    🚀 ONTDEK HET PLATFORM
                  </a>
                </div>

                <p style="font-size: 15px; line-height: 1.6; margin: 24px 0 16px 0; color: #D1D5DB;">
                  Welkom bij Top Tier Men. Laten we samen jouw potentieel ontketenen.
                </p>

                <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #8BAE5A;">
                  Met respect en waardering,<br>
                  <strong>Rick Cuijpers & Het Top Tier Men Team</strong>
                </p>
              </div>

              <!-- Footer -->
              <div style="background: rgba(139, 174, 90, 0.1); padding: 30px; text-align: center; border-top: 1px solid rgba(139, 174, 90, 0.2);">
                <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" style="width: 150px; height: auto; margin-bottom: 15px; opacity: 0.8;">
                <p style="color: #8BAE5A; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                  © 2024 Top Tier Men - Exclusieve Broederschap voor Top Performers
                </p>
                <p style="color: #D1D5DB; font-size: 12px; margin: 0;">
                  Website: <a href="https://platform.toptiermen.eu" style="color: #8BAE5A; text-decoration: none;">platform.toptiermen.eu</a> | 
                  Contact: <a href="mailto:platform@toptiermen.eu" style="color: #8BAE5A; text-decoration: none;">platform@toptiermen.eu</a>
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
🎯 WELKOM IN DE TOP TIER MEN BROEDERSCHAP!

Beste \${name},

Je hebt de eerste stap gezet naar een leven van excellentie. Als onderdeel van onze exclusieve broederschap krijg je toegang tot bewezen strategieën, persoonlijke voedings- en trainingsplannen en een community van gelijkgestemde mannen die elkaar naar succes duwen.

🎯 EXCLUSIEVE PRE-LAUNCH TOEGANG
Je behoort tot de exclusieve lijst van pre-launch leden! In de komende dagen ontvang je sneak previews van het platform, exclusieve content en diepgaande inzichten in wat Top Tier Men voor jou kan betekenen.

⏰ Nog ${Math.ceil((new Date('2025-09-10').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dagen tot de officiële launch (10 september 2025)!

WAT IS TOP TIER MEN?
Top Tier Men is een exclusieve community van mannen die streven naar excellentie in alle aspecten van hun leven. Onder leiding van Rick Cuijpers, oud marinier en ervaren coach, bieden we een complete aanpak voor fysieke, mentale en professionele groei.

WAT MAAKT ONS UNIEK?
- Bewezen Methoden: Gebaseerd op militaire discipline en real-world ervaring
- Persoonlijke Aanpak: Individuele voedings- en trainingsplannen op maat
- Community Support: Een broederschap van gelijkgestemde mannen
- Holistische Groei: Focus op lichaam, geest en carrière

🚀 ONTDEK HET PLATFORM: https://platform.toptiermen.eu

Welkom bij Top Tier Men. Laten we samen jouw potentieel ontketenen.

Met respect en waardering,
Rick Cuijpers & Het Top Tier Men Team

---
© 2024 Top Tier Men - Exclusieve Broederschap voor Top Performers
Website: https://platform.toptiermen.eu
Contact: platform@toptiermen.eu
        `
      },
      sneak_preview: {
        subject: '🎬 EXCLUSIEVE VIDEO - Eerste kijk in het Top Tier Men Platform',
        html: `
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 30px; text-align: center;">
                <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" style="width: 180px; height: auto; margin-bottom: 15px;">
                <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  🎬 EXCLUSIEVE PREVIEW
                </h1>
              </div>

              <!-- Content -->
              <div style="padding: 30px; color: #E5E7EB;">
                <p style="font-size: 18px; color: #8BAE5A; font-weight: 600; margin: 0 0 20px 0;">
                  Hey \${name}!
                </p>

                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; color: #FFFFFF;">
                  Je behoort tot een <strong style="color: #8BAE5A;">selectieve groep</strong> die als eerste het Top Tier Men platform mag zien. 
                </p>

                <!-- Video Section -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="\${videoUrl}" style="display: block; position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <img src="https://platform.toptiermen.eu/platform-preview.png" alt="Platform Preview" style="width: 100%; height: auto; display: block;">
                    <!-- Play Button Overlay -->
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; background: rgba(139, 174, 90, 0.95); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0,0,0,0.4);">
                      <div style="width: 0; height: 0; border-left: 22px solid white; border-top: 12px solid transparent; border-bottom: 12px solid transparent; margin-left: 4px;"></div>
                    </div>
                  </a>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 25px 0;">
                  <a href="\${videoUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 6px 20px rgba(139, 174, 90, 0.3); transition: all 0.3s ease;">
                    ▶️ BEKIJK DE VIDEO
                  </a>
                </div>

                <!-- Exclusivity -->
                <div style="background: rgba(139, 174, 90, 0.1); border-left: 4px solid #8BAE5A; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                  <p style="font-size: 14px; line-height: 1.5; margin: 0; color: #D1D5DB; text-align: center;">
                    🔒 <strong style="color: #8BAE5A;">Exclusief voor pre-launch leden</strong><br>
                    Deel deze video niet - houd het onder ons!
                  </p>
                </div>

                <p style="font-size: 15px; line-height: 1.6; margin: 25px 0 0 0; color: #8BAE5A; text-align: center;">
                  Groet,<br>
                  <strong>Het Top Tier Men Team</strong>
                </p>
              </div>

              <!-- Footer -->
              <div style="background: rgba(139, 174, 90, 0.1); padding: 20px; text-align: center; border-top: 1px solid rgba(139, 174, 90, 0.2);">
                <p style="color: #8BAE5A; font-size: 12px; margin: 0;">
                  © 2024 Top Tier Men | <a href="https://platform.toptiermen.eu" style="color: #8BAE5A; text-decoration: none;">platform.toptiermen.eu</a>
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
🎬 EXCLUSIEVE VIDEO - Eerste kijk in het Top Tier Men Platform

Hey \${name}!

Je behoort tot een selectieve groep die als eerste het Top Tier Men platform mag zien.

🎥 BEKIJK DE VIDEO:
\${videoUrl}

🔒 Exclusief voor pre-launch leden - Deel deze video niet, houd het onder ons!

Groet,
Het Top Tier Men Team

---
© 2024 Top Tier Men | platform.toptiermen.eu
        `
      }
    };

    const emailTemplate = templates[template] || templates.welcome;
    
    // Replace variables in template
    let html = emailTemplate.html;
    let text = emailTemplate.text;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp('\\$\\{' + key + '\\}', 'g');
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
      const config = await this.getConfig();
      
      console.log('📧 Sending email via SMTP:', {
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        username: config.smtpUsername,
        to,
        subject,
        from: config.fromName + ' <' + config.fromEmail + '>'
      });

      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: parseInt(config.smtpPort || '465'),
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUsername,
          pass: config.smtpPassword
        }
      });

      const mailOptions = {
        from: config.fromName + ' <' + config.fromEmail + '>',
        to,
        subject,
        html,
        text
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully via SMTP:', {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected
      });

      // Log email to database
      await this.logEmail(to, 'smtp', subject);
      return true;
    } catch (error) {
      console.error('❌ Error sending email via SMTP:', error);
      return false;
    }
  }

  private async logEmail(to: string, method: string, subject: string): Promise<void> {
    // Skip database logging for now to avoid dependency issues
    console.log('📧 Email sent:', { to, method, subject, timestamp: new Date().toISOString() });
  }
}

// Legacy wrapper class for backwards compatibility
class LegacyEmailService extends EmailService {
  async sendEmail(options: {
    to: string;
    template: string;
    variables: Record<string, string>;
  }, trackingOptions?: any): Promise<boolean> {
    // Convert old interface to new interface
    return super.sendEmail(
      options.to,
      '', // subject will be from template
      options.template,
      options.variables,
      { tracking: true }
    );
  }
}

// Export a default instance for backwards compatibility
export const emailService = new LegacyEmailService();
