const http = require('http');

async function testFacebookDataFixes() {
  try {
    console.log('🧪 Testing Facebook data fixes...\n');

    // Test the campaigns API
    console.log('1. Testing campaigns API...');
    const campaignsResult = await makeRequest('/api/facebook/get-campaigns', 'GET');
    
    if (campaignsResult.success) {
      console.log('✅ Campaigns API successful');
      console.log(`   Found ${campaignsResult.data?.length || 0} campaigns\n`);
      
      campaignsResult.data?.forEach((campaign, index) => {
        console.log(`   Campaign ${index + 1}: ${campaign.name}`);
        console.log(`      Status: ${campaign.status}`);
        console.log(`      Impressions: ${campaign.impressions}`);
        console.log(`      Clicks: ${campaign.clicks}`);
        console.log(`      CTR: ${campaign.ctr} (${(campaign.ctr * 100).toFixed(2)}%)`);
        console.log(`      CPC: €${campaign.cpc}`);
        console.log(`      Spent: €${campaign.spent}`);
        console.log(`      Budget: €${campaign.budget}`);
        console.log(`      Daily Budget: €${campaign.dailyBudget}\n`);
      });
    } else {
      console.error('❌ Campaigns API failed:', campaignsResult.error);
    }

    // Test the comprehensive analytics API
    console.log('2. Testing comprehensive analytics API...');
    const analyticsResult = await makeRequest('/api/facebook/comprehensive-analytics?useManualData=true', 'GET');
    
    if (analyticsResult.success) {
      console.log('✅ Analytics API successful');
      console.log('📊 Summary data:');
      console.log(`   Total Impressions: ${analyticsResult.data.summary.totalImpressions}`);
      console.log(`   Total Clicks: ${analyticsResult.data.summary.totalClicks}`);
      console.log(`   Total Spend: €${analyticsResult.data.summary.totalSpend}`);
      console.log(`   Average CTR: ${analyticsResult.data.summary.averageCTR} (${(analyticsResult.data.summary.averageCTR * 100).toFixed(2)}%)`);
      console.log(`   Average CPC: €${analyticsResult.data.summary.averageCPC}\n`);
      
      console.log('📋 Campaign details:');
      analyticsResult.data.campaigns?.forEach((campaign, index) => {
        console.log(`   ${index + 1}. ${campaign.name}`);
        console.log(`      Clicks: ${campaign.clicks}`);
        console.log(`      Spend: €${campaign.spend}`);
        console.log(`      CTR: ${campaign.ctr} (${(campaign.ctr * 100).toFixed(2)}%)`);
        console.log(`      CPC: €${campaign.cpc}\n`);
      });
    } else {
      console.error('❌ Analytics API failed:', analyticsResult.error);
    }

    // Test the conversie overzicht page data
    console.log('3. Testing conversie overzicht data...');
    const leadsResult = await makeRequest('/api/prelaunch-leads', 'GET');
    
    if (leadsResult.success) {
      console.log('✅ Leads API successful');
      console.log(`   Total leads: ${leadsResult.leads?.length || 0}`);
      
      // Filter test leads
      const filteredLeads = leadsResult.leads?.filter(lead => 
        !lead.email.includes('@media2net.nl') && 
        !lead.email.includes('@test.com') &&
        !lead.email.includes('admin@test.com')
      ) || [];
      
      console.log(`   Filtered leads: ${filteredLeads.length}`);
      
      // Count Facebook ad leads
      const facebookAdLeads = filteredLeads.filter(lead => 
        lead.notes && lead.notes.includes('Campaign:') && !lead.notes.includes('Campaign: test')
      );
      
      console.log(`   Facebook ad leads: ${facebookAdLeads.length}`);
      console.log(`   Organic leads: ${filteredLeads.length - facebookAdLeads.length}\n`);
    } else {
      console.error('❌ Leads API failed:', leadsResult.error);
    }

    console.log('🎉 Facebook data fixes test completed!');

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

testFacebookDataFixes();
