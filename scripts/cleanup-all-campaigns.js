require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ Missing FACEBOOK_ACCESS_TOKEN environment variable');
  process.exit(1);
}

async function cleanupAllCampaigns() {
  console.log('🧹 Cleaning up all existing campaigns...\n');

  try {
    // Step 1: Get all campaigns
    console.log('📊 Fetching all campaigns...');
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status&limit=100`
    );

    if (!campaignsResponse.ok) {
      const errorData = await campaignsResponse.json();
      throw new Error(`Failed to fetch campaigns: ${JSON.stringify(errorData)}`);
    }

    const campaignsData = await campaignsResponse.json();
    const campaigns = campaignsData.data || [];

    console.log(`📊 Found ${campaigns.length} campaigns:`);
    campaigns.forEach(campaign => {
      console.log(`   - ${campaign.name} (ID: ${campaign.id}, Status: ${campaign.status})`);
    });

    if (campaigns.length === 0) {
      console.log('✅ No campaigns found to delete');
      return;
    }

    // Step 2: Delete all campaigns
    console.log('\n🗑️ Deleting all campaigns...');
    let deletedCount = 0;

    for (const campaign of campaigns) {
      try {
        console.log(`🗑️ Deleting campaign: ${campaign.name} (${campaign.id})`);
        
        const deleteResponse = await fetch(
          `https://graph.facebook.com/v19.0/${campaign.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'DELETE'
          }
        );

        if (deleteResponse.ok) {
          console.log(`✅ Successfully deleted: ${campaign.name}`);
          deletedCount++;
        } else {
          const errorData = await deleteResponse.json();
          console.log(`⚠️ Could not delete ${campaign.name}:`, errorData);
        }
      } catch (error) {
        console.log(`⚠️ Error deleting ${campaign.name}:`, error.message);
      }

      // Wait a bit between deletions to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ Cleanup completed! Deleted ${deletedCount}/${campaigns.length} campaigns`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

// Run the script
cleanupAllCampaigns()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
