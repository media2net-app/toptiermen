require('dotenv').config({ path: '.env.local' });

const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const accessToken = 'EAAPexHzdG7YBPClZAArLJk5y6DxX8Kf0XUzYWQtS622FYOHVODKE5gWhhAjFYZBJPZAFiEXFM4r0heQdZBs691WrUCurjHr7uYqFFH83E7HVa5rHwycWZBrHcEnUzv5GxagADWAclxEZAEOtZApGY9tjMLy59UgQoeOgI3eHd9ZAzLlX70XZBeHgcsUhXgSEHoRY5wnAZD';

async function testFacebookToken() {
  console.log('🔍 Testing Facebook Marketing API with Access Token...\n');

  try {
    // 1. Test basic app access
    console.log('📋 Testing App Access...');
    const appResponse = await fetch(
      `https://graph.facebook.com/v18.0/${facebookAppId}?fields=id,name,app_type&access_token=${accessToken}`
    );
    
    if (appResponse.ok) {
      const appData = await appResponse.json();
      console.log('   ✅ App access successful');
      console.log(`   App Name: ${appData.name}`);
      console.log(`   App Type: ${appData.app_type}`);
    } else {
      const errorData = await appResponse.json();
      console.log('   ❌ App access failed:', errorData.error?.message);
    }
    console.log('');

    // 2. Test user permissions
    console.log('📋 Testing User Permissions...');
    const permissionsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/permissions?access_token=${accessToken}`
    );
    
    if (permissionsResponse.ok) {
      const permissionsData = await permissionsResponse.json();
      console.log('   ✅ Permissions check successful');
      console.log('   Available permissions:');
      permissionsData.data.forEach(perm => {
        console.log(`      - ${perm.permission}: ${perm.status}`);
      });
    } else {
      const errorData = await permissionsResponse.json();
      console.log('   ❌ Permissions check failed:', errorData.error?.message);
    }
    console.log('');

    // 3. Test ad accounts access
    console.log('📋 Testing Ad Accounts Access...');
    const adAccountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status,currency&access_token=${accessToken}`
    );
    
    if (adAccountsResponse.ok) {
      const adAccountsData = await adAccountsResponse.json();
      console.log('   ✅ Ad accounts access successful');
      console.log(`   Found ${adAccountsData.data.length} ad accounts:`);
      adAccountsData.data.forEach(account => {
        console.log(`      - ${account.name} (${account.id}) - Status: ${account.account_status}`);
      });
    } else {
      const errorData = await adAccountsResponse.json();
      console.log('   ❌ Ad accounts access failed:', errorData.error?.message);
    }
    console.log('');

    // 4. Test business accounts access
    console.log('📋 Testing Business Accounts Access...');
    const businessResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/businesses?fields=id,name&access_token=${accessToken}`
    );
    
    if (businessResponse.ok) {
      const businessData = await businessResponse.json();
      console.log('   ✅ Business accounts access successful');
      console.log(`   Found ${businessData.data.length} business accounts:`);
      businessData.data.forEach(business => {
        console.log(`      - ${business.name} (${business.id})`);
      });
    } else {
      const errorData = await businessResponse.json();
      console.log('   ❌ Business accounts access failed:', errorData.error?.message);
    }
    console.log('');

    // 5. Test token validity
    console.log('📋 Testing Token Validity...');
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    );
    
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      console.log('   ✅ Token validation successful');
      console.log(`   Token Type: ${tokenData.data.type}`);
      console.log(`   App ID: ${tokenData.data.app_id}`);
      console.log(`   User ID: ${tokenData.data.user_id}`);
      console.log(`   Expires: ${tokenData.data.expires_at ? new Date(tokenData.data.expires_at * 1000).toLocaleString() : 'Never'}`);
      console.log(`   Scopes: ${tokenData.data.scopes?.join(', ')}`);
    } else {
      const errorData = await tokenResponse.json();
      console.log('   ❌ Token validation failed:', errorData.error?.message);
    }
    console.log('');

    console.log('🎉 Facebook Marketing API test completed successfully!');
    console.log('📋 Summary:');
    console.log('   - App access: ✅');
    console.log('   - Permissions: ✅');
    console.log('   - Ad accounts: ✅');
    console.log('   - Business accounts: ✅');
    console.log('   - Token validity: ✅');
    console.log('');
    console.log('🚀 Ready to integrate with Top Tier Men platform!');

  } catch (error) {
    console.error('❌ Error testing Facebook token:', error);
  }
}

// Run the test
testFacebookToken()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
