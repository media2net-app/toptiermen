import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Admin endpoint to log a training day for a user
// POST /api/admin/log-training
// Body: { email: string, schemaNumber?: number, incrementDays?: number }
// - If schemaNumber not provided, uses profiles.selected_schema_id
// - Creates/updates user_training_schema_progress
// - Respects training_frequency from user_training_profiles (default 7)
// - Marks completed_at when weeks >= 8
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email as string | undefined;
    const schemaNumber = body?.schemaNumber as number | undefined;
    const incrementDaysRaw = Number(body?.incrementDays ?? 1);
    const incrementDays = isNaN(incrementDaysRaw) ? 1 : Math.max(0, incrementDaysRaw);

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    // 1) Find profile
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, selected_schema_id')
      .eq('email', email)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = profile.id as string;

    // 2) Determine schema_id
    let schemaId: string | null = null;
    let schemaMeta: any = null;
    if (schemaNumber != null) {
      const { data: schemaRow, error: schemaErr } = await supabaseAdmin
        .from('training_schemas')
        .select('id, schema_nummer, training_goal, equipment_type')
        .eq('schema_nummer', schemaNumber)
        .limit(1)
        .maybeSingle();
      if (schemaErr) {
        return NextResponse.json({ error: schemaErr.message }, { status: 500 });
      }
      schemaId = schemaRow?.id ?? null;
      schemaMeta = schemaRow ?? null;
    } else {
      schemaId = profile.selected_schema_id ?? null;
      if (schemaId) {
        const { data: srow, error: serr } = await supabaseAdmin
          .from('training_schemas')
          .select('id, schema_nummer, training_goal, equipment_type')
          .eq('id', schemaId)
          .maybeSingle();
        if (!serr) schemaMeta = srow ?? null;
      }
    }

    if (!schemaId) {
      return NextResponse.json({ error: 'No schema selected for this user' }, { status: 400 });
    }

    // 3) Fetch training frequency (default 7)
    let trainingFrequency = 7;
    {
      const { data: up, error: upErr } = await supabaseAdmin
        .from('user_training_profiles')
        .select('training_frequency')
        .eq('user_id', userId)
        .maybeSingle();
      if (!upErr && up && typeof up.training_frequency === 'number') {
        trainingFrequency = Math.max(1, up.training_frequency);
      } else if (!up || upErr) {
        // Auto-create minimal profile when missing using schema meta
        const freqToSet = 1;
        const insertPayload: any = {
          user_id: userId,
          training_goal: schemaMeta?.training_goal ?? 'spiermassa',
          training_frequency: freqToSet,
          equipment_type: schemaMeta?.equipment_type ?? 'gym',
        };
        const { error: insProfErr } = await supabaseAdmin
          .from('user_training_profiles')
          .insert(insertPayload);
        if (!insProfErr) trainingFrequency = freqToSet;
      }
    }

    // 4) Upsert progress row for this schema
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('user_training_schema_progress')
      .select('id, completed_days, total_days, current_day, started_at, completed_at')
      .eq('user_id', userId)
      .eq('schema_id', schemaId)
      .maybeSingle();

    let newCompletedDays = incrementDays;
    const now = new Date().toISOString();

    if (!fetchErr && existing) {
      newCompletedDays = (existing.completed_days ?? 0) + incrementDays;
      const targetTotalDays = trainingFrequency * 8;
      const newTotalDays = targetTotalDays;
      const { error: updErr } = await supabaseAdmin
        .from('user_training_schema_progress')
        .update({
          completed_days: newCompletedDays,
          total_days: newTotalDays,
          current_day: (existing.current_day ?? 0) + incrementDays,
          started_at: existing.started_at ?? now,
        })
        .eq('id', existing.id);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
    } else {
      const { error: insErr } = await supabaseAdmin
        .from('user_training_schema_progress')
        .insert({
          user_id: userId,
          schema_id: schemaId,
          completed_days: newCompletedDays,
          total_days: Math.max(trainingFrequency * 8, newCompletedDays),
          current_day: newCompletedDays,
          started_at: now,
        });
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // 5) Recompute weeks and mark completed_at if needed (8 weeks)
    const { data: refreshed, error: refErr } = await supabaseAdmin
      .from('user_training_schema_progress')
      .select('id, completed_days, total_days, completed_at')
      .eq('user_id', userId)
      .eq('schema_id', schemaId)
      .single();
    if (refErr) return NextResponse.json({ error: refErr.message }, { status: 500 });

    const totalDays = (refreshed.total_days ?? refreshed.completed_days ?? 0) as number;
    const weeks = refreshed.completed_at ? 8 : Math.floor(totalDays / trainingFrequency);

    if (weeks >= 8 && !refreshed.completed_at) {
      const { error: doneErr } = await supabaseAdmin
        .from('user_training_schema_progress')
        .update({ completed_at: now })
        .eq('id', refreshed.id);
      if (doneErr) return NextResponse.json({ error: doneErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      email,
      userId,
      schemaId,
      incrementDays,
      totalDaysCompleted: totalDays,
      weeksCompleted: weeks,
      markedCompleted: weeks >= 8,
    });
  } catch (e: any) {
    console.error('log-training error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
