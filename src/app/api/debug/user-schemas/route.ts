import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Get user's training profile
    const { data: profile } = await supabaseAdmin
      .from('user_training_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Get user's schema progress
    const { data: progress } = await supabaseAdmin
      .from('user_training_schema_progress')
      .select(`
        *,
        training_schemas!fk_user_training_schema_progress_schema_id(
          id,
          name,
          schema_nummer,
          training_goal,
          equipment_type,
          status
        )
      `)
      .eq('user_id', userId);

    // Get user's schema periods
    const { data: periods } = await supabaseAdmin
      .from('user_schema_periods')
      .select(`
        *,
        training_schemas!inner(
          id,
          name,
          schema_nummer
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Get selected_schema_id from profiles
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('selected_schema_id, email')
      .eq('id', userId)
      .single();

    return NextResponse.json({
      success: true,
      profile: profile,
      progress: progress || [],
      periods: periods || [],
      selectedSchemaId: userProfile?.selected_schema_id,
      email: userProfile?.email
    });

  } catch (error) {
    console.error('❌ Error in debug user-schemas route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

