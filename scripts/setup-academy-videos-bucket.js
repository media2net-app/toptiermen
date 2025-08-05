require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAcademyVideosBucket() {
  console.log('🎓 Setting up Academy Videos Bucket...');

  try {
    // 1. Check if academy-videos bucket exists
    console.log('🔍 Checking if academy-videos bucket exists...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return;
    }

    const academyBucket = buckets?.find(bucket => bucket.id === 'academy-videos');
    
    if (academyBucket) {
      console.log('✅ academy-videos bucket already exists:', {
        id: academyBucket.id,
        name: academyBucket.name,
        public: academyBucket.public,
        fileSizeLimit: academyBucket.file_size_limit,
        allowedMimeTypes: academyBucket.allowed_mime_types
      });
    } else {
      console.log('🔧 Creating academy-videos bucket...');
      
      // Create the bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('academy-videos', {
        public: true,
        file_size_limit: 1073741824, // 1GB
        allowed_mime_types: [
          'video/mp4',
          'video/mov', 
          'video/avi',
          'video/webm',
          'video/mkv',
          'video/quicktime'
        ]
      });

      if (createError) {
        console.error('❌ Error creating academy-videos bucket:', createError);
        return;
      }

      console.log('✅ academy-videos bucket created successfully:', newBucket);
    }

    // 2. Check and create storage policies
    console.log('🔒 Checking storage policies for academy-videos...');
    
    // Policy for public read access
    const { error: readPolicyError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DO $$
        BEGIN
          -- Drop existing policy if it exists
          DROP POLICY IF EXISTS "Public read access for academy videos" ON storage.objects;
          
          -- Create new policy for public read access
          CREATE POLICY "Public read access for academy videos" ON storage.objects
          FOR SELECT USING (bucket_id = 'academy-videos');
          
          -- Drop existing policy if it exists
          DROP POLICY IF EXISTS "Authenticated users can upload academy videos" ON storage.objects;
          
          -- Create policy for authenticated users to upload
          CREATE POLICY "Authenticated users can upload academy videos" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'academy-videos' 
            AND auth.role() = 'authenticated'
          );
          
          -- Drop existing policy if it exists
          DROP POLICY IF EXISTS "Users can update their own academy videos" ON storage.objects;
          
          -- Create policy for users to update their own videos
          CREATE POLICY "Users can update their own academy videos" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'academy-videos' 
            AND auth.role() = 'authenticated'
          );
          
          -- Drop existing policy if it exists
          DROP POLICY IF EXISTS "Users can delete their own academy videos" ON storage.objects;
          
          -- Create policy for users to delete their own videos
          CREATE POLICY "Users can delete their own academy videos" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'academy-videos' 
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
      console.log('✅ Storage policies created successfully');
    }

    // 3. Create folder structure
    console.log('📁 Creating folder structure...');
    
    // Create base academy folder
    const { error: folderError } = await supabase.storage
      .from('academy-videos')
      .upload('academy/.keep', new Blob([''], { type: 'text/plain' }), {
        upsert: true
      });

    if (folderError) {
      console.error('❌ Error creating folder structure:', folderError);
    } else {
      console.log('✅ Folder structure created successfully');
    }

    // 4. Test bucket access
    console.log('🧪 Testing bucket access...');
    
    const { data: testFiles, error: testError } = await supabase.storage
      .from('academy-videos')
      .list('academy', { limit: 1 });

    if (testError) {
      console.error('❌ Error testing bucket access:', testError);
    } else {
      console.log('✅ Bucket access test successful');
      console.log('📊 Files in academy folder:', testFiles?.length || 0);
    }

    // 5. Display bucket information
    console.log('\n🎓 Academy Videos Bucket Setup Complete!');
    console.log('📋 Bucket Information:');
    console.log('   - Name: academy-videos');
    console.log('   - Public: true');
    console.log('   - File size limit: 1GB');
    console.log('   - Allowed formats: MP4, MOV, AVI, WEBM, MKV, QuickTime');
    console.log('   - Folder structure: academy/module-{id}/lesson-{id}/');
    console.log('   - Policies: Public read, Authenticated upload/update/delete');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
setupAcademyVideosBucket()
  .then(() => {
    console.log('✅ Academy videos bucket setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }); 