'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RocketLaunchIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  FireIcon,
  SparklesIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  CalculatorIcon,
  LightBulbIcon,
  StarIcon,
  XMarkIcon,
  InformationCircleIcon,
  UsersIcon,
  MapPinIcon,
  HeartIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  TagIcon,
  BriefcaseIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Types
interface CampaignMetrics {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget: number;
  lifetime_budget: number;
  start_time: string;
  end_time: string;
  
  // Performance Metrics
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  conversions: number;
  
  // Calculated KPIs
  ctr: number;          // Click-through rate
  cpc: number;          // Cost per click
  cpm: number;          // Cost per mille (1000 impressions)
  cpp: number;          // Cost per purchase
  conversion_rate: number;
  roas: number;         // Return on ad spend
  
  // Audience Data
  audience_size: number;
  age_breakdown: { [key: string]: number };
  gender_breakdown: { [key: string]: number };
  placement_breakdown: { [key: string]: number };
  
  // Performance Score (calculated)
  performance_score: number;
  recommendation_category: 'excellent' | 'good' | 'needs_improvement' | 'poor';
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

const COLORS = ['#8BAE5A', '#4ADE80', '#34D399', '#10B981', '#059669', '#047857'];

export default function FinalSprintPage() {
  const [campaigns, setCampaigns] = useState<CampaignMetrics[]>([]);
  const [recommendations, setRecommendations] = useState<SprintRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignMetrics | null>(null);
  const [totalBudgetRecommendation, setTotalBudgetRecommendation] = useState(0);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [campaignDetails, setCampaignDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 Fetching detailed campaign data for FINAL SPRINT analysis...');
      
      const response = await fetch(`/api/facebook/final-sprint-analysis?timeframe=${selectedTimeframe}`);
      const result = await response.json();
      
      if (result.success) {
        setCampaigns(result.campaigns);
        console.log('📊 Campaign data loaded:', result.campaigns.length, 'campaigns');
      } else {
        setError(result.error || 'Failed to fetch campaign data');
      }
    } catch (error) {
      console.error('❌ Error fetching campaign data:', error);
      setError('Failed to fetch campaign data');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    try {
      setAnalyzing(true);
      console.log('🤖 Generating AI-powered recommendations...');
      
      const response = await fetch('/api/facebook/sprint-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          campaigns,
          timeframe: selectedTimeframe,
          current_total_budget: campaigns.reduce((sum, c) => sum + (c.daily_budget || 0), 0)
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRecommendations(result.recommendations);
        setTotalBudgetRecommendation(result.total_budget_recommendation);
        console.log('✅ Recommendations generated:', result.recommendations.length);
      } else {
        setError(result.error || 'Failed to generate recommendations');
      }
    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      setError('Failed to generate recommendations');
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchCampaignDetails = async (campaignId: string) => {
    try {
      setLoadingDetails(true);
      console.log(`🔍 Fetching detailed data for campaign ${campaignId}...`);
      
      const response = await fetch(`/api/facebook/campaign-details/${campaignId}`);
      const result = await response.json();
      
      if (result.success) {
        setCampaignDetails(result.data);
        setShowCampaignDetails(true);
        console.log('✅ Campaign details loaded:', result.data.campaign.name);
      } else {
        setError(result.error || 'Failed to fetch campaign details');
      }
    } catch (error) {
      console.error('❌ Error fetching campaign details:', error);
      setError('Failed to fetch campaign details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCampaignClick = (campaign: CampaignMetrics) => {
    setSelectedCampaign(campaign);
    fetchCampaignDetails(campaign.id);
  };

  useEffect(() => {
    fetchCampaignData();
  }, [selectedTimeframe]);

  useEffect(() => {
    if (campaigns.length > 0) {
      generateRecommendations();
    }
  }, [campaigns]);

  // Calculate overall statistics
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const overallConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const overallROAS = totalSpend > 0 ? (totalConversions * 50) / totalSpend : 0; // Assuming €50 per conversion

  // Top performing campaigns
  const topCampaigns = [...campaigns]
    .sort((a, b) => b.performance_score - a.performance_score)
    .slice(0, 3);

  // Budget distribution data
  const budgetData = campaigns.map(c => ({
    name: c.name.substring(0, 20) + '...',
    budget: c.daily_budget || 0,
    spend: c.spend,
    conversions: c.conversions,
    efficiency: c.conversions > 0 ? c.spend / c.conversions : 0
  }));

  // Performance comparison data
  const performanceData = campaigns.map(c => ({
    name: c.name.substring(0, 15) + '...',
    cpc: c.cpc,
    conversion_rate: c.conversion_rate,
    roas: c.roas,
    performance_score: c.performance_score
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-white text-center">
          <RocketLaunchIcon className="w-12 h-12 text-[#8BAE5A] mx-auto mb-4 animate-bounce" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-lg">Analyseren van campagne data...</p>
          <p className="text-sm text-gray-400 mt-2">Facebook API wordt bevraagd voor diepgaande metrics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Fout bij laden</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchCampaignData}
            className="px-4 py-2 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#7A9B4F] transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      {/* Header */}
      <div className="border-b border-[#2D3748] bg-gradient-to-r from-[#1A1F2E] to-[#2D3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-[#8BAE5A] to-[#7A9B4F] rounded-xl">
                <RocketLaunchIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8BAE5A] to-[#A4D65E] bg-clip-text text-transparent">
                  FINAL SPRINT
                </h1>
                <p className="text-gray-400">Campagne Analyse & Budget Optimalisatie</p>
              </div>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex space-x-2">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-[#2D3748] border border-[#4A5568] rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
              >
                <option value="7d">Laatste 7 dagen</option>
                <option value="14d">Laatste 14 dagen</option>
                <option value="30d">Laatste 30 dagen</option>
                <option value="90d">Laatste 90 dagen</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1A1F2E] to-[#2D3748] border border-[#4A5568] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-sm text-gray-400">Totaal Besteed</span>
            </div>
            <p className="text-2xl font-bold text-white">€{totalSpend.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Afgelopen {selectedTimeframe}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#1A1F2E] to-[#2D3748] border border-[#4A5568] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">Conversies</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalConversions}</p>
            <p className="text-sm text-gray-400">{overallConversionRate.toFixed(2)}% conversie ratio</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#1A1F2E] to-[#2D3748] border border-[#4A5568] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <CursorArrowRaysIcon className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-sm text-gray-400">Gem. CPC</span>
            </div>
            <p className="text-2xl font-bold text-white">€{averageCPC.toFixed(2)}</p>
            <p className="text-sm text-gray-400">{totalClicks} totaal clicks</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#1A1F2E] to-[#2D3748] border border-[#4A5568] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[#8BAE5A]/20 rounded-lg">
                <ArrowTrendingUpIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <span className="text-sm text-gray-400">ROAS</span>
            </div>
            <p className="text-2xl font-bold text-white">{overallROAS.toFixed(2)}x</p>
            <p className="text-sm text-gray-400">Return on Ad Spend</p>
          </motion.div>
        </div>

        {/* Campaign Performance Table */}
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg mb-8">
          <div className="p-6 border-b border-[#2D3748]">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <ChartBarIcon className="w-6 h-6 mr-2 text-[#8BAE5A]" />
              Campagne Performance Analyse
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2D3748]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Campagne</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Besteed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">CPC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Conversies</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ROAS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D3748]">
                {campaigns.map((campaign, index) => (
                  <motion.tr
                    key={campaign.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-[#2D3748] cursor-pointer transition-colors"
                    onClick={() => handleCampaignClick(campaign)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{campaign.name}</div>
                        <div className="text-sm text-gray-400">{campaign.objective}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      €{campaign.daily_budget?.toFixed(2) || '0.00'}/dag
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      €{campaign.spend.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      €{campaign.cpc.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-white">{campaign.conversions}</span>
                        <span className="ml-2 text-xs text-gray-400">({campaign.conversion_rate.toFixed(1)}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {campaign.roas.toFixed(2)}x
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-[#8BAE5A] h-2 rounded-full" 
                            style={{ width: `${Math.min(campaign.performance_score, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-white">{campaign.performance_score.toFixed(0)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.recommendation_category === 'excellent' ? 'bg-green-500/20 text-green-400' :
                        campaign.recommendation_category === 'good' ? 'bg-blue-500/20 text-blue-400' :
                        campaign.recommendation_category === 'needs_improvement' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {campaign.recommendation_category === 'excellent' ? 'Excellent' :
                         campaign.recommendation_category === 'good' ? 'Goed' :
                         campaign.recommendation_category === 'needs_improvement' ? 'Verbetering' :
                         'Slecht'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Budget Distribution */}
          <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-[#8BAE5A]" />
              Budget vs. Performance
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="budget" fill="#8BAE5A" name="Budget (€)" />
                  <Bar dataKey="spend" fill="#4ADE80" name="Besteed (€)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Radar */}
          <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-[#8BAE5A]" />
              Top 3 Campagnes Performance
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={topCampaigns.map(c => ({
                  campaign: c.name.substring(0, 10) + '...',
                  CPC: Math.max(0, 100 - (c.cpc * 10)), // Invert CPC (lower is better)
                  'Conversie %': c.conversion_rate * 10,
                  ROAS: Math.min(c.roas * 20, 100),
                  Score: c.performance_score
                }))}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="campaign" tick={{ fill: '#9CA3AF' }} />
                  <PolarRadiusAxis tick={{ fill: '#9CA3AF' }} />
                  <Radar name="Performance" dataKey="Score" stroke="#8BAE5A" fill="#8BAE5A" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-br from-[#1A1F2E] to-[#2D3748] border border-[#4A5568] rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <LightBulbIcon className="w-8 h-8 mr-3 text-[#8BAE5A]" />
              AI-Powered Sprint Aanbevelingen
            </h2>
            {analyzing && (
              <div className="flex items-center text-[#8BAE5A]">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#8BAE5A] mr-2"></div>
                Analyseren...
              </div>
            )}
          </div>

          {totalBudgetRecommendation > 0 && (
            <div className="bg-[#8BAE5A]/10 border border-[#8BAE5A]/30 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2 flex items-center">
                <TrophyIcon className="w-5 h-5 mr-2" />
                Budget Aanbeveling voor Final Sprint
              </h3>
              <p className="text-white">
                Optimale dagelijkse budget: <span className="font-bold text-[#8BAE5A]">€{totalBudgetRecommendation.toFixed(2)}</span>
              </p>
              <p className="text-gray-300 text-sm mt-1">
                Gebaseerd op performance data en conversion potentieel
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-6 ${
                  rec.priority === 'high' ? 'border-red-500/50 bg-red-500/5' :
                  rec.priority === 'medium' ? 'border-yellow-500/50 bg-yellow-500/5' :
                  'border-green-500/50 bg-green-500/5'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    rec.priority === 'high' ? 'bg-red-500/20' :
                    rec.priority === 'medium' ? 'bg-yellow-500/20' :
                    'bg-green-500/20'
                  }`}>
                    {rec.type === 'budget_increase' ? <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" /> :
                     rec.type === 'budget_decrease' ? <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" /> :
                     rec.type === 'audience_optimization' ? <UserGroupIcon className="w-5 h-5 text-blue-400" /> :
                     rec.type === 'creative_refresh' ? <SparklesIcon className="w-5 h-5 text-purple-400" /> :
                     rec.type === 'objective_change' ? <FireIcon className="w-5 h-5 text-orange-400" /> :
                     <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {rec.priority === 'high' ? 'Hoge prioriteit' :
                     rec.priority === 'medium' ? 'Medium prioriteit' :
                     'Lage prioriteit'}
                  </span>
                </div>

                <h4 className="text-lg font-semibold text-white mb-2">{rec.title}</h4>
                <p className="text-gray-300 text-sm mb-3">{rec.campaign_name}</p>
                <p className="text-gray-400 text-sm mb-4">{rec.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Verwachte impact:</span>
                    <span className="text-[#8BAE5A]">{rec.expected_impact}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Implementatie:</span>
                    <span className={
                      rec.implementation_effort === 'low' ? 'text-green-400' :
                      rec.implementation_effort === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }>
                      {rec.implementation_effort === 'low' ? 'Makkelijk' :
                       rec.implementation_effort === 'medium' ? 'Gemiddeld' :
                       'Complex'}
                    </span>
                  </div>
                  {rec.estimated_budget_change !== 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Budget wijziging:</span>
                      <span className={rec.estimated_budget_change > 0 ? 'text-green-400' : 'text-red-400'}>
                        {rec.estimated_budget_change > 0 ? '+' : ''}€{rec.estimated_budget_change.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Export & Actions */}
        <div className="flex justify-end space-x-4">
          <button className="px-6 py-3 bg-[#2D3748] text-white rounded-lg hover:bg-[#4A5568] transition-colors flex items-center">
            <DocumentChartBarIcon className="w-5 h-5 mr-2" />
            Export Rapport
          </button>
          <button 
            onClick={generateRecommendations}
            disabled={analyzing}
            className="px-6 py-3 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#7A9B4F] transition-colors flex items-center disabled:opacity-50"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            {analyzing ? 'Analyseren...' : 'Heranalyseer'}
          </button>
        </div>
      </div>

      {/* Campaign Detail Modal */}
      {/* Campaign Details Modal */}
      <AnimatePresence>
        {showCampaignDetails && campaignDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCampaignDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A1F2E] rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-white">{campaignDetails.campaign.name}</h2>
                  <p className="text-gray-400">{campaignDetails.campaign.objective} • {campaignDetails.campaign.status}</p>
                </div>
                <button
                  onClick={() => setShowCampaignDetails(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A]"></div>
                    <span className="ml-3 text-white">Loading campaign details...</span>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {/* Campaign Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-[#2D3748] rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CurrencyDollarIcon className="w-5 h-5 text-[#8BAE5A]" />
                          <p className="text-gray-400 text-sm">Total Spend</p>
                        </div>
                        <p className="text-white font-bold text-lg">€{campaignDetails.insights.overall.spend || '0.00'}</p>
                      </div>
                      <div className="bg-[#2D3748] rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <EyeIcon className="w-5 h-5 text-blue-500" />
                          <p className="text-gray-400 text-sm">Impressions</p>
                        </div>
                        <p className="text-white font-bold text-lg">{parseInt(campaignDetails.insights.overall.impressions || '0').toLocaleString()}</p>
                      </div>
                      <div className="bg-[#2D3748] rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CursorArrowRaysIcon className="w-5 h-5 text-orange-500" />
                          <p className="text-gray-400 text-sm">Clicks</p>
                        </div>
                        <p className="text-white font-bold text-lg">{parseInt(campaignDetails.insights.overall.clicks || '0').toLocaleString()}</p>
                      </div>
                      <div className="bg-[#2D3748] rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <UserGroupIcon className="w-5 h-5 text-purple-500" />
                          <p className="text-gray-400 text-sm">Reach</p>
                        </div>
                        <p className="text-white font-bold text-lg">{parseInt(campaignDetails.insights.overall.reach || '0').toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Targeting Information */}
                    <div className="bg-[#2D3748] rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <UsersIcon className="w-5 h-5 text-[#8BAE5A] mr-2" />
                        Targeting Criteria
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Demographics */}
                        <div>
                          <h4 className="text-white font-medium mb-3 flex items-center">
                            <InformationCircleIcon className="w-4 h-4 text-blue-400 mr-2" />
                            Demographics
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Age Range:</span>
                              <span className="text-white">{campaignDetails.campaign.targeting.age_min} - {campaignDetails.campaign.targeting.age_max}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Genders:</span>
                              <span className="text-white">
                                {campaignDetails.campaign.targeting.genders.length > 0 
                                  ? campaignDetails.campaign.targeting.genders.map((g: number) => g === 1 ? 'Male' : 'Female').join(', ')
                                  : 'All'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Geographic */}
                        <div>
                          <h4 className="text-white font-medium mb-3 flex items-center">
                            <MapPinIcon className="w-4 h-4 text-green-400 mr-2" />
                            Geographic
                          </h4>
                          <div className="space-y-2 text-sm">
                            {campaignDetails.campaign.targeting.geo_locations.countries?.length > 0 && (
                              <div>
                                <span className="text-gray-400">Countries:</span>
                                <div className="text-white mt-1">
                                  {campaignDetails.campaign.targeting.geo_locations.countries.slice(0, 3).join(', ')}
                                  {campaignDetails.campaign.targeting.geo_locations.countries.length > 3 && ` +${campaignDetails.campaign.targeting.geo_locations.countries.length - 3} more`}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interests */}
                        <div>
                          <h4 className="text-white font-medium mb-3 flex items-center">
                            <HeartIcon className="w-4 h-4 text-red-400 mr-2" />
                            Interests
                          </h4>
                          <div className="space-y-2 text-sm">
                            {campaignDetails.campaign.targeting.interests?.length > 0 ? (
                              <div className="text-white">
                                {campaignDetails.campaign.targeting.interests.slice(0, 5).map((interest: any, idx: number) => (
                                  <div key={idx} className="truncate">{interest.name}</div>
                                ))}
                                {campaignDetails.campaign.targeting.interests.length > 5 && (
                                  <div className="text-gray-400">+{campaignDetails.campaign.targeting.interests.length - 5} more</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">No specific interests targeted</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ad Sets */}
                    <div className="bg-[#2D3748] rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <DocumentChartBarIcon className="w-5 h-5 text-[#8BAE5A] mr-2" />
                        Ad Sets ({campaignDetails.adSets.length})
                      </h3>
                      <div className="space-y-3">
                        {campaignDetails.adSets.map((adSet: any, index: number) => (
                          <div key={adSet.id} className="bg-[#1A1F2E] rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-medium">{adSet.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                adSet.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {adSet.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Daily Budget:</span>
                                <span className="text-white ml-2">€{parseFloat(adSet.daily_budget || '0').toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Spend:</span>
                                <span className="text-white ml-2">€{parseFloat(adSet.insights?.spend || '0').toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Clicks:</span>
                                <span className="text-white ml-2">{parseInt(adSet.insights?.clicks || '0').toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">CTR:</span>
                                <span className="text-white ml-2">{parseFloat(adSet.insights?.ctr || '0').toFixed(2)}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Individual Ads */}
                    <div className="bg-[#2D3748] rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <TagIcon className="w-5 h-5 text-[#8BAE5A] mr-2" />
                        Individual Ads ({campaignDetails.ads.length})
                      </h3>
                      <div className="space-y-3">
                        {campaignDetails.ads.map((ad: any, index: number) => (
                          <div key={ad.id} className="bg-[#1A1F2E] rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-medium">{ad.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                ad.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {ad.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Spend:</span>
                                <span className="text-white ml-2">€{parseFloat(ad.insights?.spend || '0').toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Impressions:</span>
                                <span className="text-white ml-2">{parseInt(ad.insights?.impressions || '0').toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Clicks:</span>
                                <span className="text-white ml-2">{parseInt(ad.insights?.clicks || '0').toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">CPC:</span>
                                <span className="text-white ml-2">€{parseFloat(ad.insights?.cpc || '0').toFixed(3)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Demographic Breakdown */}
                    {campaignDetails.insights.demographic?.length > 0 && (
                      <div className="bg-[#2D3748] rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <ChartBarIcon className="w-5 h-5 text-[#8BAE5A] mr-2" />
                          Demographic Performance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {campaignDetails.insights.demographic.slice(0, 6).map((demo: any, index: number) => (
                            <div key={index} className="bg-[#1A1F2E] rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-medium">
                                  {demo.age} • {demo.gender}
                                </span>
                                <span className="text-[#8BAE5A]">€{parseFloat(demo.spend || '0').toFixed(2)}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-400">Impressions:</span>
                                  <div className="text-white">{parseInt(demo.impressions || '0').toLocaleString()}</div>
                                </div>
                                <div>
                                  <span className="text-gray-400">Clicks:</span>
                                  <div className="text-white">{parseInt(demo.clicks || '0').toLocaleString()}</div>
                                </div>
                                <div>
                                  <span className="text-gray-400">CTR:</span>
                                  <div className="text-white">{parseFloat(demo.ctr || '0').toFixed(2)}%</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Campaign Management Actions */}
                    <div className="bg-[#2D3748] rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <StarIcon className="w-5 h-5 text-[#8BAE5A] mr-2" />
                        Campaign Management
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="bg-[#8BAE5A] hover:bg-[#7A9D4A] text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Duplicate Campaign
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Edit Targeting
                        </button>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Create Similar
                        </button>
                      </div>
                      <p className="text-gray-400 text-sm mt-3">
                        Campaign management features coming soon. This data helps you understand targeting and performance for creating new campaigns.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCampaign && !showCampaignDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCampaign(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{selectedCampaign.name}</h3>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-[#2D3748] rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Objective</p>
                  <p className="text-white font-medium">{selectedCampaign.objective}</p>
                </div>
                <div className="bg-[#2D3748] rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-white font-medium">{selectedCampaign.status}</p>
                </div>
                <div className="bg-[#2D3748] rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Daily Budget</p>
                  <p className="text-white font-medium">€{selectedCampaign.daily_budget?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="bg-[#2D3748] rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Spend</p>
                  <p className="text-white font-medium">€{selectedCampaign.spend.toFixed(2)}</p>
                </div>
                <div className="bg-[#2D3748] rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Impressions</p>
                  <p className="text-white font-medium">{selectedCampaign.impressions.toLocaleString()}</p>
                </div>
                <div className="bg-[#2D3748] rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Reach</p>
                  <p className="text-white font-medium">{selectedCampaign.reach.toLocaleString()}</p>
                </div>
              </div>

              {/* Audience breakdown charts would go here */}
              <div className="text-center py-8 text-gray-400">
                <EyeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Audience breakdown charts en detailed metrics komen hier</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
