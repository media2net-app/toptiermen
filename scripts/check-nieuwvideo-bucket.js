const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkNieuwvideoBucket() {
  console.log('🔍 Checking nieuwvideo bucket in Supabase Storage...');
  
  try {
    // Check if nieuwvideo bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }

    console.log('📦 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name}`);
    });

    // Try to list files in nieuwvideo bucket
    const { data: files, error } = await supabase.storage
      .from('nieuwvideo')
      .list('', {
        limit: 100,
        offset: 0
      });

    if (error) {
      console.error('❌ Error listing files in nieuwvideo bucket:', error);
      
      // Try to list files in advertenties bucket with subfolder
      console.log('🔍 Trying to list files in advertenties/nieuwvideo...');
      const { data: subfolderFiles, error: subfolderError } = await supabase.storage
        .from('advertenties')
        .list('nieuwvideo', {
          limit: 100,
          offset: 0
        });

      if (subfolderError) {
        console.error('❌ Error listing files in advertenties/nieuwvideo:', subfolderError);
      } else {
        console.log('✅ Found files in advertenties/nieuwvideo:');
        if (subfolderFiles && subfolderFiles.length > 0) {
          subfolderFiles.forEach(file => {
            console.log(`  📹 ${file.name} (${Math.round(file.metadata?.size / 1024 / 1024)} MB)`);
          });
        } else {
          console.log('  No files found');
        }
      }
    } else {
      console.log('✅ Found files in nieuwvideo bucket:');
      if (files && files.length > 0) {
        files.forEach(file => {
          console.log(`  📹 ${file.name} (${Math.round(file.metadata?.size / 1024 / 1024)} MB)`);
        });
      } else {
        console.log('  No files found');
      }
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkNieuwvideoBucket().catch(console.error);
