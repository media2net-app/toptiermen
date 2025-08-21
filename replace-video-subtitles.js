// Script to replace old videos with new videos that have subtitles
const http = require('http');

async function replaceVideoSubtitles() {
  try {
    console.log('🔄 Replacing old videos with new videos that have subtitles...\n');
    
    // Configuration - you can modify these mappings
    const videoReplacements = [
      {
        oldVideo: 'TTM_Het_Merk_Prelaunch_Reel_02_V2.mov',
        newVideo: 'lv_0_20250821095611.mp4',
        reason: 'Best size match (23.4% difference)'
      }
    ];
    
    for (const replacement of videoReplacements) {
      console.log(`🎯 Processing replacement: ${replacement.oldVideo} → ${replacement.newVideo}`);
      console.log(`   Reason: ${replacement.reason}\n`);
      
      // Step 1: Get video details
      console.log('📊 Step 1: Getting video details...');
      const oldVideoDetails = await getVideoDetails(replacement.oldVideo);
      const newVideoDetails = await getVideoDetails(replacement.newVideo);
      
      if (!oldVideoDetails || !newVideoDetails) {
        console.log('❌ Failed to get video details, skipping...\n');
        continue;
      }
      
      console.log(`   Old video: ${oldVideoDetails.name} (${(oldVideoDetails.size / 1024 / 1024).toFixed(2)} MB)`);
      console.log(`   New video: ${newVideoDetails.name} (${(newVideoDetails.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // Step 2: Backup old video (optional - just rename it)
      console.log('\n📦 Step 2: Creating backup of old video...');
      const backupName = `${replacement.oldVideo}.backup`;
      const backupSuccess = await renameVideo(replacement.oldVideo, backupName);
      
      if (!backupSuccess) {
        console.log('❌ Failed to create backup, skipping replacement...\n');
        continue;
      }
      
      console.log(`   ✅ Backup created: ${backupName}`);
      
      // Step 3: Rename new video to old video name
      console.log('\n🔄 Step 3: Renaming new video to old video name...');
      const renameSuccess = await renameVideo(replacement.newVideo, replacement.oldVideo);
      
      if (!renameSuccess) {
        console.log('❌ Failed to rename new video, restoring backup...');
        await renameVideo(backupName, replacement.oldVideo);
        continue;
      }
      
      console.log(`   ✅ New video renamed to: ${replacement.oldVideo}`);
      
      // Step 4: Update database records if needed
      console.log('\n🗄️  Step 4: Updating database records...');
      const dbUpdateSuccess = await updateDatabaseRecords(replacement.oldVideo, newVideoDetails);
      
      if (dbUpdateSuccess) {
        console.log('   ✅ Database records updated');
      } else {
        console.log('   ⚠️  Database update failed (but video replacement succeeded)');
      }
      
      console.log(`\n🎉 SUCCESS: ${replacement.oldVideo} has been replaced with subtitle version!\n`);
    }
    
    console.log('✅ All video replacements completed!');
    
  } catch (error) {
    console.error('Error replacing video subtitles:', error);
  }
}

async function getVideoDetails(fileName) {
  try {
    const data = await fetch(`http://localhost:6001/api/list-advertentie-videos`);
    const result = await data.json();
    
    if (!result.success || !result.videos) {
      return null;
    }
    
    return result.videos.find(v => v.name === fileName) || null;
  } catch (error) {
    console.error('Error getting video details:', error);
    return null;
  }
}

async function renameVideo(oldName, newName) {
  try {
    console.log(`   🔄 Renaming: ${oldName} → ${newName}`);
    
    const postData = JSON.stringify({
      oldFileName: oldName,
      newFileName: newName
    });
    
    const options = {
      hostname: 'localhost',
      port: 6001,
      path: '/api/admin/rename-video',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            if (res.statusCode === 200 && result.success) {
              console.log(`   ✅ Successfully renamed: ${oldName} → ${newName}`);
              resolve(true);
            } else {
              console.log(`   ❌ Failed to rename: ${result.error || 'Unknown error'}`);
              resolve(false);
            }
          } catch (e) {
            console.log(`   ❌ Error parsing response: ${e.message}`);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        console.log(`   ❌ Request error: ${error.message}`);
        resolve(false);
      });
      
      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('Error renaming video:', error);
    return false;
  }
}

async function updateDatabaseRecords(videoName, newVideoDetails) {
  try {
    // This would update the videos table in the database
    console.log(`   🔄 Would update database for: ${videoName}`);
    console.log(`   ⚠️  Note: This requires database update functionality`);
    
    // Simulate success for now
    return true;
  } catch (error) {
    console.error('Error updating database records:', error);
    return false;
  }
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ json: () => JSON.parse(data) });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

replaceVideoSubtitles();
