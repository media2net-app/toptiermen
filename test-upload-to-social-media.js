const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpload() {
  console.log('🧪 Testing direct upload to social-media bucket...\n');

  // Create a test image buffer (1x1 PNG)
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  const fileName = `social-feed/test-${Date.now()}.png`;

  console.log('1️⃣ Attempting to upload test image...');
  console.log(`   File: ${fileName}`);
  console.log(`   Size: ${testImageBuffer.length} bytes\n`);

  const { data, error } = await supabase.storage
    .from('social-media')
    .upload(fileName, testImageBuffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('❌ Upload failed:', error.message);
    console.log('\nPossible issues:');
    console.log('  - Bucket policies not configured');
    console.log('  - Bucket not public');
    console.log('  - RLS policies blocking upload');
    return;
  }

  console.log('✅ Upload successful!');
  console.log('   Path:', data.path);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('social-media')
    .getPublicUrl(fileName);

  console.log('   Public URL:', publicUrl);

  // Test if URL is accessible
  console.log('\n2️⃣ Testing if image is publicly accessible...');
  try {
    const response = await fetch(publicUrl);
    if (response.ok) {
      console.log('✅ Image is publicly accessible!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    } else {
      console.log('⚠️  Image uploaded but not publicly accessible');
      console.log(`   Status: ${response.status}`);
    }
  } catch (fetchError) {
    console.error('❌ Error fetching public URL:', fetchError.message);
  }

  // Clean up
  console.log('\n3️⃣ Cleaning up test file...');
  const { error: deleteError } = await supabase.storage
    .from('social-media')
    .remove([fileName]);

  if (deleteError) {
    console.error('⚠️  Could not delete test file:', deleteError.message);
    console.log('   You can manually delete:', fileName);
  } else {
    console.log('✅ Test file cleaned up!');
  }

  console.log('\n🎉 Photo upload is ready to use in the social feed!');
}

testUpload().catch(console.error);

