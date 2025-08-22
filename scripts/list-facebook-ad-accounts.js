require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ Missing FACEBOOK_ACCESS_TOKEN environment variable');
  process.exit(1);
}

async function listFacebookAdAccounts() {
  console.log('🔍 Fetching Facebook Ad Accounts...\n');

  try {
    // First, get the user's ad accounts
    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,account_status,currency,timezone_name,business_name`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error fetching ad accounts:', errorData);
      return;
    }

    const data = await response.json();
    const adAccounts = data.data || [];

    console.log(`✅ Found ${adAccounts.length} ad accounts:\n`);

    if (adAccounts.length === 0) {
      console.log('❌ No ad accounts found. Please check your Facebook permissions.');
      return;
    }

    adAccounts.forEach((account, index) => {
      console.log(`${index + 1}. Ad Account: ${account.name}`);
      console.log(`   📊 ID: ${account.id}`);
      console.log(`   💰 Currency: ${account.currency}`);
      console.log(`   🌍 Timezone: ${account.timezone_name}`);
      console.log(`   🏢 Business: ${account.business_name || 'N/A'}`);
      console.log(`   📈 Status: ${account.account_status}`);
      console.log('');
    });

    console.log('💡 To use an ad account, add this to your .env.local:');
    console.log(`FACEBOOK_AD_ACCOUNT_ID=${adAccounts[0]?.id || 'YOUR_AD_ACCOUNT_ID'}`);

    // Also try to get business ad accounts
    console.log('\n🔍 Fetching Business Ad Accounts...\n');

    const businessResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/businesses?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,verification_status`
    );

    if (businessResponse.ok) {
      const businessData = await businessResponse.json();
      const businesses = businessData.data || [];

      if (businesses.length > 0) {
        console.log(`✅ Found ${businesses.length} businesses:\n`);

        for (const business of businesses) {
          console.log(`🏢 Business: ${business.name}`);
          console.log(`   📊 ID: ${business.id}`);
          console.log(`   ✅ Verification: ${business.verification_status}`);
          
          // Get ad accounts for this business
          const businessAdAccountsResponse = await fetch(
            `https://graph.facebook.com/v19.0/${business.id}/owned_ad_accounts?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,account_status,currency`
          );

          if (businessAdAccountsResponse.ok) {
            const businessAdAccountsData = await businessAdAccountsResponse.json();
            const businessAdAccounts = businessAdAccountsData.data || [];

            if (businessAdAccounts.length > 0) {
              console.log(`   📊 Ad Accounts: ${businessAdAccounts.length}`);
              businessAdAccounts.forEach(account => {
                console.log(`      - ${account.name} (${account.id}) - ${account.account_status}`);
              });
            } else {
              console.log(`   📊 No ad accounts found for this business`);
            }
          }
          console.log('');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
listFacebookAdAccounts()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
