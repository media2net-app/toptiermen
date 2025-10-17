import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Toggle or set 1:1 coaching flags on a profile
// POST body: { user_id: string, is_one_to_one?: boolean, coach_id?: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let user_id = String(body?.user_id || '').trim();
    const is_one_to_one = typeof body?.is_one_to_one === 'boolean' ? body.is_one_to_one : true;
    const coach_id_raw = body?.coach_id;
    let coach_id = typeof coach_id_raw === 'string' && coach_id_raw.trim() ? coach_id_raw.trim() : null;
    const coach_email = typeof body?.coach_email === 'string' ? body.coach_email.trim().toLowerCase() : '';
    const user_email = typeof body?.user_email === 'string' ? body.user_email.trim().toLowerCase() : '';

    // Resolve user_id from user_email if needed
    if (!user_id && user_email) {
      const { data: userRow, error: userErr } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('email', user_email)
        .single();
      if (userErr || !userRow) {
        return NextResponse.json({ success: false, error: `Kon user niet vinden voor email: ${user_email}` }, { status: 404 });
      }
      user_id = userRow.id;
    }
    if (!user_id) {
      return NextResponse.json({ success: false, error: 'user_id of user_email is vereist' }, { status: 400 });
    }

    // Resolve coach_id from coach_email if provided and coach_id missing
    if (!coach_id && coach_email) {
      const { data: coachRow, error: coachErr } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('email', coach_email)
        .single();
      if (coachErr || !coachRow) {
        return NextResponse.json({ success: false, error: `Kon coach niet vinden voor email: ${coach_email}` }, { status: 404 });
      }
      coach_id = coachRow.id;
    }

    const update: Record<string, any> = { is_one_to_one };
    if (coach_id !== null) update.coach_id = coach_id;

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(update)
      .eq('id', user_id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}

// Optional: GET ?user_id=... -> read flags
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = String(searchParams.get('user_id') || '').trim();
    if (!user_id) {
      return NextResponse.json({ success: false, error: 'user_id is vereist' }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, is_one_to_one, coach_id')
      .eq('id', user_id)
      .single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, profile: data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}
