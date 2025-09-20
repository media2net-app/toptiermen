import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting forum posts cleanup...');

    // Frodo's author ID (the one we want to keep)
    const frodoAuthorId = 'f58e8d0f-595a-4a90-bf83-7da5a3ff2db8';
    const topicId = 19; // Voorstellen - Nieuwe Leden topic

    // Get all posts for this topic
    const { data: posts, error: fetchError } = await supabase
      .from('forum_posts')
      .select('id, author_id, content')
      .eq('topic_id', topicId);

    if (fetchError) {
      console.error('❌ Error fetching posts:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    console.log(`📋 Found ${posts.length} posts in topic ${topicId}`);

    // Filter posts to delete (all except Frodo's)
    const postsToDelete = posts.filter(post => post.author_id !== frodoAuthorId);
    const frodoPosts = posts.filter(post => post.author_id === frodoAuthorId);

    console.log(`✅ Keeping ${frodoPosts.length} posts from Frodo:`);
    frodoPosts.forEach(post => {
      console.log(`   - ID ${post.id}: "${post.content.substring(0, 50)}..."`);
    });

    console.log(`🗑️ Deleting ${postsToDelete.length} test posts:`);
    postsToDelete.forEach(post => {
      console.log(`   - ID ${post.id}: "${post.content.substring(0, 50)}..."`);
    });

    if (postsToDelete.length === 0) {
      console.log('✅ No posts to delete. Only Frodo\'s posts remain.');
      return NextResponse.json({ 
        success: true, 
        message: 'No posts to delete. Only Frodo\'s posts remain.',
        kept: frodoPosts.length,
        deleted: 0
      });
    }

    // Delete the test posts
    const postIdsToDelete = postsToDelete.map(post => post.id);
    
    const { error: deleteError } = await supabase
      .from('forum_posts')
      .delete()
      .in('id', postIdsToDelete);

    if (deleteError) {
      console.error('❌ Error deleting posts:', deleteError);
      return NextResponse.json({ error: 'Failed to delete posts' }, { status: 500 });
    }

    console.log(`🎉 Successfully deleted ${postsToDelete.length} test posts!`);
    console.log(`✅ Only Frodo's posts remain in the forum.`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${postsToDelete.length} test posts`,
      kept: frodoPosts.length,
      deleted: postsToDelete.length,
      deletedPosts: postsToDelete.map(p => ({ id: p.id, content: p.content.substring(0, 50) + '...' }))
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
