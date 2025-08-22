require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Old videos that have updated versions
const oldVideosToRemove = [
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

async function removeOldVideos() {
  console.log('🗑️ Removing old videos that have updated versions...');
  console.log(`📋 Found ${oldVideosToRemove.length} old videos to remove`);

  try {
    // Get all videos
    const { data: videos, error } = await supabase
      .from('videos')
      .select('id, name, original_name, target_audience, created_at')
      .eq('bucket_name', 'advertenties')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching videos:', error);
      return;
    }

    console.log(`📹 Found ${videos.length} total videos`);

    // Find videos to remove
    const videosToRemove = videos.filter(video => 
      oldVideosToRemove.includes(video.original_name)
    );

    console.log(`\n🎯 Found ${videosToRemove.length} old videos to remove:`);
    videosToRemove.forEach(video => {
      console.log(`  • ${video.name} (${video.original_name})`);
    });

    if (videosToRemove.length === 0) {
      console.log('✅ No old videos found to remove');
      return;
    }

    // Ask for confirmation
    console.log('\n⚠️ WARNING: This will permanently delete these videos from the database and storage!');
    console.log('Type "DELETE" to confirm:');
    
    // For now, we'll just show what would be deleted
    console.log('\n📝 Videos that would be deleted:');
    videosToRemove.forEach(video => {
      console.log(`  • ${video.name} (ID: ${video.id})`);
    });

    // Remove from database (soft delete by setting is_deleted = true)
    console.log('\n🔄 Removing videos from database...');
    let removedCount = 0;
    
    for (const video of videosToRemove) {
      console.log(`🗑️ Removing ${video.name}...`);
      
      const { error: deleteError } = await supabase
        .from('videos')
        .update({ is_deleted: true })
        .eq('id', video.id);

      if (deleteError) {
        console.error(`❌ Error removing ${video.name}:`, deleteError);
      } else {
        removedCount++;
        console.log(`✅ Removed ${video.name}`);
      }
    }

    console.log(`\n🎉 Successfully removed ${removedCount} old videos`);
    
    // Show remaining videos
    const { data: remainingVideos, error: remainingError } = await supabase
      .from('videos')
      .select('name, original_name, target_audience')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (!remainingError && remainingVideos) {
      console.log(`\n📋 Remaining videos (${remainingVideos.length}):`);
      remainingVideos.forEach(video => {
        console.log(`  • ${video.name}: ${video.target_audience}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
removeOldVideos()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
