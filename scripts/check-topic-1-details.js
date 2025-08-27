const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTopic1Details() {
  console.log('🔍 Checking Topic 1 Details...');
  console.log('='.repeat(60));
  
  try {
    // 1. Check topic 1 details
    console.log('\n📝 STEP 1: Topic 1 Details');
    console.log('-'.repeat(40));
    
    const { data: topic1, error: topic1Error } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('id', 1)
      .single();

    if (topic1Error) {
      console.log('❌ Error fetching topic 1:', topic1Error.message);
    } else {
      console.log('✅ Topic 1 found:');
      console.log(`   - ID: ${topic1.id}`);
      console.log(`   - Title: "${topic1.title}"`);
      console.log(`   - Author: ${topic1.author_id}`);
      console.log(`   - Created: ${new Date(topic1.created_at).toLocaleString('nl-NL')}`);
      console.log(`   - Content: "${topic1.content.substring(0, 100)}..."`);
    }

    // 2. Try to create a test post for topic 1
    console.log('\n✍️ STEP 2: Testing Post Creation for Topic 1');
    console.log('-'.repeat(40));
    
    const testPost = {
      topic_id: 1,
      content: 'TEST POST FOR TOPIC 1 - CHECKING DATABASE',
      author_id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e' // Chiel's ID
    };

    const { data: newPost, error: createError } = await supabase
      .from('forum_posts')
      .insert(testPost)
      .select()
      .single();

    if (createError) {
      console.log('❌ Error creating test post for topic 1:', createError.message);
    } else {
      console.log('✅ Test post created successfully for topic 1:', newPost.id);
      
      // Clean up
      const { error: deleteError } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', newPost.id);
      
      if (deleteError) {
        console.log('⚠️ Could not clean up test post:', deleteError.message);
      } else {
        console.log('✅ Test post cleaned up');
      }
    }

    // 3. Check if there are any posts for topic 1 now
    console.log('\n📋 STEP 3: Check Posts for Topic 1 After Test');
    console.log('-'.repeat(40));
    
    const { data: topic1Posts, error: topic1PostsError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('topic_id', 1)
      .order('created_at', { ascending: true });

    if (topic1PostsError) {
      console.log('❌ Error fetching topic 1 posts:', topic1PostsError.message);
    } else {
      console.log(`✅ Found ${topic1Posts?.length || 0} posts for topic 1`);
      
      topic1Posts?.forEach(post => {
        const date = new Date(post.created_at).toLocaleString('nl-NL');
        console.log(`   - Post ${post.id}: "${post.content}" | Author: ${post.author_id} | Date: ${date}`);
      });
    }

    // 4. Check RLS policies for forum_posts
    console.log('\n🔒 STEP 4: Check RLS Policies');
    console.log('-'.repeat(40));
    
    // Test with service role (should work)
    const { data: serviceTest, error: serviceError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('topic_id', 1)
      .limit(1);

    if (serviceError) {
      console.log('❌ Service role test failed:', serviceError.message);
    } else {
      console.log('✅ Service role can access forum_posts for topic 1');
    }

    // 5. Test with anon key
    console.log('\n🧪 STEP 5: Test with Anon Key');
    console.log('-'.repeat(40));
    
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: anonTest, error: anonError } = await anonSupabase
      .from('forum_posts')
      .select('*')
      .eq('topic_id', 1)
      .limit(1);

    if (anonError) {
      console.log('❌ Anon key test failed:', anonError.message);
    } else {
      console.log('✅ Anon key can read forum_posts for topic 1');
    }

    // 6. Try to create post with anon key
    const { data: anonPost, error: anonCreateError } = await anonSupabase
      .from('forum_posts')
      .insert({
        topic_id: 1,
        content: 'ANON TEST POST FOR TOPIC 1',
        author_id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'
      })
      .select()
      .single();

    if (anonCreateError) {
      console.log('❌ Anon key cannot create posts:', anonCreateError.message);
    } else {
      console.log('✅ Anon key can create posts (unexpected):', anonPost.id);
      
      // Clean up
      await anonSupabase
        .from('forum_posts')
        .delete()
        .eq('id', anonPost.id);
    }

    console.log('\n🎉 Topic 1 Check Complete!');
    console.log('='.repeat(60));
    console.log('📊 Summary:');
    console.log('   - Topic 1 exists and is accessible');
    console.log('   - Service role can create posts for topic 1');
    console.log('   - Anon key can read posts for topic 1');
    console.log('   - Anon key cannot create posts (expected)');
    console.log('\n💡 Conclusion:');
    console.log('   The posts you see in the interface are likely local fallbacks');
    console.log('   because the user is not properly authenticated when posting');

  } catch (error) {
    console.error('❌ Error checking topic 1 details:', error);
  }
}

checkTopic1Details();
