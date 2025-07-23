const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugUserProfiles() {
  console.log('🔍 Debugging User Profiles...\n');

  try {
    // Check if there's a profiles table
    console.log('📋 Checking for profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.log('❌ No profiles table found or error:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} profiles:`, profiles);
    }

    // Check auth.users table structure
    console.log('\n👤 Checking auth.users structure...');
    const { data: users, error: usersError } = await supabase
      .rpc('exec_sql', { sql_query: "SELECT id, email, raw_user_meta_data FROM auth.users LIMIT 3;" });

    if (usersError) {
      console.error('❌ Error accessing auth.users:', usersError);
    } else {
      console.log('✅ Auth users data:', users);
    }

    // Check Rick's specific data
    console.log('\n🎯 Checking Rick\'s profile data...');
    const { data: rickData, error: rickError } = await supabase
      .rpc('exec_sql', { sql_query: "SELECT id, email, raw_user_meta_data FROM auth.users WHERE id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';" });

    if (rickError) {
      console.error('❌ Error fetching Rick\'s data:', rickError);
    } else {
      console.log('✅ Rick\'s data:', rickData);
    }

    // Check forum posts to see what author_ids we have
    console.log('\n📝 Checking forum posts author_ids...');
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select('author_id')
      .limit(10);

    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
    } else {
      console.log('✅ Forum posts author_ids:', posts?.map(p => p.author_id));
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugUserProfiles(); 