const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFacebookAdsStatus() {
  console.log('📊 Facebook Ads Status Check...\n');

  try {
    // 1. Check Facebook Ads data
    console.log('1️⃣ Fetching Facebook Ads data...');
    const { data: facebookAds, error: facebookError } = await supabase
      .from('facebook_ads')
      .select('*')
      .order('date', { ascending: false });

    if (facebookError) {
      console.error('❌ Error fetching Facebook Ads data:', facebookError);
      return;
    }

    console.log(`✅ Found ${facebookAds?.length || 0} Facebook Ads records`);

    // 2. Calculate totals
    let totalSpent = 0;
    let totalLeads = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    const campaignStats = {};

    facebookAds?.forEach(ad => {
      const spent = parseFloat(ad.spent || 0);
      const leads = parseInt(ad.leads || 0);
      const clicks = parseInt(ad.clicks || 0);
      const impressions = parseInt(ad.impressions || 0);
      
      totalSpent += spent;
      totalLeads += leads;
      totalClicks += clicks;
      totalImpressions += impressions;

      // Group by campaign
      const campaign = ad.campaign_name || 'Unknown Campaign';
      if (!campaignStats[campaign]) {
        campaignStats[campaign] = {
          spent: 0,
          leads: 0,
          clicks: 0,
          impressions: 0,
          dates: []
        };
      }
      
      campaignStats[campaign].spent += spent;
      campaignStats[campaign].leads += leads;
      campaignStats[campaign].clicks += clicks;
      campaignStats[campaign].impressions += impressions;
      campaignStats[campaign].dates.push(ad.date);
    });

    // 3. Display overall stats
    console.log('\n📈 OVERALL FACEBOOK ADS STATISTICS:');
    console.log('=====================================');
    console.log(`💰 Total Spent: €${totalSpent.toFixed(2)}`);
    console.log(`🎯 Total Leads: ${totalLeads}`);
    console.log(`🖱️  Total Clicks: ${totalClicks}`);
    console.log(`👁️  Total Impressions: ${totalImpressions.toLocaleString()}`);
    console.log(`📊 Cost per Lead: €${totalLeads > 0 ? (totalSpent / totalLeads).toFixed(2) : 'N/A'}`);
    console.log(`📊 Cost per Click: €${totalClicks > 0 ? (totalSpent / totalClicks).toFixed(2) : 'N/A'}`);
    console.log(`📊 Click-through Rate: ${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 'N/A'}%`);

    // 4. Check budget status
    const budgetLimit = 500; // €500 budget limit
    const remainingBudget = budgetLimit - totalSpent;
    const budgetPercentage = (totalSpent / budgetLimit) * 100;

    console.log('\n💰 BUDGET STATUS:');
    console.log('=================');
    console.log(`📋 Budget Limit: €${budgetLimit}`);
    console.log(`💸 Total Spent: €${totalSpent.toFixed(2)}`);
    console.log(`💳 Remaining Budget: €${remainingBudget.toFixed(2)}`);
    console.log(`📊 Budget Used: ${budgetPercentage.toFixed(1)}%`);
    
    if (budgetPercentage >= 90) {
      console.log('⚠️  WARNING: Budget is almost depleted!');
    } else if (budgetPercentage >= 75) {
      console.log('⚠️  WARNING: Budget is 75%+ used');
    } else if (budgetPercentage >= 50) {
      console.log('ℹ️  INFO: Budget is 50%+ used');
    } else {
      console.log('✅ Budget is still available');
    }

    // 5. Display campaign breakdown
    console.log('\n🎯 CAMPAIGN BREAKDOWN:');
    console.log('======================');
    
    Object.keys(campaignStats).forEach(campaign => {
      const stats = campaignStats[campaign];
      const costPerLead = stats.leads > 0 ? (stats.spent / stats.leads) : 0;
      const costPerClick = stats.clicks > 0 ? (stats.spent / stats.clicks) : 0;
      const ctr = stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100) : 0;
      
      console.log(`\n📋 Campaign: ${campaign}`);
      console.log(`   💰 Spent: €${stats.spent.toFixed(2)}`);
      console.log(`   🎯 Leads: ${stats.leads}`);
      console.log(`   🖱️  Clicks: ${stats.clicks}`);
      console.log(`   👁️  Impressions: ${stats.impressions.toLocaleString()}`);
      console.log(`   📊 Cost per Lead: €${costPerLead.toFixed(2)}`);
      console.log(`   📊 Cost per Click: €${costPerClick.toFixed(2)}`);
      console.log(`   📊 CTR: ${ctr.toFixed(2)}%`);
      console.log(`   📅 Date Range: ${stats.dates[stats.dates.length - 1]} to ${stats.dates[0]}`);
    });

    // 6. Recent activity
    console.log('\n📅 RECENT ACTIVITY (Last 7 days):');
    console.log('==================================');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAds = facebookAds?.filter(ad => new Date(ad.date) >= sevenDaysAgo) || [];
    let recentSpent = 0;
    let recentLeads = 0;
    
    recentAds.forEach(ad => {
      recentSpent += parseFloat(ad.spent || 0);
      recentLeads += parseInt(ad.leads || 0);
    });

    console.log(`📊 Last 7 days spent: €${recentSpent.toFixed(2)}`);
    console.log(`🎯 Last 7 days leads: ${recentLeads}`);
    console.log(`📊 Daily average spent: €${(recentSpent / 7).toFixed(2)}`);
    console.log(`📊 Daily average leads: ${(recentLeads / 7).toFixed(1)}`);

    // 7. Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('===================');
    
    if (totalLeads === 0) {
      console.log('❌ No leads generated yet. Consider:');
      console.log('   - Reviewing ad copy and targeting');
      console.log('   - Testing different ad formats');
      console.log('   - Adjusting bid strategies');
    } else if (totalSpent / totalLeads > 50) {
      console.log('⚠️  High cost per lead. Consider:');
      console.log('   - Optimizing landing pages');
      console.log('   - Refining target audience');
      console.log('   - Testing different ad creatives');
    } else {
      console.log('✅ Good cost per lead. Consider:');
      console.log('   - Scaling successful campaigns');
      console.log('   - Testing similar audiences');
      console.log('   - Optimizing for conversions');
    }

    if (budgetPercentage >= 90) {
      console.log('\n🚨 URGENT: Budget almost depleted!');
      console.log('   - Consider pausing campaigns');
      console.log('   - Review ROI before continuing');
      console.log('   - Plan budget increase if needed');
    }

  } catch (error) {
    console.error('❌ Error in Facebook Ads status check:', error);
  }
}

checkFacebookAdsStatus();
