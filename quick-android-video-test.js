// Quick Android Video Test Script
// Plak dit in Chrome DevTools console op Android device bij een academy video

(function() {
  console.log('🤖 Starting Android Video Test...\n');
  
  const video = document.querySelector('video');
  if (!video) {
    console.error('❌ No video element found!');
    return;
  }
  
  // Check Android optimizations
  console.log('📱 Android Optimizations:');
  console.log('  preload:', video.preload, video.preload === 'none' ? '✅' : '⚠️');
  console.log('  x5-video-player-type:', video.getAttribute('x5-video-player-type') || 'not set', video.hasAttribute('x5-video-player-type') ? '✅' : '⚠️');
  console.log('  playsInline:', video.playsInline ? '✅' : '❌');
  console.log('');
  
  // Check if playing
  console.log('▶️ Playback Status:');
  console.log('  paused:', video.paused);
  console.log('  currentTime:', video.currentTime.toFixed(2) + 's');
  console.log('  duration:', video.duration.toFixed(2) + 's');
  console.log('');
  
  // Check buffer
  if (video.buffered.length > 0) {
    const buffered = video.buffered.end(0) - video.currentTime;
    console.log('💾 Buffer Status:');
    console.log('  buffered ahead:', buffered.toFixed(2) + 's', buffered < 5 ? '⚠️' : '✅');
    console.log('');
  }
  
  // Monitor for frozen frames
  console.log('👁️ Starting Freeze Monitor (30 seconds)...');
  let lastTime = video.currentTime;
  let frozenCount = 0;
  
  const monitor = setInterval(() => {
    if (video.paused) {
      console.log('⏸️ Video is paused, stopping monitor');
      clearInterval(monitor);
      return;
    }
    
    const currentTime = video.currentTime;
    const timeDiff = currentTime - lastTime;
    
    if (timeDiff < 0.01) {
      frozenCount++;
      console.warn(`🥶 Potential freeze detected! (count: ${frozenCount})`);
      console.log('  Last time:', lastTime.toFixed(2) + 's');
      console.log('  Current time:', currentTime.toFixed(2) + 's');
      console.log('  Diff:', timeDiff.toFixed(3) + 's');
      
      if (frozenCount >= 3) {
        console.error('❌ VIDEO IS FROZEN! Watchdog should kick in...');
      }
    } else {
      if (frozenCount > 0) {
        console.log(`✅ Video recovered after ${frozenCount} frozen checks`);
        frozenCount = 0;
      }
    }
    
    lastTime = currentTime;
  }, 2000);
  
  // Auto-stop after 30 seconds
  setTimeout(() => {
    clearInterval(monitor);
    console.log('\n✅ Monitor completed!');
    console.log('Summary:');
    console.log('  Frozen detections:', frozenCount);
    console.log('  Final status:', video.paused ? 'PAUSED' : 'PLAYING');
    console.log('  Final time:', video.currentTime.toFixed(2) + 's');
  }, 30000);
  
  console.log('Monitor will run for 30 seconds...\n');
})();

