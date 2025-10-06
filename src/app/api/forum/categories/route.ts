import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const revalidate = 0;

export async function GET(_req: NextRequest) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    // Fetch categories with topics
    const { data: categoriesData, error: categoriesError } = await supabaseAdmin
      .from('forum_categories')
      .select(`
        id,
        name,
        description,
        emoji,
        slug,
        order_index,
        forum_topics (
          id,
          title,
          created_at,
          author_id,
          reply_count
        )
      `)
      .order('order_index', { ascending: true });

    clearTimeout(timeout);

    if (categoriesError) {
      return NextResponse.json({ error: categoriesError.message }, { status: 500 });
    }

    // Collect author ids
    const authorIds = new Set<string>();
    (categoriesData || []).forEach((cat: any) => {
      (cat.forum_topics || []).forEach((t: any) => t?.author_id && authorIds.add(t.author_id));
    });

    // Fetch profiles for authors (optional)
    let profilesMap: Record<string, { id: string; full_name: string; avatar_url?: string }> = {};
    if (authorIds.size > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(authorIds));
      if (!profilesError && profiles) {
        profiles.forEach((p) => { profilesMap[p.id] = p; });
      }
    }

    // Build payload
    const processed = (categoriesData || []).map((category: any) => {
      const topics = category.forum_topics || [];
      const topicsCount = topics.length;
      const postsCount = topics.reduce((sum: number, t: any) => sum + 1 + (t.reply_count || 0), 0);
      const lastTopic = topics.length > 0 ? [...topics].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null;

      const lastPost = lastTopic ? {
        title: lastTopic.title,
        author: profilesMap[lastTopic.author_id]?.full_name || 'User',
        time: lastTopic.created_at,
      } : null;

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        emoji: category.emoji,
        slug: category.slug,
        topics_count: topicsCount,
        posts_count: postsCount,
        last_post: lastPost,
      };
    });

    return NextResponse.json({ categories: processed });
  } catch (e: any) {
    const isAbort = e?.name === 'AbortError' || e?.message?.includes('aborted');
    return NextResponse.json({ error: isAbort ? 'Timeout while loading forum categories' : 'Internal server error' }, { status: isAbort ? 408 : 500 });
  }
}
