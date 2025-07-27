import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    console.log('🚨 Fetching forum reports from database...');

    const { data: reports, error } = await supabaseAdmin
      .from('forum_reports')
      .select(`
        *,
        post:forum_posts(title, content, author_id),
        reporter:users!forum_reports_reporter_id_fkey(email, profiles(first_name, last_name)),
        moderator:users!forum_reports_moderator_id_fkey(email, profiles(first_name, last_name))
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching forum reports:', error);
      return NextResponse.json({ error: 'Failed to fetch forum reports' }, { status: 500 });
    }

    // Transform the data to match the frontend interface
    const transformedReports = reports?.map(report => ({
      id: report.id,
      postId: report.post_id,
      postTitle: report.post?.title || 'Onbekende post',
      postContent: report.post?.content || '',
      reporterId: report.reporter_id,
      reporterName: report.reporter?.profiles?.first_name 
        ? `${report.reporter.profiles.first_name} ${report.reporter.profiles.last_name}`
        : report.reporter?.email || 'Onbekend',
      reason: report.reason,
      description: report.description,
      status: report.status,
      moderatorId: report.moderator_id,
      moderatorName: report.moderator?.profiles?.first_name 
        ? `${report.moderator.profiles.first_name} ${report.moderator.profiles.last_name}`
        : report.moderator?.email || 'Onbekend',
      moderatorNotes: report.moderator_notes,
      resolution: report.resolution,
      createdAt: report.created_at,
      updatedAt: report.updated_at,
      resolvedAt: report.resolved_at
    })) || [];

    console.log(`✅ Fetched ${transformedReports.length} forum reports`);

    return NextResponse.json({
      success: true,
      reports: transformedReports
    });

  } catch (error) {
    console.error('Error fetching forum reports:', error);
    return NextResponse.json({
      error: 'Failed to fetch forum reports'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🚨 Creating new forum report:', body);

    const { data: report, error } = await supabaseAdmin
      .from('forum_reports')
      .insert({
        post_id: body.postId,
        reporter_id: body.reporterId,
        reason: body.reason,
        description: body.description,
        status: body.status || 'pending'
      })
      .select(`
        *,
        post:forum_posts(title, content, author_id),
        reporter:users!forum_reports_reporter_id_fkey(email, profiles(first_name, last_name))
      `)
      .single();

    if (error) {
      console.error('Error creating forum report:', error);
      return NextResponse.json({ error: 'Failed to create forum report' }, { status: 500 });
    }

    // Transform the response
    const transformedReport = {
      id: report.id,
      postId: report.post_id,
      postTitle: report.post?.title || 'Onbekende post',
      postContent: report.post?.content || '',
      reporterId: report.reporter_id,
      reporterName: report.reporter?.profiles?.first_name 
        ? `${report.reporter.profiles.first_name} ${report.reporter.profiles.last_name}`
        : report.reporter?.email || 'Onbekend',
      reason: report.reason,
      description: report.description,
      status: report.status,
      moderatorId: report.moderator_id,
      moderatorName: null,
      moderatorNotes: report.moderator_notes,
      resolution: report.resolution,
      createdAt: report.created_at,
      updatedAt: report.updated_at,
      resolvedAt: report.resolved_at
    };

    return NextResponse.json({
      success: true,
      report: transformedReport
    });

  } catch (error) {
    console.error('Error creating forum report:', error);
    return NextResponse.json({
      error: 'Failed to create forum report'
    }, { status: 500 });
  }
} 