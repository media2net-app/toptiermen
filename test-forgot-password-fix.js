const http = require('http');

async function testForgotPassword() {
  try {
    console.log('🔐 Testing forgot password fix...\n');

    // Test with the problematic email
    const testEmail = 'chielvanderzee@gmail.com';
    
    console.log(`📧 Testing password reset for: ${testEmail}`);
    
    const response = await makeRequest('/api/auth/forgot-password', 'POST', {
      email: testEmail
    });
    
    console.log('📋 Response:', response);
    
    if (response.includes('success') && response.includes('true')) {
      console.log('✅ Password reset successful!');
    } else if (response.includes('error')) {
      console.log('❌ Password reset failed:', response);
    } else {
      console.log('⚠️ Unexpected response:', response);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve(body);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

testForgotPassword();
