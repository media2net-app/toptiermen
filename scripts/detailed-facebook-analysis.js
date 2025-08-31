const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function detailedFacebookAnalysis() {
  console.log('📊 DETAILED FACEBOOK AD ANALYSIS\n');
  console.log('🎯 Period: Start tot 31 augustus 2025\n');

  try {
    // Fetch all pre-launch leads
    const { data: leads, error } = await supabase
      .from('prelaunch_emails')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching leads:', error);
      return;
    }

    // Filter August 2025 leads
    const augustLeads = leads.filter(lead => {
      const date = new Date(lead.subscribed_at);
      return date.getMonth() === 7 && date.getFullYear() === 2025;
    });

    console.log(`📈 Total leads: ${leads.length}`);
    console.log(`📅 August 2025 leads: ${augustLeads.length}\n`);

    // Facebook campaign data from API
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
        "conversions": 1,
        "status": "ACTIVE"
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
        "conversions": 0,
        "status": "PAUSED"
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
        "conversions": 0,
        "status": "PAUSED"
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
        "conversions": 0,
        "status": "PAUSED"
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
        "conversions": 0,
        "status": "PAUSED"
      }
    };

    // Analyze leads with campaign tracking
    const campaignLeads = {};
    const untrackedLeads = [];

    augustLeads.forEach(lead => {
      let campaignId = null;
      
      // Extract campaign ID from notes
      if (lead.notes && lead.notes.includes('Campaign:')) {
        const campaignMatch = lead.notes.match(/Campaign:\s*(\d+)/);
        if (campaignMatch) {
          campaignId = campaignMatch[1];
        }
      }
      
      if (campaignId && facebookCampaigns[campaignId]) {
        if (!campaignLeads[campaignId]) {
          campaignLeads[campaignId] = {
            campaign: facebookCampaigns[campaignId],
            leads: [],
            totalLeads: 0
          };
        }
        campaignLeads[campaignId].leads.push(lead);
        campaignLeads[campaignId].totalLeads++;
      } else {
        untrackedLeads.push(lead);
      }
    });

    console.log('🏆 FACEBOOK CAMPAIGN PERFORMANCE ANALYSIS\n');
    console.log('=' .repeat(80));

    // Sort campaigns by performance
    const sortedCampaigns = Object.keys(campaignLeads)
      .map(id => ({ id, ...campaignLeads[id] }))
      .sort((a, b) => {
        // First by leads
        if (b.totalLeads !== a.totalLeads) {
          return b.totalLeads - a.totalLeads;
        }
        // Then by cost per lead
        const aCostPerLead = a.campaign.spend > 0 ? a.campaign.spend / a.totalLeads : 0;
        const bCostPerLead = b.campaign.spend > 0 ? b.campaign.spend / b.totalLeads : 0;
        return aCostPerLead - bCostPerLead;
      });

    sortedCampaigns.forEach((campaignData, index) => {
      const { id, campaign, leads, totalLeads } = campaignData;
      
      console.log(`\n${index + 1}. ${campaign.name}`);
      console.log(`   📊 Campaign ID: ${id}`);
      console.log(`   📈 Performance Metrics:`);
      console.log(`      • Leads Generated: ${totalLeads}`);
      console.log(`      • Facebook Leads: ${campaign.leads}`);
      console.log(`      • Clicks: ${campaign.clicks}`);
      console.log(`      • Impressions: ${campaign.impressions}`);
      console.log(`      • Reach: ${campaign.reach}`);
      console.log(`      • Spend: €${campaign.spend}`);
      console.log(`      • CTR: ${(campaign.ctr * 100).toFixed(2)}%`);
      console.log(`      • CPC: €${campaign.cpc.toFixed(3)}`);
      
      if (totalLeads > 0 && campaign.spend > 0) {
        const costPerLead = campaign.spend / totalLeads;
        const conversionRate = (totalLeads / campaign.clicks) * 100;
        console.log(`      • Cost per Lead: €${costPerLead.toFixed(2)}`);
        console.log(`      • Conversion Rate: ${conversionRate.toFixed(2)}%`);
      }
      
      console.log(`   📧 Generated Leads:`);
      leads.forEach(lead => {
        console.log(`      • ${lead.email} (${lead.name || 'No name'}) - ${lead.subscribed_at.split('T')[0]}`);
      });
    });

    // Show untracked leads
    if (untrackedLeads.length > 0) {
      console.log('\n' + '=' .repeat(80));
      console.log('❓ UNTRACKED LEADS (No campaign ID found)');
      console.log('=' .repeat(80));
      
      untrackedLeads.forEach(lead => {
        console.log(`\n📧 ${lead.email} (${lead.name || 'No name'})`);
        console.log(`   Source: ${lead.source || 'Unknown'}`);
        console.log(`   Date: ${lead.subscribed_at.split('T')[0]}`);
        console.log(`   Notes: ${lead.notes || 'No notes'}`);
        if (lead.utm_campaign) {
          console.log(`   UTM Campaign: ${lead.utm_campaign}`);
        }
      });
    }

    // Overall performance summary
    console.log('\n' + '=' .repeat(80));
    console.log('📈 OVERALL PERFORMANCE SUMMARY');
    console.log('=' .repeat(80));
    
    const totalTrackedLeads = Object.values(campaignLeads).reduce((sum, data) => sum + data.totalLeads, 0);
    const totalSpend = Object.values(campaignLeads).reduce((sum, data) => sum + data.campaign.spend, 0);
    const totalClicks = Object.values(campaignLeads).reduce((sum, data) => sum + data.campaign.clicks, 0);
    const totalImpressions = Object.values(campaignLeads).reduce((sum, data) => sum + data.campaign.impressions, 0);
    
    console.log(`\n📊 Total Tracked Leads: ${totalTrackedLeads}`);
    console.log(`💰 Total Spend: €${totalSpend.toFixed(2)}`);
    console.log(`🖱️ Total Clicks: ${totalClicks}`);
    console.log(`👁️ Total Impressions: ${totalImpressions}`);
    
    if (totalTrackedLeads > 0 && totalSpend > 0) {
      const avgCostPerLead = totalSpend / totalTrackedLeads;
      const overallConversionRate = (totalTrackedLeads / totalClicks) * 100;
      console.log(`🎯 Average Cost per Lead: €${avgCostPerLead.toFixed(2)}`);
      console.log(`🔄 Overall Conversion Rate: ${overallConversionRate.toFixed(2)}%`);
    }
    
    if (totalImpressions > 0) {
      const overallCTR = (totalClicks / totalImpressions) * 100;
      console.log(`📈 Overall CTR: ${overallCTR.toFixed(2)}%`);
    }

    // Best performing campaign
    if (sortedCampaigns.length > 0) {
      const bestCampaign = sortedCampaigns[0];
      console.log(`\n🏆 BEST PERFORMING CAMPAIGN: ${bestCampaign.campaign.name}`);
      console.log(`   • Leads: ${bestCampaign.totalLeads}`);
      console.log(`   • Spend: €${bestCampaign.campaign.spend}`);
      if (bestCampaign.totalLeads > 0 && bestCampaign.campaign.spend > 0) {
        const costPerLead = bestCampaign.campaign.spend / bestCampaign.totalLeads;
        console.log(`   • Cost per Lead: €${costPerLead.toFixed(2)}`);
      }
    }

    // Recommendations
    console.log('\n' + '=' .repeat(80));
    console.log('💡 RECOMMENDATIONS');
    console.log('=' .repeat(80));
    
    if (sortedCampaigns.length > 0) {
      const bestCampaign = sortedCampaigns[0];
      console.log(`\n✅ SCALE UP: ${bestCampaign.campaign.name}`);
      console.log(`   • This campaign is generating the most leads`);
      console.log(`   • Consider increasing budget for this campaign`);
      
      if (bestCampaign.campaign.status === 'PAUSED') {
        console.log(`   • ⚠️ Campaign is currently PAUSED - consider reactivating`);
      }
    }
    
    const pausedCampaigns = sortedCampaigns.filter(c => c.campaign.status === 'PAUSED');
    if (pausedCampaigns.length > 0) {
      console.log(`\n⏸️ PAUSED CAMPAIGNS (${pausedCampaigns.length}):`);
      pausedCampaigns.forEach(campaign => {
        console.log(`   • ${campaign.campaign.name} - ${campaign.totalLeads} leads`);
      });
    }
    
    if (untrackedLeads.length > 0) {
      console.log(`\n🔍 TRACKING ISSUE: ${untrackedLeads.length} leads without campaign tracking`);
      console.log(`   • Improve UTM parameter tracking`);
      console.log(`   • Add campaign notes to all leads`);
    }

  } catch (error) {
    console.error('❌ Error in detailed analysis:', error);
  }
}

detailedFacebookAnalysis();
