const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupFacebookAdsSimple() {
  console.log('🔧 Setting up Facebook Ads data (simple approach)...\n');

  try {
    // 1. Check if table exists
    console.log('1️⃣ Checking if facebook_ads table exists...');
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('facebook_ads')
        .select('*')
        .limit(1);

      if (tableError) {
        console.log('❌ Facebook Ads table does not exist');
        console.log('Please create the table manually in Supabase with the following structure:');
        console.log(`
CREATE TABLE facebook_ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    ad_set_name VARCHAR(255),
    ad_name VARCHAR(255),
    date DATE NOT NULL,
    spent DECIMAL(10,2) DEFAULT 0.00,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0.0000,
    cpm DECIMAL(10,2) DEFAULT 0.00,
    cpc DECIMAL(10,2) DEFAULT 0.00,
    cpl DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'active',
    objective VARCHAR(100),
    target_audience TEXT,
    ad_copy TEXT,
    landing_page_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `);
        return;
      }

      console.log('✅ Facebook Ads table exists');
    } catch (err) {
      console.log('❌ Facebook Ads table does not exist');
      console.log('Please create the table manually in Supabase');
      return;
    }

    // 2. Insert sample data
    console.log('\n2️⃣ Inserting sample Facebook Ads data...');
    
    const sampleData = [
      {
        campaign_name: 'Top Tier Men - Awareness Campaign',
        ad_set_name: 'Men 25-45 Netherlands',
        ad_name: 'Become a Top Tier Man',
        date: '2025-01-15',
        spent: 45.50,
        impressions: 12500,
        clicks: 234,
        leads: 12,
        ctr: 0.0187,
        cpm: 3.64,
        cpc: 0.19,
        cpl: 3.79,
        objective: 'LEAD_GENERATION',
        target_audience: 'Men aged 25-45 in Netherlands, interested in fitness and personal development',
        ad_copy: 'Ready to become a Top Tier Man? Join our exclusive community of high-performing individuals.'
      },
      {
        campaign_name: 'Top Tier Men - Awareness Campaign',
        ad_set_name: 'Men 25-45 Netherlands',
        ad_name: 'Become a Top Tier Man',
        date: '2025-01-16',
        spent: 52.30,
        impressions: 14200,
        clicks: 289,
        leads: 15,
        ctr: 0.0204,
        cpm: 3.68,
        cpc: 0.18,
        cpl: 3.49,
        objective: 'LEAD_GENERATION',
        target_audience: 'Men aged 25-45 in Netherlands, interested in fitness and personal development',
        ad_copy: 'Ready to become a Top Tier Man? Join our exclusive community of high-performing individuals.'
      },
      {
        campaign_name: 'Top Tier Men - Conversion Campaign',
        ad_set_name: 'Fitness Enthusiasts',
        ad_name: 'Transform Your Life',
        date: '2025-01-15',
        spent: 38.75,
        impressions: 8900,
        clicks: 156,
        leads: 8,
        ctr: 0.0175,
        cpm: 4.35,
        cpc: 0.25,
        cpl: 4.84,
        objective: 'CONVERSIONS',
        target_audience: 'Men aged 25-45 in Netherlands, interested in fitness, health, and personal growth',
        ad_copy: 'Transform your life with our proven system. Join thousands of men who have already changed their lives.'
      },
      {
        campaign_name: 'Top Tier Men - Conversion Campaign',
        ad_set_name: 'Fitness Enthusiasts',
        ad_name: 'Transform Your Life',
        date: '2025-01-16',
        spent: 41.20,
        impressions: 9200,
        clicks: 178,
        leads: 11,
        ctr: 0.0193,
        cpm: 4.48,
        cpc: 0.23,
        cpl: 3.75,
        objective: 'CONVERSIONS',
        target_audience: 'Men aged 25-45 in Netherlands, interested in fitness, health, and personal growth',
        ad_copy: 'Transform your life with our proven system. Join thousands of men who have already changed their lives.'
      },
      {
        campaign_name: 'Top Tier Men - Retargeting',
        ad_set_name: 'Website Visitors',
        ad_name: 'Don\'t Miss Out',
        date: '2025-01-15',
        spent: 28.90,
        impressions: 6500,
        clicks: 89,
        leads: 6,
        ctr: 0.0137,
        cpm: 4.45,
        cpc: 0.32,
        cpl: 4.82,
        objective: 'LEAD_GENERATION',
        target_audience: 'Men who visited our website in the last 30 days',
        ad_copy: 'Don\'t miss out on becoming a Top Tier Man. Limited spots available.'
      },
      {
        campaign_name: 'Top Tier Men - Retargeting',
        ad_set_name: 'Website Visitors',
        ad_name: 'Don\'t Miss Out',
        date: '2025-01-16',
        spent: 31.45,
        impressions: 7200,
        clicks: 98,
        leads: 7,
        ctr: 0.0136,
        cpm: 4.37,
        cpc: 0.32,
        cpl: 4.49,
        objective: 'LEAD_GENERATION',
        target_audience: 'Men who visited our website in the last 30 days',
        ad_copy: 'Don\'t miss out on becoming a Top Tier Man. Limited spots available.'
      }
    ];

    // Check if data already exists
    const { data: existingData, error: existingError } = await supabase
      .from('facebook_ads')
      .select('id')
      .limit(1);

    if (existingError) {
      console.error('❌ Error checking existing data:', existingError);
      return;
    }

    if (existingData && existingData.length > 0) {
      console.log('⚠️  Facebook Ads data already exists, skipping insertion');
    } else {
      console.log('📝 Inserting sample data...');
      const { data: insertData, error: insertError } = await supabase
        .from('facebook_ads')
        .insert(sampleData);

      if (insertError) {
        console.error('❌ Error inserting data:', insertError);
        return;
      }

      console.log(`✅ Successfully inserted ${sampleData.length} Facebook Ads records`);
    }

    // 3. Display summary
    console.log('\n3️⃣ Fetching and displaying summary...');
    const { data: adsData, error: adsError } = await supabase
      .from('facebook_ads')
      .select('*')
      .order('date', { ascending: false });

    if (adsError) {
      console.error('❌ Error fetching ads data:', adsError);
      return;
    }

    console.log(`✅ Found ${adsData?.length || 0} Facebook Ads records`);

    // 4. Calculate and display statistics
    if (adsData && adsData.length > 0) {
      console.log('\n📊 FACEBOOK ADS STATUS REPORT:');
      console.log('===============================');
      
      let totalSpent = 0;
      let totalLeads = 0;
      let totalClicks = 0;
      let totalImpressions = 0;
      const campaigns = {};

      adsData.forEach(ad => {
        totalSpent += parseFloat(ad.spent || 0);
        totalLeads += parseInt(ad.leads || 0);
        totalClicks += parseInt(ad.clicks || 0);
        totalImpressions += parseInt(ad.impressions || 0);

        if (!campaigns[ad.campaign_name]) {
          campaigns[ad.campaign_name] = {
            spent: 0,
            leads: 0,
            clicks: 0,
            impressions: 0
          };
        }

        campaigns[ad.campaign_name].spent += parseFloat(ad.spent || 0);
        campaigns[ad.campaign_name].leads += parseInt(ad.leads || 0);
        campaigns[ad.campaign_name].clicks += parseInt(ad.clicks || 0);
        campaigns[ad.campaign_name].impressions += parseInt(ad.impressions || 0);
      });

      console.log(`💰 Total Spent: €${totalSpent.toFixed(2)}`);
      console.log(`🎯 Total Leads: ${totalLeads}`);
      console.log(`🖱️  Total Clicks: ${totalClicks}`);
      console.log(`👁️  Total Impressions: ${totalImpressions.toLocaleString()}`);
      console.log(`📊 Cost per Lead: €${totalLeads > 0 ? (totalSpent / totalLeads).toFixed(2) : 'N/A'}`);
      console.log(`📊 Cost per Click: €${totalClicks > 0 ? (totalSpent / totalClicks).toFixed(2) : 'N/A'}`);
      console.log(`📊 Click-through Rate: ${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 'N/A'}%`);

      console.log('\n🎯 CAMPAIGN BREAKDOWN:');
      console.log('======================');
      Object.keys(campaigns).forEach(campaign => {
        const stats = campaigns[campaign];
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
      });

      // 5. Budget status
      const budgetLimit = 500;
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

      // 6. Recommendations
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
    }

    console.log('\n🎉 Facebook Ads setup completed successfully!');

  } catch (error) {
    console.error('❌ Error in Facebook Ads setup:', error);
  }
}

setupFacebookAdsSimple();
