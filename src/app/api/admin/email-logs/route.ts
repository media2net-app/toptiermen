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

    console.log('📧 Fetching email logs:', { startDate, endDate, limit, offset });

    // First, let's check if the email_logs table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('email_logs')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      // Table doesn't exist, return empty results for now
      console.log('⚠️ Email_logs table does not exist yet');
      return NextResponse.json({
        success: true,
        logs: [],
        stats: {
          total: 0,
          sent: 0,
          failed: 0,
          success_rate: 0
        },
        message: 'Email logs table not created yet. Please create it in Supabase dashboard.'
      });
    }

    // Fetch email logs first
    const { data: logs, error: logsError } = await supabase
      .from('email_logs')
      .select('*')
      .gte('created_at', `${startDate}T00:00:00.000Z`)
      .lte('created_at', `${endDate}T23:59:59.999Z`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (logsError) {
      console.error('❌ Error fetching email logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch email logs', details: logsError.message },
        { status: 500 }
      );
    }

    // Fetch user profiles for the logs
    const userIds = logs?.map(log => log.user_id).filter(Boolean) || [];
    let profiles: any = {};
    
    if (userIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name, username, email, role')
        .in('id', userIds);
      
      if (!profileError && profileData) {
        profiles = profileData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as any);
      }
    }

    // Add profile data to logs
    const logsWithProfiles = logs?.map(log => ({
      ...log,
      profiles: log.user_id ? profiles[log.user_id] : null
    })) || [];

    // Get statistics
    const { data: statsData, error: statsError } = await supabase
      .from('email_logs')
      .select('status')
      .gte('created_at', `${startDate}T00:00:00.000Z`)
      .lte('created_at', `${endDate}T23:59:59.999Z`);

    if (statsError) {
      console.error('❌ Error fetching email stats:', statsError);
    }

    const stats = {
      total: statsData?.length || 0,
      sent: statsData?.filter(log => log.status === 'sent').length || 0,
      failed: statsData?.filter(log => log.status === 'failed').length || 0,
      success_rate: statsData?.length ? 
        Math.round((statsData.filter(log => log.status === 'sent').length / statsData.length) * 100) : 0
    };

    console.log('✅ Email logs fetched successfully:', { count: logs?.length, stats });

    return NextResponse.json({
      success: true,
      logs: logsWithProfiles,
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
      to_email, 
      email_type, 
      subject, 
      status, 
      error_message, 
      provider,
      message_id,
      template_id
    } = body;

    console.log('📧 Logging email attempt:', { to_email, email_type, status });

    if (!to_email) {
      return NextResponse.json(
        { error: 'To email is required' },
        { status: 400 }
      );
    }

    // Insert email log
    const { data, error } = await supabase
      .from('email_logs')
      .insert([{
        user_id,
        to_email,
        email_type,
        subject,
        status,
        error_message,
        provider,
        message_id,
        template_id
      }])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error logging email attempt:', error);
      return NextResponse.json(
        { error: 'Failed to log email attempt', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Email attempt logged successfully:', data);

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
