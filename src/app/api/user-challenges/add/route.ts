import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, challengeId } = body;

    if (!userId || !challengeId) {
      return NextResponse.json({ error: 'User ID and Challenge ID are required' }, { status: 400 });
    }

    console.log('➕ Adding challenge to user:', { userId, challengeId });

    // Check if user already has this challenge
    const { data: existingChallenge, error: checkError } = await supabaseAdmin
      .from('user_challenges')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();

    if (existingChallenge) {
      return NextResponse.json({ 
        success: false,
        message: 'Je hebt deze challenge al toegevoegd!' 
      });
    }

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabaseAdmin
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      console.error('❌ Challenge not found:', challengeError);
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Add challenge to user
    const { data: userChallenge, error: addError } = await supabaseAdmin
      .from('user_challenges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        status: 'active',
        progress_percentage: 0,
        current_streak: 0,
        start_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (addError) {
      console.error('❌ Error adding challenge:', addError);
      return NextResponse.json({ error: 'Failed to add challenge' }, { status: 500 });
    }

    console.log('✅ Challenge added to user:', userChallenge);

    return NextResponse.json({
      success: true,
      message: `Challenge "${challenge.title}" toegevoegd!`,
      challenge: {
        id: userChallenge.id,
        title: challenge.title,
        description: challenge.description,
        category: challenge.category_slug,
        difficulty: challenge.difficulty_level,
        xp_reward: challenge.xp_reward,
        duration_days: challenge.duration_days
      }
    });

  } catch (error) {
    console.error('❌ Error in add challenge API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
