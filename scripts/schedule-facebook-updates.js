// Facebook Marketing Data Update Scheduler
// Run with: node scripts/schedule-facebook-updates.js

const { exec } = require('child_process');
const path = require('path');

// Update schedule configuration
const UPDATE_CONFIG = {
  interval: 30 * 60 * 1000, // 30 minutes
  scriptPath: path.join(__dirname, 'update-facebook-marketing-data.js'),
  logFile: path.join(__dirname, '..', 'logs', 'facebook-updates.log')
};

// Ensure logs directory exists
const fs = require('fs');
const logsDir = path.dirname(UPDATE_CONFIG.logFile);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(logMessage.trim());
  fs.appendFileSync(UPDATE_CONFIG.logFile, logMessage);
}

// Run Facebook data update
function runFacebookUpdate() {
  log('🔄 Starting scheduled Facebook data update...');
  
  exec(`node "${UPDATE_CONFIG.scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      log(`❌ Error running Facebook update: ${error.message}`);
      return;
    }
    
    if (stderr) {
      log(`⚠️ Facebook update warnings: ${stderr}`);
    }
    
    log(`✅ Facebook data update completed successfully`);
    log(`📊 Output: ${stdout.split('\n').slice(-5).join('\n')}`); // Log last 5 lines
  });
}

// Main scheduler function
function startScheduler() {
  log('🚀 Facebook Marketing Data Update Scheduler Started');
  log(`⏰ Update interval: ${UPDATE_CONFIG.interval / 60000} minutes`);
  log(`📁 Script path: ${UPDATE_CONFIG.scriptPath}`);
  log(`📝 Log file: ${UPDATE_CONFIG.logFile}`);
  
  // Run initial update
  runFacebookUpdate();
  
  // Schedule regular updates
  setInterval(runFacebookUpdate, UPDATE_CONFIG.interval);
  
  // Keep the process running
  process.on('SIGINT', () => {
    log('🛑 Scheduler stopped by user');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('🛑 Scheduler stopped by system');
    process.exit(0);
  });
}

// Start the scheduler
startScheduler();

