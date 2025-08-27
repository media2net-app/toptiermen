const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_AD_ACCOUNT_ID = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_AD_ACCOUNT_ID) {
  console.error('❌ Missing Facebook credentials in .env.local');
  process.exit(1);
}

// Active campaigns to analyze
const ACTIVE_CAMPAIGNS = [
  {
    name: 'TTM - Zakelijk Prelaunch Campagne',
    id: '120232181493720324'
  },
  {
    name: 'TTM - Vaders Prelaunch Campagne', 
    id: '120232181491490324'
  },
  {
    name: 'TTM - Jongeren Prelaunch Campagne',
    id: '120232181487970324'
  },
  {
    name: 'TTM - Algemene Prelaunch Campagne',
    id: '120232181480080324'
  }
];

// New LEADS campaigns to improve
const NEW_LEADS_CAMPAIGNS = [
  {
    name: 'TTM - Zakelijk Prelaunch Campagne - LEADS',
    id: '120232394476410324'
  },
  {
    name: 'TTM - Vaders Prelaunch Campagne - LEADS', 
    id: '120232394477760324'
  },
  {
    name: 'TTM - Jongeren Prelaunch Campagne - LEADS',
    id: '120232394479720324'
  },
  {
    name: 'TTM - Algemene Prelaunch Campagne - LEADS',
    id: '120232394482520324'
  }
];

async function analyzeCampaignTargeting(campaignId, campaignName) {
  console.log(`\n🔍 Analyzing targeting for: ${campaignName}`);
  
  try {
    // Get ad sets with targeting
    const adSetsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${campaignId}/adsets?access_token=${FACEBOOK_ACCESS_TOKEN}&fields=id,name,targeting,daily_budget,lifetime_budget,bid_amount,bid_strategy,optimization_goal,start_time,end_time,status,insights{impressions,clicks,spend,reach,frequency,ctr,cpc,cpm}&limit=100`
    );

    if (!adSetsResponse.ok) {
      const errorText = await adSetsResponse.text();
      console.error(`❌ Failed to fetch ad sets for ${campaignName}:`, errorText);
      return null;
    }

    const adSetsData = await adSetsResponse.json();
    console.log(`📋 Found ${adSetsData.data?.length || 0} ad sets`);

    const analysis = {
      campaignName,
      campaignId,
      adSets: [],
      totalImpressions: 0,
      totalClicks: 0,
      totalSpend: 0,
      bestPerformingAdSets: []
    };

    for (const adSet of adSetsData.data || []) {
      const insights = adSet.insights?.data?.[0];
      const impressions = parseInt(insights?.impressions) || 0;
      const clicks = parseInt(insights?.clicks) || 0;
      const spend = parseFloat(insights?.spend) || 0;
      const ctr = parseFloat(insights?.ctr) || 0;
      const cpc = parseFloat(insights?.cpc) || 0;

      const adSetAnalysis = {
        id: adSet.id,
        name: adSet.name,
        targeting: adSet.targeting,
        status: adSet.status,
        dailyBudget: adSet.daily_budget,
        impressions,
        clicks,
        spend,
        ctr,
        cpc,
        performance: {
          score: (ctr * 100) + (clicks * 10) - (cpc * 100), // Simple performance score
          isHighPerforming: ctr > 0.05 && clicks > 10 // CTR > 5% and >10 clicks
        }
      };

      analysis.adSets.push(adSetAnalysis);
      analysis.totalImpressions += impressions;
      analysis.totalClicks += clicks;
      analysis.totalSpend += spend;

      if (adSetAnalysis.performance.isHighPerforming) {
        analysis.bestPerformingAdSets.push(adSetAnalysis);
      }

      console.log(`📊 Ad Set: ${adSet.name}`);
      console.log(`   - Impressions: ${impressions}`);
      console.log(`   - Clicks: ${clicks}`);
      console.log(`   - Spend: €${spend.toFixed(2)}`);
      console.log(`   - CTR: ${(ctr * 100).toFixed(2)}%`);
      console.log(`   - CPC: €${cpc.toFixed(2)}`);
      console.log(`   - Performance: ${adSetAnalysis.performance.isHighPerforming ? '✅ HIGH' : '⚠️ LOW'}`);
    }

    return analysis;

  } catch (error) {
    console.error(`❌ Error analyzing campaign ${campaignName}:`, error);
    return null;
  }
}

function createImprovedTargeting(originalTargeting, campaignType) {
  const improvedTargeting = { ...originalTargeting };

  // Base improvements for all campaigns
  improvedTargeting.age_min = 25;
  improvedTargeting.age_max = 55;
  improvedTargeting.genders = [1, 2]; // Both men and women
  improvedTargeting.flexible_spec = improvedTargeting.flexible_spec || [];

  // Campaign-specific improvements
  switch (campaignType) {
    case 'zakelijk':
      // Business professionals targeting
      improvedTargeting.interests = [
        ...(improvedTargeting.interests || []),
        { id: '6002714396372', name: 'Entrepreneurship' },
        { id: '6002714396373', name: 'Business' },
        { id: '6002714396374', name: 'Leadership' },
        { id: '6002714396375', name: 'Professional development' },
        { id: '6002714396376', name: 'Networking' }
      ];
      improvedTargeting.behaviors = [
        ...(improvedTargeting.behaviors || []),
        { id: '6002714396377', name: 'Business travelers' },
        { id: '6002714396378', name: 'Frequent international travelers' },
        { id: '6002714396379', name: 'High income earners' }
      ];
      improvedTargeting.income = ['6002714396380']; // High income
      break;

    case 'vaders':
      // Fathers and family men targeting
      improvedTargeting.family_statuses = [
        { id: '6002714396381', name: 'Parents' },
        { id: '6002714396382', name: 'Fathers' }
      ];
      improvedTargeting.interests = [
        ...(improvedTargeting.interests || []),
        { id: '6002714396383', name: 'Parenting' },
        { id: '6002714396384', name: 'Family' },
        { id: '6002714396385', name: 'Fatherhood' },
        { id: '6002714396386', name: 'Role model' },
        { id: '6002714396387', name: 'Personal development' }
      ];
      improvedTargeting.life_events = [
        { id: '6002714396388', name: 'New parents' },
        { id: '6002714396389', name: 'Recently married' }
      ];
      break;

    case 'jongeren':
      // Young professionals and students targeting
      improvedTargeting.age_min = 18;
      improvedTargeting.age_max = 35;
      improvedTargeting.interests = [
        ...(improvedTargeting.interests || []),
        { id: '6002714396390', name: 'Fitness' },
        { id: '6002714396391', name: 'Personal development' },
        { id: '6002714396392', name: 'Self-improvement' },
        { id: '6002714396393', name: 'Motivation' },
        { id: '6002714396394', name: 'Success' }
      ];
      improvedTargeting.behaviors = [
        ...(improvedTargeting.behaviors || []),
        { id: '6002714396395', name: 'Frequent gym-goers' },
        { id: '6002714396396', name: 'Fitness enthusiasts' }
      ];
      break;

    case 'algemeen':
      // General audience with broad appeal
      improvedTargeting.interests = [
        ...(improvedTargeting.interests || []),
        { id: '6002714396397', name: 'Self-improvement' },
        { id: '6002714396398', name: 'Personal development' },
        { id: '6002714396399', name: 'Motivation' },
        { id: '6002714396400', name: 'Success' },
        { id: '6002714396401', name: 'Fitness' },
        { id: '6002714396402', name: 'Health' },
        { id: '6002714396403', name: 'Wellness' }
      ];
      improvedTargeting.behaviors = [
        ...(improvedTargeting.behaviors || []),
        { id: '6002714396404', name: 'Frequent online shoppers' },
        { id: '6002714396405', name: 'Early adopters' }
      ];
      break;
  }

  // Add exclusions for better quality
  improvedTargeting.exclusions = {
    ...(improvedTargeting.exclusions || {}),
    behaviors: [
      ...((improvedTargeting.exclusions && improvedTargeting.exclusions.behaviors) || []),
      { id: '6002714396406', name: 'Unlikely to respond to ads' }
    ]
  };

  return improvedTargeting;
}

async function createImprovedAdSets(leadsCampaignId, campaignType, originalAdSets) {
  console.log(`\n🎯 Creating improved ad sets for ${campaignType} LEADS campaign`);
  
  const improvedAdSets = [];
  
  for (const originalAdSet of originalAdSets) {
    const improvedTargeting = createImprovedTargeting(originalAdSet.targeting, campaignType);
    const newAdSetName = `${originalAdSet.name} - LEADS - IMPROVED`;
    
    try {
      const createAdSetResponse = await fetch(
        `https://graph.facebook.com/v19.0/${leadsCampaignId}/adsets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: FACEBOOK_ACCESS_TOKEN,
            name: newAdSetName,
            campaign_id: leadsCampaignId,
            targeting: improvedTargeting,
            daily_budget: Math.max(originalAdSet.daily_budget || 5000, 10000), // Minimum €10 daily budget
            bid_amount: Math.max(originalAdSet.bid_amount || 200, 500), // Higher bid for LEADS
            bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
            optimization_goal: 'LEADS',
            status: 'PAUSED',
            start_time: Math.floor(Date.now() / 1000) + 3600
          })
        }
      );

      if (createAdSetResponse.ok) {
        const adSetData = await createAdSetResponse.json();
        console.log(`✅ Created improved ad set: ${newAdSetName} (ID: ${adSetData.id})`);
        improvedAdSets.push({
          name: newAdSetName,
          id: adSetData.id,
          targeting: improvedTargeting
        });
      } else {
        const errorText = await createAdSetResponse.text();
        console.error(`❌ Failed to create improved ad set ${newAdSetName}:`, errorText);
      }
      
      // Wait 1 second between ad sets
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error creating improved ad set ${newAdSetName}:`, error);
    }
  }
  
  return improvedAdSets;
}

async function main() {
  console.log('🚀 Analyzing existing campaigns and creating improved LEADS targeting...\n');
  
  const campaignAnalyses = [];
  
  // Step 1: Analyze existing campaigns
  for (const campaign of ACTIVE_CAMPAIGNS) {
    const analysis = await analyzeCampaignTargeting(campaign.id, campaign.name);
    if (analysis) {
      campaignAnalyses.push(analysis);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Step 2: Create improved ad sets for LEADS campaigns
  console.log('\n🎯 Creating improved ad sets for LEADS campaigns...\n');
  
  for (let i = 0; i < ACTIVE_CAMPAIGNS.length; i++) {
    const originalCampaign = ACTIVE_CAMPAIGNS[i];
    const leadsCampaign = NEW_LEADS_CAMPAIGNS[i];
    const analysis = campaignAnalyses[i];
    
    if (analysis && analysis.adSets.length > 0) {
      const campaignType = originalCampaign.name.toLowerCase().includes('zakelijk') ? 'zakelijk' :
                          originalCampaign.name.toLowerCase().includes('vaders') ? 'vaders' :
                          originalCampaign.name.toLowerCase().includes('jongeren') ? 'jongeren' : 'algemeen';
      
      const improvedAdSets = await createImprovedAdSets(
        leadsCampaign.id, 
        campaignType, 
        analysis.adSets
      );
      
      console.log(`\n📊 Summary for ${leadsCampaign.name}:`);
      console.log(`   - Original ad sets analyzed: ${analysis.adSets.length}`);
      console.log(`   - High-performing ad sets: ${analysis.bestPerformingAdSets.length}`);
      console.log(`   - Improved ad sets created: ${improvedAdSets.length}`);
      console.log(`   - Total impressions: ${analysis.totalImpressions}`);
      console.log(`   - Total clicks: ${analysis.totalClicks}`);
      console.log(`   - Total spend: €${analysis.totalSpend.toFixed(2)}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n🎉 Analysis and Improvement Summary:');
  console.log('=====================================');
  
  campaignAnalyses.forEach((analysis, index) => {
    console.log(`\n📊 ${analysis.campaignName}:`);
    console.log(`   - Total ad sets: ${analysis.adSets.length}`);
    console.log(`   - High performers: ${analysis.bestPerformingAdSets.length}`);
    console.log(`   - Total impressions: ${analysis.totalImpressions.toLocaleString()}`);
    console.log(`   - Total clicks: ${analysis.totalClicks.toLocaleString()}`);
    console.log(`   - Total spend: €${analysis.totalSpend.toFixed(2)}`);
    console.log(`   - Average CTR: ${analysis.totalClicks > 0 ? ((analysis.totalClicks / analysis.totalImpressions) * 100).toFixed(2) : 0}%`);
  });
  
  console.log('\n📝 Next steps:');
  console.log('1. Review the improved ad sets in Facebook Ads Manager');
  console.log('2. Create lead forms for each LEADS campaign');
  console.log('3. Create ad creatives optimized for lead generation');
  console.log('4. Set up conversion tracking');
  console.log('5. Activate campaigns when ready');
}

main().catch(console.error);
