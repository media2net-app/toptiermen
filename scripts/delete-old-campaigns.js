require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ Missing FACEBOOK_ACCESS_TOKEN environment variable');
  process.exit(1);
}

// Old campaign IDs to delete (the ones without daily budgets)
const OLD_CAMPAIGN_IDS = [
  '120232169512140324', // TTM - Zakelijk Prelaunch Campagne (old)
  '120232169508660324', // TTM - Vaders Prelaunch Campagne (old)
  '120232169506340324', // TTM - Jongeren Prelaunch Campagne (old)
  '120232169501290324'  // TTM - Algemene Prelaunch Campagne (old)
];

async function deleteOldCampaigns() {
  console.log('🗑️ Deleting old duplicate campaigns...\n');

  for (const campaignId of OLD_CAMPAIGN_IDS) {
    try {
      console.log(`🗑️ Deleting old campaign ${campaignId}...`);
      
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${campaignId}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
          method: 'DELETE'
        }
      );

      if (response.ok) {
        console.log(`✅ Old campaign ${campaignId} deleted successfully`);
      } else {
        const errorData = await response.json();
        console.log(`⚠️ Could not delete old campaign ${campaignId}:`, errorData);
      }
    } catch (error) {
      console.log(`⚠️ Error deleting old campaign ${campaignId}:`, error.message);
    }

    // Wait a bit between deletions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ All old campaigns deleted successfully');
}

// Run the script
deleteOldCampaigns()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
