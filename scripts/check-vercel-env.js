require('dotenv').config({ path: '.env.local' });

console.log('🔍 CHECKING VERCEL ENVIRONMENT VARIABLES');
console.log('============================================================');

async function checkVercelEnv() {
  try {
    console.log('📋 Local Environment Variables:');
    console.log('----------------------------------------');
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'FACEBOOK_ACCESS_TOKEN',
      'FACEBOOK_AD_ACCOUNT_ID'
    ];
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${varName.includes('TOKEN') || varName.includes('KEY') ? '***CONFIGURED***' : value}`);
      } else {
        console.log(`❌ ${varName}: MISSING`);
      }
    });
    
    console.log('\n📋 Testing Vercel Environment:');
    console.log('----------------------------------------');
    
    // Test if we can access the API from the live site
    console.log('🔍 Testing live site API access...');
    
    const response = await fetch('https://platform.toptiermen.eu/api/test-env');
    const data = await response.json();
    
    console.log('📊 Live site environment check:', data);
    
    console.log('\n📋 Vercel Environment Variables Status:');
    console.log('----------------------------------------');
    
    if (data.facebook_token) {
      console.log('✅ Facebook Access Token: CONFIGURED on Vercel');
    } else {
      console.log('❌ Facebook Access Token: MISSING on Vercel');
    }
    
    if (data.facebook_ad_account) {
      console.log('✅ Facebook Ad Account ID: CONFIGURED on Vercel');
    } else {
      console.log('❌ Facebook Ad Account ID: MISSING on Vercel');
    }
    
    if (data.supabase_url) {
      console.log('✅ Supabase URL: CONFIGURED on Vercel');
    } else {
      console.log('❌ Supabase URL: MISSING on Vercel');
    }
    
    if (data.supabase_service_key) {
      console.log('✅ Supabase Service Key: CONFIGURED on Vercel');
    } else {
      console.log('❌ Supabase Service Key: MISSING on Vercel');
    }
    
    console.log('\n📋 Solution:');
    console.log('----------------------------------------');
    
    if (!data.facebook_token || !data.facebook_ad_account) {
      console.log('🔧 FACEBOOK VARIABLES MISSING ON VERCEL:');
      console.log('');
      console.log('1. Go to Vercel Dashboard');
      console.log('2. Select your project: toptiermen-final');
      console.log('3. Go to Settings > Environment Variables');
      console.log('4. Add the following variables:');
      console.log('');
      console.log('   FACEBOOK_ACCESS_TOKEN = [your token]');
      console.log('   FACEBOOK_AD_ACCOUNT_ID = act_1465834431278978');
      console.log('');
      console.log('5. Redeploy the project');
      console.log('');
    } else {
      console.log('✅ All environment variables are configured correctly');
      console.log('✅ Facebook auto-refresh should work on live site');
    }
    
  } catch (error) {
    console.error('❌ Error checking environment:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting Vercel environment check...');
    console.log('');
    
    await checkVercelEnv();
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

main();
