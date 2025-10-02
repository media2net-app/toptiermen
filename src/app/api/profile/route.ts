import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const admin = createClient(supabaseUrl || '', serviceKey || '');

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is vereist' }, { status: 400 });
    }

    const { data, error } = await admin
      .from('profiles')
      .select('id,email,full_name,display_name,avatar_url,cover_url,interests,bio,location,is_public,show_email,created_at,updated_at')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      // Not found is fine; return empty
      return NextResponse.json({ success: true, profile: null });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
