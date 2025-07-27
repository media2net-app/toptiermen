import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching social feed reports from database...');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('social_feed_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data: reports, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching social feed reports:', error);
      return NextResponse.json({ error: `Failed to fetch reports: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Social feed reports fetched successfully:', reports?.length || 0, 'reports');
    return NextResponse.json({ success: true, reports: reports || [] });

  } catch (error) {
    console.error('❌ Error in social feed reports API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating new social feed report...');
    
    const body = await request.json();
    const { post_id, reporter_id, reason, description, priority } = body;

    if (!post_id || !reporter_id || !reason) {
      return NextResponse.json({ error: 'Post ID, reporter ID, and reason are required' }, { status: 400 });
    }

    const { data: report, error } = await supabaseAdmin
      .from('social_feed_reports')
      .insert({
        post_id,
        reporter_id,
        reason,
        description,
        priority: priority || 'medium'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating social feed report:', error);
      return NextResponse.json({ error: `Failed to create report: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Social feed report created successfully:', report.id);
    return NextResponse.json({ success: true, report });

  } catch (error) {
    console.error('❌ Error in social feed reports POST API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
} 