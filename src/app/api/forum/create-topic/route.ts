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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category_id, title, content, author_id } = body || {};

    // Validate input
    if (!category_id || !author_id || typeof title !== 'string' || typeof content !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const t = title.trim();
    const c = content.trim();
    if (t.length < 5 || t.length > 120) {
      return NextResponse.json({ success: false, error: 'Titel moet tussen 5 en 120 karakters zijn' }, { status: 400 });
    }
    if (c.length < 10 || c.length > 5000) {
      return NextResponse.json({ success: false, error: 'Bericht moet tussen 10 en 5000 karakters zijn' }, { status: 400 });
    }

    // Ensure category exists and get slug
    const { data: category, error: catErr } = await supabaseAdmin
      .from('forum_categories')
      .select('id, slug')
      .eq('id', category_id)
      .single();

    if (catErr || !category) {
      return NextResponse.json({ success: false, error: 'Categorie niet gevonden' }, { status: 404 });
    }

    // Insert topic
    const { data: topic, error: topicErr } = await supabaseAdmin
      .from('forum_topics')
      .insert({
        category_id: category_id,
        title: t,
        content: c,
        author_id: author_id
      })
      .select('id')
      .single();

    if (topicErr || !topic) {
      return NextResponse.json({ success: false, error: topicErr?.message || 'Aanmaken mislukt' }, { status: 500 });
    }

    const url = `/dashboard/brotherhood/forum/${category.slug}/thread/${topic.id}`;
    return NextResponse.json({ success: true, data: { id: topic.id, url } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Internal server error' }, { status: 500 });
  }
}
