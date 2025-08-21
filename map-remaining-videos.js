// Map remaining videos from "nieuw" submap to old videos without subtitles
const http = require('http');

async function mapRemainingVideos() {
  try {
    console.log('🎯 MAPPING REMAINING VIDEOS FROM "NIEUW" SUBMAP\n');
    
    // Get videos from main bucket
    const mainData = await fetch('http://localhost:6001/api/list-advertentie-videos');
    const mainResult = await mainData.json();
    
    if (!mainResult.success || !mainResult.videos) {
      throw new Error('Failed to fetch videos from main bucket');
    }
    
    // Get videos from "nieuw" submap
    const newData = await fetch('http://localhost:6001/api/list-advertentie-videos?submap=nieuw');
    const newResult = await newData.json();
    
    if (!newResult.success || !newResult.videos) {
      throw new Error('Failed to fetch videos from nieuw submap');
    }
    
    const mainVideos = mainResult.videos;
    const newVideos = newResult.videos;
    
    console.log(`📼 Main bucket: ${mainVideos.length} videos`);
    console.log(`🆕 Nieuw submap: ${newVideos.length} videos\n`);
    
    // Filter out the "nieuw" folder entry and get actual old videos
    const oldVideos = mainVideos.filter(v => 
      !v.name.includes('lv_0_') && 
      !v.name.includes('nieuw') && 
      v.size && 
      !isNaN(v.size)
    );
    
    // Get new videos with subtitles
    const subtitleVideos = newVideos.filter(v => 
      v.name.includes('lv_0_') && 
      v.size && 
      !isNaN(v.size)
    );
    
    console.log('📼 OLD VIDEOS (without subtitles):');
    oldVideos.forEach((video, index) => {
      console.log(`${index + 1}. 📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    console.log('\n🆕 NEW VIDEOS (with subtitles):');
    subtitleVideos.forEach((video, index) => {
      console.log(`${index + 1}. 📹 ${video.name} (${(video.size / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Create smart mapping
    console.log('\n🔗 SMART MAPPING ANALYSIS:');
    console.log('==========================');
    
    const mappings = [];
    const usedOldVideos = new Set();
    const usedNewVideos = new Set();
    
    // Sort both arrays by size for better matching
    const sortedOldVideos = oldVideos.sort((a, b) => a.size - b.size);
    const sortedNewVideos = subtitleVideos.sort((a, b) => a.size - b.size);
    
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
            strategy: 'Exact size',
            newVideoPath: newVideo.full_path
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
          strategy: 'Very close size',
          newVideoPath: newVideo.full_path
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
          strategy: 'Good size',
          newVideoPath: newVideo.full_path
        });
        
        usedOldVideos.add(bestMatch.name);
        usedNewVideos.add(newVideo.name);
      }
    }
    
    // Strategy 4: Best remaining matches (any difference)
    console.log('\n🎲 STRATEGY 4: Best remaining matches');
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
          strategy: 'Best remaining',
          newVideoPath: newVideo.full_path
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
    console.log('\n📊 MAPPING SUMMARY:');
    console.log('==================');
    console.log(`🎯 Perfect size matches: ${mappings.filter(m => m.quality.includes('PERFECT')).length}`);
    console.log(`✅ Very close matches: ${mappings.filter(m => m.quality.includes('VERY CLOSE')).length}`);
    console.log(`⚠️  Good matches: ${mappings.filter(m => m.quality.includes('GOOD')).length}`);
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
      console.log(`# New video path: ${mapping.newVideoPath}`);
      console.log(`await replaceVideoFromSubmap('${mapping.oldVideo}', '${mapping.newVideo}', '${mapping.newVideoPath}');`);
    });
    
    // Final recommendations
    console.log('\n💡 FINAL RECOMMENDATIONS:');
    console.log('=========================');
    
    if (mappings.length > 0) {
      console.log(`✅ Ready to proceed with ${mappings.length} mappings`);
      console.log(`   All matches are well-matched and ready for replacement`);
    }
    
    if (unmatchedNewVideos.length > 0) {
      console.log(`\n⚠️  ${unmatchedNewVideos.length} new videos couldn't be matched`);
      console.log(`   These might be duplicates or need manual review`);
    }
    
    if (unmatchedOldVideos.length > 0) {
      console.log(`\n⚠️  ${unmatchedOldVideos.length} old videos don't have subtitle versions`);
      console.log(`   These will remain unchanged`);
    }
    
    return mappings;
    
  } catch (error) {
    console.error('Error mapping remaining videos:', error);
    return [];
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

mapRemainingVideos();
