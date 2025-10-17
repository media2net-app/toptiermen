import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const user_id = String(body?.user_id || '').trim();
    const coach_id = typeof body?.coach_id === 'string' && body.coach_id.trim() ? body.coach_id.trim() : null;
    const week_start = String(body?.week_start || '').trim();
    const weight_kg = body?.weight_kg === null || body?.weight_kg === undefined ? null : Number(body.weight_kg);
    const body_fat_percent = body?.body_fat_percent === null || body?.body_fat_percent === undefined ? null : Number(body.body_fat_percent);
    const notes = typeof body?.notes === 'string' ? body.notes : null;

    if (!user_id || !week_start) {
      return NextResponse.json({ success: false, error: 'user_id en week_start zijn vereist' }, { status: 400 });
    }

    const payload: any = {
      user_id,
      week_start,
      weight_kg,
      body_fat_percent,
      notes,
    };
    if (coach_id) payload.coach_id = coach_id;

    const { data, error } = await supabaseAdmin
      .from('one_to_one_progress')
      .upsert(payload, { onConflict: 'user_id,week_start' })
      .select('*')
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, progress: data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}
