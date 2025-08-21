const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addNewVideo() {
  console.log('🆕 Adding new video to database...');
  
  const newVideo = {
    filename: 'lv_0_20250821162618.mp4',
    title: 'lv_0_20250821162618.mp4',
    description: 'Nieuwe aangepaste advertentie video',
    target_audience: 'Algemene doelgroep, fitness, Nederland',
    file_size: 22 * 1024 * 1024, // 22 MB in bytes
    mime_type: 'video/mp4',
    file_path: 'nieuwvideo/lv_0_20250821162618.mp4'
  };

  try {
    // Check if video already exists
    const { data: existing } = await supabase
      .from('videos')
      .select('id')
      .eq('original_name', newVideo.filename)
      .single();

    if (existing) {
      console.log(`⏭️  Skipping ${newVideo.filename} - already exists`);
      return;
    }

    // Insert new video
    const { data, error } = await supabase
      .from('videos')
      .insert({
        name: newVideo.title,
        original_name: newVideo.filename,
        file_path: newVideo.file_path,
        file_size: newVideo.file_size,
        mime_type: newVideo.mime_type,
        target_audience: newVideo.target_audience,
        campaign_status: 'inactive',
        bucket_name: 'advertenties',
        is_deleted: false
      })
      .select();

    if (error) {
      console.error(`❌ Error inserting ${newVideo.filename}:`, JSON.stringify(error, null, 2));
    } else {
      console.log(`✅ Successfully added: ${newVideo.filename} (ID: ${data[0]?.id})`);
    }

  } catch (err) {
    console.error(`❌ Error processing ${newVideo.filename}:`, err.message);
  }
}

addNewVideo().catch(console.error);
