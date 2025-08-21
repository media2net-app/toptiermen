const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const videos = [
  {
    filename: 'TTM_Het_Merk_Prelaunch_Reel_01_V2.mov',
    title: 'Het Merk - Prelaunch Reel 01',
    description: 'TopTierMen merk video - deel 1',
    target_audience: 'algemeen',
    file_size: 29068067,
    mime_type: 'video/quicktime'
  },
  {
    filename: 'TTM_Het_Merk_Prelaunch_Reel_02_V2.mov',
    title: 'Het Merk - Prelaunch Reel 02',
    description: 'TopTierMen merk video - deel 2',
    target_audience: 'algemeen',
    file_size: 28255179,
    mime_type: 'video/quicktime'
  },
  {
    filename: 'TTM_Het_Merk_Prelaunch_Reel_03_V2.mov',
    title: 'Het Merk - Prelaunch Reel 03',
    description: 'TopTierMen merk video - deel 3',
    target_audience: 'algemeen',
    file_size: 28295891,
    mime_type: 'video/quicktime'
  },
  {
    filename: 'TTM_Het_Merk_Prelaunch_Reel_04_V2.mov',
    title: 'Het Merk - Prelaunch Reel 04',
    description: 'TopTierMen merk video - deel 4',
    target_audience: 'algemeen',
    file_size: 29115492,
    mime_type: 'video/quicktime'
  },
  {
    filename: 'TTM_Het_Merk_Prelaunch_Reel_05_V2.mov',
    title: 'Het Merk - Prelaunch Reel 05',
    description: 'TopTierMen merk video - deel 5',
    target_audience: 'algemeen',
    file_size: 38721989,
    mime_type: 'video/quicktime'
  },
  {
    filename: 'TTM_Jeugd_Prelaunch_Reel_01_V2.mov',
    title: 'Jeugd - Prelaunch Reel 01',
    description: 'TopTierMen jeugd video - deel 1',
    target_audience: 'jeugd',
    file_size: 32705119,
    mime_type: 'video/quicktime'
  },
  {
    filename: 'TTM_Jeugd_Prelaunch_Reel_02_V2.mov',
    title: 'Jeugd - Prelaunch Reel 02',
    description: 'TopTierMen jeugd video - deel 2',
    target_audience: 'jeugd',
    file_size: 38990079,
    mime_type: 'video/quicktime'
  },
  {
    filename: 'TTM_Vader_Prelaunch_Reel_01_V2.mov',
    title: 'Vader - Prelaunch Reel 01',
    description: 'TopTierMen vader video - deel 1',
    target_audience: 'vaders',
    file_size: 32788453,
    mime_type: 'video/quicktime'
  },
  {
    filename: 'TTM_Vader_Prelaunch_Reel_02_V2.mov',
    title: 'Vader - Prelaunch Reel 02',
    description: 'TopTierMen vader video - deel 2',
    target_audience: 'vaders',
    file_size: 30234110,
    mime_type: 'video/quicktime'
  },
  {
    filename: 'TTM_Zakelijk_Prelaunch_Reel_01_V2.mov',
    title: 'Zakelijk - Prelaunch Reel 01',
    description: 'TopTierMen zakelijk video - deel 1',
    target_audience: 'zakelijk',
    file_size: 41052881,
    mime_type: 'video/quicktime'
  },
  {
    filename: 'TTM_Zakelijk_Prelaunch_Reel_02_V2.mov',
    title: 'Zakelijk - Prelaunch Reel 02',
    description: 'TopTierMen zakelijk video - deel 2',
    target_audience: 'zakelijk',
    file_size: 41056769,
    mime_type: 'video/quicktime'
  }
];

async function mapAdvertentieVideos() {
  console.log('Starting to map advertentie videos...');
  
  for (const video of videos) {
    try {
      // First check if video already exists
      const { data: existing } = await supabase
        .from('videos')
        .select('id')
        .eq('original_name', video.filename)
        .single();

      if (existing) {
        console.log(`⏭️  Skipping ${video.filename} - already exists`);
        continue;
      }

      const { data, error } = await supabase
        .from('videos')
        .insert({
          name: video.title,
          original_name: video.filename,
          file_path: `/videos/advertenties/${video.filename}`,
          file_size: video.file_size,
          mime_type: video.mime_type,
          target_audience: video.target_audience,
          campaign_status: 'inactive',
          bucket_name: 'advertenties',
          is_deleted: false
        })
        .select();

      if (error) {
        console.error(`❌ Error inserting ${video.filename}:`, JSON.stringify(error, null, 2));
      } else {
        console.log(`✅ Successfully mapped: ${video.filename} (ID: ${data[0]?.id})`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${video.filename}:`, err.message);
    }
  }
  
  console.log('Finished mapping advertentie videos.');
}

mapAdvertentieVideos().catch(console.error);
