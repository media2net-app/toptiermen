require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function cleanupTestCampaigns() {
  console.log('🧹 Cleaning up test campaigns...');
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name&limit=100`
    );
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      console.log(`📋 Found ${data.data.length} campaigns`);
      
      for (const campaign of data.data) {
        if (campaign.name === 'Simple Test Campaign') {
          console.log(`🗑️  Deleting test campaign: ${campaign.name} (${campaign.id})`);
          
          const deleteResponse = await fetch(
            `https://graph.facebook.com/v19.0/${campaign.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
            {
              method: 'DELETE'
            }
          );
          
          const deleteResult = await deleteResponse.json();
          
          if (deleteResult.success) {
            console.log(`✅ Deleted test campaign: ${campaign.name}`);
          } else {
            console.log(`⚠️  Failed to delete test campaign: ${campaign.name}`, deleteResult);
          }
        }
      }
    } else {
      console.log('✅ No campaigns found');
    }
  } catch (error) {
    console.error('❌ Error cleaning up test campaigns:', error);
  }
}

cleanupTestCampaigns();
