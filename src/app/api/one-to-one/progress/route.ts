import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = String(searchParams.get('user_id') || '').trim();
    const week_start = String(searchParams.get('week_start') || '').trim();

    if (!user_id) {
      return NextResponse.json({ success: false, error: 'user_id is vereist' }, { status: 400 });
    }

    let progressQuery = supabaseAdmin
      .from('one_to_one_progress')
      .select('*')
      .eq('user_id', user_id)
      .order('week_start', { ascending: false });

    if (week_start) progressQuery = progressQuery.eq('week_start', week_start);

    const [progressRes, photosRes] = await Promise.all([
      progressQuery,
      supabaseAdmin
        .from('one_to_one_progress_photos')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
    ]);

    if (progressRes.error) return NextResponse.json({ success: false, error: progressRes.error.message }, { status: 500 });
    if (photosRes.error) return NextResponse.json({ success: false, error: photosRes.error.message }, { status: 500 });

    return NextResponse.json({ success: true, progress: progressRes.data || [], photos: photosRes.data || [] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}
