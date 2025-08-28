require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 TESTING SUPABASE CONNECTION');
console.log('==============================\n');

console.log('📋 Environment Variables:');
console.log('URL:', supabaseUrl ? '✅ Configured' : '❌ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✅ Configured' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Test basic connection
async function testConnection() {
  try {
    console.log('\n📋 STEP 1: Testing basic connection');
    console.log('----------------------------------------');
    
    // Create client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic health check
    console.log('🔄 Testing connection to Supabase...');
    
    // Try to get auth settings (this should work without authentication)
    const { data: authSettings, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Auth connection failed:', authError.message);
      console.log('🔍 Error details:', authError);
    } else {
      console.log('✅ Auth connection successful');
      console.log('📊 Session data:', authSettings.session ? 'Active session' : 'No session');
    }

    console.log('\n📋 STEP 2: Testing database connection');
    console.log('----------------------------------------');
    
    // Test database connection by trying to query a public table
    try {
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.log('❌ Database connection failed:', testError.message);
        console.log('🔍 Error details:', testError);
      } else {
        console.log('✅ Database connection successful');
        console.log('📊 Query result:', testData);
      }
    } catch (dbError) {
      console.log('❌ Database query error:', dbError.message);
    }

    console.log('\n📋 STEP 3: Testing authentication endpoint');
    console.log('----------------------------------------');
    
    // Test the auth endpoint directly
    const authEndpoint = `${supabaseUrl}/auth/v1/token?grant_type=password`;
    
    console.log('🔄 Testing auth endpoint:', authEndpoint);
    
    const response = await fetch(authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📊 Response body (first 200 chars):', responseText.substring(0, 200));
    
    if (responseText.includes('<!DOCTYPE')) {
      console.log('❌ HTML response received - likely server error or Cloudflare issue');
    } else {
      console.log('✅ JSON response received - auth endpoint working');
    }

    console.log('\n📋 STEP 4: Testing with different client config');
    console.log('----------------------------------------');
    
    // Test with different storage configuration
    const supabase2 = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
    
    const { data: session2, error: error2 } = await supabase2.auth.getSession();
    
    if (error2) {
      console.log('❌ Alternative config failed:', error2.message);
    } else {
      console.log('✅ Alternative config successful');
    }

    console.log('\n📋 DIAGNOSIS SUMMARY');
    console.log('====================');
    console.log('🔍 Based on the tests above:');
    
    if (responseText.includes('<!DOCTYPE')) {
      console.log('❌ ROOT CAUSE: Server returning HTML instead of JSON');
      console.log('💡 This indicates:');
      console.log('   - Cloudflare SSL/connection issues');
      console.log('   - Supabase server problems');
      console.log('   - Network connectivity issues');
      console.log('\n🛠️  SOLUTIONS:');
      console.log('   1. Wait for Supabase/Cloudflare to resolve issues');
      console.log('   2. Check Supabase status page');
      console.log('   3. Try again in a few minutes');
      console.log('   4. Contact Supabase support if persistent');
    } else {
      console.log('✅ Connection appears to be working');
      console.log('💡 Login issues might be:');
      console.log('   - Client-side session conflicts');
      console.log('   - Browser cache issues');
      console.log('   - Environment variable problems');
    }
    
  } catch (error) {
    console.error('❌ Connection test error:', error.message);
    console.log('🔍 Full error:', error);
  }
}

// Run the test
testConnection();
