import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      stressAssessment, 
      lifestyleInfo, 
      personalGoals 
    } = await request.json();

    console.log('🧘 Saving mind focus intake data for user:', userId);
    console.log('📊 Intake data:', {
      stressAssessment,
      lifestyleInfo,
      personalGoals
    });

    // Save intake data to database (one canonical row per user)
    const { data, error } = await supabaseAdmin
      .from('user_mind_profiles')
      .upsert({
        user_id: userId,
        stress_assessment: stressAssessment,
        lifestyle_info: lifestyleInfo,
        personal_goals: personalGoals,
        // created_at only set on insert (Postgres will keep original if column has default)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving mind profile:', error);
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      profileId: data.id 
    });

  } catch (error) {
    console.error('Error in mind-focus intake:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('🧘 Fetching mind focus profile for user:', userId);

    const { data, error } = await supabaseAdmin
      .from('user_mind_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching mind profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      profile: data 
    });

  } catch (error) {
    console.error('Error fetching mind profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
