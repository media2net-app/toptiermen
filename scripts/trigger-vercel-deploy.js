#!/usr/bin/env node

/**
 * Script to trigger a Vercel deployment manually
 * This can be used when automatic deployments are not working
 */

const https = require('https');
const { execSync } = require('child_process');

console.log('🚀 Triggering Vercel deployment...');

// Method 1: Try to trigger via Vercel CLI
try {
  console.log('📦 Attempting to deploy via Vercel CLI...');
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('✅ Deployment triggered successfully via CLI');
} catch (error) {
  console.log('❌ Vercel CLI deployment failed:', error.message);
  
  // Method 2: Try to trigger via git push to trigger webhook
  try {
    console.log('🔄 Attempting to trigger via git push...');
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Git push completed, should trigger webhook');
  } catch (gitError) {
    console.log('❌ Git push failed:', gitError.message);
  }
}

console.log('\n📋 Manual deployment options:');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Find your toptiermen project');
console.log('3. Click "Deploy" button');
console.log('4. Or go to Settings > Git and check webhook status');
console.log('\n🔗 Direct project URL (if exists):');
console.log('https://toptiermen.vercel.app');

console.log('\n⚠️  If automatic deployments are not working:');
console.log('- Check Vercel dashboard for webhook status');
console.log('- Verify GitHub repository permissions');
console.log('- Check environment variables in Vercel dashboard');
console.log('- Ensure vercel.json is properly configured'); 