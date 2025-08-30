import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
const nodemailer = require('nodemailer');
import { getEmailConfig } from '@/lib/email-config';

// Email configuration - Using SMTP
const emailConfig = getEmailConfig();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📧 Starting bulk email send:', body);

    const { 
      campaignId,
      subject = '🎯 Welkom bij Top Tier Men - Jouw reis naar excellentie begint hier',
      templateType = 'welcome',
      rateLimit = 10 // emails per minute
    } = body;

    if (!campaignId) {
      return NextResponse.json({
        success: false,
        error: 'Campaign ID is required'
      }, { status: 400 });
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('bulk_email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('❌ Error fetching campaign:', campaignError);
      return NextResponse.json({
        success: false,
        error: 'Campaign not found',
        details: campaignError?.message
      }, { status: 404 });
    }

    // Get leads for this specific campaign (only pending, not sent)
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('bulk_email_recipients')
      .select(`
        lead_id,
        email,
        first_name,
        last_name,
        full_name
      `)
      .eq('campaign_id', campaignId)
      .eq('status', 'pending');

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch leads',
        details: leadsError.message
      }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active leads found'
      }, { status: 400 });
    }

    console.log(`📧 Found ${leads.length} active leads for bulk sending`);

    // Update campaign status to sending
    await supabaseAdmin
      .from('bulk_email_campaigns')
      .update({
        status: 'sending',
        started_at: new Date().toISOString(),
        total_recipients: leads.length
      })
      .eq('id', campaignId);

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.smtpSecure,
      auth: {
        user: emailConfig.smtpUsername,
        pass: emailConfig.smtpPassword
      }
    });

    // Process leads in batches with rate limiting
    const batchSize = rateLimit;
    const delay = 60000 / rateLimit; // milliseconds between emails
    let sentCount = 0;
    let failedCount = 0;
    const results: Array<{email: string, success: boolean, messageId?: string, error?: string}> = [];

    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      
      console.log(`📧 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(leads.length / batchSize)} (${batch.length} emails)`);

      // Process batch concurrently
      const batchPromises = batch.map(async (lead, index) => {
        try {
          // Add delay between emails in batch
          await new Promise(resolve => setTimeout(resolve, index * delay));

          const recipientName = lead.full_name || `${lead.first_name} ${lead.last_name}`.trim() || '';
          
          // Get the recipient record ID for tracking
          const { data: recipientRecord, error: recipientError } = await supabaseAdmin
            .from('bulk_email_recipients')
            .select('id')
            .eq('campaign_id', campaignId)
            .eq('email', lead.email)
            .single();

          if (recipientError) {
            console.error(`❌ Error getting recipient record for ${lead.email}:`, recipientError);
            return { email: lead.email, success: false, error: recipientError.message };
          }

          const trackingId = recipientRecord.id;

          // Update existing recipient record to sent
          const { error: trackingError } = await supabaseAdmin
            .from('bulk_email_recipients')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('campaign_id', campaignId)
            .eq('email', lead.email);

          if (trackingError) {
            console.error(`❌ Error updating tracking for ${lead.email}:`, trackingError);
            return { email: lead.email, success: false, error: trackingError.message };
          }

          // Generate email HTML with proper name handling
          const emailHtml = generateEmailHtml(subject, recipientName, trackingId);

          // Send email with SMTP
          const mailOptions = {
            from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
            to: lead.email,
            subject: subject,
            html: emailHtml,
            headers: {
              'List-Unsubscribe': '<mailto:unsubscribe@toptiermen.eu>',
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              'X-Mailer': 'TopTierMen Platform',
              'X-Priority': '3',
              'X-MSMail-Priority': 'Normal',
              'Importance': 'normal',
              'Message-ID': `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@toptiermen.eu>`,
              'Date': new Date().toUTCString(),
              'MIME-Version': '1.0',
              'Content-Type': 'text/html; charset=UTF-8'
            }
          };

          const info = await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent to ${lead.email}: ${info.messageId}`);

                     // Tracking already updated above

          sentCount++;
          return { email: lead.email, success: true, messageId: info.messageId };

        } catch (error) {
          console.error(`❌ Error sending to ${lead.email}:`, error);
          
          // Update tracking to failed
          await supabaseAdmin
            .from('bulk_email_recipients')
            .update({
              status: 'failed',
              bounce_reason: error instanceof Error ? error.message : 'Unknown error'
            })
            .eq('email', lead.email)
            .eq('campaign_id', campaignId);

          failedCount++;
          return { email: lead.email, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Update campaign progress
      await supabaseAdmin
        .from('bulk_email_campaigns')
        .update({
          sent_count: sentCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      console.log(`📊 Batch completed. Sent: ${sentCount}, Failed: ${failedCount}`);
    }

    // Update campaign status to completed
    await supabaseAdmin
      .from('bulk_email_campaigns')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        sent_count: sentCount
      })
      .eq('id', campaignId);

    console.log(`🎉 Bulk email campaign completed! Sent: ${sentCount}, Failed: ${failedCount}`);

    return NextResponse.json({
      success: true,
      message: 'Bulk email campaign completed successfully',
      campaignId: campaignId,
      results: {
        total: leads.length,
        sent: sentCount,
        failed: failedCount,
        successRate: Math.round((sentCount / leads.length) * 100)
      },
      details: results
    });

  } catch (error) {
    console.error('❌ Error in bulk send email API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateEmailHtml(subject: string, recipientName: string, trackingId: string): string {
  const greeting = recipientName && recipientName.trim() !== '' ? recipientName : '';
  
  return `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Figtree', sans-serif; 
                line-height: 1.6; 
                color: #F3F3F1; 
                background-color: #141A15;
                margin: 0;
                padding: 0;
            }
            .email-container { 
                width: 100%; 
                max-width: 600px; 
                margin: 0 auto; 
                background: #0F1419;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            .header { 
                background: linear-gradient(135deg, #8BAE5A 0%, #B6C948 100%); 
                padding: 40px 30px;
                text-align: center;
                position: relative;
            }
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                opacity: 0.3;
            }
            .logo {
                width: 200px;
                height: auto;
                margin-bottom: 20px;
                position: relative;
                z-index: 1;
            }
            .title {
                font-size: 28px;
                font-weight: 700;
                color: white;
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            .subtitle {
                font-size: 16px;
                color: rgba(255,255,255,0.95);
                font-weight: 500;
                position: relative;
                z-index: 1;
            }
            .content {
                padding: 40px 30px;
                color: #E5E7EB;
            }
            .greeting {
                font-size: 18px;
                color: #8BAE5A;
                font-weight: 600;
                margin-bottom: 24px;
            }
            .intro-section {
                margin-bottom: 30px;
            }
            .intro-text {
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 20px;
                color: #D1D5DB;
            }
            .features-section {
                margin-bottom: 30px;
            }
            .features-title {
                font-size: 20px;
                font-weight: 700;
                color: #8BAE5A;
                margin-bottom: 20px;
                text-align: center;
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
            
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" class="logo">
                <div class="title">🎯 Welkom bij Top Tier Men</div>
                <div class="subtitle">Jouw reis naar excellentie begint nu</div>
            </div>
            
            <div class="content">
                <div class="greeting">Beste ${greeting},</div>
                
                <div class="intro-section">
                    <div class="intro-text">
                        Je hebt de eerste stap gezet naar een leven van <strong>excellentie</strong>. Als onderdeel van onze exclusieve broederschap krijg je toegang tot bewezen strategieën, persoonlijke voedings- en trainingsplannen en een community van gelijkgestemde mannen die elkaar naar succes duwen.
                    </div>
                    <div class="intro-text">
                        🎯 <strong>EXCLUSIEVE PRE-LAUNCH TOEGANG</strong><br>
                        Je behoort tot de exclusieve lijst van pre-launch leden! In de komende dagen ontvang je sneak previews van het platform, exclusieve content en diepgaande inzichten in wat Top Tier Men voor jou kan betekenen. Deze previews zijn alleen beschikbaar voor een selecte groep - jij bent een van hen.
                        <br><br>
                        <div style="text-align: center; background: rgba(139, 174, 90, 0.2); padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <div style="color: #B6C948; font-weight: 700; font-size: 18px;">
                                ⏰ Nog <strong style="color: #FFFFFF;">${Math.ceil((new Date('2025-09-10').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}</strong> dagen tot de officiële launch!
                            </div>
                            <div style="color: #8BAE5A; font-size: 14px; margin-top: 5px;">
                                10 september 2025
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="features-section">
                    <div class="features-title">Wat is Top Tier Men?</div>
                    <div class="intro-text" style="text-align: left; margin-bottom: 30px; color: #D1D5DB;">
                        Top Tier Men is een exclusieve broederschap voor mannen die weigeren te settelen voor middelmatigheid. We geloven dat elke man het potentieel heeft om excellentie te bereiken in alle aspecten van zijn leven - fysiek, mentaal, financieel en spiritueel. Onze community bestaat uit gedreven mannen die elkaar verantwoordelijk houden en samen groeien naar hun hoogste potentiaal.
                    </div>
                    
                    <div style="background: rgba(139, 174, 90, 0.05); border: 1px solid rgba(139, 174, 90, 0.2); padding: 30px; margin: 30px 0; border-radius: 15px; text-align: center;">
                        <div style="font-size: 22px; font-weight: 700; color: #8BAE5A; margin-bottom: 10px;">Rick Cuijpers</div>
                        <div style="font-size: 16px; color: #9CA3AF; font-style: italic; margin-bottom: 20px;">Oud marinier & Founder Top Tier Men</div>
                        <div style="font-size: 16px; line-height: 1.6; color: #D1D5DB;">
                            Oud marinier met jarenlange ervaring in leiderschap en persoonlijke ontwikkeling. Rick heeft honderden mannen geholpen hun leven te transformeren door discipline, doelgerichtheid en broederschap. Zijn militaire achtergrond en bewezen track record maken hem de ideale mentor voor mannen die serieus zijn over hun groei.
                        </div>
                    </div>
                </div>
                
                <!-- Platform Features Section -->
                <div style="background: rgba(139, 174, 90, 0.05); border: 1px solid rgba(139, 174, 90, 0.2); padding: 30px; margin: 30px 0; border-radius: 15px;">
                    <div style="font-size: 24px; font-weight: 700; color: #8BAE5A; margin-bottom: 20px; text-align: center;">
                        🚀 Platform Features
                    </div>
                    <div style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #D1D5DB; text-align: center;">
                        Ontdek alle krachtige tools en functies die je tot je beschikking hebt:
                    </div>
                    
                    <!-- Academy Modules Detail -->
                    <div style="background: rgba(139, 174, 90, 0.15); padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid rgba(139, 174, 90, 0.3);">
                        <div style="font-size: 20px; font-weight: 700; color: #B6C948; margin-bottom: 20px; text-align: center;">
                            🎓 Academy Modules (7 Modules, 36 Lessen)
                        </div>
                        
                        <!-- Desktop: 2-column table layout -->
                        <table class="academy-desktop" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                            <tr>
                                <td width="48%" style="vertical-align: top; padding-right: 10px;">
                                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word; margin-bottom: 15px;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">💪</div>
                                        <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 1</div>
                                        <div style="color: #8BAE5A; font-size: 12px;">Testosteron</div>
                                    </div>
                                </td>
                                <td width="48%" style="vertical-align: top; padding-left: 10px;">
                                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word; margin-bottom: 15px;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
                                        <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 2</div>
                                        <div style="color: #8BAE5A; font-size: 12px;">Discipline & Identiteit</div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width="48%" style="vertical-align: top; padding-right: 10px;">
                                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word; margin-bottom: 15px;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">🏋️</div>
                                        <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 3</div>
                                        <div style="color: #8BAE5A; font-size: 12px;">Fysieke Dominantie</div>
                                    </div>
                                </td>
                                <td width="48%" style="vertical-align: top; padding-left: 10px;">
                                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word; margin-bottom: 15px;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">🧠</div>
                                        <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 4</div>
                                        <div style="color: #8BAE5A; font-size: 12px;">Mentale Kracht/Weerbaarheid</div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width="48%" style="vertical-align: top; padding-right: 10px;">
                                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word; margin-bottom: 15px;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                                        <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 5</div>
                                        <div style="color: #8BAE5A; font-size: 12px;">Business and Finance</div>
                                    </div>
                                </td>
                                <td width="48%" style="vertical-align: top; padding-left: 10px;">
                                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word; margin-bottom: 15px;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">🤝</div>
                                        <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 6</div>
                                        <div style="color: #8BAE5A; font-size: 12px;">Brotherhood</div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="text-align: center;">
                                    <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word; margin: 0 auto; max-width: 300px;">
                                        <div style="font-size: 24px; margin-bottom: 8px;">🥗</div>
                                        <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 7</div>
                                        <div style="color: #8BAE5A; font-size: 12px;">Voeding & Gezondheid</div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Mobile: Single block with bullet points -->
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
                    
                    <!-- Platform Features Grid -->
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
            
            <div class="footer">
                <p>Met vriendelijke groet,<br><strong>Rick Cuijpers & Het Top Tier Men Team</strong></p>
                <p style="margin-top: 20px; font-size: 12px;">
                    Als je vragen hebt, neem contact op via <a href="mailto:platform@toptiermen.eu">platform@toptiermen.eu</a>
                </p>
            </div>
        </div>
        
                 <!-- Invisible tracking pixel -->
         <img src="https://platform.toptiermen.eu/api/email-track/open?trackingId=${trackingId}" alt="" width="1" height="1" style="display:none !important; visibility:hidden !important; opacity:0 !important; position:absolute !important; top:-9999px !important; left:-9999px !important;" />
        
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
    </body>
    </html>
  `;
}
