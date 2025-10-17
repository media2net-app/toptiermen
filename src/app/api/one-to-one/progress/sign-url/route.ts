import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = String(searchParams.get('path') || '').trim();
    const expires = Number(searchParams.get('expires') || 600); // seconds
    if (!path) return NextResponse.json({ success: false, error: 'path is vereist' }, { status: 400 });

    const { data, error } = await supabaseAdmin.storage.from('one-on-one').createSignedUrl(path, expires);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, url: data?.signedUrl || null });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}
