import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Admin utility: Promote a user to Schema 2 and set it active
// POST { email: string }
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    // 1) Find user profile by email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, selected_schema_id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = profile.id;

    // 2) Load current active schema period to infer training_goal and equipment_type
    const { data: currentProgress, error: currentProgressError } = await supabaseAdmin
      .from('user_training_schema_progress')
      .select(`
        schema_id,
        training_schemas!inner(
          schema_nummer,
          training_goal,
          equipment_type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (currentProgressError || !currentProgress) {
      return NextResponse.json({ error: 'No schema progress found for user' }, { status: 404 });
    }

    const trainingGoal = currentProgress.training_schemas[0]?.training_goal;
    const equipmentType = currentProgress.training_schemas[0]?.equipment_type;

    if (!trainingGoal || !equipmentType) {
      return NextResponse.json({ error: 'Could not infer training goal/equipment' }, { status: 400 });
    }

    // 3) Find Schema 2 with same goal/equipment
    const { data: schema2, error: schema2Error } = await supabaseAdmin
      .from('training_schemas')
      .select('id, name, schema_nummer')
      .eq('schema_nummer', 2)
      .eq('training_goal', trainingGoal)
      .eq('equipment_type', equipmentType)
      .single();

    if (schema2Error || !schema2) {
      return NextResponse.json({ error: 'Schema 2 not found for profile' }, { status: 404 });
    }

    // 4) Ensure a progress row exists for Schema 2
    const { data: existingProgress, error: existingProgressError } = await supabaseAdmin
      .from('user_training_schema_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('schema_id', schema2.id)
      .maybeSingle();

    if (existingProgressError) {
      return NextResponse.json({ error: 'Failed to check schema 2 progress' }, { status: 500 });
    }

    if (!existingProgress) {
      const { error: insertProgressError } = await supabaseAdmin
        .from('user_training_schema_progress')
        .insert({
          user_id: userId,
          schema_id: schema2.id,
          current_day: 1,
          total_days_completed: 0,
          total_workouts_completed: 0,
          started_at: new Date().toISOString(),
          completed_at: null
        });
      if (insertProgressError) {
        return NextResponse.json({ error: 'Failed to create schema 2 progress' }, { status: 500 });
      }
    }

    // 5) Set schema 2 as the active selected schema
    const { error: setActiveError } = await supabaseAdmin
      .from('profiles')
      .update({ selected_schema_id: schema2.id, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (setActiveError) {
      return NextResponse.json({ error: 'Failed to set schema 2 as active' }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId, schema2Id: schema2.id, schema2Name: schema2.name });
  } catch (e) {
    console.error('admin/promote-to-schema2 error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
