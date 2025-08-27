require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

// LEADS campaigns to set up (using correct IDs)
const LEADS_CAMPAIGNS = [
  {
    name: 'TTM - Zakelijk Prelaunch Campagne - LEADS',
    id: '120232394476410324',
    type: 'zakelijk'
  },
  {
    name: 'TTM - Vaders Prelaunch Campagne - LEADS', 
    id: '120232394477760324',
    type: 'vaders'
  },
  {
    name: 'TTM - Jongeren Prelaunch Campagne - LEADS',
    id: '120232394479720324',
    type: 'jongeren'
  },
  {
    name: 'TTM - Algemene Prelaunch Campagne - LEADS',
    id: '120232394482520324',
    type: 'algemeen'
  }
];

// Simple targeting configurations for each campaign type
const TARGETING_CONFIGS = {
  zakelijk: [
    {
      name: 'TTM - Zakelijk - Entrepreneurs & Leaders - LEADS',
      targeting: {
        age_min: 25,
        age_max: 55,
        genders: [1, 2],
        interests: [
          { id: '6002714396372', name: 'Entrepreneurship' },
          { id: '6002714396373', name: 'Business' },
          { id: '6002714396374', name: 'Leadership' }
        ]
      }
    },
    {
      name: 'TTM - Zakelijk - Business Professionals - LEADS',
      targeting: {
        age_min: 25,
        age_max: 55,
        genders: [1, 2],
        interests: [
          { id: '6002714396381', name: 'Business management' },
          { id: '6002714396382', name: 'Corporate leadership' },
          { id: '6002714396383', name: 'Executive coaching' }
        ]
      }
    }
  ],
  vaders: [
    {
      name: 'TTM - Vaders - Role Model & Success - LEADS',
      targeting: {
        age_min: 25,
        age_max: 50,
        genders: [1],
        interests: [
          { id: '6002714396389', name: 'Parenting' },
          { id: '6002714396390', name: 'Fatherhood' },
          { id: '6002714396391', name: 'Role model' }
        ]
      }
    },
    {
      name: 'TTM - Vaders - Family & Leadership - LEADS',
      targeting: {
        age_min: 25,
        age_max: 50,
        genders: [1],
        interests: [
          { id: '6002714396396', name: 'Family' },
          { id: '6002714396397', name: 'Leadership' },
          { id: '6002714396398', name: 'Parenting' }
        ]
      }
    }
  ],
  jongeren: [
    {
      name: 'TTM - Jongeren - Social & Community - LEADS',
      targeting: {
        age_min: 18,
        age_max: 35,
        genders: [1, 2],
        interests: [
          { id: '6002714396402', name: 'Social media' },
          { id: '6002714396403', name: 'Community' },
          { id: '6002714396404', name: 'Personal development' }
        ]
      }
    },
    {
      name: 'TTM - Jongeren - Fitness & Lifestyle - LEADS',
      targeting: {
        age_min: 18,
        age_max: 35,
        genders: [1, 2],
        interests: [
          { id: '6002714396409', name: 'Fitness' },
          { id: '6002714396410', name: 'Lifestyle' },
          { id: '6002714396411', name: 'Health' }
        ]
      }
    }
  ],
  algemeen: [
    {
      name: 'TTM - Algemeen - Custom Audience - LEADS',
      targeting: {
        age_min: 25,
        age_max: 55,
        genders: [1, 2],
        interests: [
          { id: '6002714396416', name: 'Self-improvement' },
          { id: '6002714396417', name: 'Personal development' },
          { id: '6002714396418', name: 'Motivation' }
        ]
      }
    },
    {
      name: 'TTM - Algemeen - Retargeting - LEADS',
      targeting: {
        age_min: 25,
        age_max: 55,
        genders: [1, 2],
        interests: [
          { id: '6002714396420', name: 'Fitness' },
          { id: '6002714396421', name: 'Health' },
          { id: '6002714396422', name: 'Wellness' }
        ]
      }
    },
    {
      name: 'TTM - Algemeen - Lookalike - LEADS',
      targeting: {
        age_min: 25,
        age_max: 55,
        genders: [1, 2],
        interests: [
          { id: '6002714396424', name: 'Self-improvement' },
          { id: '6002714396425', name: 'Personal development' },
          { id: '6002714396426', name: 'Motivation' }
        ]
      }
    },
    {
      name: 'TTM - Algemeen - Interest Based - LEADS',
      targeting: {
        age_min: 25,
        age_max: 55,
        genders: [1, 2],
        interests: [
          { id: '6002714396428', name: 'Fitness' },
          { id: '6002714396429', name: 'Health' },
          { id: '6002714396430', name: 'Wellness' }
        ]
      }
    },
    {
      name: 'TTM - Algemeen - Awareness - LEADS',
      targeting: {
        age_min: 25,
        age_max: 55,
        genders: [1, 2],
        interests: [
          { id: '6002714396434', name: 'Self-improvement' },
          { id: '6002714396435', name: 'Personal development' },
          { id: '6002714396436', name: 'Motivation' }
        ]
      }
    }
  ]
};

async function createAdSet(campaignId, adSetConfig) {
  try {
    console.log(`📋 Creating ad set: ${adSetConfig.name}`);
    
    const createAdSetResponse = await fetch(
      `https://graph.facebook.com/v19.0/${campaignId}/adsets`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          name: adSetConfig.name,
          campaign_id: campaignId,
          targeting: adSetConfig.targeting,
          daily_budget: 10000, // €10 daily budget
          bid_amount: 500, // €5 bid
          bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
          optimization_goal: 'LEADS',
          status: 'PAUSED',
          start_time: Math.floor(Date.now() / 1000) + 3600
        })
      }
    );

    if (!createAdSetResponse.ok) {
      const errorText = await createAdSetResponse.text();
      console.error(`❌ Failed to create ad set ${adSetConfig.name}:`, errorText);
      return null;
    }

    const adSetData = await createAdSetResponse.json();
    console.log(`✅ Created ad set: ${adSetConfig.name} (ID: ${adSetData.id})`);
    return {
      id: adSetData.id,
      name: adSetConfig.name
    };

  } catch (error) {
    console.error(`❌ Error creating ad set ${adSetConfig.name}:`, error);
    return null;
  }
}

async function setupLeadsCampaign(campaign) {
  console.log(`\n🎯 Setting up LEADS campaign: ${campaign.name}`);
  
  const campaignType = campaign.type;
  const adSetConfigs = TARGETING_CONFIGS[campaignType];
  
  if (!adSetConfigs) {
    console.error(`❌ No configuration found for campaign type: ${campaignType}`);
    return;
  }

  const createdAdSets = [];

  // Create ad sets
  for (const adSetConfig of adSetConfigs) {
    const adSet = await createAdSet(campaign.id, adSetConfig);
    if (adSet) {
      createdAdSets.push(adSet);
    }
    
    // Wait 2 seconds between ad sets
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    adSets: createdAdSets
  };
}

async function main() {
  console.log('🚀 Creating ad sets for LEADS campaigns...\n');
  
  const results = [];
  
  for (const campaign of LEADS_CAMPAIGNS) {
    const result = await setupLeadsCampaign(campaign);
    if (result) {
      results.push(result);
    }
    
    // Wait 3 seconds between campaigns
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n🎉 LEADS Ad Sets Creation Summary:');
  console.log('==================================');
  
  results.forEach((result, index) => {
    console.log(`\n📊 ${result.campaignName}:`);
    console.log(`   - Ad sets created: ${result.adSets.length}`);
    
    if (result.adSets.length > 0) {
      console.log(`\n   📋 Created Ad Sets:`);
      result.adSets.forEach(adSet => {
        console.log(`      ✅ ${adSet.name} (ID: ${adSet.id})`);
      });
    }
  });
  
  console.log('\n📝 Next steps:');
  console.log('1. Review all ad sets in Facebook Ads Manager');
  console.log('2. Create lead forms for each campaign');
  console.log('3. Create ad creatives manually in Facebook Ads Manager');
  console.log('4. Set up conversion tracking');
  console.log('5. Activate campaigns when ready');
  console.log('\n⚠️  All ad sets are set to PAUSED for safety!');
}

main().catch(console.error);
