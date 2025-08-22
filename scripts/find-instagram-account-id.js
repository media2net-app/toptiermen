require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ Missing FACEBOOK_ACCESS_TOKEN environment variable');
  process.exit(1);
}

async function findInstagramAccountId() {
  console.log('🔍 Finding Instagram Account ID...\n');

  try {
    // Method 1: Get Instagram accounts from Facebook page
    console.log('📊 Method 1: Getting Instagram accounts from Facebook page...');
    const pageResponse = await fetch(
      `https://graph.facebook.com/v19.0/610571295471584?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=instagram_business_account`
    );

    if (pageResponse.ok) {
      const pageData = await pageResponse.json();
      console.log('✅ Facebook page data:');
      console.log(`   📊 Page ID: ${pageData.id}`);
      console.log(`   📊 Instagram Business Account: ${pageData.instagram_business_account || 'N/A'}`);
      
      if (pageData.instagram_business_account) {
        console.log(`✅ Found Instagram Business Account ID: ${pageData.instagram_business_account}`);
      }
    } else {
      const errorData = await pageResponse.json();
      console.error('❌ Error getting page data:', errorData);
    }

    console.log('\n📊 Method 2: Getting Instagram accounts from user...');
    const userResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=instagram_business_account`
    );

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User accounts data:');
      userData.data.forEach(account => {
        console.log(`   📊 Account: ${account.name} (${account.id})`);
        console.log(`   📊 Instagram Business Account: ${account.instagram_business_account || 'N/A'}`);
      });
    } else {
      const errorData = await userResponse.json();
      console.error('❌ Error getting user accounts:', errorData);
    }

    console.log('\n📊 Method 3: Getting Instagram accounts directly...');
    const instagramResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/instagram_accounts?access_token=${FACEBOOK_ACCESS_TOKEN}`
    );

    if (instagramResponse.ok) {
      const instagramData = await instagramResponse.json();
      console.log('✅ Instagram accounts data:');
      if (instagramData.data && instagramData.data.length > 0) {
        instagramData.data.forEach(account => {
          console.log(`   📊 Instagram Account: ${account.name} (${account.id})`);
          console.log(`   📊 Username: ${account.username || 'N/A'}`);
        });
      } else {
        console.log('   📊 No Instagram accounts found');
      }
    } else {
      const errorData = await instagramResponse.json();
      console.error('❌ Error getting Instagram accounts:', errorData);
    }

    console.log('\n📊 Method 4: Testing the provided Instagram ID...');
    const testResponse = await fetch(
      `https://graph.facebook.com/v19.0/17841472149652019?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,username`
    );

    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Instagram account test successful:');
      console.log(`   📊 ID: ${testData.id}`);
      console.log(`   📊 Name: ${testData.name || 'N/A'}`);
      console.log(`   📊 Username: ${testData.username || 'N/A'}`);
    } else {
      const errorData = await testResponse.json();
      console.error('❌ Instagram account test failed:', errorData);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
findInstagramAccountId()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
