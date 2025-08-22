require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// The 3 new videos to update
const newVideos = [
  'lv_0_20250821161841.mp4',
  'lv_0_20250821162618.mp4', 
  'lv_0_20250821163117.mp4'
];

async function updateVideoLabels() {
  console.log('🏷️ Adding "Updated" labels to new videos...');

  try {
    for (const filename of newVideos) {
      console.log(`\n📹 Updating: ${filename}`);
      
      // Find the video in database
      const { data: video, error: findError } = await supabase
        .from('videos')
        .select('id, name, original_name')
        .eq('original_name', filename)
        .single();

      if (findError) {
        console.error(`❌ Error finding video ${filename}:`, findError);
        continue;
      }

      if (!video) {
        console.log(`⚠️ Video ${filename} not found in database`);
        continue;
      }

      // Update the name to include "Updated" label
      const updatedName = `🆕 ${video.name} (Updated)`;
      
      const { data: updatedVideo, error: updateError } = await supabase
        .from('videos')
        .update({ name: updatedName })
        .eq('id', video.id)
        .select()
        .single();

      if (updateError) {
        console.error(`❌ Error updating video ${filename}:`, updateError);
        continue;
      }

      console.log(`✅ Successfully updated ${filename}:`);
      console.log(`   Old name: ${video.name}`);
      console.log(`   New name: ${updatedVideo.name}`);
    }

    console.log('\n🎉 All video labels updated successfully!');
    
    // Show summary of updated videos
    const { data: updatedVideos, error: summaryError } = await supabase
      .from('videos')
      .select('name, original_name, campaign_status')
      .in('original_name', newVideos)
      .order('created_at', { ascending: false });

    if (!summaryError && updatedVideos) {
      console.log('\n📋 Updated videos:');
      updatedVideos.forEach(video => {
        console.log(`  • ${video.name} (${video.campaign_status})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
updateVideoLabels()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
