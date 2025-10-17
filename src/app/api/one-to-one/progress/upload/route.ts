import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Upload a single progress photo and register DB row
// form-data fields: user_id (string), coach_id (string, optional), week_start (YYYY-MM-DD), position ('front'|'side'|'back'), file (binary)
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ success: false, error: 'multipart/form-data vereist' }, { status: 400 });
    }

    const form = await req.formData();
    const user_id = String(form.get('user_id') || '').trim();
    const coach_id_raw = form.get('coach_id');
    const coach_id = typeof coach_id_raw === 'string' && coach_id_raw.trim() ? coach_id_raw.trim() : null;
    const week_start = String(form.get('week_start') || '').trim();
    const position = String(form.get('position') || '').trim();
    const file = form.get('file') as File | null;

    if (!user_id || !week_start || !position || !file) {
      return NextResponse.json({ success: false, error: 'user_id, week_start, position en file zijn vereist' }, { status: 400 });
    }
    if (!['front','side','back'].includes(position)) {
      return NextResponse.json({ success: false, error: 'position moet front|side|back zijn' }, { status: 400 });
    }

    const bucket = 'one-on-one';
    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const sanitizedPos = position.toLowerCase();
    const path = `${user_id}/${week_start}/${sanitizedPos}-${Date.now()}.${fileExt}`;

    // Upload to storage using service key (admin)
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });
    if (uploadError) {
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    // Register DB row
    const insertPayload: any = {
      user_id,
      coach_id,
      week_start,
      position: sanitizedPos,
      file_path: path,
    };
    const { error: dbErr } = await supabaseAdmin
      .from('one_to_one_progress_photos')
      .insert(insertPayload);
    if (dbErr) {
      return NextResponse.json({ success: false, error: dbErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, path });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}
