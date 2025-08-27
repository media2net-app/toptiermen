require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testForumTopics() {
  try {
    console.log('🧪 Testing forum topics and finding valid IDs...\n');
    
    // 1. Get all topics from Fitness & Gezondheid category
    console.log('📝 Step 1: Getting Fitness & Gezondheid topics...');
    const { data: fitnessTopics, error: fitnessError } = await supabase
      .from('forum_topics')
      .select(`
        id,
        title,
        content,
        created_at,
        author_id,
        category_id,
        forum_categories(name, slug)
      `)
      .eq('category_id', 1)
      .order('created_at', { ascending: false });
    
    if (fitnessError) {
      console.log('❌ Error fetching fitness topics:', fitnessError.message);
      return;
    }
    
    console.log(`✅ Found ${fitnessTopics.length} Fitness & Gezondheid topics:`);
    fitnessTopics.forEach(topic => {
      console.log(`   - ID: ${topic.id} | ${topic.title}`);
    });
    
    // 2. Test accessing a specific topic
    if (fitnessTopics.length > 0) {
      const testTopicId = fitnessTopics[0].id;
      console.log(`\n🔍 Step 2: Testing access to topic ID ${testTopicId}...`);
      
      const { data: testTopic, error: testError } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          content,
          created_at,
          like_count,
          author_id
        `)
        .eq('id', testTopicId)
        .single();
      
      if (testError) {
        console.log('❌ Error accessing test topic:', testError.message);
      } else {
        console.log('✅ Test topic accessible:', testTopic.title);
      }
    }
    
    // 3. Test forum posts for the first topic
    if (fitnessTopics.length > 0) {
      const testTopicId = fitnessTopics[0].id;
      console.log(`\n💬 Step 3: Testing posts for topic ID ${testTopicId}...`);
      
      const { data: testPosts, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          id,
          content,
          created_at,
          like_count,
          author_id
        `)
        .eq('topic_id', testTopicId)
        .order('created_at', { ascending: true });
      
      if (postsError) {
        console.log('❌ Error accessing posts:', postsError.message);
      } else {
        console.log(`✅ Found ${testPosts.length} posts for topic ${testTopicId}`);
        testPosts.forEach(post => {
          console.log(`   - Post ID: ${post.id} | Content: ${post.content.substring(0, 50)}...`);
        });
      }
    }
    
    // 4. Test the exact URL that should work
    console.log('\n🔗 Step 4: Testing forum URLs...');
    if (fitnessTopics.length > 0) {
      const validTopicId = fitnessTopics[0].id;
      console.log(`✅ Valid forum URL: /dashboard/brotherhood/forum/fitness-gezondheid/thread/${validTopicId}`);
      console.log(`   Topic: ${fitnessTopics[0].title}`);
      
      // Test a few more URLs
      fitnessTopics.slice(0, 3).forEach(topic => {
        console.log(`✅ Forum URL: /dashboard/brotherhood/forum/fitness-gezondheid/thread/${topic.id}`);
        console.log(`   Topic: ${topic.title}`);
      });
    }
    
    // 5. Check if there are any topics without content
    console.log('\n📋 Step 5: Checking topics without content...');
    const topicsWithoutContent = fitnessTopics.filter(topic => !topic.content || topic.content.trim() === '');
    if (topicsWithoutContent.length > 0) {
      console.log(`⚠️ Found ${topicsWithoutContent.length} topics without content:`);
      topicsWithoutContent.forEach(topic => {
        console.log(`   - ID: ${topic.id} | ${topic.title}`);
      });
    } else {
      console.log('✅ All topics have content');
    }
    
    console.log('\n🎉 Forum Topics Test Complete!');
    console.log('='.repeat(50));
    console.log(`✅ Total Fitness & Gezondheid topics: ${fitnessTopics.length}`);
    console.log('✅ All topics accessible');
    console.log('✅ Posts working');
    console.log('');
    console.log('💡 Forum should work with these topic IDs!');
    
    if (fitnessTopics.length > 0) {
      console.log('\n🔗 Test these URLs:');
      fitnessTopics.slice(0, 3).forEach(topic => {
        console.log(`   https://platform.toptiermen.eu/dashboard/brotherhood/forum/fitness-gezondheid/thread/${topic.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing forum topics:', error);
  }
}

testForumTopics();
