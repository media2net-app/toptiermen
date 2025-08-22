require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Videos that should be reactivated
const videosToReactivate = [
  'algemeen_03.mp4',
  'zakelijk_01.mp4',
  'zakelijk_02.mp4'
];

async function reactivateDeletedVideos() {
  console.log('🔄 Reactivating deleted video records...\n');
  
  try {
    // Get all videos (including deleted ones)
    const { data: allVideos, error: dbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties');

    if (dbError) {
      console.error('❌ Error fetching videos:', dbError);
      return;
    }

    console.log(`📋 Total videos in database: ${allVideos?.length || 0}`);
    
    // Find deleted videos that should be reactivated
    const deletedVideos = allVideos?.filter(video => 
      video.is_deleted && videosToReactivate.includes(video.original_name)
    ) || [];

    console.log(`🔍 Found ${deletedVideos.length} deleted videos to reactivate:`);
    deletedVideos.forEach(video => {
      console.log(`   - ${video.name} (${video.original_name})`);
    });

    // Reactivate the videos
    if (deletedVideos.length > 0) {
      console.log('\n🔄 Reactivating videos...');
      
      for (const video of deletedVideos) {
        try {
          const { error } = await supabase
            .from('videos')
            .update({ 
              is_deleted: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', video.id);

          if (error) {
            console.error(`❌ Error reactivating ${video.name}:`, error);
          } else {
            console.log(`✅ Reactivated: ${video.name} (${video.original_name})`);
          }
        } catch (error) {
          console.error(`❌ Error processing ${video.name}:`, error);
        }
      }
    }

    // Verify final state
    console.log('\n🔍 Verifying final state...');
    
    const { data: finalVideos, error: finalDbError } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (finalDbError) {
      console.error('❌ Error checking final database state:', finalDbError);
    } else {
      console.log(`📋 Final active videos in database: ${finalVideos?.length || 0}`);
      finalVideos?.forEach(video => {
        console.log(`   - ${video.name} (${video.original_name}) → ${video.target_audience}`);
      });
    }

    // Final verification
    const hasCorrectCount = finalVideos?.length === 11;
    const allExpectedPresent = videosToReactivate.every(videoName => 
      finalVideos?.some(v => v.original_name === videoName && !v.is_deleted)
    );

    console.log('\n🎉 Reactivation Summary:');
    console.log('========================');
    console.log(`✅ Videos reactivated: ${deletedVideos.length}`);
    console.log(`✅ Final video count: ${finalVideos?.length || 0}`);
    console.log(`✅ Correct count (11): ${hasCorrectCount ? 'YES' : 'NO'}`);
    console.log(`✅ All expected videos present: ${allExpectedPresent ? 'YES' : 'NO'}`);

    if (hasCorrectCount && allExpectedPresent) {
      console.log('\n🎯 REACTIVATION SUCCESSFUL! ✅');
      console.log('All 11 videos are now active and visible.');
    } else {
      console.log('\n⚠️  REACTIVATION INCOMPLETE! ❌');
    }

  } catch (error) {
    console.error('❌ Error during reactivation:', error);
  }
}

reactivateDeletedVideos().catch(console.error);
