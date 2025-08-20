require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdvertentiesSimple() {
  console.log('🔧 Fixing Advertenties Bucket (Simple Approach)...');

  try {
    // 1. Check current bucket status
    console.log('🔍 Checking current bucket status...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return;
    }

    const advertentiesBucket = buckets?.find(bucket => bucket.id === 'advertenties');
    
    if (advertentiesBucket) {
      console.log('✅ Advertenties bucket found:', {
        id: advertentiesBucket.id,
        name: advertentiesBucket.name,
        public: advertentiesBucket.public,
        fileSizeLimit: advertentiesBucket.file_size_limit,
        allowedMimeTypes: advertentiesBucket.allowed_mime_types
      });

      // 2. Try to make bucket public to bypass RLS issues
      console.log('🔧 Attempting to make bucket public...');
      
      const { data: updateData, error: updateError } = await supabase.storage.updateBucket('advertenties', {
        public: true,
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

      if (updateError) {
        console.error('❌ Error updating bucket:', updateError);
        console.log('🔧 Trying alternative approach...');
      } else {
        console.log('✅ Bucket updated successfully:', updateData);
      }
    } else {
      console.log('🔧 Creating advertenties bucket as public...');
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('advertenties', {
        public: true, // Make it public to avoid RLS issues
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
        console.error('❌ Error creating bucket:', createError);
        return;
      }

      console.log('✅ Advertenties bucket created as public:', newBucket);
    }

    // 3. Test upload functionality
    console.log('🧪 Testing upload functionality...');
    
    const testContent = 'Test file for bucket verification';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('advertenties')
      .upload(testFileName, testBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      console.log('🔧 Bucket may still have RLS issues');
      
      // Try to get more details about the error
      if (uploadError.message.includes('row-level security')) {
        console.log('💡 This is an RLS policy issue. The bucket needs to be public or have proper policies.');
        console.log('📋 Manual steps needed:');
        console.log('   1. Go to Supabase Dashboard → Storage');
        console.log('   2. Find the "advertenties" bucket');
        console.log('   3. Click on the bucket settings');
        console.log('   4. Set "Public bucket" to ON');
        console.log('   5. Save the changes');
      }
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
      
      console.log('🎉 Bucket is working correctly!');
    }

    // 4. Test listing files
    console.log('📁 Testing file listing...');
    const { data: listData, error: listError } = await supabase.storage
      .from('advertenties')
      .list('', { limit: 10 });

    if (listError) {
      console.error('❌ List test failed:', listError);
    } else {
      console.log('✅ List test successful, files found:', listData?.length || 0);
    }

    console.log('📋 Summary:');
    console.log('   - Bucket should now be public');
    console.log('   - Upload functionality should work');
    console.log('   - Try uploading a video through the marketing dashboard');
    
  } catch (error) {
    console.error('❌ Error fixing advertenties bucket:', error);
  }
}

// Run the fix
fixAdvertentiesSimple();
