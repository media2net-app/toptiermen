const http = require('http');

async function analyzeFacebookPerformance() {
  try {
    console.log('📊 Facebook Ads Performance Analyse - 25 Augustus 2025\n');

    // Fetch current data
    console.log('🔍 Ophalen van huidige performance data...\n');
    
    const [analyticsResult, leadsResult] = await Promise.all([
      makeRequest('/api/facebook/comprehensive-analytics?useManualData=true', 'GET'),
      makeRequest('/api/prelaunch-leads', 'GET')
    ]);

    if (!analyticsResult.success || !leadsResult.success) {
      console.error('❌ Kon data niet ophalen');
      return;
    }

    // Analyze campaign performance
    const campaigns = analyticsResult.data.campaigns;
    const leads = leadsResult.leads || [];
    
    // Filter Facebook ad leads
    const facebookAdLeads = leads.filter(lead => 
      lead.notes && lead.notes.includes('Campaign:') && !lead.notes.includes('Campaign: test')
    );

    console.log('📈 PERFORMANCE OVERZICHT\n');
    console.log('='.repeat(50));

    // Campaign breakdown
    console.log('\n🎯 CAMPAIGN BREAKDOWN:');
    console.log('-'.repeat(30));
    
    let totalSpend = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let bestCampaign = null;
    let worstCampaign = null;

    campaigns.forEach((campaign, index) => {
      const ctr = campaign.ctr * 100;
      const performance = getPerformanceRating(ctr, campaign.cpc);
      
      console.log(`${index + 1}. ${campaign.name}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Clicks: ${campaign.clicks.toLocaleString()}`);
      console.log(`   Spend: €${campaign.spend.toFixed(2)}`);
      console.log(`   CTR: ${ctr.toFixed(2)}%`);
      console.log(`   CPC: €${campaign.cpc.toFixed(3)}`);
      console.log(`   Performance: ${performance}\n`);

      totalSpend += campaign.spend;
      totalClicks += campaign.clicks;
      totalImpressions += campaign.impressions;

      if (!bestCampaign || campaign.ctr > bestCampaign.ctr) {
        bestCampaign = campaign;
      }
      if (!worstCampaign || campaign.cpc > worstCampaign.cpc) {
        worstCampaign = campaign;
      }
    });

    // Overall metrics
    const avgCTR = (totalClicks / totalImpressions) * 100;
    const avgCPC = totalSpend / totalClicks;
    const leadConversionRate = (facebookAdLeads.length / totalClicks) * 100;
    const costPerLead = totalSpend / facebookAdLeads.length;

    console.log('📊 OVERALL METRICS:');
    console.log('-'.repeat(20));
    console.log(`Totaal Besteed: €${totalSpend.toFixed(2)}`);
    console.log(`Totaal Clicks: ${totalClicks.toLocaleString()}`);
    console.log(`Totaal Impressions: ${totalImpressions.toLocaleString()}`);
    console.log(`Gemiddelde CTR: ${avgCTR.toFixed(2)}%`);
    console.log(`Gemiddelde CPC: €${avgCPC.toFixed(3)}`);
    console.log(`Facebook Ad Leads: ${facebookAdLeads.length}`);
    console.log(`Lead Conversie Rate: ${leadConversionRate.toFixed(2)}%`);
    console.log(`Cost per Lead: €${costPerLead.toFixed(2)}\n`);

    // Performance analysis
    console.log('🔍 PERFORMANCE ANALYSE:');
    console.log('-'.repeat(25));

    console.log(`✅ Beste Campagne: ${bestCampaign.name}`);
    console.log(`   CTR: ${(bestCampaign.ctr * 100).toFixed(2)}%`);
    console.log(`   CPC: €${bestCampaign.cpc.toFixed(3)}`);

    console.log(`❌ Slechtste Campagne: ${worstCampaign.name}`);
    console.log(`   CTR: ${(worstCampaign.ctr * 100).toFixed(2)}%`);
    console.log(`   CPC: €${worstCampaign.cpc.toFixed(3)}\n`);

    // Recommendations
    console.log('💡 AANBEVELINGEN:');
    console.log('-'.repeat(20));

    // Budget reallocation
    console.log('💰 BUDGET HERVERDELING:');
    const budgetRecommendations = getBudgetRecommendations(campaigns);
    budgetRecommendations.forEach(rec => {
      console.log(`   ${rec.campaign}: ${rec.action} (${rec.reason})`);
    });

    // Targeting improvements
    console.log('\n🎯 TARGETING VERBETERINGEN:');
    campaigns.forEach(campaign => {
      if (campaign.ctr < 0.06) {
        console.log(`   ${campaign.name}: CTR te laag (${(campaign.ctr * 100).toFixed(2)}%)`);
        console.log(`      → Verfijn targeting, update ad copy`);
      }
      if (campaign.cpc > 0.20) {
        console.log(`   ${campaign.name}: CPC te hoog (€${campaign.cpc.toFixed(3)})`);
        console.log(`      → Test nieuwe audiences, optimaliseer bids`);
      }
    });

    // Conversion optimization
    console.log('\n🔄 CONVERSION OPTIMALISATIE:');
    if (leadConversionRate < 1) {
      console.log(`   Lead conversie rate te laag: ${leadConversionRate.toFixed(2)}%`);
      console.log(`   → Optimaliseer landing pages`);
      console.log(`   → Test verschillende lead magnets`);
      console.log(`   → Implementeer retargeting campagnes`);
    }

    // Goals vs current performance
    console.log('\n🎯 DOELEN VS HUIDIGE PERFORMANCE:');
    console.log('-'.repeat(35));
    
    const goals = {
      ctr: 8.0,
      cpc: 0.15,
      leadConversion: 2.0,
      costPerLead: 15.0
    };

    console.log(`CTR Doel: ${goals.ctr}% | Huidig: ${avgCTR.toFixed(2)}% | ${avgCTR >= goals.ctr ? '✅' : '❌'}`);
    console.log(`CPC Doel: €${goals.cpc} | Huidig: €${avgCPC.toFixed(3)} | ${avgCPC <= goals.cpc ? '✅' : '❌'}`);
    console.log(`Lead Conv. Doel: ${goals.leadConversion}% | Huidig: ${leadConversionRate.toFixed(2)}% | ${leadConversionRate >= goals.leadConversion ? '✅' : '❌'}`);
    console.log(`Cost/Lead Doel: €${goals.costPerLead} | Huidig: €${costPerLead.toFixed(2)} | ${costPerLead <= goals.costPerLead ? '✅' : '❌'}`);

    // Priority actions
    console.log('\n🚀 PRIORITEIT ACTIES:');
    console.log('-'.repeat(20));
    
    const actions = getPriorityActions(campaigns, avgCTR, avgCPC, leadConversionRate, costPerLead);
    actions.forEach((action, index) => {
      console.log(`${index + 1}. ${action}`);
    });

    console.log('\n📅 VOLGENDE STAPPEN:');
    console.log('-'.repeat(20));
    console.log('Week 1: Budget herverdeling & targeting optimalisaties');
    console.log('Week 2: Lookalike audiences & A/B testing');
    console.log('Week 3: Retargeting campagnes & performance evaluatie');

    console.log('\n🎉 Analyse voltooid! Bekijk het Ads Logboek voor het complete verbeteringsplan.');

  } catch (error) {
    console.error('❌ Analyse failed:', error.message);
  }
}

function getPerformanceRating(ctr, cpc) {
  if (ctr >= 7 && cpc <= 0.15) return '⭐⭐⭐⭐⭐';
  if (ctr >= 6 && cpc <= 0.18) return '⭐⭐⭐⭐';
  if (ctr >= 5 && cpc <= 0.20) return '⭐⭐⭐';
  if (ctr >= 4 && cpc <= 0.25) return '⭐⭐';
  return '⭐';
}

function getBudgetRecommendations(campaigns) {
  const recommendations = [];
  
  campaigns.forEach(campaign => {
    const ctr = campaign.ctr * 100;
    const cpc = campaign.cpc;
    
    if (ctr >= 7 && cpc <= 0.15) {
      recommendations.push({
        campaign: campaign.name,
        action: 'Verhoog budget',
        reason: 'Uitstekende performance'
      });
    } else if (ctr < 5 || cpc > 0.25) {
      recommendations.push({
        campaign: campaign.name,
        action: 'Verlaag budget',
        reason: 'Onderpresterend'
      });
    } else {
      recommendations.push({
        campaign: campaign.name,
        action: 'Houd budget gelijk',
        reason: 'Acceptabele performance'
      });
    }
  });
  
  return recommendations;
}

function getPriorityActions(campaigns, avgCTR, avgCPC, leadConversionRate, costPerLead) {
  const actions = [];
  
  if (avgCTR < 7) {
    actions.push('Verhoog CTR door ad copy optimalisatie');
  }
  
  if (avgCPC > 0.18) {
    actions.push('Verlaag CPC door targeting verfijning');
  }
  
  if (leadConversionRate < 1.5) {
    actions.push('Verbeter lead conversie door landing page optimalisatie');
  }
  
  if (costPerLead > 20) {
    actions.push('Verlaag cost per lead door budget herverdeling');
  }
  
  // Campaign specific actions
  const worstCampaign = campaigns.reduce((worst, current) => 
    current.cpc > worst.cpc ? current : worst
  );
  
  if (worstCampaign.cpc > 0.20) {
    actions.push(`Pause ${worstCampaign.name} (hoogste CPC: €${worstCampaign.cpc.toFixed(3)})`);
  }
  
  return actions;
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

analyzeFacebookPerformance();
