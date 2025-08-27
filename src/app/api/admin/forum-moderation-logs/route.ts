import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    console.log('📝 Fetching forum moderation logs from database...');

    const { data: logs, error } = await supabaseAdmin
      .from('forum_moderation_logs')
      .select(`
        *,
        moderator:users!forum_moderation_logs_moderator_id_fkey(email, profiles(first_name, last_name)),
        target_user:users!forum_moderation_logs_target_user_id_fkey(email, profiles(first_name, last_name))
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching forum moderation logs:', error);
      return NextResponse.json({ error: 'Failed to fetch forum moderation logs' }, { status: 500 });
    }

    // Transform the data to match the frontend interface
    const transformedLogs = logs?.map(log => ({
      id: log.id.toString(),
      moderatorName: log.moderator?.profiles?.first_name 
        ? `${log.moderator.profiles.first_name} ${log.moderator.profiles.last_name}`
        : log.moderator?.email || 'Onbekend',
      actionType: log.action_type,
      targetType: log.target_type,
      reason: log.reason,
      duration: log.duration,
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
        target_user_id: body.targetUserId,
        action_type: body.actionType,
        target_type: body.targetType,
        target_id: body.targetId,
        reason: body.reason,
        duration: body.duration
      })
      .select(`
        *,
        moderator:users!forum_moderation_logs_moderator_id_fkey(email, profiles(first_name, last_name)),
        target_user:users!forum_moderation_logs_target_user_id_fkey(email, profiles(first_name, last_name))
      `)
      .single();

    if (error) {
      console.error('Error creating forum moderation log:', error);
      return NextResponse.json({ error: 'Failed to create forum moderation log' }, { status: 500 });
    }

    // Transform the response
    const transformedLog = {
      id: log.id.toString(),
      moderatorName: log.moderator?.profiles?.first_name 
        ? `${log.moderator.profiles.first_name} ${log.moderator.profiles.last_name}`
        : log.moderator?.email || 'Onbekend',
      actionType: log.action_type,
      targetType: log.target_type,
      reason: log.reason,
      duration: log.duration,
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