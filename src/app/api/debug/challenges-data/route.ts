import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Debug: Fetching challenges data for user:', userId);

    // Get all challenges for this user
    const { data: challenges, error: challengesError } = await supabaseAdmin
      .from('user_challenges')
      .select(`
        id, 
        challenge_id,
        status,
        progress_percentage,
        current_streak,
        start_date,
        completion_date,
        created_at,
        updated_at,
        challenges (
          id,
          title,
          xp_reward
        )
      `)
      .eq('user_id', userId);

    if (challengesError) {
      console.error('❌ Error fetching challenges:', challengesError);
      return NextResponse.json({ 
        error: 'Failed to fetch challenges',
        details: challengesError 
      }, { status: 500 });
    }

    // Process the data
    const challengesTotal = challenges?.length || 0;
    const activeChallenges = challenges?.filter(challenge => challenge.status === 'active') || [];
    const completedChallenges = challenges?.filter(challenge => challenge.completion_date) || [];
    
    // Count challenges completed today
    const today = new Date().toISOString().split('T')[0];
    const completedChallengesToday = challenges?.filter(challenge => {
      if (!challenge.completion_date) return false;
      const completionDate = new Date(challenge.completion_date).toISOString().split('T')[0];
      return completionDate === today;
    }) || [];

    // Count challenges completed this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    const completedChallengesThisWeek = challenges?.filter(challenge => {
      if (!challenge.completion_date) return false;
      const completionDate = new Date(challenge.completion_date).toISOString().split('T')[0];
      return completionDate >= weekStartStr;
    }) || [];

    const progress = challengesTotal > 0 ? Math.round((completedChallenges.length / challengesTotal) * 100) : 0;

    console.log('📊 Debug challenges data:', {
      total: challengesTotal,
      active: activeChallenges.length,
      completed: completedChallenges.length,
      completedToday: completedChallengesToday.length,
      completedThisWeek: completedChallengesThisWeek.length,
      progress
    });

    return NextResponse.json({
      userId,
      total: challengesTotal,
      active: activeChallenges.length,
      completed: completedChallenges.length,
      completedToday: completedChallengesToday.length,
      completedThisWeek: completedChallengesThisWeek.length,
      progress,
      challenges: challenges?.map(challenge => ({
        id: challenge.id,
        challenge_id: challenge.challenge_id,
        status: challenge.status,
        progress_percentage: challenge.progress_percentage,
        current_streak: challenge.current_streak,
        start_date: challenge.start_date,
        completion_date: challenge.completion_date,
        created_at: challenge.created_at,
        updated_at: challenge.updated_at,
        challenge_title: challenge.challenges?.[0]?.title,
        challenge_xp: challenge.challenges?.[0]?.xp_reward
      })) || []
    });

  } catch (error) {
    console.error('❌ Error in debug challenges API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
