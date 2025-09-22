#!/usr/bin/env node

/**
 * Test Live API - Simple HTTP test
 * Tests the live platform.toptiermen.eu API endpoints
 */

const https = require('https');

console.log('🔍 Testing Live API Endpoints');
console.log('=============================');

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    console.log(`\n${description}`);
    console.log(`URL: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log('✅ Success');
          try {
            const json = JSON.parse(data);
            console.log('Response:', JSON.stringify(json, null, 2));
          } catch (e) {
            console.log('Response:', data.substring(0, 200));
          }
        } else {
          console.log('❌ Failed');
          console.log('Response:', data.substring(0, 200));
        }
        resolve(res.statusCode === 200);
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
  const tests = [
    {
      url: 'https://platform.toptiermen.eu/api/test-supabase',
      description: '1. Testing Supabase connection'
    },
    {
      url: 'https://platform.toptiermen.eu/api/test-auth',
      description: '2. Testing authentication endpoint'
    },
    {
      url: 'https://platform.toptiermen.eu/api/system-version',
      description: '3. Testing system version endpoint'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const success = await testEndpoint(test.url, test.description);
    results.push(success);
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  results.forEach((result, index) => {
    console.log(`Test ${index + 1}: ${result ? '✅' : '❌'}`);
  });
  
  const allPassed = results.every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All API tests passed!');
  } else {
    console.log('\n⚠️ Some API tests failed. This could explain the login issues.');
  }
}

main().catch(console.error);
