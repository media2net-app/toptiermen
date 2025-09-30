import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Admin utility: force-complete Schema 1 for a user and activate Schema 2
// POST { email: string }
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    // 1) Resolve user
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, selected_schema_id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = profile.id;

    // 2) Find the Schema 1 progress row (any goal/equipment)
    const { data: s1Progress, error: s1Error } = await supabaseAdmin
      .from('user_training_schema_progress')
      .select(`schema_id, completed_days, current_day, completed_at, training_schemas!inner(id, schema_nummer, training_goal, equipment_type)`)
      .eq('user_id', userId)
      .eq('training_schemas.schema_nummer', 1)
      .maybeSingle();

    let trainingGoal: string | null = null;
    let equipmentType: string | null = null;
    let schema1Id: string | null = null;

    if (s1Progress) {
      const ts: any = (s1Progress as any).training_schemas;
      const tsObj = Array.isArray(ts) ? ts[0] : ts;
      trainingGoal = tsObj?.training_goal ?? null;
      equipmentType = tsObj?.equipment_type ?? null;
      schema1Id = s1Progress.schema_id;
    } else {
      // No schema 1 progress exists; try to infer from any existing progress or profile
      const { data: anyProgress } = await supabaseAdmin
        .from('user_training_schema_progress')
        .select('training_schemas!inner(training_goal, equipment_type)')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
      const ts2: any = anyProgress?.training_schemas;
      const ts2Obj = Array.isArray(ts2) ? ts2[0] : ts2;
      trainingGoal = ts2Obj?.training_goal ?? trainingGoal;
      equipmentType = ts2Obj?.equipment_type ?? equipmentType;

      // Find a Schema 1 matching goal/equipment
      const { data: schema1, error: s1FindErr } = await supabaseAdmin
        .from('training_schemas')
        .select('id')
        .eq('schema_nummer', 1)
        .eq('training_goal', trainingGoal)
        .eq('equipment_type', equipmentType)
        .maybeSingle();
      if (s1FindErr || !schema1) {
        return NextResponse.json({ error: 'Could not find Schema 1 for user profile' }, { status: 404 });
      }
      schema1Id = schema1.id as string;

      // Create initial progress row for Schema 1
      const { error: insS1Err } = await supabaseAdmin
        .from('user_training_schema_progress')
        .insert({
          user_id: userId,
          schema_id: schema1Id,
          current_day: 1,
          completed_days: 0,
          total_workouts_completed: 0,
          started_at: new Date().toISOString(),
          completed_at: null
        });
      if (insS1Err) {
        return NextResponse.json({ error: 'Failed to create schema 1 progress' }, { status: 500 });
      }
    }

    // 3) Mark Schema 1 as completed (set completed_at, set completed_days to 56 and current_day to 56)
    const { error: updErr } = await supabaseAdmin
      .from('user_training_schema_progress')
      .update({ completed_at: new Date().toISOString(), completed_days: 56, current_day: 56, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('schema_id', schema1Id);

    if (updErr) {
      return NextResponse.json({ error: 'Failed to update schema 1 as completed' }, { status: 500 });
    }

    // 4) Find Schema 2 with same goal/equipment
    const { data: schema2, error: s2Err } = await supabaseAdmin
      .from('training_schemas')
      .select('id, name')
      .eq('schema_nummer', 2)
      .eq('training_goal', trainingGoal as string)
      .eq('equipment_type', equipmentType as string)
      .maybeSingle();

    if (s2Err || !schema2) {
      return NextResponse.json({ error: 'Schema 2 not found for this goal/equipment' }, { status: 404 });
    }

    // 5) Ensure a progress row exists for Schema 2
    const { data: existingS2, error: exErr } = await supabaseAdmin
      .from('user_training_schema_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('schema_id', schema2.id)
      .maybeSingle();

    if (exErr) {
      return NextResponse.json({ error: 'Failed checking schema 2 progress' }, { status: 500 });
    }

    if (!existingS2) {
      const { error: insErr } = await supabaseAdmin
        .from('user_training_schema_progress')
        .insert({
          user_id: userId,
          schema_id: schema2.id,
          current_day: 1,
          completed_days: 0,
          total_workouts_completed: 0,
          started_at: new Date().toISOString(),
          completed_at: null
        });
      if (insErr) {
        return NextResponse.json({ error: 'Failed to create schema 2 progress' }, { status: 500 });
      }
    }

    // 6) Set schema 2 active for the user
    const { error: setActiveErr } = await supabaseAdmin
      .from('profiles')
      .update({ selected_schema_id: schema2.id, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (setActiveErr) {
      return NextResponse.json({ error: 'Failed to set schema 2 active' }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId, schema1Completed: true, activatedSchema2: schema2.id });
  } catch (e) {
    console.error('complete-schema1 error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
