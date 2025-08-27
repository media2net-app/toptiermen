require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugForumUserAuth() {
  try {
    console.log('🔍 Debugging forum user authentication...\n');
    
    // 1. Check current user
    console.log('👤 Step 1: Checking current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Error getting user:', userError.message);
      return;
    }
    
    if (!user) {
      console.log('❌ No user found - not authenticated');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    });

    // 2. Check user profile
    console.log('\n📋 Step 2: Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('❌ Error getting profile:', profileError.message);
    } else {
      console.log('✅ Profile found:', profile);
    }

    // 3. Check forum permissions
    console.log('\n🔐 Step 3: Checking forum permissions...');
    
    // Try to read forum topics
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('id, title')
      .limit(1);

    if (topicsError) {
      console.log('❌ Error reading forum topics:', topicsError.message);
    } else {
      console.log('✅ Can read forum topics:', topics?.length || 0, 'topics found');
    }

    // Try to read forum posts
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select('id, content')
      .limit(1);

    if (postsError) {
      console.log('❌ Error reading forum posts:', postsError.message);
    } else {
      console.log('✅ Can read forum posts:', posts?.length || 0, 'posts found');
    }

    // 4. Test creating a post (dry run)
    console.log('\n✍️ Step 4: Testing post creation permissions...');
    const { error: insertError } = await supabase
      .from('forum_posts')
      .insert({
        topic_id: 2,
        content: 'TEST POST - WILL BE DELETED',
        author_id: user.id
      });

    if (insertError) {
      console.log('❌ Error creating test post:', insertError.message);
    } else {
      console.log('✅ Can create forum posts');
      
      // Clean up test post
      const { error: deleteError } = await supabase
        .from('forum_posts')
        .delete()
        .eq('content', 'TEST POST - WILL BE DELETED');
      
      if (deleteError) {
        console.log('⚠️ Could not clean up test post:', deleteError.message);
      } else {
        console.log('✅ Test post cleaned up');
      }
    }

    // 5. Check RLS policies
    console.log('\n📋 Step 5: Checking RLS policies...');
    console.log('💡 Note: RLS policies can only be checked in Supabase dashboard');
    console.log('   - Go to Authentication > Policies');
    console.log('   - Check forum_posts table policies');
    console.log('   - Ensure authenticated users can INSERT');

    console.log('\n🎉 Forum User Auth Debug Complete!');
    console.log('='.repeat(60));
    console.log(`✅ User authenticated: ${user ? 'Yes' : 'No'}`);
    console.log(`✅ User ID: ${user?.id || 'None'}`);
    console.log(`✅ User email: ${user?.email || 'None'}`);
    console.log(`✅ Profile exists: ${profile ? 'Yes' : 'No'}`);
    console.log(`✅ Can read topics: ${!topicsError ? 'Yes' : 'No'}`);
    console.log(`✅ Can read posts: ${!postsError ? 'Yes' : 'No'}`);
    console.log(`✅ Can create posts: ${!insertError ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error debugging forum user auth:', error);
  }
}

debugForumUserAuth();
