import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const topic_id = body?.topic_id ?? body?.id ?? body?.topicId;

    if (!topic_id || isNaN(Number(topic_id))) {
      return NextResponse.json({ success: false, error: 'topic_id is vereist' }, { status: 400 });
    }

    const tid = Number(topic_id);

    // Delete posts for this topic first
    const { error: postsErr } = await supabaseAdmin
      .from('forum_posts')
      .delete()
      .eq('topic_id', tid);
    if (postsErr) {
      return NextResponse.json({ success: false, error: postsErr.message }, { status: 500 });
    }

    // Delete the topic
    const { error: topicErr } = await supabaseAdmin
      .from('forum_topics')
      .delete()
      .eq('id', tid);
    if (topicErr) {
      return NextResponse.json({ success: false, error: topicErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}
