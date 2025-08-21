// Execute remaining video replacements from submap
const http = require('http');

async function executeRemainingReplacements() {
  try {
    console.log('🚀 EXECUTING REMAINING VIDEO REPLACEMENTS FROM SUBMAP\n');
    
    // The mappings from our analysis
    const videoReplacements = [
      {
        oldVideo: 'TTM_Het_Merk_Prelaunch_Reel_02_V2.mov',
        newVideo: 'lv_0_20250821095611.mp4',
        newVideoPath: 'nieuw/lv_0_20250821095611.mp4',
        quality: '🎯 PERFECT SIZE MATCH',
        sizeDiff: '0.0%'
      },
      {
        oldVideo: 'TTM_Het_Merk_Prelaunch_Reel_03_V2.mov',
        newVideo: 'lv_0_20250821095409.mp4',
        newVideoPath: 'nieuw/lv_0_20250821095409.mp4',
        quality: '🎯 PERFECT SIZE MATCH',
        sizeDiff: '0.0%'
      },
      {
        oldVideo: 'TTM_Het_Merk_Prelaunch_Reel_01_V2.mov',
        newVideo: 'lv_0_20250821094952.mp4',
        newVideoPath: 'nieuw/lv_0_20250821094952.mp4',
        quality: '🎯 PERFECT SIZE MATCH',
        sizeDiff: '0.0%'
      },
      {
        oldVideo: 'TTM_Het_Merk_Prelaunch_Reel_04_V2.mov',
        newVideo: 'lv_0_20250821100058.mp4',
        newVideoPath: 'nieuw/lv_0_20250821100058.mp4',
        quality: '🎯 PERFECT SIZE MATCH',
        sizeDiff: '0.0%'
      },
      {
        oldVideo: 'TTM_Vader_Prelaunch_Reel_02_V2.mov',
        newVideo: 'lv_0_20250821095148.mp4',
        newVideoPath: 'nieuw/lv_0_20250821095148.mp4',
        quality: '🎯 PERFECT SIZE MATCH',
        sizeDiff: '0.0%'
      },
      {
        oldVideo: 'TTM_Jeugd_Prelaunch_Reel_01_V2.mov',
        newVideo: 'lv_0_20250821094059.mp4',
        newVideoPath: 'nieuw/lv_0_20250821094059.mp4',
        quality: '🎲 BEST REMAINING',
        sizeDiff: '37.5%'
      },
      {
        oldVideo: 'TTM_Vader_Prelaunch_Reel_01_V2.mov',
        newVideo: 'lv_0_20250821094302.mp4',
        newVideoPath: 'nieuw/lv_0_20250821094302.mp4',
        quality: '🎲 BEST REMAINING',
        sizeDiff: '37.6%'
      },
      {
        oldVideo: 'TTM_Het_Merk_Prelaunch_Reel_05_V2.mov',
        newVideo: 'lv_0_20250821094505.mp4',
        newVideoPath: 'nieuw/lv_0_20250821094505.mp4',
        quality: '🎲 BEST REMAINING',
        sizeDiff: '46.0%'
      },
      {
        oldVideo: 'TTM_Jeugd_Prelaunch_Reel_02_V2.mov',
        newVideo: 'lv_0_20250821093738.mp4',
        newVideoPath: 'nieuw/lv_0_20250821093738.mp4',
        quality: '🎲 BEST REMAINING',
        sizeDiff: '45.4%'
      },
      {
        oldVideo: 'TTM_Zakelijk_Prelaunch_Reel_01_V2.mov',
        newVideo: 'lv_0_20250821094835.mp4',
        newVideoPath: 'nieuw/lv_0_20250821094835.mp4',
        quality: '🎲 BEST REMAINING',
        sizeDiff: '43.9%'
      },
      {
        oldVideo: 'TTM_Zakelijk_Prelaunch_Reel_02_V2.mov',
        newVideo: 'lv_0_20250821095807.mp4',
        newVideoPath: 'nieuw/lv_0_20250821095807.mp4',
        quality: '🎲 BEST REMAINING',
        sizeDiff: '42.4%'
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
        const replaceSuccess = await replaceVideoFromSubmap(
          replacement.oldVideo,
          replacement.newVideo,
          replacement.newVideoPath
        );
        
        if (replaceSuccess) {
          console.log(`   🎉 SUCCESS: ${replacement.oldVideo} replaced with subtitle version!`);
          successCount++;
        } else {
          console.log(`   ❌ FAILED: Could not replace ${replacement.oldVideo}`);
          failureCount++;
        }
        
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
      const oldVideos = finalResult.videos.filter(v => !v.name.includes('lv_0_') && !v.name.includes('nieuw'));
      console.log(`📊 Total videos: ${oldVideos.length}`);
      
      oldVideos.forEach(video => {
        console.log(`   📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    }
    
  } catch (error) {
    console.error('Error executing remaining replacements:', error);
  }
}

async function replaceVideoFromSubmap(oldVideoName, newVideoName, newVideoPath) {
  try {
    console.log(`      🔄 Replacing: ${oldVideoName} with ${newVideoName} from ${newVideoPath}`);
    
    const postData = JSON.stringify({
      oldVideoName: oldVideoName,
      newVideoName: newVideoName,
      newVideoPath: newVideoPath
    });
    
    const options = {
      hostname: 'localhost',
      port: 6001,
      path: '/api/admin/replace-video-from-submap',
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
    console.error('Error replacing video from submap:', error);
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

executeRemainingReplacements();
