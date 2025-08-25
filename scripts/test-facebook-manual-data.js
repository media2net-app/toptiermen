const http = require('http');

async function testFacebookManualData() {
  try {
    console.log('🧪 Testing Facebook manual data API...\n');

    // Test with manual data enabled
    console.log('1. Testing with useManualData=true...');
    const manualResult = await makeRequest('/api/facebook/comprehensive-analytics?useManualData=true', 'GET');
    
    if (manualResult.success) {
      console.log('✅ Manual data API successful');
      console.log('📊 Summary data:');
      console.log(`   Total Impressions: ${manualResult.data.summary.totalImpressions}`);
      console.log(`   Total Clicks: ${manualResult.data.summary.totalClicks}`);
      console.log(`   Total Spend: €${manualResult.data.summary.totalSpend}`);
      console.log(`   Total Reach: ${manualResult.data.summary.totalReach}`);
      console.log(`   Average CTR: ${manualResult.data.summary.averageCTR.toFixed(2)}%`);
      console.log(`   Average CPC: €${manualResult.data.summary.averageCPC.toFixed(2)}`);
      console.log(`   Active Campaigns: ${manualResult.data.summary.activeCampaigns}\n`);

      console.log('📋 Campaign details:');
      manualResult.data.campaigns.forEach((campaign, index) => {
        console.log(`   ${index + 1}. ${campaign.name}`);
        console.log(`      Clicks: ${campaign.clicks}`);
        console.log(`      Spend: €${campaign.spend}`);
        console.log(`      Impressions: ${campaign.impressions}`);
        console.log(`      CTR: ${campaign.ctr.toFixed(2)}%`);
        console.log(`      CPC: €${campaign.cpc.toFixed(2)}\n`);
      });

      // Calculate totals to verify
      const calculatedTotalSpend = manualResult.data.campaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
      const calculatedTotalClicks = manualResult.data.campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
      
      console.log('🔍 Verification:');
      console.log(`   Calculated Total Spend: €${calculatedTotalSpend.toFixed(2)}`);
      console.log(`   API Total Spend: €${manualResult.data.summary.totalSpend.toFixed(2)}`);
      console.log(`   Calculated Total Clicks: ${calculatedTotalClicks}`);
      console.log(`   API Total Clicks: ${manualResult.data.summary.totalClicks}`);
      
      if (Math.abs(calculatedTotalSpend - manualResult.data.summary.totalSpend) < 0.01) {
        console.log('✅ Spend calculation matches');
      } else {
        console.log('❌ Spend calculation mismatch');
      }
      
      if (calculatedTotalClicks === manualResult.data.summary.totalClicks) {
        console.log('✅ Clicks calculation matches');
      } else {
        console.log('❌ Clicks calculation mismatch');
      }

    } else {
      console.error('❌ Manual data API failed:', manualResult.error);
    }

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

testFacebookManualData();
