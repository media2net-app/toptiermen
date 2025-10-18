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
          reply_count,
          last_reply_at
        )
      `)
      .order('order_index', { ascending: true });

    clearTimeout(timeout);

    if (categoriesError) {
      return NextResponse.json({ error: categoriesError.message }, { status: 500 });
    }

    // Collect possible author ids (topic authors)
    const authorIds = new Set<string>();
    (categoriesData || []).forEach((cat: any) => {
      (cat.forum_topics || []).forEach((t: any) => t?.author_id && authorIds.add(t.author_id));
    });

    // Later we may also fetch last reply authors (post authors)
    let profilesMap: Record<string, { id: string; full_name: string; avatar_url?: string }> = {};
    if (authorIds.size > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(authorIds));
      (profiles || []).forEach((p: any) => { profilesMap[p.id] = p; });
    }

    // Build payload
    const processed = [] as any[];
    for (const category of (categoriesData || [])) {
      const topics = category.forum_topics || [];
      const topicsCount = topics.length;
      const postsCount = topics.reduce((sum: number, t: any) => sum + 1 + (t.reply_count || 0), 0);

      // Determine last activity topic using last_reply_at if present
      const lastTopic = topics.length > 0
        ? [...topics].sort((a: any, b: any) => {
            const ta = new Date(a.last_reply_at || a.created_at).getTime();
            const tb = new Date(b.last_reply_at || b.created_at).getTime();
            return tb - ta;
          })[0]
        : null;

      let lastPost: any = null;
      if (lastTopic) {
        let authorId = lastTopic.author_id;
        let time = lastTopic.created_at;
        // If replies exist, fetch the real last post author and time
        if ((lastTopic.reply_count || 0) > 0) {
          const { data: lastPosts } = await supabaseAdmin
            .from('forum_posts')
            .select('author_id, created_at')
            .eq('topic_id', lastTopic.id)
            .order('created_at', { ascending: false })
            .limit(1);
          if (lastPosts && lastPosts.length > 0) {
            authorId = lastPosts[0].author_id;
            time = lastPosts[0].created_at;
            // ensure profile loaded
            if (authorId && !profilesMap[authorId]) {
              const { data: prof } = await supabaseAdmin
                .from('profiles')
                .select('id, full_name')
                .eq('id', authorId)
                .single();
              if (prof) profilesMap[prof.id] = prof as any;
            }
          }
        }
        lastPost = {
          title: lastTopic.title,
          author: profilesMap[authorId]?.full_name || 'User',
          time,
        };
      }

      processed.push({
        id: category.id,
        name: category.name,
        description: category.description,
        emoji: category.emoji,
        slug: category.slug,
        topics_count: topicsCount,
        posts_count: postsCount,
        last_post: lastPost,
      });
    }

    return NextResponse.json({ categories: processed });
  } catch (e: any) {
    const isAbort = e?.name === 'AbortError' || e?.message?.includes('aborted');
    return NextResponse.json({ error: isAbort ? 'Timeout while loading forum categories' : 'Internal server error' }, { status: isAbort ? 408 : 500 });
  }
}
