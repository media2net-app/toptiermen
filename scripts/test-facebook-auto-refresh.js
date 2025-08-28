require('dotenv').config({ path: '.env.local' });

console.log('🧪 TESTING FACEBOOK AUTO-REFRESH API');
console.log('============================================================');

async function testAutoRefreshAPI() {
  try {
    console.log('🔍 Testing auto-refresh API endpoint...');
    
    const response = await fetch('https://platform.toptiermen.eu/api/facebook/auto-refresh-analytics');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Auto-refresh API working on live site!');
      console.log(`📊 Summary: €${data.data.summary.totalSpend.toFixed(2)} spent, ${data.data.summary.totalConversions} conversions`);
      console.log(`📅 Date range: ${data.data.summary.dateRange}`);
      console.log(`🕒 Last updated: ${data.data.summary.lastUpdated}`);
      console.log(`📈 Active campaigns: ${data.data.summary.activeCampaigns}`);
      
      if (data.data.campaigns.length > 0) {
        console.log('\n📋 Campaign Data:');
        data.data.campaigns.forEach(campaign => {
          console.log(`   - ${campaign.name}: €${campaign.spend.toFixed(2)} spent, ${campaign.clicks} clicks, ${campaign.conversions || 0} conversions`);
        });
      }
      
      console.log('\n🎯 RESULT:');
      console.log('✅ Facebook auto-refresh API is working correctly');
      console.log('✅ Live data is being fetched from Facebook');
      console.log('✅ Conversie overzicht should now show correct data');
      
    } else {
      console.error('❌ Auto-refresh API failed:', data.error);
      console.log('📋 Error details:', data.details);
    }
    
  } catch (error) {
    console.error('❌ Auto-refresh API test failed:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting Facebook auto-refresh API test...');
    console.log('');
    
    await testAutoRefreshAPI();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main();
