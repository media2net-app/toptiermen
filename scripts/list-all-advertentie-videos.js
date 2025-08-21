const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listAllAdvertentieVideos() {
  console.log('🔍 Listing all videos in advertenties bucket...');
  
  try {
    // List all files in the advertenties bucket
    const { data: files, error } = await supabase.storage
      .from('advertenties')
      .list('', {
        limit: 100,
        offset: 0
      });

    if (error) {
      console.error('❌ Error listing files:', error);
      return;
    }

    console.log(`📊 Found ${files?.length || 0} files in advertenties bucket:\n`);
    
    if (files && files.length > 0) {
      // Group files by type
      const ttmFiles = files.filter(f => f.name.includes('TTM_'));
      const lvFiles = files.filter(f => f.name.includes('lv_0_2025'));
      const otherFiles = files.filter(f => !f.name.includes('TTM_') && !f.name.includes('lv_0_2025'));

      if (ttmFiles.length > 0) {
        console.log('🎯 TTM Files:');
        ttmFiles.forEach(file => {
          const sizeMB = Math.round(file.metadata?.size / 1024 / 1024);
          console.log(`  📹 ${file.name} (${sizeMB} MB)`);
        });
        console.log('');
      }

      if (lvFiles.length > 0) {
        console.log('🆕 New lv_0_2025 Files:');
        lvFiles.forEach(file => {
          const sizeMB = Math.round(file.metadata?.size / 1024 / 1024);
          console.log(`  📹 ${file.name} (${sizeMB} MB)`);
        });
        console.log('');
      }

      if (otherFiles.length > 0) {
        console.log('📁 Other Files:');
        otherFiles.forEach(file => {
          const sizeMB = Math.round(file.metadata?.size / 1024 / 1024);
          console.log(`  📹 ${file.name} (${sizeMB} MB)`);
        });
        console.log('');
      }

      // Check if any lv_0_2025 files exist
      if (lvFiles.length > 0) {
        console.log('✅ Found new lv_0_2025 files! These need to be added to the database.');
      } else {
        console.log('❌ No lv_0_2025 files found. Please check if the videos were uploaded correctly.');
      }
    } else {
      console.log('❌ No files found in advertenties bucket');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

listAllAdvertentieVideos().catch(console.error);
