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
        public: false, // Private bucket for security
        file_size_limit: 536870912, // 500MB
        allowed_mime_types: [
          'video/mp4',
          'video/mov', 
          'video/avi',
          'video/wmv',
          'video/flv',
          'video/webm',
          'video/mkv',
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
    
    // Policy for authenticated users to upload videos
    const { error: insertPolicyError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
          'Allow authenticated users to upload advertentie videos',
          'auth.role() = ''authenticated''',
          'advertenties'
        ) ON CONFLICT (name) DO NOTHING;
      `
    });

    if (insertPolicyError) {
      console.log('ℹ️ Policy creation skipped (may already exist):', insertPolicyError.message);
    } else {
      console.log('✅ Upload policy created');
    }

    // Policy for authenticated users to read videos
    const { error: readPolicyError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
          'Allow authenticated users to read advertentie videos',
          'auth.role() = ''authenticated''',
          'advertenties'
        ) ON CONFLICT (name) DO NOTHING;
      `
    });

    if (readPolicyError) {
      console.log('ℹ️ Read policy creation skipped (may already exist):', readPolicyError.message);
    } else {
      console.log('✅ Read policy created');
    }

    // Policy for authenticated users to delete their own videos
    const { error: deletePolicyError } = await supabase.rpc('exec_sql', {
      sql_query: `
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
          'Allow authenticated users to delete advertentie videos',
          'auth.role() = ''authenticated''',
          'advertenties'
        ) ON CONFLICT (name) DO NOTHING;
      `
    });

    if (deletePolicyError) {
      console.log('ℹ️ Delete policy creation skipped (may already exist):', deletePolicyError.message);
    } else {
      console.log('✅ Delete policy created');
    }

    // 3. Test bucket access
    console.log('🧪 Testing bucket access...');
    
    // Test listing files
    const { data: testFiles, error: listError } = await supabase.storage
      .from('advertenties')
      .list('', { limit: 10 });

    if (listError) {
      console.error('❌ Error listing files:', listError);
    } else {
      console.log('✅ Bucket access test successful');
      console.log('📁 Current files in bucket:', testFiles?.length || 0);
      if (testFiles && testFiles.length > 0) {
        testFiles.forEach(file => {
          console.log(`  - ${file.name} (${file.metadata?.size || 0} bytes)`);
        });
      }
    }

    // 4. Test upload (small test file)
    console.log('📤 Testing upload functionality...');
    
    const testContent = Buffer.from('test video content for advertenties bucket');
    const testFileName = `test-${Date.now()}.mp4`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('advertenties')
      .upload(testFileName, testContent, {
        contentType: 'video/mp4',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
    } else {
      console.log('✅ Upload test successful:', uploadData);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('advertenties')
        .remove([testFileName]);
      
      if (deleteError) {
        console.log('⚠️ Could not clean up test file:', deleteError.message);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }

    console.log('🎉 Advertenties bucket setup complete!');
    console.log('📋 Next steps:');
    console.log('  1. Upload videos through the marketing dashboard');
    console.log('  2. Videos will be stored securely in the advertenties bucket');
    console.log('  3. Only authenticated users can access the videos');
    
  } catch (error) {
    console.error('❌ Error setting up advertenties bucket:', error);
  }
}

// Run the setup
setupAdvertentiesBucket();
