const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 V2.0: Force Clearing All Caches...\n');

// Kill any running processes on port 3000
try {
  execSync('kill $(lsof -t -i:3000) 2>/dev/null || true', { stdio: 'inherit' });
  console.log('✅ Killed processes on port 3000');
} catch (error) {
  console.log('ℹ️  No processes found on port 3000');
}

// Remove Next.js cache
try {
  execSync('rm -rf .next', { stdio: 'inherit' });
  console.log('✅ Removed .next cache');
} catch (error) {
  console.log('ℹ️  .next cache already removed');
}

// Remove node_modules cache
try {
  execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
  console.log('✅ Removed node_modules cache');
} catch (error) {
  console.log('ℹ️  node_modules cache already removed');
}

// Remove any service worker files
try {
  execSync('rm -rf public/sw.js', { stdio: 'inherit' });
  console.log('✅ Removed service worker');
} catch (error) {
  console.log('ℹ️  No service worker found');
}

// Clear npm cache
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cleared npm cache');
} catch (error) {
  console.log('❌ Failed to clear npm cache');
}

console.log('\n🚀 Starting development server...\n');

// Start development server
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.log('❌ Failed to start development server');
}
