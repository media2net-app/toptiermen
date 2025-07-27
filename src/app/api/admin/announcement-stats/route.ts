import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    console.log('📢 Fetching announcement statistics...');

    // Get total announcements
    const { count: totalAnnouncements, error: totalError } = await supabaseAdmin
      .from('announcements')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error fetching total announcements:', totalError);
      return NextResponse.json({ error: 'Failed to fetch announcement stats' }, { status: 500 });
    }

    // Get published announcements
    const { count: publishedAnnouncements, error: publishedError } = await supabaseAdmin
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    if (publishedError) {
      console.error('Error fetching published announcements:', publishedError);
      return NextResponse.json({ error: 'Failed to fetch announcement stats' }, { status: 500 });
    }

    // Get draft announcements
    const { count: draftAnnouncements, error: draftError } = await supabaseAdmin
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');

    if (draftError) {
      console.error('Error fetching draft announcements:', draftError);
      return NextResponse.json({ error: 'Failed to fetch announcement stats' }, { status: 500 });
    }

    // Get pinned announcements
    const { count: pinnedAnnouncements, error: pinnedError } = await supabaseAdmin
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .eq('is_pinned', true);

    if (pinnedError) {
      console.error('Error fetching pinned announcements:', pinnedError);
      return NextResponse.json({ error: 'Failed to fetch announcement stats' }, { status: 500 });
    }

    // Get total views
    const { count: totalViews, error: viewsError } = await supabaseAdmin
      .from('announcement_views')
      .select('*', { count: 'exact', head: true });

    if (viewsError) {
      console.error('Error fetching total views:', viewsError);
      // Don't fail completely, just set to 0
    }

    // Get categories count
    const { count: totalCategories, error: categoriesError } = await supabaseAdmin
      .from('announcement_categories')
      .select('*', { count: 'exact', head: true });

    if (categoriesError) {
      console.error('Error fetching categories count:', categoriesError);
      return NextResponse.json({ error: 'Failed to fetch announcement stats' }, { status: 500 });
    }

    // Get recent announcements (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentAnnouncements, error: recentError } = await supabaseAdmin
      .from('announcements')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    if (recentError) {
      console.error('Error fetching recent announcements:', recentError);
      // Don't fail completely, just set to 0
    }

    const stats = {
      totalAnnouncements: totalAnnouncements || 0,
      publishedAnnouncements: publishedAnnouncements || 0,
      draftAnnouncements: draftAnnouncements || 0,
      pinnedAnnouncements: pinnedAnnouncements || 0,
      totalViews: totalViews || 0,
      totalCategories: totalCategories || 0,
      recentAnnouncements: recentAnnouncements || 0
    };

    console.log('📊 Announcement stats calculated:', stats);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching announcement stats:', error);
    return NextResponse.json({
      error: 'Failed to fetch announcement stats'
    }, { status: 500 });
  }
} 