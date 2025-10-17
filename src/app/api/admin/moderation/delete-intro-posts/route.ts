import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Delete intro/test posts in Brotherhood > Voorstellen
// Body: {
//   preview?: boolean,
//   items: Array<{
//     email?: string,
//     displayName?: string,
//     contentStartsWith?: string,
//     createdAt?: string // ISO or human string; we use a time window
//   }>
// }
// When preview=true (default), it only lists candidates. When false, it deletes them.
export async function POST(req: NextRequest) {
  try {
    const { items, preview, ids } = await req.json();
    
    // Fast path: operate by explicit post IDs
    if (Array.isArray(ids) && ids.length > 0) {
      // Fetch candidates for confirmation
      const { data: posts, error: postsErr } = await supabaseAdmin
        .from('forum_posts')
        .select('id, author_id, content, created_at, topic_id')
        .in('id', ids);
      if (postsErr) {
        return NextResponse.json({ success: false, error: postsErr.message }, { status: 500 });
      }
      if (preview !== false) {
        return NextResponse.json({ success: true, preview: true, results: posts });
      }
      const { error: delErr } = await supabaseAdmin
        .from('forum_posts')
        .delete()
        .in('id', ids);
      if (delErr) {
        return NextResponse.json({ success: false, error: delErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, deleted: ids.length, ids });
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'items[] or ids[] required' }, { status: 400 });
    }

    const results: any[] = [];

    for (const it of items) {
      const email = it.email ? String(it.email).toLowerCase() : undefined;
      const displayName = it.displayName ? String(it.displayName) : undefined;

      // Build time window around createdAt if provided (default +/- 2h to be safe with timezones)
      let gte: string | undefined;
      let lt: string | undefined;
      if (it.createdAt) {
        const base = new Date(it.createdAt);
        if (!isNaN(base.getTime())) {
          const before = new Date(base.getTime() - 1000 * 60 * 120); // -2h
          const after = new Date(base.getTime() + 1000 * 60 * 120);  // +2h
          gte = before.toISOString();
          lt = after.toISOString();
        }
      }

      // Resolve optional userId by email or displayName
      let userId: string | undefined;
      if (email || displayName) {
        let profQuery = supabaseAdmin
          .from('profiles')
          .select('id, display_name, full_name, email')
          .limit(1);
        if (email) profQuery = profQuery.eq('email', email) as any;
        else if (displayName) profQuery = profQuery.ilike('display_name', displayName) as any;
        const { data: prof, error: profErr } = await profQuery.maybeSingle();
        if (!profErr && prof?.id) userId = prof.id as string;
      }

      // Build base query for posts
      let q = supabaseAdmin
        .from('forum_posts')
        .select('id, author_id, content, created_at, topic_id')
        .order('created_at', { ascending: false })
        .limit(50);
      if (userId) q = q.eq('author_id', userId) as any;
      if (gte && lt) q = q.gte('created_at', gte).lt('created_at', lt) as any;

      const { data: posts, error: postsErr } = await q;
      if (postsErr) {
        results.push({ email, displayName, error: postsErr.message });
        continue;
      }

      const filtered = (posts || []).filter(p => {
        if (it.contentStartsWith) {
          return (p.content || '').trim().toLowerCase().startsWith(String(it.contentStartsWith).toLowerCase());
        }
        return true;
      });

      if (preview !== false) {
        results.push({ email, displayName, userId, candidates: filtered });
      } else {
        if (filtered.length === 0) {
          results.push({ email, displayName, userId, deleted: 0 });
        } else {
          const ids = filtered.map(p => p.id);
          const { error: delErr } = await supabaseAdmin
            .from('forum_posts')
            .delete()
            .in('id', ids);
          if (delErr) {
            results.push({ email, displayName, userId, error: delErr.message });
          } else {
            results.push({ email, displayName, userId, deleted: ids.length, ids });
          }
        }
      }
    }

    return NextResponse.json({ success: true, preview: preview !== false, results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}
