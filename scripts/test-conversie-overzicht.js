const http = require('http');

async function testConversieOverzicht() {
  try {
    console.log('🧪 Testing Conversie Overzicht data...\n');

    // Test the Facebook analytics API that the conversie overzicht uses
    console.log('1. Testing Facebook analytics API...');
    const analyticsResult = await makeRequest('/api/facebook/comprehensive-analytics?dateRange=maximum&useManualData=true', 'GET');
    
    if (analyticsResult.success) {
      console.log('✅ Facebook analytics API successful');
      console.log('📊 Facebook Data:');
      console.log(`   Total Spend: €${analyticsResult.data.summary.totalSpend.toFixed(2)}`);
      console.log(`   Total Clicks: ${analyticsResult.data.summary.totalClicks}`);
      console.log(`   Total Impressions: ${analyticsResult.data.summary.totalImpressions}`);
      console.log(`   Average CTR: ${analyticsResult.data.summary.averageCTR.toFixed(2)}%`);
      console.log(`   Average CPC: €${analyticsResult.data.summary.averageCPC.toFixed(2)}\n`);
    } else {
      console.error('❌ Facebook analytics API failed:', analyticsResult.error);
      return;
    }

    // Test the prelaunch leads API
    console.log('2. Testing prelaunch leads API...');
    const leadsResult = await makeRequest('/api/prelaunch-leads', 'GET');
    
    if (leadsResult.success) {
      console.log('✅ Prelaunch leads API successful');
      console.log(`   Total leads: ${leadsResult.leads?.length || 0}`);
      
      // Filter out test leads (same logic as conversie overzicht)
      const filteredLeads = leadsResult.leads?.filter(lead => 
        !lead.email.includes('@media2net.nl') && 
        !lead.email.includes('@test.com') &&
        !lead.email.includes('admin@test.com')
      ) || [];
      
      console.log(`   Filtered leads (no test): ${filteredLeads.length}`);
      
      // Count Facebook ad leads
      const facebookAdLeads = filteredLeads.filter(lead => 
        lead.notes && lead.notes.includes('Campaign:') && !lead.notes.includes('Campaign: test')
      );
      
      const organicLeads = filteredLeads.filter(lead => 
        !lead.notes || !lead.notes.includes('Campaign:')
      );
      
      console.log(`   Facebook ad leads: ${facebookAdLeads.length}`);
      console.log(`   Organic leads: ${organicLeads.length}\n`);
      
      // Calculate conversion stats (same logic as conversie overzicht)
      const totalSpend = analyticsResult.data.summary.totalSpend;
      const totalClicks = analyticsResult.data.summary.totalClicks;
      const costPerFacebookLead = facebookAdLeads.length > 0 ? totalSpend / facebookAdLeads.length : 0;
      const conversionRateFromClicks = totalClicks > 0 ? (facebookAdLeads.length / totalClicks * 100) : 0;
      
      console.log('📊 Conversion Stats (calculated):');
      console.log(`   Total Leads: ${filteredLeads.length}`);
      console.log(`   Facebook Ad Leads: ${facebookAdLeads.length}`);
      console.log(`   Organic Leads: ${organicLeads.length}`);
      console.log(`   Total Spend: €${totalSpend.toFixed(2)}`);
      console.log(`   Total Clicks: ${totalClicks}`);
      console.log(`   Cost per Facebook Lead: €${costPerFacebookLead.toFixed(2)}`);
      console.log(`   Conversion Rate from Clicks: ${conversionRateFromClicks.toFixed(2)}%\n`);
      
      // Compare with user's Facebook Ads Manager data
      console.log('🔍 COMPARISON with Facebook Ads Manager:');
      console.log('========================================');
      console.log(`API Total Spend: €${totalSpend.toFixed(2)}`);
      console.log(`User reported: €110.26`);
      console.log(`Match: ${Math.abs(totalSpend - 110.26) < 0.01 ? '✅' : '❌'}`);
      
      if (Math.abs(totalSpend - 110.26) < 0.01) {
        console.log('\n🎉 SUCCESS: Conversie overzicht now shows live Facebook Ads Manager data!');
      } else {
        console.log('\n⚠️  Data still doesn\'t match Facebook Ads Manager');
      }
      
    } else {
      console.error('❌ Prelaunch leads API failed:', leadsResult.error);
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

testConversieOverzicht();
