import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Fetch recipients for a campaign
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    if (!campaignId) {
      return NextResponse.json({
        success: false,
        error: 'Campaign ID is required'
      }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('bulk_email_recipients')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data: recipients, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching recipients:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch recipients',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      recipients: recipients || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error in bulk recipients API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create recipient records for a campaign
export async function POST(request: NextRequest) {
  try {
    const { campaignId, recipients } = await request.json();

    if (!campaignId || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json({
        success: false,
        error: 'Campaign ID and recipients array are required'
      }, { status: 400 });
    }

    // Validate recipients data
    const validRecipients = recipients.map((recipient: any) => ({
      campaign_id: campaignId,
      lead_id: recipient.lead_id,
      email: recipient.email,
      first_name: recipient.first_name || '',
      last_name: recipient.last_name || '',
      full_name: recipient.full_name || `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim(),
      status: 'pending'
    }));

    const { data: createdRecipients, error } = await supabaseAdmin
      .from('bulk_email_recipients')
      .insert(validRecipients)
      .select('*');

    if (error) {
      console.error('❌ Error creating recipients:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create recipients',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${createdRecipients?.length || 0} recipients created`,
      recipients: createdRecipients
    });

  } catch (error) {
    console.error('❌ Error in bulk recipients API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update recipient status
export async function PUT(request: NextRequest) {
  try {
    const { id, status, sent_at, delivered_at, opened_at, clicked_at, bounce_reason } = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Recipient ID is required'
      }, { status: 400 });
    }

    const updateData: any = {};
    
    if (status) updateData.status = status;
    if (sent_at) updateData.sent_at = sent_at;
    if (delivered_at) updateData.delivered_at = delivered_at;
    if (opened_at) updateData.opened_at = opened_at;
    if (clicked_at) updateData.clicked_at = clicked_at;
    if (bounce_reason) updateData.bounce_reason = bounce_reason;
    
    updateData.updated_at = new Date().toISOString();

    const { data: recipient, error } = await supabaseAdmin
      .from('bulk_email_recipients')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error updating recipient:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update recipient',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Recipient updated successfully',
      recipient
    });

  } catch (error) {
    console.error('❌ Error in bulk recipients API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete recipient
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Recipient ID is required'
      }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('bulk_email_recipients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting recipient:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete recipient',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Recipient deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in bulk recipients API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
