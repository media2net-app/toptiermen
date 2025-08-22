require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mapping van huidige bestandsnamen naar dashboard titels
const videoMapping = {
  // Algemeen videos (5 stuks)
  'TTM_Het_Merk_Prelaunch_Reel_01_V2.mov': 'algemeen_01.mp4',
  'TTM_Het_Merk_Prelaunch_Reel_02_V2.mov': 'algemeen_02.mp4',
  'TTM_Het_Merk_Prelaunch_Reel_03_V2.mov': 'algemeen_03.mp4',
  'TTM_Het_Merk_Prelaunch_Reel_04_V2.mov': 'algemeen_04.mp4',
  'TTM_Het_Merk_Prelaunch_Reel_05_V2.mov': 'algemeen_05.mp4',
  
  // Jongeren videos (2 stuks)
  'TTM_Jeugd_Prelaunch_Reel_01_V2.mov': 'jongeren_01.mp4',
  'TTM_Jeugd_Prelaunch_Reel_02_V2.mov': 'jongeren_02.mp4',
  
  // Vaders videos (2 stuks)
  'TTM_Vader_Prelaunch_Reel_01_V2.mov': 'vaders_01.mp4',
  'TTM_Vader_Prelaunch_Reel_02_V2.mov': 'vaders_02.mp4',
  
  // Zakelijk videos (2 stuks)
  'TTM_Zakelijk_Prelaunch_Reel_01_V2.mov': 'zakelijk_01.mp4',
  'TTM_Zakelijk_Prelaunch_Reel_02_V2.mov': 'zakelijk_02.mp4',
  
  // Nieuwe videos (3 stuks) - deze zijn de lv_0 bestanden
  'lv_0_20250821161841.mp4': 'algemeen_01.mp4', // Deze vervangt de oude algemeen_01
  'lv_0_20250821162618.mp4': 'jongeren_01.mp4', // Deze vervangt de oude jongeren_01
  'lv_0_20250821163117.mp4': 'vaders_01.mp4'    // Deze vervangt de oude vaders_01
};

async function getCurrentVideos() {
  console.log('📋 Fetching current videos from bucket...');
  
  try {
    const { data: files, error } = await supabase.storage
      .from('advertenties')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('❌ Error listing files:', error);
      return [];
    }

    console.log(`✅ Found ${files?.length || 0} files in bucket`);
    return files || [];
  } catch (error) {
    console.error('❌ Error fetching videos:', error);
    return [];
  }
}

async function downloadVideo(oldName) {
  console.log(`📥 Downloading ${oldName}...`);
  
  try {
    const { data, error } = await supabase.storage
      .from('advertenties')
      .download(oldName);

    if (error) {
      console.error(`❌ Error downloading ${oldName}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`❌ Error downloading ${oldName}:`, error);
    return null;
  }
}

async function uploadVideo(newName, fileData) {
  console.log(`📤 Uploading ${newName}...`);
  
  try {
    const { data, error } = await supabase.storage
      .from('advertenties')
      .upload(newName, fileData, {
        contentType: 'video/mp4',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error(`❌ Error uploading ${newName}:`, error);
      return false;
    }

    console.log(`✅ Successfully uploaded ${newName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error uploading ${newName}:`, error);
    return false;
  }
}

async function deleteOldVideo(oldName) {
  console.log(`🗑️  Deleting old file ${oldName}...`);
  
  try {
    const { error } = await supabase.storage
      .from('advertenties')
      .remove([oldName]);

    if (error) {
      console.error(`❌ Error deleting ${oldName}:`, error);
      return false;
    }

    console.log(`✅ Successfully deleted ${oldName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting ${oldName}:`, error);
    return false;
  }
}

async function updateVideoInDatabase(oldName, newName) {
  console.log(`🔄 Updating database record: ${oldName} → ${newName}`);
  
  try {
    // Update the video record in the database
    const { data, error } = await supabase
      .from('videos')
      .update({
        name: newName.replace('.mp4', ''),
        original_name: newName,
        file_path: `/videos/advertenties/${newName}`,
        updated_at: new Date().toISOString()
      })
      .eq('original_name', oldName)
      .select();

    if (error) {
      console.error(`❌ Error updating database for ${oldName}:`, error);
      return false;
    }

    console.log(`✅ Successfully updated database record for ${oldName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating database for ${oldName}:`, error);
    return false;
  }
}

async function renameVideos() {
  console.log('🚀 Starting video renaming process...');
  
  const currentFiles = await getCurrentVideos();
  if (currentFiles.length === 0) {
    console.error('❌ No files found in bucket');
    return;
  }

  const results = [];
  
  for (const [oldName, newName] of Object.entries(videoMapping)) {
    console.log(`\n📦 Processing: ${oldName} → ${newName}`);
    
    // Check if old file exists
    const fileExists = currentFiles.some(file => file.name === oldName);
    if (!fileExists) {
      console.log(`⚠️  File ${oldName} not found, skipping...`);
      continue;
    }
    
    // Download the old file
    const fileData = await downloadVideo(oldName);
    if (!fileData) {
      console.log(`⚠️  Could not download ${oldName}, skipping...`);
      continue;
    }
    
    // Upload with new name
    const uploadSuccess = await uploadVideo(newName, fileData);
    if (!uploadSuccess) {
      console.log(`⚠️  Could not upload ${newName}, skipping...`);
      continue;
    }
    
    // Update database record
    const dbSuccess = await updateVideoInDatabase(oldName, newName);
    
    // Delete old file (only if new upload was successful)
    if (uploadSuccess) {
      await deleteOldVideo(oldName);
    }
    
    results.push({
      oldName,
      newName,
      success: uploadSuccess && dbSuccess
    });
    
    // Wait a bit between operations to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Renaming Summary:');
  console.log(`✅ Successfully renamed: ${results.filter(r => r.success).length} videos`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length} videos`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.oldName} → ${result.newName}`);
  });
  
  // Verify final state
  console.log('\n🔍 Verifying final state...');
  const finalFiles = await getCurrentVideos();
  console.log(`📋 Final file count: ${finalFiles?.length || 0}`);
  
  if (finalFiles) {
    console.log('📋 Final files:');
    finalFiles.forEach(file => {
      console.log(`   - ${file.name}`);
    });
  }
}

renameVideos().catch(console.error);
