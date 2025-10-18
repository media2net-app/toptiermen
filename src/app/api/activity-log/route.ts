import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const limit = Math.min(Math.max(Number(limitParam ?? 50), 1), 200);
    const offset = Math.max(Number(offsetParam ?? 0), 0);

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required', activities: [], hasMore: false }, { status: 400 });
    }

    // Get user activities from the unified table with total count for pagination
    const { data, error, count } = await supabaseAdmin
      .from('user_activities')
      .select('*', { count: 'exact', head: false })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching activity log:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch activity log', activities: [], hasMore: false }, { status: 500 });
    }

    let activities = (data ?? []).map((row: any) => {
      // Derive type from activity_type prefix
      const typePrefix = (row.activity_type || '').split('.')[0];
      let derivedType: 'mission' | 'badge' | 'lesson' = 'mission';
      if (typePrefix === 'badge') derivedType = 'badge';
      if (typePrefix === 'academy') derivedType = 'lesson';
      if (typePrefix === 'challenge' || typePrefix === 'mission' || typePrefix === 'training') derivedType = 'mission';

      const details = row.details || {};
      const meta = row.meta || {};

      return {
        id: row.id,
        type: derivedType,
        title: row.title || details.title || 'Activiteit',
        description: details.description || meta.description || '',
        xp_reward: details.xp_reward || meta.xp_reward || meta.xp || 0,
        date: row.created_at,
        category: details.category || row.activity_type || 'activiteit',
        icon: details.icon || row.icon || '📝',
      };
    });

    // Fallback: legacy table 'activity_logs' if no activities yet
    if (activities.length === 0) {
      const { data: legacyData, error: legacyError, count: legacyCount } = await supabaseAdmin
        .from('activity_logs')
        .select('*', { count: 'exact', head: false })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!legacyError && legacyData) {
        activities = legacyData.map((row: any) => ({
          id: row.id,
          type: (row.action || '').includes('badge') ? 'badge' : (row.action || '').includes('academy') ? 'lesson' : 'mission',
          title: row.details?.title || row.action || 'Activiteit',
          description: row.details?.description || '',
          xp_reward: row.details?.xp_reward || 0,
          date: row.created_at,
          category: row.action || 'activiteit',
          icon: row.details?.icon || '📝',
        }));
      }
    }

    // Fallback 2: Aggregate from real sources (user challenges, badges, lessons, workouts) for the user
    if (activities.length === 0) {
      // We'll fetch a recent window and then slice to limit respecting offset
      const recentSince = new Date();
      recentSince.setDate(recentSince.getDate() - 30); // last 30 days
      const recentSinceStr = recentSince.toISOString();

      const [
        userChallengesRes,
        userMissionsRes,
        userBadgesRes,
        lessonProgressRes,
        workoutSessionsRes,
      ] = await Promise.all([
        supabaseAdmin
          .from('user_challenges')
          .select('id, user_id, completion_date, created_at, challenge_id')
          .eq('user_id', userId)
          .not('completion_date', 'is', null)
          .gte('completion_date', recentSinceStr.split('T')[0])
          .order('completion_date', { ascending: false })
          .limit(limit * 3),
        supabaseAdmin
          .from('user_missions')
          .select('id, user_id, last_completion_date, title, xp_reward, points')
          .eq('user_id', userId)
          .not('last_completion_date', 'is', null)
          .gte('last_completion_date', recentSinceStr.split('T')[0])
          .order('last_completion_date', { ascending: false })
          .limit(limit * 3),
        supabaseAdmin
          .from('user_badges')
          .select('id, user_id, unlocked_at, badge_id, status')
          .eq('user_id', userId)
          .eq('status', 'unlocked')
          .gte('unlocked_at', recentSinceStr)
          .order('unlocked_at', { ascending: false })
          .limit(limit * 3),
        supabaseAdmin
          .from('user_lesson_progress')
          .select('id, user_id, completed_at, lesson_id, completed')
          .eq('user_id', userId)
          .eq('completed', true)
          .not('completed_at', 'is', null)
          .gte('completed_at', recentSinceStr)
          .order('completed_at', { ascending: false })
          .limit(limit * 3),
        supabaseAdmin
          .from('workout_sessions')
          .select('id, user_id, completed_at, duration_minutes, notes')
          .eq('user_id', userId)
          .not('completed_at', 'is', null)
          .gte('completed_at', recentSinceStr)
          .order('completed_at', { ascending: false })
          .limit(limit * 3),
      ]);

      const agg: any[] = [];

      const userChallenges = userChallengesRes.data || [];
      userChallenges.forEach((uc: any) => {
        const dateStr = uc.completion_date ? `${uc.completion_date}T00:00:00.000Z` : uc.created_at;
        agg.push({
          id: `challenge-${uc.id}`,
          type: 'mission',
          title: 'Challenge voltooid',
          description: 'Dagelijkse challenge afgerond',
          xp_reward: 15,
          date: dateStr,
          category: 'challenge.completed',
          icon: '🎯',
        });
      });

      const userMissions = userMissionsRes.data || [];
      userMissions.forEach((m: any) => {
        const dateStr = m.last_completion_date ? `${m.last_completion_date}T00:00:00.000Z` : recentSinceStr;
        agg.push({
          id: `mission-${m.id}`,
          type: 'mission',
          title: m.title || 'Challenge voltooid',
          description: m.title ? `Challenge "${m.title}" succesvol voltooid` : 'Challenge succesvol voltooid',
          xp_reward: m.points || m.xp_reward || 0,
          date: dateStr,
          category: 'mission.completed',
          icon: '🏆',
        });
      });

      const userBadges = userBadgesRes.data || [];
      userBadges.forEach((b: any) => {
        agg.push({
          id: `badge-${b.id}`,
          type: 'badge',
          title: 'Badge behaald',
          description: 'Nieuwe badge ontgrendeld',
          xp_reward: 10,
          date: b.unlocked_at,
          category: 'badge.unlocked',
          icon: '🏅',
        });
      });

      const lessons = lessonProgressRes.data || [];
      lessons.forEach((l: any) => {
        agg.push({
          id: `lesson-${l.id}`,
          type: 'lesson',
          title: 'Les afgerond',
          description: 'Academy les voltooid',
          xp_reward: 5,
          date: l.completed_at,
          category: 'academy.lesson_completed',
          icon: '📘',
        });
      });

      const workouts = workoutSessionsRes.data || [];
      workouts.forEach((w: any) => {
        agg.push({
          id: `workout-${w.id}`,
          type: 'mission',
          title: 'Workout voltooid',
          description: w.notes ? `Training: ${w.notes}` : 'Training voltooid',
          xp_reward: Math.floor((w.duration_minutes || 0) / 10) * 5,
          date: w.completed_at,
          category: 'training.workout_completed',
          icon: '💪',
        });
      });

      // Sort descendant by date and apply offset/limit
      agg.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const sliced = agg.slice(offset, offset + limit);
      activities = sliced;
    }

    const total = typeof count === 'number' ? count : activities.length;
    const hasMore = offset + activities.length < total;

    return NextResponse.json({ success: true, activities, hasMore });
  } catch (error) {
    console.error('Error in activity-log API:', error);
    return NextResponse.json({ success: false, error: 'Internal server error', activities: [], hasMore: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, details } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log activity into unified user_activities table
    const { error } = await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: action,
        title: details?.title || action,
        icon: details?.icon,
        details,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error logging activity:', error);
      return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in activity-log API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}