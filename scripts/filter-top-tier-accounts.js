require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

async function filterTopTierAccounts() {
  console.log('🔍 Filtering Top Tier Men specific accounts...\n');

  try {
    // Test 1: Get Ad Accounts
    console.log('📊 Fetching Ad Accounts...');
    const adAccountsUrl = `https://graph.facebook.com/v23.0/me/adaccounts?access_token=${accessToken}&fields=name,account_id,account_status,account_type`;
    const adAccountsResponse = await fetch(adAccountsUrl);
    const adAccountsData = await adAccountsResponse.json();

    const adAccounts = adAccountsData.data;
    console.log(`Found ${adAccounts.length} ad accounts total\n`);

    // Filter Top Tier Men specific accounts
    const topTierAdAccounts = adAccounts.filter(account => {
      const name = account.name.toLowerCase();
      const accountId = account.account_id;
      
      // Top Tier Men specific identifiers
      const isTopTier = name.includes('top tier') || 
                       name.includes('toptiermen') ||
                       accountId === 'act_1465834431278978' || // Top Tier Men ADS
                       name.includes('rick cuijpers');
      
      return isTopTier;
    });

    console.log('🎯 Top Tier Men Ad Accounts:');
    topTierAdAccounts.forEach(account => {
      console.log(`   ✅ ${account.name} (${account.account_id}) - Status: ${account.account_status}`);
    });

    // Test 2: Get Business Accounts
    console.log('\n🏢 Fetching Business Accounts...');
    const businessAccountsUrl = `https://graph.facebook.com/v23.0/me/businesses?access_token=${accessToken}&fields=name,id,verification_status`;
    const businessAccountsResponse = await fetch(businessAccountsUrl);
    const businessAccountsData = await businessAccountsResponse.json();

    const businessAccounts = businessAccountsData.data;
    console.log(`Found ${businessAccounts.length} business accounts total\n`);

    // Filter Top Tier Men specific business accounts
    const topTierBusinessAccounts = businessAccounts.filter(account => {
      const name = account.name.toLowerCase();
      const accountId = account.id;
      
      // Top Tier Men specific identifiers
      const isTopTier = name.includes('top tier') || 
                       name.includes('toptiermen') ||
                       accountId === '596070516393545' || // Rick Cuijpers Top Tier Men
                       name.includes('rick cuijpers');
      
      return isTopTier;
    });

    console.log('🎯 Top Tier Men Business Accounts:');
    topTierBusinessAccounts.forEach(account => {
      console.log(`   ✅ ${account.name} (${account.id}) - Verification: ${account.verification_status}`);
    });

    // Test 3: Get Pages (if any)
    console.log('\n📄 Fetching Pages...');
    const pagesUrl = `https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}&fields=name,id,category`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();

    const pages = pagesData.data;
    console.log(`Found ${pages.length} pages total\n`);

    // Filter Top Tier Men specific pages
    const topTierPages = pages.filter(page => {
      const name = page.name.toLowerCase();
      
      // Top Tier Men specific identifiers
      const isTopTier = name.includes('top tier') || 
                       name.includes('toptiermen') ||
                       name.includes('rick cuijpers');
      
      return isTopTier;
    });

    console.log('🎯 Top Tier Men Pages:');
    if (topTierPages.length > 0) {
      topTierPages.forEach(page => {
        console.log(`   ✅ ${page.name} (${page.id}) - Category: ${page.category}`);
      });
    } else {
      console.log('   ℹ️  No Top Tier Men specific pages found');
    }

    // Summary
    console.log('\n📋 Summary - Top Tier Men Assets:');
    console.log(`   Ad Accounts: ${topTierAdAccounts.length}`);
    console.log(`   Business Accounts: ${topTierBusinessAccounts.length}`);
    console.log(`   Pages: ${topTierPages.length}`);

    // Configuration recommendations
    console.log('\n🔧 Configuration Recommendations:');
    console.log('   1. Use only the above Top Tier Men accounts in your app');
    console.log('   2. Exclude all other client accounts');
    console.log('   3. Set up business verification for Rick Cuijpers Top Tier Men');
    console.log('   4. Configure app domains to toptiermen.com');
    console.log('   5. Update contact email to contact@toptiermen.com');

    return {
      adAccounts: topTierAdAccounts,
      businessAccounts: topTierBusinessAccounts,
      pages: topTierPages
    };

  } catch (error) {
    console.error('❌ Error filtering accounts:', error.message);
    throw error;
  }
}

// Run the filter
if (require.main === module) {
  filterTopTierAccounts()
    .then(() => {
      console.log('\n✅ Top Tier Men account filtering completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Filtering failed:', error.message);
      process.exit(1);
    });
}

module.exports = { filterTopTierAccounts };
