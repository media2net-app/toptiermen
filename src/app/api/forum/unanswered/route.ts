import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export const revalidate = 0;

// Returns a list of topics with zero replies, ordered by created_at desc
// Optional: limit (?limit=3)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(20, Number(searchParams.get('limit') || 3)));

    // Get topics with reply_count = 0
    const { data: topics, error } = await supabaseAdmin
      .from('forum_topics')
      .select('id, title, created_at, category_id, author_id, reply_count')
      .eq('reply_count', 0)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    // Fetch category slugs and author names
    const categoryIds = Array.from(new Set((topics || []).map(t => t.category_id)));
    const authorIds = Array.from(new Set((topics || []).map(t => t.author_id)));

    const [{ data: categories }, { data: profiles }] = await Promise.all([
      categoryIds.length > 0
        ? supabaseAdmin.from('forum_categories').select('id, slug').in('id', categoryIds)
        : Promise.resolve({ data: [] as any[] } as any),
      authorIds.length > 0
        ? supabaseAdmin.from('profiles').select('id, full_name').in('id', authorIds)
        : Promise.resolve({ data: [] as any[] } as any),
    ]);

    const catMap = new Map((categories || []).map((c: any) => [c.id, c.slug]));
    const profMap = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));

    const list = (topics || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      created_at: t.created_at,
      author: profMap.get(t.author_id) || 'User',
      href: `/dashboard/brotherhood/forum/${catMap.get(t.category_id) || 'algemeen'}/thread/${t.id}`,
    }));

    return NextResponse.json({ success: true, topics: list });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Internal server error' }, { status: 500 });
  }
}
