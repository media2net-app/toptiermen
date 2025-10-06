import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Create or update intake
export async function POST(request: NextRequest) {
  try {
    const { userId, stressAssessment, lifestyleInfo, personalGoals } = await request.json();

    console.log('🧘 Mind Focus Intake API - POST request received');
    console.log('User ID:', userId);
    console.log('Stress Assessment:', stressAssessment);
    console.log('Lifestyle Info:', lifestyleInfo);
    console.log('Personal Goals:', personalGoals);

    if (!userId) {
      console.error('❌ No userId provided');
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('user_mind_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    console.log('🔍 Existing profile check:', { existingProfile, fetchError });

    const profileData = {
      user_id: userId,
      stress_assessment: stressAssessment,
      lifestyle_info: lifestyleInfo,
      personal_goals: personalGoals,
      updated_at: new Date().toISOString(),
    };

    let data, error;

    if (existingProfile && !fetchError) {
      // Update existing profile
      console.log('📝 Updating existing profile:', existingProfile.id);
      const result = await supabaseAdmin
        .from('user_mind_profiles')
        .update(profileData)
        .eq('id', existingProfile.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new profile
      console.log('📝 Creating new profile');
      const insertData = {
        ...profileData,
        created_at: new Date().toISOString(),
      };
      const result = await supabaseAdmin
        .from('user_mind_profiles')
        .insert(insertData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: 'Failed to save profile', details: error.message }, { status: 500 });
    }

    console.log('✅ Profile saved successfully:', data);
    return NextResponse.json({ success: true, profileId: data.id, profile: data });
  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
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
