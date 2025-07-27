import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    console.log('📊 Fetching forum moderation statistics...');

    // Get total reports
    const { count: totalReports, error: totalError } = await supabaseAdmin
      .from('forum_reports')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error fetching total reports:', totalError);
      return NextResponse.json({ error: 'Failed to fetch forum stats' }, { status: 500 });
    }

    // Get pending reports
    const { count: pendingReports, error: pendingError } = await supabaseAdmin
      .from('forum_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) {
      console.error('Error fetching pending reports:', pendingError);
      return NextResponse.json({ error: 'Failed to fetch forum stats' }, { status: 500 });
    }

    // Get investigating reports
    const { count: investigatingReports, error: investigatingError } = await supabaseAdmin
      .from('forum_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'investigating');

    if (investigatingError) {
      console.error('Error fetching investigating reports:', investigatingError);
      return NextResponse.json({ error: 'Failed to fetch forum stats' }, { status: 500 });
    }

    // Get resolved reports
    const { count: resolvedReports, error: resolvedError } = await supabaseAdmin
      .from('forum_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved');

    if (resolvedError) {
      console.error('Error fetching resolved reports:', resolvedError);
      return NextResponse.json({ error: 'Failed to fetch forum stats' }, { status: 500 });
    }

    // Get dismissed reports
    const { count: dismissedReports, error: dismissedError } = await supabaseAdmin
      .from('forum_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'dismissed');

    if (dismissedError) {
      console.error('Error fetching dismissed reports:', dismissedError);
      return NextResponse.json({ error: 'Failed to fetch forum stats' }, { status: 500 });
    }

    // Get total moderation logs
    const { count: totalLogs, error: logsError } = await supabaseAdmin
      .from('forum_moderation_logs')
      .select('*', { count: 'exact', head: true });

    if (logsError) {
      console.error('Error fetching total logs:', logsError);
      // Don't fail completely, just set to 0
    }

    // Get total post flags
    const { count: totalFlags, error: flagsError } = await supabaseAdmin
      .from('forum_post_flags')
      .select('*', { count: 'exact', head: true });

    if (flagsError) {
      console.error('Error fetching total flags:', flagsError);
      // Don't fail completely, just set to 0
    }

    // Get recent reports (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentReports, error: recentError } = await supabaseAdmin
      .from('forum_reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    if (recentError) {
      console.error('Error fetching recent reports:', recentError);
      // Don't fail completely, just set to 0
    }

    // Get reports by reason
    const { data: reportsByReason, error: reasonError } = await supabaseAdmin
      .from('forum_reports')
      .select('reason')
      .eq('status', 'pending');

    if (reasonError) {
      console.error('Error fetching reports by reason:', reasonError);
    }

    const reasonCounts = reportsByReason?.reduce((acc, report) => {
      acc[report.reason] = (acc[report.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const stats = {
      totalReports: totalReports || 0,
      pendingReports: pendingReports || 0,
      investigatingReports: investigatingReports || 0,
      resolvedReports: resolvedReports || 0,
      dismissedReports: dismissedReports || 0,
      totalLogs: totalLogs || 0,
      totalFlags: totalFlags || 0,
      recentReports: recentReports || 0,
      reportsByReason: reasonCounts
    };

    console.log('📊 Forum moderation stats calculated:', stats);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching forum moderation stats:', error);
    return NextResponse.json({
      error: 'Failed to fetch forum moderation stats'
    }, { status: 500 });
  }
} 