'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  CpuChipIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface MarketPosition {
  competitorId: string;
  competitorName: string;
  marketShare: number;
  adSpend: number;
  performance: number;
  innovation: number;
  reach: number;
  engagement: number;
  growthRate: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
}

interface StrategicInsight {
  id: string;
  type: 'opportunity' | 'threat' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  timeframe: string;
  priority: number;
  actions: string[];
  metrics: {
    current: number;
    projected: number;
    change: number;
  };
}

interface MarketIntelligence {
  totalMarketSize: number;
  marketGrowth: number;
  topCompetitors: string[];
  emergingThreats: string[];
  marketOpportunities: string[];
  seasonalTrends: any[];
  industryBenchmarks: any;
}

export default function ExecutiveDashboardPage() {
  const [marketPosition, setMarketPosition] = useState<MarketPosition[]>([]);
  const [strategicInsights, setStrategicInsights] = useState<StrategicInsight[]>([]);
  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'competitive' | 'strategic' | 'market'>('overview');

  // Mock data
  useEffect(() => {
    const mockMarketPosition: MarketPosition[] = [
      {
        competitorId: '1',
        competitorName: 'De Nieuwe Lichting',
        marketShare: 28.5,
        adSpend: 45000,
        performance: 85,
        innovation: 78,
        reach: 92,
        engagement: 88,
        growthRate: 12.5,
        threatLevel: 'high',
        lastUpdated: new Date().toISOString()
      },
      {
        competitorId: '2',
        competitorName: 'FitnessPro Nederland',
        marketShare: 22.3,
        adSpend: 38000,
        performance: 72,
        innovation: 65,
        reach: 78,
        engagement: 75,
        growthRate: 8.2,
        threatLevel: 'medium',
        lastUpdated: new Date().toISOString()
      },
      {
        competitorId: '3',
        competitorName: 'MindfulLife Coaching',
        marketShare: 18.7,
        adSpend: 32000,
        performance: 68,
        innovation: 82,
        reach: 65,
        engagement: 70,
        growthRate: 15.8,
        threatLevel: 'high',
        lastUpdated: new Date().toISOString()
      },
      {
        competitorId: '4',
        competitorName: 'Your Company',
        marketShare: 30.5,
        adSpend: 52000,
        performance: 90,
        innovation: 85,
        reach: 95,
        engagement: 92,
        growthRate: 18.3,
        threatLevel: 'low',
        lastUpdated: new Date().toISOString()
      }
    ];

    const mockStrategicInsights: StrategicInsight[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'Market Share Expansion Opportunity',
        description: 'De Nieuwe Lichting shows declining performance in Q4. Opportunity to capture 3-5% additional market share.',
        impact: 'high',
        confidence: 87,
        timeframe: 'Q1 2025',
        priority: 1,
        actions: [
          'Increase ad spend by 25% in high-performing segments',
          'Launch aggressive competitive campaign',
          'Focus on their weak performance areas'
        ],
        metrics: {
          current: 30.5,
          projected: 35.2,
          change: 15.4
        }
      },
      {
        id: '2',
        type: 'threat',
        title: 'Emerging Competitor Threat',
        description: 'MindfulLife Coaching shows 15.8% growth rate with innovative content strategy.',
        impact: 'high',
        confidence: 92,
        timeframe: 'Q2 2025',
        priority: 2,
        actions: [
          'Monitor their content strategy closely',
          'Accelerate innovation in our creative approach',
          'Consider strategic partnership opportunities'
        ],
        metrics: {
          current: 18.7,
          projected: 21.6,
          change: 15.8
        }
      },
      {
        id: '3',
        type: 'trend',
        title: 'Video Content Dominance',
        description: 'Market trend shows 40% increase in video ad performance across all competitors.',
        impact: 'medium',
        confidence: 78,
        timeframe: 'Ongoing',
        priority: 3,
        actions: [
          'Increase video content production by 50%',
          'Invest in video optimization tools',
          'Train team on video best practices'
        ],
        metrics: {
          current: 60,
          projected: 85,
          change: 41.7
        }
      }
    ];

    const mockMarketIntelligence: MarketIntelligence = {
      totalMarketSize: 1250000,
      marketGrowth: 8.5,
      topCompetitors: ['De Nieuwe Lichting', 'FitnessPro Nederland', 'MindfulLife Coaching'],
      emergingThreats: ['New AI-powered fitness platforms', 'Direct-to-consumer brands'],
      marketOpportunities: ['Personalized coaching', 'Corporate wellness programs', 'Mobile-first experiences'],
      seasonalTrends: [
        { month: 'Jan', growth: 12, factor: 'New Year resolutions' },
        { month: 'Feb', growth: 8, factor: 'Valentine fitness' },
        { month: 'Mar', growth: 15, factor: 'Spring preparation' },
        { month: 'Apr', growth: 10, factor: 'Summer preparation' },
        { month: 'May', growth: 18, factor: 'Beach season' },
        { month: 'Jun', growth: 22, factor: 'Summer peak' },
        { month: 'Jul', growth: 20, factor: 'Summer activities' },
        { month: 'Aug', growth: 16, factor: 'Late summer' },
        { month: 'Sep', growth: 14, factor: 'Back to routine' },
        { month: 'Oct', growth: 11, factor: 'Fall fitness' },
        { month: 'Nov', growth: 9, factor: 'Holiday preparation' },
        { month: 'Dec', growth: 6, factor: 'Holiday season' }
      ],
      industryBenchmarks: {
        averageCTR: 2.1,
        averageCPM: 15.50,
        averageEngagement: 4.2,
        averageConversion: 3.8
      }
    };

    setMarketPosition(mockMarketPosition);
    setStrategicInsights(mockStrategicInsights);
    setMarketIntelligence(mockMarketIntelligence);
    setLoading(false);
  }, []);

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />;
      case 'threat': return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      case 'trend': return <ChartBarIcon className="w-5 h-5 text-blue-400" />;
      case 'recommendation': return <LightBulbIcon className="w-5 h-5 text-yellow-400" />;
      default: return <StarIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 10) return <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />;
    if (growth < -5) return <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />;
    return <MinusIcon className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading Executive Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Executive Dashboard</h1>
          <p className="text-gray-400 mt-1">C-Level Competitive Intelligence & Strategic Insights</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-1">
        {[
          { id: 'overview', name: 'Overview', icon: EyeIcon },
          { id: 'competitive', name: 'Competitive Landscape', icon: UserGroupIcon },
          { id: 'strategic', name: 'Strategic Insights', icon: LightBulbIcon },
          { id: 'market', name: 'Market Intelligence', icon: GlobeAltIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === tab.id
                ? 'bg-[#8BAE5A] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#2D3748]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Overview Dashboard */}
      <AnimatePresence mode="wait">
        {selectedView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Market Share</p>
                    <p className="text-2xl font-bold text-white">30.5%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-400">+18.3%</span>
                  <span className="text-gray-400">vs last period</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Ad Spend</p>
                    <p className="text-2xl font-bold text-white">€52K</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CurrencyDollarIcon className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-400">+12.5%</span>
                  <span className="text-gray-400">vs competitors</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Performance Score</p>
                    <p className="text-2xl font-bold text-white">90/100</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <StarIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-400">+5.2%</span>
                  <span className="text-gray-400">vs industry avg</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Threat Level</p>
                    <p className="text-2xl font-bold text-white">Low</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-400">-15.2%</span>
                  <span className="text-gray-400">vs last month</span>
                </div>
              </motion.div>
            </div>

            {/* Market Position Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Market Share Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={marketPosition}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="marketShare"
                      label={({ competitorName, marketShare }) => `${competitorName}: ${marketShare}%`}
                    >
                      {marketPosition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 3 ? '#8BAE5A' : ['#EF4444', '#F59E0B', '#3B82F6'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Comparison</h3>
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

            {/* Top Strategic Insights */}
            <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Strategic Insights</h3>
              <div className="space-y-4">
                {strategicInsights.slice(0, 3).map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-[#2D3748] rounded-lg"
                  >
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            insight.impact === 'high' ? 'text-red-400 border-red-500/30' :
                            insight.impact === 'medium' ? 'text-yellow-400 border-yellow-500/30' :
                            'text-green-400 border-green-500/30'
                          }`}>
                            {insight.impact} impact
                          </span>
                          <span className="text-gray-400 text-xs">{insight.confidence}% confidence</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Timeframe: {insight.timeframe}</span>
                        <span>Priority: {insight.priority}</span>
                        <span>Projected Change: {insight.metrics.change > 0 ? '+' : ''}{insight.metrics.change}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Competitive Landscape */}
        {selectedView === 'competitive' && (
          <motion.div
            key="competitive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Competitive Landscape Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2D3748]">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Competitor</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Market Share</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Ad Spend</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Performance</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Growth</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Threat Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketPosition.map((competitor, index) => (
                      <motion.tr
                        key={competitor.competitorId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-[#2D3748] hover:bg-[#2D3748] transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              competitor.competitorId === '4' ? 'bg-[#8BAE5A]' : 'bg-gray-500'
                            }`}></div>
                            <span className={`font-medium ${
                              competitor.competitorId === '4' ? 'text-[#8BAE5A]' : 'text-white'
                            }`}>
                              {competitor.competitorName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white">{competitor.marketShare}%</td>
                        <td className="py-4 px-4 text-white">€{competitor.adSpend.toLocaleString()}</td>
                        <td className="py-4 px-4 text-white">{competitor.performance}/100</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {getGrowthIcon(competitor.growthRate)}
                            <span className={competitor.growthRate > 0 ? 'text-green-400' : 'text-red-400'}>
                              {competitor.growthRate > 0 ? '+' : ''}{competitor.growthRate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getThreatLevelColor(competitor.threatLevel)}`}>
                            {competitor.threatLevel}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Strategic Insights */}
        {selectedView === 'strategic' && (
          <motion.div
            key="strategic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {strategicInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{insight.title}</h3>
                      <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-xs">Current</p>
                      <p className="text-white font-semibold">{insight.metrics.current}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Projected</p>
                      <p className="text-white font-semibold">{insight.metrics.projected}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Change</p>
                      <p className={`font-semibold ${insight.metrics.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {insight.metrics.change > 0 ? '+' : ''}{insight.metrics.change}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Confidence</p>
                      <p className="text-white font-semibold">{insight.confidence}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-400 text-xs font-medium">Recommended Actions:</p>
                    <ul className="space-y-1">
                      {insight.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="text-gray-300 text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-[#8BAE5A] rounded-full mt-2 flex-shrink-0"></div>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Market Intelligence */}
        {selectedView === 'market' && (
          <motion.div
            key="market"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {marketIntelligence && (
              <>
                {/* Market Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Total Market Size</p>
                        <p className="text-2xl font-bold text-white">€{marketIntelligence.totalMarketSize.toLocaleString()}</p>
                      </div>
                      <GlobeAltIcon className="w-8 h-8 text-[#8BAE5A]" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">+{marketIntelligence.marketGrowth}%</span>
                      <span className="text-gray-400">annual growth</span>
                    </div>
                  </div>

                  <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Industry CTR</p>
                        <p className="text-2xl font-bold text-white">{marketIntelligence.industryBenchmarks.averageCTR}%</p>
                      </div>
                      <ChartBarIcon className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-400">€{marketIntelligence.industryBenchmarks.averageCPM}</span>
                      <span className="text-gray-400">avg CPM</span>
                    </div>
                  </div>

                  <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Engagement Rate</p>
                        <p className="text-2xl font-bold text-white">{marketIntelligence.industryBenchmarks.averageEngagement}%</p>
                      </div>
                      <UserGroupIcon className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-yellow-400">{marketIntelligence.industryBenchmarks.averageConversion}%</span>
                      <span className="text-gray-400">avg conversion</span>
                    </div>
                  </div>
                </div>

                {/* Seasonal Trends */}
                <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Seasonal Market Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={marketIntelligence.seasonalTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="growth" 
                        stroke="#8BAE5A" 
                        fill="#8BAE5A" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Market Opportunities & Threats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
                      Market Opportunities
                    </h3>
                    <div className="space-y-3">
                      {marketIntelligence.marketOpportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-[#2D3748] rounded-lg">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-white text-sm">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                      Emerging Threats
                    </h3>
                    <div className="space-y-3">
                      {marketIntelligence.emergingThreats.map((threat, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-[#2D3748] rounded-lg">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span className="text-white text-sm">{threat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 