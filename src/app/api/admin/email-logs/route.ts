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
      // Table doesn't exist, return sample data for demonstration
      console.log('⚠️ Email_logs table does not exist yet, returning sample data');
      
      const sampleLogs = [
        {
          id: 'sample-1',
          user_id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
          to_email: 'chiel@media2net.nl',
          email_type: 'welcome',
          subject: 'Welkom bij Top Tier Men!',
          status: 'sent',
          provider: 'resend',
          message_id: 'msg_sample_001',
          template_id: 'welcome_template',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          profiles: {
            id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
            full_name: 'Chiel',
            username: 'chiel',
            email: 'chiel@media2net.nl',
            role: 'admin'
          }
        },
        {
          id: 'sample-2',
          user_id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
          to_email: 'chiel@media2net.nl',
          email_type: 'password_reset',
          subject: 'Wachtwoord Reset - Top Tier Men',
          status: 'sent',
          provider: 'resend',
          message_id: 'msg_sample_002',
          template_id: 'password_reset_template',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          profiles: {
            id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
            full_name: 'Chiel',
            username: 'chiel',
            email: 'chiel@media2net.nl',
            role: 'admin'
          }
        },
        {
          id: 'sample-3',
          user_id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
          to_email: 'chiel@media2net.nl',
          email_type: 'login_notification',
          subject: 'Nieuwe Login Detectie',
          status: 'delivered',
          provider: 'resend',
          message_id: 'msg_sample_003',
          template_id: 'login_notification_template',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          profiles: {
            id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
            full_name: 'Chiel',
            username: 'chiel',
            email: 'chiel@media2net.nl',
            role: 'admin'
          }
        },
        {
          id: 'sample-4',
          user_id: null,
          to_email: 'test@example.com',
          email_type: 'welcome',
          subject: 'Welkom bij Top Tier Men!',
          status: 'failed',
          provider: 'resend',
          message_id: 'msg_sample_004',
          template_id: 'welcome_template',
          error_message: 'Invalid email address',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          profiles: null
        },
        {
          id: 'sample-5',
          user_id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
          to_email: 'chiel@media2net.nl',
          email_type: 'newsletter',
          subject: 'Top Tier Men Weekly Update',
          status: 'pending',
          provider: 'resend',
          message_id: 'msg_sample_005',
          template_id: 'newsletter_template',
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          profiles: {
            id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
            full_name: 'Chiel',
            username: 'chiel',
            email: 'chiel@media2net.nl',
            role: 'admin'
          }
        }
      ];
      
      return NextResponse.json({
        success: true,
        logs: sampleLogs,
        stats: {
          total: 5,
          sent: 2,
          failed: 1,
          success_rate: 60
        },
        message: 'Email logs table not created yet. Showing sample data. Please create the email_logs table in Supabase dashboard to see real data.',
        isSampleData: true
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
