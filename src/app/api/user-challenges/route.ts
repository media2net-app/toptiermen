import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📋 Fetching user challenges for user:', userId);

    // Get user challenges with challenge details
    const { data: userChallenges, error: challengesError } = await supabaseAdmin
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
          description,
          xp_reward,
          category,
          difficulty,
          duration_days
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (challengesError) {
      console.error('❌ Error fetching user challenges:', challengesError);
      return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }

    // Process challenges data
    const today = new Date().toISOString().split('T')[0];
    const processedChallenges = userChallenges?.map(userChallenge => {
      const challengeData = userChallenge.challenges as any;
      const isCompletedToday = userChallenge.completion_date === today;
      
      return {
        id: userChallenge.id,
        challenge_id: userChallenge.challenge_id,
        title: challengeData?.title || 'Unknown Challenge',
        description: challengeData?.description || '',
        category: challengeData?.category || 'General',
        difficulty: challengeData?.difficulty || 'medium',
        xp_reward: challengeData?.xp_reward || 0,
        duration_days: challengeData?.duration_days || 30,
        status: userChallenge.status,
        progress_percentage: userChallenge.progress_percentage || 0,
        current_streak: userChallenge.current_streak || 0,
        start_date: userChallenge.start_date,
        completion_date: userChallenge.completion_date,
        created_at: userChallenge.created_at,
        updated_at: userChallenge.updated_at,
        done: isCompletedToday,
        type: 'Dagelijks', // All challenges are daily for now
        icon: '🎯',
        badge: 'Challenge Master',
        shared: false,
        accountabilityPartner: null,
        last_completion_date: userChallenge.completion_date
      };
    }) || [];

    // Calculate summary
    const completedToday = processedChallenges.filter(challenge => challenge.done).length;
    const totalToday = processedChallenges.length;
    const dailyStreak = Math.max(...processedChallenges.map(c => c.current_streak), 0);

    const summary = {
      completedToday,
      totalToday,
      dailyStreak
    };

    console.log('✅ User challenges loaded:', {
      total: processedChallenges.length,
      completedToday,
      dailyStreak
    });

    return NextResponse.json({
      challenges: processedChallenges,
      summary
    });

  } catch (error) {
    console.error('❌ Error in user challenges API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
