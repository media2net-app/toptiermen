require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMissingVideos() {
  console.log('🔍 Checking for missing videos...');

  try {
    // Get all files in storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('advertenties')
      .list('', { limit: 100 });

    if (storageError) {
      console.error('Storage error:', storageError);
      return;
    }

    // Get all videos in database
    const { data: dbVideos, error: dbError } = await supabase
      .from('videos')
      .select('original_name')
      .eq('bucket_name', 'advertenties');

    if (dbError) {
      console.error('Database error:', dbError);
      return;
    }

    const dbVideoNames = dbVideos.map(v => v.original_name);
    
    console.log('Files in storage but not in database:');
    let foundMissing = false;
    storageFiles.forEach(file => {
      if (!dbVideoNames.includes(file.name)) {
        console.log(`  • ${file.name} (${(file.metadata?.size / 1024 / 1024).toFixed(2)} MB)`);
        foundMissing = true;
      }
    });
    
    if (!foundMissing) {
      console.log('  No missing files found');
    }
    
    console.log('\nLooking for the 3 new videos:');
    const newVideos = ['lv_0_20250821161841.mp4', 'lv_0_20250821162618.mp4', 'lv_0_20250821163117.mp4'];
    newVideos.forEach(video => {
      const inStorage = storageFiles.some(f => f.name === video);
      const inDatabase = dbVideoNames.includes(video);
      console.log(`  • ${video}: Storage=${inStorage ? '✅' : '❌'}, Database=${inDatabase ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkMissingVideos();
