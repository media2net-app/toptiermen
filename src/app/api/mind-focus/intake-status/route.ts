import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('🧘 Checking mind focus intake status for user:', userId);

    const { data, error } = await supabaseAdmin
      .from('user_mind_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching mind profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Check if intake is completed
    const isIntakeCompleted = data && 
      data.stress_assessment && 
      data.lifestyle_info && 
      data.personal_goals;

    console.log('🧘 Intake status:', {
      userId,
      hasProfile: !!data,
      isIntakeCompleted,
      stressAssessment: !!data?.stress_assessment,
      lifestyleInfo: !!data?.lifestyle_info,
      personalGoals: !!data?.personal_goals
    });

    return NextResponse.json({ 
      success: true, 
      isIntakeCompleted,
      profile: data 
    });

  } catch (error) {
    console.error('Error checking mind focus intake status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
