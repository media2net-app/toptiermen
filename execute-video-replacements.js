// Execute the 5 high-quality video replacements
const http = require('http');

async function executeVideoReplacements() {
  try {
    console.log('🚀 EXECUTING VIDEO REPLACEMENTS - 5 high-quality matches\n');
    
    // The 5 confirmed high-quality mappings
    const videoReplacements = [
      {
        oldVideo: 'TTM_Het_Merk_Prelaunch_Reel_02_V2.mov',
        newVideo: 'lv_0_20250821095611.mp4',
        quality: '🎯 PERFECT MATCH',
        sizeDiff: '0.0%'
      },
      {
        oldVideo: 'TTM_Het_Merk_Prelaunch_Reel_03_V2.mov',
        newVideo: 'lv_0_20250821095409.mp4',
        quality: '✅ EXCELLENT MATCH',
        sizeDiff: '2.4%'
      },
      {
        oldVideo: 'TTM_Het_Merk_Prelaunch_Reel_01_V2.mov',
        newVideo: 'lv_0_20250821094952.mp4',
        quality: '✅ EXCELLENT MATCH',
        sizeDiff: '3.8%'
      },
      {
        oldVideo: 'TTM_Het_Merk_Prelaunch_Reel_04_V2.mov',
        newVideo: 'lv_0_20250821100058.mp4',
        quality: '✅ EXCELLENT MATCH',
        sizeDiff: '1.6%'
      },
      {
        oldVideo: 'TTM_Vader_Prelaunch_Reel_02_V2.mov',
        newVideo: 'lv_0_20250821095148.mp4',
        quality: '✅ EXCELLENT MATCH',
        sizeDiff: '2.0%'
      }
    ];
    
    console.log('📋 REPLACEMENT PLAN:');
    console.log('====================');
    videoReplacements.forEach((replacement, index) => {
      console.log(`${index + 1}. ${replacement.oldVideo} → ${replacement.newVideo}`);
      console.log(`   Quality: ${replacement.quality} (${replacement.sizeDiff} difference)`);
    });
    
    console.log('\n🔄 STARTING REPLACEMENTS...');
    console.log('===========================');
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const replacement of videoReplacements) {
      console.log(`\n🎯 Processing: ${replacement.oldVideo} → ${replacement.newVideo}`);
      console.log(`   Quality: ${replacement.quality} (${replacement.sizeDiff} difference)`);
      
      try {
        // Step 1: Create backup
        console.log('   📦 Step 1: Creating backup...');
        const backupName = `${replacement.oldVideo}.backup`;
        const backupSuccess = await renameVideo(replacement.oldVideo, backupName);
        
        if (!backupSuccess) {
          console.log('   ❌ Failed to create backup, skipping...');
          failureCount++;
          continue;
        }
        
        console.log('   ✅ Backup created successfully');
        
        // Step 2: Rename new video to old video name
        console.log('   🔄 Step 2: Renaming new video...');
        const renameSuccess = await renameVideo(replacement.newVideo, replacement.oldVideo);
        
        if (!renameSuccess) {
          console.log('   ❌ Failed to rename new video, restoring backup...');
          await renameVideo(backupName, replacement.oldVideo);
          failureCount++;
          continue;
        }
        
        console.log('   ✅ New video renamed successfully');
        
        // Step 3: Clean up backup (optional - keep for safety)
        console.log('   🗑️  Step 3: Cleaning up backup...');
        const cleanupSuccess = await deleteVideo(backupName);
        
        if (cleanupSuccess) {
          console.log('   ✅ Backup cleaned up');
        } else {
          console.log('   ⚠️  Backup cleanup failed (but replacement succeeded)');
        }
        
        console.log(`   🎉 SUCCESS: ${replacement.oldVideo} replaced with subtitle version!`);
        successCount++;
        
      } catch (error) {
        console.log(`   ❌ Error during replacement: ${error.message}`);
        failureCount++;
      }
    }
    
    // Final summary
    console.log('\n📊 REPLACEMENT SUMMARY:');
    console.log('=======================');
    console.log(`✅ Successful replacements: ${successCount}`);
    console.log(`❌ Failed replacements: ${failureCount}`);
    console.log(`📊 Total processed: ${videoReplacements.length}`);
    
    if (successCount > 0) {
      console.log(`\n🎉 ${successCount} videos successfully updated with subtitles!`);
    }
    
    if (failureCount > 0) {
      console.log(`\n⚠️  ${failureCount} replacements failed and need manual review`);
    }
    
    // Show final video list
    console.log('\n📋 FINAL VIDEO LIST:');
    console.log('====================');
    const finalData = await fetch('http://localhost:6001/api/list-advertentie-videos');
    const finalResult = await finalData.json();
    
    if (finalResult.success && finalResult.videos) {
      const oldVideos = finalResult.videos.filter(v => !v.name.includes('lv_0_'));
      oldVideos.forEach(video => {
        console.log(`   📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    }
    
  } catch (error) {
    console.error('Error executing video replacements:', error);
  }
}

async function renameVideo(oldName, newName) {
  try {
    console.log(`      🔄 Renaming: ${oldName} → ${newName}`);
    
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
              resolve(true);
            } else {
              console.log(`      ❌ Failed: ${result.error || 'Unknown error'}`);
              resolve(false);
            }
          } catch (e) {
            console.log(`      ❌ Error parsing response: ${e.message}`);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        console.log(`      ❌ Request error: ${error.message}`);
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

async function deleteVideo(fileName) {
  try {
    console.log(`      🗑️  Deleting: ${fileName}`);
    
    const postData = JSON.stringify({
      fileName: fileName
    });
    
    const options = {
      hostname: 'localhost',
      port: 6001,
      path: '/api/admin/delete-video',
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
              resolve(true);
            } else {
              console.log(`      ❌ Failed: ${result.error || 'Unknown error'}`);
              resolve(false);
            }
          } catch (e) {
            console.log(`      ❌ Error parsing response: ${e.message}`);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        console.log(`      ❌ Request error: ${error.message}`);
        resolve(false);
      });
      
      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('Error deleting video:', error);
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

executeVideoReplacements();
