const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStorageManual() {
  console.log('🔧 Manually fixing storage bucket...');

  try {
    // Step 1: Check if bucket exists
    console.log('🔍 Checking if workout-videos bucket exists...');
    const { data: bucketCheck, error: bucketError } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT id, name, public FROM storage.buckets WHERE id = \'workout-videos\''
    });

    if (bucketError) {
      console.error('❌ Bucket check failed:', bucketError);
    } else if (bucketCheck && bucketCheck.length > 0) {
      console.log('✅ Workout-videos bucket already exists');
      console.log('📊 Bucket info:', bucketCheck[0]);
    } else {
      console.log('❌ Workout-videos bucket does not exist');
      console.log('🔧 Creating bucket manually...');
      
      // Since we can't use exec_sql for INSERT, we'll use the storage API directly
      console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
      console.log(`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
          'workout-videos',
          'workout-videos',
          true,
          524288000,
          ARRAY['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/quicktime']
        );
      `);
    }

    // Step 2: Check and create policies
    console.log('🔒 Checking storage policies...');
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT policyname FROM pg_policies WHERE tablename = \'objects\' AND policyname LIKE \'%workout_videos%\''
    });

    if (policiesError) {
      console.error('❌ Policy check failed:', policiesError);
    } else if (policies && policies.length > 0) {
      console.log('✅ Storage policies exist');
      console.log('📊 Policies:', policies.map(p => p.policyname));
    } else {
      console.log('❌ Storage policies missing');
      console.log('🔧 Creating policies manually...');
      
      console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
      console.log(`
        CREATE POLICY IF NOT EXISTS "workout_videos_upload" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'workout-videos'
          AND auth.role() = 'authenticated'
        );

        CREATE POLICY IF NOT EXISTS "workout_videos_view_auth" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'workout-videos'
          AND auth.role() = 'authenticated'
        );

        CREATE POLICY IF NOT EXISTS "workout_videos_view_public" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'workout-videos'
        );

        CREATE POLICY IF NOT EXISTS "workout_videos_update" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'workout-videos'
          AND auth.role() = 'authenticated'
        );

        CREATE POLICY IF NOT EXISTS "workout_videos_delete" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'workout-videos'
          AND auth.role() = 'authenticated'
        );
      `);
    }

    // Step 3: Test the setup
    console.log('🧪 Testing storage setup...');
    console.log('⏳ Waiting 5 seconds for you to run the SQL...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const { data: finalCheck, error: finalError } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT id FROM storage.buckets WHERE id = \'workout-videos\''
    });

    if (finalError) {
      console.error('❌ Final check failed:', finalError);
    } else if (finalCheck && finalCheck.length > 0) {
      console.log('✅ Storage bucket setup completed successfully!');
      console.log('🎉 Video uploads should now work in the training center');
    } else {
      console.log('❌ Storage bucket still missing');
      console.log('📋 Please run the SQL commands above in Supabase SQL Editor');
    }

  } catch (error) {
    console.error('❌ Error fixing storage manually:', error);
  }
}

// Run the fix
fixStorageManual(); 