import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log(`📊 Fetching activity log for user: ${userId}, limit: ${limit}, offset: ${offset}`);
    console.log('⚡ [PERFORMANCE] Starting optimized activity log fetch...');
    const startTime = Date.now();

    // OPTIMIZED: Parallel fetch all activity data with joins
    const [
      { data: missions, error: missionsError },
      { data: badges, error: badgesError },
      { data: lessons, error: lessonsError }
    ] = await Promise.all([
      // Get completed missions with mission details
      supabaseAdmin
        .from('user_missions')
        .select(`
          id,
          mission_id,
          title,
          points,
          xp_reward,
          last_completion_date,
          status,
          missions (
            id,
            title,
            description,
            category,
            points
          )
        `)
        .eq('user_id', userId)
        .not('last_completion_date', 'is', null)
        .order('last_completion_date', { ascending: false }),
      
      // Get unlocked badges with badge details
      supabaseAdmin
        .from('user_badges')
        .select(`
          id,
          badge_id,
          unlocked_at,
          badges (
            id,
            title,
            description,
            category,
            image_url
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'unlocked')
        .order('unlocked_at', { ascending: false }),
      
      // Get completed academy lessons with lesson details
      supabaseAdmin
        .from('user_lesson_progress')
        .select(`
          id,
          lesson_id,
          completed_at,
          lessons (
            id,
            title,
            description,
            category,
            points
          )
        `)
        .eq('user_id', userId)
        .eq('completed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
    ]);

    const queryTime = Date.now() - startTime;
    console.log(`⚡ [PERFORMANCE] Activity queries completed in ${queryTime}ms`);

    if (missionsError) {
      console.error('Error fetching missions:', missionsError);
      // Don't return error, just log it and continue
    }

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      // Don't return error, just log it and continue
    }

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      // Don't return error, just log it and continue
    }

    // Combine and format all activities
    const activities: any[] = [];

    // OPTIMIZED: Process activities with better data from joins
    // Add missions
    if (missions && missions.length > 0) {
      missions.forEach(mission => {
        const xpReward = mission.points || mission.xp_reward || 0;
        const missionData = Array.isArray(mission.missions) ? mission.missions[0] : mission.missions;
        
        if (xpReward > 0) {
          activities.push({
            id: `mission-${mission.id}`,
            type: 'mission',
            title: missionData?.title || mission.title || 'Challenge',
            description: `Challenge voltooid: ${missionData?.title || mission.title || 'Onbekende challenge'}`,
            xp_reward: xpReward,
            date: mission.last_completion_date,
            category: missionData?.category || 'Challenge',
            icon: '🏆',
            details: {
              mission_id: mission.mission_id,
              status: mission.status
            }
          });
        }
      });
    }

    // Add badges with detailed information
    if (badges && badges.length > 0) {
      badges.forEach(badge => {
        const badgeData = Array.isArray(badge.badges) ? badge.badges[0] : badge.badges;
        
        activities.push({
          id: `badge-${badge.id}`,
          type: 'badge',
          title: badgeData?.title || 'Badge behaald',
          description: `Nieuwe badge ontgrendeld: ${badgeData?.title || 'Onbekende badge'}`,
          xp_reward: 10, // Default XP for badges
          date: badge.unlocked_at,
          category: badgeData?.category || 'Badge',
          icon: '🏅',
          details: {
            badge_id: badge.badge_id,
            image_url: badgeData?.image_url,
            description: badgeData?.description
          }
        });
      });
    }

    // Add academy lessons with detailed information
    if (lessons && lessons.length > 0) {
      lessons.forEach(lesson => {
        const lessonData = Array.isArray(lesson.lessons) ? lesson.lessons[0] : lesson.lessons;
        
        activities.push({
          id: `lesson-${lesson.id}`,
          type: 'lesson',
          title: lessonData?.title || 'Academy les voltooid',
          description: `Academy les afgerond: ${lessonData?.title || 'Onbekende les'}`,
          xp_reward: lessonData?.points || 5, // Use actual points from lesson data
          date: lesson.completed_at,
          category: lessonData?.category || 'Academy',
          icon: '📚',
          details: {
            lesson_id: lesson.lesson_id,
            description: lessonData?.description
          }
        });
      });
    }

    // Sort all activities by date (most recent first)
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination
    const paginatedActivities = activities.slice(0, limit);

    console.log(`✅ Returning ${paginatedActivities.length} activities for user ${userId}`);

    const response = NextResponse.json({
      success: true,
      activities: paginatedActivities,
      hasMore: activities.length > limit,
      total: activities.length,
      queryTime: `${queryTime}ms`,
      timestamp: new Date().toISOString()
    });

    // Set cache headers for better performance
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    response.headers.set('X-Query-Time', `${queryTime}ms`);

    return response;
  } catch (error) {
    console.error('Error in activity-log API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
