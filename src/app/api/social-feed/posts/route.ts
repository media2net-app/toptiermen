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

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Fetching social feed posts...');
    
    // Get posts with user info, likes count, and comments count
    const { data: postsData, error: postsError } = await supabaseAdmin
      .from('social_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
      return NextResponse.json({ 
        success: false, 
        error: postsError.message 
      }, { status: 500 });
    }

    console.log('✅ Posts fetched:', postsData?.length || 0);

    // Get user data for all posts
    const userIds = Array.from(new Set(postsData?.map(post => post.user_id) || []));
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url, rank')
      .in('id', userIds);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return NextResponse.json({ 
        success: false, 
        error: usersError.message 
      }, { status: 500 });
    }

    // Create a map for quick user lookup
    const usersMap = new Map();
    usersData?.forEach(user => {
      usersMap.set(user.id, user);
    });

    // Get likes count and comments count for each post
    const postsWithStats = await Promise.all(
      (postsData || []).map(async (post) => {
        // Get likes count
        const { count: likesCount, error: likesError } = await supabaseAdmin
          .from('social_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        if (likesError) {
          console.warn('⚠️ Error fetching likes for post:', post.id, likesError);
        }

        // Get comments count
        const { count: commentsCount, error: commentsError } = await supabaseAdmin
          .from('social_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        if (commentsError) {
          console.warn('⚠️ Error fetching comments for post:', post.id, commentsError);
        }

        // Get user data
        const userData = usersMap.get(post.user_id);
        
        return {
          id: post.id,
          content: post.content,
          post_type: post.post_type,
          location: post.location,
          image_url: post.image_url,
          video_url: post.video_url,
          tags: post.tags,
          created_at: post.created_at,
          user: userData ? {
            id: userData.id,
            full_name: userData.full_name,
            avatar_url: userData.avatar_url,
            rank: userData.rank
          } : {
            id: post.user_id,
            full_name: 'Unknown User',
            avatar_url: null,
            rank: 'Member'
          },
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          user_liked: false, // Will be set on client side based on current user
          user_like_type: null
        };
      })
    );

    console.log('✅ Posts processed:', postsWithStats.length);

    return NextResponse.json({
      success: true,
      posts: postsWithStats
    });

  } catch (error) {
    console.error('❌ Error in social feed API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

