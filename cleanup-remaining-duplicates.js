// Clean up remaining duplicate videos
const http = require('http');

async function cleanupRemainingDuplicates() {
  try {
    console.log('🧹 CLEANING UP REMAINING DUPLICATE VIDEOS\n');
    
    // Get current videos from API
    const data = await fetch('http://localhost:6001/api/list-advertentie-videos');
    const result = await data.json();
    
    if (!result.success || !result.videos) {
      throw new Error('Failed to fetch videos from API');
    }
    
    const videos = result.videos;
    console.log(`📊 Found ${videos.length} videos in advertenties bucket\n`);
    
    // Find remaining new videos (duplicates that couldn't be matched)
    const remainingNewVideos = videos.filter(v => v.name.includes('lv_0_'));
    
    if (remainingNewVideos.length === 0) {
      console.log('✅ No duplicate videos found to clean up!');
      return;
    }
    
    console.log(`🗑️  Found ${remainingNewVideos.length} duplicate videos to clean up:`);
    remainingNewVideos.forEach(video => {
      console.log(`   📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    console.log('\n🔄 STARTING CLEANUP...');
    console.log('=======================');
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const video of remainingNewVideos) {
      console.log(`\n🗑️  Deleting: ${video.name}`);
      
      try {
        const deleteSuccess = await deleteVideo(video.name);
        
        if (deleteSuccess) {
          console.log(`   ✅ Successfully deleted: ${video.name}`);
          successCount++;
        } else {
          console.log(`   ❌ Failed to delete: ${video.name}`);
          failureCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error deleting ${video.name}: ${error.message}`);
        failureCount++;
      }
    }
    
    // Final summary
    console.log('\n📊 CLEANUP SUMMARY:');
    console.log('====================');
    console.log(`✅ Successfully deleted: ${successCount}`);
    console.log(`❌ Failed deletions: ${failureCount}`);
    console.log(`📊 Total processed: ${remainingNewVideos.length}`);
    
    if (successCount > 0) {
      console.log(`\n🎉 ${successCount} duplicate videos cleaned up!`);
    }
    
    // Show final video list
    console.log('\n📋 FINAL VIDEO LIST:');
    console.log('====================');
    const finalData = await fetch('http://localhost:6001/api/list-advertentie-videos');
    const finalResult = await finalData.json();
    
    if (finalResult.success && finalResult.videos) {
      const oldVideos = finalResult.videos.filter(v => !v.name.includes('lv_0_'));
      console.log(`📊 Total videos remaining: ${oldVideos.length}`);
      
      oldVideos.forEach(video => {
        console.log(`   📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    }
    
    console.log('\n✅ Cleanup completed!');
    
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
  }
}

async function deleteVideo(fileName) {
  try {
    console.log(`   🔄 Deleting: ${fileName}`);
    
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
              console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
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

cleanupRemainingDuplicates();
