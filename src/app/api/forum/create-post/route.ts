import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { topic_id, content, author_id } = await request.json();

    console.log('📝 Creating forum post via API:', { topic_id, content, author_id });

    // Validate input
    if (!topic_id || !content || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields: topic_id, content, author_id' },
        { status: 400 }
      );
    }

    // Create the post using service role
    const { data: post, error } = await supabase
      .from('forum_posts')
      .insert({
        topic_id,
        content: content.trim(),
        author_id
      })
      .select('id, content, created_at, author_id')
      .single();

    if (error) {
      console.error('❌ Error creating forum post:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Forum post created successfully on live:', post.id);

    return NextResponse.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('❌ Error in create-post API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
