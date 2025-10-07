import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, challenge } = body as {
      userId: string;
      challenge: {
        title: string;
        description?: string;
        category_slug?: string;
        difficulty_level?: string;
        duration_days?: number;
        xp_reward?: number;
        status?: string;
      };
    };

    if (!userId || !challenge?.title) {
      return NextResponse.json({ error: 'userId and challenge.title are required' }, { status: 400 });
    }

    // 1) Create challenge
    const { data: createdChallenge, error: createErr } = await supabaseAdmin
      .from('challenges')
      .insert({
        title: challenge.title,
        description: challenge.description ?? `Persoonlijke challenge: ${challenge.title}`,
        category_slug: challenge.category_slug ?? 'personal',
        difficulty_level: challenge.difficulty_level ?? 'medium',
        duration_days: challenge.duration_days ?? 30,
        xp_reward: challenge.xp_reward ?? 50,
        status: challenge.status ?? 'active',
      })
      .select('*')
      .single();

    if (createErr || !createdChallenge) {
      console.error('❌ Failed to create challenge:', createErr);
      return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
    }

    // 2) Attach to user
    const { data: userChallenge, error: addErr } = await supabaseAdmin
      .from('user_challenges')
      .insert({
        user_id: userId,
        challenge_id: createdChallenge.id,
        status: 'active',
        progress_percentage: 0,
        current_streak: 0,
        start_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (addErr || !userChallenge) {
      console.error('❌ Failed to link challenge to user:', addErr);
      // Best-effort cleanup
      await supabaseAdmin.from('challenges').delete().eq('id', createdChallenge.id);
      return NextResponse.json({ error: 'Failed to add challenge to user' }, { status: 500 });
    }

    // 3) Return merged info needed by UI
    const merged = {
      id: userChallenge.challenge_id,
      title: createdChallenge.title,
      description: createdChallenge.description,
      category: createdChallenge.category_slug,
      difficulty: createdChallenge.difficulty_level,
      xp_reward: createdChallenge.xp_reward,
      duration_days: createdChallenge.duration_days,
      done: false,
      last_completion_date: null,
      created_at: createdChallenge.created_at,
    };

    return NextResponse.json({ success: true, challenge: merged, message: 'Challenge toegevoegd' });
  } catch (error) {
    console.error('❌ Error in create-and-add API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
