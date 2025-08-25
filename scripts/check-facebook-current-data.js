require('dotenv').config({ path: '.env.local' });

console.log('🔍 Facebook Ads Manager Data Check - 25 August 2025\n');

console.log('📊 Current Manual Data in API:');
console.log('================================');

const manualData = {
  'TTM - Zakelijk Prelaunch Campagne': {
    clicks: 88,
    spend: 19.15,
    impressions: 1533,
    reach: 1533,
    ctr: 5.74,
    cpc: 0.22
  },
  'TTM - Vaders Prelaunch Campagne': {
    clicks: 112,
    spend: 11.67,
    impressions: 1526,
    reach: 1526,
    ctr: 7.34,
    cpc: 0.10
  },
  'TTM - Jongeren Prelaunch Campagne': {
    clicks: 80,
    spend: 13.15,
    impressions: 1526,
    reach: 1526,
    ctr: 5.24,
    cpc: 0.16
  },
  'TTM - Algemene Prelaunch Campagne': {
    clicks: 192,
    spend: 23.55,
    impressions: 2994,
    reach: 2994,
    ctr: 6.41,
    cpc: 0.12
  }
};

let totalClicks = 0;
let totalSpend = 0;
let totalImpressions = 0;
let totalReach = 0;

Object.entries(manualData).forEach(([name, data], index) => {
  console.log(`${index + 1}. ${name}`);
  console.log(`   Clicks: ${data.clicks}`);
  console.log(`   Spend: €${data.spend}`);
  console.log(`   Impressions: ${data.impressions}`);
  console.log(`   Reach: ${data.reach}`);
  console.log(`   CTR: ${data.ctr}%`);
  console.log(`   CPC: €${data.cpc}\n`);
  
  totalClicks += data.clicks;
  totalSpend += data.spend;
  totalImpressions += data.impressions;
  totalReach += data.reach;
});

console.log('📊 TOTALS:');
console.log(`   Total Clicks: ${totalClicks}`);
console.log(`   Total Spend: €${totalSpend.toFixed(2)}`);
console.log(`   Total Impressions: ${totalImpressions}`);
console.log(`   Total Reach: ${totalReach}`);
console.log(`   Average CTR: ${((totalClicks / totalImpressions) * 100).toFixed(2)}%`);
console.log(`   Average CPC: €${(totalSpend / totalClicks).toFixed(2)}\n`);

console.log('🔍 User reported Facebook Ads Manager data:');
console.log('==========================================');
console.log('Accountbestedingslimiet: €500,00');
console.log('€110,26 besteed');
console.log('Uitgegeven bedrag in de afgelopen 7 dagen: €97,19');
console.log('0% besteed in leerfase\n');

console.log('⚠️  DISCREPANCY DETECTED:');
console.log('========================');
console.log(`Manual data total spend: €${totalSpend.toFixed(2)}`);
console.log(`User reported total spend: €110.26`);
console.log(`Difference: €${(110.26 - totalSpend).toFixed(2)}`);
console.log('\n');

console.log('🔧 RECOMMENDED ACTION:');
console.log('=====================');
console.log('1. Check Facebook Ads Manager for current campaign data');
console.log('2. Update manual data in API if needed');
console.log('3. Verify if there are additional campaigns not included');
console.log('4. Check if the user is looking at different date ranges');
console.log('\n');

console.log('📋 To update the data, modify:');
console.log('src/app/api/facebook/comprehensive-analytics/route.ts');
console.log('Update the CURRENT_MANUAL_DATA object with new values');
