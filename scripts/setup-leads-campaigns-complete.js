const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

// LEADS campaigns to set up
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

// Targeting configurations for each campaign type
const TARGETING_CONFIGS = {
  zakelijk: {
    adSets: [
      {
        name: 'TTM - Zakelijk - Entrepreneurs & Leaders - LEADS',
        targeting: {
          age_min: 25,
          age_max: 55,
          genders: [1, 2],
          interests: [
            { id: '6002714396372', name: 'Entrepreneurship' },
            { id: '6002714396373', name: 'Business' },
            { id: '6002714396374', name: 'Leadership' },
            { id: '6002714396375', name: 'Professional development' },
            { id: '6002714396376', name: 'Networking' }
          ],
          behaviors: [
            { id: '6002714396377', name: 'Business travelers' },
            { id: '6002714396378', name: 'Frequent international travelers' },
            { id: '6002714396379', name: 'High income earners' }
          ],
          income: ['6002714396380']
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
            { id: '6002714396383', name: 'Executive coaching' },
            { id: '6002714396384', name: 'Career development' }
          ],
          behaviors: [
            { id: '6002714396385', name: 'Business travelers' },
            { id: '6002714396386', name: 'High income earners' }
          ]
        }
      }
    ]
  },
  vaders: {
    adSets: [
      {
        name: 'TTM - Vaders - Role Model & Success - LEADS',
        targeting: {
          age_min: 25,
          age_max: 50,
          genders: [1],
          family_statuses: [
            { id: '6002714396387', name: 'Parents' },
            { id: '6002714396388', name: 'Fathers' }
          ],
          interests: [
            { id: '6002714396389', name: 'Parenting' },
            { id: '6002714396390', name: 'Fatherhood' },
            { id: '6002714396391', name: 'Role model' },
            { id: '6002714396392', name: 'Personal development' },
            { id: '6002714396393', name: 'Success' }
          ]
        }
      },
      {
        name: 'TTM - Vaders - Family & Leadership - LEADS',
        targeting: {
          age_min: 25,
          age_max: 50,
          genders: [1],
          family_statuses: [
            { id: '6002714396394', name: 'Parents' },
            { id: '6002714396395', name: 'Fathers' }
          ],
          interests: [
            { id: '6002714396396', name: 'Family' },
            { id: '6002714396397', name: 'Leadership' },
            { id: '6002714396398', name: 'Parenting' },
            { id: '6002714396399', name: 'Personal development' }
          ],
          life_events: [
            { id: '6002714396400', name: 'New parents' },
            { id: '6002714396401', name: 'Recently married' }
          ]
        }
      }
    ]
  },
  jongeren: {
    adSets: [
      {
        name: 'TTM - Jongeren - Social & Community - LEADS',
        targeting: {
          age_min: 18,
          age_max: 35,
          genders: [1, 2],
          interests: [
            { id: '6002714396402', name: 'Social media' },
            { id: '6002714396403', name: 'Community' },
            { id: '6002714396404', name: 'Personal development' },
            { id: '6002714396405', name: 'Self-improvement' },
            { id: '6002714396406', name: 'Motivation' }
          ],
          behaviors: [
            { id: '6002714396407', name: 'Frequent social media users' },
            { id: '6002714396408', name: 'Early adopters' }
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
            { id: '6002714396411', name: 'Health' },
            { id: '6002714396412', name: 'Wellness' },
            { id: '6002714396413', name: 'Personal development' }
          ],
          behaviors: [
            { id: '6002714396414', name: 'Frequent gym-goers' },
            { id: '6002714396415', name: 'Fitness enthusiasts' }
          ]
        }
      }
    ]
  },
  algemeen: {
    adSets: [
      {
        name: 'TTM - Algemeen - Custom Audience - LEADS',
        targeting: {
          age_min: 25,
          age_max: 55,
          genders: [1, 2],
          interests: [
            { id: '6002714396416', name: 'Self-improvement' },
            { id: '6002714396417', name: 'Personal development' },
            { id: '6002714396418', name: 'Motivation' },
            { id: '6002714396419', name: 'Success' }
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
            { id: '6002714396422', name: 'Wellness' },
            { id: '6002714396423', name: 'Personal development' }
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
            { id: '6002714396426', name: 'Motivation' },
            { id: '6002714396427', name: 'Success' }
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
            { id: '6002714396430', name: 'Wellness' },
            { id: '6002714396431', name: 'Personal development' }
          ],
          behaviors: [
            { id: '6002714396432', name: 'Frequent online shoppers' },
            { id: '6002714396433', name: 'Early adopters' }
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
            { id: '6002714396436', name: 'Motivation' },
            { id: '6002714396437', name: 'Success' }
          ]
        }
      }
    ]
  }
};

// Ad creatives for each campaign type
const AD_CREATIVES = {
  zakelijk: [
    {
      name: 'TTM - Zakelijk - Entrepreneurs & Leaders - LEADS - Ad 1',
      title: 'Voor Ondernemers Die Meer Willen',
      body: 'Ontdek Top Tier Men - TTM - Zakelijk - Entrepreneurs & Leaders. Word onderdeel van een elite community van succesvolle ondernemers.',
      callToAction: 'LEARN_MORE'
    },
    {
      name: 'TTM - Zakelijk - Business Professionals - LEADS - Ad 2',
      title: 'Business Professionals: Upgrade Jezelf',
      body: 'Top Tier Men helpt je om jezelf te upgraden met fitness, mindset en een netwerk van succesvolle mannen.',
      callToAction: 'SIGN_UP'
    }
  ],
  vaders: [
    {
      name: 'TTM - Vaders - Role Model & Success - LEADS - Ad 1',
      title: 'Word de Vader Die Je Kinderen Verdienen',
      body: 'Top Tier Men helpt je om een rolmodel te worden. Ontdek hoe je de beste versie van jezelf kunt zijn.',
      callToAction: 'LEARN_MORE'
    },
    {
      name: 'TTM - Vaders - Family & Leadership - LEADS - Ad 2',
      title: 'Voor Vaders Die Meer Willen',
      body: 'Ontdek Top Tier Men - TTM - Vaders - Family & Leadership. Word de leider die je gezin verdient.',
      callToAction: 'SIGN_UP'
    }
  ],
  jongeren: [
    {
      name: 'TTM - Jongeren - Social & Community - LEADS - Ad 1',
      title: 'Word Onderdeel van Onze Community',
      body: 'Top Tier Men is voor jongeren die meer willen uit het leven. Transformeer jezelf nu.',
      callToAction: 'LEARN_MORE'
    },
    {
      name: 'TTM - Jongeren - Fitness & Lifestyle - LEADS - Ad 2',
      title: 'Fitness & Lifestyle voor Jongeren',
      body: 'Ontdek Top Tier Men - TTM - Jongeren - Fitness & Lifestyle. Word de beste versie van jezelf.',
      callToAction: 'SIGN_UP'
    }
  ],
  algemeen: [
    {
      name: 'TTM - Algemeen - Custom Audience - LEADS - Ad 1',
      title: 'Word Lid van Top Tier Men',
      body: 'Ontdek Top Tier Men - TTM - Algemeen - Custom Audience. Transformeer jezelf met fitness, mindset en brotherhood.',
      callToAction: 'LEARN_MORE'
    },
    {
      name: 'TTM - Algemeen - Retargeting - LEADS - Ad 2',
      title: 'Nog Even Over Top Tier Men',
      body: 'Ontdek Top Tier Men - TTM - Algemeen - Retargeting. Word onderdeel van een elite community.',
      callToAction: 'SIGN_UP'
    },
    {
      name: 'TTM - Algemeen - Lookalike - LEADS - Ad 3',
      title: 'Zoals Jij, Zoals Wij',
      body: 'Ontdek Top Tier Men - TTM - Algemeen - Lookalike. Sluit je aan bij mannen zoals jij.',
      callToAction: 'LEARN_MORE'
    },
    {
      name: 'TTM - Algemeen - Interest Based - LEADS - Ad 4',
      title: 'Voor Mannen Die Meer Willen',
      body: 'Ontdek Top Tier Men - TTM - Algemeen - Interest Based. Transformeer je leven.',
      callToAction: 'SIGN_UP'
    },
    {
      name: 'TTM - Algemeen - Awareness - LEADS - Ad 5',
      title: 'Ontdek Top Tier Men',
      body: 'Ontdek Top Tier Men - TTM - Algemeen - Awareness. Word onderdeel van een elite community.',
      callToAction: 'LEARN_MORE'
    }
  ]
};

async function createAdSet(campaignId, adSetConfig) {
  try {
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
    return adSetData.id;

  } catch (error) {
    console.error(`❌ Error creating ad set ${adSetConfig.name}:`, error);
    return null;
  }
}

async function createAdCreative(creativeConfig) {
  try {
    const createCreativeResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adcreatives`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          name: creativeConfig.name,
          title: creativeConfig.title,
          body: creativeConfig.body,
          object_story_spec: {
            page_id: '610571295471584',
            link_data: {
              link: 'https://platform.toptiermen.eu/prelaunch',
              message: creativeConfig.body,
              call_to_action: {
                type: creativeConfig.callToAction,
                value: {
                  link: 'https://platform.toptiermen.eu/prelaunch'
                }
              }
            }
          }
        })
      }
    );

    if (!createCreativeResponse.ok) {
      const errorText = await createCreativeResponse.text();
      console.error(`❌ Failed to create ad creative ${creativeConfig.name}:`, errorText);
      return null;
    }

    const creativeData = await createCreativeResponse.json();
    console.log(`✅ Created ad creative: ${creativeConfig.name} (ID: ${creativeData.id})`);
    return creativeData.id;

  } catch (error) {
    console.error(`❌ Error creating ad creative ${creativeConfig.name}:`, error);
    return null;
  }
}

async function createAd(adSetId, adCreativeId, adConfig) {
  try {
    const createAdResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/ads`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          name: adConfig.name,
          adset_id: adSetId,
          creative: {
            creative_id: adCreativeId
          },
          status: 'PAUSED'
        })
      }
    );

    if (!createAdResponse.ok) {
      const errorText = await createAdResponse.text();
      console.error(`❌ Failed to create ad ${adConfig.name}:`, errorText);
      return null;
    }

    const adData = await createAdResponse.json();
    console.log(`✅ Created ad: ${adConfig.name} (ID: ${adData.id})`);
    return adData.id;

  } catch (error) {
    console.error(`❌ Error creating ad ${adConfig.name}:`, error);
    return null;
  }
}

async function setupLeadsCampaign(campaign) {
  console.log(`\n🎯 Setting up complete LEADS campaign: ${campaign.name}`);
  
  const campaignType = campaign.type;
  const targetingConfig = TARGETING_CONFIGS[campaignType];
  const adCreatives = AD_CREATIVES[campaignType];
  
  if (!targetingConfig || !adCreatives) {
    console.error(`❌ No configuration found for campaign type: ${campaignType}`);
    return;
  }

  const createdAdSets = [];
  const createdAds = [];

  // Step 1: Create ad sets
  console.log(`📋 Creating ${targetingConfig.adSets.length} ad sets...`);
  
  for (const adSetConfig of targetingConfig.adSets) {
    const adSetId = await createAdSet(campaign.id, adSetConfig);
    if (adSetId) {
      createdAdSets.push({
        id: adSetId,
        name: adSetConfig.name,
        config: adSetConfig
      });
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Step 2: Create ad creatives
  console.log(`🎨 Creating ${adCreatives.length} ad creatives...`);
  
  const createdCreatives = [];
  for (const creativeConfig of adCreatives) {
    const creativeId = await createAdCreative(creativeConfig);
    if (creativeId) {
      createdCreatives.push({
        id: creativeId,
        name: creativeConfig.name,
        config: creativeConfig
      });
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Step 3: Create ads (distribute creatives across ad sets)
  console.log(`📢 Creating ads...`);
  
  for (let i = 0; i < createdAdSets.length; i++) {
    const adSet = createdAdSets[i];
    const creative = createdCreatives[i % createdCreatives.length];
    
    if (adSet && creative) {
      const adConfig = {
        name: `${adSet.name} - ${creative.name}`
      };
      
      const adId = await createAd(adSet.id, creative.id, adConfig);
      if (adId) {
        createdAds.push({
          id: adId,
          name: adConfig.name,
          adSetId: adSet.id,
          creativeId: creative.id
        });
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,
    adSets: createdAdSets,
    creatives: createdCreatives,
    ads: createdAds
  };
}

async function main() {
  console.log('🚀 Setting up complete LEADS campaigns with ad sets and ads...\n');
  
  const results = [];
  
  for (const campaign of LEADS_CAMPAIGNS) {
    const result = await setupLeadsCampaign(campaign);
    if (result) {
      results.push(result);
    }
    
    // Wait 5 seconds between campaigns
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log('\n🎉 LEADS Campaign Setup Summary:');
  console.log('=================================');
  
  results.forEach((result, index) => {
    console.log(`\n📊 ${result.campaignName}:`);
    console.log(`   - Ad sets created: ${result.adSets.length}`);
    console.log(`   - Ad creatives created: ${result.creatives.length}`);
    console.log(`   - Ads created: ${result.ads.length}`);
    
    console.log(`\n   📋 Ad Sets:`);
    result.adSets.forEach(adSet => {
      console.log(`      ✅ ${adSet.name} (ID: ${adSet.id})`);
    });
    
    console.log(`\n   🎨 Ad Creatives:`);
    result.creatives.forEach(creative => {
      console.log(`      ✅ ${creative.name} (ID: ${creative.id})`);
    });
    
    console.log(`\n   📢 Ads:`);
    result.ads.forEach(ad => {
      console.log(`      ✅ ${ad.name} (ID: ${ad.id})`);
    });
  });
  
  console.log('\n📝 Next steps:');
  console.log('1. Review all campaigns in Facebook Ads Manager');
  console.log('2. Set up lead forms for each campaign');
  console.log('3. Configure conversion tracking');
  console.log('4. Review and approve ad creatives');
  console.log('5. Activate campaigns when ready');
  console.log('\n⚠️  All campaigns, ad sets, and ads are set to PAUSED for safety!');
}

main().catch(console.error);
