import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic_id, author_id, content } = body;

    console.log('📝 API: Creating forum post:', { topic_id, author_id, content });

    if (!topic_id || !author_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: topic_id, author_id, content' },
        { status: 400 }
      );
    }

    // Insert the forum post using service role key (bypasses RLS)
    const { data, error } = await supabase
      .from('forum_posts')
      .insert([{
        topic_id,
        author_id,
        content: content.trim()
      }])
      .select('*')
      .single();

    console.log('💬 API: Post insert result:', { data, error });

    if (error) {
      console.error('❌ API: Error creating post:', error);
      return NextResponse.json(
        { error: 'Failed to create forum post', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ API: Post created successfully:', data);

    // Update the topic's reply count (skip for now to avoid errors)
    // const { error: updateError } = await supabase
    //   .from('forum_topics')
    //   .update({ reply_count: supabase.raw('reply_count + 1') })
    //   .eq('id', topic_id);

    // if (updateError) {
    //   console.error('❌ API: Error updating reply count:', updateError);
    // } else {
    //   console.log('✅ API: Topic reply count updated successfully');
    // }

    return NextResponse.json({
      success: true,
      post: data
    });

  } catch (error) {
    console.error('❌ API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic_id = searchParams.get('topic_id');

    if (!topic_id) {
      return NextResponse.json(
        { error: 'Missing topic_id parameter' },
        { status: 400 }
      );
    }

    console.log('📝 API: Fetching forum posts for topic:', topic_id);

    // Fetch posts with author profile information using service role key (bypasses RLS)
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        profiles!forum_posts_author_id_fkey(
          id,
          full_name,
          first_name,
          last_name,
          username,
          email
        )
      `)
      .eq('topic_id', topic_id)
      .order('created_at', { ascending: true });

    console.log('💬 API: Posts fetch result:', { data, error });

    if (error) {
      console.error('❌ API: Error fetching posts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch forum posts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      posts: data || []
    });

  } catch (error) {
    console.error('❌ API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
