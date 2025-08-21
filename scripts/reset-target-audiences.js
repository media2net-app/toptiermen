const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetTargetAudiences() {
  console.log('🔄 Resetting target audiences to default...');
  
  try {
    // Update all videos to have a default target audience
    const { data, error } = await supabase
      .from('videos')
      .update({ 
        target_audience: 'Algemene doelgroep, fitness, Nederland',
        updated_at: new Date().toISOString()
      })
      .eq('bucket_name', 'advertenties')
      .eq('is_deleted', false)
      .select('id, original_name, target_audience');

    if (error) {
      console.error('❌ Error updating target audiences:', error);
      return;
    }

    console.log(`✅ Updated ${data?.length || 0} videos with default target audience`);
    
    if (data && data.length > 0) {
      console.log('\n📋 Updated videos:');
      data.forEach(video => {
        console.log(`  - ${video.original_name}: "${video.target_audience}"`);
      });
    }

    console.log('\n🎉 Target audiences reset! You can now set them manually.');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

resetTargetAudiences().catch(console.error);
