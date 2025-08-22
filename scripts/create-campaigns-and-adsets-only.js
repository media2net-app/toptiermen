require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID || 'act_1465834431278978';

if (!FACEBOOK_ACCESS_TOKEN) {
  console.error('❌ Missing FACEBOOK_ACCESS_TOKEN environment variable');
  process.exit(1);
}

console.log(`📊 Using Ad Account ID: ${FACEBOOK_AD_ACCOUNT_ID}`);

// Facebook page ID
const FACEBOOK_PAGE_ID = '610571295471584'; // Top Tier Men

console.log(`📊 Facebook Page ID: ${FACEBOOK_PAGE_ID}`);

// All campaign configurations (campaigns and ad sets only, no creatives)
const ALL_CAMPAIGNS = {
  algemene: {
    name: 'TTM - Algemene Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    campaign_daily_budget: 25, // 5 x €5
    ad_sets: [
      {
        name: 'TTM - Algemeen - Prelaunch Awareness',
        daily_budget: 5,
        targeting: {
          age_min: 18,
          age_max: 65,
          genders: ['all'],
          locations: ['NL', 'BE'],
          interests: ['6003384248805', '6003277229371', '6003392552125', '6003748928462'],
          behaviors: []
        }
      },
      {
        name: 'TTM - Algemeen - Fitness Community',
        daily_budget: 5,
        targeting: {
          age_min: 25,
          age_max: 55,
          genders: ['men'],
          locations: ['NL'],
          interests: ['6003384248805', '6003283387551', '6009986890906', '6003648059946', '6003092532417'],
          behaviors: []
        }
      },
      {
        name: 'TTM - Algemeen - Lifestyle Upgrade',
        daily_budget: 5,
        targeting: {
          age_min: 30,
          age_max: 50,
          genders: ['all'],
          locations: ['NL', 'BE', 'DE'],
          interests: ['6003392552125', '6003748928462', '6003400407018', '6002991059568'],
          behaviors: []
        }
      },
      {
        name: 'TTM - Algemeen - Business Professionals',
        daily_budget: 5,
        targeting: {
          age_min: 28,
          age_max: 45,
          genders: ['all'],
          locations: ['NL'],
          interests: ['6003352779232', '6003396973683', '6003120739217', '6004000198906'],
          behaviors: []
        }
      },
      {
        name: 'TTM - Algemeen - Community Building',
        daily_budget: 5,
        targeting: {
          age_min: 22,
          age_max: 40,
          genders: ['all'],
          locations: ['NL', 'BE'],
          interests: ['6003651640946', '6002929355372', '6004100985609'],
          behaviors: []
        }
      }
    ]
  },
  jongeren: {
    name: 'TTM - Jongeren Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    campaign_daily_budget: 10, // 2 x €5
    ad_sets: [
      {
        name: 'TTM - Jongeren - Fitness & Lifestyle',
        daily_budget: 5,
        targeting: {
          age_min: 18,
          age_max: 25,
          genders: ['all'],
          locations: ['NL', 'BE'],
          interests: ['6003384248805', '6003277229371', '6009986890906', '6002929355372', '6004100985609'],
          behaviors: []
        }
      },
      {
        name: 'TTM - Jongeren - Social & Community',
        daily_budget: 5,
        targeting: {
          age_min: 18,
          age_max: 25,
          genders: ['all'],
          locations: ['NL'],
          interests: ['6003651640946', '6002929355372', '6004100985609', '6003392552125'],
          behaviors: []
        }
      }
    ]
  },
  vaders: {
    name: 'TTM - Vaders Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    campaign_daily_budget: 10, // 2 x €5
    ad_sets: [
      {
        name: 'TTM - Vaders - Family & Leadership',
        daily_budget: 5,
        targeting: {
          age_min: 30,
          age_max: 50,
          genders: ['men'],
          locations: ['NL', 'BE'],
          interests: ['6002929355372', '6004100985609', '6003384248805', '6003277229371'],
          behaviors: []
        }
      },
      {
        name: 'TTM - Vaders - Role Model & Success',
        daily_budget: 5,
        targeting: {
          age_min: 35,
          age_max: 55,
          genders: ['men'],
          locations: ['NL'],
          interests: ['6003651640946', '6002929355372', '6004100985609', '6003392552125'],
          behaviors: []
        }
      }
    ]
  },
  zakelijk: {
    name: 'TTM - Zakelijk Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    campaign_daily_budget: 10, // 2 x €5
    ad_sets: [
      {
        name: 'TTM - Zakelijk - Business Professionals',
        daily_budget: 5,
        targeting: {
          age_min: 28,
          age_max: 45,
          genders: ['all'],
          locations: ['NL', 'BE'],
          interests: ['6003651640946', '6002929355372', '6004100985609', '6003392552125'],
          behaviors: []
        }
      },
      {
        name: 'TTM - Zakelijk - Entrepreneurs & Leaders',
        daily_budget: 5,
        targeting: {
          age_min: 30,
          age_max: 50,
          genders: ['all'],
          locations: ['NL'],
          interests: ['6003384248805', '6003277229371', '6009986890906', '6002929355372'],
          behaviors: []
        }
      }
    ]
  }
};

async function createCampaignsAndAdSetsOnly() {
  console.log('🚀 Creating All 4 Campaigns to Facebook (Campaigns & Ad Sets Only)...\n');
  console.log(`📊 Ad Account ID: ${FACEBOOK_AD_ACCOUNT_ID}\n`);

  try {
    console.log('📝 Only campaigns and ad sets will be created\n');
    console.log('💡 You will need to add ad creatives manually in Facebook Ads Manager\n');

    console.log('\n' + '='.repeat(80));
    console.log('📊 CREATING CAMPAIGNS TO FACEBOOK');
    console.log('='.repeat(80));

    const results = {};

    // Create each campaign
    for (const [campaignKey, campaignData] of Object.entries(ALL_CAMPAIGNS)) {
      console.log(`\n🎯 Creating ${campaignKey.toUpperCase()} campaign...`);
      
      console.log(`📊 Campaign: ${campaignData.name}`);
      console.log(`💰 Total Budget: €${campaignData.campaign_daily_budget}`);
      console.log(`📊 Ad Sets: ${campaignData.ad_sets.length}`);

      try {
        // Step 1: Create campaign
        const campaignPayload = {
          name: campaignData.name,
          objective: campaignData.objective,
          status: campaignData.status,
          special_ad_categories: [],
          ad_account_id: FACEBOOK_AD_ACCOUNT_ID
        };

        const campaignResponse = await fetch(
          `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaignPayload)
          }
        );

        if (!campaignResponse.ok) {
          const errorData = await campaignResponse.json();
          throw new Error(`Campaign creation failed: ${JSON.stringify(errorData)}`);
        }

        const campaign = await campaignResponse.json();
        console.log(`✅ Campaign created: ${campaign.id}`);

        // Step 2: Create ad sets
        const adSets = [];
        for (let i = 0; i < campaignData.ad_sets.length; i++) {
          const adSetConfig = campaignData.ad_sets[i];
          
          // Map gender strings to integers
          const genderMap = { 'all': 0, 'men': 1, 'women': 2 };
          const genders = adSetConfig.targeting.genders.map(g => genderMap[g]);

          const adSetPayload = {
            name: adSetConfig.name,
            campaign_id: campaign.id,
            daily_budget: adSetConfig.daily_budget * 100, // Convert to cents
            bid_amount: Math.floor(adSetConfig.daily_budget * 50 * 100), // Convert to cents
            billing_event: 'IMPRESSIONS',
            optimization_goal: 'LINK_CLICKS',
            targeting: {
              age_min: adSetConfig.targeting.age_min,
              age_max: adSetConfig.targeting.age_max,
              genders: genders,
              geo_locations: {
                countries: adSetConfig.targeting.locations
              },
              ...(adSetConfig.targeting.interests.length > 0 && {
                interests: adSetConfig.targeting.interests.map(id => ({ id }))
              }),
              ...(adSetConfig.targeting.behaviors.length > 0 && {
                behaviors: adSetConfig.targeting.behaviors.map(id => ({ id }))
              })
            },
                         status: 'PAUSED',
             dsa_beneficiary: 'Top Tier Men',
             dsa_payor: 'Top Tier Men',
             targeting_automation: { advantage_audience: 0 }
          };

          const adSetResponse = await fetch(
            `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(adSetPayload)
            }
          );

          if (!adSetResponse.ok) {
            const errorData = await adSetResponse.json();
            throw new Error(`Ad Set creation failed: ${JSON.stringify(errorData)}`);
          }

          const adSet = await adSetResponse.json();
          adSets.push(adSet);
          console.log(`✅ Ad Set created: ${adSet.id} - ${adSetConfig.name}`);

          // Wait a bit between ad sets to avoid rate limiting
          if (i < campaignData.ad_sets.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        results[campaignKey] = {
          success: true,
          campaign: campaign,
          adSets: adSets
        };

        console.log(`✅ ${campaignKey} campaign completed successfully!`);
        console.log(`📊 Campaign ID: ${campaign.id}`);
        console.log(`📊 Ad Sets: ${adSets.length}`);

      } catch (error) {
        console.error(`❌ ${campaignKey} campaign creation failed:`, error.message);
        results[campaignKey] = {
          success: false,
          error: error.message
        };
      }

      // Wait a bit between campaigns to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(80));

    const successfulCampaigns = Object.values(results).filter(r => r.success).length;
    const totalBudget = Object.values(ALL_CAMPAIGNS).reduce((sum, campaign) => sum + campaign.campaign_daily_budget, 0);

    console.log(`\n🎉 Campaigns created: ${successfulCampaigns}/4`);
    console.log(`💰 Total daily budget: €${totalBudget}`);
    console.log(`📊 Total ad sets: ${Object.values(ALL_CAMPAIGNS).reduce((sum, campaign) => sum + campaign.ad_sets.length, 0)}`);

    console.log('\n📊 Campaign Details:');
    Object.entries(results).forEach(([campaignKey, result]) => {
      if (result.success) {
        console.log(`✅ ${campaignKey}: ${result.campaign.name} (ID: ${result.campaign.id})`);
        console.log(`   📊 Ad Sets: ${result.adSets.length}`);
        result.adSets.forEach(adSet => {
          console.log(`   - ${adSet.name} (ID: ${adSet.id})`);
        });
      } else {
        console.log(`❌ ${campaignKey}: Failed - ${result.error}`);
      }
    });

    console.log('\n🔧 Next steps:');
    console.log('1. Go to Facebook Ads Manager');
    console.log('2. Find the created campaigns and ad sets');
    console.log('3. Add ad creatives manually to each ad set');
    console.log('4. Link the Facebook page (Top Tier Men) to ad creatives');
    console.log('5. Add images or videos to the ad creatives');
    console.log('6. Set the landing page URL: https://platform.toptiermen.eu/prelaunch');
    console.log('7. Activate campaigns when ready');
    console.log('8. Monitor performance and adjust as needed');
    console.log('9. Focus on email collection for the prelaunch waitlist');

    console.log('\n📋 Manual Setup Instructions:');
    console.log('For each ad set, create ad creatives with:');
    console.log('- Facebook Page: Top Tier Men (610571295471584)');
    console.log('- Landing Page: https://platform.toptiermen.eu/prelaunch');
    console.log('- Call-to-Action: Sign Up, Learn More, or Contact Us');
    console.log('- Images: Use your video thumbnails or brand images');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createCampaignsAndAdSetsOnly()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
