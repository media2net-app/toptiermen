require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Old videos that need to be restored
const oldVideosToRestore = [
  'TTM_Het_Merk_Prelaunch_Reel_01_V2.mov',
  'TTM_Het_Merk_Prelaunch_Reel_02_V2.mov', 
  'TTM_Het_Merk_Prelaunch_Reel_03_V2.mov',
  'TTM_Het_Merk_Prelaunch_Reel_04_V2.mov',
  'TTM_Het_Merk_Prelaunch_Reel_05_V2.mov',
  'TTM_Jeugd_Prelaunch_Reel_01_V2.mov',
  'TTM_Jeugd_Prelaunch_Reel_02_V2.mov',
  'TTM_Vader_Prelaunch_Reel_01_V2.mov',
  'TTM_Vader_Prelaunch_Reel_02_V2.mov',
  'TTM_Zakelijk_Prelaunch_Reel_01_V2.mov',
  'TTM_Zakelijk_Prelaunch_Reel_02_V2.mov'
];

async function restoreOldVideos() {
  console.log('🔄 Restoring old videos...');
  console.log(`📋 Found ${oldVideosToRestore.length} old videos to restore`);

  try {
    // Get all videos (including deleted ones)
    const { data: videos, error } = await supabase
      .from('videos')
      .select('id, name, original_name, target_audience, created_at, is_deleted')
      .eq('bucket_name', 'advertenties')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching videos:', error);
      return;
    }

    console.log(`📹 Found ${videos.length} total videos`);

    // Find videos to restore
    const videosToRestore = videos.filter(video => 
      oldVideosToRestore.includes(video.original_name) && video.is_deleted
    );

    console.log(`\n🎯 Found ${videosToRestore.length} deleted videos to restore:`);
    videosToRestore.forEach(video => {
      console.log(`  • ${video.name} (${video.original_name})`);
    });

    if (videosToRestore.length === 0) {
      console.log('✅ No deleted videos found to restore');
      return;
    }

    // Restore videos by setting is_deleted = false
    console.log('\n🔄 Restoring videos...');
    let restoredCount = 0;
    
    for (const video of videosToRestore) {
      console.log(`🔄 Restoring ${video.name}...`);
      
      const { error: restoreError } = await supabase
        .from('videos')
        .update({ is_deleted: false })
        .eq('id', video.id);

      if (restoreError) {
        console.error(`❌ Error restoring ${video.name}:`, restoreError);
      } else {
        restoredCount++;
        console.log(`✅ Restored ${video.name}`);
      }
    }

    console.log(`\n🎉 Successfully restored ${restoredCount} videos`);
    
    // Show all active videos
    const { data: activeVideos, error: activeError } = await supabase
      .from('videos')
      .select('name, original_name, target_audience')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (!activeError && activeVideos) {
      console.log(`\n📋 All active videos (${activeVideos.length}):`);
      activeVideos.forEach(video => {
        console.log(`  • ${video.name}: ${video.target_audience}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
restoreOldVideos()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
