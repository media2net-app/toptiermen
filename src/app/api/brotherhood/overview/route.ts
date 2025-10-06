import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const revalidate = 0;

export async function GET(_req: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    // Fetch latest topics (without join)
    const { data: topics, error: topicsError } = await supabaseAdmin
      .from('forum_topics')
      .select('id, title, created_at, author_id')
      .order('created_at', { ascending: false })
      .limit(3);

    if (topicsError) {
      return NextResponse.json({ error: topicsError.message }, { status: 500 });
    }

    const authorIds = Array.from(new Set((topics || []).map((t: any) => t.author_id).filter(Boolean)));

    let authorMap: Record<string, { display_name: string | null; full_name: string | null }> = {};
    if (authorIds.length > 0) {
      const { data: authorProfiles, error: authorsError } = await supabaseAdmin
        .from('profiles')
        .select('id, display_name, full_name')
        .in('id', authorIds);

      if (!authorsError && Array.isArray(authorProfiles)) {
        authorProfiles.forEach((p: any) => {
          authorMap[p.id] = { display_name: p.display_name, full_name: p.full_name };
        });
      }
    }

    // Latest member profiles (exclude nulls), limited to 6
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, display_name, full_name, avatar_url, rank, created_at')
      .order('created_at', { ascending: false })
      .limit(6);

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const mappedTopics = (topics || []).map((t: any) => {
      const author = authorMap[t.author_id] || {};
      return {
        id: String(t.id),
        title: t.title,
        author: author.display_name || author.full_name || 'Onbekende gebruiker',
        created_at: t.created_at,
      };
    });

    const mappedProfiles = (profiles || []).map((p: any) => ({
      id: p.id,
      name: p.display_name || p.full_name || 'Onbekende gebruiker',
      avatar: p.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rank: p.rank || 'Member',
    }));

    return NextResponse.json({ topics: mappedTopics, profiles: mappedProfiles });
  } catch (e: any) {
    const isAbort = e?.name === 'AbortError' || e?.message?.includes('aborted');
    return NextResponse.json({ error: isAbort ? 'Timeout loading brotherhood overview' : 'Internal server error' }, { status: isAbort ? 408 : 500 });
  } finally {
    clearTimeout(timeout);
  }
}
