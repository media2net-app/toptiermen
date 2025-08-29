import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('📧 Fetching email campaigns...');

    // Fetch email campaigns with aggregated stats
    const { data: campaigns, error: campaignsError } = await supabase
      .from('email_campaigns')
      .select(`
        *,
        email_tracking(
          id,
          status,
          sent_at,
          opened_at,
          clicked_at,
          bounced_at,
          unsubscribed_at
        )
      `)
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('❌ Error fetching campaigns:', campaignsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch email campaigns',
        details: campaignsError.message
      }, { status: 500 });
    }

    // Process campaigns to calculate real-time stats
    const processedCampaigns = campaigns.map(campaign => {
      const tracking = campaign.email_tracking || [];
      
      const stats = {
        total_sent: tracking.length,
        delivered: tracking.filter(t => t.status === 'delivered' || t.status === 'opened' || t.status === 'clicked').length,
        opened: tracking.filter(t => t.status === 'opened' || t.status === 'clicked').length,
        clicked: tracking.filter(t => t.status === 'clicked').length,
        bounced: tracking.filter(t => t.status === 'bounced').length,
        unsubscribed: tracking.filter(t => t.status === 'unsubscribed').length
      };

      const deliveryRate = stats.total_sent > 0 ? (stats.delivered / stats.total_sent * 100) : 0;
      const openRate = stats.delivered > 0 ? (stats.opened / stats.delivered * 100) : 0;
      const clickRate = stats.delivered > 0 ? (stats.clicked / stats.delivered * 100) : 0;

      return {
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        template_type: campaign.template_type,
        status: campaign.status,
        created_at: campaign.created_at,
        sent_at: campaign.sent_at,
        completed_at: campaign.completed_at,
        stats: {
          ...stats,
          delivery_rate: Math.round(deliveryRate * 10) / 10,
          open_rate: Math.round(openRate * 10) / 10,
          click_rate: Math.round(clickRate * 10) / 10
        }
      };
    });

    console.log(`✅ Successfully fetched ${processedCampaigns.length} email campaigns`);

    return NextResponse.json({
      success: true,
      campaigns: processedCampaigns,
      total: processedCampaigns.length
    });

  } catch (error) {
    console.error('❌ Error in email campaigns API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📧 Creating new email campaign:', body);

    const { 
      name,
      subject,
      template_type = 'marketing',
      recipients = [],
      content 
    } = body;

    // Validate required fields
    if (!name || !subject || !content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, subject, and content are required'
      }, { status: 400 });
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        name,
        subject,
        template_type,
        status: 'draft',
        total_recipients: recipients.length
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

    // Create tracking records for each recipient
    if (recipients.length > 0) {
      const trackingRecords = recipients.map((email: string) => ({
        campaign_id: campaign.id,
        recipient_email: email,
        subject: subject,
        template_type: template_type,
        tracking_id: `ttm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending'
      }));

      const { error: trackingError } = await supabase
        .from('email_tracking')
        .insert(trackingRecords);

      if (trackingError) {
        console.error('❌ Error creating tracking records:', trackingError);
        // Continue anyway, campaign is created
      }
    }

    console.log('✅ Email campaign created successfully:', campaign.id);

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Email campaign created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating email campaign:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
