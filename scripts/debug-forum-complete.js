const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugForumComplete() {
  console.log('🔍 Complete Forum Debug - Starting comprehensive analysis...');
  console.log('='.repeat(80));
  
  try {
    // 1. Check database tables
    console.log('\n📋 STEP 1: Database Tables Check');
    console.log('-'.repeat(40));
    
    const tables = ['forum_topics', 'forum_posts', 'profiles', 'users'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${data?.length || 0} records found`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    // 2. Check forum topics
    console.log('\n📝 STEP 2: Forum Topics Analysis');
    console.log('-'.repeat(40));
    
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('*')
      .order('created_at', { ascending: false });

    if (topicsError) {
      console.log('❌ Error fetching topics:', topicsError.message);
    } else {
      console.log(`✅ Found ${topics?.length || 0} topics`);
      topics?.forEach(topic => {
        console.log(`   - Topic ${topic.id}: "${topic.title}" (Author: ${topic.author_id})`);
      });
    }

    // 3. Check forum posts
    console.log('\n💬 STEP 3: Forum Posts Analysis');
    console.log('-'.repeat(40));
    
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.log('❌ Error fetching posts:', postsError.message);
    } else {
      console.log(`✅ Found ${posts?.length || 0} posts`);
      posts?.slice(0, 5).forEach(post => {
        console.log(`   - Post ${post.id}: Topic ${post.topic_id} (Author: ${post.author_id})`);
      });
    }

    // 4. Check user profiles
    console.log('\n👤 STEP 4: User Profiles Analysis');
    console.log('-'.repeat(40));
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} profiles`);
      profiles?.forEach(profile => {
        console.log(`   - Profile ${profile.id}: ${profile.full_name} (${profile.email})`);
      });
    }

    // 5. Test forum post creation
    console.log('\n✍️ STEP 5: Forum Post Creation Test');
    console.log('-'.repeat(40));
    
    const testPost = {
      topic_id: 2,
      content: 'TEST POST - FORUM DEBUG',
      author_id: '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c' // Chiel's ID
    };

    const { data: newPost, error: createError } = await supabase
      .from('forum_posts')
      .insert(testPost)
      .select()
      .single();

    if (createError) {
      console.log('❌ Error creating test post:', createError.message);
    } else {
      console.log('✅ Test post created successfully:', newPost.id);
      
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

    // 6. Test get_user_info function
    console.log('\n🔧 STEP 6: get_user_info Function Test');
    console.log('-'.repeat(40));
    
    const { data: userInfo, error: userInfoError } = await supabase.rpc('get_user_info', {
      user_id: '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'
    });

    if (userInfoError) {
      console.log('❌ Error calling get_user_info:', userInfoError.message);
    } else {
      console.log('✅ get_user_info function works:', userInfo);
    }

    // 7. Check RLS policies
    console.log('\n🔒 STEP 7: RLS Policies Check');
    console.log('-'.repeat(40));
    
    // Test with service role (should work)
    const { data: serviceTest, error: serviceError } = await supabase
      .from('forum_posts')
      .select('*')
      .limit(1);

    if (serviceError) {
      console.log('❌ Service role test failed:', serviceError.message);
    } else {
      console.log('✅ Service role can access forum_posts');
    }

    // 8. Check specific topic and posts
    console.log('\n🎯 STEP 8: Specific Topic Analysis (ID: 2)');
    console.log('-'.repeat(40));
    
    const { data: topic2, error: topic2Error } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('id', 2)
      .single();

    if (topic2Error) {
      console.log('❌ Error fetching topic 2:', topic2Error.message);
    } else {
      console.log('✅ Topic 2 found:', topic2.title);
      
      // Get posts for this topic
      const { data: topic2Posts, error: topic2PostsError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('topic_id', 2)
        .order('created_at', { ascending: true });

      if (topic2PostsError) {
        console.log('❌ Error fetching posts for topic 2:', topic2PostsError.message);
      } else {
        console.log(`✅ Found ${topic2Posts?.length || 0} posts for topic 2`);
        topic2Posts?.forEach(post => {
          console.log(`   - Post ${post.id}: "${post.content.substring(0, 50)}..."`);
        });
      }
    }

    // 9. Check authentication
    console.log('\n🔐 STEP 9: Authentication Check');
    console.log('-'.repeat(40));
    
    // Create a client with anon key to test auth
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: { session }, error: sessionError } = await anonSupabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else {
      console.log('✅ Session check completed');
      console.log(`   - Session exists: ${session ? 'Yes' : 'No'}`);
      if (session) {
        console.log(`   - User: ${session.user.email}`);
      }
    }

    // 10. Test forum post creation with anon key
    console.log('\n🧪 STEP 10: Anon Key Forum Post Test');
    console.log('-'.repeat(40));
    
    const { data: anonPost, error: anonPostError } = await anonSupabase
      .from('forum_posts')
      .insert({
        topic_id: 2,
        content: 'ANON TEST POST',
        author_id: '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'
      })
      .select()
      .single();

    if (anonPostError) {
      console.log('❌ Anon key post creation failed:', anonPostError.message);
    } else {
      console.log('✅ Anon key post creation succeeded:', anonPost.id);
      
      // Clean up
      await anonSupabase
        .from('forum_posts')
        .delete()
        .eq('id', anonPost.id);
    }

    console.log('\n🎉 Complete Forum Debug Finished!');
    console.log('='.repeat(80));
    console.log('📊 Summary:');
    console.log('   - Database tables: Checked');
    console.log('   - Forum topics: Checked');
    console.log('   - Forum posts: Checked');
    console.log('   - User profiles: Checked');
    console.log('   - Post creation: Tested');
    console.log('   - User info function: Tested');
    console.log('   - RLS policies: Checked');
    console.log('   - Authentication: Checked');
    console.log('   - Anon key access: Tested');

  } catch (error) {
    console.error('❌ Error in complete forum debug:', error);
  }
}

debugForumComplete();
