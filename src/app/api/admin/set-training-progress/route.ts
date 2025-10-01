import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/admin/set-training-progress
// Body: { email: string, schemaNumber?: number, completedDays: number, training_frequency?: number }
// Sets completed_days for the chosen user's schema progress and also normalizes total_days to freq*8.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email as string | undefined;
    const schemaNumber = body?.schemaNumber as number | undefined;
    const overrideFreq = body?.training_frequency as number | undefined;
    const completedDaysRaw = Number(body?.completedDays);
    if (!email || isNaN(completedDaysRaw)) {
      return NextResponse.json({ error: 'Missing email or completedDays' }, { status: 400 });
    }
    const completedDays = Math.max(0, Math.floor(completedDaysRaw));

    // Find profile
    const { data: profile, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('id, selected_schema_id')
      .eq('email', email)
      .single();
    if (profErr || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Determine schema
    let schemaId: string | null = null;
    if (typeof schemaNumber === 'number') {
      const { data: srow } = await supabaseAdmin
        .from('training_schemas')
        .select('id')
        .eq('schema_nummer', schemaNumber)
        .limit(1)
        .maybeSingle();
      schemaId = srow?.id ?? null;
    } else {
      schemaId = profile.selected_schema_id ?? null;
    }
    if (!schemaId) return NextResponse.json({ error: 'No schema selected for this user' }, { status: 400 });

    // Frequency (allow override and upsert training profile first if needed)
    let trainingFrequency = 7;
    {
      if (typeof overrideFreq === 'number' && overrideFreq > 0) {
        const freqToSet = Math.max(1, Math.floor(overrideFreq));
        // Upsert user_training_profiles with override frequency
        const { data: existingProfile } = await supabaseAdmin
          .from('user_training_profiles')
          .select('user_id')
          .eq('user_id', profile.id)
          .maybeSingle();
        if (existingProfile) {
          await supabaseAdmin
            .from('user_training_profiles')
            .update({ training_frequency: freqToSet })
            .eq('user_id', profile.id);
        } else {
          // Best-effort minimal insert
          await supabaseAdmin
            .from('user_training_profiles')
            .insert({ user_id: profile.id, training_goal: 'spiermassa', equipment_type: 'gym', training_frequency: freqToSet });
        }
        trainingFrequency = freqToSet;
      } else {
        const { data: up } = await supabaseAdmin
          .from('user_training_profiles')
          .select('training_frequency')
          .eq('user_id', profile.id)
          .maybeSingle();
        if (up && typeof up.training_frequency === 'number') trainingFrequency = Math.max(1, up.training_frequency);
      }
    }
    const totalDaysTarget = trainingFrequency * 8;

    // Upsert progress row
    const { data: existing } = await supabaseAdmin
      .from('user_training_schema_progress')
      .select('id')
      .eq('user_id', profile.id)
      .eq('schema_id', schemaId)
      .maybeSingle();

    if (existing) {
      const { error: updErr } = await supabaseAdmin
        .from('user_training_schema_progress')
        .update({
          completed_days: completedDays,
          total_days: totalDaysTarget,
          current_day: Math.max(1, completedDays),
          completed_at: completedDays >= totalDaysTarget ? new Date().toISOString() : null,
        })
        .eq('id', existing.id);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
    } else {
      const { error: insErr } = await supabaseAdmin
        .from('user_training_schema_progress')
        .insert({
          user_id: profile.id,
          schema_id: schemaId,
          completed_days: completedDays,
          total_days: totalDaysTarget,
          current_day: Math.max(1, completedDays),
          started_at: new Date().toISOString(),
          completed_at: completedDays >= totalDaysTarget ? new Date().toISOString() : null,
        });
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, email, schemaId, completedDays, totalDaysTarget });
  } catch (e: any) {
    console.error('set-training-progress error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
