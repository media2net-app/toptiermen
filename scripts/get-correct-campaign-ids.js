require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

async function getCampaigns() {
  try {
    console.log('🔍 Fetching all campaigns...');
    
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status,objective,created_time&limit=100`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch campaigns:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('\n📋 All campaigns:');
    console.log('================');
    
    data.data.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.name}`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Objective: ${campaign.objective}`);
      console.log(`   Created: ${campaign.created_time}`);
      console.log('');
    });

    console.log('\n🎯 LEADS campaigns found:');
    console.log('========================');
    
    const leadsCampaigns = data.data.filter(campaign => 
      campaign.name.includes('LEADS') || campaign.objective === 'OUTCOME_LEADS'
    );

    leadsCampaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.name}`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Objective: ${campaign.objective}`);
      console.log('');
    });

    if (leadsCampaigns.length === 0) {
      console.log('❌ No LEADS campaigns found!');
    }

  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
  }
}

getCampaigns();
