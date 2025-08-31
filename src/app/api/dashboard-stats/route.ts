import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📊 Fetching dashboard stats for user:', userId);

    // Fetch all stats in parallel
    const [
      missionsStats,
      challengesStats,
      trainingStats,
      mindFocusStats,
      boekenkamerStats,
      xpStats,
      userBadges
    ] = await Promise.all([
      // Missions stats
      fetchMissionsStats(userId),
      // Challenges stats
      fetchChallengesStats(userId),
      // Training stats
      fetchTrainingStats(userId),
      // Mind & Focus stats
      fetchMindFocusStats(userId),
      // Boekenkamer stats
      fetchBoekenkamerStats(userId),
      // XP and rank stats
      fetchXPStats(userId),
      // User badges
      fetchUserBadges(userId)
    ]);

    const stats = {
      missions: missionsStats,
      challenges: challengesStats,
      training: trainingStats,
      mindFocus: mindFocusStats,
      boekenkamer: boekenkamerStats,
      xp: xpStats,
      summary: {
        totalProgress: calculateTotalProgress(missionsStats, challengesStats, trainingStats, mindFocusStats, boekenkamerStats)
      }
    };

    console.log('✅ Dashboard stats fetched successfully');

    return NextResponse.json({
      stats,
      userBadges
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}

async function fetchMissionsStats(userId: string) {
  try {
    // Get total missions
    const { data: totalMissions, error: totalError } = await supabaseAdmin
      .from('user_missions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active');

    // Get completed missions today
    const today = new Date().toISOString().split('T')[0];
    const { data: completedToday, error: todayError } = await supabaseAdmin
      .from('user_mission_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`);

    // Get completed missions this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const { data: completedThisWeek, error: weekError } = await supabaseAdmin
      .from('user_mission_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('completed_at', `${weekStartStr}T00:00:00`);

    const total = totalMissions?.length || 0;
    const completedTodayCount = completedToday?.length || 0;
    const completedThisWeekCount = completedThisWeek?.length || 0;
    const progress = total > 0 ? Math.round((completedTodayCount / total) * 100) : 0;

    return {
      total,
      completedToday: completedTodayCount,
      completedThisWeek: completedThisWeekCount,
      progress
    };
  } catch (error) {
    console.error('Error fetching missions stats:', error);
    return { total: 0, completedToday: 0, completedThisWeek: 0, progress: 0 };
  }
}

async function fetchChallengesStats(userId: string) {
  try {
    // For now, return default values since challenges system might not be fully implemented
    return {
      active: 0,
      completed: 0,
      totalDays: 30,
      progress: 0
    };
  } catch (error) {
    console.error('Error fetching challenges stats:', error);
    return { active: 0, completed: 0, totalDays: 30, progress: 0 };
  }
}

async function fetchTrainingStats(userId: string) {
  try {
    // Get user's selected training schema
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('selected_schema_id')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile?.selected_schema_id) {
      return {
        hasActiveSchema: false,
        currentDay: 0,
        totalDays: 0,
        weeklySessions: 0,
        progress: 0
      };
    }

    // Get training schema details
    const { data: schema, error: schemaError } = await supabaseAdmin
      .from('training_schemas')
      .select('*')
      .eq('id', userProfile.selected_schema_id)
      .single();

    if (schemaError || !schema) {
      return {
        hasActiveSchema: false,
        currentDay: 0,
        totalDays: 0,
        weeklySessions: 0,
        progress: 0
      };
    }

    // Calculate current day and progress
    const startDate = new Date(schema.created_at);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentDay = Math.min(daysDiff + 1, schema.total_days || 30);
    const progress = Math.round((currentDay / (schema.total_days || 30)) * 100);

    return {
      hasActiveSchema: true,
      currentDay,
      totalDays: schema.total_days || 30,
      weeklySessions: schema.weekly_sessions || 3,
      progress
    };
  } catch (error) {
    console.error('Error fetching training stats:', error);
    return {
      hasActiveSchema: false,
      currentDay: 0,
      totalDays: 0,
      weeklySessions: 0,
      progress: 0
    };
  }
}

async function fetchMindFocusStats(userId: string) {
  try {
    // For now, return default values since mind & focus system might not be fully implemented
    return {
      total: 0,
      completedToday: 0,
      progress: 0
    };
  } catch (error) {
    console.error('Error fetching mind focus stats:', error);
    return { total: 0, completedToday: 0, progress: 0 };
  }
}

async function fetchBoekenkamerStats(userId: string) {
  try {
    // Get total books read
    const { data: totalBooks, error: totalError } = await supabaseAdmin
      .from('book_reviews')
      .select('id')
      .eq('user_id', userId);

    // Get books completed today
    const today = new Date().toISOString().split('T')[0];
    const { data: completedToday, error: todayError } = await supabaseAdmin
      .from('book_reviews')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    const total = totalBooks?.length || 0;
    const completedTodayCount = completedToday?.length || 0;
    const progress = total > 0 ? Math.round((completedTodayCount / total) * 100) : 0;

    return {
      total,
      completedToday: completedTodayCount,
      progress
    };
  } catch (error) {
    console.error('Error fetching boekenkamer stats:', error);
    return { total: 0, completedToday: 0, progress: 0 };
  }
}

async function fetchXPStats(userId: string) {
  try {
    // Get user's XP and rank
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('points, rank')
      .eq('id', userId)
      .single();

    if (profileError) {
      return {
        total: 0,
        rank: null,
        level: 1
      };
    }

    const totalXP = userProfile.points || 0;
    const level = Math.floor(totalXP / 100) + 1; // Simple level calculation

    return {
      total: totalXP,
      rank: userProfile.rank,
      level
    };
  } catch (error) {
    console.error('Error fetching XP stats:', error);
    return {
      total: 0,
      rank: null,
      level: 1
    };
  }
}

async function fetchUserBadges(userId: string) {
  try {
    const { data: badges, error } = await supabaseAdmin
      .from('user_badges')
      .select(`
        id,
        badge_id,
        unlocked_at,
        badges (
          id,
          name,
          description,
          icon_name,
          image_url,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return badges?.map(userBadge => ({
      id: userBadge.id,
      title: userBadge.badges?.name || 'Unknown Badge',
      description: userBadge.badges?.description || '',
      icon_name: userBadge.badges?.icon_name || 'star',
      image_url: userBadge.badges?.image_url,
      rarity_level: userBadge.badges?.rarity_level || 'common',
      xp_reward: userBadge.badges?.xp_reward || 0,
      unlocked_at: userBadge.unlocked_at
    })) || [];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

function calculateTotalProgress(missions: any, challenges: any, training: any, mindFocus: any, boekenkamer: any) {
  const progressValues = [
    missions.progress,
    challenges.progress,
    training.progress,
    mindFocus.progress,
    boekenkamer.progress
  ].filter(progress => progress !== undefined);

  if (progressValues.length === 0) return 0;

  return Math.round(progressValues.reduce((sum, progress) => sum + progress, 0) / progressValues.length);
} 