require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateVideoTargetAudiences() {
  console.log('🎯 Updating video target audiences...');

  try {
    // Get all videos
    const { data: videos, error } = await supabase
      .from('videos')
      .select('id, name, original_name, target_audience')
      .eq('bucket_name', 'advertenties')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching videos:', error);
      return;
    }

    console.log(`📹 Found ${videos.length} videos`);

    // Update videos that don't have a target audience or have old format
    let updatedCount = 0;
    for (const video of videos) {
      const currentTarget = video.target_audience;
      
      // Check if target audience needs updating
      const needsUpdate = !currentTarget || 
                         !['Algemeen', 'Vaders', 'Jongeren', 'Zakelijk'].includes(currentTarget) ||
                         currentTarget.includes('Mannen 25-45') ||
                         currentTarget.includes('fitness, lifestyle');

      if (needsUpdate) {
        console.log(`🔄 Updating ${video.name}: "${currentTarget}" → "Algemeen"`);
        
        const { error: updateError } = await supabase
          .from('videos')
          .update({ target_audience: 'Algemeen' })
          .eq('id', video.id);

        if (updateError) {
          console.error(`❌ Error updating ${video.name}:`, updateError);
        } else {
          updatedCount++;
        }
      } else {
        console.log(`✅ ${video.name}: "${currentTarget}" (already correct)`);
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} videos to "Algemeen" target audience`);
    
    // Show final summary
    const { data: finalVideos, error: finalError } = await supabase
      .from('videos')
      .select('name, target_audience')
      .eq('bucket_name', 'advertenties')
      .order('created_at', { ascending: false });

    if (!finalError && finalVideos) {
      console.log('\n📋 Final target audience summary:');
      finalVideos.forEach(video => {
        console.log(`  • ${video.name}: ${video.target_audience}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
updateVideoTargetAudiences()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
