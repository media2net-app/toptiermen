require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testResetPasswordFlow() {
  try {
    console.log('🔍 Testing reset password flow...\n');
    
    // Test 1: Check if reset password API route exists
    console.log('📋 Test 1: Checking reset password API route...');
    const http = require('http');
    
    const testApiRoute = () => {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/auth/forgot-password',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        };
        
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve({ status: res.statusCode, data });
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        req.write(JSON.stringify({ email: 'test@example.com' }));
        req.end();
      });
    };
    
    try {
      const apiResult = await testApiRoute();
      console.log(`✅ API route responds with status: ${apiResult.status}`);
    } catch (error) {
      console.log('⚠️  API route test skipped (server might not be running)');
    }
    
    // Test 2: Check reset password page
    console.log('\n📋 Test 2: Checking reset password page...');
    const testResetPage = () => {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/reset-password',
          method: 'GET'
        };
        
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve({ status: res.statusCode, data });
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        req.end();
      });
    };
    
    try {
      const pageResult = await testResetPage();
      console.log(`✅ Reset password page responds with status: ${pageResult.status}`);
      
      if (pageResult.data.includes('Nieuw Wachtwoord Instellen')) {
        console.log('✅ Reset password page contains correct title');
      } else {
        console.log('⚠️  Reset password page might not be loading correctly');
      }
    } catch (error) {
      console.log('⚠️  Reset page test skipped (server might not be running)');
    }
    
    // Test 3: Check Supabase configuration
    console.log('\n📋 Test 3: Checking Supabase configuration...');
    if (supabaseUrl && supabaseKey) {
      console.log('✅ Supabase URL and Key are configured');
    } else {
      console.log('❌ Supabase configuration missing');
      return;
    }
    
    // Test 4: Check environment variables
    console.log('\n📋 Test 4: Checking environment variables...');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
      console.log(`✅ Site URL configured: ${siteUrl}`);
    } else {
      console.log('⚠️  Site URL not configured, will use localhost:3000');
    }
    
    console.log('\n🎯 Reset Password Flow Summary:');
    console.log('1. User clicks "Wachtwoord vergeten?" on login page');
    console.log('2. User enters email and submits form');
    console.log('3. API sends reset email via Supabase');
    console.log('4. User receives email with reset link');
    console.log('5. User clicks link and goes to /reset-password');
    console.log('6. Page validates tokens from URL parameters');
    console.log('7. User enters new password and submits');
    console.log('8. Password is updated and user is redirected to login');
    
    console.log('\n🔧 Manual Testing Instructions:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Go to http://localhost:3000/login');
    console.log('3. Click "Wachtwoord vergeten?"');
    console.log('4. Enter a valid email address');
    console.log('5. Check email for reset link');
    console.log('6. Click the link and test the reset flow');
    
  } catch (error) {
    console.error('❌ Error testing reset password flow:', error);
  }
}

testResetPasswordFlow();
