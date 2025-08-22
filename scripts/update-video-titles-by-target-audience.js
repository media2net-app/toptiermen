require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateVideoTitlesByTargetAudience() {
  console.log('🎯 Updating video titles based on target audience...');

  try {
    // Get all videos
    const { data: videos, error } = await supabase
      .from('videos')
      .select('id, name, original_name, target_audience')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching videos:', error);
      return;
    }

    console.log(`📹 Found ${videos.length} videos`);

    // Group videos by target audience
    const groupedVideos = {
      'Zakelijk': [],
      'Vaders': [],
      'Jongeren': [],
      'Algemeen': []
    };

    videos.forEach(video => {
      const target = video.target_audience || 'Algemeen';
      if (groupedVideos[target]) {
        groupedVideos[target].push(video);
      } else {
        groupedVideos['Algemeen'].push(video);
      }
    });

    console.log('\n📊 Videos grouped by target audience:');
    Object.entries(groupedVideos).forEach(([target, videoList]) => {
      console.log(`  • ${target}: ${videoList.length} videos`);
    });

    // Update video titles
    let updatedCount = 0;
    
    for (const [targetAudience, videoList] of Object.entries(groupedVideos)) {
      if (videoList.length === 0) continue;
      
      console.log(`\n🎯 Updating ${targetAudience} videos...`);
      
      for (let i = 0; i < videoList.length; i++) {
        const video = videoList[i];
        const newTitle = `${targetAudience.toLowerCase()}_${String(i + 1).padStart(2, '0')}`;
        
        console.log(`  ${i + 1}. ${video.name} → ${newTitle}`);
        
        const { error: updateError } = await supabase
          .from('videos')
          .update({ name: newTitle })
          .eq('id', video.id);

        if (updateError) {
          console.error(`❌ Error updating ${video.name}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} video titles`);
    
    // Show final summary
    const { data: finalVideos, error: finalError } = await supabase
      .from('videos')
      .select('name, original_name, target_audience')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .order('target_audience', { ascending: true })
      .order('name', { ascending: true });

    if (!finalError && finalVideos) {
      console.log('\n📋 Final video titles by target audience:');
      
      let currentTarget = '';
      finalVideos.forEach(video => {
        if (video.target_audience !== currentTarget) {
          currentTarget = video.target_audience;
          console.log(`\n🎯 ${currentTarget}:`);
        }
        console.log(`  • ${video.name} (${video.original_name})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
updateVideoTitlesByTargetAudience()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
