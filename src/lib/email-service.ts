import { supabaseAdmin } from './supabase-admin';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailData {
  to: string;
  template: string;
  variables: Record<string, string>;
}

class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@toptiermen.com';
    this.fromName = process.env.FROM_NAME || 'Top Tier Men';
  }

  private async getEmailTemplate(templateName: string): Promise<EmailTemplate> {
    const templates: Record<string, EmailTemplate> = {
      welcome: {
        subject: 'Welkom bij Top Tier Men - Je reis naar excellentie begint nu!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welkom bij Top Tier Men</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #8BAE5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welkom bij Top Tier Men!</h1>
                <p>Je reis naar excellentie begint nu</p>
              </div>
              <div class="content">
                <h2>Hallo {{name}},</h2>
                <p>Welkom bij Top Tier Men! We zijn verheugd je te verwelkomen in onze community van mannen die streven naar excellentie.</p>
                
                <p>Je account is succesvol aangemaakt en je kunt nu beginnen met je reis naar persoonlijke groei. Hier is wat je kunt verwachten:</p>
                
                <ul>
                  <li>🎯 <strong>Persoonlijke doelen</strong> - Stel je hoofddoel in en werk er naartoe</li>
                  <li>🔥 <strong>Dagelijkse missies</strong> - Krijg dagelijkse uitdagingen om te groeien</li>
                  <li>💪 <strong>Trainingsschema's</strong> - Kies uit verschillende workout programma's</li>
                  <li>🥗 <strong>Voedingsplannen</strong> - Optimaliseer je voeding voor prestaties</li>
                  <li>💬 <strong>Community</strong> - Connect met gelijkgestemde mannen</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="{{dashboardUrl}}" class="button">Ga naar je Dashboard</a>
                </div>
                
                <p>Als je vragen hebt of hulp nodig hebt, aarzel niet om contact met ons op te nemen.</p>
                
                <p>Met vriendelijke groet,<br>
                <strong>Het Top Tier Men Team</strong></p>
              </div>
              <div class="footer">
                <p>© 2025 Top Tier Men. Alle rechten voorbehouden.</p>
                <p>Je ontvangt deze email omdat je je hebt geregistreerd bij Top Tier Men.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Welkom bij Top Tier Men!
          
          Hallo {{name}},
          
          Welkom bij Top Tier Men! We zijn verheugd je te verwelkomen in onze community van mannen die streven naar excellentie.
          
          Je account is succesvol aangemaakt en je kunt nu beginnen met je reis naar persoonlijke groei.
          
          Ga naar je dashboard: {{dashboardUrl}}
          
          Met vriendelijke groet,
          Het Top Tier Men Team
        `
      },
      onboarding_reminder: {
        subject: 'Voltooi je onboarding - Top Tier Men',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Onboarding Reminder</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #FFD700; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚀 Klaar om te beginnen?</h1>
                <p>Voltooi je onboarding en start je reis</p>
              </div>
              <div class="content">
                <h2>Hallo {{name}},</h2>
                <p>We hebben gemerkt dat je nog niet alle stappen van je onboarding hebt voltooid. Om het meeste uit Top Tier Men te halen, raden we je aan om je onboarding af te maken.</p>
                
                <p><strong>Wat je nog moet doen:</strong></p>
                <ul>
                  <li>🎯 Je hoofddoel instellen</li>
                  <li>🔥 Je eerste missies selecteren</li>
                  <li>💪 Een trainingsschema kiezen</li>
                  <li>🥗 Een voedingsplan selecteren</li>
                  <li>💬 Je voorstellen aan de community</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="{{onboardingUrl}}" class="button">Voltooi Onboarding</a>
                </div>
                
                <p>Het duurt slechts 5 minuten en zorgt ervoor dat je direct kunt beginnen met groeien!</p>
                
                <p>Met vriendelijke groet,<br>
                <strong>Het Top Tier Men Team</strong></p>
              </div>
              <div class="footer">
                <p>© 2025 Top Tier Men. Alle rechten voorbehouden.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Klaar om te beginnen?
          
          Hallo {{name}},
          
          We hebben gemerkt dat je nog niet alle stappen van je onboarding hebt voltooid. Om het meeste uit Top Tier Men te halen, raden we je aan om je onboarding af te maken.
          
          Voltooi je onboarding: {{onboardingUrl}}
          
          Met vriendelijke groet,
          Het Top Tier Men Team
        `
      },
      email_verification: {
        subject: 'Verificeer je email - Top Tier Men',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verificatie</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Verificeer je Email</h1>
                <p>Bevestig je account om te beginnen</p>
              </div>
              <div class="content">
                <h2>Hallo {{name}},</h2>
                <p>Bedankt voor je registratie bij Top Tier Men! Om je account te activeren, moet je je email adres verifiëren.</p>
                
                <div style="text-align: center;">
                  <a href="{{verificationUrl}}" class="button">Verificeer Email</a>
                </div>
                
                <p>Of kopieer en plak deze link in je browser:</p>
                <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px;">{{verificationUrl}}</p>
                
                <p>Deze link is 24 uur geldig. Als je geen account hebt aangemaakt bij Top Tier Men, kun je deze email negeren.</p>
                
                <p>Met vriendelijke groet,<br>
                <strong>Het Top Tier Men Team</strong></p>
              </div>
              <div class="footer">
                <p>© 2025 Top Tier Men. Alle rechten voorbehouden.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Verificeer je Email
          
          Hallo {{name}},
          
          Bedankt voor je registratie bij Top Tier Men! Om je account te activeren, moet je je email adres verifiëren.
          
          Verificeer je email: {{verificationUrl}}
          
          Met vriendelijke groet,
          Het Top Tier Men Team
        `
      }
    };

    return templates[templateName] || templates.welcome;
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
      const template = await this.getEmailTemplate(emailData.template);
      
      const html = this.replaceVariables(template.html, emailData.variables);
      const text = this.replaceVariables(template.text, emailData.variables);
      const subject = this.replaceVariables(template.subject, emailData.variables);

      // Use Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: [emailData.to],
          subject: subject,
          html: html,
          text: text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Email sending failed:', error);
        return false;
      }

      // Log email to database
      await this.logEmail(emailData.to, emailData.template, subject);
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  private async logEmail(to: string, template: string, subject: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('email_logs')
        .insert({
          to_email: to,
          template_name: template,
          subject: subject,
          sent_at: new Date().toISOString(),
        });
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
        onboardingUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/onboarding`,
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
}

export const emailService = new EmailService(); 