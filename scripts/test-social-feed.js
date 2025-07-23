const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSocialFeed() {
  console.log('🔍 Testing social feed functionality...');
  
  try {
    // Test 1: Check if social_posts table exists and has data
    console.log('\n📋 Test 1: Checking social_posts table');
    const { data: posts, error: postsError } = await supabase
      .from('social_posts')
      .select('*')
      .limit(5);
    
    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
    } else {
      console.log('✅ Found', posts.length, 'posts:');
      posts.forEach(post => {
        console.log(`  - ${post.content.substring(0, 50)}... (${post.post_type})`);
      });
    }
    
    // Test 2: Check if social_likes table exists and has data
    console.log('\n📋 Test 2: Checking social_likes table');
    const { data: likes, error: likesError } = await supabase
      .from('social_likes')
      .select('*')
      .limit(5);
    
    if (likesError) {
      console.error('❌ Error fetching likes:', likesError);
    } else {
      console.log('✅ Found', likes.length, 'likes:');
      likes.forEach(like => {
        console.log(`  - Like type: ${like.like_type} on post ${like.post_id}`);
      });
    }
    
    // Test 3: Check if social_comments table exists and has data
    console.log('\n📋 Test 3: Checking social_comments table');
    const { data: comments, error: commentsError } = await supabase
      .from('social_comments')
      .select('*')
      .limit(5);
    
    if (commentsError) {
      console.error('❌ Error fetching comments:', commentsError);
    } else {
      console.log('✅ Found', comments.length, 'comments:');
      comments.forEach(comment => {
        console.log(`  - ${comment.content.substring(0, 50)}...`);
      });
    }
    
    // Test 4: Check if social_follows table exists and has data
    console.log('\n📋 Test 4: Checking social_follows table');
    const { data: follows, error: followsError } = await supabase
      .from('social_follows')
      .select('*')
      .limit(5);
    
    if (followsError) {
      console.error('❌ Error fetching follows:', followsError);
    } else {
      console.log('✅ Found', follows.length, 'follows:');
      follows.forEach(follow => {
        console.log(`  - User ${follow.follower_id} follows ${follow.following_id}`);
      });
    }
    
    // Test 5: Test complex query (like the one used in the page)
    console.log('\n📋 Test 5: Testing complex query with user data');
    const { data: complexData, error: complexError } = await supabase
      .from('social_posts')
      .select(`
        *,
        user:profiles!social_posts_user_id_fkey(
          id,
          full_name,
          avatar_url,
          rank
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (complexError) {
      console.error('❌ Error with complex query:', complexError);
    } else {
      console.log('✅ Complex query successful:');
      complexData.forEach(post => {
        console.log(`  - Post by ${post.user?.full_name || 'Unknown'}: ${post.content.substring(0, 50)}...`);
      });
    }
    
    console.log('\n🎉 Social feed test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSocialFeed(); 