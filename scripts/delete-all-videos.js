require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAllVideos() {
  console.log('🗑️  Deleting all videos from bucket and database for clean start...\n');
  
  try {
    // Get all videos from database
    const { data: videos, error: dbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties');

    if (dbError) {
      console.error('❌ Error fetching videos:', dbError);
      return;
    }

    console.log(`📋 Found ${videos?.length || 0} videos in database`);

    // Get all files from bucket
    const { data: files, error: bucketError } = await supabase.storage
      .from('advertenties')
      .list('', { limit: 100 });

    if (bucketError) {
      console.error('❌ Error fetching bucket files:', bucketError);
      return;
    }

    console.log(`📁 Found ${files?.length || 0} files in bucket`);

    // Delete all database records
    if (videos && videos.length > 0) {
      console.log('\n🗑️  Deleting all database records...');
      
      for (const video of videos) {
        try {
          const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', video.id);

          if (error) {
            console.error(`❌ Error deleting database record for ${video.name}:`, error);
          } else {
            console.log(`✅ Deleted database record: ${video.name}`);
          }
        } catch (error) {
          console.error(`❌ Error processing ${video.name}:`, error);
        }
      }
    }

    // Delete all files from bucket
    if (files && files.length > 0) {
      console.log('\n🗑️  Deleting all files from bucket...');
      
      const fileNames = files.map(f => f.name);
      
      try {
        const { error } = await supabase.storage
          .from('advertenties')
          .remove(fileNames);

        if (error) {
          console.error('❌ Error deleting bucket files:', error);
        } else {
          console.log(`✅ Deleted ${fileNames.length} files from bucket`);
          fileNames.forEach(fileName => {
            console.log(`   - ${fileName}`);
          });
        }
      } catch (error) {
        console.error('❌ Error deleting bucket files:', error);
      }
    }

    // Verify final state
    console.log('\n🔍 Verifying final state...');
    
    // Check database
    const { data: finalVideos, error: finalDbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties');

    if (finalDbError) {
      console.error('❌ Error checking final database state:', finalDbError);
    } else {
      console.log(`📋 Final videos in database: ${finalVideos?.length || 0}`);
    }

    // Check bucket
    const { data: finalFiles, error: finalBucketError } = await supabase.storage
      .from('advertenties')
      .list('', { limit: 100 });

    if (finalBucketError) {
      console.error('❌ Error checking final bucket state:', finalBucketError);
    } else {
      console.log(`📁 Final files in bucket: ${finalFiles?.length || 0}`);
    }

    console.log('\n🎉 Cleanup Summary:');
    console.log('==================');
    console.log(`✅ Database records deleted: ${videos?.length || 0}`);
    console.log(`✅ Bucket files deleted: ${files?.length || 0}`);
    console.log(`✅ Final database count: ${finalVideos?.length || 0}`);
    console.log(`✅ Final bucket count: ${finalFiles?.length || 0}`);

    if ((finalVideos?.length || 0) === 0 && (finalFiles?.length || 0) === 0) {
      console.log('\n🎯 CLEANUP SUCCESSFUL! ✅');
      console.log('All videos deleted. Ready for fresh upload!');
    } else {
      console.log('\n⚠️  CLEANUP INCOMPLETE! ❌');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

deleteAllVideos().catch(console.error);
