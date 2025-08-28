require('dotenv').config({ path: '.env.local' });

console.log('🔍 CHECKING SUPABASE STATUS');
console.log('===========================\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

async function checkSupabaseStatus() {
  try {
    console.log('📋 STEP 1: Checking Supabase project status');
    console.log('-------------------------------------------');
    
    // Check if we can reach the Supabase project
    const response = await fetch(supabaseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 520) {
      console.log('❌ SUPABASE SERVER ERROR 520');
      console.log('💡 This indicates a Cloudflare/Supabase server issue');
      console.log('\n🛠️  SOLUTIONS:');
      console.log('   1. Wait for Supabase to resolve the issue');
      console.log('   2. Check Supabase status page: https://status.supabase.com');
      console.log('   3. Try again in a few minutes');
      console.log('   4. Contact Supabase support if persistent');
      
      console.log('\n📋 STEP 2: Alternative testing');
      console.log('-----------------------------');
      
      // Test with a different endpoint
      const healthEndpoint = `${supabaseUrl}/rest/v1/`;
      console.log('🔄 Testing health endpoint:', healthEndpoint);
      
      try {
        const healthResponse = await fetch(healthEndpoint, {
          method: 'GET',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          }
        });
        
        console.log('📊 Health response status:', healthResponse.status);
        
        if (healthResponse.status === 200) {
          console.log('✅ Health endpoint working - auth endpoint specific issue');
        } else {
          console.log('❌ Health endpoint also failing - general Supabase issue');
        }
      } catch (healthError) {
        console.log('❌ Health endpoint error:', healthError.message);
      }
      
      console.log('\n📋 STEP 3: Environment check');
      console.log('---------------------------');
      
      console.log('🔧 Environment variables:');
      console.log('URL:', supabaseUrl ? '✅ Configured' : '❌ Missing');
      console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing');
      console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configured' : '❌ Missing');
      
      console.log('\n📋 STEP 4: Recommendations');
      console.log('--------------------------');
      
      console.log('🎯 IMMEDIATE ACTIONS:');
      console.log('   1. Check Supabase status: https://status.supabase.com');
      console.log('   2. Wait 5-10 minutes and try again');
      console.log('   3. If issue persists, contact Supabase support');
      
      console.log('\n🎯 DEVELOPMENT WORKAROUNDS:');
      console.log('   1. Use local development with mock data');
      console.log('   2. Test UI components without authentication');
      console.log('   3. Work on other features while waiting');
      
      console.log('\n🎯 PRODUCTION IMPACT:');
      console.log('   - Live site will be affected by this issue');
      console.log('   - Users cannot login until Supabase is restored');
      console.log('   - Consider showing maintenance message');
      
      return false;
    } else if (response.status === 200) {
      console.log('✅ Supabase project accessible');
      return true;
    } else {
      console.log('⚠️  Unexpected status:', response.status);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Status check error:', error.message);
    console.log('🔍 Full error:', error);
    return false;
  }
}

// Run the check
checkSupabaseStatus();
