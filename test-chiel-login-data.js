#!/usr/bin/env node

/**
 * Test Chiel Login Data API
 * Tests the specific login-data endpoint for chiel@media2net.nl
 */

const https = require('https');

console.log('🔍 Testing Chiel Login Data API');
console.log('===============================');

async function testLoginDataAPI() {
  return new Promise((resolve) => {
    // First, we need to get Chiel's user ID
    const userId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'; // From the credentials file
    
    const url = `https://platform.toptiermen.eu/api/auth/login-data?userId=${userId}`;
    
    console.log(`Testing login-data API for Chiel...`);
    console.log(`URL: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ Login-data API successful');
          try {
            const json = JSON.parse(data);
            console.log('Response data:');
            console.log('  Success:', json.success);
            if (json.data && json.data.profile) {
              console.log('  Profile email:', json.data.profile.email);
              console.log('  Profile role:', json.data.profile.role);
              console.log('  Profile name:', json.data.profile.full_name);
            }
            if (json.data && json.data.onboarding) {
              console.log('  Onboarding completed:', json.data.onboarding.isCompleted);
              console.log('  Current step:', json.data.onboarding.currentStep);
            }
            resolve(true);
          } catch (e) {
            console.log('❌ Failed to parse JSON response');
            console.log('Raw response:', data.substring(0, 500));
            resolve(false);
          }
        } else {
          console.log('❌ Login-data API failed');
          console.log('Response:', data.substring(0, 500));
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Error:', err.message);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Timeout');
      req.destroy();
      resolve(false);
    });
  });
}

async function testAdminLoginFlow() {
  return new Promise((resolve) => {
    console.log('\nTesting admin login flow simulation...');
    
    // Test the admin dashboard endpoint
    const url = 'https://platform.toptiermen.eu/api/admin/dashboard-stats';
    
    console.log(`URL: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ Admin dashboard API accessible');
          resolve(true);
        } else if (res.statusCode === 401 || res.statusCode === 403) {
          console.log('✅ Admin dashboard API properly protected (expected)');
          resolve(true);
        } else {
          console.log('❌ Admin dashboard API failed');
          console.log('Response:', data.substring(0, 200));
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Error:', err.message);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Timeout');
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('🚀 Starting Chiel login data tests...\n');
  
  const results = {
    loginDataAPI: await testLoginDataAPI(),
    adminFlow: await testAdminLoginFlow()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log('Login Data API:', results.loginDataAPI ? '✅' : '❌');
  console.log('Admin Flow:', results.adminFlow ? '✅' : '❌');
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! The login-data API is working correctly.');
    console.log('The login hanging issue might be in the frontend loading sequence.');
  } else {
    console.log('\n⚠️ Some tests failed. This explains the login hanging issue.');
    
    if (!results.loginDataAPI) {
      console.log('🔧 Fix: Check the login-data API endpoint implementation');
    }
    if (!results.adminFlow) {
      console.log('🔧 Fix: Check admin authentication flow');
    }
  }
  
  console.log('\n💡 Next steps:');
  console.log('1. Check browser console for JavaScript errors during login');
  console.log('2. Verify the loading sequence is not getting stuck');
  console.log('3. Check if the redirect logic is working properly');
}

main().catch(console.error);
