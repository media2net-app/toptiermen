require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugVideoPreloadPerformance() {
  console.log('🎬 DEBUG VIDEO PRELOAD PERFORMANCE');
  console.log('==================================');
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

    // Test video loading performance
    const results = [];
    const startTime = performance.now();

    console.log('🚀 Starting video preload performance test...');
    console.log('');

    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      const videoStartTime = performance.now();
      
      console.log(`📹 [${i + 1}/${exercises.length}] Testing: ${exercise.name}`);
      
      try {
        // Test video URL accessibility
        const response = await fetch(exercise.video_url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        const videoLoadTime = performance.now() - videoStartTime;
        const status = response.ok ? '✅ SUCCESS' : '❌ FAILED';
        
        results.push({
          id: exercise.id,
          name: exercise.name,
          url: exercise.video_url,
          loadTime: videoLoadTime,
          status: response.ok ? 'success' : 'failed',
          statusCode: response.status,
          size: response.headers.get('content-length') || 'unknown'
        });
        
        console.log(`   ${status} - ${videoLoadTime.toFixed(2)}ms - Status: ${response.status}`);
        
      } catch (error) {
        const videoLoadTime = performance.now() - videoStartTime;
        results.push({
          id: exercise.id,
          name: exercise.name,
          url: exercise.video_url,
          loadTime: videoLoadTime,
          status: 'error',
          error: error.message
        });
        
        console.log(`   ❌ ERROR - ${videoLoadTime.toFixed(2)}ms - ${error.message}`);
      }
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const totalTime = performance.now() - startTime;
    
    console.log('');
    console.log('📊 PERFORMANCE RESULTS');
    console.log('======================');
    console.log('');
    
    // Calculate statistics
    const successfulResults = results.filter(r => r.status === 'success');
    const failedResults = results.filter(r => r.status === 'failed');
    const errorResults = results.filter(r => r.status === 'error');
    
    const loadTimes = successfulResults.map(r => r.loadTime);
    const avgLoadTime = loadTimes.length > 0 ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0;
    const minLoadTime = loadTimes.length > 0 ? Math.min(...loadTimes) : 0;
    const maxLoadTime = loadTimes.length > 0 ? Math.max(...loadTimes) : 0;
    
    console.log(`⏱️  Total Test Time: ${totalTime.toFixed(2)}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log(`📹 Total Videos: ${results.length}`);
    console.log(`✅ Successful: ${successfulResults.length}`);
    console.log(`❌ Failed: ${failedResults.length}`);
    console.log(`🚫 Errors: ${errorResults.length}`);
    console.log('');
    
    console.log('📈 LOAD TIME STATISTICS (Successful Only):');
    console.log(`   Average: ${avgLoadTime.toFixed(2)}ms`);
    console.log(`   Minimum: ${minLoadTime.toFixed(2)}ms`);
    console.log(`   Maximum: ${maxLoadTime.toFixed(2)}ms`);
    console.log('');
    
    // Calculate estimated total load time for all videos
    const estimatedTotalLoadTime = avgLoadTime * results.length;
    console.log('🎯 ESTIMATED PERFORMANCE:');
    console.log(`   Estimated total load time: ${estimatedTotalLoadTime.toFixed(2)}ms (${(estimatedTotalLoadTime / 1000).toFixed(2)}s)`);
    console.log(`   Estimated load time per video: ${avgLoadTime.toFixed(2)}ms`);
    console.log('');
    
    // Performance recommendations
    console.log('💡 PERFORMANCE RECOMMENDATIONS:');
    if (avgLoadTime > 2000) {
      console.log('   ⚠️  Average load time is high (>2s) - Consider CDN optimization');
    } else if (avgLoadTime > 1000) {
      console.log('   ⚠️  Average load time is moderate (>1s) - Consider lazy loading');
    } else {
      console.log('   ✅ Average load time is good (<1s) - Preload should be feasible');
    }
    
    if (estimatedTotalLoadTime > 30000) {
      console.log('   ⚠️  Total load time would be very high (>30s) - Not recommended for preload');
    } else if (estimatedTotalLoadTime > 15000) {
      console.log('   ⚠️  Total load time would be high (>15s) - Consider progressive loading');
    } else {
      console.log('   ✅ Total load time is reasonable - Preload should work well');
    }
    console.log('');
    
    // Show failed videos
    if (failedResults.length > 0 || errorResults.length > 0) {
      console.log('❌ FAILED VIDEOS:');
      console.log('================');
      [...failedResults, ...errorResults].forEach(result => {
        console.log(`   ${result.name}: ${result.status} - ${result.error || `Status ${result.statusCode}`}`);
      });
      console.log('');
    }
    
    // Show slowest videos
    if (successfulResults.length > 0) {
      console.log('🐌 SLOWEST VIDEOS (>2s):');
      console.log('========================');
      const slowVideos = successfulResults.filter(r => r.loadTime > 2000);
      slowVideos.sort((a, b) => b.loadTime - a.loadTime);
      slowVideos.slice(0, 5).forEach(result => {
        console.log(`   ${result.name}: ${result.loadTime.toFixed(2)}ms`);
      });
      console.log('');
    }
    
    console.log('🎬 CONCLUSION:');
    if (estimatedTotalLoadTime < 10000) {
      console.log('   ✅ Preload is FEASIBLE - Total time under 10 seconds');
    } else if (estimatedTotalLoadTime < 20000) {
      console.log('   ⚠️  Preload is MODERATE - Consider progressive loading');
    } else {
      console.log('   ❌ Preload is NOT RECOMMENDED - Total time too high');
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

debugVideoPreloadPerformance().catch(console.error);
