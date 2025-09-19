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

    // Check if this is a post in the "Voorstellen - Nieuwe Leden" topic (topic_id 19)
    // If so, complete the onboarding for the user
    if (topic_id === 19) {
      console.log('🎉 User posted in introduction topic, completing onboarding...');
      
      try {
        // Update user_onboarding_status table
        const { error: onboardingError } = await supabase
          .from('user_onboarding_status')
          .update({ 
            challenge_started: true,
            onboarding_completed: true
          })
          .eq('user_id', author_id);
        
        if (onboardingError) {
          console.error('❌ API: Error completing onboarding in user_onboarding_status:', onboardingError);
        } else {
          console.log('✅ API: Onboarding completed in user_onboarding_status for user:', author_id);
        }

        // Also update profiles table to mark onboarding as completed
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            onboarding_completed: true
          })
          .eq('id', author_id);
        
        if (profileError) {
          console.error('❌ API: Error completing onboarding in profiles:', profileError);
        } else {
          console.log('✅ API: Onboarding completed in profiles for user:', author_id);
        }
      } catch (error) {
        console.error('❌ API: Error in onboarding completion:', error);
      }
    }

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

    // Fetch posts first
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('topic_id', topic_id)
      .order('created_at', { ascending: true });

    if (postsError) {
      console.error('❌ API: Error fetching posts:', postsError);
      return NextResponse.json(
        { error: 'Failed to fetch forum posts', details: postsError.message },
        { status: 500 }
      );
    }

    // If no posts, return empty array
    if (!posts || posts.length === 0) {
      return NextResponse.json({
        success: true,
        posts: []
      });
    }

    // Get unique author IDs
    const authorIds = [...new Set(posts.map(post => post.author_id))];
    
    // Fetch profiles for all authors
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', authorIds);

    if (profilesError) {
      console.error('❌ API: Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch author profiles', details: profilesError.message },
        { status: 500 }
      );
    }

    // Create a map of profiles by ID
    const profilesMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);

    // Combine posts with profile data
    const data = posts.map(post => ({
      ...post,
      profiles: profilesMap.get(post.author_id) || null
    }));

    console.log('💬 API: Posts fetch result:', { data });

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
