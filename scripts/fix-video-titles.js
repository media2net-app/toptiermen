const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixVideoTitles() {
  console.log('🔧 Fixing video titles to match original filenames...');
  
  try {
    // Get all videos from database
    const { data: videos, error } = await supabase
      .from('videos')
      .select('id, name, original_name')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false);

    if (error) {
      console.error('❌ Error fetching videos:', error);
      return;
    }

    if (!videos || videos.length === 0) {
      console.log('❌ No videos found in database');
      return;
    }

    console.log(`📊 Found ${videos.length} videos to check`);

    // Update videos where name doesn't match original_name
    for (const video of videos) {
      if (video.name !== video.original_name) {
        console.log(`🔄 Updating: "${video.name}" → "${video.original_name}"`);
        
        const { error: updateError } = await supabase
          .from('videos')
          .update({ 
            name: video.original_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', video.id);

        if (updateError) {
          console.error(`❌ Error updating video ${video.id}:`, updateError);
        } else {
          console.log(`✅ Updated video: ${video.original_name}`);
        }
      } else {
        console.log(`⏭️  Skipping: "${video.name}" (already correct)`);
      }
    }

    console.log('🎉 Finished fixing video titles!');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

fixVideoTitles().catch(console.error);
