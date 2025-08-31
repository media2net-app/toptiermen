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
      financeStats,
      brotherhoodStats,
      academyStats,
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
      // Finance & Business stats
      fetchFinanceStats(userId),
      // Brotherhood stats
      fetchBrotherhoodStats(userId),
      // Academy stats
      fetchAcademyStats(userId),
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
      finance: financeStats,
      brotherhood: brotherhoodStats,
      academy: academyStats,
      xp: xpStats,
      summary: {
        totalProgress: calculateTotalProgress(missionsStats, challengesStats, trainingStats, mindFocusStats, boekenkamerStats, financeStats, brotherhoodStats, academyStats)
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
    // Get user challenges
    const { data: challenges, error } = await supabaseAdmin
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching challenges:', error);
      return { active: 0, completed: 0, totalDays: 0, progress: 0 };
    }

    const activeChallenges = challenges?.filter(c => c.status === 'active').length || 0;
    const completedChallenges = challenges?.filter(c => c.status === 'completed').length || 0;
    const totalDays = challenges?.reduce((sum, c) => sum + (c.current_streak || 0), 0) || 0;
    const progress = activeChallenges > 0 ? Math.round((totalDays / (activeChallenges * 30)) * 100) : 0;

    return {
      active: activeChallenges,
      completed: completedChallenges,
      totalDays,
      progress
    };
  } catch (error) {
    console.error('Error fetching challenges stats:', error);
    return { active: 0, completed: 0, totalDays: 0, progress: 0 };
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

    return badges?.map(userBadge => {
      const badge = userBadge.badges?.[0]; // Get first badge from the array
      return {
        id: userBadge.id,
        title: badge?.name || 'Unknown Badge',
        description: badge?.description || '',
        icon_name: badge?.icon_name || 'star',
        image_url: badge?.image_url,
        rarity_level: badge?.rarity_level || 'common',
        xp_reward: badge?.xp_reward || 0,
        unlocked_at: userBadge.unlocked_at
      };
    }) || [];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

async function fetchFinanceStats(userId: string) {
  try {
    // Get user's financial data (if available)
    const { data: userProfile, error } = await supabaseAdmin
      .from('profiles')
      .select('points, rank')
      .eq('id', userId)
      .single();

    if (error) {
      return {
        netWorth: 0,
        monthlyIncome: 0,
        savings: 0,
        investments: 0,
        progress: 0
      };
    }

    // For now, calculate based on XP/points as a proxy for financial progress
    const totalXP = userProfile.points || 0;
    const netWorth = Math.round(totalXP * 10); // Simple calculation
    const monthlyIncome = Math.round(totalXP * 2);
    const savings = Math.round(totalXP * 3);
    const investments = Math.round(totalXP * 5);
    const progress = Math.min(Math.round((totalXP / 1000) * 100), 100);

    return {
      netWorth,
      monthlyIncome,
      savings,
      investments,
      progress
    };
  } catch (error) {
    console.error('Error fetching finance stats:', error);
    return {
      netWorth: 0,
      monthlyIncome: 0,
      savings: 0,
      investments: 0,
      progress: 0
    };
  }
}

async function fetchBrotherhoodStats(userId: string) {
  try {
    // Get total users in the platform
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        communityScore: 0,
        progress: 0
      };
    }

    // Get user's forum activity
    const { data: forumPosts, error: postsError } = await supabaseAdmin
      .from('forum_posts')
      .select('id')
      .eq('user_id', userId);

    const { data: forumComments, error: commentsError } = await supabaseAdmin
      .from('forum_comments')
      .select('id')
      .eq('user_id', userId);

    const totalActivity = (forumPosts?.length || 0) + (forumComments?.length || 0);
    const communityScore = Math.min(totalActivity * 10, 100);
    const progress = Math.min(Math.round((totalUsers || 0) / 100 * 100), 100);

    return {
      totalMembers: totalUsers || 0,
      activeMembers: Math.round((totalUsers || 0) * 0.7), // Assume 70% active
      communityScore,
      progress
    };
  } catch (error) {
    console.error('Error fetching brotherhood stats:', error);
    return {
      totalMembers: 0,
      activeMembers: 0,
      communityScore: 0,
      progress: 0
    };
  }
}

async function fetchAcademyStats(userId: string) {
  try {
    // Get total academy modules
    const { data: modules, error: modulesError } = await supabaseAdmin
      .from('academy_modules')
      .select('id, title')
      .eq('status', 'published')
      .order('order_index');

    // Get user's lesson progress (new system)
    const { data: lessonProgress, error: lessonProgressError } = await supabaseAdmin
      .from('user_lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', userId)
      .eq('completed', true);

    if (lessonProgressError) {
      console.error('Error fetching lesson progress:', lessonProgressError);
      return {
        totalCourses: 0,
        completedCourses: 0,
        learningProgress: 0,
        progress: 0
      };
    }

    // Get lesson details separately
    const lessonIds = lessonProgress?.map(p => p.lesson_id) || [];
    const { data: lessonDetails, error: lessonDetailsError } = await supabaseAdmin
      .from('academy_lessons')
      .select('id, module_id, title')
      .in('id', lessonIds);

    if (lessonDetailsError) {
      console.error('Error fetching lesson details:', lessonDetailsError);
      return {
        totalCourses: 0,
        completedCourses: 0,
        learningProgress: 0,
        progress: 0
      };
    }

    const totalModules = modules?.length || 0;
    
    // Create a map of lesson_id to lesson details
    const lessonDetailsMap = {};
    lessonDetails?.forEach(lesson => {
      lessonDetailsMap[lesson.id] = lesson;
    });

    // Calculate completed modules based on lesson completion
    const completedModules = new Set();
    lessonProgress?.forEach(progress => {
      const lessonDetail = lessonDetailsMap[progress.lesson_id];
      if (lessonDetail?.module_id) {
        completedModules.add(lessonDetail.module_id);
      }
    });
    
    const completedModulesCount = completedModules.size;
    
    // Calculate overall progress based on module completion
    const learningProgress = totalModules > 0 ? Math.round((completedModulesCount / totalModules) * 100) : 0;

    console.log(`Academy Stats for user ${userId}: ${completedModulesCount}/${totalModules} modules completed (${learningProgress}%)`);

    return {
      totalCourses: totalModules,
      completedCourses: completedModulesCount,
      learningProgress,
      progress: learningProgress
    };
  } catch (error) {
    console.error('Error fetching academy stats:', error);
    return {
      totalCourses: 0,
      completedCourses: 0,
      learningProgress: 0,
      progress: 0
    };
  }
}

function calculateTotalProgress(missions: any, challenges: any, training: any, mindFocus: any, boekenkamer: any, finance: any, brotherhood: any, academy: any) {
  const progressValues = [
    missions.progress,
    challenges.progress,
    training.progress,
    mindFocus.progress,
    boekenkamer.progress,
    finance.progress,
    brotherhood.progress,
    academy.progress
  ].filter(progress => progress !== undefined);

  if (progressValues.length === 0) return 0;

  return Math.round(progressValues.reduce((sum, progress) => sum + progress, 0) / progressValues.length);
} 