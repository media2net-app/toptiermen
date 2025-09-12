import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    let query = supabase
      .from('social_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching social posts:', error);
      return NextResponse.json({ error: 'Failed to fetch social posts' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      posts: posts || [],
      count: posts?.length || 0
    });
  } catch (error) {
    console.error('Error in social posts GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, postType = 'text', category, isIntroduction = false } = body;

    if (!content || !category) {
      return NextResponse.json({ 
        error: 'Content and category are required' 
      }, { status: 400 });
    }

    // Get user from session (this would need to be implemented with proper auth)
    // For now, we'll use a test user ID
    const testUserId = '35ca4f47-4b9d-4b68-98d8-acbbc0428cad'; // chieltest user

    const { data: post, error } = await supabase
      .from('social_posts')
      .insert({
        user_id: testUserId,
        content,
        post_type: postType,
        is_public: true
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating social post:', error);
      return NextResponse.json({ error: 'Failed to create social post' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      post 
    });
  } catch (error) {
    console.error('Error in social posts POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
