// Complete video mapping for all 11 videos
const http = require('http');

async function completeVideoMapping() {
  try {
    console.log('🔍 COMPLETE VIDEO MAPPING - All 11 videos\n');
    
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
    console.log('🆕 NEW VIDEOS WITH SUBTITLES:');
    newVideos.forEach((video, index) => {
      console.log(`${index + 1}. 📹 ${video.name}`);
      console.log(`   Size: ${(video.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Created: ${new Date(video.created_at).toLocaleString()}`);
      console.log('');
    });
    
    // Display old videos sorted by size
    console.log('📼 OLD VIDEOS (sorted by size):');
    const sortedOldVideos = oldVideos.sort((a, b) => a.size - b.size);
    sortedOldVideos.forEach((video, index) => {
      console.log(`${index + 1}. 📹 ${video.name}`);
      console.log(`   Size: ${(video.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Created: ${new Date(video.created_at).toLocaleString()}`);
      console.log('');
    });
    
    // Create comprehensive mapping
    console.log('🔗 COMPREHENSIVE MAPPING ANALYSIS:');
    console.log('==================================');
    
    const mappings = [];
    
    for (const newVideo of newVideos) {
      console.log(`\n🎯 MAPPING FOR: ${newVideo.name} (${(newVideo.size / 1024 / 1024).toFixed(2)} MB)`);
      
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
        
        // Quality assessment
        let quality = '';
        if (sizeDiffPercent < 5) {
          quality = '🎯 EXCELLENT MATCH';
        } else if (sizeDiffPercent < 15) {
          quality = '✅ GOOD MATCH';
        } else if (sizeDiffPercent < 30) {
          quality = '⚠️  MODERATE MATCH';
        } else {
          quality = '❌ POOR MATCH';
        }
        
        console.log(`      Quality: ${quality}`);
        
        mappings.push({
          newVideo: newVideo.name,
          oldVideo: closestMatch.name,
          newSize: newVideo.size,
          oldSize: closestMatch.size,
          sizeDiff: sizeDiff,
          sizeDiffPercent: parseFloat(sizeDiffPercent),
          quality: quality
        });
      } else {
        console.log(`   ❌ No suitable match found`);
      }
    }
    
    // Summary table
    console.log('\n📊 MAPPING SUMMARY TABLE:');
    console.log('==========================');
    console.log('| New Video | Old Video | Size Diff | Quality |');
    console.log('|-----------|-----------|-----------|---------|');
    
    mappings.forEach(mapping => {
      const newName = mapping.newVideo.substring(0, 15) + '...';
      const oldName = mapping.oldVideo.substring(0, 15) + '...';
      const sizeDiff = mapping.sizeDiffPercent.toFixed(1) + '%';
      const quality = mapping.quality.split(' ')[0]; // Just the emoji
      
      console.log(`| ${newName.padEnd(15)} | ${oldName.padEnd(15)} | ${sizeDiff.padEnd(9)} | ${quality.padEnd(7)} |`);
    });
    
    // Statistics
    const excellentMatches = mappings.filter(m => m.quality.includes('EXCELLENT')).length;
    const goodMatches = mappings.filter(m => m.quality.includes('GOOD')).length;
    const moderateMatches = mappings.filter(m => m.quality.includes('MODERATE')).length;
    const poorMatches = mappings.filter(m => m.quality.includes('POOR')).length;
    
    console.log('\n📈 MAPPING QUALITY STATISTICS:');
    console.log('==============================');
    console.log(`🎯 Excellent matches: ${excellentMatches}`);
    console.log(`✅ Good matches: ${goodMatches}`);
    console.log(`⚠️  Moderate matches: ${moderateMatches}`);
    console.log(`❌ Poor matches: ${poorMatches}`);
    console.log(`📊 Total mappings: ${mappings.length}`);
    
    // Generate replacement commands
    console.log('\n🔄 REPLACEMENT COMMANDS:');
    console.log('========================');
    
    mappings.forEach((mapping, index) => {
      console.log(`\n# ${index + 1}. Replace ${mapping.oldVideo} with ${mapping.newVideo}:`);
      console.log(`# Quality: ${mapping.quality}`);
      console.log(`# Size difference: ${mapping.sizeDiffPercent.toFixed(1)}%`);
      console.log(`await replaceVideo('${mapping.oldVideo}', '${mapping.newVideo}');`);
    });
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('==================');
    
    const recommendedMappings = mappings.filter(m => 
      m.quality.includes('EXCELLENT') || m.quality.includes('GOOD')
    );
    
    if (recommendedMappings.length > 0) {
      console.log(`✅ Recommended to proceed with ${recommendedMappings.length} high-quality mappings:`);
      recommendedMappings.forEach(mapping => {
        console.log(`   • ${mapping.oldVideo} → ${mapping.newVideo} (${mapping.sizeDiffPercent.toFixed(1)}% diff)`);
      });
    }
    
    const questionableMappings = mappings.filter(m => 
      m.quality.includes('MODERATE') || m.quality.includes('POOR')
    );
    
    if (questionableMappings.length > 0) {
      console.log(`\n⚠️  ${questionableMappings.length} mappings need manual review:`);
      questionableMappings.forEach(mapping => {
        console.log(`   • ${mapping.oldVideo} → ${mapping.newVideo} (${mapping.sizeDiffPercent.toFixed(1)}% diff)`);
      });
    }
    
  } catch (error) {
    console.error('Error in complete video mapping:', error);
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

completeVideoMapping();
