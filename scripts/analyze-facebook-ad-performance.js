const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeFacebookAdPerformance() {
  console.log('📊 ANALYZING FACEBOOK AD PERFORMANCE\n');
  console.log('🎯 Period: Start tot 31 augustus 2025\n');

  try {
    // Fetch all pre-launch leads
    const { data: leads, error } = await supabase
      .from('prelaunch_emails')
      .select(`
        id,
        email,
        name,
        source,
        status,
        package,
        notes,
        subscribed_at,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term
      `)
      .order('subscribed_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching leads:', error);
      return;
    }

    console.log(`📈 Total leads found: ${leads.length}\n`);

    // Filter leads from August 2025
    const augustLeads = leads.filter(lead => {
      const date = new Date(lead.subscribed_at);
      return date.getMonth() === 7 && date.getFullYear() === 2025; // August = month 7
    });

    console.log(`📅 August 2025 leads: ${augustLeads.length}\n`);

    // Analyze by source
    const sourceAnalysis = {};
    augustLeads.forEach(lead => {
      const source = lead.source || 'Unknown';
      if (!sourceAnalysis[source]) {
        sourceAnalysis[source] = {
          count: 0,
          leads: [],
          packages: {},
          conversionRate: 0
        };
      }
      sourceAnalysis[source].count++;
      sourceAnalysis[source].leads.push(lead);
      
      // Track package preferences
      const packageType = lead.package || 'BASIC';
      if (!sourceAnalysis[source].packages[packageType]) {
        sourceAnalysis[source].packages[packageType] = 0;
      }
      sourceAnalysis[source].packages[packageType]++;
    });

    // Analyze Facebook ads specifically
    const facebookLeads = augustLeads.filter(lead => 
      lead.source === 'Facebook Ad' || 
      lead.utm_source === 'facebook' ||
      lead.utm_medium === 'cpc' ||
      (lead.notes && lead.notes.includes('Campaign:'))
    );

    console.log(`📱 Facebook Ad leads: ${facebookLeads.length}\n`);

    // Analyze Facebook campaigns by UTM data and notes
    const campaignAnalysis = {};
    
    facebookLeads.forEach(lead => {
      let campaignId = null;
      let campaignName = 'Unknown Campaign';
      
      // Extract campaign info from notes
      if (lead.notes && lead.notes.includes('Campaign:')) {
        const campaignMatch = lead.notes.match(/Campaign:\s*(\d+)/);
        if (campaignMatch) {
          campaignId = campaignMatch[1];
        }
      }
      
      // Use UTM campaign if available
      if (lead.utm_campaign) {
        campaignName = lead.utm_campaign;
      }
      
      const key = campaignId || campaignName;
      
      if (!campaignAnalysis[key]) {
        campaignAnalysis[key] = {
          id: campaignId,
          name: campaignName,
          leads: 0,
          conversions: 0,
          emails: [],
          packages: {},
          dates: [],
          cost: 0,
          spend: 0
        };
      }
      
      campaignAnalysis[key].leads++;
      campaignAnalysis[key].conversions++;
      campaignAnalysis[key].emails.push(lead.email);
      campaignAnalysis[key].dates.push(lead.subscribed_at);
      
      const packageType = lead.package || 'BASIC';
      if (!campaignAnalysis[key].packages[packageType]) {
        campaignAnalysis[key].packages[packageType] = 0;
      }
      campaignAnalysis[key].packages[packageType]++;
    });

    // Add Facebook campaign data from API
    const facebookCampaigns = {
      "120232433872750324": {
        "name": "TTM - Zakelijk Prelaunch Campagne - LEADS V2",
        "clicks": 32,
        "spend": 6.70,
        "impressions": 358,
        "reach": 358,
        "ctr": 0.0893854748603352,
        "cpc": 0.209375,
        "leads": 1,
        "conversions": 1
      },
      "120232394482520324": {
        "name": "TTM - Algemene Prelaunch Campagne - LEADS",
        "clicks": 0,
        "spend": 0,
        "impressions": 0,
        "reach": 0,
        "ctr": 0,
        "cpc": 0,
        "leads": 0,
        "conversions": 0
      },
      "120232394479720324": {
        "name": "TTM - Jongeren Prelaunch Campagne - LEADS",
        "clicks": 0,
        "spend": 0,
        "impressions": 0,
        "reach": 0,
        "ctr": 0,
        "cpc": 0,
        "leads": 0,
        "conversions": 0
      },
      "120232394477760324": {
        "name": "TTM - Vaders Prelaunch Campagne - LEADS",
        "clicks": 0,
        "spend": 0,
        "impressions": 0,
        "reach": 0,
        "ctr": 0,
        "cpc": 0,
        "leads": 0,
        "conversions": 0
      },
      "120232394476410324": {
        "name": "TTM - Zakelijk Prelaunch Campagne - LEADS",
        "clicks": 0,
        "spend": 0,
        "impressions": 0,
        "reach": 0,
        "ctr": 0,
        "cpc": 0,
        "leads": 0,
        "conversions": 0
      }
    };

    // Merge campaign data
    Object.keys(campaignAnalysis).forEach(campaignKey => {
      const campaign = campaignAnalysis[campaignKey];
      if (campaign.id && facebookCampaigns[campaign.id]) {
        const fbData = facebookCampaigns[campaign.id];
        campaign.spend = fbData.spend;
        campaign.clicks = fbData.clicks;
        campaign.impressions = fbData.impressions;
        campaign.reach = fbData.reach;
        campaign.ctr = fbData.ctr;
        campaign.cpc = fbData.cpc;
      }
    });

    // Calculate performance metrics
    Object.keys(campaignAnalysis).forEach(campaignKey => {
      const campaign = campaignAnalysis[campaignKey];
      if (campaign.spend > 0 && campaign.leads > 0) {
        campaign.costPerLead = campaign.spend / campaign.leads;
        campaign.conversionRate = (campaign.leads / campaign.clicks) * 100;
      } else {
        campaign.costPerLead = 0;
        campaign.conversionRate = 0;
      }
    });

    // Sort campaigns by performance (leads first, then cost per lead)
    const sortedCampaigns = Object.keys(campaignAnalysis)
      .map(key => ({ key, ...campaignAnalysis[key] }))
      .sort((a, b) => {
        // First sort by number of leads
        if (b.leads !== a.leads) {
          return b.leads - a.leads;
        }
        // Then by cost per lead (lower is better)
        return a.costPerLead - b.costPerLead;
      });

    console.log('🏆 FACEBOOK AD PERFORMANCE RANKING\n');
    console.log('=' .repeat(80));

    sortedCampaigns.forEach((campaign, index) => {
      console.log(`\n${index + 1}. ${campaign.name}`);
      console.log(`   📊 Performance Metrics:`);
      console.log(`      • Leads: ${campaign.leads}`);
      console.log(`      • Clicks: ${campaign.clicks || 0}`);
      console.log(`      • Impressions: ${campaign.impressions || 0}`);
      console.log(`      • Spend: €${campaign.spend || 0}`);
      console.log(`      • Cost per Lead: €${campaign.costPerLead ? campaign.costPerLead.toFixed(2) : 'N/A'}`);
      console.log(`      • Conversion Rate: ${campaign.conversionRate ? campaign.conversionRate.toFixed(2) + '%' : 'N/A'}`);
      console.log(`      • CTR: ${campaign.ctr ? (campaign.ctr * 100).toFixed(2) + '%' : 'N/A'}`);
      
      if (campaign.emails.length > 0) {
        console.log(`   📧 Lead Emails: ${campaign.emails.join(', ')}`);
      }
      
      if (Object.keys(campaign.packages).length > 0) {
        console.log(`   📦 Package Preferences:`);
        Object.keys(campaign.packages).forEach(pkg => {
          console.log(`      • ${pkg}: ${campaign.packages[pkg]}`);
        });
      }
    });

    // Overall summary
    console.log('\n' + '=' .repeat(80));
    console.log('📈 OVERALL SUMMARY');
    console.log('=' .repeat(80));
    
    const totalFacebookLeads = facebookLeads.length;
    const totalSpend = Object.values(campaignAnalysis).reduce((sum, campaign) => sum + (campaign.spend || 0), 0);
    const avgCostPerLead = totalSpend > 0 ? totalSpend / totalFacebookLeads : 0;
    
    console.log(`\n📊 Total Facebook Ad Leads: ${totalFacebookLeads}`);
    console.log(`💰 Total Spend: €${totalSpend.toFixed(2)}`);
    console.log(`🎯 Average Cost per Lead: €${avgCostPerLead.toFixed(2)}`);
    
    // Best performing campaign
    if (sortedCampaigns.length > 0) {
      const bestCampaign = sortedCampaigns[0];
      console.log(`\n🏆 Best Performing Campaign: ${bestCampaign.name}`);
      console.log(`   • Leads: ${bestCampaign.leads}`);
      console.log(`   • Cost per Lead: €${bestCampaign.costPerLead ? bestCampaign.costPerLead.toFixed(2) : 'N/A'}`);
    }

    // Source breakdown
    console.log('\n📋 LEAD SOURCE BREAKDOWN');
    console.log('=' .repeat(80));
    
    Object.keys(sourceAnalysis).forEach(source => {
      const data = sourceAnalysis[source];
      console.log(`\n${source}: ${data.count} leads`);
      if (Object.keys(data.packages).length > 0) {
        console.log(`   Packages: ${Object.keys(data.packages).map(pkg => `${pkg}(${data.packages[pkg]})`).join(', ')}`);
      }
    });

  } catch (error) {
    console.error('❌ Error analyzing Facebook ad performance:', error);
  }
}

analyzeFacebookAdPerformance();
