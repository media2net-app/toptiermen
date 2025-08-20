require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing advertenties bucket directly...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBucket() {
  try {
    console.log('\n📦 Testing bucket access...');
    
    // Test 1: List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }

    console.log('✅ Available buckets:', buckets.map(b => `${b.id} (${b.public ? 'public' : 'private'})`));

    // Test 2: List files in advertenties bucket
    console.log('\n📁 Listing files in advertenties bucket...');
    const { data: files, error: filesError } = await supabase.storage
      .from('advertenties')
      .list('', {
        limit: 100,
        offset: 0
      });

    if (filesError) {
      console.error('❌ Error listing files:', filesError);
      console.log('🔧 This might be a permissions issue');
      return;
    }

    console.log('✅ Found files:', files?.length || 0);
    
    if (files && files.length > 0) {
      console.log('\n📋 Files in advertenties bucket:');
      files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (${file.metadata?.size || 'unknown size'} bytes)`);
      });

      // Test 3: Get public URL for first file
      if (files.length > 0) {
        console.log('\n🔗 Testing public URL generation...');
        const { data: urlData, error: urlError } = supabase.storage
          .from('advertenties')
          .getPublicUrl(files[0].name);

        if (urlError) {
          console.error('❌ Error getting public URL:', urlError);
        } else {
          console.log('✅ Public URL for first file:', urlData.publicUrl);
        }
      }
    } else {
      console.log('⚠️  No files found in advertenties bucket');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testBucket()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
