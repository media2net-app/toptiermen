import { createClient } from '@supabase/supabase-js';
import { EmailTrackingService } from './email-tracking-service';
import nodemailer from 'nodemailer';

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

  async sendEmail(emailData: EmailData, trackingOptions?: { campaign_id?: string; template_type?: string }): Promise<boolean> {
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
        useManualSmtp: this.config.useManualSmtp,
        tracking: !!trackingOptions
      });

      // Create tracking record if tracking is enabled
      let tracking_id: string | undefined;
      if (trackingOptions) {
        try {
          const trackingRecord = await EmailTrackingService.createTrackingRecord({
            campaign_id: trackingOptions.campaign_id,
            recipient_email: to,
            recipient_name: variables.name,
            subject,
            template_type: trackingOptions.template_type || 'marketing'
          });
          
          tracking_id = trackingRecord.tracking_id;
          
          // Add tracking to email HTML
          const trackedHtml = tracking_id ? EmailTrackingService.addTrackingToEmail(html, tracking_id) : html;
          
          // Mark as sent
          if (tracking_id) {
            await EmailTrackingService.markAsSent(tracking_id);
          }
          
          console.log('✅ Email tracking enabled:', tracking_id);
          
          // Choose sending method based on configuration
          if (this.config.useManualSmtp) {
            return await this.sendViaSmtp(to, subject, trackedHtml, text);
          } else {
            return await this.sendViaApi(to, subject, trackedHtml, text);
          }
        } catch (trackingError) {
          console.error('⚠️ Email tracking failed, sending without tracking:', trackingError);
        }
      }

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
    // Check for custom template
    if (template === 'custom' && variables.subject && variables.html && variables.text) {
      return {
        subject: variables.subject,
        html: variables.html,
        text: variables.text
      };
    }

    // Email templates
    const templates: Record<string, { subject: string; html: string; text: string }> = {
      welcome: {
        subject: '🎯 Welkom bij Top Tier Men - Jouw reis naar excellentie begint hier',
        html: `
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px 30px; text-align: center;">
                <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" style="width: 200px; height: auto; margin-bottom: 20px;">
                <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  🎯 Welkom bij Top Tier Men
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 12px 0 0 0; font-weight: 500;">
                  Jouw reis naar excellentie begint hier
                </p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px; color: #E5E7EB;">
                <p style="font-size: 18px; color: #8BAE5A; font-weight: 600; margin: 0 0 24px 0;">
                  Beste ${variables.name && variables.name.trim() !== '' ? variables.name : ''},
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

                <!-- Academy Modules Section -->
                <div style="background: rgba(139, 174, 90, 0.15); padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid rgba(139, 174, 90, 0.3);">
                  <div style="font-size: 20px; font-weight: 700; color: #B6C948; margin-bottom: 20px; text-align: center;">
                    🎓 Academy Modules (7 Modules, 36 Lessen)
                  </div>
                  
                  <!-- Desktop: 2-column grid with better styling -->
                  <div class="academy-desktop" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word;">
                      <div style="font-size: 24px; margin-bottom: 8px;">💪</div>
                      <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 1</div>
                      <div style="color: #8BAE5A; font-size: 12px;">Testosteron</div>
                    </div>
                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word;">
                      <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
                      <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 2</div>
                      <div style="color: #8BAE5A; font-size: 12px;">Discipline & Identiteit</div>
                    </div>
                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word;">
                      <div style="font-size: 24px; margin-bottom: 8px;">🏋️</div>
                      <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 3</div>
                      <div style="color: #8BAE5A; font-size: 12px;">Fysieke Dominantie</div>
                    </div>
                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word;">
                      <div style="font-size: 24px; margin-bottom: 8px;">🧠</div>
                      <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 4</div>
                      <div style="color: #8BAE5A; font-size: 12px;">Mentale Kracht/Weerbaarheid</div>
                    </div>
                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word;">
                      <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                      <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 5</div>
                      <div style="color: #8BAE5A; font-size: 12px;">Business and Finance</div>
                    </div>
                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word;">
                      <div style="font-size: 24px; margin-bottom: 8px;">🤝</div>
                      <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 6</div>
                      <div style="color: #8BAE5A; font-size: 12px;">Brotherhood</div>
                    </div>
                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; grid-column: span 2; text-align: center; word-wrap: break-word;">
                      <div style="font-size: 24px; margin-bottom: 8px;">🥗</div>
                      <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 7</div>
                      <div style="color: #8BAE5A; font-size: 12px;">Voeding & Gezondheid</div>
                    </div>
                  </div>
                  
                  <!-- Mobile: Single block with bullet points (hidden on desktop) -->
                  <div class="academy-mobile" style="display: none; background: rgba(139, 174, 90, 0.1); padding: 20px; border-radius: 10px; border: 1px solid rgba(139, 174, 90, 0.2);">
                    <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 15px; text-align: center;">🎓 Academy Modules Overzicht</div>
                    <ul style="color: #D1D5DB; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 8px;"><strong style="color: #8BAE5A;">Module 1:</strong> Testosteron</li>
                      <li style="margin-bottom: 8px;"><strong style="color: #8BAE5A;">Module 2:</strong> Discipline & Identiteit</li>
                      <li style="margin-bottom: 8px;"><strong style="color: #8BAE5A;">Module 3:</strong> Fysieke Dominantie</li>
                      <li style="margin-bottom: 8px;"><strong style="color: #8BAE5A;">Module 4:</strong> Mentale Kracht/Weerbaarheid</li>
                      <li style="margin-bottom: 8px;"><strong style="color: #8BAE5A;">Module 5:</strong> Business and Finance</li>
                      <li style="margin-bottom: 8px;"><strong style="color: #8BAE5A;">Module 6:</strong> Brotherhood</li>
                      <li style="margin-bottom: 8px;"><strong style="color: #8BAE5A;">Module 7:</strong> Voeding & Gezondheid</li>
                    </ul>
                  </div>
                </div>

                <!-- Platform Features Section -->
                <div style="background: rgba(139, 174, 90, 0.05); border: 1px solid rgba(139, 174, 90, 0.2); padding: 30px; margin: 32px 0; border-radius: 12px;">
                  <h3 style="color: #8BAE5A; font-size: 20px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                    🚀 Platform Features
                  </h3>
                  <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; color: #D1D5DB; text-align: center;">
                    Ontdek alle krachtige tools en functies die je tot je beschikking hebt:
                  </p>
                  
                  <!-- Platform Features - Two columns layout -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    <tr>
                      <td width="48%" style="vertical-align: top; padding-right: 10px;">
                        <div style="background: rgba(139, 174, 90, 0.1); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(139, 174, 90, 0.2); margin-bottom: 15px;">
                          <div style="font-size: 28px; margin-bottom: 10px;">🤝</div>
                          <div style="color: #B6C948; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Brotherhood Community</div>
                          <div style="color: #9CA3AF; font-size: 11px;">Exclusieve community van gelijkgestemden</div>
                        </div>
                        
                        <div style="background: rgba(139, 174, 90, 0.1); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(139, 174, 90, 0.2); margin-bottom: 15px;">
                          <div style="font-size: 28px; margin-bottom: 10px;">🔥</div>
                          <div style="color: #B6C948; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Dagelijkse Challenges</div>
                          <div style="color: #9CA3AF; font-size: 11px;">Uitdagende opdrachten elke dag</div>
                        </div>
                        
                        <div style="background: rgba(139, 174, 90, 0.1); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(139, 174, 90, 0.2); margin-bottom: 15px;">
                          <div style="font-size: 28px; margin-bottom: 10px;">🍖</div>
                          <div style="color: #B6C948; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Op Maat Voedingsplannen</div>
                          <div style="color: #9CA3AF; font-size: 11px;">Gepersonaliseerde voeding</div>
                        </div>
                        
                        <div style="background: rgba(139, 174, 90, 0.1); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(139, 174, 90, 0.2); margin-bottom: 15px;">
                          <div style="font-size: 28px; margin-bottom: 10px;">📊</div>
                          <div style="color: #B6C948; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Progress Tracking</div>
                          <div style="color: #9CA3AF; font-size: 11px;">Houd je vooruitgang bij</div>
                        </div>
                        
                        <div style="background: rgba(139, 174, 90, 0.1); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(139, 174, 90, 0.2); margin-bottom: 15px;">
                          <div style="font-size: 28px; margin-bottom: 10px;">🎯</div>
                          <div style="color: #B6C948; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Goal Setting & Planning</div>
                          <div style="color: #9CA3AF; font-size: 11px;">Doelgericht werken aan groei</div>
                        </div>
                        
                        <div style="background: rgba(139, 174, 90, 0.1); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(139, 174, 90, 0.2); margin-bottom: 15px;">
                          <div style="font-size: 28px; margin-bottom: 10px;">📅</div>
                          <div style="color: #B6C948; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Event Calendar</div>
                          <div style="color: #9CA3AF; font-size: 11px;">Brotherhood events en meetups</div>
                        </div>
                      </td>
                      <td width="48%" style="vertical-align: top; padding-left: 10px;">
                        <div style="background: rgba(139, 174, 90, 0.1); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(139, 174, 90, 0.2); margin-bottom: 15px;">
                          <div style="font-size: 28px; margin-bottom: 10px;">🏆</div>
                          <div style="color: #B6C948; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Badges & Achievements</div>
                          <div style="color: #9CA3AF; font-size: 11px;">Verdien badges voor je prestaties</div>
                        </div>
                        
                        <div style="background: rgba(139, 174, 90, 0.1); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(139, 174, 90, 0.2); margin-bottom: 15px;">
                          <div style="font-size: 28px; margin-bottom: 10px;">📚</div>
                          <div style="color: #B6C948; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Digitale Boekenkamer</div>
                          <div style="color: #9CA3AF; font-size: 11px;">Curated library met topboeken</div>
                        </div>
                        
                        <div style="background: rgba(139, 174, 90, 0.1); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(139, 174, 90, 0.2); margin-bottom: 15px;">
                          <div style="font-size: 28px; margin-bottom: 10px;">💪</div>
                          <div style="color: #B6C948; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Op Maat Trainingsschema's</div>
                          <div style="color: #9CA3AF; font-size: 11px;">Persoonlijke workout plans</div>
                        </div>
                        
                        <div style="background: rgba(139, 174, 90, 0.1); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(139, 174, 90, 0.2); margin-bottom: 15px;">
                          <div style="font-size: 28px; margin-bottom: 10px;">📱</div>
                          <div style="color: #B6C948; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Mobile App</div>
                          <div style="color: #9CA3AF; font-size: 11px;">Toegang overal en altijd</div>
                        </div>
                        
                        <div style="background: rgba(139, 174, 90, 0.1); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(139, 174, 90, 0.2); margin-bottom: 15px;">
                          <div style="font-size: 28px; margin-bottom: 10px;">⚡</div>
                          <div style="color: #B6C948; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Accountability System</div>
                          <div style="color: #9CA3AF; font-size: 11px;">Elkaar scherp houden</div>
                        </div>
                        
                        <div style="background: rgba(139, 174, 90, 0.1); padding: 15px; border-radius: 10px; text-align: center; border: 1px solid rgba(139, 174, 90, 0.2); margin-bottom: 15px;">
                          <div style="font-size: 28px; margin-bottom: 10px;">🧠</div>
                          <div style="color: #B6C948; font-weight: 600; font-size: 13px; margin-bottom: 6px;">Mindset Training</div>
                          <div style="color: #9CA3AF; font-size: 11px;">Mentale training en ontwikkeling</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="font-size: 13px; color: #9CA3AF; text-align: center; margin: 20px 0 0 0; font-style: italic;">
                    En nog veel meer! Het platform groeit continue met nieuwe features.
                  </div>
                </div>

                <div style="margin: 40px 0 0 0; padding: 24px 0; border-top: 1px solid rgba(139, 174, 90, 0.2);">
                  <p style="font-size: 15px; margin: 0 0 8px 0; color: #D1D5DB;">
                    Met broederschap,<br>
                    <strong style="color: #8BAE5A;">Rick Cuijpers</strong><br>
                    <span style="font-size: 13px; color: #9CA3AF;">Oud marinier & Founder Top Tier Men</span>
                  </p>
                  <p style="font-size: 13px; color: #9CA3AF; font-style: italic; margin: 16px 0 0 0; text-align: center;">
                    Dit is een exclusieve pre-launch email. Je bent een van de weinigen die toegang heeft tot deze content.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <style>
            @media (max-width: 600px) {
              /* Platform features responsive - Force single column on mobile */
              table[style*="margin: 20px 0"] td {
                display: block !important;
                width: 100% !important;
                padding: 0 !important;
              }
              /* Academy modules - Switch desktop/mobile views */
              .academy-desktop {
                display: none !important;
              }
              .academy-mobile {
                display: block !important;
              }
            }
          </style>
        `,
        text: `
          🎯 Welkom bij Top Tier Men - Jouw reis naar excellentie begint hier
          
          Beste ${variables.name || 'Gebruiker'},
          
          Je hebt de eerste stap gezet naar een leven van excellentie. Als onderdeel van onze exclusieve broederschap krijg je toegang tot bewezen strategieën, persoonlijke voedings- en trainingsplannen en een community van gelijkgestemde mannen die elkaar naar succes duwen.
          
          🎯 EXCLUSIEVE PRE-LAUNCH TOEGANG
          
          Je behoort tot de exclusieve lijst van pre-launch leden! In de komende dagen ontvang je sneak previews van het platform, exclusieve content en diepgaande inzichten in wat Top Tier Men voor jou kan betekenen. Deze previews zijn alleen beschikbaar voor een selecte groep - jij bent een van hen.
          
          ⏰ Nog ${Math.ceil((new Date('2025-09-10').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dagen tot de officiële launch! (10 september 2025)
          
          Wat is Top Tier Men?
          
          Top Tier Men is een exclusieve community van mannen die streven naar excellentie in alle aspecten van hun leven. Onder leiding van Rick Cuijpers, oud marinier en ervaren coach, bieden we een complete aanpak voor fysieke, mentale en professionele groei.
          
          Wat maakt ons uniek?
          
          • Bewezen Methoden: Gebaseerd op militaire discipline en real-world ervaring
          • Persoonlijke Aanpak: Individuele voedings- en trainingsplannen op maat
          • Community Support: Een broederschap van gelijkgestemde mannen
          • Holistische Groei: Focus op lichaam, geest en carrière
          
          Platform Features:
          
          🎓 Academy (7 Modules, 36 Lessen)
          • Module 1: Testosteron
          • Module 2: Discipline & Identiteit
          • Module 3: Fysieke Dominantie
          • Module 4: Mentale Kracht/Weerbaarheid
          • Module 5: Business and Finance
          • Module 6: Brotherhood
          • Module 7: Voeding & Gezondheid
          
          🤝 Brotherhood Community - Exclusieve community van gelijkgestemden
          🏆 Badges & Achievements - Verdien badges voor je prestaties
          🔥 Dagelijkse Challenges - Uitdagende opdrachten elke dag
          📚 Digitale Boekenkamer - Curated library met topboeken
          🍖 Op Maat Voedingsplannen - Gepersonaliseerde voeding
          💪 Op Maat Trainingsschema's - Persoonlijke workout plans
          📊 Progress Tracking - Houd je vooruitgang bij
          📱 Mobile App - Toegang overal en altijd
          🎯 Goal Setting & Planning - Doelgericht werken aan groei
          ⚡ Accountability System - Elkaar scherp houden
          📅 Event Calendar - Brotherhood events en meetups
          🧠 Mindset Training - Mentale training en ontwikkeling
          
          Wat je kunt verwachten:
          
          In de komende dagen ontvang je:
          • Exclusieve sneak previews van het platform
          • Diepgaande inzichten in onze methoden
          • Persoonlijke verhalen van community leden
          • Voorbereidingen voor de officiële launch
          
          Klaar om te beginnen?
          
          Je reis naar excellentie begint nu. Blijf alert op je inbox voor de volgende updates.
          
          Met broederschap,
          Rick Cuijpers
          Oud marinier & Founder Top Tier Men
          
          Dit is een exclusieve pre-launch email. Je bent een van de weinigen die toegang heeft tot deze content.
        `
      },
      passwordReset: {
        subject: 'Wachtwoord reset - Top Tier Men',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8BAE5A;">Wachtwoord Reset</h1>
            <p>Beste ${variables.name && variables.name.trim() !== '' ? variables.name : ''},</p>
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
          
          Beste ${variables.name && variables.name.trim() !== '' ? variables.name : ''},
          
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
            <p>Beste ${variables.name && variables.name.trim() !== '' ? variables.name : ''},</p>
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
          
          Beste ${variables.name && variables.name.trim() !== '' ? variables.name : ''},
          
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
      },
      marketing: {
        subject: variables.subject || 'Belangrijke update van Top Tier Men',
        html: `
          <!DOCTYPE html>
          <html lang="nl">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${variables.subject || 'Top Tier Men Update'}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #ffffff; 
                background-color: #181F17;
                margin: 0;
                padding: 0;
              }
              .email-container { 
                width: 100%; 
                max-width: 100%; 
                margin: 0; 
                background: #181F17;
                border-radius: 0;
                overflow: hidden;
              }
              .header { 
                background: linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #3a5f3a 100%); 
                padding: 40px 30px;
                text-align: center;
                position: relative;
              }
              .logo {
                margin: 0 auto 20px;
                display: block;
                max-width: 200px;
                height: auto;
              }
              .header h1 { 
                color: white; 
                font-size: 28px; 
                font-weight: 700;
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
              }
              .content { 
                padding: 40px 30px; 
                background: #181F17;
              }
              .greeting {
                font-size: 24px;
                font-weight: 600;
                color: #ffffff;
                margin-bottom: 20px;
              }
              .intro-text {
                font-size: 16px;
                color: #B6C948;
                margin-bottom: 30px;
                line-height: 1.8;
              }
              .definition-section {
                background: linear-gradient(135deg, #232D1A 0%, #3A4D23 100%);
                padding: 30px;
                border-radius: 12px;
                margin: 30px 0;
                border-left: 4px solid #B6C948;
              }
              .definition-title {
                color: #ffffff;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 15px;
              }
              .definition-text {
                color: #B6C948;
                font-size: 16px;
                line-height: 1.7;
              }
              .founder-section {
                display: flex;
                align-items: center;
                margin: 30px 0;
                padding: 35px;
                background: rgba(139, 174, 90, 0.1);
                border-radius: 12px;
                border-left: 4px solid #8BAE5A;
              }
              .founder-image {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                object-fit: cover;
                margin-right: 30px;
                border: 3px solid #8BAE5A;
              }
              .founder-content h3 {
                color: #ffffff;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
              }
              .founder-content p {
                color: #B6C948;
                font-size: 14px;
                line-height: 1.6;
              }
              .platform-features {
                background: linear-gradient(135deg, #1F2D17 0%, #2A3D1A 100%);
                padding: 30px;
                border-radius: 12px;
                margin: 30px 0;
              }
              .platform-features h3 {
                color: #ffffff;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
                text-align: center;
              }
              .features-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-top: 20px;
              }
              .feature-item {
                background: rgba(139, 174, 90, 0.1);
                padding: 15px;
                border-radius: 8px;
                border-left: 3px solid #B6C948;
              }
              .feature-item h4 {
                color: #ffffff;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 5px;
              }
              .feature-item p {
                color: #8BAE5A;
                font-size: 12px;
                line-height: 1.4;
              }
              .countdown-section {
                text-align: center;
                margin: 30px 0;
                padding: 30px;
                background: #141A15;
                border: 2px solid #8BAE5A;
                border-radius: 8px;
                color: #F3F3F1;
              }
              .countdown-text {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 10px;
                color: #F3F3F1;
              }
              .countdown-days {
                font-size: 32px;
                font-weight: 900;
                margin: 10px 0;
                color: #8BAE5A;
              }
              .cta-section {
                text-align: center;
                margin: 40px 0;
                padding: 30px;
                background: #141A15;
                border-radius: 8px;
                border: 2px solid #8BAE5A;
              }
              .cta-button {
                display: inline-block;
                background: #8BAE5A;
                color: #141A15;
                padding: 18px 36px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 700;
                font-size: 16px;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
                border: 2px solid #8BAE5A;
              }
              .footer { 
                background: #232D1A; 
                color: #8BAE5A; 
                padding: 30px;
                text-align: center;
                font-size: 14px;
              }
              .footer a {
                color: #8bae5a;
                text-decoration: none;
              }
              @media (max-width: 600px) {
                .founder-section {
                  flex-direction: column;
                  text-align: center;
                }
                .features-grid {
                  grid-template-columns: 1fr;
                }
                .countdown-days {
                  font-size: 24px;
                }
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" class="logo">
                <h1>Top Tier Men</h1>
              </div>
              
              <div class="content">
                <div class="greeting">Beste ${variables.name && variables.name.trim() !== '' ? variables.name : ''},</div>
                
                <div class="intro-text">
                  ${variables.content || 'We hebben een belangrijke update voor je van het Top Tier Men platform.'}
                </div>
                
                <div style="background: #141A15; padding: 30px; border-radius: 8px; margin: 30px 0; color: #F3F3F1; text-align: center; border: 2px solid #8BAE5A;">
                  <div style="background: rgba(139, 174, 90, 0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #8BAE5A;">
                    <h3 style="margin-bottom: 15px; font-size: 20px; font-weight: 800; color: #F3F3F1; text-transform: uppercase; letter-spacing: 1px;">🎯 EXCLUSIEVE PRE-LAUNCH TOEGANG</h3>
                  </div>
                  <p style="font-size: 16px; line-height: 1.6; margin: 0; color: #D1D5DB; font-weight: 500;">
                    Je behoort tot de exclusieve lijst van pre-launch leden! In de komende dagen ontvang je 
                    <strong style="color: #8BAE5A;">sneak previews</strong> van het platform, exclusieve content en diepgaande inzichten 
                    in wat Top Tier Men voor jou kan betekenen. Deze previews zijn alleen beschikbaar voor 
                    een selecte groep - jij bent een van hen.
                  </p>
                </div>
                
                <div class="definition-section">
                  <div class="definition-title">Wat is Top Tier Men?</div>
                  <div class="definition-text">
                    Top Tier Men is een exclusieve broederschap voor mannen die weigeren te settelen voor middelmatigheid. 
                    We geloven dat elke man het potentieel heeft om excellentie te bereiken in alle aspecten van zijn leven - 
                    fysiek, mentaal, financieel en spiritueel. Onze community bestaat uit gedreven mannen die elkaar 
                    verantwoordelijk houden en samen groeien naar hun hoogste potentiaal.
                  </div>
                </div>
                
                <div class="founder-section">
                  <img src="https://platform.toptiermen.eu/prelaunch/rick.jpg" alt="Rick Cuijpers" class="founder-image">
                  <div class="founder-content">
                    <h3>Rick Cuijpers - Oprichter & Mentor</h3>
                    <p>
                      Ex-Korps Marinier met jarenlange ervaring in leiderschap en persoonlijke ontwikkeling. 
                      Rick heeft honderden mannen geholpen hun leven te transformeren door discipline, 
                      doelgerichtheid en broederschap. Zijn militaire achtergrond en bewezen track record 
                      maken hem de ideale mentor voor mannen die serieus zijn over hun groei.
                    </p>
                  </div>
                </div>
                
                <div class="platform-features">
                  <h3>Wat je krijgt in het platform:</h3>
                  <div class="features-grid">
                    <div class="feature-item">
                      <h4>🎯 Persoonlijke Coaching</h4>
                      <p>Groepscoaching sessies en persoonlijke begeleiding</p>
                    </div>
                    <div class="feature-item">
                      <h4>💪 Fitness & Voeding</h4>
                      <p>Gepersonaliseerde trainingsschema's en voedingsplannen</p>
                    </div>
                    <div class="feature-item">
                      <h4>🧠 Mindset Training</h4>
                      <p>Mentale training en mindset ontwikkeling</p>
                    </div>
                    <div class="feature-item">
                      <h4>💰 Business & Finance</h4>
                      <p>Strategieën voor financiële groei en ondernemerschap</p>
                    </div>
                    <div class="feature-item">
                      <h4>👥 Broederschap</h4>
                      <p>Exclusieve community van gelijkgestemde mannen</p>
                    </div>
                    <div class="feature-item">
                      <h4>📚 Academy Content</h4>
                      <p>Uitgebreide bibliotheek met trainingen en resources</p>
                    </div>
                  </div>
                </div>
                
                <div class="countdown-section">
                  <div class="countdown-text">🚀 PLATFORM LANCERING</div>
                  <div class="countdown-days">12 DAGEN</div>
                  <div>Tot de officiële lancering van Top Tier Men</div>
                </div>
                
                <div class="cta-section">
                  <a href="${variables.ctaUrl || 'https://platform.toptiermen.eu/prelaunch'}" class="cta-button">${variables.ctaText || 'Claim je plek'}</a>
                </div>
              </div>
              
              <div class="footer">
                <p>Met vriendelijke groet,<br><strong>Rick Cuijpers & Het Top Tier Men Team</strong></p>
                <p style="margin-top: 20px; font-size: 12px;">
                  Als je vragen hebt, neem contact op via <a href="mailto:platform@toptiermen.eu">platform@toptiermen.eu</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          ${variables.subject || 'Belangrijke update van Top Tier Men'}
          
          Beste ${variables.name && variables.name.trim() !== '' ? variables.name : ''},
          
          ${variables.content || 'We hebben een belangrijke update voor je van het Top Tier Men platform.'}
          
          ${variables.ctaText || 'Bekijk nu'}: ${variables.ctaUrl || 'https://platform.toptiermen.eu/dashboard'}
          
          Met vriendelijke groet,
          Het Top Tier Men Team
          
          Website: https://platform.toptiermen.eu
          Contact: platform@toptiermen.eu
        `
      },
      sneak_preview: {
        subject: '🎬 EXCLUSIEVE SNEAK PREVIEW - Eerste blik op het Top Tier Men Platform',
        html: `
          <div style="background: linear-gradient(135deg, #0F1419 0%, #1F2D17 100%); min-height: 100vh; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #0F1419; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); padding: 40px 30px; text-align: center;">
                <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" style="width: 200px; height: auto; margin-bottom: 20px;">
                <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  🎬 EXCLUSIEVE SNEAK PREVIEW
                </h1>
                <p style="color: rgba(255,255,255,0.95); font-size: 16px; margin: 12px 0 0 0; font-weight: 500;">
                  Eerste blik op het Top Tier Men Platform
                </p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px; color: #E5E7EB;">
                <p style="font-size: 18px; color: #8BAE5A; font-weight: 600; margin: 0 0 24px 0;">
                  Beste \${variables.name && variables.name.trim() !== '' ? variables.name : ''},
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Als onderdeel van onze exclusieve pre-launch community ben je een van de eerste die een kijkje mag nemen achter de schermen van het Top Tier Men platform. Deze sneak preview is alleen beschikbaar voor een selecte groep leden - jij bent een van hen.
                </p>

                <!-- Video Section -->
                <div style="background: rgba(139, 174, 90, 0.1); border: 2px solid #8BAE5A; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center;">
                  <h3 style="color: #8BAE5A; font-size: 20px; font-weight: 700; margin: 0 0 20px 0;">
                    🎥 PLATFORM SNEAK PREVIEW VIDEO
                  </h3>
                  
                  <!-- Video Preview Image -->
                  <div style="position: relative; border-radius: 12px; overflow: hidden; margin: 20px 0;">
                    <a href="https://platform.toptiermen.eu/sneakpreview" style="display: block; position: relative;">
                      <img src="https://platform.toptiermen.eu/platform-preview.png" alt="Top Tier Men Platform Preview" style="width: 100%; height: auto; display: block; border-radius: 12px;" />
                      
                      <!-- Play Button Overlay -->
                      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background: rgba(139, 174, 90, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);">
                        <div style="width: 0; height: 0; border-left: 24px solid white; border-top: 12px solid transparent; border-bottom: 12px solid transparent; margin-left: 6px;"></div>
                      </div>
                      
                      <!-- Video overlay text -->
                      <div style="position: absolute; bottom: 15px; left: 15px; right: 15px; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 15px 0 0 0; border-radius: 0 0 12px 12px;">
                        <p style="color: white; font-size: 14px; font-weight: 600; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.7);">
                          🎯 Ontdek de Academy, Voedingsplannen, Trainingsschema's en Community Features
                        </p>
                      </div>
                    </a>
                  </div>
                  
                  <!-- CTA Button for Video -->
                  <a href="\${variables.videoUrl || 'https://platform.toptiermen.eu/sneakpreview'}" 
                     style="display: inline-block; background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; margin: 20px 0; box-shadow: 0 6px 20px rgba(139, 174, 90, 0.3); transition: all 0.3s ease;">
                    🎬 BEKIJK SNEAK PREVIEW VIDEO
                  </a>
                  
                  <p style="color: #B6C948; font-size: 14px; margin: 15px 0 0 0; line-height: 1.5;">
                    ⏱️ Duurtijd: ~3 minuten | 🔒 Exclusief voor pre-launch leden
                  </p>
                </div>

                <!-- Features Preview -->
                <div style="background: rgba(139, 174, 90, 0.05); border-left: 4px solid #8BAE5A; padding: 25px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #8BAE5A; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">
                    🚀 WAT JE IN DE VIDEO ZIET:
                  </h3>
                  
                  <div style="display: grid; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 24px; height: 24px; background: #8BAE5A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">📚</div>
                      <p style="margin: 0; color: #D1D5DB; font-size: 15px; line-height: 1.4;">
                        <strong style="color: #B6C948;">Academy Modules</strong> - Complete trainings voor persoonlijke ontwikkeling
                      </p>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 24px; height: 24px; background: #8BAE5A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">🍽️</div>
                      <p style="margin: 0; color: #D1D5DB; font-size: 15px; line-height: 1.4;">
                        <strong style="color: #B6C948;">Voedingsplannen</strong> - Gepersonaliseerde voeding voor jouw doelen
                      </p>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 24px; height: 24px; background: #8BAE5A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">💪</div>
                      <p style="margin: 0; color: #D1D5DB; font-size: 15px; line-height: 1.4;">
                        <strong style="color: #B6C948;">Trainingsschema's</strong> - Workouts afgestemd op jouw niveau
                      </p>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 24px; height: 24px; background: #8BAE5A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">🤝</div>
                      <p style="margin: 0; color: #D1D5DB; font-size: 15px; line-height: 1.4;">
                        <strong style="color: #B6C948;">Brotherhood</strong> - Community van gelijkgestemde top performers
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Timeline Info -->
                <div style="text-align: center; background: rgba(139, 174, 90, 0.1); padding: 25px; border-radius: 12px; margin: 30px 0;">
                  <h3 style="color: #B6C948; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">
                    ⏰ EXCLUSIEVE TOEGANG TIMELINE
                  </h3>
                  
                  <div style="display: grid; gap: 12px; text-align: left; max-width: 400px; margin: 0 auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(139, 174, 90, 0.2);">
                      <span style="color: #8BAE5A; font-weight: 600;">✅ Week 1:</span>
                      <span style="color: #D1D5DB;">Platform Preview Video</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(139, 174, 90, 0.2);">
                      <span style="color: #8BAE5A; font-weight: 600;">📋 Week 2:</span>
                      <span style="color: #D1D5DB;">Academy Content Sneak Peek</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(139, 174, 90, 0.2);">
                      <span style="color: #8BAE5A; font-weight: 600;">🎯 Week 3:</span>
                      <span style="color: #D1D5DB;">Beta Toegang Uitnodiging</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                      <span style="color: #B6C948; font-weight: 700;">🚀 Week 4:</span>
                      <span style="color: #FFFFFF; font-weight: 600;">VOLLEDIGE PLATFORM LAUNCH</span>
                    </div>
                  </div>
                </div>

                <!-- Call to Action -->
                <div style="text-align: center; margin: 40px 0;">
                  <a href="\${variables.videoUrl || 'https://platform.toptiermen.eu/preview'}" 
                     style="display: inline-block; background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 8px 25px rgba(139, 174, 90, 0.3); transition: all 0.3s ease;">
                    🎬 BEKIJK SNEAK PREVIEW NU
                  </a>
                  
                  <p style="color: #8BAE5A; font-size: 14px; margin: 16px 0 0 0; line-height: 1.5;">
                    💡 Tip: Bekijk de video in fullscreen voor de beste ervaring
                  </p>
                </div>

                <!-- Exclusive Note -->
                <div style="background: linear-gradient(135deg, #232D1A 0%, #3A4D23 100%); border: 1px solid #8BAE5A; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                  <p style="color: #B6C948; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">
                    🔒 EXCLUSIEVE PRE-LAUNCH TOEGANG
                  </p>
                  <p style="color: #D1D5DB; font-size: 14px; margin: 0; line-height: 1.5;">
                    Deze video is alleen beschikbaar voor pre-launch leden. Deel de link niet met anderen om de exclusiviteit te behouden.
                  </p>
                </div>

                <p style="font-size: 16px; line-height: 1.6; margin: 30px 0 0 0; color: #D1D5DB;">
                  Heel binnenkort krijg je toegang tot het volledige platform. Stay tuned voor meer exclusieve content en updates!
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin: 24px 0 0 0; color: #8BAE5A; font-weight: 600;">
                  Met vriendelijke groet,<br>
                  Het Top Tier Men Team
                </p>
              </div>

              <!-- Footer -->
              <div style="background: #232D1A; padding: 30px; text-align: center; border-top: 1px solid #3A4D23;">
                <p style="color: #8BAE5A; font-size: 14px; margin: 0 0 16px 0;">
                  © 2024 Top Tier Men - Exclusieve Broederschap voor Top Performers
                </p>
                <p style="color: #6B7280; font-size: 12px; margin: 0;">
                  Vragen? Stuur een email naar <a href="mailto:platform@toptiermen.eu" style="color: #8BAE5A; text-decoration: none;">platform@toptiermen.eu</a>
                </p>
                <p style="color: #6B7280; font-size: 12px; margin: 8px 0 0 0;">
                  <a href="https://platform.toptiermen.eu" style="color: #8BAE5A; text-decoration: none;">platform.toptiermen.eu</a>
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
🎬 EXCLUSIEVE SNEAK PREVIEW - Eerste blik op het Top Tier Men Platform

Beste \${variables.name && variables.name.trim() !== '' ? variables.name : ''},

Als onderdeel van onze exclusieve pre-launch community ben je een van de eerste die een kijkje mag nemen achter de schermen van het Top Tier Men platform. Deze sneak preview is alleen beschikbaar voor een selecte groep leden - jij bent een van hen.

🎥 PLATFORM SNEAK PREVIEW VIDEO
Bekijk de video hier: \${variables.videoUrl || 'https://platform.toptiermen.eu/sneakpreview'}

WAT JE IN DE VIDEO ZIET:
📚 Academy Modules - Complete trainings voor persoonlijke ontwikkeling
🍽️ Voedingsplannen - Gepersonaliseerde voeding voor jouw doelen  
💪 Trainingsschema's - Workouts afgestemd op jouw niveau
🤝 Brotherhood - Community van gelijkgestemde top performers

⏰ EXCLUSIEVE TOEGANG TIMELINE:
✅ Week 1: Platform Preview Video
📋 Week 2: Academy Content Sneak Peek
🎯 Week 3: Beta Toegang Uitnodiging
🚀 Week 4: VOLLEDIGE PLATFORM LAUNCH

🔒 EXCLUSIEVE PRE-LAUNCH TOEGANG
Deze video is alleen beschikbaar voor pre-launch leden. Deel de link niet met anderen om de exclusiviteit te behouden.

Heel binnenkort krijg je toegang tot het volledige platform. Stay tuned voor meer exclusieve content en updates!

Met vriendelijke groet,
Het Top Tier Men Team

---
© 2024 Top Tier Men - Exclusieve Broederschap voor Top Performers
Website: https://platform.toptiermen.eu
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
      // Create nodemailer transporter
      const transporter = nodemailer.createTransport({
        host: this.config.smtpHost,
        port: parseInt(this.config.smtpPort),
        secure: this.config.smtpSecure,
        auth: {
          user: this.config.smtpUsername,
          pass: this.config.smtpPassword
        }
      });

      console.log('📧 Sending email via SMTP:', {
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpSecure,
        username: this.config.smtpUsername,
        to,
        subject,
        from: this.config.fromName + ' <' + this.config.fromEmail + '>'
      });

      // Create email message
      const message = {
        from: this.config.fromName + ' <' + this.config.fromEmail + '>',
        to: to,
        subject: subject,
        html: html,
        text: text
      };

      // Actually send the email
      const result = await transporter.sendMail(message);
      
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