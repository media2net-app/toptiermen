require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

console.log('🚀 Creating Official Facebook Campaigns Structure');
console.log('📊 Ad Account ID:', FACEBOOK_AD_ACCOUNT_ID);
console.log('📱 Page ID:', FACEBOOK_PAGE_ID);

// Campaign configurations - simplified without creatives for now
const campaignConfigs = [
  {
    name: 'TTM - Algemene Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    targetAudience: 'Algemeen',
    adSets: [
      { name: 'TTM - Algemeen - Awareness', budget: 5 },
      { name: 'TTM - Algemeen - Interest Based', budget: 5 },
      { name: 'TTM - Algemeen - Lookalike', budget: 5 },
      { name: 'TTM - Algemeen - Retargeting', budget: 5 },
      { name: 'TTM - Algemeen - Custom Audience', budget: 5 }
    ]
  },
  {
    name: 'TTM - Jongeren Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    targetAudience: 'Jongeren',
    adSets: [
      { name: 'TTM - Jongeren - Fitness & Lifestyle', budget: 5 },
      { name: 'TTM - Jongeren - Social & Community', budget: 5 }
    ]
  },
  {
    name: 'TTM - Vaders Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    targetAudience: 'Vaders',
    adSets: [
      { name: 'TTM - Vaders - Family & Leadership', budget: 5 },
      { name: 'TTM - Vaders - Role Model & Success', budget: 5 }
    ]
  },
  {
    name: 'TTM - Zakelijk Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    targetAudience: 'Zakelijk',
    adSets: [
      { name: 'TTM - Zakelijk - Business Professionals', budget: 5 },
      { name: 'TTM - Zakelijk - Entrepreneurs & Leaders', budget: 5 }
    ]
  }
];

async function cleanupOldCampaigns() {
  console.log('🧹 Cleaning up old campaigns...');
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name&limit=100`
    );
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      console.log(`📋 Found ${data.data.length} existing campaigns`);
      
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
      }
    } else {
      console.log('✅ No existing campaigns found');
    }
  } catch (error) {
    console.error('❌ Error cleaning up campaigns:', error);
  }
}

async function createCampaign(campaignConfig) {
  console.log(`\n🎯 Creating campaign: ${campaignConfig.name}`);
  
  const campaignPayload = {
    name: campaignConfig.name,
    objective: campaignConfig.objective,
    status: 'PAUSED',
    special_ad_categories: [],
    access_token: FACEBOOK_ACCESS_TOKEN
  };
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignPayload)
      }
    );
    
    const result = await response.json();
    
    if (result.id) {
      console.log(`✅ Campaign created: ${campaignConfig.name} (${result.id})`);
      return result.id;
    } else {
      console.error(`❌ Campaign creation failed:`, result);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating campaign:`, error);
    return null;
  }
}

async function createAdSet(campaignId, adSetConfig) {
  console.log(`  📦 Creating ad set: ${adSetConfig.name}`);
  
  const adSetPayload = {
    name: adSetConfig.name,
    campaign_id: campaignId,
    daily_budget: adSetConfig.budget * 100, // Convert to cents
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'LINK_CLICKS',
    bid_amount: 100, // 1 euro in cents
    status: 'PAUSED',
    targeting: {
      age_min: 18,
      age_max: 65,
      genders: [1, 2], // Both male and female
      geo_locations: {
        countries: ['NL', 'BE']
      },
      targeting_automation: {
        advantage_audience: 1
      }
    },
    dsa_beneficiary: 'Rick Cuijpers',
    dsa_payor: 'Rick Cuijpers',
    access_token: FACEBOOK_ACCESS_TOKEN
  };
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adSetPayload)
      }
    );
    
    const result = await response.json();
    
    if (result.id) {
      console.log(`    ✅ Ad set created: ${adSetConfig.name} (${result.id})`);
      return result.id;
    } else {
      console.error(`    ❌ Ad set creation failed:`, result);
      return null;
    }
  } catch (error) {
    console.error(`    ❌ Error creating ad set:`, error);
    return null;
  }
}

async function createFullCampaignStructure() {
  console.log('\n🏗️  Creating full campaign structure...\n');
  
  const results = {
    campaigns: [],
    adSets: []
  };
  
  for (const campaignConfig of campaignConfigs) {
    // Create campaign
    const campaignId = await createCampaign(campaignConfig);
    if (!campaignId) continue;
    
    results.campaigns.push({
      id: campaignId,
      name: campaignConfig.name,
      config: campaignConfig
    });
    
    // Create ad sets for this campaign
    for (const adSetConfig of campaignConfig.adSets) {
      const adSetId = await createAdSet(campaignId, adSetConfig);
      if (adSetId) {
        results.adSets.push({
          id: adSetId,
          name: adSetConfig.name,
          campaignId: campaignId
        });
      }
    }
  }
  
  return results;
}

async function main() {
  try {
    console.log('🎯 Starting Official Facebook Campaigns Setup\n');
    
    // Step 1: Clean up old campaigns
    await cleanupOldCampaigns();
    
    // Step 2: Create new campaign structure
    const results = await createFullCampaignStructure();
    
    // Step 3: Summary
    console.log('\n📊 Campaign Setup Summary:');
    console.log('========================');
    console.log(`✅ Campaigns created: ${results.campaigns.length}`);
    console.log(`✅ Ad Sets created: ${results.adSets.length}`);
    
    console.log('\n🎯 Campaign Details:');
    results.campaigns.forEach(campaign => {
      console.log(`  📋 ${campaign.name} (${campaign.id})`);
      const campaignAdSets = results.adSets.filter(adSet => adSet.campaignId === campaign.id);
      campaignAdSets.forEach(adSet => {
        console.log(`    📦 ${adSet.name} (${adSet.id})`);
      });
    });
    
    console.log('\n🚀 Setup complete! All campaigns and ad sets are created in PAUSED status.');
    console.log('📱 Next steps:');
    console.log('   1. Go to Facebook Ads Manager');
    console.log('   2. Add ad creatives to each ad set');
    console.log('   3. Use videos from "Advertentie Materiaal"');
    console.log('   4. Set up proper targeting (interests, demographics)');
    console.log('   5. Activate campaigns when ready');
    console.log('🔗 Dashboard will automatically sync with these new campaigns.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
