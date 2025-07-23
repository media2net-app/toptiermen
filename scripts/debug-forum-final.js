const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugForumFinal() {
  console.log('🔍 Final Forum Debug Check...\n');

  try {
    // Check if we can access forum_categories
    console.log('📋 Checking forum_categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('forum_categories')
      .select('*');

    if (categoriesError) {
      console.error('❌ Error accessing forum_categories:', categoriesError);
    } else {
      console.log(`✅ Found ${categories?.length || 0} categories:`, categories?.map(c => c.name));
    }

    // Check if we can access forum_topics
    console.log('\n📝 Checking forum_topics...');
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('*');

    if (topicsError) {
      console.error('❌ Error accessing forum_topics:', topicsError);
    } else {
      console.log(`✅ Found ${topics?.length || 0} topics:`, topics?.map(t => t.title));
    }

    // Check if we can access forum_posts
    console.log('\n💬 Checking forum_posts...');
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select('*');

    if (postsError) {
      console.error('❌ Error accessing forum_posts:', postsError);
    } else {
      console.log(`✅ Found ${posts?.length || 0} posts`);
    }

    // Test the exact query that the forum page uses
    console.log('\n🔍 Testing exact forum page query...');
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
      console.log(`✅ Forum page query works! Found ${testData?.length || 0} categories`);
      if (testData && testData.length > 0) {
        console.log('Sample category:', {
          name: testData[0].name,
          topics: testData[0].forum_topics?.length || 0
        });
      }
    }

    // Check RLS policies
    console.log('\n🔐 Checking RLS policies...');
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('get_rls_policies', { table_name: 'forum_categories' })
      .catch(() => ({ data: null, error: 'RPC function not available' }));

    if (rlsError) {
      console.log('ℹ️ Could not check RLS policies directly');
    } else {
      console.log('✅ RLS policies check passed');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugForumFinal(); 