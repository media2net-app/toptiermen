import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const perPageParam = parseInt(searchParams.get('perPage') || '200', 10);

    const page = Math.max(1, pageParam);
    const perPage = Math.min(1000, Math.max(1, perPageParam));

    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const users = (data?.users || []).map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      phone: u.phone,
      role: (u as any).role || null,
      confirmed_at: (u as any).confirmed_at || null,
      identities: (u as any).identities?.map((i: any) => ({ provider: i.provider, identity_data: i.identity_data })) || [],
    }));

    return NextResponse.json({ success: true, page, perPage, count: users.length, users });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
