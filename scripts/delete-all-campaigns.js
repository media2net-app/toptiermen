require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ Missing FACEBOOK_ACCESS_TOKEN environment variable');
  process.exit(1);
}

// Campaign IDs to delete
const CAMPAIGN_IDS = [
  '120232169694350324', // Algemene
  '120232169696830324', // Jongeren
  '120232169699340324', // Vaders
  '120232169702740324'  // Zakelijk
];

async function deleteAllCampaigns() {
  console.log('🗑️ Deleting all existing campaigns...\n');

  for (const campaignId of CAMPAIGN_IDS) {
    try {
      console.log(`🗑️ Deleting campaign ${campaignId}...`);
      
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${campaignId}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
          method: 'DELETE'
        }
      );

      if (response.ok) {
        console.log(`✅ Campaign ${campaignId} deleted successfully`);
      } else {
        const errorData = await response.json();
        console.log(`⚠️ Could not delete campaign ${campaignId}:`, errorData);
      }
    } catch (error) {
      console.log(`⚠️ Error deleting campaign ${campaignId}:`, error.message);
    }

    // Wait a bit between deletions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ All campaigns deleted successfully');
}

// Run the script
deleteAllCampaigns()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
