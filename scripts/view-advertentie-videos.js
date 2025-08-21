const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function viewAdvertentieVideos() {
  console.log('🔍 Viewing all advertentie videos in database...\n');
  
  try {
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .eq('bucket_name', 'advertenties')
      .order('original_name');

    if (error) {
      console.error('❌ Error fetching videos:', error);
      return;
    }

    if (!videos || videos.length === 0) {
      console.log('❌ No videos found in database');
      return;
    }

    console.log(`📊 Found ${videos.length} videos in database:\n`);
    
    // Group by target audience
    const groupedVideos = videos.reduce((acc, video) => {
      const audience = video.target_audience || 'geen doelgroep';
      if (!acc[audience]) {
        acc[audience] = [];
      }
      acc[audience].push(video);
      return acc;
    }, {});

    // Display grouped videos
    Object.entries(groupedVideos).forEach(([audience, audienceVideos]) => {
      console.log(`🎯 DOELGROEP: ${audience.toUpperCase()} (${audienceVideos.length} videos)`);
      console.log('─'.repeat(50));
      
      audienceVideos.forEach(video => {
        const status = video.campaign_status === 'active' ? '🟢 ACTIEF' : '⚪ INACTIEF';
        const sizeMB = Math.round(video.file_size / 1024 / 1024);
        console.log(`  📹 ${video.name}`);
        console.log(`     Bestand: ${video.original_name}`);
        console.log(`     Grootte: ${sizeMB} MB`);
        console.log(`     Status: ${status}`);
        console.log(`     ID: ${video.id}`);
        console.log('');
      });
    });

    console.log('📋 SAMENVATTING:');
    console.log('─'.repeat(30));
    Object.entries(groupedVideos).forEach(([audience, videos]) => {
      const activeCount = videos.filter(v => v.campaign_status === 'active').length;
      const inactiveCount = videos.length - activeCount;
      console.log(`  ${audience}: ${videos.length} videos (${activeCount} actief, ${inactiveCount} inactief)`);
    });

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

viewAdvertentieVideos().catch(console.error);
