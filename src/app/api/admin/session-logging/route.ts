import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  // Session logging disabled to prevent infinite loops
  return NextResponse.json({ success: true, message: 'Session logging disabled' });
  
  try {
    const body = await request.json();
    
    console.log('🔍 Session logging API called with:', body);
    
    // Handle setup tables action
    if (body.action === 'setup_tables') {
      try {
        console.log('🔧 Setting up session monitoring tables...');
        
        // Try to create tables by attempting to insert a test record
        // This will create the table if it doesn't exist (with proper error handling)
        const testSessionData = {
          user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
          user_email: 'test@setup.com',
          user_type: 'test',
          session_start: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          page_visits: 0,
          cache_hits: 0,
          cache_misses: 0,
          loop_detections: 0,
          error_count: 0,
          status: 'active',
          current_page: '/setup',
          user_agent: 'Setup Agent',
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Try to insert into session logs table
        const { error: sessionError } = await supabase
          .from('user_session_logs')
          .insert(testSessionData);

        if (sessionError) {
          console.log('⚠️ Session logs table may not exist or have different schema:', sessionError.message);
        } else {
          console.log('✅ Session logs table exists and is accessible');
          // Clean up test record
          await supabase
            .from('user_session_logs')
            .delete()
            .eq('user_email', 'test@setup.com');
        }

        // Try to insert into user activities table
        const testActivityData = {
          user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
          user_email: 'test@setup.com',
          user_type: 'test',
          action_type: 'page_load',
          current_page: '/setup',
          previous_page: null,
          error_message: null,
          error_stack: null,
          load_time_ms: 0,
          cache_hit: false,
          loop_detected: false,
          user_agent: 'Setup Agent',
          ip_address: '127.0.0.1',
          status: 'success',
          details: { setup: true },
          created_at: new Date().toISOString()
        };

        const { error: activityError } = await supabase
          .from('user_activities')
          .insert(testActivityData);

        if (activityError) {
          console.log('⚠️ User activities table may not exist or have different schema:', activityError.message);
        } else {
          console.log('✅ User activities table exists and is accessible');
          // Clean up test record
          await supabase
            .from('user_activities')
            .delete()
            .eq('user_email', 'test@setup.com');
        }

        return NextResponse.json({
          success: true,
          message: 'Session monitoring tables checked successfully',
          sessionTableExists: !sessionError,
          activityTableExists: !activityError,
          sessionError: sessionError?.message,
          activityError: activityError?.message
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
    
    // Validate required fields
    if (!user_id || !user_email) {
      console.log('⚠️ Missing required fields for session logging');
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: user_id and user_email are required'
      }, { status: 400 });
    }

    // Check if user has an existing session log
    let existingLog = null;
    try {
      const { data, error } = await supabase
        .from('user_session_logs')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.log('⚠️ Error fetching existing session log:', error.message);
        // Continue without existing log
      } else {
        existingLog = data;
      }
    } catch (error) {
      console.log('⚠️ Exception fetching existing session log:', error);
      // Continue without existing log
    }

    const now = new Date().toISOString();
    let status = 'normal';
    let loop_detections = 0;
    let error_count = 0;
    let page_visits = 1;
    let cache_hits = 0;
    let cache_misses = 0;

    if (existingLog) {
      // Update existing session
      loop_detections = (existingLog as any).loop_detections + (loop_detected ? 1 : 0);
      error_count = (existingLog as any).error_count + (error_message ? 1 : 0);
      page_visits = (existingLog as any).page_visits + 1;
      cache_hits = (existingLog as any).cache_hits + (cache_hit ? 1 : 0);
      cache_misses = (existingLog as any).cache_misses + (!cache_hit ? 1 : 0);

      // Determine status based on activity
      if (loop_detections > 5) {
        status = 'stuck';
      } else if (error_count > 3) {
        status = 'error';
      } else if (action_type === 'page_load') {
        status = 'active';
      }

      // Update existing log
      try {
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
          .eq('id', (existingLog as any).id);

        if (updateError) {
          console.log('⚠️ Error updating session log:', updateError.message);
          // If table doesn't exist, don't fail completely
          if (updateError.message.includes('relation') && updateError.message.includes('does not exist')) {
            console.log('⚠️ Session logs table does not exist, skipping update');
          }
        }
      } catch (error) {
        console.log('⚠️ Exception updating session log:', error);
      }
    } else {
      // Create new session log
      try {
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
          console.log('⚠️ Error creating session log:', insertError.message);
          // If table doesn't exist, don't fail completely
          if (insertError.message.includes('relation') && insertError.message.includes('does not exist')) {
            console.log('⚠️ Session logs table does not exist, skipping insert');
          }
        }
      } catch (error) {
        console.log('⚠️ Exception creating session log:', error);
      }
    }

    // Insert activity record for this specific action
    try {
      const { error: insertActivityError } = await supabase
        .from('user_activities')
        .insert({
          user_id,
          user_email,
          user_type: user_type || 'user',
          action_type: action_type || 'page_load',
          current_page,
          previous_page: (existingLog as any)?.current_page,
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
            session_duration: existingLog ? Math.floor((new Date().getTime() - new Date((existingLog as any).created_at).getTime()) / 1000) : 0
          },
          created_at: now
        });

      if (insertActivityError) {
        console.log('⚠️ Error creating user activity:', insertActivityError.message);
        // If table doesn't exist, don't fail completely
        if (insertActivityError.message.includes('relation') && insertActivityError.message.includes('does not exist')) {
          console.log('⚠️ User activities table does not exist, skipping insert');
        }
      }
    } catch (error) {
      console.log('⚠️ Exception creating user activity:', error);
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
  // Session logging disabled to prevent infinite loops
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
    message: 'Session logging disabled' 
  });
  
  try {
    console.log('🔍 Session logging GET request');
    
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('user_type');
    const userId = searchParams.get('user_id');

    // Try to fetch data directly - if tables don't exist, return empty data
    console.log('📋 Attempting to fetch session data...');

    let sessionLogs: any[] = [];
    try {
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

      const { data, error: sessionError } = await query.limit(100);

      if (sessionError) {
        console.log('⚠️ Error fetching session logs:', sessionError.message);
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
        // Continue with empty data
      } else {
        sessionLogs = data || [];
      }
    } catch (error) {
      console.log('⚠️ Exception fetching session logs:', error);
      // Continue with empty data
    }

    // Get user activities with same filters
    let userActivities: any[] = [];
    try {
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

      const { data, error: activityError } = await activityQuery;

      if (activityError) {
        console.log('⚠️ Error fetching user activities:', activityError.message);
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
        // Continue with empty data
      } else {
        userActivities = data || [];
      }
    } catch (error) {
      console.log('⚠️ Exception fetching user activities:', error);
      // Continue with empty data
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
