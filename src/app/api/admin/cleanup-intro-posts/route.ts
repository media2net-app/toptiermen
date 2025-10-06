import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Names to keep (case-insensitive contains match on profiles.full_name / username / email local-part)
// Updated based on user's list: Frodo van Houten, Sten, Panchero de kort
const KEEP_NAMES = ['frodo', 'sten', 'panchero'];

// Distinctive content substrings to keep (lowercased contains)
const KEEP_CONTENT_SUBSTRINGS = [
  // Panchero
  'hoi, ik ben pancho',
  'panchero de kort',
  // Sten
  'mijn naam is sten',
  'sten mets',
  // Frodo
  'hallo allemaal, ik ben frodo',
  'frodo van houten'
];

async function getIntroTopic() {
  // Find the "Voorstellen - Nieuwe Leden" topic in category slug 'algemeen'
  const { data, error } = await supabase
    .from('forum_topics')
    .select(`id, title, forum_categories!inner(slug)`) // requires FK/relationship defined in PostgREST
    .eq('title', '👋 Voorstellen - Nieuwe Leden')
    .eq('forum_categories.slug', 'algemeen')
    .single();
  if (error) return { topic: null as any, error };
  return { topic: data, error: null };
}

async function fetchPostsWithProfiles(topicId: number | string) {
  const { data: posts, error: postsError } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true });
  if (postsError) return { posts: null as any, profilesMap: null as any, error: postsError };

  const authorIds = Array.from(new Set((posts || []).map(p => p.author_id)));
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, username, email')
    .in('id', authorIds);

  if (profilesError) return { posts, profilesMap: new Map(), error: profilesError };
  const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]));
  return { posts, profilesMap, error: null };
}

function isKeepProfile(profile: any): boolean {
  if (!profile) return false;
  const name = (profile.full_name || '').toString().toLowerCase();
  const username = (profile.username || '').toString().toLowerCase();
  const emailLocal = ((profile.email || '').toString().split('@')[0] || '').toLowerCase();
  return KEEP_NAMES.some(n => name.includes(n) || username.includes(n) || emailLocal.includes(n));
}

function isKeepByContent(content: string | null | undefined): boolean {
  if (!content) return false;
  const c = content.toString().toLowerCase();
  return KEEP_CONTENT_SUBSTRINGS.some(s => c.includes(s));
}

export async function GET() {
  try {
    const { topic, error: topicError } = await getIntroTopic();
    if (topicError || !topic?.id) {
      return NextResponse.json({ success: false, error: 'Intro topic niet gevonden', details: topicError?.message }, { status: 404 });
    }

    const { posts, profilesMap, error } = await fetchPostsWithProfiles(topic.id);
    if (error && !posts) {
      return NextResponse.json({ success: false, error: 'Posts konden niet worden opgehaald', details: error.message }, { status: 500 });
    }

    const withAuthors = (posts || []).map((p: any) => ({
      ...p,
      profile: profilesMap.get(p.author_id) || null,
    }));

    const keep = withAuthors.filter(p => isKeepProfile(p.profile) || isKeepByContent(p.content));
    const toDelete = withAuthors.filter(p => !(isKeepProfile(p.profile) || isKeepByContent(p.content)));

    return NextResponse.json({
      success: true,
      topicId: topic.id,
      counts: { total: withAuthors.length, keep: keep.length, delete: toDelete.length },
      keepPreview: keep.slice(0, 10).map(p => ({ id: p.id, author: p.profile?.full_name || p.author_id })),
      deletePreview: toDelete.slice(0, 10).map(p => ({ id: p.id, author: p.profile?.full_name || p.author_id })),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { dryRun } = await request.json().catch(() => ({ dryRun: false }));

    const { topic, error: topicError } = await getIntroTopic();
    if (topicError || !topic?.id) {
      return NextResponse.json({ success: false, error: 'Intro topic niet gevonden', details: topicError?.message }, { status: 404 });
    }

    const { posts, profilesMap, error } = await fetchPostsWithProfiles(topic.id);
    if (error && !posts) {
      return NextResponse.json({ success: false, error: 'Posts konden niet worden opgehaald', details: error.message }, { status: 500 });
    }

    const withAuthors = (posts || []).map((p: any) => ({
      ...p,
      profile: profilesMap.get(p.author_id) || null,
    }));

    const keep = withAuthors.filter(p => isKeepProfile(p.profile) || isKeepByContent(p.content));
    const toDelete = withAuthors.filter(p => !(isKeepProfile(p.profile) || isKeepByContent(p.content)));

    let deletedCount = 0;
    let errors: Array<{ id: string; error: string }> = [];

    if (!dryRun && toDelete.length > 0) {
      // Delete in chunks to avoid too-large IN lists
      const chunkSize = 100;
      for (let i = 0; i < toDelete.length; i += chunkSize) {
        const chunk = toDelete.slice(i, i + chunkSize);
        const ids = chunk.map(p => p.id);
        const { error: delErr, count } = await supabase
          .from('forum_posts')
          .delete({ count: 'exact' })
          .in('id', ids);
        if (delErr) {
          errors.push({ id: `${ids[0]}..${ids[ids.length - 1]}`, error: delErr.message });
        } else {
          deletedCount += count || ids.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      topicId: topic.id,
      dryRun: !!dryRun,
      counts: {
        total: withAuthors.length,
        keep: keep.length,
        toDelete: toDelete.length,
        deleted: dryRun ? 0 : deletedCount,
      },
      errors,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
