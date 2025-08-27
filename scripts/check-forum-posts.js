const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkForumPosts() {
  console.log('🔍 Checking Forum Posts in Database...');
  console.log('='.repeat(60));
  
  try {
    // 1. Check all forum posts
    console.log('\n📝 STEP 1: All Forum Posts');
    console.log('-'.repeat(40));
    
    const { data: allPosts, error: allPostsError } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (allPostsError) {
      console.log('❌ Error fetching all posts:', allPostsError.message);
    } else {
      console.log(`✅ Found ${allPosts?.length || 0} total posts in database`);
      
      allPosts?.forEach(post => {
        const date = new Date(post.created_at).toLocaleString('nl-NL');
        console.log(`   - Post ${post.id}: Topic ${post.topic_id} | Author: ${post.author_id} | Date: ${date}`);
        console.log(`     Content: "${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}"`);
      });
    }

    // 2. Check posts for topic 1 (Categorie Regels)
    console.log('\n📋 STEP 2: Posts for Topic 1 (Categorie Regels)');
    console.log('-'.repeat(40));
    
    const { data: topic1Posts, error: topic1Error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('topic_id', 1)
      .order('created_at', { ascending: true });

    if (topic1Error) {
      console.log('❌ Error fetching topic 1 posts:', topic1Error.message);
    } else {
      console.log(`✅ Found ${topic1Posts?.length || 0} posts for topic 1`);
      
      topic1Posts?.forEach(post => {
        const date = new Date(post.created_at).toLocaleString('nl-NL');
        console.log(`   - Post ${post.id}: "${post.content}" | Author: ${post.author_id} | Date: ${date}`);
      });
    }

    // 3. Check recent posts (last 24 hours)
    console.log('\n🕒 STEP 3: Recent Posts (Last 24 Hours)');
    console.log('-'.repeat(40));
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentPosts, error: recentError } = await supabase
      .from('forum_posts')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    if (recentError) {
      console.log('❌ Error fetching recent posts:', recentError.message);
    } else {
      console.log(`✅ Found ${recentPosts?.length || 0} posts in last 24 hours`);
      
      recentPosts?.forEach(post => {
        const date = new Date(post.created_at).toLocaleString('nl-NL');
        console.log(`   - Post ${post.id}: Topic ${post.topic_id} | "${post.content.substring(0, 30)}..." | Date: ${date}`);
      });
    }

    // 4. Check posts by Chiel
    console.log('\n👤 STEP 4: Posts by Chiel (061e43d5-c89a-42bb-8a4c-04be2ce99a7e)');
    console.log('-'.repeat(40));
    
    const { data: chielPosts, error: chielError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('author_id', '061e43d5-c89a-42bb-8a4c-04be2ce99a7e')
      .order('created_at', { ascending: false });

    if (chielError) {
      console.log('❌ Error fetching Chiel posts:', chielError.message);
    } else {
      console.log(`✅ Found ${chielPosts?.length || 0} posts by Chiel`);
      
      chielPosts?.forEach(post => {
        const date = new Date(post.created_at).toLocaleString('nl-NL');
        console.log(`   - Post ${post.id}: Topic ${post.topic_id} | "${post.content}" | Date: ${date}`);
      });
    }

    // 5. Check posts by Rick
    console.log('\n👤 STEP 5: Posts by Rick (9d6aa8ba-58ab-4188-9a9f-09380a67eb0c)');
    console.log('-'.repeat(40));
    
    const { data: rickPosts, error: rickError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('author_id', '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c')
      .order('created_at', { ascending: false });

    if (rickError) {
      console.log('❌ Error fetching Rick posts:', rickError.message);
    } else {
      console.log(`✅ Found ${rickPosts?.length || 0} posts by Rick`);
      
      rickPosts?.forEach(post => {
        const date = new Date(post.created_at).toLocaleString('nl-NL');
        console.log(`   - Post ${post.id}: Topic ${post.topic_id} | "${post.content.substring(0, 30)}..." | Date: ${date}`);
      });
    }

    // 6. Check for test posts
    console.log('\n🧪 STEP 6: Test Posts (Looking for debug/test content)');
    console.log('-'.repeat(40));
    
    const { data: testPosts, error: testError } = await supabase
      .from('forum_posts')
      .select('*')
      .or('content.ilike.%test%,content.ilike.%debug%,content.ilike.%vdfdfgdgfg%,content.ilike.%dfgdfgfdfg%')
      .order('created_at', { ascending: false });

    if (testError) {
      console.log('❌ Error fetching test posts:', testError.message);
    } else {
      console.log(`✅ Found ${testPosts?.length || 0} test/debug posts`);
      
      testPosts?.forEach(post => {
        const date = new Date(post.created_at).toLocaleString('nl-NL');
        console.log(`   - Post ${post.id}: Topic ${post.topic_id} | "${post.content}" | Date: ${date}`);
      });
    }

    console.log('\n🎉 Forum Posts Check Complete!');
    console.log('='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   - Total posts in database: ${allPosts?.length || 0}`);
    console.log(`   - Posts for topic 1: ${topic1Posts?.length || 0}`);
    console.log(`   - Recent posts (24h): ${recentPosts?.length || 0}`);
    console.log(`   - Posts by Chiel: ${chielPosts?.length || 0}`);
    console.log(`   - Posts by Rick: ${rickPosts?.length || 0}`);
    console.log(`   - Test/debug posts: ${testPosts?.length || 0}`);

  } catch (error) {
    console.error('❌ Error checking forum posts:', error);
  }
}

checkForumPosts();
