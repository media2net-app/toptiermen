import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const nodemailer = require('nodemailer');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Email configuration - Using TopTierMen SMTP
const emailConfig = {
  host: 'toptiermen.eu',
  port: 465,
  secure: true,
  auth: {
    user: 'platform@toptiermen.eu',
    pass: '5LUrnxEmEQYgEUt3PmZg'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📧 Sending test email:', body);

    const { 
      recipient = 'chiel@media2net.nl',
      subject = 'TopTierMen Email Funnel - Test Email',
      campaignName = 'Test Campaign'
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

    // Create tracking record
    const { data: tracking, error: trackingError } = await supabase
      .from('email_tracking')
      .insert({
        campaign_id: campaign.id,
        recipient_email: recipient,
        recipient_name: 'Chiel',
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

    // Email HTML template with tracking
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TopTierMen - Test Email</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 30px; }
            .content { padding: 30px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 TopTierMen</h1>
                <h2>Email Tracking System Test</h2>
            </div>
            
            <div class="content">
                <h3>Welkom bij de TopTierMen Email Funnel!</h3>
                
                <p>Dit is een test email om de email tracking functionaliteit te testen.</p>
                
                <p><strong>Test Features:</strong></p>
                <ul>
                    <li>✅ Email delivery tracking</li>
                    <li>✅ Open rate monitoring</li>
                    <li>✅ Click tracking</li>
                    <li>✅ Database integratie</li>
                    <li>✅ Real-time analytics</li>
                </ul>
                
                <p>Klik op de onderstaande knop om de click tracking te testen:</p>
                
                <a href="https://platform.toptiermen.eu/email-track/click?t=${trackingId}&url=${encodeURIComponent('https://platform.toptiermen.eu/dashboard')}" class="button">
                    🎯 Test Click Tracking
                </a>
                
                <p>Deze email werd verzonden op: ${new Date().toLocaleString('nl-NL')}</p>
                
                <p>Met sportieve groeten,<br>
                <strong>Het TopTierMen Team</strong></p>
            </div>
            
            <div class="footer">
                <p>TopTierMen Platform - Email Tracking System</p>
                <p>Campaign ID: ${campaign.id}</p>
                <p>Tracking ID: ${trackingId}</p>
            </div>
        </div>
        
        <!-- Open tracking pixel -->
        <img src="https://platform.toptiermen.eu/email-track/open?t=${trackingId}" width="1" height="1" style="display: none;" alt="">
    </body>
    </html>`;

    // Email credentials are configured in emailConfig above
    console.log('📧 Using TopTierMen SMTP credentials for email sending...');

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport(emailConfig);

    // Send the email
    const mailOptions = {
      from: `"TopTierMen Platform" <platform@toptiermen.eu>`,
      to: recipient,
      subject: subject,
      html: emailHtml
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);

      // Update tracking to "sent" status
      await supabase
        .from('email_tracking')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', tracking.id);

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
