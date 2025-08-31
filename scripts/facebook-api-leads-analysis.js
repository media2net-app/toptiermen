const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchFacebookCampaignData() {
  console.log('📊 FACEBOOK API LEADS ANALYSIS\n');
  console.log('🎯 Period: Start tot 31 augustus 2025\n');

  try {
    // Fetch real Facebook campaign data from API
    const response = await fetch('http://localhost:3000/api/facebook/get-campaigns');
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Failed to fetch Facebook campaign data:', data.error);
      return;
    }

    const campaignsData = data.data;
    
    // Convert array to object with campaign ID as key
    const campaigns = {};
    campaignsData.forEach(campaign => {
      campaigns[campaign.id] = {
        name: campaign.name,
        status: campaign.status,
        clicks: campaign.clicks,
        spend: campaign.spent,
        impressions: campaign.impressions,
        reach: campaign.reach,
        ctr: campaign.ctr,
        cpc: campaign.cpc,
        leads: campaign.leads,
        conversions: campaign.conversions,
        budget: campaign.budget,
        budgetRemaining: campaign.budget - campaign.spent
      };
    });
    console.log(`📈 Facebook campaigns found: ${Object.keys(campaigns).length}\n`);

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

    console.log(`📅 August 2025 leads: ${augustLeads.length}\n`);

    // Analyze Facebook campaign leads specifically
    const facebookCampaignLeads = {};
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
      
      // Check if this campaign exists in Facebook API data
      if (campaignId && campaigns[campaignId]) {
        if (!facebookCampaignLeads[campaignId]) {
          facebookCampaignLeads[campaignId] = {
            campaign: campaigns[campaignId],
            leads: [],
            totalLeads: 0,
            leadEmails: [],
            leadNames: [],
            leadDates: []
          };
        }
        facebookCampaignLeads[campaignId].leads.push(lead);
        facebookCampaignLeads[campaignId].totalLeads++;
        facebookCampaignLeads[campaignId].leadEmails.push(lead.email);
        facebookCampaignLeads[campaignId].leadNames.push(lead.name || 'No name');
        facebookCampaignLeads[campaignId].leadDates.push(lead.subscribed_at.split('T')[0]);
      } else if (lead.source === 'Facebook Ad' || lead.utm_source === 'facebook') {
        untrackedLeads.push(lead);
      }
    });

    console.log('🏆 FACEBOOK CAMPAIGN LEADS ANALYSIS\n');
    console.log('=' .repeat(80));

    // Sort campaigns by performance (leads first, then cost per lead)
    const sortedCampaigns = Object.keys(facebookCampaignLeads)
      .map(id => ({ id, ...facebookCampaignLeads[id] }))
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

    if (sortedCampaigns.length === 0) {
      console.log('❌ No Facebook campaign leads found with proper tracking\n');
    } else {
      sortedCampaigns.forEach((campaignData, index) => {
        const { id, campaign, leads, totalLeads, leadEmails, leadNames, leadDates } = campaignData;
        
        console.log(`\n${index + 1}. ${campaign.name}`);
        console.log(`   📊 Campaign ID: ${id}`);
        console.log(`   📈 Facebook API Metrics:`);
        console.log(`      • Status: ${campaign.status}`);
        console.log(`      • Leads Generated: ${totalLeads}`);
        console.log(`      • Facebook Leads: ${campaign.leads || 0}`);
        console.log(`      • Clicks: ${campaign.clicks || 0}`);
        console.log(`      • Impressions: ${campaign.impressions || 0}`);
        console.log(`      • Reach: ${campaign.reach || 0}`);
        console.log(`      • Spend: €${campaign.spend || 0}`);
        console.log(`      • Budget: €${campaign.budget || 0}`);
        console.log(`      • Budget Remaining: €${campaign.budgetRemaining || 0}`);
        
        if (campaign.ctr) {
          console.log(`      • CTR: ${(campaign.ctr * 100).toFixed(2)}%`);
        }
        if (campaign.cpc) {
          console.log(`      • CPC: €${campaign.cpc.toFixed(3)}`);
        }
        
        if (totalLeads > 0 && campaign.spend > 0) {
          const costPerLead = campaign.spend / totalLeads;
          const conversionRate = campaign.clicks > 0 ? (totalLeads / campaign.clicks) * 100 : 0;
          console.log(`      • Cost per Lead: €${costPerLead.toFixed(2)}`);
          console.log(`      • Conversion Rate: ${conversionRate.toFixed(2)}%`);
        }
        
        console.log(`   📧 Generated Leads:`);
        leadNames.forEach((name, i) => {
          console.log(`      • ${name} (${leadEmails[i]}) - ${leadDates[i]}`);
        });
      });
    }

    // Show untracked Facebook leads
    if (untrackedLeads.length > 0) {
      console.log('\n' + '=' .repeat(80));
      console.log('❓ UNTRACKED FACEBOOK LEADS (No campaign ID found)');
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

    // Overall Facebook performance summary
    console.log('\n' + '=' .repeat(80));
    console.log('📈 FACEBOOK CAMPAIGNS OVERALL SUMMARY');
    console.log('=' .repeat(80));
    
    const totalFacebookLeads = Object.values(facebookCampaignLeads).reduce((sum, data) => sum + data.totalLeads, 0);
    const totalSpend = Object.values(facebookCampaignLeads).reduce((sum, data) => sum + (data.campaign.spend || 0), 0);
    const totalClicks = Object.values(facebookCampaignLeads).reduce((sum, data) => sum + (data.campaign.clicks || 0), 0);
    const totalImpressions = Object.values(facebookCampaignLeads).reduce((sum, data) => sum + (data.campaign.impressions || 0), 0);
    
    console.log(`\n📊 Total Facebook Campaign Leads: ${totalFacebookLeads}`);
    console.log(`💰 Total Facebook Spend: €${totalSpend.toFixed(2)}`);
    console.log(`🖱️ Total Facebook Clicks: ${totalClicks}`);
    console.log(`👁️ Total Facebook Impressions: ${totalImpressions}`);
    
    if (totalFacebookLeads > 0 && totalSpend > 0) {
      const avgCostPerLead = totalSpend / totalFacebookLeads;
      const overallConversionRate = totalClicks > 0 ? (totalFacebookLeads / totalClicks) * 100 : 0;
      console.log(`🎯 Average Cost per Lead: €${avgCostPerLead.toFixed(2)}`);
      console.log(`🔄 Overall Conversion Rate: ${overallConversionRate.toFixed(2)}%`);
    }
    
    if (totalImpressions > 0) {
      const overallCTR = (totalClicks / totalImpressions) * 100;
      console.log(`📈 Overall CTR: ${overallCTR.toFixed(2)}%`);
    }

    // Campaign status breakdown
    const activeCampaigns = Object.values(campaigns).filter(c => c.status === 'ACTIVE');
    const pausedCampaigns = Object.values(campaigns).filter(c => c.status === 'PAUSED');
    
    console.log(`\n📊 Campaign Status:`);
    console.log(`   • Active: ${activeCampaigns.length}`);
    console.log(`   • Paused: ${pausedCampaigns.length}`);

    // Best performing campaign
    if (sortedCampaigns.length > 0) {
      const bestCampaign = sortedCampaigns[0];
      console.log(`\n🏆 BEST PERFORMING FACEBOOK CAMPAIGN: ${bestCampaign.campaign.name}`);
      console.log(`   • Leads: ${bestCampaign.totalLeads}`);
      console.log(`   • Spend: €${bestCampaign.campaign.spend || 0}`);
      if (bestCampaign.totalLeads > 0 && bestCampaign.campaign.spend > 0) {
        const costPerLead = bestCampaign.campaign.spend / bestCampaign.totalLeads;
        console.log(`   • Cost per Lead: €${costPerLead.toFixed(2)}`);
      }
    }

    // Recommendations
    console.log('\n' + '=' .repeat(80));
    console.log('💡 RECOMMENDATIONS FOR FACEBOOK CAMPAIGNS');
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
    
    const pausedCampaignsWithLeads = sortedCampaigns.filter(c => c.campaign.status === 'PAUSED');
    if (pausedCampaignsWithLeads.length > 0) {
      console.log(`\n⏸️ PAUSED CAMPAIGNS WITH LEADS (${pausedCampaignsWithLeads.length}):`);
      pausedCampaignsWithLeads.forEach(campaign => {
        console.log(`   • ${campaign.campaign.name} - ${campaign.totalLeads} leads`);
      });
    }
    
    if (untrackedLeads.length > 0) {
      console.log(`\n🔍 TRACKING ISSUE: ${untrackedLeads.length} Facebook leads without campaign tracking`);
      console.log(`   • Improve UTM parameter tracking`);
      console.log(`   • Add campaign notes to all Facebook leads`);
    }

    // Show all Facebook campaigns (even those without leads)
    console.log('\n' + '=' .repeat(80));
    console.log('📋 ALL FACEBOOK CAMPAIGNS OVERVIEW');
    console.log('=' .repeat(80));
    
    Object.keys(campaigns).forEach(campaignId => {
      const campaign = campaigns[campaignId];
      const hasLeads = facebookCampaignLeads[campaignId];
      
      console.log(`\n📊 ${campaign.name}`);
      console.log(`   ID: ${campaignId}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Spend: €${campaign.spend || 0}`);
      console.log(`   Clicks: ${campaign.clicks || 0}`);
      console.log(`   Impressions: ${campaign.impressions || 0}`);
      console.log(`   Leads: ${hasLeads ? hasLeads.totalLeads : 0}`);
      
      if (hasLeads && hasLeads.totalLeads > 0) {
        console.log(`   ✅ Has generated leads`);
      } else {
        console.log(`   ❌ No leads generated`);
      }
    });

  } catch (error) {
    console.error('❌ Error in Facebook API analysis:', error);
  }
}

fetchFacebookCampaignData();
