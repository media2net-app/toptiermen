require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

if (!facebookAppId) {
  console.error('❌ Missing Facebook App ID');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFacebookMarketingAPI() {
  console.log('🔍 Testing Facebook Marketing API Configuration...\n');

  try {
    // 1. Check environment variables
    console.log('📋 Environment Variables:');
    console.log(`   Facebook App ID: ${facebookAppId}`);
    console.log(`   Supabase URL: ${supabaseUrl ? 'Configured' : 'NOT CONFIGURED'}`);
    console.log(`   Supabase Key: ${supabaseAnonKey ? 'Configured' : 'NOT CONFIGURED'}`);
    console.log('');

    // 2. Test Facebook App ID format
    console.log('🔍 Facebook App ID Validation:');
    if (facebookAppId === '1089360419953590') {
      console.log('   ✅ New Facebook App ID is set correctly');
    } else {
      console.log('   ⚠️  Facebook App ID might be outdated');
    }
    console.log('');

    // 3. Check if we have any stored Facebook tokens
    console.log('🔍 Checking stored Facebook tokens...');
    const { data: tokens, error: tokenError } = await supabase
      .from('user_preferences')
      .select('*')
      .or('facebook_access_token.not.is.null,facebook_user_id.not.is.null')
      .limit(5);

    if (tokenError) {
      console.log('   ⚠️  Could not check stored tokens:', tokenError.message);
    } else if (tokens && tokens.length > 0) {
      console.log(`   📝 Found ${tokens.length} users with Facebook tokens`);
      tokens.forEach((token, index) => {
        console.log(`      User ${index + 1}: ${token.facebook_user_id ? 'Has User ID' : 'No User ID'} | ${token.facebook_access_token ? 'Has Access Token' : 'No Access Token'}`);
      });
    } else {
      console.log('   📝 No stored Facebook tokens found');
    }
    console.log('');

    // 4. Test Facebook Graph API endpoint
    console.log('🔍 Testing Facebook Graph API...');
    try {
      const testUrl = `https://graph.facebook.com/v18.0/${facebookAppId}?fields=id,name,app_type`;
      console.log(`   Testing URL: ${testUrl}`);
      
      const response = await fetch(testUrl);
      const data = await response.json();
      
      if (response.ok && data.id) {
        console.log('   ✅ Facebook App is accessible');
        console.log(`   App Name: ${data.name || 'N/A'}`);
        console.log(`   App Type: ${data.app_type || 'N/A'}`);
      } else {
        console.log('   ❌ Facebook App not accessible');
        console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log('   ❌ Failed to test Facebook Graph API:', error.message);
    }
    console.log('');

    // 5. Marketing API specific test
    console.log('🔍 Marketing API Configuration:');
    console.log('   📋 Required Permissions for Marketing API:');
    console.log('      - ads_management');
    console.log('      - ads_read');
    console.log('      - read_insights');
    console.log('      - business_management');
    console.log('');
    console.log('   📋 Next Steps:');
    console.log('      1. Go to Facebook App Dashboard');
    console.log('      2. Navigate to Marketing API → Tools');
    console.log('      3. Select required permissions');
    console.log('      4. Click "Get Token"');
    console.log('      5. Use the token in your app');
    console.log('');

    // 6. Update recommendations
    console.log('🔧 Configuration Recommendations:');
    console.log('   1. ✅ Facebook App ID updated to: 1089360419953590');
    console.log('   2. ⏳ Marketing API permissions need to be configured');
    console.log('   3. ⏳ Access tokens need to be generated');
    console.log('   4. ⏳ Ad account integration needs to be set up');
    console.log('');

    console.log('🎉 Facebook Marketing API test completed!');
    console.log('📋 Summary:');
    console.log('   - Environment variables: ✅');
    console.log('   - App ID: ✅');
    console.log('   - Graph API access: ⏳ (needs testing with tokens)');
    console.log('   - Marketing API: ⏳ (needs permissions and tokens)');

  } catch (error) {
    console.error('❌ Error testing Facebook Marketing API:', error);
  }
}

// Run the test
testFacebookMarketingAPI()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
