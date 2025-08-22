require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncVideoNamesToBucket() {
  console.log('🔄 Syncing video names from database to bucket...\n');
  
  try {
    // Get all active videos from database
    const { data: videos, error: dbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('❌ Error fetching videos:', dbError);
      return;
    }

    console.log(`📋 Found ${videos?.length || 0} videos in database\n`);

    // Process each video that needs renaming
    const renamedVideos = [];
    
    for (const video of videos || []) {
      // Create new filename based on database name
      let newFileName = video.name.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_()-]/g, '')
        .replace(/_+/g, '_');
      
      // Ensure it ends with .mp4
      if (!newFileName.endsWith('.mp4')) {
        newFileName += '.mp4';
      }

      // Only rename if different from current original_name
      if (newFileName !== video.original_name) {
        console.log(`🔄 Renaming: ${video.original_name} → ${newFileName}`);
        
        try {
          // Download the current file
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('advertenties')
            .download(video.original_name);

          if (downloadError) {
            console.error(`❌ Error downloading ${video.original_name}:`, downloadError);
            continue;
          }

          // Upload with new name
          const { error: uploadError } = await supabase.storage
            .from('advertenties')
            .upload(newFileName, fileData, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error(`❌ Error uploading ${newFileName}:`, uploadError);
            continue;
          }

          // Update database record with new original_name and file_path
          const { error: updateError } = await supabase
            .from('videos')
            .update({
              original_name: newFileName,
              file_path: `advertenties/${newFileName}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', video.id);

          if (updateError) {
            console.error(`❌ Error updating database for ${video.name}:`, updateError);
            continue;
          }

          // Delete old file
          const { error: deleteError } = await supabase.storage
            .from('advertenties')
            .remove([video.original_name]);

          if (deleteError) {
            console.error(`❌ Error deleting old file ${video.original_name}:`, deleteError);
          }

          console.log(`✅ Successfully renamed: ${video.name}`);
          renamedVideos.push({
            name: video.name,
            oldFileName: video.original_name,
            newFileName: newFileName
          });

        } catch (error) {
          console.error(`❌ Error processing ${video.name}:`, error);
        }
      } else {
        console.log(`✅ No change needed: ${video.name} (${video.original_name})`);
      }
    }

    // Verify final state
    console.log('\n🔍 Verifying final state...');
    
    // Check database
    const { data: finalVideos, error: finalDbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (finalDbError) {
      console.error('❌ Error checking final database state:', finalDbError);
    } else {
      console.log(`📋 Final videos in database: ${finalVideos?.length || 0}`);
      finalVideos?.forEach(video => {
        console.log(`   - "${video.name}" → ${video.original_name} (${video.target_audience})`);
      });
    }

    // Check bucket
    const { data: finalFiles, error: finalBucketError } = await supabase.storage
      .from('advertenties')
      .list('', { limit: 100 });

    if (finalBucketError) {
      console.error('❌ Error checking final bucket state:', finalBucketError);
    } else {
      console.log(`\n📁 Final files in bucket: ${finalFiles?.length || 0}`);
      finalFiles?.forEach(file => {
        console.log(`   - ${file.name}`);
      });
    }

    console.log('\n🎉 Sync Summary:');
    console.log('================');
    console.log(`✅ Videos renamed: ${renamedVideos.length}`);
    console.log(`✅ Final video count: ${finalVideos?.length || 0}`);
    console.log(`✅ Final file count: ${finalFiles?.length || 0}`);

    if (renamedVideos.length > 0) {
      console.log('\n📝 Renamed videos:');
      renamedVideos.forEach(renamed => {
        console.log(`   - "${renamed.name}": ${renamed.oldFileName} → ${renamed.newFileName}`);
      });
    }

    console.log('\n🎯 SYNC COMPLETED! ✅');
    console.log('Video names in bucket now match database names.');

  } catch (error) {
    console.error('❌ Error during sync:', error);
  }
}

syncVideoNamesToBucket().catch(console.error);
