// Script to map new videos with subtitles to old videos
const http = require('http');

async function mapVideoSubtitles() {
  try {
    console.log('🔍 Mapping new videos with subtitles to old videos...\n');
    
    // Get current videos from API
    const data = await fetch('http://localhost:6001/api/list-advertentie-videos');
    const result = await data.json();
    
    if (!result.success || !result.videos) {
      throw new Error('Failed to fetch videos from API');
    }
    
    const videos = result.videos;
    console.log(`📊 Found ${videos.length} videos in advertenties bucket\n`);
    
    // Separate new videos (with subtitles) from old videos
    const newVideos = videos.filter(v => v.name.includes('lv_0_'));
    const oldVideos = videos.filter(v => !v.name.includes('lv_0_'));
    
    console.log(`🆕 New videos with subtitles: ${newVideos.length}`);
    console.log(`📼 Old videos: ${oldVideos.length}\n`);
    
    // Display new videos
    if (newVideos.length > 0) {
      console.log('🆕 NEW VIDEOS WITH SUBTITLES:');
      newVideos.forEach(video => {
        console.log(`   📹 ${video.name}`);
        console.log(`      Size: ${(video.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`      Created: ${new Date(video.created_at).toLocaleString()}`);
        console.log('');
      });
    }
    
    // Display old videos sorted by size
    console.log('📼 OLD VIDEOS (sorted by size):');
    const sortedOldVideos = oldVideos.sort((a, b) => a.size - b.size);
    sortedOldVideos.forEach(video => {
      console.log(`   📹 ${video.name}`);
      console.log(`      Size: ${(video.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`      Created: ${new Date(video.created_at).toLocaleString()}`);
      console.log('');
    });
    
    // Create mapping suggestions based on file size
    console.log('🔗 MAPPING SUGGESTIONS:');
    console.log('========================');
    
    for (const newVideo of newVideos) {
      console.log(`\n🎯 Mapping for: ${newVideo.name} (${(newVideo.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // Find closest match by file size
      const closestMatch = findClosestMatch(newVideo, sortedOldVideos);
      
      if (closestMatch) {
        const sizeDiff = Math.abs(newVideo.size - closestMatch.size);
        const sizeDiffMB = (sizeDiff / 1024 / 1024).toFixed(2);
        const sizeDiffPercent = ((sizeDiff / closestMatch.size) * 100).toFixed(1);
        
        console.log(`   ✅ SUGGESTED MATCH: ${closestMatch.name}`);
        console.log(`      Size difference: ${sizeDiffMB} MB (${sizeDiffPercent}%)`);
        console.log(`      Old size: ${(closestMatch.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`      New size: ${(newVideo.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Additional analysis
        if (sizeDiffPercent < 5) {
          console.log(`      🎯 EXCELLENT MATCH (size difference < 5%)`);
        } else if (sizeDiffPercent < 15) {
          console.log(`      ✅ GOOD MATCH (size difference < 15%)`);
        } else if (sizeDiffPercent < 30) {
          console.log(`      ⚠️  MODERATE MATCH (size difference < 30%)`);
        } else {
          console.log(`      ❌ POOR MATCH (size difference > 30%)`);
        }
      } else {
        console.log(`   ❌ No suitable match found`);
      }
    }
    
    // Provide replacement commands
    console.log('\n🔄 REPLACEMENT COMMANDS:');
    console.log('========================');
    
    for (const newVideo of newVideos) {
      const closestMatch = findClosestMatch(newVideo, sortedOldVideos);
      if (closestMatch) {
        console.log(`\n# Replace ${closestMatch.name} with ${newVideo.name}:`);
        console.log(`# Old: ${closestMatch.name} (${(closestMatch.size / 1024 / 1024).toFixed(2)} MB)`);
        console.log(`# New: ${newVideo.name} (${(newVideo.size / 1024 / 1024).toFixed(2)} MB)`);
        console.log(`await replaceVideo('${closestMatch.name}', '${newVideo.name}');`);
      }
    }
    
  } catch (error) {
    console.error('Error mapping video subtitles:', error);
  }
}

function findClosestMatch(newVideo, oldVideos) {
  if (oldVideos.length === 0) return null;
  
  // Find the closest match by file size
  let closestMatch = oldVideos[0];
  let smallestDiff = Math.abs(newVideo.size - oldVideos[0].size);
  
  for (const oldVideo of oldVideos) {
    const diff = Math.abs(newVideo.size - oldVideo.size);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestMatch = oldVideo;
    }
  }
  
  return closestMatch;
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

mapVideoSubtitles();
