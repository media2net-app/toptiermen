// Dashboard Navigation Fix Script
// Run with: node scripts/fix-dashboard-navigation.js

const https = require('https');
const http = require('http');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUser: 'test-user-123',
  testPages: [
    '/dashboard',
    '/dashboard/mijn-profiel',
    '/dashboard/inbox',
    '/dashboard/mijn-missies',
    '/dashboard/challenges',
    '/dashboard/mijn-trainingen',
    '/dashboard/voedingsplannen',
    '/dashboard/finance-en-business',
    '/dashboard/academy',
    '/dashboard/trainingscentrum',
    '/dashboard/mind-en-focus',
    '/dashboard/brotherhood',
    '/dashboard/boekenkamer',
    '/dashboard/badges-en-rangen',
    '/dashboard/producten',
    '/dashboard/mentorship-en-coaching'
  ]
};

// Test results
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    }).on('error', reject);
  });
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('🔍 Testing API endpoints...\n');
  
  const apiTests = [
    {
      name: 'Onboarding API',
      url: `${TEST_CONFIG.baseUrl}/api/onboarding?userId=${TEST_CONFIG.testUser}`,
      expectedStatus: 200
    },
    {
      name: 'System Version API',
      url: `${TEST_CONFIG.baseUrl}/api/system-version`,
      expectedStatus: 200
    }
  ];
  
  for (const test of apiTests) {
    try {
      const response = await makeRequest(test.url);
      const success = response.status === test.expectedStatus;
      
      console.log(`${success ? '✅' : '❌'} ${test.name}: ${response.status}`);
      
      if (success) {
        testResults.passed++;
      } else {
        testResults.failed++;
        testResults.errors.push(`${test.name}: Expected ${test.expectedStatus}, got ${response.status}`);
      }
      
      testResults.total++;
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`);
      testResults.failed++;
      testResults.errors.push(`${test.name}: ${error.message}`);
      testResults.total++;
    }
  }
}

// Test page navigation
async function testPageNavigation() {
  console.log('\n🔍 Testing page navigation...\n');
  
  for (const page of TEST_CONFIG.testPages) {
    try {
      const response = await makeRequest(`${TEST_CONFIG.baseUrl}${page}`);
      const success = response.status === 200;
      const hasContent = response.data.includes('Top Tier Men');
      
      console.log(`${success && hasContent ? '✅' : '❌'} ${page}: ${response.status} ${hasContent ? '(has content)' : '(no content)'}`);
      
      if (success && hasContent) {
        testResults.passed++;
      } else {
        testResults.failed++;
        testResults.errors.push(`${page}: Status ${response.status}, Content: ${hasContent ? 'Yes' : 'No'}`);
      }
      
      testResults.total++;
    } catch (error) {
      console.log(`❌ ${page}: Error - ${error.message}`);
      testResults.failed++;
      testResults.errors.push(`${page}: ${error.message}`);
      testResults.total++;
    }
  }
}

// Generate fix recommendations
function generateFixRecommendations() {
  console.log('\n🔧 Fix Recommendations:\n');
  
  if (testResults.failed === 0) {
    console.log('✅ All tests passed! Dashboard navigation is working correctly.');
    return;
  }
  
  console.log('❌ Issues detected. Here are the recommended fixes:\n');
  
  // Check for common issues
  const hasApiErrors = testResults.errors.some(error => error.includes('API'));
  const hasPageErrors = testResults.errors.some(error => error.includes('/dashboard/'));
  
  if (hasApiErrors) {
    console.log('1. API Issues:');
    console.log('   - Check database connectivity');
    console.log('   - Verify environment variables');
    console.log('   - Ensure API routes are properly configured');
    console.log('');
  }
  
  if (hasPageErrors) {
    console.log('2. Page Navigation Issues:');
    console.log('   - Check if all dashboard pages exist');
    console.log('   - Verify routing configuration');
    console.log('   - Ensure components are properly exported');
    console.log('');
  }
  
  console.log('3. General Fixes:');
  console.log('   - Restart the development server');
  console.log('   - Clear browser cache');
  console.log('   - Check browser console for JavaScript errors');
  console.log('   - Verify authentication is working');
  console.log('');
}

// Main test function
async function runTests() {
  console.log('🚀 Dashboard Navigation Test Suite\n');
  console.log('=' .repeat(50));
  
  await testAPIEndpoints();
  await testPageNavigation();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results:');
  console.log(`Total: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors:');
    testResults.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  generateFixRecommendations();
  
  console.log('\n🎯 Next Steps:');
  if (testResults.failed > 0) {
    console.log('1. Fix the issues identified above');
    console.log('2. Run this test again to verify fixes');
    console.log('3. Test manually in the browser');
  } else {
    console.log('1. Test manually in the browser');
    console.log('2. Verify all navigation links work');
    console.log('3. Check for any UI/UX issues');
  }
}

// Run the tests
runTests().catch(console.error);

