require('dotenv').config({ path: '.env.local' });

console.log('📊 CHECKING CONVERSION STATUS');
console.log('=============================\n');

async function checkConversionStatus() {
  try {
    console.log('📋 STEP 1: Fetching leads from database');
    console.log('----------------------------------------');
    
    const leadsResponse = await fetch('http://localhost:3000/api/prelaunch-leads');
    const leadsData = await leadsResponse.json();
    
    if (!leadsData.success) {
      console.error('❌ Failed to fetch leads:', leadsData);
      return;
    }
    
    console.log('✅ Leads fetched successfully');
    console.log(`📊 Total leads in database: ${leadsData.leads.length}`);
    
    // Filter out test leads
    const filteredLeads = leadsData.leads.filter(lead => 
      !lead.email.includes('@media2net.nl') && 
      !lead.email.includes('@test.com') &&
      !lead.email.includes('admin@test.com')
    );
    
    console.log(`📊 Filtered leads (no test): ${filteredLeads.length}`);
    
    // Count Facebook ad leads
    const facebookAdLeads = filteredLeads.filter(lead => 
      lead.notes && lead.notes.includes('Campaign:') && !lead.notes.includes('Campaign: test')
    );
    
    console.log(`📊 Facebook ad leads: ${facebookAdLeads.length}`);
    
    // Show Facebook ad leads
    facebookAdLeads.forEach(lead => {
      console.log(`   - ${lead.email} (${lead.notes})`);
    });
    
    console.log('\n📋 STEP 2: Fetching Facebook analytics');
    console.log('--------------------------------------');
    
    const analyticsResponse = await fetch('http://localhost:3000/api/facebook/auto-refresh-analytics');
    const analyticsData = await analyticsResponse.json();
    
    if (!analyticsData.success) {
      console.error('❌ Failed to fetch analytics:', analyticsData);
      return;
    }
    
    console.log('✅ Analytics fetched successfully');
    console.log('📊 Analytics data:', JSON.stringify(analyticsData.data, null, 2));
    
    const summary = analyticsData.data.summary;
    const totalSpend = summary.totalSpend || 0;
    const totalClicks = parseInt(summary.totalClicks) || 0;
    const totalImpressions = parseInt(summary.totalImpressions) || 0;
    
    console.log('\n📋 STEP 3: Calculations');
    console.log('------------------------');
    
    const costPerFacebookLead = facebookAdLeads.length > 0 ? totalSpend / facebookAdLeads.length : 0;
    const conversionRateFromClicks = totalClicks > 0 ? (facebookAdLeads.length / totalClicks * 100) : 0;
    
    console.log(`💰 Total Spend: €${totalSpend.toFixed(2)}`);
    console.log(`👆 Total Clicks: ${totalClicks.toLocaleString()}`);
    console.log(`👁️  Total Impressions: ${totalImpressions.toLocaleString()}`);
    console.log(`📞 Facebook Ad Leads: ${facebookAdLeads.length}`);
    console.log(`💵 Cost per Facebook Lead: €${costPerFacebookLead.toFixed(2)}`);
    console.log(`📈 Conversion Rate from Clicks: ${conversionRateFromClicks.toFixed(2)}%`);
    
    console.log('\n📋 STEP 4: Verification');
    console.log('------------------------');
    
    const expectedSpend = 240.61;
    const expectedLeads = 7;
    
    console.log(`✅ Expected Spend: €${expectedSpend}`);
    console.log(`✅ Actual Spend: €${totalSpend.toFixed(2)}`);
    console.log(`✅ Difference: €${Math.abs(totalSpend - expectedSpend).toFixed(2)}`);
    
    console.log(`✅ Expected Leads: ${expectedLeads}`);
    console.log(`✅ Actual Leads: ${facebookAdLeads.length}`);
    console.log(`✅ Difference: ${Math.abs(facebookAdLeads.length - expectedLeads)}`);
    
    if (Math.abs(totalSpend - expectedSpend) < 1) {
      console.log('✅ Spend amount is correct');
    } else {
      console.log('⚠️  Spend amount differs from expected');
    }
    
    if (facebookAdLeads.length === expectedLeads) {
      console.log('✅ Lead count is correct');
    } else {
      console.log('⚠️  Lead count differs from expected');
    }
    
    console.log('\n📋 STEP 5: Date Check');
    console.log('---------------------');
    
    const today = new Date();
    console.log(`📅 Today: ${today.toISOString().split('T')[0]}`);
    console.log(`📅 August 28: 2025-08-28`);
    console.log(`📊 Data includes: ${today.getMonth() === 7 ? 'Current month' : 'Previous month'}`);
    
    // Check if data includes today
    const leadsFromToday = filteredLeads.filter(lead => {
      const leadDate = new Date(lead.subscribed_at);
      return leadDate.toDateString() === today.toDateString();
    });
    
    console.log(`📊 Leads from today: ${leadsFromToday.length}`);
    
    console.log('\n🎯 SUMMARY:');
    console.log('===========');
    console.log(`💰 Total Ad Spend: €${totalSpend.toFixed(2)} (Expected: €${expectedSpend})`);
    console.log(`📞 Facebook Ad Leads: ${facebookAdLeads.length} (Expected: ${expectedLeads})`);
    console.log(`👆 Total Clicks: ${totalClicks.toLocaleString()}`);
    console.log(`👁️  Total Impressions: ${totalImpressions.toLocaleString()}`);
    console.log(`💵 Cost per Lead: €${costPerFacebookLead.toFixed(2)}`);
    console.log(`📈 Conversion Rate: ${conversionRateFromClicks.toFixed(2)}%`);
    
  } catch (error) {
    console.error('❌ Error checking conversion status:', error.message);
  }
}

// Run the check
checkConversionStatus();
