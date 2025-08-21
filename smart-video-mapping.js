// Smart video mapping that ensures unique matches
const http = require('http');

async function smartVideoMapping() {
  try {
    console.log('🧠 SMART VIDEO MAPPING - Ensuring unique matches\n');
    
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
    
    // Sort both arrays by size for better matching
    const sortedNewVideos = newVideos.sort((a, b) => a.size - b.size);
    const sortedOldVideos = oldVideos.sort((a, b) => a.size - b.size);
    
    console.log('🆕 NEW VIDEOS (sorted by size):');
    sortedNewVideos.forEach((video, index) => {
      console.log(`${index + 1}. 📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    console.log('\n📼 OLD VIDEOS (sorted by size):');
    sortedOldVideos.forEach((video, index) => {
      console.log(`${index + 1}. 📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Create smart mapping with unique matches
    console.log('\n🔗 SMART MAPPING ANALYSIS:');
    console.log('==========================');
    
    const mappings = [];
    const usedOldVideos = new Set();
    const usedNewVideos = new Set();
    
    // First pass: Find exact matches (0% difference)
    for (const newVideo of sortedNewVideos) {
      if (usedNewVideos.has(newVideo.name)) continue;
      
      for (const oldVideo of sortedOldVideos) {
        if (usedOldVideos.has(oldVideo.name)) continue;
        
        const sizeDiff = Math.abs(newVideo.size - oldVideo.size);
        const sizeDiffPercent = ((sizeDiff / oldVideo.size) * 100);
        
        if (sizeDiffPercent === 0) {
          console.log(`🎯 PERFECT MATCH: ${newVideo.name} ↔ ${oldVideo.name} (0% difference)`);
          
          mappings.push({
            newVideo: newVideo.name,
            oldVideo: oldVideo.name,
            newSize: newVideo.size,
            oldSize: oldVideo.size,
            sizeDiff: sizeDiff,
            sizeDiffPercent: sizeDiffPercent,
            quality: '🎯 PERFECT MATCH'
          });
          
          usedOldVideos.add(oldVideo.name);
          usedNewVideos.add(newVideo.name);
          break;
        }
      }
    }
    
    // Second pass: Find excellent matches (<5% difference)
    for (const newVideo of sortedNewVideos) {
      if (usedNewVideos.has(newVideo.name)) continue;
      
      let bestMatch = null;
      let bestDiff = Infinity;
      
      for (const oldVideo of sortedOldVideos) {
        if (usedOldVideos.has(oldVideo.name)) continue;
        
        const sizeDiff = Math.abs(newVideo.size - oldVideo.size);
        const sizeDiffPercent = ((sizeDiff / oldVideo.size) * 100);
        
        if (sizeDiffPercent < 5 && sizeDiff < bestDiff) {
          bestMatch = oldVideo;
          bestDiff = sizeDiff;
        }
      }
      
      if (bestMatch) {
        const sizeDiff = Math.abs(newVideo.size - bestMatch.size);
        const sizeDiffPercent = ((sizeDiff / bestMatch.size) * 100);
        
        console.log(`✅ EXCELLENT MATCH: ${newVideo.name} ↔ ${bestMatch.name} (${sizeDiffPercent.toFixed(1)}% difference)`);
        
        mappings.push({
          newVideo: newVideo.name,
          oldVideo: bestMatch.name,
          newSize: newVideo.size,
          oldSize: bestMatch.size,
          sizeDiff: sizeDiff,
          sizeDiffPercent: sizeDiffPercent,
          quality: '✅ EXCELLENT MATCH'
        });
        
        usedOldVideos.add(bestMatch.name);
        usedNewVideos.add(newVideo.name);
      }
    }
    
    // Third pass: Find good matches (<15% difference)
    for (const newVideo of sortedNewVideos) {
      if (usedNewVideos.has(newVideo.name)) continue;
      
      let bestMatch = null;
      let bestDiff = Infinity;
      
      for (const oldVideo of sortedOldVideos) {
        if (usedOldVideos.has(oldVideo.name)) continue;
        
        const sizeDiff = Math.abs(newVideo.size - oldVideo.size);
        const sizeDiffPercent = ((sizeDiff / oldVideo.size) * 100);
        
        if (sizeDiffPercent < 15 && sizeDiff < bestDiff) {
          bestMatch = oldVideo;
          bestDiff = sizeDiff;
        }
      }
      
      if (bestMatch) {
        const sizeDiff = Math.abs(newVideo.size - bestMatch.size);
        const sizeDiffPercent = ((sizeDiff / bestMatch.size) * 100);
        
        console.log(`⚠️  GOOD MATCH: ${newVideo.name} ↔ ${bestMatch.name} (${sizeDiffPercent.toFixed(1)}% difference)`);
        
        mappings.push({
          newVideo: newVideo.name,
          oldVideo: bestMatch.name,
          newSize: newVideo.size,
          oldSize: bestMatch.size,
          sizeDiff: sizeDiff,
          sizeDiffPercent: sizeDiffPercent,
          quality: '⚠️  GOOD MATCH'
        });
        
        usedOldVideos.add(bestMatch.name);
        usedNewVideos.add(newVideo.name);
      }
    }
    
    // Show unmatched videos
    const unmatchedNewVideos = sortedNewVideos.filter(v => !usedNewVideos.has(v.name));
    const unmatchedOldVideos = sortedOldVideos.filter(v => !usedOldVideos.has(v.name));
    
    if (unmatchedNewVideos.length > 0) {
      console.log('\n❌ UNMATCHED NEW VIDEOS:');
      unmatchedNewVideos.forEach(video => {
        console.log(`   📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    }
    
    if (unmatchedOldVideos.length > 0) {
      console.log('\n❌ UNMATCHED OLD VIDEOS:');
      unmatchedOldVideos.forEach(video => {
        console.log(`   📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    }
    
    // Summary
    console.log('\n📊 SMART MAPPING SUMMARY:');
    console.log('==========================');
    console.log(`🎯 Perfect matches: ${mappings.filter(m => m.quality.includes('PERFECT')).length}`);
    console.log(`✅ Excellent matches: ${mappings.filter(m => m.quality.includes('EXCELLENT')).length}`);
    console.log(`⚠️  Good matches: ${mappings.filter(m => m.quality.includes('GOOD')).length}`);
    console.log(`📊 Total mappings: ${mappings.length}`);
    console.log(`❌ Unmatched new videos: ${unmatchedNewVideos.length}`);
    console.log(`❌ Unmatched old videos: ${unmatchedOldVideos.length}`);
    
    // Generate replacement commands
    console.log('\n🔄 REPLACEMENT COMMANDS:');
    console.log('========================');
    
    mappings.forEach((mapping, index) => {
      console.log(`\n# ${index + 1}. Replace ${mapping.oldVideo} with ${mapping.newVideo}:`);
      console.log(`# Quality: ${mapping.quality}`);
      console.log(`# Size difference: ${mapping.sizeDiffPercent.toFixed(1)}%`);
      console.log(`await replaceVideo('${mapping.oldVideo}', '${mapping.newVideo}');`);
    });
    
    // Final recommendations
    console.log('\n💡 FINAL RECOMMENDATIONS:');
    console.log('=========================');
    
    if (mappings.length > 0) {
      console.log(`✅ Proceed with ${mappings.length} high-quality mappings`);
      console.log(`   All matches are unique and well-matched`);
    }
    
    if (unmatchedNewVideos.length > 0) {
      console.log(`\n⚠️  ${unmatchedNewVideos.length} new videos couldn't be matched`);
      console.log(`   These might be duplicates or need manual review`);
    }
    
    if (unmatchedOldVideos.length > 0) {
      console.log(`\n⚠️  ${unmatchedOldVideos.length} old videos don't have subtitle versions`);
      console.log(`   These will remain unchanged`);
    }
    
  } catch (error) {
    console.error('Error in smart video mapping:', error);
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

smartVideoMapping();
