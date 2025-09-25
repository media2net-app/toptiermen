import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Email template function
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
    subject: 'Top Tier Men',
    html: `<p>Hello ${variables.name || '[NAAM]'}</p>`,
    text: `Hello ${variables.name || '[NAAM]'}`
  };
}

export async function POST(request: NextRequest) {
  // 🚨 EMERGENCY DISABLE: Email campaigns deactivated due to duplicate sends
  return NextResponse.json({ 
    error: 'Email campaigns have been disabled for safety. Contact administrator.' 
  }, { status: 503 });
  
  try {
    console.log('📧 Starting bulk email send...');
    
    const body = await request.json();
    const { 
      campaignId,
      template = 'sneak_preview',
      variables = {},
      dryRun = false // Safety flag to prevent accidental sends
    } = body;
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    console.log('📊 Bulk email request:', { campaignId, template, dryRun });
    
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('bulk_email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
      
    if (campaignError || !campaign) {
      console.error('❌ Campaign not found:', campaignError);
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    // Get recipients for this campaign
    const { data: recipients, error: recipientsError } = await supabaseAdmin
      .from('bulk_email_recipients')
      .select(`
        *,
        lead:leads(*)
      `)
      .eq('campaign_id', campaignId)
      .in('status', ['active', 'pending']);
      
    if (recipientsError) {
      console.error('❌ Error fetching recipients:', recipientsError);
      return NextResponse.json(
        { error: 'Failed to fetch recipients' },
        { status: 500 }
      );
    }
    
    console.log(`📊 Found ${recipients?.length || 0} active recipients for campaign: ${campaign.name}`);
    
    if (!recipients || recipients?.length === 0) {
      return NextResponse.json(
        { error: 'No active or pending recipients found for this campaign' },
        { status: 400 }
      );
    }
    
    // Safety check for dry run
    if (dryRun) {
      console.log('🧪 DRY RUN MODE - No emails will be sent');
      return NextResponse.json({
        success: true,
        message: 'Dry run completed successfully',
        campaign: campaign.name,
        recipientCount: recipients?.length || 0,
        template: template,
        dryRun: true,
        recipients: recipients?.slice(0, 5).map(r => ({ 
          email: r.lead?.email, 
          name: r.lead?.name 
        })) // Show first 5 for preview
      });
    }
    
    // Create bulk email tracking table if it doesn't exist
    await supabaseAdmin.rpc('create_bulk_email_tracking_if_not_exists');
    
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    // Send ALL remaining emails - NO INTERVALS, FULL SPEED
    const BATCH_SIZE = 38; // ALL EMAILS IN ONE BATCH
    const BATCH_DELAY_MS = 0; // NO DELAY
    const EMAIL_DELAY_MS = 100; // MINIMAL 100ms between emails
    const SKIP_FIRST = 6; // SKIP FIRST 6 (ALREADY SENT)
    const MAX_EMAILS = 32; // SEND REMAINING 32 EMAILS
    
    console.log(`🚀 ========== BULK EMAIL CAMPAIGN - FINAL SEND ==========`);
    console.log(`📊 Total recipients available: ${recipients?.length || 0}`);
    console.log(`📦 SENDING ALL REMAINING ${MAX_EMAILS} EMAILS`);
    console.log(`⚠️ SKIPPING FIRST ${SKIP_FIRST} (Already sent)`);
    console.log(`⚡ NO INTERVALS - FULL SPEED SEND`);
    console.log(`📧 Template: ${template}`);
    console.log(`🎯 Campaign: ${campaign.name}`);
    console.log(`🔥 THIS IS THE OFFICIAL CAMPAIGN - FINAL BATCH!`);
    console.log('');
    
    // Skip first 6 recipients (already sent) and process remaining emails
    const startIndex = SKIP_FIRST;
    const endIndex = Math.min(startIndex + MAX_EMAILS, recipients?.length || 0);
    
    console.log(`📧 Processing recipients ${startIndex + 1} to ${endIndex} (${endIndex - startIndex} emails)`);
    console.log('');
    
    for (let i = startIndex; i < endIndex; i += BATCH_SIZE) {
      const batch = recipients?.slice(i, Math.min(i + BATCH_SIZE, endIndex)) || [];
      const batchNumber = 1; // All in one final batch
      const totalBatches = 1;
      
      console.log(`📦 ========== BATCH ${batchNumber}/${totalBatches} ==========`);
      console.log(`📧 Processing ${batch.length} recipients...`);
      console.log(`⏰ Started at: ${new Date().toLocaleTimeString('nl-NL')}`);
      console.log('');
      
      for (let j = 0; j < batch.length; j++) {
        const recipient = batch[j];
        try {
          const lead = recipient.lead;
          if (!lead?.email) {
            console.warn('⚠️ Skipping recipient with no email:', recipient.id);
            continue;
          }
          
          // Generate unique tracking ID for this email
          const trackingId = `bulk_${Date.now()}_${lead.email.replace('@', '_at_').replace(/\./g, '_dot_')}_${Math.random().toString(36).substr(2, 9)}`;
          
          console.log(`📧 [${j + 1}/${batch.length}] Sending to: ${lead.email}`);
          console.log(`👤 Personal greeting: "Hey ${lead.name || lead.email.split('@')[0]}!"`);
          console.log(`🔗 Tracking ID: ${trackingId}`);
          
          // Get email template content with personalized name
          const emailTemplate = getEmailTemplate(template, {
            name: lead.name || lead.email.split('@')[0], // Use name or email prefix
            trackingId: trackingId,
            campaignId: campaignId,
            ...variables
          });
          
          // Send email via EmailService (Mailgun EU)
          const emailService = new EmailService();
          const emailResult = await emailService.sendEmail(
            lead.email,
            emailTemplate.subject,
            'sneak_preview', // Use template name
            {
              name: lead.name || lead.email.split('@')[0],
              trackingId: trackingId,
              campaignId: campaignId,
              ...variables
            },
            { tracking: true }
          );
          
          if (emailResult) {
            // Store tracking info in database
            const { error: trackingError } = await supabaseAdmin
              .from('bulk_email_tracking')
              .insert({
                campaign_id: campaignId,
                recipient_id: recipient.id,
                lead_id: lead.id,
                email: lead.email,
                name: lead.name,
                tracking_id: trackingId,
                template: template,
                sent_at: new Date().toISOString(),
                status: 'sent'
              });
            
            if (trackingError) {
              console.error('❌ Failed to store tracking info:', trackingError);
              results.errors.push(`Failed to store tracking for ${lead.email}: ${trackingError?.message || 'Unknown error'}`);
            } else {
              console.log(`✅ Email sent and tracked successfully!`);
              results.sent++;
            }
          } else {
            console.error(`❌ Failed to send email`);
            results.failed++;
            results.errors.push(`Failed to send to ${lead.email}`);
          }
          
          console.log('');
          
          // Delay between individual emails
          if (EMAIL_DELAY_MS > 0 && j < batch.length - 1) {
            await new Promise(resolve => setTimeout(resolve, EMAIL_DELAY_MS));
          }
          
        } catch (error) {
          console.error(`❌ Error processing recipient:`, error);
          results.failed++;
          results.errors.push(`Error processing recipient: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.log('');
        }
      }
      
      console.log(`📊 Batch ${batchNumber}/${totalBatches} completed at ${new Date().toLocaleTimeString('nl-NL')}:`);
      console.log(`✅ Total sent so far: ${results.sent}`);
      console.log(`❌ Total failed so far: ${results.failed}`);
      console.log('');
      
      // Delay between batches (except for the last batch)
      if (i + BATCH_SIZE < (recipients?.length || 0)) {
        console.log(`⏳ Waiting ${BATCH_DELAY_MS / 1000} seconds before next batch...`);
        console.log(`⏰ Next batch starts at: ${new Date(Date.now() + BATCH_DELAY_MS).toLocaleTimeString('nl-NL')}`);
        console.log('');
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }
    
    console.log(`🎉 ========== CAMPAIGN COMPLETED ==========`);
    console.log(`⏰ Finished at: ${new Date().toLocaleTimeString('nl-NL')}`);
    console.log(`📊 Final Results:`);
    console.log(`✅ Successfully sent: ${results.sent} emails`);
    console.log(`❌ Failed: ${results.failed} emails`);
    console.log(`📧 Template used: ${template}`);
    console.log(`🎯 Campaign: ${campaign.name}`);
    if (results.errors.length > 0) {
      console.log(`⚠️ Errors encountered:`);
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    console.log(`🎉 ========================================`);
    
    // Update campaign status
    await supabaseAdmin
      .from('bulk_email_campaigns')
      .update({ 
        last_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId);
    
    return NextResponse.json({
      success: true,
      message: 'Bulk email send completed',
      campaign: campaign.name,
      results: results,
      template: template
    });
    
  } catch (error) {
    console.error('❌ Error in bulk email send:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk emails' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Bulk email service is ready',
    endpoint: '/api/email/send-bulk',
    method: 'POST',
    body: {
      campaignId: 'campaign-uuid',
      template: 'sneak_preview',
      variables: { daysUntilLaunch: '4' },
      dryRun: true // Set to false to actually send emails
    }
  });
}
