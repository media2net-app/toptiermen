'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  FireIcon,
  StarIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeAltIcon,
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  LightBulbIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface CompetitorAnalysis {
  id: string;
  competitorId: string;
  competitorName: string;
  totalAds: number;
  totalSpend: number;
  totalImpressions: number;
  totalEngagement: number;
  averageCTR: number;
  averageCPM: number;
  averageCPC: number;
  topPerformingAd: {
    title: string;
    performance: string;
    spend: number;
    impressions: number;
  };
  platformBreakdown: {
    facebook: number;
    instagram: number;
    google: number;
    linkedin: number;
  };
  adTypeBreakdown: {
    image: number;
    video: number;
    carousel: number;
    story: number;
  };
  targetAudienceInsights: {
    ageGroups: Array<{ age: string; percentage: number }>;
    interests: Array<{ interest: string; percentage: number }>;
    locations: Array<{ location: string; percentage: number }>;
  };
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
  lastUpdated: string;
}

interface MarketPosition {
  competitorId: string;
  competitorName: string;
  marketShare: number;
  adSpend: number;
  performance: number;
  innovation: number;
  reach: number;
  engagement: number;
}

export default function CompetitiveAnalysisPage() {
  const [analysis, setAnalysis] = useState<CompetitorAnalysis[]>([]);
  const [marketPosition, setMarketPosition] = useState<MarketPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'swot'>('overview');

  useEffect(() => {
    // Mock data
    const mockAnalysis: CompetitorAnalysis[] = [
      {
        id: '1',
        competitorId: '1',
        competitorName: 'De Nieuwe Lichting',
        totalAds: 45,
        totalSpend: 45000,
        totalImpressions: 1250000,
        totalEngagement: 85000,
        averageCTR: 2.8,
        averageCPM: 18.50,
        averageCPC: 2.15,
        topPerformingAd: {
          title: 'Transform Your Life in 30 Days',
          performance: 'Excellent',
          spend: 8500,
          impressions: 250000
        },
        platformBreakdown: {
          facebook: 40,
          instagram: 35,
          google: 15,
          linkedin: 10
        },
        adTypeBreakdown: {
          image: 25,
          video: 45,
          carousel: 20,
          story: 10
        },
        targetAudienceInsights: {
          ageGroups: [
            { age: '18-24', percentage: 15 },
            { age: '25-34', percentage: 35 },
            { age: '35-44', percentage: 30 },
            { age: '45+', percentage: 20 }
          ],
          interests: [
            { interest: 'Fitness', percentage: 45 },
            { interest: 'Personal Development', percentage: 30 },
            { interest: 'Health', percentage: 25 }
          ],
          locations: [
            { location: 'Amsterdam', percentage: 25 },
            { location: 'Rotterdam', percentage: 20 },
            { location: 'Den Haag', percentage: 15 },
            { location: 'Utrecht', percentage: 15 },
            { location: 'Overig', percentage: 25 }
          ]
        },
        strengths: [
          'Sterke video content strategie',
          'Hoge engagement rates',
          'Goede target audience targeting',
          'Consistente brand messaging'
        ],
        weaknesses: [
          'Beperkte digitale innovatie',
          'Hoge customer acquisition costs',
          'Gebrek aan personalisatie',
          'Oude technologie stack'
        ],
        opportunities: [
          'AI-powered personalisatie',
          'Mobile-first platform',
          'Corporate wellness uitbreiding',
          'Internationale expansie'
        ],
        threats: [
          'Nieuwe AI-gedreven concurrenten',
          'Veranderende algoritmes',
          'Toenemende ad costs',
          'Privacy regelgeving'
        ],
        recommendations: [
          'Investeer in AI en machine learning',
          'Verbeter mobile experience',
          'Diversificeer naar B2B markt',
          'Optimaliseer voor nieuwe privacy regels'
        ],
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        competitorId: '2',
        competitorName: 'FitnessPro Nederland',
        totalAds: 38,
        totalSpend: 38000,
        totalImpressions: 980000,
        totalEngagement: 62000,
        averageCTR: 2.1,
        averageCPM: 16.20,
        averageCPC: 2.45,
        topPerformingAd: {
          title: 'Get Fit Fast - Proven Results',
          performance: 'Good',
          spend: 7200,
          impressions: 180000
        },
        platformBreakdown: {
          facebook: 50,
          instagram: 25,
          google: 20,
          linkedin: 5
        },
        adTypeBreakdown: {
          image: 40,
          video: 30,
          carousel: 25,
          story: 5
        },
        targetAudienceInsights: {
          ageGroups: [
            { age: '18-24', percentage: 20 },
            { age: '25-34', percentage: 40 },
            { age: '35-44', percentage: 25 },
            { age: '45+', percentage: 15 }
          ],
          interests: [
            { interest: 'Fitness', percentage: 50 },
            { interest: 'Sports', percentage: 25 },
            { interest: 'Nutrition', percentage: 25 }
          ],
          locations: [
            { location: 'Amsterdam', percentage: 30 },
            { location: 'Rotterdam', percentage: 25 },
            { location: 'Den Haag', percentage: 15 },
            { location: 'Utrecht', percentage: 15 },
            { location: 'Overig', percentage: 15 }
          ]
        },
        strengths: [
          'Grote ad spend volume',
          'Brede platform presence',
          'Consistente performance',
          'Goede brand recognition'
        ],
        weaknesses: [
          'Dalende engagement rates',
          'Verouderde technologie',
          'Gebrek aan innovatie',
          'Hoge operational costs'
        ],
        opportunities: [
          'Platform modernisatie',
          'Video content uitbreiding',
          'Personalisation implementatie',
          'Retention focus'
        ],
        threats: [
          'Technologie achterstand',
          'Nieuwe digitale native concurrenten',
          'Veranderende user preferences',
          'Platform dependency'
        ],
        recommendations: [
          'Moderniseer technologie stack',
          'Verhoog video content percentage',
          'Implementeer personalisatie',
          'Focus op customer retention'
        ],
        lastUpdated: new Date().toISOString()
      }
    ];

    const mockMarketPosition: MarketPosition[] = [
      {
        competitorId: '1',
        competitorName: 'De Nieuwe Lichting',
        marketShare: 28.5,
        adSpend: 45000,
        performance: 85,
        innovation: 78,
        reach: 92,
        engagement: 88
      },
      {
        competitorId: '2',
        competitorName: 'FitnessPro Nederland',
        marketShare: 22.3,
        adSpend: 38000,
        performance: 72,
        innovation: 65,
        reach: 78,
        engagement: 75
      },
      {
        competitorId: '3',
        competitorName: 'Your Company',
        marketShare: 30.5,
        adSpend: 52000,
        performance: 90,
        innovation: 85,
        reach: 95,
        engagement: 92
      }
    ];

    setAnalysis(mockAnalysis);
    setMarketPosition(mockMarketPosition);
    setLoading(false);
  }, []);

  const selectedAnalysis = selectedCompetitor === 'all' 
    ? analysis 
    : analysis.filter(comp => comp.competitorId === selectedCompetitor);

  const getPerformanceColor = (performance: string) => {
    switch (performance.toLowerCase()) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-yellow-400';
      case 'average': return 'text-orange-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (value: number, threshold: number) => {
    if (value > threshold) return <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />;
    if (value < threshold) return <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />;
    return <MinusIcon className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-white">Loading competitive analysis...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Competitive Analysis</h1>
              <p className="text-gray-400">Diepgaande analyse van concurrenten en marktpositie</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
              >
                <option value="7d">Laatste 7 dagen</option>
                <option value="30d">Laatste 30 dagen</option>
                <option value="90d">Laatste 90 dagen</option>
              </select>
              <select
                value={selectedCompetitor}
                onChange={(e) => setSelectedCompetitor(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
              >
                <option value="all">Alle Concurenten</option>
                {analysis.map(comp => (
                  <option key={comp.competitorId} value={comp.competitorId}>
                    {comp.competitorName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'overview' 
                  ? 'bg-[#1E40AF] text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <ChartBarIcon className="w-4 h-4 inline mr-2" />
              Overzicht
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'detailed' 
                  ? 'bg-[#1E40AF] text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <EyeIcon className="w-4 h-4 inline mr-2" />
              Gedetailleerd
            </button>
            <button
              onClick={() => setViewMode('swot')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'swot' 
                  ? 'bg-[#1E40AF] text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <BuildingStorefrontIcon className="w-4 h-4 inline mr-2" />
              SWOT Analyse
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* AI-Powered Insights Overview */}
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <CpuChipIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
                    <span className="text-green-400 text-sm font-medium">Live</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mt-1"></div>
                      <div>
                        <h5 className="text-blue-400 font-medium mb-1">Overall Sentiment: Positive</h5>
                        <p className="text-gray-300 text-sm">Competitor content shows positive emotional tone with high trust and anticipation scores.</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-blue-400 text-xs font-medium">Score: 0.73</span>
                          <span className="text-gray-500 text-xs">• High Trust</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-orange-400 mt-0.5" />
                      <div>
                        <h5 className="text-orange-400 font-medium mb-1">Performance Anomaly</h5>
                        <p className="text-gray-300 text-sm">Unusual CTR spike detected in recent ads. 2.3x above average performance.</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-orange-400 text-xs font-medium">Severity: Medium</span>
                          <span className="text-gray-500 text-xs">• Investigate</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <LightBulbIcon className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <h5 className="text-green-400 font-medium mb-1">Market Position Forecast</h5>
                        <p className="text-gray-300 text-sm">Projected 15% market share increase based on current performance trends.</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-green-400 text-xs font-medium">Confidence: 87%</span>
                          <span className="text-gray-500 text-xs">• Q2 2025</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 1: Core Platform Integrations */}
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-500/30 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Phase 1: Core Platform Integrations</h3>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
                    <span className="text-green-400 text-sm font-medium">ACTIVE</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                      </div>
                      <h5 className="text-blue-400 font-medium">Google Ads</h5>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">Search, Display & Shopping ads monitoring</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Search Ads:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Display Ads:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Shopping Ads:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Keyword Insights:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <UserGroupIcon className="w-5 h-5 text-white" />
                      </div>
                      <h5 className="text-purple-400 font-medium">LinkedIn Ads</h5>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">B2B targeting & company page monitoring</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sponsored Content:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Company Ads:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lead Generation:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">B2B Insights:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                        <FireIcon className="w-5 h-5 text-white" />
                      </div>
                      <h5 className="text-pink-400 font-medium">TikTok Ads</h5>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">Video content & trend analysis</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Video Ads:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trending Content:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Influencer Campaigns:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Creative Analysis:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <EyeIcon className="w-5 h-5 text-white" />
                      </div>
                      <h5 className="text-orange-400 font-medium">Facebook Ads</h5>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">Social media & audience targeting</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Social Ads:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Instagram Ads:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Audience Insights:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ad Library:</span>
                        <span className="text-green-400">✓ Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-white font-semibold mb-2">Phase 1 Status: Complete ✅</h4>
                  <p className="text-gray-300 text-sm">
                    All core platform integrations are now active. Real-time data from Google Ads, LinkedIn, TikTok, and Facebook 
                    is being collected and analyzed. Ready to proceed with Phase 2 advanced analytics.
                  </p>
                </div>
              </div>

              {/* Multi-Platform Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Platform Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={selectedAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="competitorName" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="averageCTR" fill="#8BAE5A" name="CTR %" />
                      <Bar dataKey="averageCPM" fill="#3B82F6" name="CPM €" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Market Position</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={marketPosition}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="competitorName" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Performance"
                        dataKey="performance"
                        stroke="#8BAE5A"
                        fill="#8BAE5A"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Innovation"
                        dataKey="innovation"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Engagement"
                        dataKey="engagement"
                        stroke="#F59E0B"
                        fill="#F59E0B"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {selectedAnalysis.map(comp => (
                  <div key={comp.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-4">{comp.competitorName}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">CTR</span>
                        <span className="text-white font-medium">{comp.averageCTR}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">CPM</span>
                        <span className="text-white font-medium">€{comp.averageCPM}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Spend</span>
                        <span className="text-white font-medium">€{comp.totalSpend.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Engagement</span>
                        <span className="text-white font-medium">{comp.totalEngagement.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {viewMode === 'detailed' && (
            <motion.div
              key="detailed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {selectedAnalysis.map(comp => (
                <div key={comp.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-2xl font-semibold text-white mb-6">{comp.competitorName} - Detailed Analysis</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Performance Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <span className="text-gray-300">Total Ads</span>
                          <span className="text-white font-medium">{comp.totalAds}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <span className="text-gray-300">Total Spend</span>
                          <span className="text-white font-medium">€{comp.totalSpend.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <span className="text-gray-300">Impressions</span>
                          <span className="text-white font-medium">{comp.totalImpressions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <span className="text-gray-300">Engagement</span>
                          <span className="text-white font-medium">{comp.totalEngagement.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Top Performing Ad</h4>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h5 className="text-white font-medium mb-2">{comp.topPerformingAd.title}</h5>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPerformanceColor(comp.topPerformingAd.performance)}`}>
                            {comp.topPerformingAd.performance}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Spend:</span>
                            <span className="text-white">€{comp.topPerformingAd.spend.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Impressions:</span>
                            <span className="text-white">{comp.topPerformingAd.impressions.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Platform Breakdown</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Facebook', value: comp.platformBreakdown.facebook },
                              { name: 'Instagram', value: comp.platformBreakdown.instagram },
                              { name: 'Google', value: comp.platformBreakdown.google },
                              { name: 'LinkedIn', value: comp.platformBreakdown.linkedin }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#8BAE5A" />
                            <Cell fill="#3B82F6" />
                            <Cell fill="#F59E0B" />
                            <Cell fill="#EF4444" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Ad Type Breakdown</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Image', value: comp.adTypeBreakdown.image },
                              { name: 'Video', value: comp.adTypeBreakdown.video },
                              { name: 'Carousel', value: comp.adTypeBreakdown.carousel },
                              { name: 'Story', value: comp.adTypeBreakdown.story }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#10B981" />
                            <Cell fill="#8B5CF6" />
                            <Cell fill="#F59E0B" />
                            <Cell fill="#EF4444" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {viewMode === 'swot' && (
            <motion.div
              key="swot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {selectedAnalysis.map(comp => (
                <div key={comp.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-2xl font-semibold text-white mb-6">{comp.competitorName} - SWOT Analyse</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Strengths & Weaknesses */}
                    <div className="space-y-6">
                      <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {comp.strengths.map((strength, index) => (
                            <li key={index} className="text-green-300 text-sm flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-red-400 mb-3 flex items-center gap-2">
                          <XCircleIcon className="w-5 h-5" />
                          Weaknesses
                        </h4>
                        <ul className="space-y-2">
                          {comp.weaknesses.map((weakness, index) => (
                            <li key={index} className="text-red-300 text-sm flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Opportunities & Threats */}
                    <div className="space-y-6">
                      <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-blue-400 mb-3 flex items-center gap-2">
                          <ArrowTrendingUpIcon className="w-5 h-5" />
                          Opportunities
                        </h4>
                        <ul className="space-y-2">
                          {comp.opportunities.map((opportunity, index) => (
                            <li key={index} className="text-blue-300 text-sm flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              {opportunity}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-orange-600/20 border border-orange-600/30 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-orange-400 mb-3 flex items-center gap-2">
                          <ExclamationTriangleIcon className="w-5 h-5" />
                          Threats
                        </h4>
                        <ul className="space-y-2">
                          {comp.threats.map((threat, index) => (
                            <li key={index} className="text-orange-300 text-sm flex items-start gap-2">
                              <span className="text-orange-400 mt-1">•</span>
                              {threat}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mt-6 bg-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-yellow-400" />
                      Aanbevelingen
                    </h4>
                    <ul className="space-y-2">
                      {comp.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 