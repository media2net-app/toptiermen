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

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category_slug');

    if (!categorySlug) {
      return NextResponse.json({ error: 'Category slug is required' }, { status: 400 });
    }

    // First, get the category by slug
    const { data: categoryData, error: categoryError } = await supabaseAdmin
      .from('forum_categories')
      .select('*')
      .eq('slug', categorySlug)
      .single();

    if (categoryError) {
      console.error('❌ Error fetching category:', categoryError);
      return NextResponse.json({ error: `Category niet gevonden: ${categoryError.message}` }, { status: 404 });
    }

    // Then fetch topics for this category
    const { data: topicsData, error: topicsError } = await supabaseAdmin
      .from('forum_topics')
      .select(`
        id,
        title,
        created_at,
        last_reply_at,
        reply_count,
        view_count,
        author_id
      `)
      .eq('category_id', categoryData.id)
      .order('created_at', { ascending: false });

    if (topicsError) {
      console.error('❌ Error fetching topics:', topicsError);
      return NextResponse.json({ error: `Error fetching topics: ${topicsError.message}` }, { status: 500 });
    }

    if (!topicsData || topicsData.length === 0) {
      return NextResponse.json({ 
        success: true, 
        category: categoryData, 
        topics: [],
        userProfiles: {}
      });
    }

    // Collect all user IDs
    const userIds = new Set<string>();
    topicsData.forEach(topic => {
      if (topic.author_id) userIds.add(topic.author_id);
    });

    // Fetch user profiles
    let userProfiles: Record<string, any> = {};
    if (userIds.size > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(userIds));

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
      } else {
        profiles?.forEach(profile => {
          userProfiles[profile.id] = profile;
        });
      }
    }

    // Helper function to get author info
    const getAuthorInfo = (authorId: string) => {
      const profile = userProfiles[authorId];
      if (profile) {
        const nameParts = profile.full_name.split(' ');
        return {
          first_name: nameParts[0] || 'User',
          last_name: nameParts.slice(1).join(' ') || '',
          avatar_url: profile.avatar_url
        };
      }
      return {
        first_name: 'User',
        last_name: '',
        avatar_url: undefined
      };
    };

    const processedTopics = topicsData.map((topic: any) => ({
      id: topic.id,
      title: topic.title,
      created_at: topic.created_at,
      last_reply_at: topic.last_reply_at,
      reply_count: topic.reply_count || 0,
      view_count: topic.view_count || 0,
      author: getAuthorInfo(topic.author_id)
    }));

    return NextResponse.json({ 
      success: true, 
      category: categoryData, 
      topics: processedTopics,
      userProfiles
    });

  } catch (error) {
    console.error('❌ Error in forum topics API:', error);
    return NextResponse.json({ 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
