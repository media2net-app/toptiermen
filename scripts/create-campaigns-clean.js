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

// Campaign configurations (campaigns only, no ad sets)
const ALL_CAMPAIGNS = [
  {
    name: 'TTM - Algemene Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    daily_budget: 2500 // €25 in cents
  },
  {
    name: 'TTM - Jongeren Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    daily_budget: 1000 // €10 in cents
  },
  {
    name: 'TTM - Vaders Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    daily_budget: 1000 // €10 in cents
  },
  {
    name: 'TTM - Zakelijk Prelaunch Campagne',
    objective: 'OUTCOME_TRAFFIC',
    status: 'PAUSED',
    daily_budget: 1000 // €10 in cents
  }
];

async function cleanupOldCampaigns() {
  console.log('🧹 Cleaning up old campaigns before creating new ones...\n');

  try {
    // Get all existing campaigns
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${FACEBOOK_AD_ACCOUNT_ID}/campaigns?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,status&limit=100`
    );

    if (!campaignsResponse.ok) {
      const errorData = await campaignsResponse.json();
      throw new Error(`Failed to fetch campaigns: ${JSON.stringify(errorData)}`);
    }

    const campaignsData = await campaignsResponse.json();
    const campaigns = campaignsData.data || [];

    if (campaigns.length === 0) {
      console.log('✅ No existing campaigns found');
      return;
    }

    console.log(`📊 Found ${campaigns.length} existing campaigns to clean up:`);
    campaigns.forEach(campaign => {
      console.log(`   - ${campaign.name} (ID: ${campaign.id}, Status: ${campaign.status})`);
    });

    // Delete all existing campaigns
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

async function createCleanCampaigns() {
  console.log('🚀 Creating 4 Clean Campaigns to Facebook...\n');
  console.log(`📊 Ad Account ID: ${FACEBOOK_AD_ACCOUNT_ID}\n`);

  try {
    // Step 1: Clean up old campaigns
    await cleanupOldCampaigns();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 CREATING NEW CAMPAIGNS');
    console.log('='.repeat(80));

    const results = [];

    // Step 2: Create each campaign
    for (let i = 0; i < ALL_CAMPAIGNS.length; i++) {
      const campaignData = ALL_CAMPAIGNS[i];
      
      console.log(`\n🎯 Creating campaign ${i + 1}/4: ${campaignData.name}`);
      console.log(`💰 Daily Budget: €${campaignData.daily_budget / 100}`);
      console.log(`📊 Objective: ${campaignData.objective}`);
      console.log(`📊 Status: ${campaignData.status}`);

      try {
        const campaignPayload = {
          name: campaignData.name,
          objective: campaignData.objective,
          status: campaignData.status,
          special_ad_categories: [],
          daily_budget: campaignData.daily_budget
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
        console.log(`✅ Campaign created successfully!`);
        console.log(`📊 Campaign ID: ${campaign.id}`);
        console.log(`📊 Campaign Name: ${campaign.name}`);

        results.push({
          success: true,
          campaign: campaign
        });

      } catch (error) {
        console.error(`❌ Campaign creation failed:`, error.message);
        results.push({
          success: false,
          error: error.message,
          name: campaignData.name
        });
      }

      // Wait a bit between campaigns to avoid rate limiting
      if (i < ALL_CAMPAIGNS.length - 1) {
        console.log('⏳ Waiting 2 seconds before next campaign...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL RESULTS');
    console.log('='.repeat(80));

    const successfulCampaigns = results.filter(r => r.success).length;
    const totalBudget = ALL_CAMPAIGNS.reduce((sum, campaign) => sum + campaign.daily_budget, 0) / 100;

    console.log(`\n🎉 Campaigns created: ${successfulCampaigns}/4`);
    console.log(`💰 Total daily budget: €${totalBudget}`);

    console.log('\n📊 Campaign Details:');
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`✅ ${index + 1}. ${result.campaign.name} (ID: ${result.campaign.id})`);
      } else {
        console.log(`❌ ${index + 1}. ${result.name}: Failed - ${result.error}`);
      }
    });

    console.log('\n🔧 Next steps:');
    console.log('1. Go to Facebook Ads Manager');
    console.log('2. Find the created campaigns');
    console.log('3. For each campaign, add ad sets manually');
    console.log('4. For each ad set, add ad creatives manually');
    console.log('5. Upload videos from advertentie materiaal section');
    console.log('6. Link the Facebook page (Top Tier Men) to ad creatives');
    console.log('7. Set the landing page URL: https://platform.toptiermen.eu/prelaunch');
    console.log('8. Activate campaigns when ready');
    console.log('9. Monitor performance and adjust as needed');
    console.log('10. Focus on email collection for the prelaunch waitlist');

    console.log('\n📋 Manual Setup Instructions:');
    console.log('For each campaign, create ad sets with:');
    console.log('- Daily budget: €5 per ad set');
    console.log('- Targeting: Age, location, interests (see below)');
    console.log('- Optimization goal: Link Clicks');
    console.log('- Billing event: Impressions');
    console.log('- DSA Beneficiary: Top Tier Men');
    console.log('- DSA Payor: Top Tier Men');

    console.log('\n📋 Ad Set Targeting:');
    console.log('Algemene (5 ad sets):');
    console.log('  • Age: 18-65, All genders, NL/BE');
    console.log('  • Interests: Fitness, lifestyle, community');
    console.log('Jongeren (2 ad sets):');
    console.log('  • Age: 18-25, All genders, NL/BE');
    console.log('  • Interests: Fitness, social media, community');
    console.log('Vaders (2 ad sets):');
    console.log('  • Age: 30-55, Men, NL/BE');
    console.log('  • Interests: Family, leadership, fitness');
    console.log('Zakelijk (2 ad sets):');
    console.log('  • Age: 28-50, All genders, NL/BE');
    console.log('  • Interests: Business, entrepreneurship, leadership');

    console.log('\n📋 Ad Creative Setup:');
    console.log('- Facebook Page: Top Tier Men (610571295471584)');
    console.log('- Landing Page: https://platform.toptiermen.eu/prelaunch');
    console.log('- Call-to-Action: Sign Up, Learn More, or Contact Us');
    console.log('- Videos: Use videos from advertentie materiaal section');
    console.log('- Video mapping:');
    console.log('  • Algemeen: algemeen_01, algemeen_02, algemeen_03, algemeen_04, algemeen_05');
    console.log('  • Jongeren: jongeren_01, jongeren_02');
    console.log('  • Vaders: vaders_01, vaders_02');
    console.log('  • Zakelijk: zakelijk_01, zakelijk_02');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createCleanCampaigns()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
