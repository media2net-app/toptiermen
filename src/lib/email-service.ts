import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getEmailConfig } from '@/lib/email-config';
import sgMail from '@sendgrid/mail';

interface EmailConfig {
  provider: 'api' | 'smtp' | 'mailgun';
  useManualSmtp: boolean;
  smtpHost?: string;
  smtpPort?: string;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
  mailgunApiKey?: string;
  mailgunDomain?: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailOptions {
  tracking?: boolean;
  userId?: string;
}

export class EmailService {
  private config: EmailConfig | null = null;

  async getConfig(): Promise<EmailConfig> {
    if (this.config) return this.config;
    
    console.log('📧 Loading email configuration...');
    
    // Use the centralized email config
    const emailConfig = getEmailConfig();
    
    this.config = {
      provider: emailConfig.provider,
      useManualSmtp: emailConfig.provider === 'smtp',
      smtpHost: emailConfig.smtpHost,
      smtpPort: emailConfig.smtpPort?.toString(),
      smtpSecure: emailConfig.smtpSecure,
      smtpUsername: emailConfig.smtpUsername,
      smtpPassword: emailConfig.smtpPassword,
      mailgunApiKey: emailConfig.mailgunApiKey,
      mailgunDomain: emailConfig.mailgunDomain,
      fromEmail: emailConfig.fromEmail,
      fromName: emailConfig.fromName
    };
    
    console.log(`✅ Email configuration loaded: ${emailConfig.provider} provider`);
    return this.config;
  }

  async isTemplateEnabled(templateId: string): Promise<boolean> {
    try {
      // Default template status (all enabled by default)
      const defaultStatus = {
        'welcome': true,
        'password-reset': true,
        'account-credentials': true,
        'sneak-preview': true,
        'onboarding-welcome': true,
        'challenge-reminder': true,
        'badge-earned': true,
        'newsletter': true
      };

      // Get template status from database
      const { data: settings, error } = await supabaseAdmin
        .from('platform_settings')
        .select('email_template_status')
        .eq('key', 'email_template_status')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching template status:', error);
        return defaultStatus[templateId] !== false; // Default to enabled if error
      }

      const templateStatus = settings?.email_template_status || defaultStatus;
      return templateStatus[templateId] !== false; // Default to enabled if not set
      
    } catch (error) {
      console.error('❌ Error checking template status:', error);
      return true; // Default to enabled if error
    }
  }

  async sendEmail(to: string, subject: string, template: string, variables: Record<string, string>, options: EmailOptions = {}): Promise<boolean> {
    // Check if template is enabled
    const isTemplateEnabled = await this.isTemplateEnabled(template);
    if (!isTemplateEnabled) {
      console.log(`📧 Template ${template} is disabled, skipping email to ${to}`);
      return true; // Return true to not break the calling process
    }

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

    let emailSuccess = false;
    let errorMessage: string | null = null;
    let messageId: string | null = null;

    try {
      // Send email
      if (config.provider === 'mailgun') {
        emailSuccess = await this.sendViaMailgun(to, emailTemplate.subject, emailTemplate.html, emailTemplate.text);
      } else if (config.provider === 'smtp' && config.useManualSmtp) {
        emailSuccess = await this.sendViaSmtp(to, emailTemplate.subject, emailTemplate.html, emailTemplate.text);
      } else {
        emailSuccess = await this.sendViaApi(to, emailTemplate.subject, emailTemplate.html, emailTemplate.text);
      }

      if (emailSuccess) {
        messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`✅ Email sent successfully to ${to}`);
      } else {
        errorMessage = 'Email sending failed';
        console.error(`❌ Failed to send email to ${to}`);
      }
    } catch (error) {
      emailSuccess = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to send email:', error);
    }

    // Log email attempt to database
    try {
      console.log('📧 Attempting to log email attempt to database...');
      await this.logEmailAttempt({
        userId: options.userId || null,
        toEmail: to,
        emailType: template,
        subject: emailTemplate.subject,
        status: emailSuccess ? 'sent' : 'failed',
        errorMessage: errorMessage,
        provider: config.provider,
        messageId: messageId,
        templateId: template
      });
      console.log('✅ Email attempt logged successfully to database');
    } catch (logError) {
      console.error('❌ Failed to log email attempt:', logError);
      // Don't fail the email sending if logging fails
    }

    return emailSuccess;
  }

  async logEmailAttempt(logData: {
    userId: string | null;
    toEmail: string;
    emailType: string;
    subject: string;
    status: 'sent' | 'failed' | 'pending' | 'delivered';
    errorMessage: string | null;
    provider: string;
    messageId: string | null;
    templateId: string;
  }): Promise<void> {
    try {
      console.log('📧 logEmailAttempt called with data:', logData);
      
      // Only log if we have Supabase configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('📧 Supabase not configured, skipping email logging');
        console.log('📧 NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('📧 SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
        return;
      }

      console.log('📧 Supabase configured, creating client...');
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      console.log('📧 Inserting email log into database...');
      const { error } = await supabase
        .from('email_logs')
        .insert([{
          id: crypto.randomUUID(), // Generate UUID for the id field
          user_id: logData.userId,
          to_email: logData.toEmail,
          email_type: logData.emailType,
          subject: logData.subject,
          status: logData.status,
          error_message: logData.errorMessage,
          provider: logData.provider,
          message_id: logData.messageId,
          template_id: logData.templateId
        }]);

      if (error) {
        console.error('❌ Error logging email attempt:', error);
      } else {
        console.log(`✅ Email logged successfully: ${logData.emailType} to ${logData.toEmail} (${logData.status})`);
      }
    } catch (error) {
      console.error('❌ Failed to log email attempt:', error);
    }
  }

  getTemplate(template: string, variables: Record<string, string>): { subject: string; html: string; text: string } {
    const templates = {
      'platform_relaunch': {
        subject: 'Platform her-lancering 3 oktober 20:00',
        html: `
          <div style="background:linear-gradient(135deg,#0F1419 0%,#1F2D17 100%);padding:32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#E5E7EB;">
            <div style="max-width:640px;margin:0 auto;background:#0F1419;border:1px solid #2A3A1A;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,.35)">
              <div style="background:linear-gradient(135deg,#8BAE5A 0%,#B6C948 100%);padding:28px 24px;text-align:center">
                <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men" style="width:128px;height:auto;display:block;margin:0 auto 10px auto;border-radius:8px;" />
                <h1 style="margin:0;color:#0F1419;font-weight:800;font-size:22px;letter-spacing:.5px;">Top Tier Men</h1>
              </div>
              <div style="padding:28px 24px">
                <h2 style="margin:0 0 8px 0;color:#8BAE5A;font-size:18px;font-weight:700">Platform her-lancering 3 oktober 20:00</h2>
                <p style="margin:8px 0 16px 0;line-height:1.6">Het platform is gereed voor gebruik! Wij zijn dit momenteel met een aantal testgebruikers nogmaals grondig aan het controleren, maar kunnen je vertellen dat we a.s. vrijdag <strong>3 oktober om 20:00</strong> opnieuw live gaan!</p>
                <p style="margin:8px 0;line-height:1.6"><strong>Excuus</strong> dat het langer heeft geduurd dan gepland.</p>
                <p style="margin:0 0 16px 0;line-height:1.6">Het platform is nu <strong>volledig voorzien van alle functionaliteiten</strong>.</p>
                <div style="background:rgba(139,174,90,.12);border-left:4px solid #8BAE5A;padding:14px 16px;border-radius:6px;margin:16px 0">
                  <p style="margin:0;line-height:1.6"><strong>Belangrijk:</strong> We resetten alle accounts, dus iedereen zal weer vanaf onboarding beginnen.</p>
                </div>
                <p style="margin:16px 0 0 0;line-height:1.6">Tot snel,<br/>Het Top Tier Men team</p>
              </div>
              <div style="padding:16px 24px;border-top:1px solid #2A3A1A;text-align:center;color:#9CA3AF;font-size:12px">
                Deze e-mail is alleen als test verstuurd naar chielvanderzee@gmail.com
              </div>
            </div>
          </div>
        `,
        text: `Platform her-lancering 3 oktober 20:00\n\nHet platform is gereed voor gebruik! We controleren momenteel alles met een aantal testgebruikers, maar we kunnen melden dat we a.s. vrijdag 3 oktober om 20:00 opnieuw live gaan!\n\nExcuus dat het langer heeft geduurd dan gepland.\nHet platform is nu volledig voorzien van alle functionaliteiten.\n\nBelangrijk: We resetten alle accounts, dus iedereen zal weer vanaf onboarding beginnen.\n\nTot snel,\nHet Top Tier Men team`
      },
      'platform-update': {
        subject: '🚀 Platform gereed voor gebruik!',
        html: `
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px 30px; text-align: center;">
                <div style="width: 200px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; border: 2px solid rgba(255,255,255,0.2);">
                  <span style="color: white; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">TOP TIER MEN</span>
                </div>
                <h1 style="color: white; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  🚀 PLATFORM UPDATE
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 12px 0 0 0; font-weight: 500;">
                  Top Tier Men Platform is gereed!
                </p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px; color: #E5E7EB;">
                <p style="font-size: 18px; color: #8BAE5A; font-weight: 600; margin: 0 0 24px 0;">
                  Beste \${name},
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; color: #E5E7EB;">
                  We zijn sinds de laatste update hard achter de schermen bezig geweest het platform 100% werkend te maken. We kunnen nu eindelijk melden dat het platform gereed is voor gebruik.
                </p>


                <div style="background: rgba(139, 174, 90, 0.1); border-left: 4px solid #8BAE5A; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #8BAE5A; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    📱 Platform Status:
                  </h3>
                  <p style="color: #D1D5DB; font-size: 15px; line-height: 1.5; margin: 0 0 8px 0;">
                    <strong>Live URL:</strong> <a href="https://platform.toptiermen.eu" style="color: #8BAE5A;">https://platform.toptiermen.eu</a>
                  </p>
                  <p style="color: #D1D5DB; font-size: 15px; line-height: 1.5; margin: 0 0 8px 0;">
                    <strong>Status:</strong> ✅ Volledig operationeel
                  </p>
                  <p style="color: #D1D5DB; font-size: 15px; line-height: 1.5; margin: 0;">
                    <strong>Versie:</strong> 3.1 Improved
                  </p>
                </div>

                <h3 style="color: #8BAE5A; font-size: 20px; font-weight: 700; margin: 32px 0 16px 0;">
                  🎯 Volgende stappen:
                </h3>
                <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; color: #D1D5DB;">
                  Het platform is nu klaar voor gebruik door alle leden. Alle core functionaliteiten zijn werkend en getest.
                </p>

                <div style="background: rgba(139, 174, 90, 0.1); border-left: 4px solid #8BAE5A; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #D1D5DB; font-size: 15px; line-height: 1.5; margin: 0;">
                    <strong>⚠️ Belangrijk:</strong> Ervaar je toch nog problemen tijdens het gebruik van het platform, mail dan rechtstreeks naar <a href="mailto:rick@toptiermen.eu" style="color: #8BAE5A;">rick@toptiermen.eu</a>
                  </p>
                </div>

                <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; color: #D1D5DB;">
                  Binnen nu en 2 weken staat onze eerste groeps video call gepland, meer info hierover volgt. In de eerste call gaan we kennismaken met elkaar, en is er ruimte om functies en wensen te bespreken van het platform.
                </p>

                <p style="font-size: 16px; line-height: 1.6; margin: 32px 0 0 0; color: #8BAE5A; font-weight: 600;">
                  Met vriendelijke groet,<br>
                  <strong>Top Tier Men Team</strong>
                </p>
              </div>

              <!-- Footer -->
              <div style="background: #0F1419; padding: 20px 30px; text-align: center; border-top: 1px solid #2A3A1A;">
                <p style="color: #6B7280; font-size: 14px; margin: 0;">
                  Top Tier Men Platform | Versie 3.1 Improved
                </p>
                <p style="color: #6B7280; font-size: 12px; margin: 5px 0 0 0;">
                  Deze mail is alleen verstuurd naar chielvanderzee@gmail.com
                </p>
              </div>
            </div>
          </div>
        `,
        text: `Platform Update - Top Tier Men

Beste ${variables.name || 'Chiel'},

We zijn sinds de laatste update hard achter de schermen bezig geweest het platform 100% werkend te maken. We kunnen nu eindelijk melden dat het platform gereed is voor gebruik.


Platform Status:
- Live URL: https://platform.toptiermen.eu
- Status: ✅ Volledig operationeel
- Versie: 3.1 Improved

Volgende stappen:
Het platform is nu klaar voor gebruik door alle leden. Alle core functionaliteiten zijn werkend en getest.

⚠️ Belangrijk: Ervaar je toch nog problemen tijdens het gebruik van het platform, mail dan rechtstreeks naar rick@toptiermen.eu

Binnen nu en 2 weken staat onze eerste groeps video call gepland, meer info hierover volgt. In de eerste call gaan we kennismaken met elkaar, en is er ruimte om functies en wensen te bespreken van het platform.

Met vriendelijke groet,
Top Tier Men Team

---
Top Tier Men Platform | Versie 3.1 Improved
Deze mail is alleen verstuurd naar chielvanderzee@gmail.com`
      },
      welcome: {
        subject: '🎯 Welkom in de Top Tier Men Broederschap!',
        html: `
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px 30px; text-align: center;">
                     <div style="width: 200px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; border: 2px solid rgba(255,255,255,0.2);">
                       <span style="color: white; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">TOP TIER MEN</span>
                     </div>
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
                  © 2025 Top Tier Men - Exclusieve Broederschap voor Top Performers
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
© 2025 Top Tier Men - Exclusieve Broederschap voor Top Performers
Website: https://platform.toptiermen.eu
Contact: platform@toptiermen.eu
        `
      },
      'password-reset-minimal': {
        subject: 'Top Tier Men – Wachtwoord reset',
        html: `
          <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111;">
            <p>Hoi \${name},</p>
            <p>Je wachtwoord is opnieuw ingesteld. Je tijdelijke wachtwoord is:</p>
            <p><strong style="font-size:18px;">\${tempPassword}</strong></p>
            <p>Inloggen: <a href="https://platform.toptiermen.eu/login">https://platform.toptiermen.eu/login</a></p>
            <p>Wij raden aan om na het inloggen direct je wachtwoord te wijzigen.</p>
            <hr style="border:none;border-top:1px solid #ddd;" />
            <p style="font-size:12px;color:#666;">Afzender: \${supportEmail || 'info@toptiermen.nl'}. Antwoorden kan op dit adres.</p>
          </div>
        `,
        text: `Hoi \${name},\n\nJe wachtwoord is opnieuw ingesteld. Tijdelijk wachtwoord: \${tempPassword}\nInloggen: https://platform.toptiermen.eu/login\n\nWij raden aan om na het inloggen direct je wachtwoord te wijzigen.\n\n— Top Tier Men`
      },
      // Allow fully custom subject/html/text provided by variables
      custom_html: {
        subject: `${variables.subject || 'Custom Email'}`,
        html: `${variables.html || '<div style="font-family:Arial,sans-serif;padding:16px">\n  <h2 style="color:#8BAE5A;margin:0 0 12px 0">Aangepaste e-mail</h2>\n  <p>Vervang deze content door je eigen HTML.</p>\n</div>'}`,
        text: `${variables.text || 'Aangepaste tekstversie'}`
      },
      // New announcement: Relaunch 10 October 20:00
      platform_relaunch_oct10: {
        subject: 'Platform 100% – we gaan 10 oktober 20:00 live',
        html: `
          <style>@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&display=swap');</style>
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); padding: 32px 0; font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #E5EFE8;">
            <div style="max-width:640px;margin:0 auto;background:#0F1419;border:1px solid #2A3A1A;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,.35)">
              <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding:24px; text-align:center">
                <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men" style="height:32px;display:block;margin:0 auto 8px auto" />
                <div style="font-weight:800;letter-spacing:.3px;color:#162013;font-size:18px">Top Tier Men</div>
              </div>
              <div style="padding:28px 24px;">
                <h1 style="margin:0 0 8px 0;color:#B6C948;font-size:22px">We gaan live: 10 oktober 20:00</h1>
                <p style="margin:6px 0 16px 0;color:#C7D7C0">Het platform is <strong>100%</strong> klaar. Dit is waar we hebben gestaan, wat we hebben gedaan, en wat je nu kunt verwachten.</p>

                <div style="background:#162013;border:1px solid #2A3A1A;border-radius:10px;padding:16px;margin:16px 0">
                  <p style="margin:0;color:#E5EFE8"><strong>Samenvatting sinds 10 september</strong></p>
                  <p style="margin:8px 0 0 0;color:#C7D7C0">Op 10 september bij de livegang zijn er helaas problemen ontstaan waardoor het platform niet functioneerde zoals het moest functioneren.</p>
                </div>

                <p style="margin:12px 0;color:#C7D7C0">Het platform is een uitgebreid systeem met verschillende onderdelen en modules. Veel modules staan met elkaar in verbinding. Dat betekent dat wanneer één onderdeel hapert, andere modules ook (niet goed) werken.</p>

                <p style="margin:12px 0;color:#C7D7C0">Sinds 10 september is het ontwikkelteam direct en onafgebroken aan de slag gegaan. We hebben dag en nacht gewerkt om alle problemen op te sporen en op te lossen.</p>

                <p style="margin:12px 0;color:#C7D7C0">Na <strong>drie weken hard werk</strong> kunnen we officieel stellen: het platform is <strong>100% werkend</strong>.</p>

                <div style="background:#1F2D17;border:1px solid #2A3A1A;border-radius:10px;padding:16px;margin:16px 0">
                  <p style="margin:0;color:#E5EFE8"><strong>Kwaliteit waarborging</strong></p>
                  <p style="margin:8px 0 0 0;color:#C7D7C0">Van <strong>3 t/m 9 oktober</strong> laten we een testteam uitgebreid alle functies nalopen, zodat we zeker weten dat dit in de toekomst niet nog eens gebeurt.</p>
                </div>

                <p style="margin:12px 0;color:#C7D7C0">We vinden het oprecht vervelend dat we je hebben moeten laten wachten. Ondanks deze tegenslag hopen we je <strong>10 oktober</strong> te verwelkomen in de broederschap.</p>

                <p style="margin:12px 0;color:#C7D7C0">Binnen nu en twee weken staat onze eerste <strong>groepscall</strong> gepland. Meer informatie volgt spoedig.</p>

                <div style="margin-top:20px;padding:14px;border-radius:10px;background:#162013;border:1px solid #2A3A1A;color:#E5EFE8;text-align:center">
                  <strong>Live op 10 oktober om 20:00</strong><br/>
                  <span style="color:#C7D7C0">Zorg dat je klaar zit — we sturen je tijdig de laatste details.</span>
                </div>

                <p style="margin:20px 0 0 0;color:#C7D7C0">Tot snel,<br/>Het Top Tier Men team</p>
              </div>
              <div style="background:#0B0F13;color:#6B7280;font-size:12px;padding:14px 20px;text-align:center;border-top:1px solid #2A3A1A">Deze e-mail is verstuurd door Top Tier Men</div>
            </div>
          </div>
        `,
        text: `We gaan live: 10 oktober 20:00\n\nHet platform is 100% klaar.\n\nSamenvatting sinds 10 september:\nOp 10 september bij de livegang zijn er problemen ontstaan waardoor het platform niet functioneerde zoals het moest functioneren.\n\nHet platform bestaat uit verschillende modules die met elkaar zijn verbonden. Als één onderdeel niet werkt, werkt de rest ook niet goed.\n\nSinds 10 september heeft het ontwikkelteam dag en nacht gewerkt om dit op te lossen.\n\nNa drie weken hard werk is het platform 100% werkend.\n\nKwaliteitswaarborging: van 3 t/m 9 oktober test een team alle functies, zodat dit in de toekomst niet nog eens gebeurt.\n\nWe vinden het oprecht vervelend dat we je hebben moeten laten wachten. We hopen je 10 oktober te verwelkomen in de broederschap.\n\nBinnen nu en twee weken volgt meer informatie over onze eerste groepscall.\n\nTot snel,\nTop Tier Men team`
      },
      sneak_preview: {
        subject: '🎬 EXCLUSIEVE VIDEO - Eerste kijk in het Top Tier Men Platform',
        html: `
          <style>@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');</style>
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
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

                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #FFFFFF;">
                  Je behoort tot een <strong style="color: #8BAE5A;">selectieve groep</strong> die als eerste het Top Tier Men platform mag zien. 
                </p>

                <!-- Countdown Section -->
                <div style="background: rgba(139, 174, 90, 0.1); border-left: 4px solid #8BAE5A; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <div style="text-align: center;">
                    <p style="color: #B6C948; font-weight: 700; font-size: 18px; margin: 0 0 8px 0;">
                      ⏰ Nog <strong style="color: #FFFFFF; font-size: 24px;">\${daysUntilLaunch}</strong> dagen tot de officiële launch!
                    </p>
                    <p style="color: #8BAE5A; font-size: 14px; margin: 0;">
                      10 september 2025
                    </p>
                  </div>
                </div>

                <!-- What Top Tier Men Means -->
                <div style="background: rgba(139, 174, 90, 0.05); border: 1px solid rgba(139, 174, 90, 0.2); padding: 24px; margin: 20px 0; border-radius: 12px;">
                  <h3 style="color: #8BAE5A; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    Wat betekent Top Tier Men voor jou?
                  </h3>
                  <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0; color: #D1D5DB;">
                    Top Tier Men is meer dan een platform - het is jouw persoonlijke transformatiepartner. We bieden een complete aanpak die jou helpt om:
                  </p>
                  
                  <div style="margin: 20px 0;">
                    <div style="display: flex; align-items: flex-start; margin: 12px 0;">
                      <span style="color: #8BAE5A; font-weight: 700; margin-right: 12px;">•</span>
                      <div>
                        <strong style="color: #B6C948;">FYSIEK:</strong> 
                        <span style="color: #D1D5DB;">Persoonlijke voedings- en trainingsplannen die echt werken</span>
                      </div>
                    </div>
                    <div style="display: flex; align-items: flex-start; margin: 12px 0;">
                      <span style="color: #8BAE5A; font-weight: 700; margin-right: 12px;">•</span>
                      <div>
                        <strong style="color: #B6C948;">MENTAAL:</strong> 
                        <span style="color: #D1D5DB;">Bewezen strategieën voor focus, discipline en mindset</span>
                      </div>
                    </div>
                    <div style="display: flex; align-items: flex-start; margin: 12px 0;">
                      <span style="color: #8BAE5A; font-weight: 700; margin-right: 12px;">•</span>
                      <div>
                        <strong style="color: #B6C948;">PROFESSIONEEL:</strong> 
                        <span style="color: #D1D5DB;">Business tools en netwerk om jouw carrière te versnellen</span>
                      </div>
                    </div>
                    <div style="display: flex; align-items: flex-start; margin: 12px 0;">
                      <span style="color: #8BAE5A; font-weight: 700; margin-right: 12px;">•</span>
                      <div>
                        <strong style="color: #B6C948;">COMMUNITY:</strong> 
                        <span style="color: #D1D5DB;">Een broederschap van gelijkgestemde mannen die elkaar naar succes duwen</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Video Section -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://platform.toptiermen.eu/sneakpreview" style="display: block; position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <img src="https://platform.toptiermen.eu/Scherm­afbeelding 2025-09-05 om 17.34.54.png" alt="Platform Preview" style="width: 100%; height: auto; display: block;">
                    <!-- Centered Play Button Overlay -->
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background: rgba(139, 174, 90, 0.95); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0,0,0,0.4);">
                      <div style="width: 0; height: 0; border-left: 26px solid white; border-top: 16px solid transparent; border-bottom: 16px solid transparent; margin-left: 6px;"></div>
                    </div>
                  </a>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://platform.toptiermen.eu/sneakpreview" style="display: inline-block; background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 8px 25px rgba(139, 174, 90, 0.3); transition: all 0.3s ease;">
                    🎬 BEKIJK DE EXCLUSIEVE VIDEO
                  </a>
                </div>

                <!-- Exclusive Note -->
                <div style="background: rgba(139, 174, 90, 0.1); border: 1px solid #8BAE5A; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                  <p style="color: #B6C948; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                    🔒 Exclusief voor pre-launch leden
                  </p>
                  <p style="color: #D1D5DB; font-size: 14px; margin: 0;">
                    Deel deze video niet, houd het onder ons!
                  </p>
                </div>

                <!-- Closing -->
                <div style="margin: 30px 0; text-align: center;">
                  <p style="color: #D1D5DB; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Groet,<br>
                    <strong>Het Top Tier Men Team</strong>
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: rgba(139, 174, 90, 0.1); padding: 20px; text-align: center; border-top: 1px solid rgba(139, 174, 90, 0.2);">
                <p style="color: #8BAE5A; font-size: 12px; margin: 0;">
                  © 2025 Top Tier Men | <a href="https://platform.toptiermen.eu" style="color: #8BAE5A; text-decoration: none;">platform.toptiermen.eu</a>
                </p>
              </div>
            </div>
            <!-- Email Tracking Pixel -->
            <img src="https://platform.toptiermen.eu/email-track/open?trackingId=\${trackingId}" alt="" style="display:none;width:1px;height:1px;" />
          </div>
        `,
        text: `
🎬 EXCLUSIEVE VIDEO - Eerste kijk in het Top Tier Men Platform

Hey \${name}!

Je behoort tot een selectieve groep die als eerste het Top Tier Men platform mag zien.

⏰ NOG \${daysUntilLaunch} DAGEN TOT DE OFFICIËLE LAUNCH!
10 september 2025

WAT BETEKENT TOP TIER MEN VOOR JOU?
Top Tier Men is meer dan een platform - het is jouw persoonlijke transformatiepartner. We bieden een complete aanpak die jou helpt om:

• FYSIEK: Persoonlijke voedings- en trainingsplannen die echt werken
• MENTAAL: Bewezen strategieën voor focus, discipline en mindset  
• PROFESSIONEEL: Business tools en netwerk om jouw carrière te versnellen
• COMMUNITY: Een broederschap van gelijkgestemde mannen die elkaar naar succes duwen

🎥 BEKIJK DE VIDEO:
https://platform.toptiermen.eu/sneakpreview

🔒 Exclusief voor pre-launch leden - Deel deze video niet, houd het onder ons!

Groet,
Het Top Tier Men Team

---
© 2025 Top Tier Men | platform.toptiermen.eu
        `
      },
      
      'test_email': {
        subject: 'Test Email - Top Tier Men',
        html: `
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px 30px; text-align: center;">
                <div style="width: 200px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; border: 2px solid rgba(255,255,255,0.2);">
                  <span style="color: white; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">TOP TIER MEN</span>
                </div>
                <h1 style="color: white; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  📧 TEST EMAIL
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 12px 0 0 0; font-weight: 500;">
                  Mailgun Email Service Test
                </p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px; color: #E5E7EB;">
                <p style="font-size: 18px; color: #8BAE5A; font-weight: 600; margin: 0 0 24px 0;">
                  Beste \${name},
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; color: #E5E7EB;">
                  Dit is een test email om te controleren of de Mailgun email service correct werkt. Als je deze email ontvangt, betekent dit dat de configuratie succesvol is!
                </p>

                <div style="background: rgba(139, 174, 90, 0.1); border-left: 4px solid #8BAE5A; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #8BAE5A; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    ✅ Test Details:
                  </h3>
                  <p style="color: #D1D5DB; font-size: 15px; line-height: 1.5; margin: 0 0 8px 0;">
                    <strong>Provider:</strong> Mailgun
                  </p>
                  <p style="color: #D1D5DB; font-size: 15px; line-height: 1.5; margin: 0 0 8px 0;">
                    <strong>Ontvanger:</strong> \${email}
                  </p>
                  <p style="color: #D1D5DB; font-size: 15px; line-height: 1.5; margin: 0;">
                    <strong>Status:</strong> ✅ Succesvol verzonden
                  </p>
                </div>

                <p style="font-size: 16px; line-height: 1.6; margin: 32px 0 0 0; color: #8BAE5A; font-weight: 600;">
                  Met vriendelijke groet,<br>
                  <strong>Top Tier Men Team</strong>
                </p>
              </div>

              <!-- Footer -->
              <div style="background: #0F1419; padding: 20px 30px; text-align: center; border-top: 1px solid #2A3A1A;">
                <p style="color: #6B7280; font-size: 14px; margin: 0;">
                  Top Tier Men Platform | Email Service Test
                </p>
              </div>
            </div>
          </div>
        `,
        text: `Test Email - Top Tier Men

Beste ${variables.name || 'Gebruiker'},

Dit is een test email om te controleren of de Mailgun email service correct werkt. Als je deze email ontvangt, betekent dit dat de configuratie succesvol is!

Test Details:
- Provider: Mailgun
- Ontvanger: ${variables.email || 'Unknown'}
- Status: ✅ Succesvol verzonden

Met vriendelijke groet,
Top Tier Men Team`
      },
      'account-credentials': {
        subject: '🔐 Je Top Tier Men Accountgegevens - Platform Live!',
        html: `
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px 30px; text-align: center;">
                     <div style="width: 200px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; border: 2px solid rgba(255,255,255,0.2);">
                       <span style="color: white; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">TOP TIER MEN</span>
                     </div>
                <h1 style="color: white; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  🚀 PLATFORM IS LIVE!
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 12px 0 0 0; font-weight: 500;">
                  Je accountgegevens zijn hier
                </p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px; color: #E5E7EB;">
                <p style="font-size: 18px; color: #8BAE5A; font-weight: 600; margin: 0 0 24px 0;">
                  Beste \${name},
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Het moment is daar! Het Top Tier Men platform is nu live en je kunt direct aan de slag. Hier zijn je accountgegevens:
                </p>

                <!-- Account Details -->
                <div style="background: rgba(139, 174, 90, 0.1); border: 2px solid #8BAE5A; padding: 30px; margin: 24px 0; border-radius: 12px;">
                  <h3 style="color: #8BAE5A; font-size: 20px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                    🔐 JE ACCOUNTGEGEVENS
                  </h3>
                  
                  <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; margin: 16px 0;">
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #8BAE5A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Platform URL:</strong>
                      <div style="color: #B6C948; font-size: 16px; font-weight: 600; margin-top: 4px;">
                        \${platformUrl}
                      </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #8BAE5A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">E-mailadres:</strong>
                      <div style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin-top: 4px;">
                        \${email}
                      </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #8BAE5A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Gebruikersnaam:</strong>
                      <div style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin-top: 4px;">
                        \${username}
                      </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #8BAE5A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Tijdelijk Wachtwoord:</strong>
                      <div style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin-top: 4px; background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 6px; font-family: monospace;">
                        \${tempPassword}
                      </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #8BAE5A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Pakket:</strong>
                      <div style="color: #B6C948; font-size: 16px; font-weight: 600; margin-top: 4px;">
                        \${packageType}
                      </div>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 20px;">
                    <a href="\${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 700; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(139, 174, 90, 0.3);">
                      🚀 LOGIN NU
                    </a>
                  </div>
                </div>

                <!-- Important Notes -->
                <div style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #FFC107; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #FFC107; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    ⚠️ BELANGRIJKE INFORMATIE
                  </h3>
                  <ul style="color: #D1D5DB; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Wijzig je wachtwoord direct na je eerste login voor extra beveiliging</li>
                    <li style="margin-bottom: 8px;">Je account is al geactiveerd en klaar voor gebruik</li>
                    <li style="margin-bottom: 8px;">Alle content en features zijn direct beschikbaar</li>
                    <li>Bij vragen kun je altijd contact opnemen via het platform</li>
                  </ul>
                </div>

                <h3 style="color: #8BAE5A; font-size: 20px; font-weight: 700; margin: 32px 0 16px 0;">
                  Wat kun je nu doen?
                </h3>
                
                <div style="display: grid; gap: 16px; margin: 20px 0;">
                  <div style="background: rgba(139, 174, 90, 0.05); padding: 16px; border-radius: 8px; border-left: 3px solid #8BAE5A;">
                    <strong style="color: #8BAE5A;">🎯 Dashboard Verken</strong>
                    <p style="margin: 8px 0 0 0; color: #D1D5DB; font-size: 14px;">Bekijk je persoonlijke dashboard en alle beschikbare modules</p>
                  </div>
                  
                  <div style="background: rgba(139, 174, 90, 0.05); padding: 16px; border-radius: 8px; border-left: 3px solid #8BAE5A;">
                    <strong style="color: #8BAE5A;">💪 Start je Training</strong>
                    <p style="margin: 8px 0 0 0; color: #D1D5DB; font-size: 14px;">Begin met je gepersonaliseerde trainings- en voedingsplannen</p>
                  </div>
                  
                  <div style="background: rgba(139, 174, 90, 0.05); padding: 16px; border-radius: 8px; border-left: 3px solid #8BAE5A;">
                    <strong style="color: #8BAE5A;">👥 Join de Brotherhood</strong>
                    <p style="margin: 8px 0 0 0; color: #D1D5DB; font-size: 14px;">Maak kennis met je broeders in de exclusieve community</p>
                  </div>
                </div>

                <div style="text-align: center; margin: 40px 0 20px 0;">
                  <a href="\${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 700; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 6px 20px rgba(139, 174, 90, 0.4);">
                    🚀 START JE TRANSFORMATIE
                  </a>
                </div>

                <p style="font-size: 16px; line-height: 1.6; margin: 32px 0 0 0; color: #8BAE5A; font-weight: 600;">
                  Welkom in de broederschap!<br>
                  Het Top Tier Men Team
                </p>
              </div>

              <!-- Footer -->
              <div style="background: rgba(0,0,0,0.3); padding: 30px; text-align: center; border-top: 1px solid rgba(139, 174, 90, 0.2);">
                <p style="color: #8BAE5A; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">
                  Top Tier Men Platform
                </p>
                <p style="color: #6B7280; font-size: 12px; margin: 0; line-height: 1.5;">
                  Dit is een automatisch gegenereerde email. Reageer niet op dit bericht.<br>
                  Voor vragen kun je contact opnemen via het platform.
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
Beste \${name},

Het moment is daar! Het Top Tier Men platform is nu live en je kunt direct aan de slag.

JE ACCOUNTGEGEVENS:
==================

Platform URL: \${platformUrl}
E-mailadres: \${email}
Gebruikersnaam: \${username}
Tijdelijk Wachtwoord: \${tempPassword}
Pakket: \${packageType}

LOGIN NU: \${loginUrl}

BELANGRIJKE INFORMATIE:
- Wijzig je wachtwoord direct na je eerste login voor extra beveiliging
- Je account is al geactiveerd en klaar voor gebruik
- Alle content en features zijn direct beschikbaar
- Bij vragen kun je altijd contact opnemen via het platform

WAT KUN JE NU DOEN:
- Dashboard Verken: Bekijk je persoonlijke dashboard en alle beschikbare modules
- Start je Training: Begin met je gepersonaliseerde trainings- en voedingsplannen
- Join de Brotherhood: Maak kennis met je broeders in de exclusieve community

Welkom in de broederschap!

Het Top Tier Men Team

---
Dit is een automatisch gegenereerde email. Reageer niet op dit bericht.
Voor vragen kun je contact opnemen via het platform.
        `
      },
      
      'password-reset': {
        subject: '🔐 Je Nieuwe Top Tier Men Wachtwoord - Wachtwoord Reset',
        html: `
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px 30px; text-align: center;">
                     <div style="width: 200px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; border: 2px solid rgba(255,255,255,0.2);">
                       <span style="color: white; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">TOP TIER MEN</span>
                     </div>
                <h1 style="color: white; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  🔐 WACHTWOORD RESET
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 12px 0 0 0; font-weight: 500;">
                  Je nieuwe wachtwoord is hier
                </p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px; color: #E5E7EB;">
                <p style="font-size: 18px; color: #8BAE5A; font-weight: 600; margin: 0 0 24px 0;">
                  Beste \${name},
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Je hebt een wachtwoord reset aangevraagd voor je Top Tier Men account. Hier zijn je nieuwe accountgegevens:
                </p>

                <!-- Account Details -->
                <div style="background: rgba(139, 174, 90, 0.1); border: 2px solid #8BAE5A; padding: 30px; margin: 24px 0; border-radius: 12px;">
                  <h3 style="color: #8BAE5A; font-size: 20px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                    🔐 JE NIEUWE ACCOUNTGEGEVENS
                  </h3>
                  
                  <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; margin: 16px 0;">
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #8BAE5A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Platform URL:</strong>
                      <div style="color: #B6C948; font-size: 16px; font-weight: 600; margin-top: 4px;">
                        \${platformUrl}
                      </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #8BAE5A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">E-mailadres:</strong>
                      <div style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin-top: 4px;">
                        \${email}
                      </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #8BAE5A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Gebruikersnaam:</strong>
                      <div style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin-top: 4px;">
                        \${username}
                      </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #8BAE5A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Nieuw Wachtwoord:</strong>
                      <div style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin-top: 4px; background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 6px; font-family: monospace;">
                        \${tempPassword}
                      </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #8BAE5A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Pakket:</strong>
                      <div style="color: #B6C948; font-size: 16px; font-weight: 600; margin-top: 4px;">
                        \${packageType}
                      </div>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 20px;">
                    <a href="\${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 700; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(139, 174, 90, 0.3);">
                      🔐 LOGIN MET NIEUW WACHTWOORD
                    </a>
                  </div>
                </div>

                <!-- Important Notes -->
                <div style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #FFC107; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #FFC107; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    ⚠️ BELANGRIJKE INFORMATIE
                  </h3>
                  <ul style="color: #D1D5DB; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Wijzig je wachtwoord direct na je eerste login voor extra beveiliging</li>
                    <li style="margin-bottom: 8px;">Je oude wachtwoord is niet meer geldig</li>
                    <li style="margin-bottom: 8px;">Alle content en features blijven beschikbaar</li>
                    <li>Bij vragen kun je altijd contact opnemen via het platform</li>
                  </ul>
                </div>

                <h3 style="color: #8BAE5A; font-size: 20px; font-weight: 700; margin: 32px 0 16px 0;">
                  🎯 WAT KUN JE NU DOEN:
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr; gap: 16px; margin: 20px 0;">
                  <div style="background: rgba(139, 174, 90, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #8BAE5A;">
                    <h4 style="color: #8BAE5A; font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">
                      🔐 Veilig Inloggen
                    </h4>
                    <p style="color: #D1D5DB; font-size: 14px; margin: 0; line-height: 1.5;">
                      Log in met je nieuwe wachtwoord en wijzig het direct voor extra beveiliging
                    </p>
                  </div>
                  
                  <div style="background: rgba(139, 174, 90, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #8BAE5A;">
                    <h4 style="color: #8BAE5A; font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">
                      🏃‍♂️ Verder met je Training
                    </h4>
                    <p style="color: #D1D5DB; font-size: 14px; margin: 0; line-height: 1.5;">
                      Ga verder waar je was gebleven met je persoonlijke trainings- en voedingsplannen
                    </p>
                  </div>
                  
                  <div style="background: rgba(139, 174, 90, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #8BAE5A;">
                    <h4 style="color: #8BAE5A; font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">
                      🤝 Brotherhood Community
                    </h4>
                    <p style="color: #D1D5DB; font-size: 14px; margin: 0; line-height: 1.5;">
                      Blijf verbonden met je broeders in de exclusieve community
                    </p>
                  </div>
                </div>

                <div style="text-align: center; margin: 40px 0 20px 0; padding: 30px; background: rgba(139, 174, 90, 0.05); border-radius: 12px; border: 1px solid rgba(139, 174, 90, 0.2);">
                  <h3 style="color: #8BAE5A; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    🚀 Welkom terug in de broederschap!
                  </h3>
                  <p style="color: #D1D5DB; font-size: 16px; margin: 0; line-height: 1.6;">
                    Je account is veilig en klaar voor gebruik. Log in en ga verder met je reis naar excellentie.
                  </p>
                </div>

                <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(139, 174, 90, 0.2);">
                  <p style="color: #8BAE5A; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">
                    Met vriendelijke groet,
                  </p>
                  <p style="color: #B6C948; font-size: 18px; font-weight: 700; margin: 0;">
                    Het Top Tier Men Team
                  </p>
                </div>
              </div>
            </div>
          </div>
        `,
        text: `
WACHTWOORD RESET - Top Tier Men
===============================

Beste \${name},

Je hebt een wachtwoord reset aangevraagd voor je Top Tier Men account. Hier zijn je nieuwe accountgegevens:

JE NIEUWE ACCOUNTGEGEVENS:
==========================

Platform URL: \${platformUrl}
E-mailadres: \${email}
Gebruikersnaam: \${username}
Nieuw Wachtwoord: \${tempPassword}
Pakket: \${packageType}

LOGIN MET NIEUW WACHTWOORD: \${loginUrl}

BELANGRIJKE INFORMATIE:
- Wijzig je wachtwoord direct na je eerste login voor extra beveiliging
- Je oude wachtwoord is niet meer geldig
- Alle content en features blijven beschikbaar
- Bij vragen kun je altijd contact opnemen via het platform

WAT KUN JE NU DOEN:
- Veilig Inloggen: Log in met je nieuwe wachtwoord en wijzig het direct
- Verder met je Training: Ga verder waar je was gebleven
- Brotherhood Community: Blijf verbonden met je broeders

Welkom terug in de broederschap!

Het Top Tier Men Team

---
Dit is een automatisch gegenereerde email. Reageer niet op dit bericht.
Voor vragen kun je contact opnemen via het platform.
        `
      },
      'platform-accessible': {
        subject: '🎯 Platform Toegankelijk - Top Tier Men is weer live!',
        html: `
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px 30px; text-align: center;">
                     <div style="width: 200px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; border: 2px solid rgba(255,255,255,0.2);">
                       <span style="color: white; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">TOP TIER MEN</span>
                     </div>
                <h1 style="color: white; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  PLATFORM TOEGANKELIJK
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 12px 0 0 0; font-weight: 500;">
                  We zijn weer live en klaar voor jouw succes
                </p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px; color: #E5E7EB;">
                <p style="font-size: 18px; color: #8BAE5A; font-weight: 600; margin: 0 0 24px 0;">
                  Beste \${name},
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                     We hebben afgelopen week druk gewerkt aan het oplossen van bugs en het verbeteren van het platform. 
                     Het Top Tier Men platform is nu weer volledig toegankelijk en klaar voor gebruik.
                </p>

                <div style="background: rgba(139, 174, 90, 0.1); border-left: 4px solid #8BAE5A; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #8BAE5A; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    🔐 WACHTWOORD RESET
                  </h3>
                  <p style="font-size: 15px; line-height: 1.5; margin: 0 0 12px 0; color: #D1D5DB;">
                    Voor mensen die hun wachtwoord willen resetten: ga naar de login pagina en klik op "Wachtwoord vergeten". 
                    Je ontvangt dan direct in je mailbox een nieuw wachtwoord.
                  </p>
                </div>

                <div style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #FFC107; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #FFC107; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    🙏 ONZE EXCUSES
                  </h3>
                  <p style="font-size: 15px; line-height: 1.5; margin: 0; color: #D1D5DB;">
                    Onze excuses voor de vertraging. We waarderen je begrip en loyaliteit enorm. 
                    Jouw succes is onze prioriteit en we zijn er om je te ondersteunen.
                  </p>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://platform.toptiermen.eu/login" style="display: inline-block; background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 20px rgba(139, 174, 90, 0.3); transition: all 0.3s ease;">
                    🚀 GA NAAR HET PLATFORM
                  </a>
                </div>

                <div style="text-align: center; margin: 32px 0; padding: 20px; background: rgba(139, 174, 90, 0.1); border-radius: 12px;">
                  <h3 style="color: #8BAE5A; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">
                    🎯 VEEL SUCCES MET HET BEHALEN VAN DE STATUS TOP TIER MEN
                  </h3>
                  <p style="font-size: 16px; line-height: 1.5; margin: 0; color: #D1D5DB;">
                    Jouw reis naar excellentie gaat door. We zijn er om je te ondersteunen bij elke stap.
                  </p>
                </div>

                <p style="font-size: 14px; color: #9CA3AF; text-align: center; margin: 32px 0 0 0; line-height: 1.5;">
                  Met vriendelijke groet,<br>
                  <strong style="color: #8BAE5A;">Het Top Tier Men Team</strong>
                </p>
              </div>

              <!-- Footer -->
              <div style="background: #1A1A1A; padding: 30px; text-align: center; border-top: 1px solid #374151;">
                <p style="color: #9CA3AF; font-size: 14px; margin: 0 0 16px 0;">
                     © 2025 Top Tier Men - Exclusieve Broederschap voor Top Performers
                </p>
                <div style="display: flex; justify-content: center; gap: 24px; flex-wrap: wrap;">
                  <a href="https://platform.toptiermen.eu" style="color: #8BAE5A; text-decoration: none; font-size: 14px;">Website</a>
                  <a href="mailto:platform@toptiermen.eu" style="color: #8BAE5A; text-decoration: none; font-size: 14px;">Contact</a>
                </div>
              </div>
            </div>
          </div>
        `,
        text: `
Platform Toegankelijk - Top Tier Men is weer live!

Beste \${name},

                     We hebben afgelopen week druk gewerkt aan het oplossen van bugs en het verbeteren van het platform. 
                     Het Top Tier Men platform is nu weer volledig toegankelijk en klaar voor gebruik.

WACHTWOORD RESET:
Voor mensen die hun wachtwoord willen resetten: ga naar de login pagina en klik op "Wachtwoord vergeten". 
Je ontvangt dan direct in je mailbox een nieuw wachtwoord.

ONZE EXCUSES:
Onze excuses voor de vertraging. We waarderen je begrip en loyaliteit enorm. 
Jouw succes is onze prioriteit en we zijn er om je te ondersteunen.

VEEL SUCCES MET HET BEHALEN VAN DE STATUS TOP TIER MEN
Jouw reis naar excellentie gaat door. We zijn er om je te ondersteunen bij elke stap.

Ga naar het platform: https://platform.toptiermen.eu/login

Met vriendelijke groet,
Het Top Tier Men Team

Website: https://platform.toptiermen.eu
Contact: platform@toptiermen.eu
        `
      },
      'platform-update-follow-up': {
        subject: 'Update omtrent platform werkzaamheden',
        html: `
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px 30px; text-align: center;">
                <div style="width: 200px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; border: 2px solid rgba(255,255,255,0.2);">
                  <span style="color: white; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">TOP TIER MEN</span>
                </div>
                <h1 style="color: white; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  📢 PLATFORM UPDATE
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 18px; margin: 12px 0 0 0; font-weight: 500;">
                  Vervolg op werkzaamheden update
                </p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px; color: #E5E7EB;">
                <p style="font-size: 18px; color: #8BAE5A; font-weight: 600; margin: 0 0 24px 0;">
                  Beste \${name},
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Afgelopen zondag hebben we je geïnformeerd over de werkzaamheden rondom het platform.
                </p>

                <div style="background: rgba(139, 174, 90, 0.1); border-left: 4px solid #8BAE5A; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #8BAE5A; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    📈 VOORTGANG UPDATE
                  </h3>
                  <p style="font-size: 15px; line-height: 1.5; margin: 0 0 12px 0; color: #D1D5DB;">
                    We kunnen melden dat we het platform nu voor <strong style="color: #B6C948;">90% gereed</strong> hebben.
                  </p>
                  <p style="font-size: 15px; line-height: 1.5; margin: 0; color: #D1D5DB;">
                    Het platform was uiteraard 100% bij lancering op 10 september, echter ondervonden we technische problemen die we in de testfase voor live gang niet hebben kunnen zien enkel toen het platform live ging.
                  </p>
                </div>

                <div style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #FFC107; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #FFC107; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    🎯 KWALITEIT VOOROP
                  </h3>
                  <p style="font-size: 15px; line-height: 1.5; margin: 0; color: #D1D5DB;">
                    Gezien we bij Top Tier Men voor hoge kwaliteit staan willen we jullie uiteraard een 100% werkend platform bieden met volledig functionaliteit en daarom moeten we je helaas nog even teleurstellen.
                  </p>
                </div>

                <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3B82F6; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #3B82F6; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    🔧 HUIDIGE STATUS
                  </h3>
                  <p style="font-size: 15px; line-height: 1.5; margin: 0; color: #D1D5DB;">
                    We zijn nog steeds dag en nacht met het team de laatste punten oplossen. Wanneer het precies klaar is kunnen we op dit moment nog niet zeggen, maar we zijn dichtbij een 100% werkend platform.
                  </p>
                </div>

                <div style="text-align: center; margin: 32px 0; padding: 24px; background: rgba(139, 174, 90, 0.05); border-radius: 12px; border: 1px solid rgba(139, 174, 90, 0.2);">
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; color: #8BAE5A; font-weight: 600;">
                    We willen je nogmaals bedanken voor je loyaliteit en geduld.
                  </p>
                  <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #D1D5DB;">
                    Zodra we een nieuwe update hebben rondom de werkzaamheden ontvang je een mail van ons.
                  </p>
                </div>

                <p style="font-size: 15px; line-height: 1.6; margin: 24px 0 0 0; color: #8BAE5A;">
                  Met respect en waardering,<br>
                  <strong>Rick Cuijpers & Het Top Tier Men Team</strong>
                </p>
              </div>

              <!-- Footer -->
              <div style="background: rgba(139, 174, 90, 0.1); padding: 30px; text-align: center; border-top: 1px solid rgba(139, 174, 90, 0.2);">
                <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" style="width: 150px; height: auto; margin-bottom: 15px; opacity: 0.8;">
                <p style="color: #8BAE5A; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                  © 2025 Top Tier Men - Exclusieve Broederschap voor Top Performers
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
Update omtrent platform werkzaamheden

Beste \${name},

Afgelopen zondag hebben we je geïnformeerd over de werkzaamheden rondom het platform.

VOORTGANG UPDATE:
We kunnen melden dat we het platform nu voor 90% gereed hebben.

Het platform was uiteraard 100% bij lancering op 10 september, echter ondervonden we technische problemen die we in de testfase voor live gang niet hebben kunnen zien enkel toen het platform live ging.

KWALITEIT VOOROP:
Gezien we bij Top Tier Men voor hoge kwaliteit staan willen we jullie uiteraard een 100% werkend platform bieden met volledig functionaliteit en daarom moeten we je helaas nog even teleurstellen.

HUIDIGE STATUS:
We zijn nog steeds dag en nacht met het team de laatste punten oplossen. Wanneer het precies klaar is kunnen we op dit moment nog niet zeggen, maar we zijn dichtbij een 100% werkend platform.

We willen je nogmaals bedanken voor je loyaliteit en geduld.

Zodra we een nieuwe update hebben rondom de werkzaamheden ontvang je een mail van ons.

Met respect en waardering,
Rick Cuijpers & Het Top Tier Men Team

---
© 2025 Top Tier Men - Exclusieve Broederschap voor Top Performers
Website: https://platform.toptiermen.eu
Contact: platform@toptiermen.eu
        `
      },
      platform_update: {
        subject: '📢 Platform Werkzaamheden Update - Top Tier Men',
        html: `
          <!DOCTYPE html>
          <html lang="nl">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Platform Werkzaamheden Update - Top Tier Men</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #0F1419; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0;">
              <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px 30px; text-align: center;">
                  <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" style="width: 200px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto; max-width: 100%;">
                  <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    📢 PLATFORM UPDATE
                  </h1>
                  <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 12px 0 0 0; font-weight: 500;">
                    Belangrijke mededeling over het platform
                  </p>
                </div>

              <!-- Content -->
              <div style="padding: 40px 30px; color: #E5E7EB;">
                <p style="font-size: 18px; color: #8BAE5A; font-weight: 600; margin: 0 0 24px 0;">
                  Beste brothers,
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  We zijn inmiddels 10 dagen verder sinds livegang van het platform.
                </p>

                <div style="background: rgba(220, 38, 38, 0.1); border-left: 4px solid #DC2626; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #DC2626; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    ⚠️ HUIDIGE SITUATIE
                  </h3>
                  <p style="font-size: 15px; line-height: 1.5; margin: 0 0 12px 0; color: #D1D5DB;">
                    Helaas ervaren we sinds de lancering problemen op het platform met het onboarden, het versturen van accountgegevens en andere functies die niet 100% werkend zijn.
                  </p>
                  <p style="font-size: 15px; line-height: 1.5; margin: 0; color: #D1D5DB;">
                    Wij willen je laten weten dat we dag en nacht bezig zijn met het oplossen van deze bugs, helaas is het tot op heden nog niet gelukt het platform 100% werkend te hebben zonder deze problemen.
                  </p>
                </div>

                <div style="background: rgba(139, 174, 90, 0.1); border-left: 4px solid #8BAE5A; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #8BAE5A; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    🙏 ONZE EXCUSES
                  </h3>
                  <p style="font-size: 15px; line-height: 1.5; margin: 0; color: #D1D5DB;">
                    Wij willen hier oprecht onze excuses voor aanbieden, dit is niet de kwaliteit die we als Top Tier Men platform willen uitstralen, maar helaas worden we door onmacht getroffen en doen we er alles aan om het platform tip top werkend te maken.
                  </p>
                </div>

                <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3B82F6; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #3B82F6; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    📧 VOORTGANGS UPDATES
                  </h3>
                  <p style="font-size: 15px; line-height: 1.5; margin: 0; color: #D1D5DB;">
                    We blijven jullie vanaf nu tussentijds updaten per e-mail over de voortgang en hopen zo snel mogelijk het platform toegankelijk te maken voor iedereen.
                  </p>
                </div>

                <div style="background: rgba(139, 174, 90, 0.1); border-left: 4px solid #8BAE5A; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #8BAE5A; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">
                    📅 ABONNEMENT VERPLAATSING
                  </h3>
                  <p style="font-size: 15px; line-height: 1.5; margin: 0; color: #D1D5DB;">
                    Gezien het platform niet werkend is voor gebruik zullen we uiteraard de ingangs datum verplaatsen van elk abonnement naar de datum van een 100% werkend platform.
                  </p>
                </div>

                <div style="text-align: center; margin: 32px 0; padding: 24px; background: rgba(139, 174, 90, 0.05); border-radius: 12px; border: 1px solid rgba(139, 174, 90, 0.2);">
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; color: #8BAE5A; font-weight: 600;">
                    We willen jullie bedanken voor jullie begrip en loyaliteit, nog even geduld en dan start jouw reis naar het worden van een Top Tier Man.
                  </p>
                </div>

                <p style="font-size: 15px; line-height: 1.6; margin: 24px 0 0 0; color: #8BAE5A;">
                  Met respect en waardering,<br>
                  <strong>Rick Cuijpers & Het Top Tier Men Team</strong>
                </p>
              </div>

              <!-- Footer -->
              <div style="background: rgba(139, 174, 90, 0.1); padding: 30px; text-align: center; border-top: 1px solid rgba(139, 174, 90, 0.2);">
                <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" style="width: 150px; height: auto; margin-bottom: 15px; opacity: 0.8; max-width: 100%;">
                <p style="color: #8BAE5A; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                  © 2025 Top Tier Men - Exclusieve Broederschap voor Top Performers
                </p>
                <p style="color: #D1D5DB; font-size: 12px; margin: 0;">
                  Website: <a href="https://platform.toptiermen.eu" style="color: #8BAE5A; text-decoration: none;">platform.toptiermen.eu</a> | 
                  Contact: <a href="mailto:platform@toptiermen.eu" style="color: #8BAE5A; text-decoration: none;">platform@toptiermen.eu</a>
                </p>
              </div>
            </div>
          </div>
          </body>
          </html>
        `,
        text: `
PLATFORM UPDATE - TOP TIER MEN

Beste brothers,

We zijn inmiddels 10 dagen verder sinds livegang van het platform.

Helaas ervaren we sinds de lancering problemen op het platform met het onboarden, het versturen van accountgegevens en andere functies die niet 100% werkend zijn.

Wij willen je laten weten dat we dag en nacht bezig zijn met het oplossen van deze bugs, helaas is het tot op heden nog niet gelukt het platform 100% werkend te hebben zonder deze problemen.

Wij willen hier oprecht onze excuses voor aanbieden, dit is niet de kwaliteit die we als Top Tier Men platform willen uitstralen, maar helaas worden we door onmacht getroffen en doen we er alles aan om het platform tip top werkend te maken.

We blijven jullie vanaf nu tussentijds updaten per e-mail over de voortgang en hopen zo snel mogelijk het platform toegankelijk te maken voor iedereen.

Gezien het platform niet werkend is voor gebruik zullen we uiteraard de ingangs datum verplaatsen van elk abonnement naar de datum van een 100% werkend platform.

We willen jullie bedanken voor jullie begrip en loyaliteit, nog even geduld en dan start jouw reis naar het worden van een Top Tier Man.

Met respect en waardering,
Rick Cuijpers & Het Top Tier Men Team

---
© 2025 Top Tier Men - Exclusieve Broederschap voor Top Performers
Website: platform.toptiermen.eu
Contact: platform@toptiermen.eu
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
      console.log('📧 Sending email via API (SendGrid)...');
      const config = await this.getConfig();

      const apiKey = (config as any).sendgridApiKey || process.env.SENDGRID_API_KEY;
      if (!apiKey) {
        throw new Error('SENDGRID_API_KEY not configured');
      }
      sgMail.setApiKey(apiKey);
      if (process.env.SENDGRID_EU_RESIDENCY === 'true' && (sgMail as any).setDataResidency) {
        (sgMail as any).setDataResidency('eu');
      }

      const msg = {
        to,
        from: `${config.fromName} <${config.fromEmail}>`,
        subject,
        html,
        text,
      } as sgMail.MailDataRequired;

      const [resp] = await sgMail.send(msg);
      console.log('✅ SendGrid accepted:', resp.statusCode);

      // Log email to database
      await this.logEmail(to, 'sendgrid', subject);
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

  private async sendViaMailgun(to: string, subject: string, html: string, text: string): Promise<boolean> {
    try {
      const config = await this.getConfig();
      
      if (!config.mailgunApiKey || !config.mailgunDomain) {
        console.error('❌ Mailgun configuration missing:', {
          hasApiKey: !!config.mailgunApiKey,
          hasDomain: !!config.mailgunDomain,
          apiKey: config.mailgunApiKey ? config.mailgunApiKey.substring(0, 10) + '...' : 'none'
        });
        throw new Error('Mailgun API key or domain not configured');
      }

      console.log('📧 Sending email via Mailgun:', {
        domain: config.mailgunDomain,
        to,
        subject,
        from: config.fromEmail,
        apiKeyPrefix: config.mailgunApiKey.substring(0, 10) + '...'
      });

      const formData = new URLSearchParams();
      formData.append('from', `${config.fromName} <${config.fromEmail}>`);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('html', html);
      formData.append('text', text);

      const response = await fetch(`https://api.eu.mailgun.net/v3/${config.mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${config.mailgunApiKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      console.log('📧 Mailgun API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email sent successfully via Mailgun:', {
          messageId: result.id,
          message: result.message
        });

        // Log email to database
        await this.logEmail(to, 'mailgun', subject);
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Mailgun API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending email via Mailgun:', error);
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
  }, trackingOptions?: any): Promise<boolean>;
  async sendEmail(to: string, subject: string, template: string, variables: Record<string, string>, options?: { tracking?: boolean }): Promise<boolean>;
  async sendEmail(
    optionsOrTo: { to: string; template: string; variables: Record<string, string> } | string,
    subjectOrTracking?: string | any,
    template?: string,
    variables?: Record<string, string>,
    options?: { tracking?: boolean }
  ): Promise<boolean> {
    // Handle both old and new interface
    if (typeof optionsOrTo === 'string') {
      // New interface: sendEmail(to, subject, template, variables, options)
      return super.sendEmail(optionsOrTo, subjectOrTracking, template!, variables!, options);
    } else {
      // Old interface: sendEmail(options, trackingOptions)
      return super.sendEmail(
        optionsOrTo.to,
        '', // subject will be from template
        optionsOrTo.template,
        optionsOrTo.variables,
        { tracking: true }
      );
    }
  }

  async testSmtpConnection(): Promise<boolean> {
    try {
      const config = await this.getConfig();
      
      if (config.provider !== 'smtp' || !config.useManualSmtp) {
        console.log('📧 SMTP not configured, skipping connection test');
        return false;
      }

      console.log('📧 Testing SMTP connection...');
      
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: parseInt(config.smtpPort || '465'),
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUsername,
          pass: config.smtpPassword
        }
      });

      await transporter.verify();
      console.log('✅ SMTP connection test successful');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection test failed:', error);
      return false;
    }
  }

  async getSmtpConfig(): Promise<{
    host: string;
    port: string;
    secure: boolean;
    username: string;
    fromEmail: string;
    fromName: string;
  }> {
    const config = await this.getConfig();
    return {
      host: config.smtpHost || '',
      port: config.smtpPort || '465',
      secure: config.smtpSecure || true,
      username: config.smtpUsername || '',
      fromEmail: config.fromEmail || '',
      fromName: config.fromName || ''
    };
  }
}

// Export a default instance for backwards compatibility
export const emailService = new LegacyEmailService();
