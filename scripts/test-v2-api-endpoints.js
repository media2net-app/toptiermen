// V2.0 API Endpoints Test Script
// Run with: node scripts/test-v2-api-endpoints.js

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v2`;

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  verbose: true
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'V2.0-API-Test/1.0',
        ...options.headers
      },
      timeout: TEST_CONFIG.timeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            raw: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            raw: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// Test function with retry logic
async function testEndpoint(name, url, options = {}) {
  for (let attempt = 1; attempt <= TEST_CONFIG.retries; attempt++) {
    try {
      if (TEST_CONFIG.verbose) {
        console.log(`🧪 Testing ${name} (attempt ${attempt}/${TEST_CONFIG.retries})...`);
      }

      const response = await makeRequest(url, options);
      
      const success = response.status >= 200 && response.status < 300;
      const result = {
        name,
        url,
        status: response.status,
        success,
        data: response.data,
        timestamp: new Date().toISOString()
      };

      if (success) {
        testResults.passed++;
        if (TEST_CONFIG.verbose) {
          console.log(`✅ ${name} - PASSED (${response.status})`);
        }
      } else {
        testResults.failed++;
        if (TEST_CONFIG.verbose) {
          console.log(`❌ ${name} - FAILED (${response.status})`);
        }
      }

      testResults.details.push(result);
      return result;

    } catch (error) {
      if (attempt === TEST_CONFIG.retries) {
        testResults.failed++;
        testResults.errors.push({
          name,
          url,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        if (TEST_CONFIG.verbose) {
          console.log(`💥 ${name} - ERROR: ${error.message}`);
        }
        return { name, url, error: error.message, success: false };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// V2.0 API Endpoints to test
const V2_API_ENDPOINTS = [
  // Dashboard API
  {
    name: 'Dashboard GET',
    url: `${API_BASE}/dashboard`,
    method: 'GET'
  },
  {
    name: 'Dashboard POST',
    url: `${API_BASE}/dashboard`,
    method: 'POST',
    body: { action: 'test', data: { test: true } }
  },
  {
    name: 'Dashboard PUT',
    url: `${API_BASE}/dashboard`,
    method: 'PUT',
    body: { action: 'update', data: { test: true } }
  },
  {
    name: 'Dashboard DELETE',
    url: `${API_BASE}/dashboard`,
    method: 'DELETE'
  },

  // Users API
  {
    name: 'Users GET',
    url: `${API_BASE}/users`,
    method: 'GET'
  },
  {
    name: 'Users POST',
    url: `${API_BASE}/users`,
    method: 'POST',
    body: { 
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'user'
    }
  },
  {
    name: 'Users PUT',
    url: `${API_BASE}/users`,
    method: 'PUT',
    body: { 
      id: 'test-id',
      updates: { full_name: 'Updated Test User' }
    }
  },
  {
    name: 'Users DELETE',
    url: `${API_BASE}/users`,
    method: 'DELETE',
    body: { id: 'test-id' }
  },

  // Health check endpoints
  {
    name: 'Health Check',
    url: `${BASE_URL}/api/health`,
    method: 'GET'
  },
  {
    name: 'V2 Health Check',
    url: `${API_BASE}/health`,
    method: 'GET'
  }
];

// Main test execution
async function runTests() {
  console.log('🚀 Starting V2.0 API Endpoints Test Suite...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📍 API Base: ${API_BASE}`);
  console.log(`⏱️  Timeout: ${TEST_CONFIG.timeout}ms`);
  console.log(`🔄 Retries: ${TEST_CONFIG.retries}`);
  console.log('');

  const startTime = Date.now();

  // Test each endpoint
  for (const endpoint of V2_API_ENDPOINTS) {
    await testEndpoint(endpoint.name, endpoint.url, {
      method: endpoint.method,
      body: endpoint.body
    });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Generate test report
  console.log('');
  console.log('📊 V2.0 API Test Results:');
  console.log('========================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`💥 Errors: ${testResults.errors.length}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('');
    console.log('🚨 Errors:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error.name}: ${error.error}`);
    });
  }

  if (testResults.details.length > 0) {
    console.log('');
    console.log('📋 Detailed Results:');
    testResults.details.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.name}: ${result.status}`);
    });
  }

  // Save detailed results to file
  const fs = require('fs');
  const reportPath = 'v2-api-test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    config: TEST_CONFIG,
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      errors: testResults.errors.length,
      duration,
      successRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)
    },
    details: testResults.details,
    errors: testResults.errors
  }, null, 2));

  console.log('');
  console.log(`📄 Detailed report saved to: ${reportPath}`);

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
