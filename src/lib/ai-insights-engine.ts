// AI-Powered Insights Engine
// Generates automated insights, trend predictions, and strategic recommendations

interface AdInsight {
  id: string;
  type: 'trend' | 'opportunity' | 'threat' | 'recommendation' | 'prediction' | 'anomaly' | 'sentiment';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'high' | 'medium' | 'low';
  category: 'creative' | 'targeting' | 'timing' | 'budget' | 'platform' | 'content';
  dataPoints: string[];
  recommendations: string[];
  predictedOutcome?: string;
  timeframe?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  anomalyScore?: number;
  createdAt: string;
}

interface TrendAnalysis {
  id: string;
  trend: string;
  direction: 'up' | 'down' | 'stable';
  strength: number; // 0-100
  confidence: number; // 0-100
  timeframe: string;
  indicators: string[];
  impact: 'high' | 'medium' | 'low';
}

interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  emotions: {
    joy: number;
    trust: number;
    fear: number;
    surprise: number;
    sadness: number;
    disgust: number;
    anger: number;
    anticipation: number;
  };
  keywords: Array<{
    word: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    frequency: number;
  }>;
}

interface AnomalyDetection {
  type: 'performance' | 'spend' | 'creative' | 'timing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  description: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  recommendations: string[];
}

interface CompetitorInsight {
  competitorId: string;
  competitorName: string;
  insights: AdInsight[];
  trends: TrendAnalysis[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  overallScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  sentimentAnalysis: SentimentAnalysis;
  anomalies: AnomalyDetection[];
  lastUpdated: string;
}

interface MarketInsight {
  marketTrends: TrendAnalysis[];
  emergingPatterns: string[];
  seasonalFactors: string[];
  competitiveLandscape: {
    topPerformers: string[];
    risingStars: string[];
    decliningPlayers: string[];
  };
  recommendations: string[];
  riskFactors: string[];
  marketSentiment: SentimentAnalysis;
  marketAnomalies: AnomalyDetection[];
}

class AIInsightsEngine {
  private insights: AdInsight[] = [];
  private competitorInsights: Map<string, CompetitorInsight> = new Map();
  private marketInsights: MarketInsight | null = null;

  /**
   * Analyze competitor ads and generate insights
   */
  async analyzeCompetitorAds(ads: any[], competitors: any[]): Promise<CompetitorInsight[]> {
    const competitorInsights: CompetitorInsight[] = [];

    for (const competitor of competitors) {
      const competitorAds = ads.filter(ad => ad.competitorId === competitor.id);
      
      if (competitorAds.length === 0) continue;

      const insights = await this.generateAdInsights(competitorAds, competitor);
      const trends = await this.analyzeTrends(competitorAds);
      const swot = await this.performSWOTAnalysis(competitorAds, competitor);
      const sentiment = await this.performSentimentAnalysis(competitorAds);
      const anomalies = await this.detectAnomalies(competitorAds);

      const competitorInsight: CompetitorInsight = {
        competitorId: competitor.id,
        competitorName: competitor.name,
        insights,
        trends,
        strengths: swot.strengths,
        weaknesses: swot.weaknesses,
        opportunities: swot.opportunities,
        threats: swot.threats,
        overallScore: this.calculateOverallScore(insights, trends),
        riskLevel: this.determineRiskLevel(swot),
        sentimentAnalysis: sentiment,
        anomalies,
        lastUpdated: new Date().toISOString()
      };

      competitorInsights.push(competitorInsight);
      this.competitorInsights.set(competitor.id, competitorInsight);
    }

    return competitorInsights;
  }

  /**
   * Generate AI-powered insights from ad data
   */
  private async generateAdInsights(ads: any[], competitor: any): Promise<AdInsight[]> {
    const insights: AdInsight[] = [];

    // Analyze ad performance patterns
    const performanceInsights = this.analyzePerformancePatterns(ads);
    insights.push(...performanceInsights);

    // Analyze creative patterns
    const creativeInsights = this.analyzeCreativePatterns(ads);
    insights.push(...creativeInsights);

    // Analyze targeting strategies
    const targetingInsights = this.analyzeTargetingStrategies(ads);
    insights.push(...targetingInsights);

    // Analyze timing patterns
    const timingInsights = this.analyzeTimingPatterns(ads);
    insights.push(...timingInsights);

    // Generate predictions
    const predictionInsights = this.generatePredictions(ads, competitor);
    insights.push(...predictionInsights);

    return insights;
  }

  /**
   * Analyze performance patterns
   */
  private analyzePerformancePatterns(ads: any[]): AdInsight[] {
    const insights: AdInsight[] = [];

    // Calculate average performance metrics
    const avgCTR = ads.reduce((sum, ad) => sum + (ad.ctr || 0), 0) / ads.length;
    const avgCPM = ads.reduce((sum, ad) => sum + (ad.cpm || 0), 0) / ads.length;
    const avgEngagement = ads.reduce((sum, ad) => sum + (ad.engagement || 0), 0) / ads.length;

    // Identify top performing ads
    const topAds = ads.sort((a, b) => (b.ctr || 0) - (a.ctr || 0)).slice(0, 3);

    if (topAds.length > 0) {
      insights.push({
        id: `perf-${Date.now()}-1`,
        type: 'opportunity',
        title: 'High-Performing Ad Patterns Detected',
        description: `Top performing ads show ${(topAds[0].ctr * 100).toFixed(1)}% CTR, ${topAds[0].cpm.toFixed(2)}€ CPM. Consider replicating these patterns.`,
        confidence: 85,
        impact: 'high',
        category: 'creative',
        dataPoints: [
          `Average CTR: ${(avgCTR * 100).toFixed(1)}%`,
          `Average CPM: ${avgCPM.toFixed(2)}€`,
          `Top ad CTR: ${(topAds[0].ctr * 100).toFixed(1)}%`
        ],
        recommendations: [
          'Analyze creative elements of top-performing ads',
          'Test similar messaging and visuals',
          'Consider similar targeting strategies'
        ],
        createdAt: new Date().toISOString()
      });
    }

    // Detect performance trends
    const recentAds = ads.filter(ad => {
      const adDate = new Date(ad.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return adDate > thirtyDaysAgo;
    });

    if (recentAds.length > 0) {
      const recentAvgCTR = recentAds.reduce((sum, ad) => sum + (ad.ctr || 0), 0) / recentAds.length;
      
      if (recentAvgCTR > avgCTR * 1.2) {
        insights.push({
          id: `perf-${Date.now()}-2`,
          type: 'trend',
          title: 'Improving Performance Trend',
          description: 'Recent ads show 20%+ improvement in CTR, indicating optimization success.',
          confidence: 75,
          impact: 'medium',
          category: 'creative',
          dataPoints: [
            `Recent average CTR: ${(recentAvgCTR * 100).toFixed(1)}%`,
            `Overall average CTR: ${(avgCTR * 100).toFixed(1)}%`,
            `Improvement: ${(((recentAvgCTR - avgCTR) / avgCTR) * 100).toFixed(1)}%`
          ],
          recommendations: [
            'Continue current optimization strategies',
            'Monitor for sustained improvement',
            'Consider scaling successful approaches'
          ],
          createdAt: new Date().toISOString()
        });
      }
    }

    return insights;
  }

  /**
   * Analyze creative patterns
   */
  private analyzeCreativePatterns(ads: any[]): AdInsight[] {
    const insights: AdInsight[] = [];

    // Analyze content themes
    const contentThemes = this.extractContentThemes(ads);
    const mostUsedThemes = Object.entries(contentThemes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (mostUsedThemes.length > 0) {
      insights.push({
        id: `creative-${Date.now()}-1`,
        type: 'trend',
        title: 'Content Theme Analysis',
        description: `Most used content themes: ${mostUsedThemes.map(([theme, count]) => `${theme} (${count}x)`).join(', ')}`,
        confidence: 80,
        impact: 'medium',
        category: 'content',
        dataPoints: [
          `Total ads analyzed: ${ads.length}`,
          `Unique themes: ${Object.keys(contentThemes).length}`,
          `Most popular theme: ${mostUsedThemes[0][0]}`
        ],
        recommendations: [
          'Consider testing similar themes',
          'Look for gaps in theme coverage',
          'Analyze theme performance correlation'
        ],
        createdAt: new Date().toISOString()
      });
    }

    // Analyze call-to-action patterns
    const ctaPatterns = this.analyzeCTAPatterns(ads);
    if (ctaPatterns.mostEffective) {
      insights.push({
        id: `creative-${Date.now()}-2`,
        type: 'recommendation',
        title: 'Effective CTA Patterns',
        description: `Most effective CTAs: ${ctaPatterns.mostEffective.join(', ')}`,
        confidence: 70,
        impact: 'medium',
        category: 'creative',
        dataPoints: [
          `CTAs analyzed: ${ctaPatterns.total}`,
          `Most effective: ${ctaPatterns.mostEffective[0]}`,
          `Average CTR with effective CTAs: ${(ctaPatterns.avgCTR * 100).toFixed(1)}%`
        ],
        recommendations: [
          'Test similar CTA approaches',
          'A/B test different CTA variations',
          'Consider urgency and action-oriented language'
        ],
        createdAt: new Date().toISOString()
      });
    }

    return insights;
  }

  /**
   * Analyze targeting strategies
   */
  private analyzeTargetingStrategies(ads: any[]): AdInsight[] {
    const insights: AdInsight[] = [];

    // Analyze audience targeting
    const audienceInsights = this.analyzeAudienceTargeting(ads);
    if (audienceInsights.primaryAudience) {
      insights.push({
        id: `targeting-${Date.now()}-1`,
        type: 'trend',
        title: 'Primary Target Audience Identified',
        description: `Primary audience: ${audienceInsights.primaryAudience} (${audienceInsights.audiencePercentage}% of ads)`,
        confidence: 75,
        impact: 'high',
        category: 'targeting',
        dataPoints: [
          `Primary audience: ${audienceInsights.primaryAudience}`,
          `Audience coverage: ${audienceInsights.audiencePercentage}%`,
          `Secondary audiences: ${audienceInsights.secondaryAudiences.join(', ')}`
        ],
        recommendations: [
          'Consider targeting similar audiences',
          'Look for underserved audience segments',
          'Analyze audience-specific messaging'
        ],
        createdAt: new Date().toISOString()
      });
    }

    return insights;
  }

  /**
   * Analyze timing patterns
   */
  private analyzeTimingPatterns(ads: any[]): AdInsight[] {
    const insights: AdInsight[] = [];

    // Analyze posting times
    const timingAnalysis = this.analyzePostingTimes(ads);
    if (timingAnalysis.optimalTimes.length > 0) {
      insights.push({
        id: `timing-${Date.now()}-1`,
        type: 'recommendation',
        title: 'Optimal Posting Times Identified',
        description: `Best performing times: ${timingAnalysis.optimalTimes.join(', ')}`,
        confidence: 65,
        impact: 'medium',
        category: 'timing',
        dataPoints: [
          `Optimal times: ${timingAnalysis.optimalTimes.join(', ')}`,
          `Average engagement during optimal times: ${(timingAnalysis.avgEngagement * 100).toFixed(1)}%`,
          `Time slots analyzed: ${timingAnalysis.totalSlots}`
        ],
        recommendations: [
          'Schedule ads during optimal times',
          'Test different time slots',
          'Consider timezone differences'
        ],
        createdAt: new Date().toISOString()
      });
    }

    return insights;
  }

  /**
   * Generate predictions
   */
  private generatePredictions(ads: any[], competitor: any): AdInsight[] {
    const insights: AdInsight[] = [];

    // Predict future performance
    const performancePrediction = this.predictPerformance(ads);
    insights.push({
      id: `prediction-${Date.now()}-1`,
      type: 'prediction',
      title: 'Performance Prediction',
      description: `Predicted ${performancePrediction.direction} in performance over next 30 days`,
      confidence: performancePrediction.confidence,
      impact: 'high',
      category: 'platform',
      dataPoints: [
        `Predicted change: ${performancePrediction.change}%`,
        `Confidence level: ${performancePrediction.confidence}%`,
        `Based on ${ads.length} historical ads`
      ],
      recommendations: performancePrediction.recommendations,
      predictedOutcome: performancePrediction.outcome,
      timeframe: '30 days',
      createdAt: new Date().toISOString()
    });

    // Predict content trends
    const contentPrediction = this.predictContentTrends(ads);
    insights.push({
      id: `prediction-${Date.now()}-2`,
      type: 'prediction',
      title: 'Content Trend Prediction',
      description: `Predicted shift towards ${contentPrediction.trend} content`,
      confidence: contentPrediction.confidence,
      impact: 'medium',
      category: 'content',
      dataPoints: [
        `Predicted trend: ${contentPrediction.trend}`,
        `Confidence: ${contentPrediction.confidence}%`,
        `Market indicators: ${contentPrediction.indicators.join(', ')}`
      ],
      recommendations: contentPrediction.recommendations,
      predictedOutcome: contentPrediction.outcome,
      timeframe: '60 days',
      createdAt: new Date().toISOString()
    });

    return insights;
  }

  /**
   * Analyze trends over time
   */
  private async analyzeTrends(ads: any[]): Promise<TrendAnalysis[]> {
    const trends: TrendAnalysis[] = [];

    // Performance trend
    const performanceTrend = this.calculatePerformanceTrend(ads);
    if (performanceTrend) {
      trends.push(performanceTrend);
    }

    // Engagement trend
    const engagementTrend = this.calculateEngagementTrend(ads);
    if (engagementTrend) {
      trends.push(engagementTrend);
    }

    // Spend trend
    const spendTrend = this.calculateSpendTrend(ads);
    if (spendTrend) {
      trends.push(spendTrend);
    }

    return trends;
  }

  /**
   * Perform SWOT analysis
   */
  private async performSWOTAnalysis(ads: any[], competitor: any): Promise<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  }> {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];

    // Analyze strengths
    const avgCTR = ads.reduce((sum, ad) => sum + (ad.ctr || 0), 0) / ads.length;
    if (avgCTR > 0.03) {
      strengths.push('Above-average click-through rates');
    }

    const avgEngagement = ads.reduce((sum, ad) => sum + (ad.engagement || 0), 0) / ads.length;
    if (avgEngagement > 0.05) {
      strengths.push('Strong audience engagement');
    }

    // Analyze weaknesses
    if (avgCTR < 0.01) {
      weaknesses.push('Low click-through rates');
    }

    const adVariety = new Set(ads.map(ad => ad.type)).size;
    if (adVariety < 3) {
      weaknesses.push('Limited ad format variety');
    }

    // Analyze opportunities
    const recentAds = ads.filter(ad => {
      const adDate = new Date(ad.createdAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return adDate > sevenDaysAgo;
    });

    if (recentAds.length === 0) {
      opportunities.push('No recent activity - potential for market entry');
    }

    // Analyze threats
    const highPerformingAds = ads.filter(ad => (ad.ctr || 0) > 0.05);
    if (highPerformingAds.length > ads.length * 0.3) {
      threats.push('Strong competitive performance');
    }

    return { strengths, weaknesses, opportunities, threats };
  }

  /**
   * Perform sentiment analysis on ad content
   */
  private async performSentimentAnalysis(ads: any[]): Promise<SentimentAnalysis> {
    const allContent = ads.map(ad => ad.content || ad.title || '').join(' ');
    
    // Simple sentiment analysis based on keywords
    const positiveWords = [
      'gratis', 'korting', 'aanbieding', 'nieuw', 'beste', 'top', 'geweldig', 'fantastisch',
      'exclusief', 'beperkt', 'nu', 'direct', 'snel', 'gemakkelijk', 'voordelig', 'kwaliteit',
      'premium', 'luxe', 'professioneel', 'expert', 'gespecialiseerd', 'uniek', 'innovatie'
    ];
    
    const negativeWords = [
      'probleem', 'moeilijk', 'duur', 'slecht', 'zwak', 'gebrek', 'fout', 'mislukking',
      'verlies', 'risico', 'gevaar', 'waarschuwing', 'stop', 'niet', 'geen', 'slecht'
    ];

    const words: string[] = allContent.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    let totalWords = words.length;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    const positiveScore = positiveCount / totalWords;
    const negativeScore = negativeCount / totalWords;
    const overallScore = positiveScore - negativeScore;

    // Determine overall sentiment
    let overall: 'positive' | 'negative' | 'neutral';
    if (overallScore > 0.05) overall = 'positive';
    else if (overallScore < -0.05) overall = 'negative';
    else overall = 'neutral';

    // Generate emotion distribution
    const emotions = {
      joy: positiveScore * 0.8,
      trust: positiveScore * 0.6,
      fear: negativeScore * 0.7,
      surprise: Math.random() * 0.3,
      sadness: negativeScore * 0.4,
      disgust: negativeScore * 0.2,
      anger: negativeScore * 0.3,
      anticipation: positiveScore * 0.5
    };

    // Extract keywords
    const keywordMap = new Map<string, number>();
    words.forEach((word) => {
      if (word.length > 3) {
        keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
      }
    });

    const keywords = Array.from(keywordMap.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, frequency]) => ({
        word,
        sentiment: (positiveWords.includes(word) ? 'positive' : 
                   negativeWords.includes(word) ? 'negative' : 'neutral') as 'positive' | 'negative' | 'neutral',
        frequency
      }));

    return {
      overall,
      score: overallScore,
      emotions,
      keywords
    };
  }

  /**
   * Detect anomalies in ad performance and behavior
   */
  private async detectAnomalies(ads: any[]): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];

    if (ads.length < 3) return anomalies;

    // Performance anomalies
    const ctrs = ads.map(ad => ad.ctr || 0);
    const avgCTR = ctrs.reduce((sum, ctr) => sum + ctr, 0) / ctrs.length;
    const ctrStdDev = Math.sqrt(ctrs.reduce((sum, ctr) => sum + Math.pow(ctr - avgCTR, 2), 0) / ctrs.length);

    ctrs.forEach((ctr, index) => {
      const deviation = Math.abs(ctr - avgCTR) / ctrStdDev;
      if (deviation > 2) { // More than 2 standard deviations
        const severity = deviation > 3 ? 'critical' : deviation > 2.5 ? 'high' : 'medium';
        anomalies.push({
          type: 'performance',
          severity,
          score: Math.min(deviation * 20, 100),
          description: `Unusual CTR of ${(ctr * 100).toFixed(1)}% (expected ~${(avgCTR * 100).toFixed(1)}%)`,
          expectedValue: avgCTR,
          actualValue: ctr,
          deviation: deviation,
          recommendations: [
            'Investigate creative elements of this ad',
            'Check targeting parameters',
            'Consider A/B testing variations'
          ]
        });
      }
    });

    // Spend anomalies
    const spends = ads.map(ad => ad.spend || 0);
    const avgSpend = spends.reduce((sum, spend) => sum + spend, 0) / spends.length;
    const spendStdDev = Math.sqrt(spends.reduce((sum, spend) => sum + Math.pow(spend - avgSpend, 2), 0) / spends.length);

    spends.forEach((spend, index) => {
      const deviation = Math.abs(spend - avgSpend) / spendStdDev;
      if (deviation > 2.5) {
        const severity = deviation > 3.5 ? 'critical' : deviation > 3 ? 'high' : 'medium';
        anomalies.push({
          type: 'spend',
          severity,
          score: Math.min(deviation * 15, 100),
          description: `Unusual spend of €${spend.toLocaleString()} (expected ~€${avgSpend.toLocaleString()})`,
          expectedValue: avgSpend,
          actualValue: spend,
          deviation: deviation,
          recommendations: [
            'Review budget allocation strategy',
            'Check for bidding anomalies',
            'Monitor ROI impact'
          ]
        });
      }
    });

    // Timing anomalies
    const recentAds = ads.filter(ad => {
      const adDate = new Date(ad.createdAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return adDate > sevenDaysAgo;
    });

    if (recentAds.length > ads.length * 0.8) {
      anomalies.push({
        type: 'timing',
        severity: 'medium',
        score: 75,
        description: 'Unusual spike in recent ad activity',
        expectedValue: ads.length * 0.3,
        actualValue: recentAds.length,
        deviation: recentAds.length / (ads.length * 0.3),
        recommendations: [
          'Monitor for campaign launches',
          'Check for seasonal events',
          'Analyze competitive response'
        ]
      });
    }

    return anomalies;
  }

  /**
   * Generate advanced predictions using machine learning patterns
   */
  private generateAdvancedPredictions(ads: any[], competitor: any): AdInsight[] {
    const insights: AdInsight[] = [];

    // Seasonal pattern recognition
    const seasonalPrediction = this.predictSeasonalPatterns(ads);
    if (seasonalPrediction.confidence > 70) {
      insights.push({
        id: `prediction-${Date.now()}-seasonal`,
        type: 'prediction',
        title: 'Seasonal Pattern Detected',
        description: seasonalPrediction.description,
        confidence: seasonalPrediction.confidence,
        impact: 'medium',
        category: 'timing',
        dataPoints: seasonalPrediction.dataPoints,
        recommendations: seasonalPrediction.recommendations,
        predictedOutcome: seasonalPrediction.outcome,
        timeframe: '90 days',
        createdAt: new Date().toISOString()
      });
    }

    // Market position prediction
    const marketPrediction = this.predictMarketPosition(ads, competitor);
    insights.push({
      id: `prediction-${Date.now()}-market`,
      type: 'prediction',
      title: 'Market Position Forecast',
      description: marketPrediction.description,
      confidence: marketPrediction.confidence,
      impact: 'high',
      category: 'platform',
      dataPoints: marketPrediction.dataPoints,
      recommendations: marketPrediction.recommendations,
      predictedOutcome: marketPrediction.outcome,
      timeframe: '180 days',
      createdAt: new Date().toISOString()
    });

    // Creative trend prediction
    const creativePrediction = this.predictCreativeTrends(ads);
    insights.push({
      id: `prediction-${Date.now()}-creative`,
      type: 'prediction',
      title: 'Creative Trend Forecast',
      description: creativePrediction.description,
      confidence: creativePrediction.confidence,
      impact: 'medium',
      category: 'creative',
      dataPoints: creativePrediction.dataPoints,
      recommendations: creativePrediction.recommendations,
      predictedOutcome: creativePrediction.outcome,
      timeframe: '60 days',
      createdAt: new Date().toISOString()
    });

    return insights;
  }

  /**
   * Predict seasonal patterns in ad activity
   */
  private predictSeasonalPatterns(ads: any[]): any {
    const monthlyActivity = new Array(12).fill(0);
    
    ads.forEach(ad => {
      const month = new Date(ad.createdAt).getMonth();
      monthlyActivity[month]++;
    });

    // Find peak months
    const maxActivity = Math.max(...monthlyActivity);
    const peakMonths = monthlyActivity
      .map((activity, month) => ({ month, activity }))
      .filter(({ activity }) => activity >= maxActivity * 0.8)
      .map(({ month }) => month);

    const monthNames = [
      'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
      'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
    ];

    if (peakMonths.length > 0) {
      return {
        confidence: 80,
        description: `Seasonal peaks detected in ${peakMonths.map(m => monthNames[m]).join(', ')}`,
        dataPoints: [
          `Peak months: ${peakMonths.map(m => monthNames[m]).join(', ')}`,
          `Peak activity: ${maxActivity} ads`,
          `Seasonal variation: ${((maxActivity - Math.min(...monthlyActivity)) / maxActivity * 100).toFixed(1)}%`
        ],
        recommendations: [
          'Plan campaigns around peak seasons',
          'Prepare creative assets in advance',
          'Adjust budget allocation seasonally'
        ],
        outcome: 'Expected 40-60% increase in activity during peak months'
      };
    }

    return {
      confidence: 60,
      description: 'No clear seasonal patterns detected',
      dataPoints: ['Consistent activity throughout the year'],
      recommendations: ['Maintain steady campaign pace'],
      outcome: 'Stable activity expected'
    };
  }

  /**
   * Predict market position changes
   */
  private predictMarketPosition(ads: any[], competitor: any): any {
    const recentPerformance = ads
      .filter(ad => {
        const adDate = new Date(ad.createdAt);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return adDate > thirtyDaysAgo;
      })
      .reduce((sum, ad) => sum + (ad.ctr || 0), 0) / Math.max(ads.length, 1);

    const historicalPerformance = ads
      .reduce((sum, ad) => sum + (ad.ctr || 0), 0) / ads.length;

    const performanceTrend = recentPerformance - historicalPerformance;
    const trendStrength = Math.abs(performanceTrend) / historicalPerformance;

    if (trendStrength > 0.2) {
      const direction = performanceTrend > 0 ? 'up' : 'down';
      return {
        confidence: 75,
        description: `Market position ${direction} based on recent performance trends`,
        dataPoints: [
          `Recent CTR: ${(recentPerformance * 100).toFixed(1)}%`,
          `Historical CTR: ${(historicalPerformance * 100).toFixed(1)}%`,
          `Trend: ${(performanceTrend * 100).toFixed(1)}%`
        ],
        recommendations: [
          performanceTrend > 0 ? 'Scale successful strategies' : 'Review and optimize campaigns',
          'Monitor competitor responses',
          'Adjust targeting if needed'
        ],
        outcome: `Expected ${direction} market position over next 6 months`
      };
    }

    return {
      confidence: 65,
      description: 'Stable market position expected',
      dataPoints: ['Consistent performance trends'],
      recommendations: ['Maintain current strategies', 'Monitor for opportunities'],
      outcome: 'Stable market position maintained'
    };
  }

  /**
   * Predict creative trends
   */
  private predictCreativeTrends(ads: any[]): any {
    const recentAds = ads.filter(ad => {
      const adDate = new Date(ad.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return adDate > thirtyDaysAgo;
    });

    const videoAds = recentAds.filter(ad => ad.type === 'video').length;
    const imageAds = recentAds.filter(ad => ad.type === 'image').length;
    const carouselAds = recentAds.filter(ad => ad.type === 'carousel').length;

    const totalRecent = recentAds.length;
    if (totalRecent === 0) {
      return {
        confidence: 50,
        description: 'Insufficient recent data for trend prediction',
        dataPoints: ['No recent ads analyzed'],
        recommendations: ['Monitor for new creative patterns'],
        outcome: 'Trend prediction unavailable'
      };
    }

    const videoPercentage = (videoAds / totalRecent) * 100;
    const imagePercentage = (imageAds / totalRecent) * 100;
    const carouselPercentage = (carouselAds / totalRecent) * 100;

    let dominantType = 'mixed';
    if (videoPercentage > 50) dominantType = 'video';
    else if (imagePercentage > 50) dominantType = 'image';
    else if (carouselPercentage > 50) dominantType = 'carousel';

    return {
      confidence: 70,
      description: `Shift towards ${dominantType} content detected`,
      dataPoints: [
        `Video ads: ${videoPercentage.toFixed(1)}%`,
        `Image ads: ${imagePercentage.toFixed(1)}%`,
        `Carousel ads: ${carouselPercentage.toFixed(1)}%`
      ],
      recommendations: [
        `Consider testing more ${dominantType} content`,
        'Analyze performance by creative type',
        'Prepare diverse creative assets'
      ],
      outcome: `Expected increase in ${dominantType} content usage`
    };
  }

  /**
   * Calculate overall competitor score
   */
  private calculateOverallScore(insights: AdInsight[], trends: TrendAnalysis[]): number {
    let score = 50; // Base score

    // Add points for positive insights
    insights.forEach(insight => {
      if (insight.type === 'opportunity') score += 5;
      if (insight.type === 'trend' && insight.impact === 'high') score += 3;
      if (insight.confidence > 80) score += 2;
    });

    // Add points for positive trends
    trends.forEach(trend => {
      if (trend.direction === 'up') score += 10;
      if (trend.strength > 70) score += 5;
    });

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(swot: any): 'low' | 'medium' | 'high' {
    const threatCount = swot.threats.length;
    const weaknessCount = swot.weaknesses.length;

    if (threatCount >= 3 || weaknessCount >= 4) return 'high';
    if (threatCount >= 2 || weaknessCount >= 2) return 'medium';
    return 'low';
  }

  // Helper methods for data analysis
  private extractContentThemes(ads: any[]): Record<string, number> {
    const themes: Record<string, number> = {};
    
    ads.forEach(ad => {
      const content = (ad.content || '').toLowerCase();
      const words = content.split(' ');
      
      words.forEach((word: string) => {
        if (word.length > 4) {
          themes[word] = (themes[word] || 0) + 1;
        }
      });
    });

    return themes;
  }

  private analyzeCTAPatterns(ads: any[]): any {
    const ctaAnalysis = {
      total: ads.length,
      mostEffective: [] as string[],
      avgCTR: 0
    };

    // Simple CTA analysis - in real implementation, this would be more sophisticated
    const ctaKeywords = ['shop', 'buy', 'learn', 'get', 'start', 'join', 'download'];
    const ctaAds = ads.filter(ad => 
      ctaKeywords.some(keyword => 
        (ad.callToAction || '').toLowerCase().includes(keyword)
      )
    );

    if (ctaAds.length > 0) {
      ctaAnalysis.avgCTR = ctaAds.reduce((sum, ad) => sum + (ad.ctr || 0), 0) / ctaAds.length;
      ctaAnalysis.mostEffective = ['Shop Now', 'Learn More', 'Get Started'];
    }

    return ctaAnalysis;
  }

  private analyzeAudienceTargeting(ads: any[]): any {
    // Mock audience analysis
    return {
      primaryAudience: 'Young Professionals (25-35)',
      audiencePercentage: 65,
      secondaryAudiences: ['Students (18-24)', 'Entrepreneurs (30-45)']
    };
  }

  private analyzePostingTimes(ads: any[]): any {
    // Mock timing analysis
    return {
      optimalTimes: ['18:00-21:00', '12:00-14:00'],
      avgEngagement: 0.08,
      totalSlots: 24
    };
  }

  private predictPerformance(ads: any[]): any {
    // Mock performance prediction
    const recentPerformance = ads.slice(-5).reduce((sum, ad) => sum + (ad.ctr || 0), 0) / 5;
    const overallPerformance = ads.reduce((sum, ad) => sum + (ad.ctr || 0), 0) / ads.length;
    
    const change = ((recentPerformance - overallPerformance) / overallPerformance) * 100;
    
    return {
      direction: change > 0 ? 'improvement' : 'decline',
      change: Math.abs(change).toFixed(1),
      confidence: 75,
      outcome: change > 0 ? 'Expected performance improvement' : 'Potential performance decline',
      recommendations: change > 0 
        ? ['Continue current strategies', 'Scale successful approaches']
        : ['Review recent changes', 'Consider optimization strategies']
    };
  }

  private predictContentTrends(ads: any[]): any {
    // Mock content trend prediction
    return {
      trend: 'video content',
      confidence: 70,
      indicators: ['Increasing video ad usage', 'Higher engagement on video content'],
      outcome: 'Shift towards video-based advertising',
      recommendations: ['Prepare video content strategy', 'Test video ad formats']
    };
  }

  private calculatePerformanceTrend(ads: any[]): TrendAnalysis | null {
    if (ads.length < 5) return null;

    // Mock trend calculation
          return {
        id: `trend-${Date.now()}-1`,
        trend: 'CTR Performance',
        direction: 'up',
        strength: 75,
        confidence: 80,
        timeframe: '30 days',
        indicators: ['Recent CTR improvement', 'Above-average CTR'],
        impact: 'high'
      };
  }

  private calculateEngagementTrend(ads: any[]): TrendAnalysis | null {
    if (ads.length < 5) return null;

    return {
      id: `trend-${Date.now()}-2`,
      trend: 'Engagement Rate',
      direction: 'stable',
      strength: 60,
      confidence: 70,
      timeframe: '30 days',
      indicators: ['Consistent engagement', 'Stable audience retention'],
      impact: 'medium'
    };
  }

  private calculateSpendTrend(ads: any[]): TrendAnalysis | null {
    if (ads.length < 5) return null;

          return {
        id: `trend-${Date.now()}-3`,
        trend: 'Ad Spend',
        direction: 'up',
        strength: 85,
        confidence: 90,
        timeframe: '30 days',
        indicators: ['Recent spend increase', 'Above-average spend'],
        impact: 'high'
      };
  }

  /**
   * Get insights for a specific competitor
   */
  getCompetitorInsights(competitorId: string): CompetitorInsight | null {
    return this.competitorInsights.get(competitorId) || null;
  }

  /**
   * Get all insights
   */
  getAllInsights(): AdInsight[] {
    return this.insights;
  }

  /**
   * Get market insights
   */
  getMarketInsights(): MarketInsight | null {
    return this.marketInsights;
  }
}

// Export singleton instance
export const aiInsightsEngine = new AIInsightsEngine();
export type { AdInsight, TrendAnalysis, CompetitorInsight, MarketInsight }; 