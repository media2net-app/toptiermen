import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching social feed posts from database...');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('social_feed_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: posts, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching social feed posts:', error);
      return NextResponse.json({ error: `Failed to fetch posts: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Social feed posts fetched successfully:', posts?.length || 0, 'posts');
    return NextResponse.json({ success: true, posts: posts || [] });

  } catch (error) {
    console.error('❌ Error in social feed posts API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating new social feed post...');
    
    const body = await request.json();
    const { content, author_id, media_url, media_type, is_announcement, cta_button_text, cta_button_link } = body;

    if (!content || !author_id) {
      return NextResponse.json({ error: 'Content and author_id are required' }, { status: 400 });
    }

    const { data: post, error } = await supabaseAdmin
      .from('social_feed_posts')
      .insert({
        content,
        author_id,
        media_url,
        media_type,
        is_announcement: is_announcement || false,
        cta_button_text,
        cta_button_link
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating social feed post:', error);
      return NextResponse.json({ error: `Failed to create post: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Social feed post created successfully:', post.id);
    return NextResponse.json({ success: true, post });

  } catch (error) {
    console.error('❌ Error in social feed posts POST API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
} 