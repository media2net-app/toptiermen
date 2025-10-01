import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/admin/recalculate-training-totals
// Body: { email: string, schemaNumber?: number }
// Sets total_days to training_frequency*8 for the user's schema progress rows (optionally only the given schemaNumber).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email as string | undefined;
    const schemaNumber = body?.schemaNumber as number | undefined;
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const { data: profile, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    if (profErr || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userId = profile.id as string;

    // Get training frequency
    let trainingFrequency = 7;
    {
      const { data: up } = await supabaseAdmin
        .from('user_training_profiles')
        .select('training_frequency')
        .eq('user_id', userId)
        .maybeSingle();
      if (up && typeof up.training_frequency === 'number') {
        trainingFrequency = Math.max(1, up.training_frequency);
      }
    }

    // Determine schema ids to update
    let schemaIds: string[] = [];
    if (typeof schemaNumber === 'number') {
      const { data: schemas } = await supabaseAdmin
        .from('training_schemas')
        .select('id, schema_nummer')
        .eq('schema_nummer', schemaNumber);
      schemaIds = (schemas || []).map((s: any) => s.id);
    } else {
      const { data: progress } = await supabaseAdmin
        .from('user_training_schema_progress')
        .select('schema_id')
        .eq('user_id', userId);
      schemaIds = Array.from(new Set((progress || []).map((p: any) => p.schema_id))).filter(Boolean);
    }

    if (schemaIds.length === 0) {
      return NextResponse.json({ success: true, updated: 0, message: 'No schemas to update' });
    }

    const targetTotalDays = trainingFrequency * 8;
    const { error: updErr } = await supabaseAdmin
      .from('user_training_schema_progress')
      .update({ total_days: targetTotalDays })
      .eq('user_id', userId)
      .in('schema_id', schemaIds);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({ success: true, updated: schemaIds.length, targetTotalDays, trainingFrequency });
  } catch (e: any) {
    console.error('recalculate-training-totals error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
