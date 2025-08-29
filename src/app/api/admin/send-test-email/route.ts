import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';
const nodemailer = require('nodemailer');
import { getEmailConfig } from '@/lib/email-config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Email configuration - Using Mailgun
const emailConfig = getEmailConfig();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📧 Sending test email:', body);

    const { 
      recipient = 'chiel@media2net.nl',
      subject = 'Welkom bij TopTierMen - Jouw reis naar excellentie begint nu 🚀',
      campaignName = 'Welkom & Introductie Email',
      preview = false
    } = body;

    // Create email campaign first
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        name: campaignName,
        subject: subject,
        template_type: 'test',
        status: 'active',
        total_recipients: 1
      })
      .select()
      .single();

    if (campaignError) {
      console.error('❌ Error creating campaign:', campaignError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create email campaign',
        details: campaignError.message
      }, { status: 500 });
    }

    // Generate tracking ID
    const trackingId = `ttm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get recipient name from leads table if available
    let recipientName = 'Chiel'; // Default fallback
    try {
      const { data: leadData } = await supabase
        .from('leads')
        .select('first_name, last_name, full_name')
        .eq('email', recipient)
        .single();
      
      if (leadData) {
        recipientName = leadData.full_name || `${leadData.first_name} ${leadData.last_name}`.trim() || '';
      }
    } catch (error) {
      console.log('No lead found for email, using default name');
    }

    // Create tracking record
    const { data: tracking, error: trackingError } = await supabase
      .from('email_tracking')
      .insert({
        campaign_id: campaign.id,
        recipient_email: recipient,
        recipient_name: recipientName,
        subject: subject,
        template_type: 'test',
        tracking_id: trackingId,
        status: 'pending'
      })
      .select()
      .single();

    if (trackingError) {
      console.error('❌ Error creating tracking record:', trackingError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create tracking record',
        details: trackingError.message
      }, { status: 500 });
    }

    // Email HTML template with tracking - Groene TopTierMen styling
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welkom bij TopTierMen - Jouw reis naar excellentie begint nu</title>
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
                max-width: 100%; 
                margin: 0; 
                background: #141A15;
                border-radius: 0;
                overflow: hidden;
            }
            
            .header { 
                background: linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #3a5f3a 100%); 
                padding: 50px 30px;
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
                width: 140px;
                height: 70px;
                background: linear-gradient(45deg, #8bae5a, #b6c948);
                border-radius: 12px;
                margin: 0 auto 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 800;
                font-size: 18px;
                color: #141A15;
                position: relative;
                z-index: 1;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .header h1 { 
                color: white; 
                font-size: 42px; 
                font-weight: 700;
                margin-bottom: 15px;
                position: relative;
                z-index: 1;
                text-align: center;
            }
            
            .header .subtitle { 
                color: #8BAE5A; 
                font-size: 22px;
                font-weight: 600;
                position: relative;
                z-index: 1;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .content { 
                padding: 50px 40px; 
                background: #141A15;
            }
            
            .greeting {
                font-size: 28px;
                font-weight: 700;
                color: #F3F3F1;
                margin-bottom: 25px;
                text-align: center;
            }
            
            .intro-section {
                background: linear-gradient(135deg, #1F2D17 0%, #2A3D1A 100%);
                padding: 40px;
                border-radius: 15px;
                margin: 30px 0;
                border: 2px solid #8BAE5A;
                text-align: center;
            }
            
            .intro-text {
                font-size: 18px;
                color: #B6C948;
                margin-bottom: 20px;
                line-height: 1.8;
                font-weight: 500;
            }
            
            .features-section {
                background: rgba(139, 174, 90, 0.1);
                padding: 40px;
                border-radius: 15px;
                margin: 40px 0;
                border-left: 5px solid #8BAE5A;
            }
            
            .features-title {
                font-size: 24px;
                font-weight: 700;
                color: #F3F3F1;
                margin-bottom: 30px;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .features-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 30px 0;
            }
            
            .feature-card {
                background: linear-gradient(135deg, #232D1A 0%, #3A4D23 100%);
                padding: 25px;
                border-radius: 12px;
                border-left: 4px solid #B6C948;
                text-align: center;
            }
            
            .feature-emoji {
                font-size: 32px;
                margin-bottom: 15px;
                display: block;
            }
            
            .feature-title {
                font-weight: 700;
                color: #F3F3F1;
                margin-bottom: 10px;
                font-size: 16px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .feature-desc {
                color: #8BAE5A;
                font-size: 14px;
                line-height: 1.6;
                font-weight: 500;
            }
            
            .cta-section {
                text-align: center;
                margin: 50px 0;
                padding: 40px;
                background: #141A15;
                border-radius: 15px;
                border: 3px solid #8BAE5A;
            }
            
            .cta-title {
                font-size: 26px;
                font-weight: 800;
                color: #F3F3F1;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .cta-subtitle {
                font-size: 16px;
                color: #B6C948;
                margin-bottom: 30px;
                font-weight: 500;
            }
            
            .cta-button {
                display: inline-block;
                background: #8BAE5A;
                color: #141A15;
                padding: 20px 40px;
                text-decoration: none;
                border-radius: 12px;
                font-weight: 800;
                font-size: 18px;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
                border: 3px solid #8BAE5A;
                box-shadow: 0 8px 25px rgba(139, 174, 90, 0.3);
            }
            
            .cta-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 35px rgba(139, 174, 90, 0.4);
                background: #B6C948;
            }
            

            
            .footer { 
                background: linear-gradient(135deg, #232D1A 0%, #1F2D17 100%); 
                color: #8BAE5A; 
                padding: 40px;
                text-align: center;
                font-size: 14px;
                font-weight: 500;
            }
            
            .footer a {
                color: #B6C948;
                text-decoration: none;
                font-weight: 600;
            }
            
            .footer-signature {
                font-size: 16px;
                font-weight: 700;
                color: #F3F3F1;
                margin-bottom: 20px;
            }
            
            @media (max-width: 600px) {
                .features-grid {
                    grid-template-columns: 1fr;
                }
                .header h1 {
                    font-size: 28px;
                }
                .content {
                    padding: 30px 20px;
                }
                .intro-section,
                .features-section,
                .cta-section {
                    padding: 25px;
                }
                /* Feature cards responsive for mobile */
                table[style*="margin: 20px 0"] td {
                    display: block !important;
                    width: 100% !important;
                    padding: 0 !important;
                }
                /* Academy modules table - Force single column on mobile */
                table[style*="margin: 20px 0"] td[width="48%"] {
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
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <img src="https://platform.toptiermen.eu/logo_white-full.svg" alt="Top Tier Men Logo" style="width: 200px; height: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
                <h1>Welkom bij de Broederschap</h1>
                <div class="subtitle">Jouw reis naar excellentie begint nu</div>
            </div>
            
            <div class="content">
                <div class="greeting">Beste ${recipientName && recipientName.trim() !== '' ? recipientName : ''},</div>
                
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
                        <div style="font-size: 16px; color: #9CA3AF; font-style: italic; margin-bottom: 20px;">Rick Cuijpers - Oprichter & Mentor</div>
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
                    
                                <!-- Academy Modules Detail - Desktop: Grid, Mobile: Single block with bullets -->
            <div style="background: rgba(139, 174, 90, 0.15); padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid rgba(139, 174, 90, 0.3);">
                <div style="font-size: 20px; font-weight: 700; color: #B6C948; margin-bottom: 20px; text-align: center;">
                    🎓 Academy Modules (7 Modules, 36 Lessen)
                </div>
                
                <!-- Desktop: 2-column table layout for better email client compatibility -->
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
                        <td colspan="2" style="vertical-align: top;">
                            <div style="color: #D1D5DB; font-size: 14px; padding: 16px; background: rgba(139, 174, 90, 0.1); border: 1px solid rgba(139, 174, 90, 0.2); border-radius: 10px; text-align: center; word-wrap: break-word; margin-bottom: 15px;">
                                <div style="font-size: 24px; margin-bottom: 8px;">🥗</div>
                                <div style="color: #B6C948; font-weight: 600; font-size: 14px; margin-bottom: 4px;">Module 7</div>
                                <div style="color: #8BAE5A; font-size: 12px;">Voeding & Gezondheid</div>
                            </div>
                        </td>
                    </tr>
                </table>
                
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
                

            </div>
            
            <div class="footer">
                <div class="footer-signature">Met vriendelijke groet,<br>Het Top Tier Men Team</div>
                <p style="margin-top: 20px; font-style: italic; color: #9CA3AF;">
                    "Excellentie is geen toeval. Het is een keuze, een commitment, een levensstijl."
                </p>
                <p style="margin-top: 15px;">
                    <a href="mailto:platform@toptiermen.eu">platform@toptiermen.eu</a> | 
                    <a href="https://platform.toptiermen.eu">platform.toptiermen.eu</a>
                </p>
            </div>
        </div>
        
        <!-- Invisible tracking pixel -->
        <img src="http://localhost:3000/email-track/open?t=${trackingId}" alt="" width="1" height="1" style="display:none !important; visibility:hidden !important; opacity:0 !important; position:absolute !important; top:-9999px !important; left:-9999px !important;" />
    </body>
    </html>`;

    // If preview mode, return the HTML without sending
    if (preview) {
      console.log('📧 Preview mode - returning HTML without sending');
      return NextResponse.json({
        success: true,
        message: 'Email preview generated successfully!',
        html: emailHtml,
        campaignId: campaign.id,
        trackingId: trackingId
      });
    }

    // Email credentials are configured in emailConfig above
    console.log('📧 Using TopTierMen SMTP credentials for email sending...');

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

    // Send the email with proper headers for better deliverability
    const mailOptions = {
      from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
      to: recipient,
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

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);

      // Update tracking to "sent" status using direct update
      const { error: trackingUpdateError } = await supabaseAdmin
        .from('email_tracking')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('tracking_id', trackingId);
      
      if (trackingUpdateError) {
        console.error('❌ Error updating tracking status:', trackingUpdateError);
      } else {
        console.log('✅ Tracking status updated to sent');
      }

      // Update campaign stats
      await supabase
        .from('email_campaigns')
        .update({
          sent_count: 1,
          status: 'completed',
          sent_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', campaign.id);

      console.log('📊 Email tracking updated successfully');

      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        campaignId: campaign.id,
        trackingId: trackingId,
        recipient: recipient,
        messageId: info.messageId
      });

    } catch (emailError) {
      console.error('❌ Error sending email:', emailError);
      
      // Update tracking to "failed" status
      await supabase
        .from('email_tracking')
        .update({
          status: 'failed'
        })
        .eq('id', tracking.id);

      return NextResponse.json({
        success: false,
        error: 'Failed to send email',
        details: emailError instanceof Error ? emailError.message : 'Unknown error',
        campaignId: campaign.id,
        trackingId: trackingId
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in send test email API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
