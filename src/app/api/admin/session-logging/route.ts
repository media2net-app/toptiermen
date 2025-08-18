import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔍 Session logging API called with:', body);
    
    // Handle setup tables action
    if (body.action === 'setup_tables') {
      try {
        console.log('🔧 Setting up session monitoring tables...');
        
        // Create session logs table with enhanced structure
        const { error: sessionError } = await supabase.rpc('exec_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS user_session_logs (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
              user_email TEXT NOT NULL,
              user_type TEXT DEFAULT 'user' CHECK (user_type IN ('rick', 'chiel', 'test', 'admin', 'user')),
              session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              page_visits INTEGER DEFAULT 0,
              cache_hits INTEGER DEFAULT 0,
              cache_misses INTEGER DEFAULT 0,
              loop_detections INTEGER DEFAULT 0,
              error_count INTEGER DEFAULT 0,
              status TEXT DEFAULT 'active' CHECK (status IN ('active', 'idle', 'stuck', 'error', 'completed')),
              current_page TEXT,
              user_agent TEXT,
              ip_address TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });

        if (sessionError) {
          console.error('❌ Error creating session logs table:', sessionError);
        } else {
          console.log('✅ Session logs table created successfully');
        }

        // Create user activities table with enhanced structure
        const { error: activityError } = await supabase.rpc('exec_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS user_activities (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
              user_email TEXT NOT NULL,
              user_type TEXT DEFAULT 'user' CHECK (user_type IN ('rick', 'chiel', 'test', 'admin', 'user')),
              action_type TEXT NOT NULL CHECK (action_type IN ('page_load', 'navigation', 'error', 'loop_detected', 'cache_hit', 'cache_miss', 'login', 'logout', 'api_call', 'performance_issue', 'session_timeout', 'rick_issue', 'rick_critical')),
              current_page TEXT,
              previous_page TEXT,
              error_message TEXT,
              error_stack TEXT,
              load_time_ms INTEGER,
              cache_hit BOOLEAN DEFAULT FALSE,
              loop_detected BOOLEAN DEFAULT FALSE,
              user_agent TEXT,
              ip_address TEXT,
              status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'warning', 'critical')),
              details JSONB,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        });

        if (activityError) {
          console.error('❌ Error creating user activities table:', activityError);
        } else {
          console.log('✅ User activities table created successfully');
        }

        if (sessionError || activityError) {
          return NextResponse.json(
            { 
              error: 'Failed to create tables',
              sessionError: sessionError?.message,
              activityError: activityError?.message
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Session monitoring tables created successfully'
        });
      } catch (error) {
        console.error('❌ Error in setup_tables:', error);
        return NextResponse.json(
          { error: 'Failed to setup tables', details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    const {
      user_id,
      user_email,
      current_page,
      user_agent,
      ip_address,
      action_type,
      error_message,
      cache_hit,
      loop_detected,
      user_type
    } = body;

    // Get user's IP address if not provided
    const clientIP = ip_address || request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 'unknown';

    // Try to insert data directly - if tables don't exist, it will fail gracefully
    console.log('📋 Attempting to log session data...');

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
        // If table doesn't exist, don't fail completely
        if (updateError.message.includes('relation') && updateError.message.includes('does not exist')) {
          console.log('⚠️ Session logs table does not exist, skipping update');
        }
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
          user_type: user_type || 'user',
          created_at: now,
          updated_at: now
        });

      if (insertError) {
        console.error('Error creating session log:', insertError);
        // If table doesn't exist, don't fail completely
        if (insertError.message.includes('relation') && insertError.message.includes('does not exist')) {
          console.log('⚠️ Session logs table does not exist, skipping insert');
        }
      }
    }

    // Insert activity record for this specific action
    const { error: insertActivityError } = await supabase
      .from('user_activities')
      .insert({
        user_id,
        user_email,
        user_type: user_type || 'user',
        action_type: action_type || 'page_load',
        current_page,
        previous_page: existingLog?.current_page,
        error_message,
        error_stack: error_message ? new Error().stack : null,
        load_time_ms: null, // Will be calculated if needed
        cache_hit: cache_hit || false,
        loop_detected: loop_detected || false,
        user_agent,
        ip_address: clientIP,
        status: status === 'stuck' ? 'critical' : status === 'error' ? 'error' : 'success',
        details: {
          page_visits,
          cache_hits,
          cache_misses,
          loop_detections,
          error_count,
          session_duration: existingLog ? Math.floor((new Date().getTime() - new Date(existingLog.created_at).getTime()) / 1000) : 0
        },
        created_at: now
      });

    if (insertActivityError) {
      console.error('Error creating user activity:', insertActivityError);
      // If table doesn't exist, don't fail completely
      if (insertActivityError.message.includes('relation') && insertActivityError.message.includes('does not exist')) {
        console.log('⚠️ User activities table does not exist, skipping insert');
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

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Session logging GET request');
    
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('user_type');
    const userId = searchParams.get('user_id');

    // Try to fetch data directly - if tables don't exist, return empty data
    console.log('📋 Attempting to fetch session data...');

    let query = supabase
      .from('user_session_logs')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (userType && userType !== 'all') {
      query = query.eq('user_type', userType);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: sessionLogs, error: sessionError } = await query.limit(100);

    if (sessionError) {
      console.error('❌ Error fetching session logs:', sessionError);
      // If table doesn't exist, return empty data instead of throwing error
      if (sessionError.message.includes('relation') && sessionError.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          data: {
            sessionLogs: [],
            userActivities: [],
            statistics: {
              totalSessions: 0,
              stuckSessions: 0,
              errorSessions: 0,
              activeUsers: 0,
              totalErrors: 0,
              totalLoops: 0,
              byUserType: {
                rick: 0,
                chiel: 0,
                test: 0,
                admin: 0
              }
            }
          },
          message: 'Tables do not exist yet. Please create them first.'
        });
      }
      throw sessionError;
    }

    // Get user activities with same filters
    let activityQuery = supabase
      .from('user_activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (userType && userType !== 'all') {
      activityQuery = activityQuery.eq('user_type', userType);
    }
    if (userId) {
      activityQuery = activityQuery.eq('user_id', userId);
    }

    const { data: userActivities, error: activityError } = await activityQuery;

    if (activityError) {
      console.error('❌ Error fetching user activities:', activityError);
      // If table doesn't exist, return empty data instead of throwing error
      if (activityError.message.includes('relation') && activityError.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          data: {
            sessionLogs: sessionLogs || [],
            userActivities: [],
            statistics: {
              totalSessions: sessionLogs?.length || 0,
              stuckSessions: 0,
              errorSessions: 0,
              activeUsers: 0,
              totalErrors: 0,
              totalLoops: 0,
              byUserType: {
                rick: 0,
                chiel: 0,
                test: 0,
                admin: 0
              }
            }
          },
          message: 'User activities table does not exist yet.'
        });
      }
      throw activityError;
    }

    // Calculate statistics
    const stuckSessions = sessionLogs?.filter(log => log.status === 'stuck') || [];
    const errorSessions = sessionLogs?.filter(log => log.status === 'error') || [];
    const activeUsers = userActivities?.filter(activity => activity.status === 'success') || [];
    
    // User type specific statistics
    const rickSessions = sessionLogs?.filter(log => log.user_type === 'rick') || [];
    const chielSessions = sessionLogs?.filter(log => log.user_type === 'chiel') || [];
    const testSessions = sessionLogs?.filter(log => log.user_type === 'test') || [];

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
          totalLoops: sessionLogs?.reduce((sum, log) => sum + log.loop_detections, 0) || 0,
          byUserType: {
            rick: rickSessions.length,
            chiel: chielSessions.length,
            test: testSessions.length,
            admin: sessionLogs?.filter(log => log.user_type === 'admin').length || 0
          }
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
