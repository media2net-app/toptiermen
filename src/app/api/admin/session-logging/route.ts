import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      user_email,
      current_page,
      user_agent,
      ip_address,
      action_type,
      error_message,
      cache_hit,
      loop_detected
    } = body;

    // Get user's IP address if not provided
    const clientIP = ip_address || request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 'unknown';

    // Check if user has an existing session log
    const { data: existingLog } = await supabase
      .from('user_session_logs')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const now = new Date().toISOString();
    let status = 'normal';
    let loop_detections = 0;
    let error_count = 0;
    let page_visits = 1;
    let cache_hits = 0;
    let cache_misses = 0;

    if (existingLog) {
      // Update existing session
      loop_detections = existingLog.loop_detections + (loop_detected ? 1 : 0);
      error_count = existingLog.error_count + (error_message ? 1 : 0);
      page_visits = existingLog.page_visits + 1;
      cache_hits = existingLog.cache_hits + (cache_hit ? 1 : 0);
      cache_misses = existingLog.cache_misses + (!cache_hit ? 1 : 0);

      // Determine status based on activity
      if (loop_detections > 5) {
        status = 'stuck';
      } else if (error_count > 3) {
        status = 'error';
      } else if (action_type === 'page_load') {
        status = 'active';
      }

      // Update existing log
      const { error: updateError } = await supabase
        .from('user_session_logs')
        .update({
          last_activity: now,
          page_visits,
          cache_hits,
          cache_misses,
          loop_detections,
          error_count,
          status,
          current_page,
          user_agent,
          ip_address: clientIP,
          updated_at: now
        })
        .eq('id', existingLog.id);

      if (updateError) {
        console.error('Error updating session log:', updateError);
      }
    } else {
      // Create new session log
      const { error: insertError } = await supabase
        .from('user_session_logs')
        .insert({
          user_id,
          user_email,
          session_start: now,
          last_activity: now,
          page_visits: 1,
          cache_hits: cache_hit ? 1 : 0,
          cache_misses: cache_hit ? 0 : 1,
          loop_detections: loop_detected ? 1 : 0,
          error_count: error_message ? 1 : 0,
          status: 'active',
          current_page,
          user_agent,
          ip_address: clientIP,
          created_at: now,
          updated_at: now
        });

      if (insertError) {
        console.error('Error creating session log:', insertError);
      }
    }

    // Update user activities table
    const { data: existingActivity } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (existingActivity) {
      // Update existing activity
      const sessionDuration = Math.floor((new Date().getTime() - new Date(existingActivity.created_at).getTime()) / 1000);
      
      const { error: updateActivityError } = await supabase
        .from('user_activities')
        .update({
          last_seen: now,
          session_duration: sessionDuration,
          page_count: existingActivity.page_count + 1,
          status: loop_detections > 5 ? 'stuck' : 'online',
          current_location: current_page,
          updated_at: now
        })
        .eq('id', existingActivity.id);

      if (updateActivityError) {
        console.error('Error updating user activity:', updateActivityError);
      }
    } else {
      // Create new activity record
      const { error: insertActivityError } = await supabase
        .from('user_activities')
        .insert({
          user_id,
          email: user_email,
          last_seen: now,
          session_duration: 0,
          page_count: 1,
          status: 'online',
          current_location: current_page,
          created_at: now,
          updated_at: now
        });

      if (insertActivityError) {
        console.error('Error creating user activity:', insertActivityError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Session logged successfully',
      status,
      loop_detections,
      error_count
    });

  } catch (error) {
    console.error('Error logging session:', error);
    return NextResponse.json(
      { error: 'Failed to log session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get recent session logs
    const { data: sessionLogs, error: sessionError } = await supabase
      .from('user_session_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (sessionError) {
      throw sessionError;
    }

    // Get user activities
    const { data: userActivities, error: activityError } = await supabase
      .from('user_activities')
      .select('*')
      .order('last_seen', { ascending: false });

    if (activityError) {
      throw activityError;
    }

    // Calculate statistics
    const stuckSessions = sessionLogs?.filter(log => log.status === 'stuck') || [];
    const errorSessions = sessionLogs?.filter(log => log.status === 'error') || [];
    const activeUsers = userActivities?.filter(activity => activity.status === 'online') || [];

    return NextResponse.json({
      success: true,
      data: {
        sessionLogs: sessionLogs || [],
        userActivities: userActivities || [],
        statistics: {
          totalSessions: sessionLogs?.length || 0,
          stuckSessions: stuckSessions.length,
          errorSessions: errorSessions.length,
          activeUsers: activeUsers.length,
          totalErrors: sessionLogs?.reduce((sum, log) => sum + log.error_count, 0) || 0,
          totalLoops: sessionLogs?.reduce((sum, log) => sum + log.loop_detections, 0) || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching session data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session data' },
      { status: 500 }
    );
  }
}
