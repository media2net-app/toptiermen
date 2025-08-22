require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function forceCleanupAllCampaigns() {
  console.log('🧹 Force cleaning up ALL campaigns...');
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name&limit=100`
    );
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      console.log(`📋 Found ${data.data.length} campaigns to delete`);
      
      for (const campaign of data.data) {
        console.log(`🗑️  Deleting campaign: ${campaign.name} (${campaign.id})`);
        
        const deleteResponse = await fetch(
          `https://graph.facebook.com/v19.0/${campaign.id}?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'DELETE'
          }
        );
        
        const deleteResult = await deleteResponse.json();
        
        if (deleteResult.success) {
          console.log(`✅ Deleted campaign: ${campaign.name}`);
        } else {
          console.log(`⚠️  Failed to delete campaign: ${campaign.name}`, deleteResult);
        }
        
        // Wait a bit between deletions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      console.log('✅ No campaigns found');
    }
    
    console.log('\n✅ All campaigns deleted. Now recreating official structure...');
    
    // Wait a bit before recreating
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Run the official campaign creation script
    const { execSync } = require('child_process');
    execSync('node scripts/create-official-facebook-campaigns.js', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Error during force cleanup:', error);
  }
}

forceCleanupAllCampaigns();
