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

    // 2) Load current selected schema to infer goal/equipment and frequency (day count)
    const selectedSchemaId = profile.selected_schema_id as string | null;
    if (!selectedSchemaId) {
      return NextResponse.json({ error: 'No selected schema on profile' }, { status: 400 });
    }

    // Fetch selected schema metadata (goal/equipment if available)
    const { data: selectedSchema, error: selectedSchemaErr } = await supabaseAdmin
      .from('training_schemas')
      .select('id, schema_nummer, training_goal, equipment_type, status')
      .eq('id', selectedSchemaId)
      .maybeSingle();
    if (selectedSchemaErr || !selectedSchema) {
      return NextResponse.json({ error: 'Selected schema not found' }, { status: 404 });
    }

    // Compute current frequency = number of days in selected schema
    const { data: selectedDays, error: selectedDaysErr } = await supabaseAdmin
      .from('training_schema_days')
      .select('id')
      .eq('schema_id', selectedSchemaId);
    if (selectedDaysErr) {
      return NextResponse.json({ error: 'Failed to count selected schema days' }, { status: 500 });
    }
    const targetDayCount = (selectedDays?.length || 0) || 1;

    const trainingGoal = (selectedSchema as any)?.training_goal ?? null;
    const equipmentType = (selectedSchema as any)?.equipment_type ?? null;

    if (!trainingGoal || !equipmentType) {
      return NextResponse.json({ error: 'Could not infer training goal/equipment' }, { status: 400 });
    }

    // 3) Find Schema 2 with same goal/equipment and same day count (frequency)
    const { data: schema2Candidates, error: schema2ListErr } = await supabaseAdmin
      .from('training_schemas')
      .select('id, name, schema_nummer, training_goal, equipment_type, status')
      .eq('schema_nummer', 2)
      .eq('training_goal', trainingGoal)
      .eq('equipment_type', equipmentType);
    if (schema2ListErr) {
      return NextResponse.json({ error: 'Failed to list schema 2 candidates' }, { status: 500 });
    }

    let chosenSchema2: any | null = null;
    if (schema2Candidates && schema2Candidates.length > 0) {
      // Filter by day count
      for (const s of schema2Candidates) {
        const { data: days, error: daysErr } = await supabaseAdmin
          .from('training_schema_days')
          .select('id')
          .eq('schema_id', s.id);
        if (daysErr) continue;
        const dc = days?.length || 0;
        if (dc === targetDayCount) { chosenSchema2 = s; break; }
      }
      // Fallback to first if exact frequency variant not found
      if (!chosenSchema2) chosenSchema2 = schema2Candidates[0] || null;
    }
    if (!chosenSchema2) {
      return NextResponse.json({ error: 'Schema 2 not found for profile and frequency' }, { status: 404 });
    }

    // 4) Ensure a progress row exists for Schema 2
    const { data: existingProgress, error: existingProgressError } = await supabaseAdmin
      .from('user_training_schema_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('schema_id', chosenSchema2.id)
      .maybeSingle();

    if (existingProgressError) {
      return NextResponse.json({ error: 'Failed to check schema 2 progress' }, { status: 500 });
    }

    if (!existingProgress) {
      const { error: insertProgressError } = await supabaseAdmin
        .from('user_training_schema_progress')
        .insert({
          user_id: userId,
          schema_id: chosenSchema2.id,
          current_day: 1,
          started_at: new Date().toISOString(),
          completed_at: null
        });
      if (insertProgressError) {
        return NextResponse.json({ error: 'Failed to create schema 2 progress' }, { status: 500 });
      }
    }

    // 5) Publish Schema 2 if needed
    if (chosenSchema2.status !== 'published') {
      await supabaseAdmin
        .from('training_schemas')
        .update({ status: 'published' })
        .eq('id', chosenSchema2.id);
    }

    // 6) Close other active progress rows (single active invariant)
    await supabaseAdmin
      .from('user_training_schema_progress')
      .update({ completed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .neq('schema_id', chosenSchema2.id)
      .is('completed_at', null);

    // 7) Set schema 2 as the active selected schema
    const { error: setActiveError } = await supabaseAdmin
      .from('profiles')
      .update({ selected_schema_id: chosenSchema2.id, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (setActiveError) {
      return NextResponse.json({ error: 'Failed to set schema 2 as active' }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId, schema2Id: chosenSchema2.id, schema2Name: chosenSchema2.name, dayCountMatched: targetDayCount });
  } catch (e) {
    console.error('admin/promote-to-schema2 error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
