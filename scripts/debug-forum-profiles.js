const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugForumProfiles() {
  console.log('🔍 Debugging Forum Profiles Issue...\n');

  try {
    // Check forum posts author_ids
    console.log('📝 Checking forum posts author_ids...');
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select('id, author_id, content, created_at')
      .limit(10);

    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
    } else {
      console.log('✅ Forum posts:', posts);
    }

    // Check forum topics author_ids
    console.log('\n📋 Checking forum topics author_ids...');
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('id, author_id, title, created_at')
      .limit(10);

    if (topicsError) {
      console.error('❌ Error fetching topics:', topicsError);
    } else {
      console.log('✅ Forum topics:', topics);
    }

    // Check profiles table
    console.log('\n👤 Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log('✅ Profiles:', profiles);
    }

    // Check if Rick's profile exists
    console.log('\n🎯 Checking Rick\'s profile specifically...');
    const { data: rickProfile, error: rickError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c')
      .single();

    if (rickError) {
      console.error('❌ Error fetching Rick\'s profile:', rickError);
    } else {
      console.log('✅ Rick\'s profile:', rickProfile);
    }

    // Test the exact query that the forum page uses
    console.log('\n🔍 Testing forum page query...');
    const { data: testData, error: testError } = await supabase
      .from('forum_categories')
      .select(`
        id,
        name,
        description,
        emoji,
        slug,
        forum_topics(
          id,
          title,
          created_at,
          author_id,
          reply_count
        )
      `)
      .order('order_index');

    if (testError) {
      console.error('❌ Error with forum page query:', testError);
    } else {
      console.log('✅ Forum page query result:', testData);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugForumProfiles(); 