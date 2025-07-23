const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupForum() {
  console.log('🚀 Setting up forum database...\n');

  try {
    // Read SQL files
    const fs = require('fs');
    const path = require('path');

    const createTablesSQL = fs.readFileSync(path.join(__dirname, '../create_forum_tables.sql'), 'utf8');
    const insertDataSQL = fs.readFileSync(path.join(__dirname, '../insert_forum_data.sql'), 'utf8');
    const rlsPoliciesSQL = fs.readFileSync(path.join(__dirname, '../add_forum_rls_policies.sql'), 'utf8');

    // Execute create tables
    console.log('📋 Creating forum tables...');
    const { error: createError } = await supabase.rpc('exec_sql', { sql_query: createTablesSQL });
    if (createError) {
      console.error('❌ Error creating tables:', createError);
      return;
    }
    console.log('✅ Forum tables created successfully');

    // Execute insert data
    console.log('📝 Inserting forum data...');
    const { error: insertError } = await supabase.rpc('exec_sql', { sql_query: insertDataSQL });
    if (insertError) {
      console.error('❌ Error inserting data:', insertError);
      return;
    }
    console.log('✅ Forum data inserted successfully');

    // Execute RLS policies
    console.log('🔒 Setting up RLS policies...');
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql_query: rlsPoliciesSQL });
    if (rlsError) {
      console.error('❌ Error setting up RLS policies:', rlsError);
      return;
    }
    console.log('✅ RLS policies set up successfully');

    // Verify the setup
    console.log('🔍 Verifying setup...');
    const { data: categories, error: catError } = await supabase
      .from('forum_categories')
      .select('*');

    if (catError) {
      console.error('❌ Error verifying categories:', catError);
      return;
    }

    const { data: topics, error: topicError } = await supabase
      .from('forum_topics')
      .select('*');

    if (topicError) {
      console.error('❌ Error verifying topics:', topicError);
      return;
    }

    const { data: posts, error: postError } = await supabase
      .from('forum_posts')
      .select('*');

    if (postError) {
      console.error('❌ Error verifying posts:', postError);
      return;
    }

    console.log('\n🎉 Forum setup completed successfully!');
    console.log(`📊 Statistics:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Topics: ${topics.length}`);
    console.log(`   - Posts: ${posts.length}`);

    console.log('\n📋 Categories created:');
    categories.forEach(cat => {
      console.log(`   - ${cat.emoji} ${cat.name} (${cat.slug})`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setupForum(); 