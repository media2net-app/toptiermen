require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdvertentiesBucket() {
  console.log('🔍 Testing Advertenties Bucket Configuration...\n');

  try {
    // Test 1: Check if bucket exists
    console.log('📦 Testing bucket existence...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }

    const advertentiesBucket = buckets.find(bucket => bucket.id === 'advertenties');
    
    if (!advertentiesBucket) {
      console.log('❌ Advertenties bucket does not exist');
      console.log('📋 Available buckets:', buckets.map(b => b.id));
      return;
    }

    console.log('✅ Advertenties bucket exists:', {
      id: advertentiesBucket.id,
      name: advertentiesBucket.name,
      public: advertentiesBucket.public,
      fileSizeLimit: advertentiesBucket.file_size_limit,
      allowedMimeTypes: advertentiesBucket.allowed_mime_types
    });

    // Test 2: Check RLS policies
    console.log('\n🔒 Testing RLS policies...');
    const { data: policies, error: policiesError } = await supabase.rpc('get_storage_policies');
    
    if (policiesError) {
      console.log('⚠️ Could not fetch policies directly, checking via SQL...');
      
      // Alternative: Check via SQL
      const { data: sqlPolicies, error: sqlError } = await supabase
        .from('information_schema.policies')
        .select('*')
        .eq('table_name', 'objects')
        .like('policyname', '%advertenties%');

      if (sqlError) {
        console.error('❌ Error checking policies:', sqlError);
      } else {
        console.log('📋 Found policies:', sqlPolicies?.length || 0);
        sqlPolicies?.forEach(policy => {
          console.log(`   - ${policy.policyname} (${policy.cmd})`);
        });
      }
    } else {
      console.log('📋 Storage policies:', policies);
    }

    // Test 3: Try to upload a test file
    console.log('\n📤 Testing upload capability...');
    
    // Create a small test file
    const testContent = 'This is a test file for advertenties bucket';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('advertenties')
      .upload(testFileName, testFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      console.log('🔧 This indicates RLS policy issues');
    } else {
      console.log('✅ Upload test successful:', uploadData);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('advertenties')
        .remove([testFileName]);
      
      if (deleteError) {
        console.warn('⚠️ Could not delete test file:', deleteError);
      } else {
        console.log('🧹 Test file cleaned up');
      }
    }

    // Test 4: Check video upload logs table
    console.log('\n📝 Testing video upload logs table...');
    const { data: logsTable, error: logsError } = await supabase
      .from('video_upload_logs')
      .select('*')
      .limit(1);

    if (logsError) {
      console.log('❌ Video upload logs table error:', logsError.message);
      if (logsError.message.includes('does not exist')) {
        console.log('💡 The video_upload_logs table needs to be created');
      }
    } else {
      console.log('✅ Video upload logs table exists and is accessible');
      console.log('📊 Sample log entry:', logsTable?.[0] || 'No entries yet');
    }

    // Test 5: Check current user authentication
    console.log('\n👤 Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️ No authenticated user (this is normal for service role)');
    } else {
      console.log('✅ Authenticated user:', user?.email);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAdvertentiesBucket()
  .then(() => {
    console.log('\n✅ Advertenties bucket test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
