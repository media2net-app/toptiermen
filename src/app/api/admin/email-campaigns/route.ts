import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📧 Fetching email campaigns from database...');

    const { data: campaigns, error: campaignsError } = await supabaseAdmin
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('❌ Error fetching email campaigns:', campaignsError);
      return NextResponse.json({ 
        error: 'Failed to fetch email campaigns' 
      }, { status: 500 });
    }

    console.log(`✅ Loaded ${campaigns?.length || 0} email campaigns`);

    return NextResponse.json({ 
      success: true, 
      campaigns: campaigns || [] 
    });

  } catch (error) {
    console.error('❌ Error in email campaigns GET:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subject, template_type = 'marketing', status = 'draft' } = body;

    if (!name || !subject) {
      return NextResponse.json({ 
        error: 'Name and subject are required' 
      }, { status: 400 });
    }

    console.log('📧 Creating new email campaign:', { name, subject, template_type, status });

    const { data: campaign, error: createError } = await supabaseAdmin
      .from('email_campaigns')
      .insert({
        name,
        subject,
        template_type,
        status,
        total_recipients: 0,
        sent_count: 0,
        open_count: 0,
        click_count: 0,
        bounce_count: 0,
        unsubscribe_count: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating email campaign:', createError);
      return NextResponse.json({ 
        error: 'Failed to create email campaign' 
      }, { status: 500 });
    }

    console.log('✅ Created email campaign:', campaign.id);

    return NextResponse.json({ 
      success: true, 
      campaign 
    });

  } catch (error) {
    console.error('❌ Error in email campaigns POST:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
