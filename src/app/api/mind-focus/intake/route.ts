import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Create or update intake
export async function POST(request: NextRequest) {
  try {
    const { userId, stressAssessment, lifestyleInfo, personalGoals } = await request.json();

    const { data, error } = await supabaseAdmin
      .from('user_mind_profiles')
      .upsert(
        {
          user_id: userId,
          stress_assessment: stressAssessment,
          lifestyle_info: lifestyleInfo,
          personal_goals: personalGoals,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, profileId: data.id });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Fetch intake
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('user_mind_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete/reset intake
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('user_mind_profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
