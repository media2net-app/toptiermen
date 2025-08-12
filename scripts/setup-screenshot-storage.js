const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupScreenshotStorage() {
  try {
    console.log('🔧 Setting up screenshot storage...');

    // Create storage bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('bug-screenshots', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Storage bucket already exists');
      } else {
        console.error('❌ Error creating storage bucket:', bucketError);
        return;
      }
    } else {
      console.log('✅ Storage bucket created successfully');
    }

    // Test upload a small image
    const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('bug-screenshots')
      .upload('test/test.png', testImage, {
        contentType: 'image/png',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ Error testing upload:', uploadError);
    } else {
      console.log('✅ Test upload successful');
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('bug-screenshots')
        .getPublicUrl('test/test.png');
      
      console.log('✅ Public URL test:', urlData.publicUrl);
    }

    console.log('🎉 Screenshot storage setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up screenshot storage:', error);
  }
}

setupScreenshotStorage(); 