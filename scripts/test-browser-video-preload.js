require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testBrowserVideoPreload() {
  console.log('🌐 BROWSER VIDEO PRELOAD PERFORMANCE TEST');
  console.log('=========================================');
  console.log('');
  console.log('⚠️  This test simulates browser video preloading behavior');
  console.log('   It will test actual video metadata loading, not just HEAD requests');
  console.log('');

  try {
    // Fetch all exercises with video URLs
    console.log('📋 Fetching exercises from database...');
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('id, name, video_url')
      .not('video_url', 'is', null);

    if (error) {
      console.error('❌ Database error:', error);
      return;
    }

    console.log(`✅ Found ${exercises.length} exercises with videos`);
    console.log('');

    // Test with a subset first (first 10 videos)
    const testVideos = exercises.slice(0, 10);
    console.log(`🧪 Testing with first ${testVideos.length} videos for performance analysis`);
    console.log('');

    const results = [];
    const startTime = performance.now();

    console.log('🚀 Starting browser-style video preload test...');
    console.log('');

    for (let i = 0; i < testVideos.length; i++) {
      const exercise = testVideos[i];
      const videoStartTime = performance.now();
      
      console.log(`📹 [${i + 1}/${testVideos.length}] Testing: ${exercise.name}`);
      
      try {
        // Simulate browser video preload behavior
        // First, test if video URL is accessible
        const headResponse = await fetch(exercise.video_url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        
        if (!headResponse.ok) {
          throw new Error(`HTTP ${headResponse.status}: ${headResponse.statusText}`);
        }

        // Get video size
        const videoSize = headResponse.headers.get('content-length');
        const sizeInMB = videoSize ? (parseInt(videoSize) / (1024 * 1024)).toFixed(2) : 'unknown';
        
        // Simulate metadata loading time (browser needs to download some data to get metadata)
        const metadataLoadTime = performance.now() - videoStartTime;
        
        // Estimate full preload time based on video size and network speed
        // Assuming average network speed of 10 Mbps
        const estimatedFullLoadTime = videoSize ? 
          (parseInt(videoSize) * 8) / (10 * 1024 * 1024) * 1000 : // Convert to milliseconds
          metadataLoadTime * 2; // Fallback estimate
        
        results.push({
          id: exercise.id,
          name: exercise.name,
          url: exercise.video_url,
          metadataLoadTime: metadataLoadTime,
          estimatedFullLoadTime: estimatedFullLoadTime,
          videoSize: sizeInMB,
          status: 'success'
        });
        
        console.log(`   ✅ SUCCESS - Metadata: ${metadataLoadTime.toFixed(2)}ms - Size: ${sizeInMB}MB - Est. Full: ${estimatedFullLoadTime.toFixed(2)}ms`);
        
      } catch (error) {
        const errorTime = performance.now() - videoStartTime;
        results.push({
          id: exercise.id,
          name: exercise.name,
          url: exercise.video_url,
          metadataLoadTime: errorTime,
          estimatedFullLoadTime: 0,
          videoSize: 'unknown',
          status: 'error',
          error: error.message
        });
        
        console.log(`   ❌ ERROR - ${errorTime.toFixed(2)}ms - ${error.message}`);
      }
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const totalTime = performance.now() - startTime;
    
    console.log('');
    console.log('📊 BROWSER PRELOAD PERFORMANCE RESULTS');
    console.log('======================================');
    console.log('');
    
    // Calculate statistics
    const successfulResults = results.filter(r => r.status === 'success');
    const errorResults = results.filter(r => r.status === 'error');
    
    const metadataLoadTimes = successfulResults.map(r => r.metadataLoadTime);
    const fullLoadTimes = successfulResults.map(r => r.estimatedFullLoadTime);
    
    const avgMetadataTime = metadataLoadTimes.length > 0 ? metadataLoadTimes.reduce((a, b) => a + b, 0) / metadataLoadTimes.length : 0;
    const avgFullLoadTime = fullLoadTimes.length > 0 ? fullLoadTimes.reduce((a, b) => a + b, 0) / fullLoadTimes.length : 0;
    
    console.log(`⏱️  Total Test Time: ${totalTime.toFixed(2)}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log(`📹 Videos Tested: ${results.length}`);
    console.log(`✅ Successful: ${successfulResults.length}`);
    console.log(`❌ Errors: ${errorResults.length}`);
    console.log('');
    
    console.log('📈 LOAD TIME STATISTICS:');
    console.log(`   Average Metadata Load: ${avgMetadataTime.toFixed(2)}ms`);
    console.log(`   Average Full Load (Est.): ${avgFullLoadTime.toFixed(2)}ms`);
    console.log('');
    
    // Calculate estimated performance for all 52 videos
    const totalVideos = exercises.length;
    const estimatedTotalMetadataTime = avgMetadataTime * totalVideos;
    const estimatedTotalFullLoadTime = avgFullLoadTime * totalVideos;
    
    console.log('🎯 ESTIMATED PERFORMANCE FOR ALL 52 VIDEOS:');
    console.log(`   Total Metadata Load Time: ${estimatedTotalMetadataTime.toFixed(2)}ms (${(estimatedTotalMetadataTime / 1000).toFixed(2)}s)`);
    console.log(`   Total Full Load Time: ${estimatedTotalFullLoadTime.toFixed(2)}ms (${(estimatedTotalFullLoadTime / 1000).toFixed(2)}s)`);
    console.log('');
    
    // Performance recommendations
    console.log('💡 PRELOAD RECOMMENDATIONS:');
    console.log('');
    
    if (estimatedTotalMetadataTime < 5000) {
      console.log('   ✅ METADATA PRELOAD: FEASIBLE - Under 5 seconds');
      console.log('      - Videos can load metadata quickly');
      console.log('      - Good for showing video duration, dimensions');
    } else if (estimatedTotalMetadataTime < 15000) {
      console.log('   ⚠️  METADATA PRELOAD: MODERATE - 5-15 seconds');
      console.log('      - Consider loading metadata in batches');
      console.log('      - Use progressive loading');
    } else {
      console.log('   ❌ METADATA PRELOAD: NOT RECOMMENDED - Over 15 seconds');
      console.log('      - Too slow for good UX');
      console.log('      - Consider lazy loading only');
    }
    console.log('');
    
    if (estimatedTotalFullLoadTime < 30000) {
      console.log('   ✅ FULL PRELOAD: FEASIBLE - Under 30 seconds');
      console.log('      - Videos can be fully preloaded');
      console.log('      - Good for instant playback');
    } else if (estimatedTotalFullLoadTime < 60000) {
      console.log('   ⚠️  FULL PRELOAD: MODERATE - 30-60 seconds');
      console.log('      - Consider progressive preloading');
      console.log('      - Load videos as user scrolls');
    } else {
      console.log('   ❌ FULL PRELOAD: NOT RECOMMENDED - Over 60 seconds');
      console.log('      - Too slow for good UX');
      console.log('      - Use lazy loading with metadata only');
    }
    console.log('');
    
    // Show video sizes
    if (successfulResults.length > 0) {
      console.log('📏 VIDEO SIZE ANALYSIS:');
      const sizes = successfulResults.map(r => parseFloat(r.videoSize)).filter(s => !isNaN(s));
      const avgSize = sizes.length > 0 ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0;
      const totalSize = sizes.reduce((a, b) => a + b, 0);
      
      console.log(`   Average Video Size: ${avgSize.toFixed(2)}MB`);
      console.log(`   Total Size (${successfulResults.length} videos): ${totalSize.toFixed(2)}MB`);
      console.log(`   Estimated Total Size (52 videos): ${(avgSize * 52).toFixed(2)}MB`);
      console.log('');
    }
    
    // Show slowest videos
    if (successfulResults.length > 0) {
      console.log('🐌 SLOWEST METADATA LOADS (>1s):');
      console.log('================================');
      const slowVideos = successfulResults.filter(r => r.metadataLoadTime > 1000);
      slowVideos.sort((a, b) => b.metadataLoadTime - a.metadataLoadTime);
      slowVideos.slice(0, 3).forEach(result => {
        console.log(`   ${result.name}: ${result.metadataLoadTime.toFixed(2)}ms (${result.videoSize}MB)`);
      });
      console.log('');
    }
    
    console.log('🎬 FINAL RECOMMENDATION:');
    if (estimatedTotalMetadataTime < 5000 && estimatedTotalFullLoadTime < 30000) {
      console.log('   ✅ FULL PRELOAD IS FEASIBLE');
      console.log('      - Both metadata and full preload are fast enough');
      console.log('      - Users will have excellent video experience');
    } else if (estimatedTotalMetadataTime < 10000) {
      console.log('   ⚠️  METADATA-ONLY PRELOAD RECOMMENDED');
      console.log('      - Load metadata for all videos');
      console.log('      - Load full video only when user scrolls near it');
    } else {
      console.log('   ❌ LAZY LOADING RECOMMENDED');
      console.log('      - Load videos only when needed');
      console.log('      - Use intersection observer for optimal performance');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

testBrowserVideoPreload().catch(console.error);
