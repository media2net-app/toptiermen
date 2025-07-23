const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixForumAuthors() {
  console.log('🔧 Fixing forum authors...\n');

  try {
    // Get Rick's user ID
    console.log('👤 Finding Rick\'s user ID...');
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', 'rick@toptiermen.com');

    if (userError) {
      console.error('❌ Error fetching users:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ Rick user not found');
      return;
    }

    const rickUserId = users[0].id;
    console.log(`✅ Found Rick's user ID: ${rickUserId}`);

    // Update all forum topics to have Rick as author
    console.log('\n📝 Updating forum topics...');
    const { error: topicError } = await supabase
      .from('forum_topics')
      .update({ author_id: rickUserId });

    if (topicError) {
      console.error('❌ Error updating topics:', topicError);
    } else {
      console.log('✅ Updated all forum topics');
    }

    // Update all forum posts to have Rick as author
    console.log('\n💬 Updating forum posts...');
    const { error: postError } = await supabase
      .from('forum_posts')
      .update({ author_id: rickUserId });

    if (postError) {
      console.error('❌ Error updating posts:', postError);
    } else {
      console.log('✅ Updated all forum posts');
    }

    // Update all forum likes to have Rick as user
    console.log('\n👍 Updating forum likes...');
    const { error: likeError } = await supabase
      .from('forum_likes')
      .update({ user_id: rickUserId });

    if (likeError) {
      console.error('❌ Error updating likes:', likeError);
    } else {
      console.log('✅ Updated all forum likes');
    }

    // Update all forum views to have Rick as user
    console.log('\n👁️ Updating forum views...');
    const { error: viewError } = await supabase
      .from('forum_views')
      .update({ user_id: rickUserId });

    if (viewError) {
      console.error('❌ Error updating views:', viewError);
    } else {
      console.log('✅ Updated all forum views');
    }

    console.log('\n🎉 Forum authors fixed successfully!');
    console.log('All forum content now belongs to Rick Cuijpers');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixForumAuthors(); 