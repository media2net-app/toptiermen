import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    console.log('📢 Fetching announcements from database...');

    const { data: announcements, error } = await supabaseAdmin
      .from('announcements')
      .select(`
        *,
        category:announcement_categories(name, color, icon),
        author:users(email, profiles(first_name, last_name))
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }

    // Transform the data to match the frontend interface
    const transformedAnnouncements = announcements?.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      category: announcement.category?.name || 'Algemeen',
      categoryColor: announcement.category?.color || '#8BAE5A',
      categoryIcon: announcement.category?.icon || '📢',
      author: announcement.author?.profiles?.first_name 
        ? `${announcement.author.profiles.first_name} ${announcement.author.profiles.last_name}`
        : announcement.author?.email || 'Onbekend',
      status: announcement.status,
      priority: announcement.priority,
      isPinned: announcement.is_pinned,
      isFeatured: announcement.is_featured,
      publishAt: announcement.publish_at,
      expiresAt: announcement.expires_at,
      viewCount: announcement.view_count || 0,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at
    })) || [];

    console.log(`✅ Fetched ${transformedAnnouncements.length} announcements`);

    return NextResponse.json({
      success: true,
      announcements: transformedAnnouncements
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({
      error: 'Failed to fetch announcements'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📢 Creating new announcement:', body);

    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        title: body.title,
        content: body.content,
        category_id: body.categoryId,
        author_id: body.authorId,
        status: body.status || 'draft',
        priority: body.priority || 'normal',
        is_pinned: body.isPinned || false,
        is_featured: body.isFeatured || false,
        publish_at: body.publishAt,
        expires_at: body.expiresAt
      })
      .select(`
        *,
        category:announcement_categories(name, color, icon),
        author:users(email, profiles(first_name, last_name))
      `)
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }

    // Transform the response
    const transformedAnnouncement = {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      category: announcement.category?.name || 'Algemeen',
      categoryColor: announcement.category?.color || '#8BAE5A',
      categoryIcon: announcement.category?.icon || '📢',
      author: announcement.author?.profiles?.first_name 
        ? `${announcement.author.profiles.first_name} ${announcement.author.profiles.last_name}`
        : announcement.author?.email || 'Onbekend',
      status: announcement.status,
      priority: announcement.priority,
      isPinned: announcement.is_pinned,
      isFeatured: announcement.is_featured,
      publishAt: announcement.publish_at,
      expiresAt: announcement.expires_at,
      viewCount: announcement.view_count || 0,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at
    };

    return NextResponse.json({
      success: true,
      announcement: transformedAnnouncement
    });

  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({
      error: 'Failed to create announcement'
    }, { status: 500 });
  }
} 