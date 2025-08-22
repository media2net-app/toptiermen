require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Correct target audience mapping based on video names
const targetAudienceMapping = {
  // Algemeen videos
  'algemeen_01.mp4': 'Algemeen',
  'algemeen_02.mp4': 'Algemeen',
  'algemeen_03.mp4': 'Algemeen',
  'algemeen_04.mp4': 'Algemeen',
  'algemeen_05.mp4': 'Algemeen',
  
  // Jongeren videos
  'jongeren_01.mp4': 'Jongeren',
  'jongeren_02.mp4': 'Jongeren',
  
  // Vaders videos
  'vaders_01.mp4': 'Vaders',
  'vaders_02.mp4': 'Vaders',
  
  // Zakelijk videos
  'zakelijk_01.mp4': 'Zakelijk',
  'zakelijk_02.mp4': 'Zakelijk'
};

async function fixTargetAudiences() {
  console.log('🚀 Fixing target audiences for all videos...');
  
  const results = [];
  
  for (const [videoName, targetAudience] of Object.entries(targetAudienceMapping)) {
    console.log(`\n📦 Processing: ${videoName} → ${targetAudience}`);
    
    try {
      // Update the video record with correct target audience
      const { data, error } = await supabase
        .from('videos')
        .update({
          target_audience: targetAudience,
          updated_at: new Date().toISOString()
        })
        .eq('original_name', videoName)
        .select();

      if (error) {
        console.error(`❌ Error updating ${videoName}:`, error);
        results.push({ videoName, success: false, error: error.message });
      } else {
        console.log(`✅ Successfully updated ${videoName} to ${targetAudience}`);
        results.push({ videoName, success: true, targetAudience });
      }
    } catch (error) {
      console.error(`❌ Error processing ${videoName}:`, error);
      results.push({ videoName, success: false, error: error.message });
    }
  }
  
  console.log('\n🎉 Summary:');
  console.log(`✅ Successfully updated: ${results.filter(r => r.success).length} videos`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length} videos`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const target = result.success ? ` → ${result.targetAudience}` : '';
    console.log(`${status} ${result.videoName}${target}`);
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
      console.log('📋 Videos with target audiences:');
      videos?.forEach(video => {
        console.log(`   - ${video.name} (${video.original_name}) → ${video.target_audience}`);
      });
    }
  } catch (error) {
    console.error('❌ Error verifying final state:', error);
  }
}

fixTargetAudiences().catch(console.error);
