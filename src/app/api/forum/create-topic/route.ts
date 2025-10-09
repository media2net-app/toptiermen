import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { category_id, title, content, author_id } = await request.json();

    console.log('📝 Creating forum topic via API:', { category_id, title, content, author_id });

    // Validate input
    if (!category_id || !title || !content || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields: category_id, title, content, author_id' },
        { status: 400 }
      );
    }

    // First, get the category slug for URL building
    const { data: category, error: categoryError } = await supabaseAdmin
      .from('forum_categories')
      .select('slug')
      .eq('id', category_id)
      .single();

    if (categoryError || !category) {
      console.error('❌ Error fetching category:', categoryError);
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Create the topic using service role
    const { data: topic, error: topicError } = await supabaseAdmin
      .from('forum_topics')
      .insert({
        category_id,
        title: title.trim(),
        content: content.trim(), // Add content field for the topic
        author_id,
        reply_count: 0
      })
      .select('id, title, created_at, author_id, category_id')
      .single();

    if (topicError) {
      console.error('❌ Error creating forum topic:', topicError);
      return NextResponse.json(
        { error: topicError.message },
        { status: 500 }
      );
    }

    // Create the first post (initial message) for this topic
    const { data: post, error: postError } = await supabaseAdmin
      .from('forum_posts')
      .insert({
        topic_id: topic.id,
        content: content.trim(),
        author_id
      })
      .select('id')
      .single();

    if (postError) {
      console.error('❌ Error creating initial forum post:', postError);
      // Rollback topic creation if post creation fails
      await supabaseAdmin.from('forum_topics').delete().eq('id', topic.id);
      return NextResponse.json(
        { error: postError.message },
        { status: 500 }
      );
    }

    console.log('✅ Forum topic created successfully:', topic.id);
    console.log('✅ Initial post created successfully:', post.id);

    return NextResponse.json({
      success: true,
      data: {
        topic,
        post,
        url: `/dashboard/brotherhood/forum/${category.slug}/thread/${topic.id}`
      }
    });

  } catch (error) {
    console.error('❌ Error in create-topic API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

