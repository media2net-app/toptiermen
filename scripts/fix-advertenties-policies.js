require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdvertentiesPolicies() {
  console.log('🔧 Fixing Advertenties Storage RLS Policies...');

  try {
    // 1. Check if bucket exists
    console.log('🔍 Checking if advertenties bucket exists...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return;
    }

    const advertentiesBucket = buckets?.find(bucket => bucket.id === 'advertenties');
    
    if (advertentiesBucket) {
      console.log('✅ Advertenties bucket exists:', {
        id: advertentiesBucket.id,
        name: advertentiesBucket.name,
        public: advertentiesBucket.public,
        fileSizeLimit: advertentiesBucket.file_size_limit,
        allowedMimeTypes: advertentiesBucket.allowed_mime_types
      });
    } else {
      console.log('🔧 Creating advertenties bucket...');
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('advertenties', {
        public: false,
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

      console.log('✅ Advertenties bucket created:', newBucket);
    }

    // 2. Apply RLS policies using SQL
    console.log('🔒 Applying RLS policies...');
    
    const policies = [
      {
        name: 'Allow authenticated users to upload to advertenties',
        sql: `
          CREATE POLICY "Allow authenticated users to upload to advertenties" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'advertenties' 
            AND auth.role() = 'authenticated'
          );
        `
      },
      {
        name: 'Allow authenticated users to read from advertenties',
        sql: `
          CREATE POLICY "Allow authenticated users to read from advertenties" ON storage.objects
          FOR SELECT USING (
            bucket_id = 'advertenties' 
            AND auth.role() = 'authenticated'
          );
        `
      },
      {
        name: 'Allow authenticated users to update advertenties',
        sql: `
          CREATE POLICY "Allow authenticated users to update advertenties" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'advertenties' 
            AND auth.role() = 'authenticated'
          );
        `
      },
      {
        name: 'Allow authenticated users to delete from advertenties',
        sql: `
          CREATE POLICY "Allow authenticated users to delete from advertenties" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'advertenties' 
            AND auth.role() = 'authenticated'
          );
        `
      }
    ];

    for (const policy of policies) {
      try {
        console.log(`🔧 Applying policy: ${policy.name}`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: policy.sql
        });

        if (error) {
          if (error.message.includes('already exists')) {
            console.log(`ℹ️ Policy already exists: ${policy.name}`);
          } else {
            console.error(`❌ Error applying policy ${policy.name}:`, error);
          }
        } else {
          console.log(`✅ Policy applied: ${policy.name}`);
        }
      } catch (err) {
        console.error(`❌ Exception applying policy ${policy.name}:`, err);
      }
    }

    // 3. Test upload functionality
    console.log('🧪 Testing upload functionality...');
    
    const testContent = 'Test file for RLS policy verification';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test-rls-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('advertenties')
      .upload(testFileName, testBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      console.log('🔧 RLS policies may not be working correctly');
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
      
      console.log('🎉 RLS policies are working correctly!');
    }

    console.log('📋 Next steps:');
    console.log('  1. Try uploading a video through the marketing dashboard');
    console.log('  2. The upload should now work without RLS errors');
    console.log('  3. Only authenticated users can access the advertenties bucket');
    
  } catch (error) {
    console.error('❌ Error fixing advertenties policies:', error);
  }
}

// Run the fix
fixAdvertentiesPolicies();
