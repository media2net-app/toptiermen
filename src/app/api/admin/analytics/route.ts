import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    // Fetch real analytics data from database
    const [
      { data: users, error: usersError },
      { data: onboardingData, error: onboardingError },
      { data: profiles, error: profilesError },
      { data: missions, error: missionsError },
      { data: trainingSchemas, error: trainingError },
      { data: nutritionPlans, error: nutritionError },
      { data: forumPosts, error: forumError },
      { data: books, error: booksError }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*'),
      supabaseAdmin.from('onboarding_status').select('*'),
      supabaseAdmin.from('profiles').select('*'),
      supabaseAdmin.from('user_missions').select('*'),
      supabaseAdmin.from('user_training_schemas').select('*'),
      supabaseAdmin.from('user_nutrition_plans').select('*'),
      supabaseAdmin.from('forum_posts').select('*'),
      supabaseAdmin.from('books').select('*')
    ]);

    if (usersError || onboardingError || profilesError) {
      console.error('Error fetching analytics data:', { usersError, onboardingError, profilesError });
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }

    // Calculate real analytics
    const totalUsers = users?.length || 0;
    const completedOnboarding = onboardingData?.filter(o => o.onboarding_completed).length || 0;
    const onboardingCompletionRate = totalUsers > 0 ? Math.round((completedOnboarding / totalUsers) * 100) : 0;
    
    const activeUsers = profiles?.filter(p => p.last_login && new Date(p.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0;
    const totalMissions = missions?.length || 0;
    const totalTrainingSchemas = trainingSchemas?.length || 0;
    const totalNutritionPlans = nutritionPlans?.length || 0;
    const totalForumPosts = forumPosts?.length || 0;
    const totalBooks = books?.length || 0;

    // Calculate engagement metrics
    const avgMissionsPerUser = totalUsers > 0 ? Math.round(totalMissions / totalUsers) : 0;
    const avgPostsPerUser = totalUsers > 0 ? Math.round(totalForumPosts / totalUsers) : 0;

    // Calculate trends (comparing with previous period - simplified)
    const trends = {
      totalUsers: +totalUsers,
      onboardingCompletion: +onboardingCompletionRate,
      activeUsers: +activeUsers,
      totalMissions: +totalMissions,
      totalPosts: +totalForumPosts,
      userEngagement: +Math.round((activeUsers / totalUsers) * 100)
    };

    const analytics = {
      overview: {
        totalUsers,
        completedOnboarding,
        onboardingCompletionRate,
        activeUsers,
        activeUserRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
      },
      content: {
        totalMissions,
        totalTrainingSchemas,
        totalNutritionPlans,
        totalBooks,
        avgMissionsPerUser,
        avgPostsPerUser
      },
      engagement: {
        totalForumPosts,
        avgPostsPerUser,
        activeUsers,
        userEngagementRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
      },
      trends
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 