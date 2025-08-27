const http = require('http');

console.log('🧪 Testing Auto-Refresh API...\n');

// Test the auto-refresh API
const testAutoRefresh = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/facebook/auto-refresh-analytics',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

// Test the API
testAutoRefresh()
  .then(({ status, data }) => {
    console.log(`✅ Status: ${status}`);
    console.log(`📅 Date Range: ${data.meta?.dateRange || 'N/A'}`);
    console.log(`🕒 Last Updated: ${data.meta?.lastUpdated || 'N/A'}`);
    console.log(`🔄 Auto Refresh: ${data.meta?.autoRefresh || 'N/A'}`);
    
    if (data.success) {
      console.log('\n📊 Summary:');
      console.log(`   Total Spend: €${data.data.summary.totalSpend.toFixed(2)}`);
      console.log(`   Total Clicks: ${data.data.summary.totalClicks.toLocaleString()}`);
      console.log(`   Total Impressions: ${data.data.summary.totalImpressions.toLocaleString()}`);
      console.log(`   Total Conversions: ${data.data.summary.totalConversions}`);
      console.log(`   Active Campaigns: ${data.data.summary.activeCampaigns}`);
      
      console.log('\n🎯 Campaigns with Conversions:');
      data.data.campaigns.forEach(campaign => {
        if (campaign.conversions > 0) {
          console.log(`   ${campaign.name}: ${campaign.conversions} conversions (€${campaign.spend.toFixed(2)})`);
        }
      });
      
      console.log('\n✅ Auto-refresh API working correctly!');
    } else {
      console.error('❌ API failed:', data.error);
      if (data.details) {
        console.error('Details:', data.details);
      }
    }
  })
  .catch((error) => {
    console.error('❌ Test failed:', error.message);
  });
