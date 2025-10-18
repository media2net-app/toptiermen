import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching login sessions data...');

    // Query to get user login sessions with profile information
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_session_logs')
      .select(`
        id,
        user_id,
        user_email,
        user_type,
        session_start,
        last_activity,
        page_visits,
        status,
        current_page,
        user_agent,
        ip_address,
        created_at,
        updated_at
      `)
      .order('last_activity', { ascending: false });

    if (sessionError) {
      console.error('❌ Error fetching session data:', sessionError);
      return NextResponse.json({ 
        error: 'Failed to fetch session data',
        details: sessionError.message 
      }, { status: 500 });
    }

    // Get user profiles for additional information
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        role,
        subscription_tier,
        created_at
      `);

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
      // Continue without profiles, we'll use what we have
    }

    // Create a map of user profiles for quick lookup
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }

    // Combine session data with profile information
    const combinedData = sessionData?.map(session => {
      const profile = profileMap.get(session.user_id);
      
      // Calculate time since last activity
      const lastActivity = new Date(session.last_activity);
      const now = new Date();
      const timeDiff = now.getTime() - lastActivity.getTime();
      const daysSinceLastActivity = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursSinceLastActivity = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesSinceLastActivity = Math.floor(timeDiff / (1000 * 60));

      // Format last activity time
      let lastActivityFormatted = '';
      if (daysSinceLastActivity > 0) {
        lastActivityFormatted = `${daysSinceLastActivity}d geleden`;
      } else if (hoursSinceLastActivity > 0) {
        lastActivityFormatted = `${hoursSinceLastActivity}u geleden`;
      } else if (minutesSinceLastActivity > 0) {
        lastActivityFormatted = `${minutesSinceLastActivity}m geleden`;
      } else {
        lastActivityFormatted = 'Nu actief';
      }

      // Get session duration
      const sessionStart = new Date(session.session_start);
      const sessionDuration = Math.floor((lastActivity.getTime() - sessionStart.getTime()) / (1000 * 60)); // in minutes

      return {
        id: session.id,
        userId: session.user_id,
        email: session.user_email,
        fullName: profile?.full_name || null,
        userType: session.user_type,
        role: profile?.role || 'user',
        subscriptionTier: profile?.subscription_tier || 'free',
        sessionStart: session.session_start,
        lastActivity: session.last_activity,
        lastActivityFormatted,
        sessionDuration,
        pageVisits: session.page_visits,
        status: session.status,
        currentPage: session.current_page,
        userAgent: session.user_agent,
        ipAddress: session.ip_address,
        accountAge: profile ? Math.floor((now.getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : null,
        isActive: session.status === 'active',
        isOnline: daysSinceLastActivity === 0 && hoursSinceLastActivity < 1
      };
    }) || [];

    // Sort by last activity (most recent first)
    combinedData.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

    console.log(`✅ Returning ${combinedData.length} login sessions`);

    return NextResponse.json({
      success: true,
      rows: combinedData,
      total: combinedData.length,
      activeSessions: combinedData.filter(s => s.isActive).length,
      onlineUsers: combinedData.filter(s => s.isOnline).length
    });

  } catch (error) {
    console.error('❌ Error in login sessions API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
