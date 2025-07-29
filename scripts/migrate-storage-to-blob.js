const { createClient } = require('@supabase/supabase-js');
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateStorageToBlob() {
  console.log('🔄 Starting Supabase Storage to Vercel Blob migration...');

  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }

    console.log(`📦 Found ${buckets.length} buckets to migrate`);

    for (const bucket of buckets) {
      console.log(`📁 Processing bucket: ${bucket.name}`);
      
      try {
        // List all files in bucket
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket.name)
          .list('', { limit: 1000 });

        if (filesError) {
          console.error(`❌ Error listing files in ${bucket.name}:`, filesError);
          continue;
        }

        console.log(`📄 Found ${files.length} files in ${bucket.name}`);

        for (const file of files) {
          try {
            // Download file from Supabase
            const { data: fileData, error: downloadError } = await supabase.storage
              .from(bucket.name)
              .download(file.name);

            if (downloadError) {
              console.error(`❌ Error downloading ${file.name}:`, downloadError);
              continue;
            }

            // Convert to Buffer
            const buffer = Buffer.from(await fileData.arrayBuffer());

            // Upload to Vercel Blob
            const blob = await put(`${bucket.name}/${file.name}`, buffer, {
              access: 'public',
            });

            console.log(`✅ Migrated: ${bucket.name}/${file.name} -> ${blob.url}`);

            // Optional: Delete from Supabase after successful migration
            // Uncomment the following lines if you want to delete from Supabase
            /*
            const { error: deleteError } = await supabase.storage
              .from(bucket.name)
              .remove([file.name]);

            if (deleteError) {
              console.error(`⚠️ Error deleting ${file.name} from Supabase:`, deleteError);
            } else {
              console.log(`🗑️ Deleted from Supabase: ${file.name}`);
            }
            */

          } catch (error) {
            console.error(`❌ Error migrating file ${file.name}:`, error);
          }
        }

      } catch (error) {
        console.error(`❌ Error processing bucket ${bucket.name}:`, error);
      }
    }

    console.log('🎉 Storage migration completed!');

  } catch (error) {
    console.error('❌ Storage migration failed:', error);
  }
}

// Run migration
migrateStorageToBlob(); 