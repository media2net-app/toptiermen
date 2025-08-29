import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Creating friends test email campaign...');

    // Create the test campaign
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('bulk_email_campaigns')
      .insert({
        name: 'Friends Test - Aanhef & Tracking Test',
        subject: '🎯 Test Email - Top Tier Men Aanhef & Tracking',
        template_type: 'welcome',
        status: 'draft',
        total_recipients: 0
      })
      .select()
      .single();

    if (campaignError) {
      console.error('❌ Error creating campaign:', campaignError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create campaign',
        details: campaignError.message
      }, { status: 500 });
    }

    console.log('✅ Friends test campaign created:', campaign.id);

    // Get specific leads
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('id, email, first_name, last_name, full_name')
      .in('email', ['fvanhouten1986@gmail.com', 'info@vdweide-enterprise.com'])
      .eq('status', 'active');

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch leads',
        details: leadsError.message
      }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      console.log('⚠️ No matching leads found');
      return NextResponse.json({
        success: false,
        error: 'No matching leads found for the specified emails'
      }, { status: 400 });
    }

    console.log(`📧 Found ${leads.length} leads for friends test`);

    // Create recipient records for the specific leads
    const recipientRecords = leads.map(lead => ({
      campaign_id: campaign.id,
      lead_id: lead.id,
      email: lead.email,
      first_name: lead.first_name,
      last_name: lead.last_name,
      full_name: lead.full_name,
      status: 'pending'
    }));

    const { error: recipientsError } = await supabaseAdmin
      .from('bulk_email_recipients')
      .insert(recipientRecords);

    if (recipientsError) {
      console.error('❌ Error creating recipient records:', recipientsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create recipient records',
        details: recipientsError.message
      }, { status: 500 });
    }

    // Update campaign with total recipients
    await supabaseAdmin
      .from('bulk_email_campaigns')
      .update({
        total_recipients: leads.length
      })
      .eq('id', campaign.id);

    console.log(`✅ Created ${leads.length} recipient records for friends test campaign`);

    return NextResponse.json({
      success: true,
      message: 'Friends test campaign created successfully',
      campaign: {
        ...campaign,
        total_recipients: leads.length
      },
      recipients: leads.length,
      leads: leads.map(lead => ({
        email: lead.email,
        name: lead.full_name || `${lead.first_name} ${lead.last_name}`.trim(),
        first_name: lead.first_name,
        last_name: lead.last_name,
        full_name: lead.full_name
      }))
    });

  } catch (error) {
    console.error('❌ Error in create friends test campaign:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
