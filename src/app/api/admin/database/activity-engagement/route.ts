import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/database/activity-engagement
// Returns activity and engagement data for all users
export async function GET(_req: NextRequest) {
  try {
    // 1) Fetch profiles with basic data
    const { data: profiles, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, main_goal, points, badges, posts, missions_completed, last_login, created_at')
      .order('email', { ascending: true });

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    const users = profiles || [];
    const userIds = users.map(u => u.id);

    // 2) Fetch user session logs
    let sessionLogsByUser: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const { data: sessionLogs, error: sessionErr } = await supabaseAdmin
        .from('user_session_logs')
        .select('user_id, user_email, session_start, last_activity, page_visits, status, current_page')
        .order('session_start', { ascending: false });
      if (sessionErr) {
        console.log('User session logs table not found, continuing without it');
      } else {
        for (const sl of (sessionLogs || [])) {
          if (!sessionLogsByUser[sl.user_id]) sessionLogsByUser[sl.user_id] = [];
          sessionLogsByUser[sl.user_id].push(sl);
        }
      }
    }

    // 3) Fetch user activities
    let activitiesByUser: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const { data: activities, error: actErr } = await supabaseAdmin
        .from('user_activities')
        .select('user_id, user_email, action_type, current_page, created_at, status')
        .order('created_at', { ascending: false });
      if (actErr) {
        console.log('User activities table not found, continuing without it');
      } else {
        for (const act of (activities || [])) {
          if (!activitiesByUser[act.user_id]) activitiesByUser[act.user_id] = [];
          activitiesByUser[act.user_id].push(act);
        }
      }
    }

    // 4) Fetch user missions
    let missionsByUser: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const { data: missions, error: missErr } = await supabaseAdmin
        .from('user_missions')
        .select('user_id, mission_id, completed, completed_at, points_earned')
        .order('completed_at', { ascending: false });
      if (missErr) {
        console.log('User missions table not found, continuing without it');
      } else {
        for (const miss of (missions || [])) {
          if (!missionsByUser[miss.user_id]) missionsByUser[miss.user_id] = [];
          missionsByUser[miss.user_id].push(miss);
        }
      }
    }

    const rows = users.map(u => {
      const userSessions = sessionLogsByUser[u.id] || [];
      const userActivities = activitiesByUser[u.id] || [];
      const userMissions = missionsByUser[u.id] || [];
      
      // Calculate engagement metrics
      const totalSessions = userSessions.length;
      const activeSessions = userSessions.filter(s => s.status === 'active').length;
      const totalPageVisits = userSessions.reduce((sum, s) => sum + (s.page_visits || 0), 0);
      
      // Calculate activity metrics
      const totalActivities = userActivities.length;
      const recentActivities = userActivities.filter(a => {
        const activityDate = new Date(a.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return activityDate > weekAgo;
      }).length;
      
      // Calculate mission metrics
      const totalMissions = userMissions.length;
      const completedMissions = userMissions.filter(m => m.completed).length;
      const missionCompletionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
      const totalMissionPoints = userMissions.reduce((sum, m) => sum + (m.points_earned || 0), 0);
      
      // Calculate account age
      const accountAge = Math.floor((Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate days since last login
      const daysSinceLastLogin = u.last_login 
        ? Math.floor((Date.now() - new Date(u.last_login).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      // Find most recent activity
      const lastActivity = userActivities.length > 0 
        ? new Date(Math.max(...userActivities.map(a => new Date(a.created_at).getTime())))
        : null;
      
      const daysSinceLastActivity = lastActivity 
        ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Calculate engagement score (0-100)
      let engagementScore = 0;
      if (totalSessions > 0) engagementScore += 20;
      if (recentActivities > 0) engagementScore += 20;
      if (completedMissions > 0) engagementScore += 20;
      if (u.points > 0) engagementScore += 20;
      if (u.posts > 0) engagementScore += 20;

      // Determine engagement level
      let engagementLevel = 'Low';
      if (engagementScore >= 80) engagementLevel = 'High';
      else if (engagementScore >= 50) engagementLevel = 'Medium';

      return {
        userId: u.id,
        email: u.email,
        fullName: u.full_name,
        mainGoal: u.main_goal,
        points: u.points || 0,
        badges: u.badges || 0,
        posts: u.posts || 0,
        missionsCompleted: u.missions_completed || 0,
        accountAge,
        daysSinceLastLogin,
        daysSinceLastActivity,
        lastLogin: u.last_login,
        lastActivity: lastActivity?.toISOString() || null,
        totalSessions,
        activeSessions,
        totalPageVisits,
        totalActivities,
        recentActivities,
        totalMissions,
        completedMissions,
        missionCompletionRate,
        totalMissionPoints,
        engagementScore,
        engagementLevel,
        hasRecentActivity: recentActivities > 0,
        isActive: daysSinceLastActivity !== null && daysSinceLastActivity <= 7,
      };
    });

    return NextResponse.json({ success: true, count: rows.length, rows });
  } catch (e: any) {
    console.error('activity engagement list error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
