const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM0NzI4MDAwLCJleHAiOjIwNTAzMDQwMDB9.example';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupForumPosts() {
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
      return;
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
      return;
    }

    // Delete the test posts
    const postIdsToDelete = postsToDelete.map(post => post.id);
    
    const { error: deleteError } = await supabase
      .from('forum_posts')
      .delete()
      .in('id', postIdsToDelete);

    if (deleteError) {
      console.error('❌ Error deleting posts:', deleteError);
      return;
    }

    console.log(`🎉 Successfully deleted ${postsToDelete.length} test posts!`);
    console.log(`✅ Only Frodo's posts remain in the forum.`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupForumPosts();
