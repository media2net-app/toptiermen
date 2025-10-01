import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting forum posts cleanup...');
    const topicId = 19; // Voorstellen - Nieuwe Leden / Algemeen voorstellen

    // Resolve authors to keep by name from profiles (fallback to manual names in content)
    const keepAuthorNames = ['Frodo van Houten', 'Sten Mets'];
    const { data: authors, error: authorsErr } = await supabase
      .from('profiles')
      .select('id, full_name, display_name')
      .in('full_name', keepAuthorNames);
    if (authorsErr) console.warn('⚠️ Error fetching authors:', authorsErr.message);
    const keepAuthorIds = new Set((authors || []).map(a => a.id));

    // Fetch all posts for the topic
    const { data: posts, error: fetchError } = await supabase
      .from('forum_posts')
      .select('id, author_id, content')
      .eq('topic_id', topicId);

    if (fetchError) {
      console.error('❌ Error fetching posts:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    console.log(`📋 Found ${posts.length} posts in topic ${topicId}`);

    // Target excerpts to match the exact two messages
    const frodoSnippet = 'Hallo allemaal, ik ben Frodo van Houten';
    const stenSnippet = 'Mijn naam is Sten Mets';

    const keep = posts.filter(p => {
      const text = (p.content || '').toLowerCase();
      const isAuthorKept = keepAuthorIds.has(p.author_id);
      const matchesSnippet = text.includes(frodoSnippet.toLowerCase()) || text.includes(stenSnippet.toLowerCase());
      // Keep if author matches and content matches expected snippet
      return isAuthorKept && matchesSnippet;
    });
    const keepIds = new Set(keep.map(p => p.id));
    const postsToDelete = posts.filter(p => !keepIds.has(p.id));

    console.log(`✅ Keeping ${keep.length} target posts (Frodo & Sten).`);
    keep.forEach(p => console.log(`   • Keep ID ${p.id}: "${(p.content||'').substring(0, 60)}..."`));
    console.log(`🗑️ Deleting ${postsToDelete.length} other posts.`);
    postsToDelete.forEach(p => console.log(`   • Delete ID ${p.id}: "${(p.content||'').substring(0, 60)}..."`));

    if (postsToDelete.length === 0) {
      console.log('✅ No posts to delete. Only target posts remain.');
      return NextResponse.json({ 
        success: true, 
        message: 'No posts to delete. Only target posts remain.',
        kept: keep.length,
        deleted: 0,
        keptIds: Array.from(keepIds)
      });
    }

    // Delete all other posts
    const postIdsToDelete = postsToDelete.map(post => post.id);
    if (postIdsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('forum_posts')
        .delete()
        .in('id', postIdsToDelete);
      if (deleteError) {
        console.error('❌ Error deleting posts:', deleteError);
        return NextResponse.json({ error: 'Failed to delete posts' }, { status: 500 });
      }
    }

    console.log(`🎉 Successfully deleted ${postsToDelete.length} posts!`);
    console.log(`✅ Only Frodo & Sten target posts remain in the forum.`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${postsToDelete.length} posts`,
      kept: keep.length,
      deleted: postsToDelete.length,
      deletedPosts: postsToDelete.map(p => ({ id: p.id, content: (p.content||'').substring(0, 50) + '...' })),
      keptIds: Array.from(keepIds)
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
