const http = require('http');

async function debugCampaignRelationships() {
  try {
    console.log('🔍 Debugging campaign relationships...\n');

    // Test all three APIs
    console.log('1. Fetching campaigns...');
    const campaignsResult = await makeRequest('/api/facebook/get-campaigns', 'GET');
    
    console.log('2. Fetching ad sets...');
    const adSetsResult = await makeRequest('/api/facebook/get-adsets', 'GET');
    
    console.log('3. Fetching ads...');
    const adsResult = await makeRequest('/api/facebook/get-ads', 'GET');

    if (campaignsResult.success && adSetsResult.success && adsResult.success) {
      console.log('\n📊 DATA ANALYSIS:');
      console.log('='.repeat(60));
      
      const campaigns = campaignsResult.data || [];
      const adSets = adSetsResult.data || [];
      const ads = adsResult.data || [];
      
      console.log(`Campaigns: ${campaigns.length}`);
      console.log(`Ad Sets: ${adSets.length}`);
      console.log(`Ads: ${ads.length}\n`);
      
      // Analyze each campaign
      campaigns.forEach((campaign, index) => {
        console.log(`${index + 1}. Campaign: ${campaign.name}`);
        console.log(`   ID: ${campaign.id}`);
        console.log(`   Status: ${campaign.status}`);
        console.log(`   Objective: ${campaign.objective}`);
        
        // Find ad sets for this campaign
        const campaignAdSets = adSets.filter(adSet => adSet.campaign_id === campaign.id);
        console.log(`   Ad Sets: ${campaignAdSets.length}`);
        
        if (campaignAdSets.length > 0) {
          campaignAdSets.forEach((adSet, asIndex) => {
            console.log(`     ${asIndex + 1}. ${adSet.name} (${adSet.id})`);
            
            // Find ads for this ad set
            const adSetAds = ads.filter(ad => ad.adset_id === adSet.id);
            console.log(`        Ads: ${adSetAds.length}`);
            
            adSetAds.forEach((ad, adIndex) => {
              console.log(`          ${adIndex + 1}. ${ad.name} (${ad.id})`);
            });
          });
        } else {
          console.log(`     ❌ No ad sets found for campaign ${campaign.id}`);
          
          // Check if there are any ad sets with different campaign IDs
          const allCampaignIds = [...new Set(adSets.map(as => as.campaign_id))];
          console.log(`     Available campaign IDs in ad sets: ${allCampaignIds.join(', ')}`);
        }
        
        console.log('');
      });
      
      // Check for orphaned ad sets
      console.log('🔍 ORPHANED AD SETS:');
      console.log('-'.repeat(30));
      const campaignIds = campaigns.map(c => c.id);
      const orphanedAdSets = adSets.filter(adSet => !campaignIds.includes(adSet.campaign_id));
      
      if (orphanedAdSets.length > 0) {
        console.log(`Found ${orphanedAdSets.length} orphaned ad sets:`);
        orphanedAdSets.forEach(adSet => {
          console.log(`  - ${adSet.name} (Campaign ID: ${adSet.campaign_id})`);
        });
      } else {
        console.log('✅ No orphaned ad sets found');
      }
      
      // Check for orphaned ads
      console.log('\n🔍 ORPHANED ADS:');
      console.log('-'.repeat(30));
      const adSetIds = adSets.map(as => as.id);
      const orphanedAds = ads.filter(ad => !adSetIds.includes(ad.adset_id));
      
      if (orphanedAds.length > 0) {
        console.log(`Found ${orphanedAds.length} orphaned ads:`);
        orphanedAds.forEach(ad => {
          console.log(`  - ${ad.name} (Ad Set ID: ${ad.adset_id})`);
        });
      } else {
        console.log('✅ No orphaned ads found');
      }
      
      // Summary
      console.log('\n📋 SUMMARY:');
      console.log('='.repeat(30));
      let totalAdSets = 0;
      let totalAds = 0;
      
      campaigns.forEach(campaign => {
        const campaignAdSets = adSets.filter(adSet => adSet.campaign_id === campaign.id);
        const campaignAds = ads.filter(ad => 
          campaignAdSets.some(adSet => adSet.id === ad.adset_id)
        );
        
        totalAdSets += campaignAdSets.length;
        totalAds += campaignAds.length;
        
        console.log(`${campaign.name}: ${campaignAdSets.length} ad sets, ${campaignAds.length} ads`);
      });
      
      console.log(`\nTotal: ${totalAdSets} ad sets, ${totalAds} ads across all campaigns`);
      
    } else {
      console.error('❌ Failed to fetch data from one or more APIs');
      if (!campaignsResult.success) console.error('Campaigns API:', campaignsResult.error);
      if (!adSetsResult.success) console.error('Ad Sets API:', adSetsResult.error);
      if (!adsResult.success) console.error('Ads API:', adsResult.error);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
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

debugCampaignRelationships();
