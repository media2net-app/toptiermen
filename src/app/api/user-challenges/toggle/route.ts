import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, challengeId, action } = body;

    if (!userId || !challengeId) {
      return NextResponse.json({ error: 'User ID and Challenge ID are required' }, { status: 400 });
    }

    console.log('🔄 Toggling user challenge:', { userId, challengeId, action });

    // Get the current challenge
    const { data: userChallenge, error: fetchError } = await supabaseAdmin
      .from('user_challenges')
      .select(`
        *,
        challenges (
          id,
          title,
          xp_reward
        )
      `)
      .eq('user_id', userId)
      .eq('id', challengeId)
      .single();

    if (fetchError || !userChallenge) {
      console.error('❌ User challenge not found:', fetchError);
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = userChallenge.completion_date === today;
    const challengeData = userChallenge.challenges as any;
    const xpReward = challengeData?.xp_reward || 0;

    let newCompletionDate: string | null = null;
    let xpEarned = 0;
    let isNowCompleted = false;

    if (action === 'complete') {
      if (isCompletedToday) {
        return NextResponse.json({ 
          success: false,
          message: 'Challenge is al voltooid vandaag!' 
        });
      }
      
      newCompletionDate = today;
      xpEarned = xpReward;
      isNowCompleted = true;
    } else if (action === 'uncomplete') {
      if (!isCompletedToday) {
        return NextResponse.json({ 
          success: false,
          message: 'Challenge is niet voltooid vandaag!' 
        });
      }
      
      newCompletionDate = null;
      xpEarned = -xpReward;
      isNowCompleted = false;
    } else {
      // Toggle logic
      if (isCompletedToday) {
        // Already completed today, uncomplete it
        newCompletionDate = null;
        xpEarned = -xpReward;
        isNowCompleted = false;
      } else {
        // Not completed today, complete it
        newCompletionDate = today;
        xpEarned = xpReward;
        isNowCompleted = true;
      }
    }

    // Update the challenge
    const { error: updateError } = await supabaseAdmin
      .from('user_challenges')
      .update({
        completion_date: newCompletionDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', challengeId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Error updating challenge:', updateError);
      return NextResponse.json({ error: 'Failed to update challenge' }, { status: 500 });
    }

    console.log('✅ Challenge updated:', {
      challengeId,
      completionDate: newCompletionDate,
      xpEarned,
      isNowCompleted
    });

    return NextResponse.json({
      success: true,
      xpEarned,
      isCompleted: isNowCompleted,
      message: isNowCompleted 
        ? `Challenge voltooid! +${xpEarned} XP verdiend!` 
        : `Challenge ongedaan gemaakt. ${Math.abs(xpEarned)} XP afgetrokken.`
    });

  } catch (error) {
    console.error('❌ Error in user challenge toggle API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
