import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    
    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    console.log('📊 Fetching admin dashboard stats for period:', period);

    // Fetch all required data in parallel
    const [
      { data: users, error: usersError },
      { data: profiles, error: profilesError },
      { data: onboardingData, error: onboardingError },
      { data: forumPosts, error: forumPostsError },
      { data: userMissions, error: userMissionsError },
      { data: userXP, error: userXPError },
      { data: userBadges, error: userBadgesError },
      { data: trainingSchemas, error: trainingError },
      { data: nutritionPlans, error: nutritionError },
      { data: academyModules, error: academyError },
      { data: academyLessons, error: lessonsError }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*'),
      supabaseAdmin.from('profiles').select('*'),
      supabaseAdmin.from('onboarding_status').select('*'),
      supabaseAdmin.from('forum_posts').select('*'),
      supabaseAdmin.from('user_missions').select('*'),
      supabaseAdmin.from('user_xp').select('*'),
      supabaseAdmin.from('user_badges').select('*'),
      supabaseAdmin.from('training_schemas').select('*'),
      supabaseAdmin.from('nutrition_plans').select('*'),
      supabaseAdmin.from('academy_modules').select('*'),
      supabaseAdmin.from('academy_lessons').select('*')
    ]);

    // Handle errors gracefully
    if (usersError) console.error('Error fetching users:', usersError);
    if (profilesError) console.error('Error fetching profiles:', profilesError);
    if (onboardingError) console.error('Error fetching onboarding:', onboardingError);
    if (forumPostsError) console.error('Error fetching forum posts:', forumPostsError);

    // Calculate real statistics
    const totalUsers = users?.length || 0;
    const activeUsers = profiles?.filter(p => p.last_login && new Date(p.last_login) > startDate).length || 0;
    const newRegistrations = users?.filter(u => new Date(u.created_at) > startDate).length || 0;
    
    // Calculate average daily logins (simplified)
    const recentLogins = profiles?.filter(p => p.last_login && new Date(p.last_login) > startDate).length || 0;
    const daysInPeriod = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const averageDailyLogins = Math.round(recentLogins / daysInPeriod);

    // Calculate community health score
    const completedOnboarding = onboardingData?.filter(o => o.onboarding_completed).length || 0;
    const onboardingRate = totalUsers > 0 ? (completedOnboarding / totalUsers) * 100 : 0;
    
    const recentPosts = forumPosts?.filter(p => new Date(p.created_at) > startDate).length || 0;
    const activeMissions = userMissions?.filter(m => new Date(m.last_completion_date) > startDate).length || 0;
    
    // Calculate community health score (0-100)
    const communityHealthScore = Math.min(100, Math.round(
      (onboardingRate * 0.3) + 
      (Math.min(recentPosts / 10, 100) * 0.3) + 
      (Math.min(activeMissions / 5, 100) * 0.4)
    ));

    // Find most active user
    const userPostCounts = forumPosts?.reduce((acc, post) => {
      acc[post.user_id] = (acc[post.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const mostActiveUserId = Object.keys(userPostCounts).reduce((a, b) => 
      userPostCounts[a] > userPostCounts[b] ? a : b, '');
    
    const mostActiveUser = users?.find(u => u.id === mostActiveUserId);
    const mostActiveUserPosts = userPostCounts[mostActiveUserId] || 0;

    // Calculate content performance
    const totalModules = academyModules?.length || 0;
    const totalLessons = academyLessons?.length || 0;
    const totalTrainingSchemas = trainingSchemas?.length || 0;
    const totalNutritionPlans = nutritionPlans?.length || 0;

    // Calculate user engagement metrics
    const usersWithXP = userXP?.length || 0;
    const usersWithBadges = userBadges?.filter(b => b.status === 'unlocked').length || 0;
    const averageXP = userXP?.reduce((sum, xp) => sum + (xp.total_xp || 0), 0) / (userXP?.length || 1) || 0;

    const stats = {
      // Community Health
      communityHealthScore,
      totalUsers,
      activeUsers,
      completedOnboarding,
      onboardingRate: Math.round(onboardingRate * 100) / 100,

      // Leden Statistics
      activeMembersThisMonth: activeUsers,
      newRegistrationsThisWeek: newRegistrations,
      averageDailyLogins,
      activeCoachingPackages: usersWithXP, // Using users with XP as proxy

      // Community Activity
      postsLastWeek: recentPosts,
      mostActiveUser: {
        name: mostActiveUser?.full_name || mostActiveUser?.email || 'Onbekend',
        posts: mostActiveUserPosts
      },
      reportsLastWeek: 0, // TODO: Implement reports system
      mostPopularSquad: {
        name: 'Alpha Arnhem', // TODO: Implement squads system
        members: Math.round(totalUsers * 0.1) // 10% of users
      },

      // Content Performance
      contentPerformance: {
        academy: {
          totalModules,
          totalLessons,
          averageCompletionRate: Math.round((completedOnboarding / totalUsers) * 100) || 0
        },
        training: {
          totalSchemas: totalTrainingSchemas,
          activeUsers: usersWithXP,
          averageCompletionRate: Math.round((usersWithXP / totalUsers) * 100) || 0
        },
        forum: {
          totalPosts: forumPosts?.length || 0,
          recentPosts,
          averageResponseTime: 2.3 // TODO: Calculate real response time
        }
      },

      // User Engagement
      userEngagement: {
        usersWithXP,
        usersWithBadges,
        averageXP: Math.round(averageXP),
        totalMissions: userMissions?.length || 0,
        completedMissions: userMissions?.filter(m => m.status === 'completed').length || 0
      },

      // Period info
      period,
      lastUpdated: new Date().toISOString()
    };

    console.log('📊 Admin dashboard stats calculated:', {
      totalUsers,
      activeUsers,
      communityHealthScore,
      recentPosts,
      period
    });

    return NextResponse.json({ 
      success: true, 
      stats 
    });

  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch admin dashboard stats' 
    }, { status: 500 });
  }
} 