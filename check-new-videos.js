// Check new videos in the "nieuw" submap and map them
const http = require('http');

async function checkNewVideos() {
  try {
    console.log('🔍 CHECKING NEW VIDEOS IN "NIEUW" SUBMAP\n');
    
    // First, let's check what's currently in the main bucket
    console.log('📊 CURRENT VIDEOS IN MAIN BUCKET:');
    const mainData = await fetch('http://localhost:6001/api/list-advertentie-videos');
    const mainResult = await mainData.json();
    
    if (!mainResult.success || !mainResult.videos) {
      throw new Error('Failed to fetch videos from main bucket');
    }
    
    const mainVideos = mainResult.videos;
    console.log(`📼 Main bucket: ${mainVideos.length} videos\n`);
    
    // Display current videos
    mainVideos.forEach((video, index) => {
      console.log(`${index + 1}. 📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Now let's check if there's a way to access the "nieuw" submap
    // We might need to modify the API to support subdirectories
    console.log('\n🔍 ATTEMPTING TO ACCESS "NIEUW" SUBMAP...');
    
    // Try different approaches to access the submap
    const submapAttempts = [
      'http://localhost:6001/api/list-advertentie-videos?submap=nieuw',
      'http://localhost:6001/api/list-advertentie-videos?folder=nieuw',
      'http://localhost:6001/api/list-advertentie-videos?path=nieuw'
    ];
    
    let newVideos = [];
    
    for (const attempt of submapAttempts) {
      try {
        console.log(`   Trying: ${attempt}`);
        const submapData = await fetch(attempt);
        const submapResult = await submapData.json();
        
        if (submapResult.success && submapResult.videos && submapResult.videos.length > 0) {
          console.log(`   ✅ Found ${submapResult.videos.length} videos in submap!`);
          newVideos = submapResult.videos;
          break;
        }
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }
    
    if (newVideos.length === 0) {
      console.log('\n⚠️  Could not access "nieuw" submap via API');
      console.log('   We may need to modify the API to support subdirectories');
      console.log('   Or the videos might be in a different location');
      
      // Let's check if we can see any new videos in the main bucket
      console.log('\n🔍 CHECKING FOR NEW VIDEOS IN MAIN BUCKET...');
      const newVideosInMain = mainVideos.filter(v => v.name.includes('lv_0_'));
      
      if (newVideosInMain.length > 0) {
        console.log(`   ✅ Found ${newVideosInMain.length} new videos in main bucket:`);
        newVideosInMain.forEach(video => {
          console.log(`   📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
        });
        newVideos = newVideosInMain;
      } else {
        console.log('   ❌ No new videos found in main bucket');
      }
    } else {
      console.log('\n🆕 NEW VIDEOS FOUND:');
      newVideos.forEach((video, index) => {
        console.log(`${index + 1}. 📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    }
    
    // Identify which old videos don't have subtitle versions yet
    const oldVideos = mainVideos.filter(v => !v.name.includes('lv_0_'));
    const oldVideosWithoutSubtitles = oldVideos.filter(oldVideo => {
      // Check if this old video already has a subtitle version (newer timestamp)
      const hasSubtitleVersion = mainVideos.some(v => 
        v.name === oldVideo.name && 
        new Date(v.created_at) > new Date(oldVideo.created_at)
      );
      return !hasSubtitleVersion;
    });
    
    console.log('\n📼 OLD VIDEOS WITHOUT SUBTITLES:');
    if (oldVideosWithoutSubtitles.length > 0) {
      oldVideosWithoutSubtitles.forEach((video, index) => {
        console.log(`${index + 1}. 📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    } else {
      console.log('   ✅ All old videos already have subtitle versions!');
    }
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log(`📼 Total videos in main bucket: ${mainVideos.length}`);
    console.log(`🆕 New videos found: ${newVideos.length}`);
    console.log(`📼 Old videos without subtitles: ${oldVideosWithoutSubtitles.length}`);
    
    if (newVideos.length > 0 && oldVideosWithoutSubtitles.length > 0) {
      console.log('\n🎯 READY FOR MAPPING:');
      console.log('====================');
      console.log(`   We can map ${Math.min(newVideos.length, oldVideosWithoutSubtitles.length)} videos`);
      console.log('   Run the mapping script to proceed with replacements');
    } else if (newVideos.length === 0) {
      console.log('\n⚠️  NO NEW VIDEOS FOUND');
      console.log('   Please check if the videos are uploaded correctly');
    } else if (oldVideosWithoutSubtitles.length === 0) {
      console.log('\n✅ ALL VIDEOS ALREADY HAVE SUBTITLES');
      console.log('   No further mapping needed');
    }
    
  } catch (error) {
    console.error('Error checking new videos:', error);
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

checkNewVideos();
