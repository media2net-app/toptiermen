const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkNieuwvideoSubfolder() {
  console.log('🔍 Checking nieuwvideo subfolder in advertenties bucket...');
  
  try {
    // List files in nieuwvideo subfolder
    const { data: files, error } = await supabase.storage
      .from('advertenties')
      .list('nieuwvideo', {
        limit: 100,
        offset: 0
      });

    if (error) {
      console.error('❌ Error listing files in nieuwvideo subfolder:', error);
      return;
    }

    console.log(`📊 Found ${files?.length || 0} files in nieuwvideo subfolder:\n`);
    
    if (files && files.length > 0) {
      files.forEach(file => {
        const sizeMB = Math.round(file.metadata?.size / 1024 / 1024);
        console.log(`  📹 ${file.name} (${sizeMB} MB)`);
      });
      
      // Check for lv_0_2025 files
      const lvFiles = files.filter(f => f.name.includes('lv_0_2025'));
      if (lvFiles.length > 0) {
        console.log(`\n✅ Found ${lvFiles.length} lv_0_2025 files!`);
      } else {
        console.log('\n❌ No lv_0_2025 files found in nieuwvideo subfolder');
      }
    } else {
      console.log('❌ No files found in nieuwvideo subfolder');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkNieuwvideoSubfolder().catch(console.error);
