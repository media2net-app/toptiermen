require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Videos die de "updated" labels hadden
const updatedVideos = [
  'algemeen_01.mp4',  // was lv_0_20250821161841.mp4
  'jongeren_01.mp4',  // was lv_0_20250821162618.mp4
  'vaders_01.mp4'     // was lv_0_20250821163117.mp4
];

async function markUpdatedVideos() {
  console.log('🚀 Marking updated videos in database...');
  
  const results = [];
  
  for (const videoName of updatedVideos) {
    console.log(`\n📦 Processing: ${videoName}`);
    
    try {
      // Update the video record to mark it as updated
      const { data, error } = await supabase
        .from('videos')
        .update({
          name: videoName.replace('.mp4', '') + ' (Updated)',
          updated_at: new Date().toISOString()
        })
        .eq('original_name', videoName)
        .select();

      if (error) {
        console.error(`❌ Error updating ${videoName}:`, error);
        results.push({ videoName, success: false, error: error.message });
      } else {
        console.log(`✅ Successfully marked ${videoName} as updated`);
        results.push({ videoName, success: true });
      }
    } catch (error) {
      console.error(`❌ Error processing ${videoName}:`, error);
      results.push({ videoName, success: false, error: error.message });
    }
  }
  
  console.log('\n🎉 Summary:');
  console.log(`✅ Successfully marked: ${results.filter(r => r.success).length} videos`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length} videos`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.videoName}`);
  });
  
  // Verify final state
  console.log('\n🔍 Verifying final state...');
  try {
    const { data: videos, error } = await supabase
      .from('videos')
      .select('name, original_name, target_audience')
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching videos:', error);
    } else {
      console.log(`📋 Total videos in database: ${videos?.length || 0}`);
      console.log('📋 Videos:');
      videos?.forEach(video => {
        console.log(`   - ${video.name} (${video.original_name}) - ${video.target_audience}`);
      });
    }
  } catch (error) {
    console.error('❌ Error verifying final state:', error);
  }
}

markUpdatedVideos().catch(console.error);
