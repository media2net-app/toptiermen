require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// List of videos to KEEP (the correct 11 videos)
const videosToKeep = [
  'algemeen_01.mp4',
  'algemeen_02.mp4',
  'algemeen_03.mp4',
  'algemeen_04.mp4',
  'algemeen_05.mp4',
  'jongeren_01.mp4',
  'jongeren_02.mp4',
  'vaders_01.mp4',
  'vaders_02.mp4',
  'zakelijk_01.mp4',
  'zakelijk_02.mp4'
];

async function cleanupOldVideos() {
  console.log('🧹 Cleaning up old videos and keeping only the correct 11...\n');
  
  try {
    // First, get all videos from database
    const { data: allVideos, error: dbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false);

    if (dbError) {
      console.error('❌ Error fetching videos from database:', dbError);
      return;
    }

    console.log(`📋 Found ${allVideos?.length || 0} videos in database\n`);

    // Identify videos to delete (those not in videosToKeep)
    const videosToDelete = allVideos?.filter(video => 
      !videosToKeep.includes(video.original_name)
    ) || [];

    console.log(`🗑️  Videos to delete: ${videosToDelete.length}`);
    videosToDelete.forEach(video => {
      console.log(`   - ${video.name} (${video.original_name})`);
    });

    console.log(`\n✅ Videos to keep: ${videosToKeep.length}`);
    videosToKeep.forEach(video => {
      console.log(`   - ${video}`);
    });

    // Delete old videos from database (soft delete)
    console.log('\n🗑️  Soft deleting old videos from database...');
    for (const video of videosToDelete) {
      try {
        const { error } = await supabase
          .from('videos')
          .update({ 
            is_deleted: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', video.id);

        if (error) {
          console.error(`❌ Error deleting ${video.name}:`, error);
        } else {
          console.log(`✅ Deleted from database: ${video.name}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${video.name}:`, error);
      }
    }

    // Delete old files from bucket
    console.log('\n🗑️  Deleting old files from bucket...');
    for (const video of videosToDelete) {
      try {
        const { error } = await supabase.storage
          .from('advertenties')
          .remove([video.original_name]);

        if (error) {
          console.error(`❌ Error deleting file ${video.original_name}:`, error);
        } else {
          console.log(`✅ Deleted from bucket: ${video.original_name}`);
        }
      } catch (error) {
        console.error(`❌ Error deleting file ${video.original_name}:`, error);
      }
    }

    // Verify final state
    console.log('\n🔍 Verifying final state...');
    
    // Check database
    const { data: finalVideos, error: finalDbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false);

    if (finalDbError) {
      console.error('❌ Error checking final database state:', finalDbError);
    } else {
      console.log(`📋 Final videos in database: ${finalVideos?.length || 0}`);
      finalVideos?.forEach(video => {
        console.log(`   - ${video.name} (${video.original_name}) → ${video.target_audience}`);
      });
    }

    // Check bucket
    const { data: finalFiles, error: finalBucketError } = await supabase.storage
      .from('advertenties')
      .list('', { limit: 100 });

    if (finalBucketError) {
      console.error('❌ Error checking final bucket state:', finalBucketError);
    } else {
      console.log(`📁 Final files in bucket: ${finalFiles?.length || 0}`);
      finalFiles?.forEach(file => {
        console.log(`   - ${file.name}`);
      });
    }

    // Final verification
    const hasCorrectCount = finalVideos?.length === 11 && finalFiles?.length === 11;
    const allExpectedPresent = videosToKeep.every(video => 
      finalVideos?.some(v => v.original_name === video) &&
      finalFiles?.some(f => f.name === video)
    );

    console.log('\n🎉 Cleanup Summary:');
    console.log('===================');
    console.log(`✅ Videos deleted: ${videosToDelete.length}`);
    console.log(`✅ Final video count: ${finalVideos?.length || 0}`);
    console.log(`✅ Final file count: ${finalFiles?.length || 0}`);
    console.log(`✅ Correct count (11): ${hasCorrectCount ? 'YES' : 'NO'}`);
    console.log(`✅ All expected videos present: ${allExpectedPresent ? 'YES' : 'NO'}`);

    if (hasCorrectCount && allExpectedPresent) {
      console.log('\n🎯 CLEANUP SUCCESSFUL! ✅');
      console.log('All old videos removed, only the correct 11 videos remain.');
    } else {
      console.log('\n⚠️  CLEANUP INCOMPLETE! ❌');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupOldVideos().catch(console.error);
