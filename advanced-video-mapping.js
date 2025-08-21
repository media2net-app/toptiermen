// Advanced video mapping considering video duration/length
const http = require('http');

async function advancedVideoMapping() {
  try {
    console.log('🧠 ADVANCED VIDEO MAPPING - Considering video duration/length\n');
    
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
    
    // Since we can't get actual video duration from the API, let's use a more sophisticated approach
    // We'll analyze the file sizes more carefully and look for patterns
    
    console.log('🔍 ANALYZING VIDEO PATTERNS:');
    console.log('============================');
    
    // Sort both arrays by size
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
    
    // Create advanced mapping with multiple criteria
    console.log('\n🔗 ADVANCED MAPPING ANALYSIS:');
    console.log('==============================');
    
    const mappings = [];
    const usedOldVideos = new Set();
    const usedNewVideos = new Set();
    
    // Strategy 1: Exact size matches first
    console.log('\n🎯 STRATEGY 1: Exact size matches');
    for (const newVideo of sortedNewVideos) {
      if (usedNewVideos.has(newVideo.name)) continue;
      
      for (const oldVideo of sortedOldVideos) {
        if (usedOldVideos.has(oldVideo.name)) continue;
        
        if (newVideo.size === oldVideo.size) {
          console.log(`   🎯 PERFECT SIZE MATCH: ${newVideo.name} ↔ ${oldVideo.name} (${(newVideo.size / 1024 / 1024).toFixed(2)} MB)`);
          
          mappings.push({
            newVideo: newVideo.name,
            oldVideo: oldVideo.name,
            newSize: newVideo.size,
            oldSize: oldVideo.size,
            sizeDiff: 0,
            sizeDiffPercent: 0,
            quality: '🎯 PERFECT SIZE MATCH',
            strategy: 'Exact size'
          });
          
          usedOldVideos.add(oldVideo.name);
          usedNewVideos.add(newVideo.name);
          break;
        }
      }
    }
    
    // Strategy 2: Very close size matches (<2% difference)
    console.log('\n✅ STRATEGY 2: Very close size matches (<2%)');
    for (const newVideo of sortedNewVideos) {
      if (usedNewVideos.has(newVideo.name)) continue;
      
      let bestMatch = null;
      let bestDiff = Infinity;
      
      for (const oldVideo of sortedOldVideos) {
        if (usedOldVideos.has(oldVideo.name)) continue;
        
        const sizeDiff = Math.abs(newVideo.size - oldVideo.size);
        const sizeDiffPercent = ((sizeDiff / oldVideo.size) * 100);
        
        if (sizeDiffPercent < 2 && sizeDiff < bestDiff) {
          bestMatch = oldVideo;
          bestDiff = sizeDiff;
        }
      }
      
      if (bestMatch) {
        const sizeDiff = Math.abs(newVideo.size - bestMatch.size);
        const sizeDiffPercent = ((sizeDiff / bestMatch.size) * 100);
        
        console.log(`   ✅ VERY CLOSE MATCH: ${newVideo.name} ↔ ${bestMatch.name} (${sizeDiffPercent.toFixed(1)}% diff)`);
        
        mappings.push({
          newVideo: newVideo.name,
          oldVideo: bestMatch.name,
          newSize: newVideo.size,
          oldSize: bestMatch.size,
          sizeDiff: sizeDiff,
          sizeDiffPercent: sizeDiffPercent,
          quality: '✅ VERY CLOSE MATCH',
          strategy: 'Very close size'
        });
        
        usedOldVideos.add(bestMatch.name);
        usedNewVideos.add(newVideo.name);
      }
    }
    
    // Strategy 3: Good size matches (<5% difference)
    console.log('\n⚠️  STRATEGY 3: Good size matches (<5%)');
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
        
        console.log(`   ⚠️  GOOD MATCH: ${newVideo.name} ↔ ${bestMatch.name} (${sizeDiffPercent.toFixed(1)}% diff)`);
        
        mappings.push({
          newVideo: newVideo.name,
          oldVideo: bestMatch.name,
          newSize: newVideo.size,
          oldSize: bestMatch.size,
          sizeDiff: sizeDiff,
          sizeDiffPercent: sizeDiffPercent,
          quality: '⚠️  GOOD MATCH',
          strategy: 'Good size'
        });
        
        usedOldVideos.add(bestMatch.name);
        usedNewVideos.add(newVideo.name);
      }
    }
    
    // Strategy 4: Acceptable matches (<10% difference)
    console.log('\n🔍 STRATEGY 4: Acceptable matches (<10%)');
    for (const newVideo of sortedNewVideos) {
      if (usedNewVideos.has(newVideo.name)) continue;
      
      let bestMatch = null;
      let bestDiff = Infinity;
      
      for (const oldVideo of sortedOldVideos) {
        if (usedOldVideos.has(oldVideo.name)) continue;
        
        const sizeDiff = Math.abs(newVideo.size - oldVideo.size);
        const sizeDiffPercent = ((sizeDiff / oldVideo.size) * 100);
        
        if (sizeDiffPercent < 10 && sizeDiff < bestDiff) {
          bestMatch = oldVideo;
          bestDiff = sizeDiff;
        }
      }
      
      if (bestMatch) {
        const sizeDiff = Math.abs(newVideo.size - bestMatch.size);
        const sizeDiffPercent = ((sizeDiff / bestMatch.size) * 100);
        
        console.log(`   🔍 ACCEPTABLE MATCH: ${newVideo.name} ↔ ${bestMatch.name} (${sizeDiffPercent.toFixed(1)}% diff)`);
        
        mappings.push({
          newVideo: newVideo.name,
          oldVideo: bestMatch.name,
          newSize: newVideo.size,
          oldSize: bestMatch.size,
          sizeDiff: sizeDiff,
          sizeDiffPercent: sizeDiffPercent,
          quality: '🔍 ACCEPTABLE MATCH',
          strategy: 'Acceptable size'
        });
        
        usedOldVideos.add(bestMatch.name);
        usedNewVideos.add(newVideo.name);
      }
    }
    
    // Strategy 5: Best remaining matches (any difference)
    console.log('\n🎲 STRATEGY 5: Best remaining matches');
    for (const newVideo of sortedNewVideos) {
      if (usedNewVideos.has(newVideo.name)) continue;
      
      let bestMatch = null;
      let bestDiff = Infinity;
      
      for (const oldVideo of sortedOldVideos) {
        if (usedOldVideos.has(oldVideo.name)) continue;
        
        const sizeDiff = Math.abs(newVideo.size - oldVideo.size);
        
        if (sizeDiff < bestDiff) {
          bestMatch = oldVideo;
          bestDiff = sizeDiff;
        }
      }
      
      if (bestMatch) {
        const sizeDiff = Math.abs(newVideo.size - bestMatch.size);
        const sizeDiffPercent = ((sizeDiff / bestMatch.size) * 100);
        
        console.log(`   🎲 BEST REMAINING: ${newVideo.name} ↔ ${bestMatch.name} (${sizeDiffPercent.toFixed(1)}% diff)`);
        
        mappings.push({
          newVideo: newVideo.name,
          oldVideo: bestMatch.name,
          newSize: newVideo.size,
          oldSize: bestMatch.size,
          sizeDiff: sizeDiff,
          sizeDiffPercent: sizeDiffPercent,
          quality: '🎲 BEST REMAINING',
          strategy: 'Best remaining'
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
    console.log('\n📊 ADVANCED MAPPING SUMMARY:');
    console.log('=============================');
    console.log(`🎯 Perfect size matches: ${mappings.filter(m => m.quality.includes('PERFECT')).length}`);
    console.log(`✅ Very close matches: ${mappings.filter(m => m.quality.includes('VERY CLOSE')).length}`);
    console.log(`⚠️  Good matches: ${mappings.filter(m => m.quality.includes('GOOD')).length}`);
    console.log(`🔍 Acceptable matches: ${mappings.filter(m => m.quality.includes('ACCEPTABLE')).length}`);
    console.log(`🎲 Best remaining: ${mappings.filter(m => m.quality.includes('BEST REMAINING')).length}`);
    console.log(`📊 Total mappings: ${mappings.length}`);
    console.log(`❌ Unmatched new videos: ${unmatchedNewVideos.length}`);
    console.log(`❌ Unmatched old videos: ${unmatchedOldVideos.length}`);
    
    // Generate replacement commands
    console.log('\n🔄 REPLACEMENT COMMANDS:');
    console.log('========================');
    
    mappings.forEach((mapping, index) => {
      console.log(`\n# ${index + 1}. Replace ${mapping.oldVideo} with ${mapping.newVideo}:`);
      console.log(`# Quality: ${mapping.quality}`);
      console.log(`# Strategy: ${mapping.strategy}`);
      console.log(`# Size difference: ${mapping.sizeDiffPercent.toFixed(1)}%`);
      console.log(`await replaceVideo('${mapping.oldVideo}', '${mapping.newVideo}');`);
    });
    
    // Final recommendations
    console.log('\n💡 FINAL RECOMMENDATIONS:');
    console.log('=========================');
    
    if (mappings.length === 11) {
      console.log(`🎉 SUCCESS: All 11 videos mapped!`);
      console.log(`   This suggests the videos are indeed the same content with subtitles added`);
    } else {
      console.log(`⚠️  ${mappings.length}/11 videos mapped`);
      console.log(`   ${unmatchedNewVideos.length} new videos and ${unmatchedOldVideos.length} old videos couldn't be matched`);
    }
    
    const highQualityMappings = mappings.filter(m => 
      m.quality.includes('PERFECT') || m.quality.includes('VERY CLOSE') || m.quality.includes('GOOD')
    );
    
    if (highQualityMappings.length > 0) {
      console.log(`\n✅ Recommended to proceed with ${highQualityMappings.length} high-quality mappings`);
    }
    
    const questionableMappings = mappings.filter(m => 
      m.quality.includes('ACCEPTABLE') || m.quality.includes('BEST REMAINING')
    );
    
    if (questionableMappings.length > 0) {
      console.log(`\n⚠️  ${questionableMappings.length} mappings need manual review before proceeding`);
    }
    
  } catch (error) {
    console.error('Error in advanced video mapping:', error);
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

advancedVideoMapping();
