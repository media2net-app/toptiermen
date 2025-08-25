const http = require('http');

async function testCampaignsPage() {
  try {
    console.log('🧪 Testing campaigns page data...\n');

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

    console.log('🎉 Campaigns page test completed!');

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

testCampaignsPage();
