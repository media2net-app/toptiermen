const http = require('http');

async function testCampaignsPageData() {
  try {
    console.log('🧪 Testing campaigns page data display...\n');

    // Test the campaigns API
    console.log('1. Testing campaigns API...');
    const campaignsResult = await makeRequest('/api/facebook/get-campaigns', 'GET');
    
    if (campaignsResult.success) {
      console.log('✅ Campaigns API successful');
      console.log(`   Found ${campaignsResult.data?.length || 0} campaigns\n`);
      
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalSpent = 0;
      let activeCampaigns = 0;
      let pausedCampaigns = 0;
      
      campaignsResult.data?.forEach((campaign, index) => {
        console.log(`   Campaign ${index + 1}: ${campaign.name}`);
        console.log(`      Status: ${campaign.status}`);
        console.log(`      Objective: ${campaign.objective}`);
        console.log(`      Impressions: ${campaign.impressions.toLocaleString()}`);
        console.log(`      Clicks: ${campaign.clicks.toLocaleString()}`);
        console.log(`      CTR: ${(campaign.ctr * 100).toFixed(2)}%`);
        console.log(`      CPC: €${campaign.cpc.toFixed(3)}`);
        console.log(`      Spent: €${campaign.spent.toFixed(2)}`);
        console.log(`      Budget: €${campaign.budget}`);
        console.log(`      Daily Budget: €${campaign.dailyBudget}\n`);
        
        // Calculate totals
        totalImpressions += campaign.impressions;
        totalClicks += campaign.clicks;
        totalSpent += campaign.spent;
        
        if (campaign.status === 'active') {
          activeCampaigns++;
        } else if (campaign.status === 'paused') {
          pausedCampaigns++;
        }
      });
      
      console.log('📊 Summary:');
      console.log(`   Total Campaigns: ${campaignsResult.data?.length || 0}`);
      console.log(`   Active Campaigns: ${activeCampaigns}`);
      console.log(`   Paused Campaigns: ${pausedCampaigns}`);
      console.log(`   Total Impressions: ${totalImpressions.toLocaleString()}`);
      console.log(`   Total Clicks: ${totalClicks.toLocaleString()}`);
      console.log(`   Total Spent: €${totalSpent.toFixed(2)}`);
      console.log(`   Average CTR: ${totalClicks > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'}%`);
      console.log(`   Average CPC: €${totalClicks > 0 ? (totalSpent / totalClicks).toFixed(3) : '0.000'}\n`);
      
    } else {
      console.error('❌ Campaigns API failed:', campaignsResult.error);
    }

    // Test the comprehensive analytics API to compare
    console.log('2. Testing comprehensive analytics API for comparison...');
    const analyticsResult = await makeRequest('/api/facebook/comprehensive-analytics?useManualData=true', 'GET');
    
    if (analyticsResult.success) {
      console.log('✅ Analytics API successful');
      console.log(`   Found ${analyticsResult.data.campaigns?.length || 0} campaigns in analytics\n`);
      
      // Compare campaign counts
      const campaignsCount = campaignsResult.data?.length || 0;
      const analyticsCount = analyticsResult.data.campaigns?.length || 0;
      
      console.log('🔍 Comparison:');
      console.log(`   Campaigns API: ${campaignsCount} campaigns`);
      console.log(`   Analytics API: ${analyticsCount} campaigns`);
      console.log(`   Match: ${campaignsCount === analyticsCount ? '✅' : '❌'}\n`);
      
      if (campaignsCount !== analyticsCount) {
        console.log('⚠️  Warning: Campaign counts do not match!');
        console.log('   This might indicate inconsistent data between APIs.\n');
      }
    } else {
      console.error('❌ Analytics API failed:', analyticsResult.error);
    }

    // Test the ad sets API
    console.log('3. Testing ad sets API...');
    const adSetsResult = await makeRequest('/api/facebook/get-adsets', 'GET');
    
    if (adSetsResult.success) {
      console.log('✅ Ad Sets API successful');
      console.log(`   Found ${adSetsResult.data?.length || 0} ad sets\n`);
      
      // Count ad sets per campaign
      const adSetsPerCampaign = {};
      adSetsResult.data?.forEach(adSet => {
        const campaignId = adSet.campaign_id;
        adSetsPerCampaign[campaignId] = (adSetsPerCampaign[campaignId] || 0) + 1;
      });
      
      console.log('📋 Ad Sets per Campaign:');
      Object.entries(adSetsPerCampaign).forEach(([campaignId, count]) => {
        console.log(`   Campaign ${campaignId}: ${count} ad sets`);
      });
    } else {
      console.error('❌ Ad Sets API failed:', adSetsResult.error);
    }

    // Test the ads API
    console.log('\n4. Testing ads API...');
    const adsResult = await makeRequest('/api/facebook/get-ads', 'GET');
    
    if (adsResult.success) {
      console.log('✅ Ads API successful');
      console.log(`   Found ${adsResult.data?.length || 0} ads\n`);
      
      // Count ads per ad set
      const adsPerAdSet = {};
      adsResult.data?.forEach(ad => {
        const adSetId = ad.adset_id;
        adsPerAdSet[adSetId] = (adsPerAdSet[adSetId] || 0) + 1;
      });
      
      console.log('📋 Ads per Ad Set:');
      Object.entries(adsPerAdSet).forEach(([adSetId, count]) => {
        console.log(`   Ad Set ${adSetId}: ${count} ads`);
      });
    } else {
      console.error('❌ Ads API failed:', adsResult.error);
    }

    console.log('\n🎉 Campaigns page data test completed!');
    console.log('\n📝 Expected Results:');
    console.log('   - 5 total campaigns (4 active, 1 paused)');
    console.log('   - Real impression, click, and spend data');
    console.log('   - Correct CTR and CPC values');
    console.log('   - 11 ad sets and 11 ads total');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function makeRequest(path, method) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(responseData);
            resolve(result);
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

testCampaignsPageData();
