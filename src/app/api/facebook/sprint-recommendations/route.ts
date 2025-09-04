import { NextRequest, NextResponse } from 'next/server';

interface CampaignMetrics {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget: number;
  spend: number;
  conversions: number;
  cpc: number;
  conversion_rate: number;
  roas: number;
  performance_score: number;
  recommendation_category: string;
  clicks: number;
  impressions: number;
}

interface SprintRecommendation {
  type: 'budget_increase' | 'budget_decrease' | 'audience_optimization' | 'creative_refresh' | 'objective_change' | 'pause_campaign';
  priority: 'high' | 'medium' | 'low';
  campaign_id: string;
  campaign_name: string;
  title: string;
  description: string;
  expected_impact: string;
  implementation_effort: 'low' | 'medium' | 'high';
  estimated_budget_change: number;
}

export async function POST(request: NextRequest) {
  try {
    const { campaigns, timeframe, current_total_budget } = await request.json();
    
    console.log('🤖 Generating AI-powered sprint recommendations...');
    console.log(`📊 Analyzing ${campaigns.length} campaigns over ${timeframe}`);
    
    const recommendations: SprintRecommendation[] = [];
    let total_budget_recommendation = current_total_budget;
    
    // Sort campaigns by performance score
    const sortedCampaigns = [...campaigns].sort((a, b) => b.performance_score - a.performance_score);
    
    // Analysis for each campaign
    for (const campaign of campaigns) {
      const recs = analyzeCampaign(campaign);
      recommendations.push(...recs);
    }
    
    // Strategic recommendations based on overall portfolio
    const portfolioRecs = analyzePortfolio(sortedCampaigns, current_total_budget);
    recommendations.push(...portfolioRecs.recommendations);
    total_budget_recommendation = portfolioRecs.recommended_budget;
    
    // Sort recommendations by priority
    const prioritizedRecs = recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    console.log(`✅ Generated ${prioritizedRecs.length} recommendations`);
    console.log(`💰 Total budget recommendation: €${total_budget_recommendation.toFixed(2)}`);
    
    return NextResponse.json({
      success: true,
      recommendations: prioritizedRecs,
      total_budget_recommendation,
      analysis_summary: {
        total_campaigns: campaigns.length,
        excellent_campaigns: campaigns.filter((c: CampaignMetrics) => c.performance_score >= 80).length,
        poor_campaigns: campaigns.filter((c: CampaignMetrics) => c.performance_score < 40).length,
        high_priority_actions: prioritizedRecs.filter(r => r.priority === 'high').length
      }
    });
    
  } catch (error) {
    console.error('❌ Sprint Recommendations Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate recommendations'
    }, { status: 500 });
  }
}

function analyzeCampaign(campaign: CampaignMetrics): SprintRecommendation[] {
  const recs: SprintRecommendation[] = [];
  
  // High performers - scale up
  if (campaign.performance_score >= 80 && campaign.roas > 3) {
    recs.push({
      type: 'budget_increase',
      priority: 'high',
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      title: 'Schaal Top Performer Op',
      description: `Excellent performance met ${campaign.performance_score.toFixed(0)} score en ${campaign.roas.toFixed(1)}x ROAS. Verhoog budget om meer conversies te realiseren.`,
      expected_impact: `+${Math.round(campaign.conversions * 0.5)} conversies/maand`,
      implementation_effort: 'low',
      estimated_budget_change: campaign.daily_budget * 0.5
    });
  }
  
  // Poor performers - needs attention
  if (campaign.performance_score < 40) {
    if (campaign.cpc > 2) {
      recs.push({
        type: 'audience_optimization',
        priority: 'high',
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        title: 'Optimaliseer Doelgroep',
        description: `Hoge CPC van €${campaign.cpc.toFixed(2)} suggereert verkeerde targeting. Verfijn doelgroep voor betere relevantie.`,
        expected_impact: `CPC daling van 30-50%`,
        implementation_effort: 'medium',
        estimated_budget_change: 0
      });
    }
    
    if (campaign.conversion_rate < 2) {
      recs.push({
        type: 'creative_refresh',
        priority: 'medium',
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        title: 'Ververs Creative Assets',
        description: `Lage conversie ratio van ${campaign.conversion_rate.toFixed(1)}%. Nieuwe creatives kunnen engagement verhogen.`,
        expected_impact: `Conversie stijging 25-40%`,
        implementation_effort: 'high',
        estimated_budget_change: 0
      });
    }
    
    if (campaign.roas < 1.5 && campaign.spend > 100) {
      recs.push({
        type: 'pause_campaign',
        priority: 'high',
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        title: 'Pauzeer Onderpresterende Campagne',
        description: `Slechte ROAS van ${campaign.roas.toFixed(1)}x en hoge uitgaven. Stop verlies en hergroepeer budget.`,
        expected_impact: `Bespaart €${campaign.daily_budget.toFixed(2)}/dag`,
        implementation_effort: 'low',
        estimated_budget_change: -campaign.daily_budget
      });
    }
  }
  
  // Medium performers - optimize
  if (campaign.performance_score >= 40 && campaign.performance_score < 80) {
    if (campaign.conversion_rate > 3 && campaign.cpc < 1.5) {
      recs.push({
        type: 'budget_increase',
        priority: 'medium',
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        title: 'Verhoog Budget Stabiele Performer',
        description: `Goede conversie ratio van ${campaign.conversion_rate.toFixed(1)}% en lage CPC. Ruimte voor schaling.`,
        expected_impact: `+${Math.round(campaign.conversions * 0.3)} conversies/maand`,
        implementation_effort: 'low',
        estimated_budget_change: campaign.daily_budget * 0.3
      });
    }
    
    if (campaign.objective === 'REACH' && campaign.conversions > 0) {
      recs.push({
        type: 'objective_change',
        priority: 'medium',
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        title: 'Wijzig naar Conversie Objective',
        description: `Campagne toont conversie potentieel ondanks reach objective. Switch naar conversie optimalisatie.`,
        expected_impact: `Conversie stijging 20-35%`,
        implementation_effort: 'medium',
        estimated_budget_change: 0
      });
    }
  }
  
  // Budget efficiency checks
  if (campaign.daily_budget > 50 && campaign.conversions === 0) {
    recs.push({
      type: 'budget_decrease',
      priority: 'medium',
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      title: 'Reduceer Budget Zonder Conversies',
      description: `Hoog budget van €${campaign.daily_budget.toFixed(2)}/dag zonder conversies. Test met lager budget.`,
      expected_impact: `Bespaart €${(campaign.daily_budget * 0.7).toFixed(2)}/dag`,
      implementation_effort: 'low',
      estimated_budget_change: -campaign.daily_budget * 0.7
    });
  }
  
  return recs;
}

function analyzePortfolio(campaigns: CampaignMetrics[], current_budget: number): { recommendations: SprintRecommendation[], recommended_budget: number } {
  const recs: SprintRecommendation[] = [];
  let recommended_budget = current_budget;
  
  const excellent_campaigns = campaigns.filter(c => c.performance_score >= 80);
  const poor_campaigns = campaigns.filter(c => c.performance_score < 40);
  const total_spend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const total_conversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  
  // Portfolio-level insights
  if (excellent_campaigns.length > 0 && poor_campaigns.length > 0) {
    const poor_budget = poor_campaigns.reduce((sum, c) => sum + c.daily_budget, 0);
    const excellent_budget = excellent_campaigns.reduce((sum, c) => sum + c.daily_budget, 0);
    
    recs.push({
      type: 'budget_increase',
      priority: 'high',
      campaign_id: 'portfolio',
      campaign_name: 'Portfolio Optimalisatie',
      title: 'Herbalanceer Budget Naar Top Performers',
      description: `Verschuif €${poor_budget.toFixed(2)} van slecht presterende campagnes naar top performers voor maximaal rendement.`,
      expected_impact: `ROAS verbetering van 40-60%`,
      implementation_effort: 'medium',
      estimated_budget_change: 0
    });
    
    // Recommend increasing budget for excellent campaigns
    recommended_budget = current_budget + (excellent_budget * 0.3);
  }
  
  // Diversification check
  const active_campaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
  if (active_campaigns < 3) {
    recs.push({
      type: 'audience_optimization',
      priority: 'medium',
      campaign_id: 'portfolio',
      campaign_name: 'Portfolio Diversificatie',
      title: 'Creëer Meer Campagne Variatie',
      description: `Slechts ${active_campaigns} actieve campagnes. Risico van te weinig diversiteit in targeting en creatives.`,
      expected_impact: `Risico spreiding en nieuwe opportuniteiten`,
      implementation_effort: 'high',
      estimated_budget_change: current_budget * 0.2
    });
  }
  
  // Overall conversion efficiency
  const avg_conversion_rate = total_conversions > 0 ? (total_conversions / campaigns.reduce((sum, c) => sum + c.clicks, 0)) * 100 : 0;
  if (avg_conversion_rate < 3) {
    recs.push({
      type: 'creative_refresh',
      priority: 'high',
      campaign_id: 'portfolio',
      campaign_name: 'Portfolio Conversie Optimalisatie',
      title: 'Portfolio-brede Conversie Verbetering',
      description: `Gemiddelde conversie ratio van ${avg_conversion_rate.toFixed(1)}% is onder industrie standaard. Focus op landing page en funnel optimalisatie.`,
      expected_impact: `Conversie stijging 30-50% portfolio-breed`,
      implementation_effort: 'high',
      estimated_budget_change: 0
    });
  }
  
  // Budget recommendation based on performance
  const high_roas_campaigns = campaigns.filter(c => c.roas > 3);
  if (high_roas_campaigns.length > 0) {
    const potential_increase = high_roas_campaigns.reduce((sum, c) => sum + c.daily_budget, 0) * 0.5;
    recommended_budget = Math.max(recommended_budget, current_budget + potential_increase);
  }
  
  return {
    recommendations: recs,
    recommended_budget: Math.min(recommended_budget, current_budget * 2) // Cap at 2x increase
  };
}
