import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/admin/set-training-profile
// Body: { email: string, training_frequency: number }
// Derives training_goal and equipment_type from user's selected schema when possible.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email as string | undefined;
    const training_frequency = Number(body?.training_frequency ?? 1);
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const { data: profile, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('id, selected_schema_id')
      .eq('email', email)
      .single();
    if (profErr || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let training_goal: string | null = null;
    let equipment_type: string | null = null;

    if (profile.selected_schema_id) {
      const { data: schema, error: schErr } = await supabaseAdmin
        .from('training_schemas')
        .select('training_goal, equipment_type')
        .eq('id', profile.selected_schema_id)
        .maybeSingle();
      if (!schErr && schema) {
        training_goal = schema.training_goal ?? null;
        equipment_type = schema.equipment_type ?? null;
      }
    }

    // Upsert user_training_profiles
    const upsertPayload: any = {
      user_id: profile.id,
      training_goal: training_goal ?? 'spiermassa',
      training_frequency: Math.max(1, training_frequency || 1),
      equipment_type: equipment_type ?? 'gym',
    };

    // Check existing
    const { data: existing, error: exErr } = await supabaseAdmin
      .from('user_training_profiles')
      .select('user_id')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (existing && !exErr) {
      const { error: updErr } = await supabaseAdmin
        .from('user_training_profiles')
        .update(upsertPayload)
        .eq('user_id', profile.id);
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
    } else {
      const { error: insErr } = await supabaseAdmin
        .from('user_training_profiles')
        .insert(upsertPayload);
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, email, userId: profile.id, training_frequency: upsertPayload.training_frequency, training_goal: upsertPayload.training_goal, equipment_type: upsertPayload.equipment_type });
  } catch (e: any) {
    console.error('set-training-profile error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
