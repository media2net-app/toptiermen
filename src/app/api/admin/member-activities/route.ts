import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const view = searchParams.get('view') || 'day';
    const userId = searchParams.get('userId'); // New user filter parameter

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    console.log(`📊 Fetching member activities for date: ${date}, view: ${view}`);

    // Calculate date range based on view mode
    const startDate = new Date(date);
    const endDate = new Date(date);

    if (view === 'week') {
      // Get start of week (Monday)
      const dayOfWeek = startDate.getDay();
      const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
      
      // Get end of week (Sunday)
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (view === 'month') {
      // Get start of month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      // Get end of month
      endDate.setMonth(endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Day view
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    console.log(`📅 Date range: ${startDateStr} to ${endDateStr}`);
    console.log('⚡ [PERFORMANCE] Starting optimized member activities fetch...');
    const startTime = Date.now();

    // OPTIMIZED: Parallel fetch all activity data
    const [
      { data: missions, error: missionsError },
      { data: badges, error: badgesError },
      { data: lessons, error: lessonsError },
      { data: workouts, error: workoutsError }
    ] = await Promise.all([
      // 1. Get completed missions (challenges)
      (() => {
        let query = supabaseAdmin
          .from('user_missions')
          .select(`
            id,
            user_id,
            title,
            points,
            xp_reward,
            last_completion_date
          `)
          .not('last_completion_date', 'is', null)
          .gte('last_completion_date', startDateStr.split('T')[0])
          .lte('last_completion_date', endDateStr.split('T')[0]);
        
        if (userId) query = query.eq('user_id', userId);
        return query;
      })(),
      
      // 2. Get unlocked badges
      (() => {
        let query = supabaseAdmin
          .from('user_badges')
          .select(`
            id,
            user_id,
            unlocked_at,
            badge_id
          `)
          .eq('status', 'unlocked')
          .gte('unlocked_at', startDateStr)
          .lte('unlocked_at', endDateStr);
        
        if (userId) query = query.eq('user_id', userId);
        return query;
      })(),
      
      // 3. Get completed academy lessons
      (() => {
        let query = supabaseAdmin
          .from('user_lesson_progress')
          .select(`
            id,
            user_id,
            completed_at,
            lesson_id
          `)
          .eq('completed', true)
          .not('completed_at', 'is', null)
          .gte('completed_at', startDateStr)
          .lte('completed_at', endDateStr);
        
        if (userId) query = query.eq('user_id', userId);
        return query;
      })(),
      
      // 4. Get completed workouts
      (() => {
        let query = supabaseAdmin
          .from('workout_sessions')
          .select(`
            id,
            user_id,
            completed_at,
            duration_minutes,
            notes
          `)
          .not('completed_at', 'is', null)
          .gte('completed_at', startDateStr)
          .lte('completed_at', endDateStr);
        
        if (userId) query = query.eq('user_id', userId);
        return query;
      })()
    ]);

    const queryTime = Date.now() - startTime;
    console.log(`⚡ [PERFORMANCE] Parallel queries completed in ${queryTime}ms`);

    // Get all activities from different sources
    const activities: any[] = [];

    if (missionsError) {
      console.error('Error fetching missions:', missionsError);
    } else if (missions) {
      // Get user profiles for missions
      const userIds = [...new Set(missions.map(m => m.user_id))];
      const { data: missionProfiles, error: missionProfilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profilesMap = new Map();
      if (missionProfiles) {
        missionProfiles.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      missions.forEach(mission => {
        const missionDate = new Date(mission.last_completion_date);
        if (missionDate >= startDate && missionDate <= endDate) {
          const profile = profilesMap.get(mission.user_id);
          activities.push({
            id: `mission-${mission.id}`,
            user_id: mission.user_id,
            user_name: profile?.full_name || 'Onbekende gebruiker',
            user_email: profile?.email || '',
            activity_type: 'challenge',
            title: mission.title || 'Challenge voltooid',
            description: `Challenge "${mission.title || 'Onbekende challenge'}" succesvol voltooid`,
            xp_reward: mission.points || mission.xp_reward || 0,
            date: mission.last_completion_date,
            time: missionDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            category: 'Challenge',
            icon: '🏆'
          });
        }
      });
    }

    // Process badges data

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
    } else if (badges) {
      // Get badge details and user profiles
      const badgeIds = [...new Set(badges.map(b => b.badge_id))];
      const userIds = [...new Set(badges.map(b => b.user_id))];
      
      const [badgeDetailsResult, badgeProfilesResult] = await Promise.all([
        supabaseAdmin
          .from('badges')
          .select('id, title, description')
          .in('id', badgeIds),
        supabaseAdmin
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds)
      ]);

      const badgeDetailsMap = new Map();
      if (badgeDetailsResult.data) {
        badgeDetailsResult.data.forEach(badge => {
          badgeDetailsMap.set(badge.id, badge);
        });
      }

      const badgeProfilesMap = new Map();
      if (badgeProfilesResult.data) {
        badgeProfilesResult.data.forEach(profile => {
          badgeProfilesMap.set(profile.id, profile);
        });
      }

      badges.forEach(badge => {
        const badgeDate = new Date(badge.unlocked_at);
        if (badgeDate >= startDate && badgeDate <= endDate) {
          const badgeDetail = badgeDetailsMap.get(badge.badge_id);
          const profile = badgeProfilesMap.get(badge.user_id);
          activities.push({
            id: `badge-${badge.id}`,
            user_id: badge.user_id,
            user_name: profile?.full_name || 'Onbekende gebruiker',
            user_email: profile?.email || '',
            activity_type: 'badge',
            title: badgeDetail?.title || 'Badge behaald',
            description: `Badge "${badgeDetail?.title || 'Onbekende badge'}" ontgrendeld`,
            xp_reward: 10, // Default XP for badges
            date: badge.unlocked_at.split('T')[0],
            time: badgeDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            category: 'Badge',
            icon: '🏅'
          });
        }
      });
    }

    // Process lessons data

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
    } else if (lessons) {
      // Get lesson details and user profiles
      const lessonIds = [...new Set(lessons.map(l => l.lesson_id))];
      const userIds = [...new Set(lessons.map(l => l.user_id))];
      
      const [lessonDetailsResult, lessonProfilesResult] = await Promise.all([
        supabaseAdmin
          .from('lessons')
          .select('id, title, description')
          .in('id', lessonIds),
        supabaseAdmin
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds)
      ]);

      const lessonDetailsMap = new Map();
      if (lessonDetailsResult.data) {
        lessonDetailsResult.data.forEach(lesson => {
          lessonDetailsMap.set(lesson.id, lesson);
        });
      }

      const lessonProfilesMap = new Map();
      if (lessonProfilesResult.data) {
        lessonProfilesResult.data.forEach(profile => {
          lessonProfilesMap.set(profile.id, profile);
        });
      }

      lessons.forEach(lesson => {
        const lessonDate = new Date(lesson.completed_at);
        if (lessonDate >= startDate && lessonDate <= endDate) {
          const lessonDetail = lessonDetailsMap.get(lesson.lesson_id);
          const profile = lessonProfilesMap.get(lesson.user_id);
          activities.push({
            id: `lesson-${lesson.id}`,
            user_id: lesson.user_id,
            user_name: profile?.full_name || 'Onbekende gebruiker',
            user_email: profile?.email || '',
            activity_type: 'lesson',
            title: lessonDetail?.title || 'Academy les voltooid',
            description: `Academy les "${lessonDetail?.title || 'Onbekende les'}" afgerond`,
            xp_reward: 5, // Default XP for lessons
            date: lesson.completed_at.split('T')[0],
            time: lessonDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            category: 'Academy',
            icon: '🎓'
          });
        }
      });
    }

    // Process workouts data

    if (workoutsError) {
      console.error('Error fetching workouts:', workoutsError);
    } else if (workouts) {
      // Get user profiles for workouts
      const userIds = [...new Set(workouts.map(w => w.user_id))];
      const { data: workoutProfiles, error: workoutProfilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const workoutProfilesMap = new Map();
      if (workoutProfiles) {
        workoutProfiles.forEach(profile => {
          workoutProfilesMap.set(profile.id, profile);
        });
      }

      workouts.forEach(workout => {
        const workoutDate = new Date(workout.completed_at);
        if (workoutDate >= startDate && workoutDate <= endDate) {
          const profile = workoutProfilesMap.get(workout.user_id);
          activities.push({
            id: `workout-${workout.id}`,
            user_id: workout.user_id,
            user_name: profile?.full_name || 'Onbekende gebruiker',
            user_email: profile?.email || '',
            activity_type: 'workout',
            title: 'Workout voltooid',
            description: `Training voltooid (${workout.duration_minutes || 0} minuten)${workout.notes ? ` - ${workout.notes}` : ''}`,
            xp_reward: Math.floor((workout.duration_minutes || 0) / 10) * 5, // 5 XP per 10 minutes
            date: workout.completed_at.split('T')[0],
            time: workoutDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            category: 'Training',
            icon: '💪'
          });
        }
      });
    }

    // Sort activities by date and time (most recent first)
    activities.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

    // Calculate statistics
    const stats = {
      total: activities.length,
      challenges: activities.filter(a => a.activity_type === 'challenge').length,
      modules: activities.filter(a => a.activity_type === 'module').length,
      lessons: activities.filter(a => a.activity_type === 'lesson').length,
      workouts: activities.filter(a => a.activity_type === 'workout').length,
      badges: activities.filter(a => a.activity_type === 'badge').length,
      totalXP: activities.reduce((sum, a) => sum + a.xp_reward, 0)
    };

    console.log(`📊 Found ${activities.length} activities for ${date} (${view} view)`);
    console.log(`📈 Stats:`, stats);

    const response = NextResponse.json({
      success: true,
      activities,
      stats,
      dateRange: {
        start: startDateStr,
        end: endDateStr
      },
      queryTime: `${queryTime}ms`,
      timestamp: new Date().toISOString()
    });

    // Set cache headers for better performance
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    response.headers.set('X-Query-Time', `${queryTime}ms`);

    return response;

  } catch (error) {
    console.error('Error in member activities API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
