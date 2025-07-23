const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixForumAuthorsSimple() {
  console.log('🔧 Fixing forum authors (simple approach)...\n');

  try {
    // Use a fixed UUID for Rick (this is just for demo purposes)
    // In a real app, you'd get this from the auth.users table
    const rickUserId = '00000000-0000-0000-0000-000000000001'; // Demo UUID

    console.log(`👤 Using demo user ID for Rick: ${rickUserId}`);

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
    console.log('All forum content now belongs to Rick Cuijpers (demo user)');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixForumAuthorsSimple(); 