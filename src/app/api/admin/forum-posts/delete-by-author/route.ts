import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_TASK_TOKEN = process.env.ADMIN_TASK_TOKEN;

const supabase = createClient(supabaseUrl, serviceKey);

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-task-token');
    if (!ADMIN_TASK_TOKEN || token !== ADMIN_TASK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      category_slug = 'algemeen',
      topic_title = '👋 Voorstellen - Nieuwe Leden',
      author_exact_name,
      dryRun = false,
    } = body || {};

    if (!author_exact_name) {
      return NextResponse.json({ error: 'author_exact_name is required' }, { status: 400 });
    }

    // Resolve topic id by category slug and exact title
    const { data: topic, error: topicErr } = await supabase
      .from('forum_topics')
      .select('id, title, category_id, forum_categories!inner(slug)')
      .eq('title', topic_title)
      .eq('forum_categories.slug', category_slug)
      .single();

    if (topicErr || !topic) {
      return NextResponse.json({ error: 'Topic not found', details: topicErr?.message }, { status: 404 });
    }

    // Find profile IDs that match the exact full_name
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('full_name', author_exact_name);

    if (profErr) {
      return NextResponse.json({ error: 'Failed to fetch profiles', details: profErr.message }, { status: 500 });
    }

    const authorIds = (profiles || []).map(p => p.id);
    if (authorIds.length === 0) {
      return NextResponse.json({ success: true, deleted: 0, info: 'No profiles matched the exact name' });
    }

    // Preview posts to be deleted (for dryRun/support)
    const { data: postsToDelete, error: previewErr } = await supabase
      .from('forum_posts')
      .select('id, topic_id, author_id, created_at')
      .eq('topic_id', topic.id)
      .in('author_id', authorIds);

    if (previewErr) {
      return NextResponse.json({ error: 'Failed to preview posts', details: previewErr.message }, { status: 500 });
    }

    if (dryRun) {
      return NextResponse.json({ success: true, dryRun: true, count: postsToDelete?.length || 0, posts: postsToDelete || [] });
    }

    if (!postsToDelete || postsToDelete.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 });
    }

    const { error: delErr } = await supabase
      .from('forum_posts')
      .delete()
      .eq('topic_id', topic.id)
      .in('author_id', authorIds);

    if (delErr) {
      return NextResponse.json({ error: 'Failed to delete posts', details: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: postsToDelete.length, post_ids: postsToDelete.map(p => p.id) });
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal server error', details: String(e?.message || e) }, { status: 500 });
  }
}
