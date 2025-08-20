require('dotenv').config({ path: '.env.local' });

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

async function prepareLiveModeConfig() {
  console.log('🚀 Preparing Facebook App for LIVE Mode...\n');

  console.log('📋 Required Configuration for LIVE Mode:\n');

  console.log('🔧 Basic Settings (App Settings > Basic):');
  console.log('   Required URLs:');
  console.log('   - Privacy Policy URL: https://toptiermen.com/privacy-policy');
  console.log('   - Terms of Service URL: https://toptiermen.com/terms-of-service');
  console.log('   - Data Deletion Instructions URL: https://toptiermen.com/data-deletion');
  console.log('');
  console.log('   App Configuration:');
  console.log('   - App Domains: toptiermen.com');
  console.log('   - Contact Email: contact@toptiermen.com (update from media2net.nl)');
  console.log('   - Category: Business (already set)');
  console.log('');

  console.log('🔐 Business Verification:');
  console.log('   - Business Account: Rick Cuijpers Top Tier Men (ID: 596070516393545)');
  console.log('   - Current Status: not_verified');
  console.log('   - Action Required: Start verification process');
  console.log('   - Verification Type: Business verification (not access verification)');
  console.log('');

  console.log('🎯 Top Tier Men Specific Assets:');
  console.log('   Ad Accounts:');
  console.log('   - Top Tier Men ADS (act_1465834431278978) - Status: 1 ✅');
  console.log('');
  console.log('   Business Accounts:');
  console.log('   - Rick Cuijpers Top Tier Men (596070516393545) - Verification: not_verified ⚠️');
  console.log('');

  console.log('🚫 Excluded Client Accounts (Do NOT use):');
  console.log('   - Chiel van der Zee (act_10150546194202632)');
  console.log('   - Martijn Zoer (act_10203195831290953)');
  console.log('   - Sam De Gier (act_168889080145027)');
  console.log('   - Koezoe (act_728058341008410)');
  console.log('   - Rozen Valentijn Advertentieaccount (act_1600957720626233)');
  console.log('   - Other business accounts');
  console.log('');

  console.log('🔒 Advanced Settings (App Settings > Advanced):');
  console.log('   Security:');
  console.log('   - Server IP allowlist: (leave empty for now)');
  console.log('   - Require app secret: ON ✅');
  console.log('   - Require 2-factor reauthorization: ON ✅');
  console.log('');
  console.log('   App Restrictions:');
  console.log('   - Social discovery: ON ✅');
  console.log('   - Age restriction: Anyone (13+) ✅');
  console.log('');

  console.log('📱 Platform Configuration:');
  console.log('   - Website: https://toptiermen.com');
  console.log('   - App Domains: toptiermen.com');
  console.log('');

  console.log('⚠️  IMPORTANT: Before switching to LIVE mode:');
  console.log('   1. Privacy Policy must be active at https://toptiermen.com/privacy-policy');
  console.log('   2. Terms of Service must be active at https://toptiermen.com/terms-of-service');
  console.log('   3. Data deletion endpoint must be functional at https://toptiermen.com/data-deletion');
  console.log('   4. Business verification must be completed for Rick Cuijpers Top Tier Men');
  console.log('   5. Contact email must be updated to contact@toptiermen.com');
  console.log('   6. App domains must be set to toptiermen.com');
  console.log('');

  console.log('🔄 Steps to Complete:');
  console.log('   1. Update contact email in Basic Settings');
  console.log('   2. Add app domains (toptiermen.com)');
  console.log('   3. Add Privacy Policy, Terms, and Data Deletion URLs');
  console.log('   4. Start business verification for Rick Cuijpers Top Tier Men');
  console.log('   5. Wait for verification approval (1-3 days)');
  console.log('   6. Test integration with Top Tier Men accounts only');
  console.log('   7. Switch to LIVE mode');
  console.log('');

  console.log('🎯 Top Tier Men Integration Focus:');
  console.log('   - Use only Top Tier Men ADS account for ad management');
  console.log('   - Use only Rick Cuijpers Top Tier Men business account');
  console.log('   - Exclude all other client accounts from the integration');
  console.log('   - Ensure all URLs point to toptiermen.com domain');
  console.log('');

  return {
    topTierAdAccount: 'act_1465834431278978',
    topTierBusinessAccount: '596070516393545',
    requiredUrls: {
      privacyPolicy: 'https://toptiermen.com/privacy-policy',
      termsOfService: 'https://toptiermen.com/terms-of-service',
      dataDeletion: 'https://toptiermen.com/data-deletion'
    },
    appDomain: 'toptiermen.com',
    contactEmail: 'contact@toptiermen.com'
  };
}

// Run the preparation
if (require.main === module) {
  prepareLiveModeConfig()
    .then((config) => {
      console.log('✅ Facebook App LIVE mode preparation completed');
      console.log('\n📋 Configuration Summary:');
      console.log(`   Top Tier Ad Account: ${config.topTierAdAccount}`);
      console.log(`   Top Tier Business Account: ${config.topTierBusinessAccount}`);
      console.log(`   App Domain: ${config.appDomain}`);
      console.log(`   Contact Email: ${config.contactEmail}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Preparation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { prepareLiveModeConfig };
