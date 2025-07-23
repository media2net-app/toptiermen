const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugForum() {
  console.log('🔍 Debugging forum data...\n');

  try {
    // Check categories
    console.log('📋 Checking forum categories...');
    const { data: categories, error: catError } = await supabase
      .from('forum_categories')
      .select('*');

    if (catError) {
      console.error('❌ Error fetching categories:', catError);
    } else {
      console.log(`✅ Found ${categories.length} categories:`);
      categories.forEach(cat => {
        console.log(`   - ${cat.emoji} ${cat.name} (${cat.slug})`);
      });
    }

    // Check topics
    console.log('\n📝 Checking forum topics...');
    const { data: topics, error: topicError } = await supabase
      .from('forum_topics')
      .select(`
        id,
        title,
        category_id,
        author_id,
        is_pinned,
        reply_count,
        like_count,
        created_at,
        forum_categories(name, slug)
      `);

    if (topicError) {
      console.error('❌ Error fetching topics:', topicError);
    } else {
      console.log(`✅ Found ${topics.length} topics:`);
      topics.forEach(topic => {
        console.log(`   - ${topic.title} (Category: ${topic.forum_categories?.name})`);
      });
    }

    // Check posts
    console.log('\n💬 Checking forum posts...');
    const { data: posts, error: postError } = await supabase
      .from('forum_posts')
      .select(`
        id,
        content,
        topic_id,
        author_id,
        created_at,
        forum_topics(title)
      `);

    if (postError) {
      console.error('❌ Error fetching posts:', postError);
    } else {
      console.log(`✅ Found ${posts.length} posts:`);
      posts.slice(0, 5).forEach(post => {
        console.log(`   - Post ${post.id}: ${post.content.substring(0, 50)}... (Topic: ${post.forum_topics?.title})`);
      });
      if (posts.length > 5) {
        console.log(`   ... and ${posts.length - 5} more posts`);
      }
    }

    // Check users
    console.log('\n👥 Checking users...');
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email');

    if (userError) {
      console.error('❌ Error fetching users:', userError);
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugForum(); 