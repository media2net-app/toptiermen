import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { measureApiPerformance } from '@/lib/performance-monitor';
import { withRetry, withTimeout } from '@/lib/error-recovery';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    console.log('⚡ [DASHBOARD-OPTIMIZED] Starting optimized dashboard data fetch...');

    // Use performance monitoring and error recovery
    const dashboardData = await measureApiPerformance(
      'dashboard-optimized',
      () => withRetry(
        () => withTimeout(
          async () => {
            const result = await supabaseAdmin
              .from('profiles')
              .select(`
                *,
                user_onboarding_status (
                  *,
                  onboarding_completed,
                  current_step
                ),
                user_missions (
                  id,
                  mission_id,
                  status,
                  points,
                  xp_reward,
                  last_completion_date,
                  missions (
                    id,
                    title,
                    description,
                    points,
                    category
                  )
                ),
                user_badges (
                  id,
                  badge_id,
                  unlocked_at,
                  badges (
                    id,
                    title,
                    description,
                    image_url,
                    category
                  )
                ),
                user_presence (
                  is_online,
                  last_seen
                ),
                user_training_profiles (
                  id,
                  goal,
                  equipment,
                  frequency,
                  experience_level
                )
              `)
              .eq('id', userId)
              .single();
            return result;
          },
          10000, // 10 second timeout
          'Dashboard query timed out'
        ),
        {
          maxRetries: 2,
          baseDelay: 1000,
          maxDelay: 5000,
          backoffMultiplier: 2
        }
      ),
      {
        userId,
        dataSize: 0 // Will be calculated after query
      }
    );

    const { data, error: dashboardError } = dashboardData;

    if (dashboardError) {
      console.error('Error fetching dashboard data:', dashboardError);
      return NextResponse.json({ 
        error: 'Failed to fetch dashboard data',
        details: dashboardError.message 
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Process the data
    const profile = data;
    const onboarding = data.user_onboarding_status?.[0] || null;
    const missions = data.user_missions || [];
    const badges = data.user_badges || [];
    const presence = data.user_presence?.[0] || null;
    const trainingProfile = data.user_training_profiles?.[0] || null;

    // Calculate XP and stats
    const totalXp = missions.reduce((sum, mission) => {
      return sum + (mission.points || mission.xp_reward || 0);
    }, 0);

    const completedMissions = missions.filter(m => m.status === 'completed').length;
    const totalBadges = badges.length;

    // Calculate level
    const level = Math.floor(totalXp / 100) + 1;
    const xpToNextLevel = 100 - (totalXp % 100);

    // Get recent activity (last 10 missions)
    const recentActivity = missions
      .filter(m => m.last_completion_date)
      .sort((a, b) => new Date(b.last_completion_date).getTime() - new Date(a.last_completion_date).getTime())
      .slice(0, 10)
      .map(mission => ({
        id: mission.id,
        type: 'mission_completed',
        title: mission.missions?.title || 'Mission',
        description: mission.missions?.description || '',
        xp: mission.points || mission.xp_reward || 0,
        date: mission.last_completion_date,
        category: mission.missions?.category || 'general'
      }));

    // Get recent badges (last 5)
    const recentBadges = badges
      .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
      .slice(0, 5)
      .map(badge => ({
        id: badge.id,
        title: badge.badges?.title || 'Badge',
        description: badge.badges?.description || '',
        image_url: badge.badges?.image_url || null,
        category: badge.badges?.category || 'general',
        unlocked_at: badge.unlocked_at
      }));

    const response = {
      success: true,
      data: {
        profile: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          role: profile.role,
          package_type: profile.package_type,
          rank: profile.rank,
          created_at: profile.created_at
        },
        onboarding: {
          isCompleted: onboarding?.onboarding_completed || false,
          currentStep: onboarding?.current_step || null,
          welcome_video_shown: onboarding?.welcome_video_shown || false,
          goal_set: onboarding?.goal_set || false,
          missions_selected: onboarding?.missions_selected || false,
          training_schema_selected: onboarding?.training_schema_selected || false,
          nutrition_plan_selected: onboarding?.nutrition_plan_selected || false,
          challenge_started: onboarding?.challenge_started || false
        },
        stats: {
          totalXp,
          level,
          xpToNextLevel,
          completedMissions,
          totalBadges,
          isOnline: presence?.is_online || false,
          lastSeen: presence?.last_seen || null
        },
        trainingProfile: trainingProfile ? {
          goal: trainingProfile.goal,
          equipment: trainingProfile.equipment,
          frequency: trainingProfile.frequency,
          experience_level: trainingProfile.experience_level
        } : null,
        recentActivity,
        recentBadges,
        timestamp: new Date().toISOString()
      }
    };

    // Set cache headers for better performance
    const nextResponse = NextResponse.json(response);
    nextResponse.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=300');
    nextResponse.headers.set('X-Performance-Optimized', 'true');
    nextResponse.headers.set('X-Data-Size', JSON.stringify(response).length.toString());

    return nextResponse;

  } catch (error: any) {
    console.error('Error in dashboard-optimized API:', error.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
