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

    // First try to get user challenges with challenge details
    let userChallenges: any[] = [];
    let challengesError: any = null;

    try {
      const { data, error } = await supabaseAdmin
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
            category_slug,
            difficulty_level,
            duration_days
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      userChallenges = data || [];
      challengesError = error;
    } catch (err) {
      console.log('⚠️ Challenges table join failed, trying fallback...');
      challengesError = err;
    }

    // If the join failed, try without the challenges table
    if (challengesError) {
      console.log('🔄 Trying fallback approach without challenges table...');
      try {
        const { data: fallbackData, error: fallbackError } = await supabaseAdmin
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
            updated_at
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (fallbackError) {
          console.error('❌ Error fetching user challenges (fallback):', fallbackError);
          return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
        }

        userChallenges = fallbackData || [];
      } catch (fallbackErr) {
        console.error('❌ Fallback also failed:', fallbackErr);
        return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
      }
    }

    // Process challenges data
    const today = new Date().toISOString().split('T')[0];
    const processedChallenges = userChallenges?.map(userChallenge => {
      const challengeData = userChallenge.challenges as any;
      const isCompletedToday = userChallenge.completion_date === today;
      
      return {
        id: userChallenge.id,
        challenge_id: userChallenge.challenge_id,
        title: challengeData?.title || 'Daily Challenge',
        description: challengeData?.description || 'Complete this challenge daily',
        category: challengeData?.category_slug || 'general',
        difficulty: challengeData?.difficulty_level || 'medium',
        xp_reward: challengeData?.xp_reward || 15,
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
