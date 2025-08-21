// Script to clean up duplicate videos and backup files
const http = require('http');

async function cleanupDuplicateVideos() {
  try {
    console.log('🧹 Cleaning up duplicate videos and backup files...\n');
    
    // Get current videos from API
    const data = await fetch('http://localhost:6001/api/list-advertentie-videos');
    const result = await data.json();
    
    if (!result.success || !result.videos) {
      throw new Error('Failed to fetch videos from API');
    }
    
    const videos = result.videos;
    console.log(`📊 Found ${videos.length} videos in advertenties bucket\n`);
    
    // Find files to clean up
    const filesToDelete = [
      'lv_0_20250821095611 (1).mp4',  // Duplicate video
      'TTM_Het_Merk_Prelaunch_Reel_02_V2.mov.backup'  // Backup file
    ];
    
    console.log('🗑️  Files to delete:');
    filesToDelete.forEach(file => {
      console.log(`   - ${file}`);
    });
    console.log('');
    
    // Delete each file
    for (const fileName of filesToDelete) {
      console.log(`🗑️  Deleting: ${fileName}`);
      
      const deleteSuccess = await deleteVideo(fileName);
      
      if (deleteSuccess) {
        console.log(`   ✅ Successfully deleted: ${fileName}`);
      } else {
        console.log(`   ❌ Failed to delete: ${fileName}`);
      }
    }
    
    // Show final video list
    console.log('\n📊 Final video list:');
    const finalData = await fetch('http://localhost:6001/api/list-advertentie-videos');
    const finalResult = await finalData.json();
    
    if (finalResult.success && finalResult.videos) {
      finalResult.videos.forEach(video => {
        console.log(`   📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    }
    
    console.log('\n✅ Cleanup completed!');
    
  } catch (error) {
    console.error('Error cleaning up videos:', error);
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
              console.log(`   ❌ Failed to delete: ${result.error || 'Unknown error'}`);
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

cleanupDuplicateVideos();
