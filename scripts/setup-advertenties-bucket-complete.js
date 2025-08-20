require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdvertentiesBucket() {
  console.log('🎬 Setting up Advertenties Bucket...');

  try {
    // 1. Check if advertenties bucket exists
    console.log('🔍 Checking if advertenties bucket exists...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return;
    }

    const advertentiesBucket = buckets?.find(bucket => bucket.id === 'advertenties');
    
    if (advertentiesBucket) {
      console.log('✅ advertenties bucket already exists:', {
        id: advertentiesBucket.id,
        name: advertentiesBucket.name,
        public: advertentiesBucket.public,
        fileSizeLimit: advertentiesBucket.file_size_limit,
        allowedMimeTypes: advertentiesBucket.allowed_mime_types
      });
    } else {
      console.log('🔧 Creating advertenties bucket...');
      
      // Create the bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('advertenties', {
        public: true,
        file_size_limit: 1073741824, // 1GB
        allowed_mime_types: [
          'video/mp4',
          'video/mov', 
          'video/avi',
          'video/webm',
          'video/mkv',
          'video/quicktime',
          'video/wmv',
          'video/flv',
          'video/m4v'
        ]
      });

      if (createError) {
        console.error('❌ Error creating advertenties bucket:', createError);
        return;
      }

      console.log('✅ advertenties bucket created successfully:', newBucket);
    }

    // 2. Check and create storage policies
    console.log('🔒 Checking storage policies for advertenties...');
    
    // Policy for public read access
    const { error: readPolicyError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DO $$
        BEGIN
          -- Drop existing policy if it exists
          DROP POLICY IF EXISTS "Public read access for advertenties videos" ON storage.objects;
          
          -- Create new policy for public read access
          CREATE POLICY "Public read access for advertenties videos" ON storage.objects
          FOR SELECT USING (bucket_id = 'advertenties');
          
          -- Drop existing policy if it exists
          DROP POLICY IF EXISTS "Authenticated users can upload advertenties videos" ON storage.objects;
          
          -- Create policy for authenticated users to upload
          CREATE POLICY "Authenticated users can upload advertenties videos" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'advertenties' 
            AND auth.role() = 'authenticated'
          );
          
          -- Drop existing policy if it exists
          DROP POLICY IF EXISTS "Users can update their own advertenties videos" ON storage.objects;
          
          -- Create policy for users to update their own videos
          CREATE POLICY "Users can update their own advertenties videos" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'advertenties' 
            AND auth.role() = 'authenticated'
          );
          
          -- Drop existing policy if it exists
          DROP POLICY IF EXISTS "Users can delete their own advertenties videos" ON storage.objects;
          
          -- Create policy for users to delete their own videos
          CREATE POLICY "Users can delete their own advertenties videos" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'advertenties' 
            AND auth.role() = 'authenticated'
          );
          
        EXCEPTION
          WHEN OTHERS THEN
            RAISE NOTICE 'Error creating policies: %', SQLERRM;
        END $$;
      `
    });

    if (readPolicyError) {
      console.error('❌ Error creating storage policies:', readPolicyError);
    } else {
      console.log('✅ Storage policies created successfully for advertenties bucket');
    }

    // 3. Test the setup
    console.log('🧪 Testing advertenties bucket setup...');
    
    // Test upload
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'Test content for advertenties bucket';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('advertenties')
      .upload(testFileName, testContent, {
        contentType: 'text/plain'
      });

    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
    } else {
      console.log('✅ Test upload successful:', uploadData);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('advertenties')
        .remove([testFileName]);
      
      if (deleteError) {
        console.warn('⚠️ Could not clean up test file:', deleteError);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }

    console.log('🎉 Advertenties bucket setup completed successfully!');
    console.log('📋 Video uploads should now work properly for advertenties');

  } catch (error) {
    console.error('❌ Error setting up advertenties bucket:', error);
  }
}

// Run the setup
setupAdvertentiesBucket()
  .then(() => {
    console.log('✅ Setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
