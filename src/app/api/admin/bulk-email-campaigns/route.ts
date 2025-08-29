import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Fetch all bulk email campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('bulk_email_campaigns')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data: campaigns, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching bulk campaigns:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch campaigns',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error in bulk campaigns API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new bulk email campaign
export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      subject, 
      template_type = 'welcome',
      scheduled_at = null 
    } = await request.json();

    if (!name || !subject) {
      return NextResponse.json({
        success: false,
        error: 'Campaign name and subject are required'
      }, { status: 400 });
    }

    // Get total active leads count
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('id, email, first_name, last_name, full_name')
      .eq('status', 'active');

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch leads',
        details: leadsError.message
      }, { status: 500 });
    }

    const totalRecipients = leads?.length || 0;

    const newCampaign = {
      name,
      subject,
      template_type,
      status: 'draft',
      total_recipients: totalRecipients,
      scheduled_at: scheduled_at ? new Date(scheduled_at).toISOString() : null
    };

    const { data: campaign, error } = await supabaseAdmin
      .from('bulk_email_campaigns')
      .insert([newCampaign])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error creating campaign:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create campaign',
        details: error.message
      }, { status: 500 });
    }

    // Create recipient records for all active leads
    if (leads && leads.length > 0) {
      const recipients = leads.map(lead => ({
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
        .insert(recipients);

      if (recipientsError) {
        console.error('❌ Error creating recipients:', recipientsError);
        // Don't fail the campaign creation, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk email campaign created successfully',
      campaign: {
        ...campaign,
        total_recipients: totalRecipients,
        leads_count: leads?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Error in bulk campaigns API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update bulk email campaign
export async function PUT(request: NextRequest) {
  try {
    const { 
      id, 
      name, 
      subject, 
      template_type, 
      status, 
      scheduled_at,
      total_recipients,
      sent_count,
      open_count,
      click_count
    } = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Campaign ID is required'
      }, { status: 400 });
    }

    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (subject) updateData.subject = subject;
    if (template_type) updateData.template_type = template_type;
    if (status) updateData.status = status;
    if (scheduled_at) updateData.scheduled_at = new Date(scheduled_at).toISOString();
    if (total_recipients !== undefined) updateData.total_recipients = total_recipients;
    if (sent_count !== undefined) updateData.sent_count = sent_count;
    if (open_count !== undefined) updateData.open_count = open_count;
    if (click_count !== undefined) updateData.click_count = click_count;
    
    updateData.updated_at = new Date().toISOString();

    const { data: campaign, error } = await supabaseAdmin
      .from('bulk_email_campaigns')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error updating campaign:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update campaign',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign updated successfully',
      campaign
    });

  } catch (error) {
    console.error('❌ Error in bulk campaigns API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete bulk email campaign
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Campaign ID is required'
      }, { status: 400 });
    }

    // Delete recipients first
    await supabaseAdmin
      .from('bulk_email_recipients')
      .delete()
      .eq('campaign_id', id);

    // Delete campaign
    const { error } = await supabaseAdmin
      .from('bulk_email_campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting campaign:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete campaign',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in bulk campaigns API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
