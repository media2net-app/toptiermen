require('dotenv').config({ path: '.env.local' });

console.log('🔧 TESTING CACHE BUSTING FUNCTIONALITY');
console.log('============================================================');

async function testCacheHeaders() {
  console.log('📋 STEP 1: Testing cache headers');
  console.log('----------------------------------------');
  
  const testUrls = [
    'https://platform.toptiermen.eu/login',
    'https://platform.toptiermen.eu/dashboard',
    'https://platform.toptiermen.eu/api/check-supabase-status',
    'https://platform.toptiermen.eu/voedingsplannen'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`🔄 Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      const cacheControl = response.headers.get('cache-control');
      const pragma = response.headers.get('pragma');
      const expires = response.headers.get('expires');
      const xCacheBust = response.headers.get('x-cache-bust');
      const xTtmVersion = response.headers.get('x-ttm-version');
      
      console.log(`   - Cache-Control: ${cacheControl || 'NOT SET'}`);
      console.log(`   - Pragma: ${pragma || 'NOT SET'}`);
      console.log(`   - Expires: ${expires || 'NOT SET'}`);
      console.log(`   - X-Cache-Bust: ${xCacheBust || 'NOT SET'}`);
      console.log(`   - X-TTM-Version: ${xTtmVersion || 'NOT SET'}`);
      
      // Check if cache headers are properly set
      const hasCacheHeaders = cacheControl && 
        (cacheControl.includes('no-cache') || cacheControl.includes('no-store'));
      
      if (hasCacheHeaders) {
        console.log(`   ✅ Cache headers properly set`);
      } else {
        console.log(`   ❌ Cache headers missing or incorrect`);
      }
      
      console.log('');
      
    } catch (error) {
      console.error(`   ❌ Error testing ${url}:`, error.message);
    }
  }
}

async function testLocalCacheBusting() {
  console.log('📋 STEP 2: Testing local cache busting');
  console.log('----------------------------------------');
  
  try {
    // Test local development server
    const localUrl = 'http://localhost:3000/login';
    console.log(`🔄 Testing local: ${localUrl}`);
    
    const response = await fetch(localUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    const cacheControl = response.headers.get('cache-control');
    const xCacheBust = response.headers.get('x-cache-bust');
    
    console.log(`   - Cache-Control: ${cacheControl || 'NOT SET'}`);
    console.log(`   - X-Cache-Bust: ${xCacheBust || 'NOT SET'}`);
    
    if (cacheControl && cacheControl.includes('no-cache')) {
      console.log(`   ✅ Local cache busting working`);
    } else {
      console.log(`   ❌ Local cache busting not working`);
    }
    
  } catch (error) {
    console.log(`   ⚠️ Local server not running: ${error.message}`);
  }
}

async function testCacheBustingParameters() {
  console.log('📋 STEP 3: Testing cache busting parameters');
  console.log('----------------------------------------');
  
  const testUrls = [
    'https://platform.toptiermen.eu/login?_cb=1234567890&_v=2.0.3',
'https://platform.toptiermen.eu/dashboard?_cb=1234567890&_v=2.0.3',
'https://platform.toptiermen.eu/api/check-supabase-status?_cb=1234567890&_v=2.0.3'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`🔄 Testing with parameters: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        console.log(`   ✅ URL with cache busting parameters works`);
      } else {
        console.log(`   ❌ URL with cache busting parameters failed: ${response.status}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error testing URL with parameters:`, error.message);
    }
  }
}

async function generateCacheBustingReport() {
  console.log('\n📋 CACHE BUSTING REPORT');
  console.log('============================================================');
  
  console.log('🔧 Cache Busting Features Implemented:');
  console.log('');
  console.log('1. **Middleware Cache Headers**:');
  console.log('   - Cache-Control: no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
  console.log('   - Pragma: no-cache');
  console.log('   - Expires: 0');
  console.log('   - Surrogate-Control: no-store');
  console.log('   - X-Cache-Bust: timestamp');
  console.log('   - X-TTM-Version: 2.0.1');
  console.log('');
  console.log('2. **HTML Meta Tags**:');
  console.log('   - Cache-Control meta tag');
  console.log('   - Pragma meta tag');
  console.log('   - Expires meta tag');
  console.log('');
  console.log('3. **CacheBuster Component**:');
  console.log('   - Automatic cache clearing');
  console.log('   - Dynamic meta tag injection');
  console.log('   - Fetch request interception');
  console.log('   - Manual cache busting hook');
  console.log('');
  console.log('4. **Login Page Integration**:');
  console.log('   - Cache busting button');
  console.log('   - Manual cache refresh option');
  console.log('   - User-friendly error recovery');
  console.log('');
  console.log('5. **URL Parameters**:');
  console.log('   - _cb timestamp parameter');
  console.log('   - _v version parameter');
  console.log('   - Automatic URL modification');
  console.log('');
  console.log('💡 Expected Results:');
  console.log('- Browsers will not cache auth-related pages');
  console.log('- Login issues caused by cache will be resolved');
  console.log('- Users can manually clear cache if needed');
  console.log('- All API requests include cache-busting headers');
  console.log('- Static assets are properly cache-controlled');
}

async function main() {
  try {
    console.log('🚀 Starting cache busting tests...\n');
    
    await testCacheHeaders();
    await testLocalCacheBusting();
    await testCacheBustingParameters();
    
    await generateCacheBustingReport();
    
    console.log('\n🎉 Cache busting tests completed!');
    console.log('The cache-busting system should prevent browser caching issues.');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

main();
