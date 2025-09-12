import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || '2024-09-10';
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('📊 Fetching login logs:', { startDate, endDate, limit, offset });

    // First, let's check if the login_logs table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('login_logs')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      // Table doesn't exist, return empty results for now
      console.log('⚠️ Login_logs table does not exist yet');
      return NextResponse.json({
        success: true,
        logs: [],
        stats: {
          total: 0,
          successful: 0,
          failed: 0,
          success_rate: 0
        },
        message: 'Login logs table not created yet. Please create it in Supabase dashboard.'
      });
    }

    // Fetch login logs with user profile information
    const { data: logs, error: logsError } = await supabase
      .from('login_logs')
      .select(`
        *,
        profiles!login_logs_user_id_fkey(
          id,
          full_name,
          first_name,
          last_name,
          username,
          email,
          role
        )
      `)
      .gte('created_at', `${startDate}T00:00:00.000Z`)
      .lte('created_at', `${endDate}T23:59:59.999Z`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (logsError) {
      console.error('❌ Error fetching login logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch login logs', details: logsError.message },
        { status: 500 }
      );
    }

    // Get statistics
    const { data: statsData, error: statsError } = await supabase
      .from('login_logs')
      .select('success')
      .gte('created_at', `${startDate}T00:00:00.000Z`)
      .lte('created_at', `${endDate}T23:59:59.999Z`);

    if (statsError) {
      console.error('❌ Error fetching login stats:', statsError);
    }

    const stats = {
      total: statsData?.length || 0,
      successful: statsData?.filter(log => log.success).length || 0,
      failed: statsData?.filter(log => !log.success).length || 0,
      success_rate: statsData?.length ? 
        Math.round((statsData.filter(log => log.success).length / statsData.length) * 100) : 0
    };

    console.log('✅ Login logs fetched successfully:', { count: logs?.length, stats });

    return NextResponse.json({
      success: true,
      logs: logs || [],
      stats,
      pagination: {
        limit,
        offset,
        hasMore: (logs?.length || 0) === limit
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      email, 
      success, 
      error_message, 
      ip_address, 
      user_agent, 
      session_id,
      login_method = 'email_password'
    } = body;

    console.log('📝 Logging login attempt:', { email, success, error_message });

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Insert login log
    const { data, error } = await supabase
      .from('login_logs')
      .insert([{
        user_id,
        email,
        success,
        error_message,
        ip_address,
        user_agent,
        session_id,
        login_method
      }])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error logging login attempt:', error);
      return NextResponse.json(
        { error: 'Failed to log login attempt', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Login attempt logged successfully:', data);

    return NextResponse.json({
      success: true,
      log: data
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
