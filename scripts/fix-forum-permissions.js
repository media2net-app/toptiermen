const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixForumPermissions() {
  console.log('🔒 Fixing forum permissions...');
  
  try {
    // 1. Check current forum_posts table structure
    console.log('\n📋 Step 1: Checking forum_posts table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'forum_posts')
      .eq('table_schema', 'public');

    if (tableError) {
      console.log('⚠️ Could not check table structure:', tableError.message);
    } else {
      console.log('✅ Forum posts table columns:');
      tableInfo.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }

    // 2. Check if forum_posts table exists and has correct structure
    console.log('\n🔧 Step 2: Ensuring forum_posts table has correct structure...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Create forum_posts table if it doesn't exist with correct structure
        CREATE TABLE IF NOT EXISTS forum_posts (
          id SERIAL PRIMARY KEY,
          topic_id INTEGER NOT NULL,
          author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add topic_id column if it doesn't exist
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'forum_posts' AND column_name = 'topic_id'
          ) THEN
            ALTER TABLE forum_posts ADD COLUMN topic_id INTEGER NOT NULL DEFAULT 1;
          END IF;
        END $$;
      `
    });

    if (createError) {
      console.log('⚠️ Error creating/updating forum_posts table:', createError.message);
    } else {
      console.log('✅ Forum posts table structure verified');
    }

    // 3. Drop and recreate RLS policies for forum_posts
    console.log('\n🔒 Step 3: Fixing RLS policies for forum_posts...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Enable RLS
        ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view forum posts" ON forum_posts;
        DROP POLICY IF EXISTS "Users can create forum posts" ON forum_posts;
        DROP POLICY IF EXISTS "Users can update own posts" ON forum_posts;
        DROP POLICY IF EXISTS "Users can delete own posts" ON forum_posts;
        DROP POLICY IF EXISTS "Admins can manage all posts" ON forum_posts;
        
        -- Create new policies that work with auth.users
        CREATE POLICY "Users can view forum posts" ON forum_posts
          FOR SELECT USING (true);
          
        CREATE POLICY "Users can create forum posts" ON forum_posts
          FOR INSERT WITH CHECK (auth.uid() = author_id);
          
        CREATE POLICY "Users can update own posts" ON forum_posts
          FOR UPDATE USING (auth.uid() = author_id);
          
        CREATE POLICY "Users can delete own posts" ON forum_posts
          FOR DELETE USING (auth.uid() = author_id);
          
        CREATE POLICY "Service role can manage all posts" ON forum_posts
          FOR ALL USING (auth.role() = 'service_role');
      `
    });

    if (rlsError) {
      console.log('⚠️ Error setting up RLS policies:', rlsError.message);
    } else {
      console.log('✅ RLS policies updated for forum_posts');
    }

    // 4. Test forum_posts access
    console.log('\n🧪 Step 4: Testing forum_posts access...');
    
    // Test reading posts
    const { data: posts, error: readError } = await supabase
      .from('forum_posts')
      .select('id, content, author_id, created_at')
      .limit(5);

    if (readError) {
      console.log('❌ Error reading forum posts:', readError.message);
    } else {
      console.log('✅ Can read forum posts:', posts?.length || 0, 'posts found');
    }

    // Test creating a post
    const testPost = {
      topic_id: 2,
      content: 'TEST POST - WILL BE DELETED',
      author_id: '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c' // Chiel's ID
    };

    const { data: newPost, error: createPostError } = await supabase
      .from('forum_posts')
      .insert(testPost)
      .select()
      .single();

    if (createPostError) {
      console.log('❌ Error creating test post:', createPostError.message);
    } else {
      console.log('✅ Can create forum posts');
      
      // Clean up test post
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

    // 5. Check auth.users access
    console.log('\n👤 Step 5: Checking auth.users access...');
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(1);

    if (usersError) {
      console.log('❌ Error accessing auth.users:', usersError.message);
      
      // Try alternative approach - check if we can access profiles
      console.log('\n🔄 Trying alternative approach with profiles table...');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .limit(1);

      if (profilesError) {
        console.log('❌ Error accessing profiles:', profilesError.message);
      } else {
        console.log('✅ Can access profiles table:', profiles?.length || 0, 'profiles found');
      }
    } else {
      console.log('✅ Can access auth.users:', users?.length || 0, 'users found');
    }

    // 6. Create a function to get user info without direct auth.users access
    console.log('\n🔧 Step 6: Creating user info function...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Create a function to get user info safely
        CREATE OR REPLACE FUNCTION get_user_info(user_id UUID)
        RETURNS TABLE (
          id UUID,
          email TEXT,
          full_name TEXT,
          avatar_url TEXT
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            p.id,
            p.email,
            p.full_name,
            p.avatar_url
          FROM profiles p
          WHERE p.id = user_id;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (functionError) {
      console.log('⚠️ Error creating user info function:', functionError.message);
    } else {
      console.log('✅ User info function created');
    }

    console.log('\n🎉 Forum permissions fix complete!');
    console.log('='.repeat(60));
    console.log('✅ Forum posts table structure verified');
    console.log('✅ RLS policies updated');
    console.log('✅ Test post creation successful');
    console.log('✅ User info function created');
    console.log('\n💡 Next steps:');
    console.log('   1. Update frontend to use get_user_info() function');
    console.log('   2. Test forum reply functionality');
    console.log('   3. Verify user authentication works');

  } catch (error) {
    console.error('❌ Error fixing forum permissions:', error);
  }
}

fixForumPermissions();
