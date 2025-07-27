import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    console.log('📝 Fetching forum moderation logs from database...');

    const { data: logs, error } = await supabaseAdmin
      .from('forum_moderation_logs')
      .select(`
        *,
        moderator:users(email, profiles(first_name, last_name))
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching forum moderation logs:', error);
      return NextResponse.json({ error: 'Failed to fetch forum moderation logs' }, { status: 500 });
    }

    // Transform the data to match the frontend interface
    const transformedLogs = logs?.map(log => ({
      id: log.id,
      moderatorId: log.moderator_id,
      moderatorName: log.moderator?.profiles?.first_name 
        ? `${log.moderator.profiles.first_name} ${log.moderator.profiles.last_name}`
        : log.moderator?.email || 'Onbekend',
      action: log.action,
      targetType: log.target_type,
      targetId: log.target_id,
      details: log.details,
      createdAt: log.created_at
    })) || [];

    console.log(`✅ Fetched ${transformedLogs.length} forum moderation logs`);

    return NextResponse.json({
      success: true,
      logs: transformedLogs
    });

  } catch (error) {
    console.error('Error fetching forum moderation logs:', error);
    return NextResponse.json({
      error: 'Failed to fetch forum moderation logs'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📝 Creating new forum moderation log:', body);

    const { data: log, error } = await supabaseAdmin
      .from('forum_moderation_logs')
      .insert({
        moderator_id: body.moderatorId,
        action: body.action,
        target_type: body.targetType,
        target_id: body.targetId,
        details: body.details
      })
      .select(`
        *,
        moderator:users(email, profiles(first_name, last_name))
      `)
      .single();

    if (error) {
      console.error('Error creating forum moderation log:', error);
      return NextResponse.json({ error: 'Failed to create forum moderation log' }, { status: 500 });
    }

    // Transform the response
    const transformedLog = {
      id: log.id,
      moderatorId: log.moderator_id,
      moderatorName: log.moderator?.profiles?.first_name 
        ? `${log.moderator.profiles.first_name} ${log.moderator.profiles.last_name}`
        : log.moderator?.email || 'Onbekend',
      action: log.action,
      targetType: log.target_type,
      targetId: log.target_id,
      details: log.details,
      createdAt: log.created_at
    };

    return NextResponse.json({
      success: true,
      log: transformedLog
    });

  } catch (error) {
    console.error('Error creating forum moderation log:', error);
    return NextResponse.json({
      error: 'Failed to create forum moderation log'
    }, { status: 500 });
  }
} 