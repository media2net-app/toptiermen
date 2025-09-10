#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🕛 Midnight Timer Started');
console.log('⏰ Monitoring for midnight to remove 50% discount...');
console.log('📅 Will automatically restore original prices at 00:00');

function checkTime() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();
  
  console.log(`🕐 ${now.toLocaleString()} - Checking time...`);
  
  if (currentHour === 0 && currentMinute === 0 && currentSecond === 0) {
    console.log('🎯 MIDNIGHT DETECTED! Removing discount...');
    
    // Run the discount removal script
    const child = spawn('node', ['remove-discount-at-midnight.js'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      console.log(`✅ Discount removal script completed with code ${code}`);
      console.log('🏁 Timer job completed successfully!');
      process.exit(0);
    });
    
    child.on('error', (error) => {
      console.error('❌ Error running discount removal script:', error);
    });
    
  } else {
    // Calculate time until midnight
    const timeUntilMidnight = (24 - currentHour) * 3600 - currentMinute * 60 - currentSecond;
    const hoursUntil = Math.floor(timeUntilMidnight / 3600);
    const minutesUntil = Math.floor((timeUntilMidnight % 3600) / 60);
    const secondsUntil = timeUntilMidnight % 60;
    
    console.log(`⏰ Next check in ${hoursUntil}h ${minutesUntil}m ${secondsUntil}s`);
  }
}

// Check immediately
checkTime();

// Then check every second
setInterval(checkTime, 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Timer stopped by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Timer stopped');
  process.exit(0);
});
