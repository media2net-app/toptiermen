import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { email, targetStep } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, package_type')
      .eq('email', email)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found', details: profileError }, { status: 404 });
    }

    // Check current onboarding status
    const { data: existingStatus, error: statusError } = await supabase
      .from('user_onboarding_status')
      .select('*')
      .eq('user_id', profile.id);

    console.log('Existing onboarding records:', existingStatus);

    // Delete any existing records to clean up duplicates
    if (existingStatus && existingStatus.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_onboarding_status')
        .delete()
        .eq('user_id', profile.id);

      if (deleteError) {
        console.error('Error deleting existing records:', deleteError);
      } else {
        console.log('Cleaned up existing onboarding records');
      }
    }

    // Create new onboarding status
    const newStatus = {
      user_id: profile.id,
      current_step: targetStep || 2, // Default to step 2 (uitdagingen selecteren)
      onboarding_completed: false,
      welcome_video_watched: false,
      main_goal_set: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertedStatus, error: insertError } = await supabase
      .from('user_onboarding_status')
      .insert(newStatus)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting onboarding status:', insertError);
      return NextResponse.json({ error: 'Failed to create onboarding status', details: insertError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Onboarding status created for ${email}`,
      profile: {
        id: profile.id,
        email: profile.email,
        package_type: profile.package_type
      },
      onboarding_status: insertedStatus,
      available_steps_for_basic: [
        { id: 0, title: 'Welkomstvideo bekijken' },
        { id: 1, title: 'Hoofddoel bepalen' },
        { id: 2, title: 'Uitdagingen selecteren' },
        { id: 5, title: 'Challenge selecteren' },
        { id: 6, title: 'Forum introductie' }
      ]
    });
  } catch (error) {
    console.error('Fix onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
