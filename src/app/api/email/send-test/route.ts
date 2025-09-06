import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Import the template function from bulk email API
function getEmailTemplate(template: string, variables: Record<string, string>) {
  if (template === 'sneak_preview') {
    const html = `
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
              Hey ${variables.name || '[NAAM]'}!
            </p>

            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #FFFFFF;">
              Je behoort tot een <strong style="color: #8BAE5A;">selectieve groep</strong> die als eerste het Top Tier Men platform mag zien. 
            </p>

            <!-- Countdown Section -->
            <div style="background: rgba(139, 174, 90, 0.1); border-left: 4px solid #8BAE5A; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <div style="text-align: center;">
                <p style="color: #B6C948; font-weight: 700; font-size: 18px; margin: 0 0 8px 0;">
                  ⏰ Nog <strong style="color: #FFFFFF; font-size: 24px;">${variables.daysUntilLaunch || '4'}</strong> dagen tot de officiële launch!
                </p>
                <p style="color: #8BAE5A; font-size: 14px; margin: 0;">
                  10 september 2025
                </p>
              </div>
            </div>

            <!-- What Top Tier Men Means Section -->
            <div style="background: rgba(139, 174, 90, 0.05); border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #B6C948; font-size: 20px; font-weight: 700; margin: 0 0 15px 0; text-align: center;">
                Wat betekent Top Tier Men voor jou?
              </h3>
              <p style="color: #D1D5DB; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
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

            <!-- Footer -->
            <div style="background: rgba(139, 174, 90, 0.1); padding: 20px; text-align: center; border-top: 1px solid rgba(139, 174, 90, 0.2);">
              <p style="color: #8BAE5A; font-size: 12px; margin: 0;">
                © 2025 Top Tier Men | <a href="https://platform.toptiermen.eu" style="color: #8BAE5A; text-decoration: none;">platform.toptiermen.eu</a>
              </p>
            </div>
          </div>
          <!-- Email Tracking Pixel -->
          <img src="https://platform.toptiermen.eu/email-track/open?trackingId=[TRACKING_ID]" alt="" style="display:none;width:1px;height:1px;" />
        </div>
      </div>
    `;

    const text = `
      Hey ${variables.name || '[NAAM]'}!
      
      Je behoort tot een selectieve groep die als eerste het Top Tier Men platform mag zien.
      
      Nog ${variables.daysUntilLaunch || '4'} dagen tot de officiële launch op 10 september 2025!
      
      Wat betekent Top Tier Men voor jou?
      
      Top Tier Men is meer dan een platform - het is jouw persoonlijke transformatiepartner. We bieden een complete aanpak die jou helpt om:
      
      • FYSIEK: Persoonlijke voedings- en trainingsplannen die echt werken
      • MENTAAL: Bewezen strategieën voor focus, discipline en mindset  
      • PROFESSIONEEL: Business tools en netwerk om jouw carrière te versnellen
      • COMMUNITY: Een broederschap van gelijkgestemde mannen die elkaar naar succes duwen
      
      Bekijk de exclusieve video: https://platform.toptiermen.eu/sneakpreview
      
      Exclusief voor pre-launch leden - deel deze video niet, houd het onder ons!
      
      Groet,
      Het Top Tier Men Team
      
      © 2025 Top Tier Men | platform.toptiermen.eu
    `;

    return {
      subject: '🎬 Exclusieve Preview - Top Tier Men Platform',
      html,
      text
    };
  }

  // Default template
  return {
    subject: 'Top Tier Men Test',
    html: `<p>Hello ${variables.name || '[NAAM]'}</p>`,
    text: `Hello ${variables.name || '[NAAM]'}`
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Sending test email...');
    
    const body = await request.json();
    const { to, name = 'Test User', template = 'test', variables = {}, campaignId } = body;
    
    // 🚨 EMERGENCY DISABLE: Block campaign test emails
    if (campaignId && (template === 'sneak_preview' || campaignId === '84bceade-eec6-4349-958f-6b04be0d3003')) {
      console.log('🚨 BLOCKED: Campaign test email blocked for safety');
      return NextResponse.json({ 
        error: 'Campaign test emails zijn gedeactiveerd vanwege veiligheidsproblemen. Gebruik externe platforms.' 
      }, { status: 503 });
    }
    
    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }
    
    console.log('📧 Test email request:', { to, name });
    
    // Generate unique tracking ID for this email (include email for tracking)
    const campaignId = template === 'sneak_preview' ? '84bceade-eec6-4349-958f-6b04be0d3003' : null;
    const trackingId = `test_${Date.now()}_${to.replace('@', '_at_').replace('.', '_dot_')}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Send test email via SMTP (reliable for testing)
    const result = await emailService.sendEmail({
      to: to,
      template: template,
      variables: {
        name: name,
        trackingId: trackingId,
        campaignId: campaignId,
        ...variables
      }
    });
    
    if (result) {
      console.log('✅ Test email sent successfully');
      
      // Store test email in database for tracking
      if (campaignId) {
        try {
          const { data, error } = await supabaseAdmin
            .from('test_email_tracking')
            .insert({
              campaign_id: campaignId,
              email: to,
              name: name,
              tracking_id: trackingId,
              template: template,
              sent_at: new Date().toISOString()
            })
            .select();
          
          if (error) {
            console.error('❌ Failed to store test email tracking:', error);
          } else {
            console.log('✅ Test email tracking stored in database:', data);
          }
        } catch (dbError) {
          console.error('❌ Database error storing test email:', dbError);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        to: to,
        template: template,
        trackingId: trackingId
      });
    } else {
      console.log('❌ Test email failed');
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return current email configuration (without sensitive data)
    const config = await emailService.getConfig();
    
    return NextResponse.json({
      success: true,
      message: 'Email service is ready for testing',
      smtpConfig: {
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        username: config.smtpUsername,
        fromEmail: config.fromEmail,
        fromName: config.fromName
      },
      testEndpoint: '/api/email/send-test',
      testMethod: 'POST',
      testBody: {
        to: 'your-email@example.com',
        name: 'Your Name'
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting email configuration:', error);
    return NextResponse.json(
      { error: 'Failed to get email configuration' },
      { status: 500 }
    );
  }
}
