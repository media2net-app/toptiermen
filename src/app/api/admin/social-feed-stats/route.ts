import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching social feed stats from database...');

    // Get posts stats
    const { data: postsData, error: postsError } = await supabaseAdmin
      .from('social_feed_posts')
      .select('status, likes_count, comments_count');

    if (postsError) {
      console.error('❌ Error fetching posts stats:', postsError);
      return NextResponse.json({ error: 'Failed to fetch posts stats' }, { status: 500 });
    }

    // Get reports stats
    const { data: reportsData, error: reportsError } = await supabaseAdmin
      .from('social_feed_reports')
      .select('status');

    if (reportsError) {
      console.error('❌ Error fetching reports stats:', reportsError);
      return NextResponse.json({ error: 'Failed to fetch reports stats' }, { status: 500 });
    }

    // Calculate stats
    const totalPosts = postsData?.length || 0;
    const activePosts = postsData?.filter(p => p.status === 'active').length || 0;
    const hiddenPosts = postsData?.filter(p => p.status === 'hidden').length || 0;
    
    const totalReports = reportsData?.length || 0;
    const pendingReports = reportsData?.filter(r => r.status === 'pending').length || 0;
    const resolvedReports = reportsData?.filter(r => r.status === 'resolved').length || 0;

    // Calculate engagement
    const totalLikes = postsData?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;
    const totalComments = postsData?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0;
    const totalEngagement = totalLikes + totalComments;
    const averageEngagement = totalPosts > 0 ? Math.round((totalEngagement / totalPosts) * 10) / 10 : 0;

    const stats = {
      totalPosts,
      activePosts,
      hiddenPosts,
      totalReports,
      pendingReports,
      resolvedReports,
      totalEngagement,
      averageEngagement
    };

    console.log('✅ Social feed stats calculated:', stats);
    return NextResponse.json({ success: true, stats });

  } catch (error) {
    console.error('❌ Error in social feed stats API:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 