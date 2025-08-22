'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  FunnelIcon,
  StarIcon,
  FireIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Types
interface AnalyticsData {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  roas: number;
}

interface FacebookAnalyticsData {
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalSpend: number;
    totalReach: number;
    averageCTR: number;
    averageCPC: number;
    averageCPM: number;
    activeCampaigns: number;
    totalCampaigns: number;
  };
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    objective: string;
    impressions: number;
    clicks: number;
    spend: number;
    reach: number;
    frequency: number;
    ctr: number;
    cpc: number;
    cpm: number;
    actions: Array<{ action_type: string; value: string }>;
    created_time: string;
  }>;
  adSets: Array<{
    id: string;
    name: string;
    campaign_id: string;
    status: string;
    impressions: number;
    clicks: number;
    spend: number;
    reach: number;
    frequency: number;
    ctr: number;
    cpc: number;
    cpm: number;
    actions: Array<{ action_type: string; value: string }>;
    created_time: string;
  }>;
  ads: Array<{
    id: string;
    name: string;
    adset_id: string;
    campaign_id: string;
    status: string;
    impressions: number;
    clicks: number;
    spend: number;
    reach: number;
    frequency: number;
    ctr: number;
    cpc: number;
    cpm: number;
    actions: Array<{ action_type: string; value: string }>;
    created_time: string;
  }>;
  dateRange: string;
  lastUpdated: string;
}

interface PlatformPerformance {
  platform: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  roas: number;
}

interface AudienceInsights {
  ageGroup: string;
  gender: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('last_90d');
  const [selectedMetric, setSelectedMetric] = useState('impressions');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [facebookAnalytics, setFacebookAnalytics] = useState<FacebookAnalyticsData | null>(null);
  const [platformPerformance, setPlatformPerformance] = useState<PlatformPerformance[]>([]);
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsights[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  // Load Facebook analytics data
  useEffect(() => {
    const loadFacebookAnalytics = async () => {
      setLoading(true);
      try {
        console.log('📊 Loading Facebook analytics data...');
        
        const response = await fetch(`/api/facebook/analytics?dateRange=${timeRange}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          console.log('✅ Facebook analytics loaded:', data.data);
          setFacebookAnalytics(data.data);
          
          // Create platform performance data from Facebook data
          const facebookPlatformData: PlatformPerformance = {
            platform: "Facebook",
            impressions: data.data.summary.totalImpressions,
            clicks: data.data.summary.totalClicks,
            conversions: 0, // Facebook doesn't provide conversion data in basic insights
            spent: data.data.summary.totalSpend,
            ctr: data.data.summary.averageCTR,
            cpc: data.data.summary.averageCPC,
            conversionRate: 0,
            roas: 0
          };
          
          setPlatformPerformance([facebookPlatformData]);
          
          // Create mock audience insights for now
          const mockAudienceInsights: AudienceInsights[] = [
            { ageGroup: "25-34", gender: "Male", impressions: Math.floor(data.data.summary.totalImpressions * 0.4), clicks: Math.floor(data.data.summary.totalClicks * 0.4), conversions: 0, ctr: data.data.summary.averageCTR, conversionRate: 0 },
            { ageGroup: "35-44", gender: "Male", impressions: Math.floor(data.data.summary.totalImpressions * 0.3), clicks: Math.floor(data.data.summary.totalClicks * 0.3), conversions: 0, ctr: data.data.summary.averageCTR, conversionRate: 0 },
            { ageGroup: "45-54", gender: "Male", impressions: Math.floor(data.data.summary.totalImpressions * 0.2), clicks: Math.floor(data.data.summary.totalClicks * 0.2), conversions: 0, ctr: data.data.summary.averageCTR, conversionRate: 0 },
            { ageGroup: "25-34", gender: "Female", impressions: Math.floor(data.data.summary.totalImpressions * 0.05), clicks: Math.floor(data.data.summary.totalClicks * 0.05), conversions: 0, ctr: data.data.summary.averageCTR, conversionRate: 0 },
            { ageGroup: "35-44", gender: "Female", impressions: Math.floor(data.data.summary.totalImpressions * 0.05), clicks: Math.floor(data.data.summary.totalClicks * 0.05), conversions: 0, ctr: data.data.summary.averageCTR, conversionRate: 0 }
          ];
          
          setAudienceInsights(mockAudienceInsights);
          
          // Create time series data from campaigns
          const timeSeriesData: AnalyticsData[] = data.data.campaigns.map((campaign: any, index: number) => ({
            date: new Date(campaign.created_time).toISOString().split('T')[0],
            impressions: campaign.impressions,
            clicks: campaign.clicks,
            conversions: 0,
            spent: campaign.spend,
            ctr: campaign.ctr,
            cpc: campaign.cpc,
            conversionRate: 0,
            roas: 0
          }));
          
          setAnalyticsData(timeSeriesData);
          
        } else {
          console.error('Failed to load Facebook analytics:', data);
          // Fallback to mock data
          setAnalyticsData([]);
          setPlatformPerformance([]);
          setAudienceInsights([]);
        }
      } catch (error) {
        console.error('Error loading Facebook analytics:', error);
        // Fallback to mock data
        setAnalyticsData([]);
        setPlatformPerformance([]);
        setAudienceInsights([]);
      } finally {
        setLoading(false);
      }
    };

    loadFacebookAnalytics();
  }, [timeRange]);

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
  };

  const handleToggleAlerts = () => {
    setShowAlerts(!showAlerts);
  };

  const getMetricValue = (data: AnalyticsData) => {
    switch (selectedMetric) {
      case 'impressions': return data.impressions;
      case 'clicks': return data.clicks;
      case 'conversions': return data.conversions;
      case 'spent': return data.spent;
      case 'ctr': return data.ctr;
      case 'cpc': return data.cpc;
      case 'conversionRate': return data.conversionRate;
      case 'roas': return data.roas;
      default: return data.impressions;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'impressions': return 'Impressies';
      case 'clicks': return 'Klikken';
      case 'conversions': return 'Conversies';
      case 'spent': return 'Uitgegeven (€)';
      case 'ctr': return 'CTR (%)';
      case 'cpc': return 'CPC (€)';
      case 'conversionRate': return 'Conversie Rate (%)';
      case 'roas': return 'ROAS (x)';
      default: return 'Impressies';
    }
  };

  const getMetricIcon = () => {
    switch (selectedMetric) {
      case 'impressions': return <EyeIcon className="w-5 h-5" />;
      case 'clicks': return <CursorArrowRaysIcon className="w-5 h-5" />;
      case 'conversions': return <UserGroupIcon className="w-5 h-5" />;
      case 'spent': return <CurrencyDollarIcon className="w-5 h-5" />;
      default: return <ChartBarIcon className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Marketing prestaties en inzichten</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
          >
            <option value="today">Vandaag</option>
            <option value="yesterday">Gisteren</option>
            <option value="last_7d">Laatste 7 dagen</option>
            <option value="last_30d">Laatste 30 dagen</option>
            <option value="last_90d">Laatste 90 dagen</option>
            <option value="this_month">Deze maand</option>
            <option value="last_month">Vorige maand</option>
            <option value="last_1y">Laatste jaar</option>
            <option value="lifetime">Alle tijd</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleAlerts}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              showAlerts 
                ? 'bg-red-500 text-white' 
                : 'bg-[#2D3748] text-gray-300 hover:text-white'
            }`}
          >
            <BellIcon className="w-5 h-5" />
            <span>Alerts</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">Metric:</span>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
          >
            <option value="impressions">Impressies</option>
            <option value="clicks">Klikken</option>
            <option value="conversions">Conversies</option>
            <option value="spent">Uitgegeven</option>
            <option value="ctr">CTR</option>
            <option value="cpc">CPC</option>
            <option value="conversionRate">Conversie Rate</option>
            <option value="roas">ROAS</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Impressies</p>
              <p className="text-2xl font-bold text-white">
                {analyticsData.reduce((sum, d) => sum + d.impressions, 0).toLocaleString()}
              </p>
            </div>
            <EyeIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+12.5%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Klikken</p>
              <p className="text-2xl font-bold text-white">
                {analyticsData.reduce((sum, d) => sum + d.clicks, 0).toLocaleString()}
              </p>
            </div>
            <CursorArrowRaysIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+8.3%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Conversies</p>
              <p className="text-2xl font-bold text-white">
                {analyticsData.reduce((sum, d) => sum + d.conversions, 0).toLocaleString()}
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+15.2%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Uitgegeven</p>
              <p className="text-2xl font-bold text-white">
                €{analyticsData.reduce((sum, d) => sum + d.spent, 0).toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+5.7%</span>
          </div>
        </motion.div>
      </div>

      {/* Interactive Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{getMetricLabel()} Over Tijd</h2>
          {getMetricIcon()}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
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
                dataKey={selectedMetric} 
                stroke="#3B82F6" 
                fill="#3B82F6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Platform Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Platform Prestaties</h2>
          <div className="space-y-4">
            {platformPerformance.map((platform, index) => (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="border border-[#2D3748] rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-[#3B82F6] hover:bg-gray-800/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">{platform.platform}</h3>
                  <span className="text-sm text-gray-400">ROAS: {platform.roas}x</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Impressies</p>
                    <p className="text-white font-medium">{platform.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">CTR</p>
                    <p className="text-white font-medium">{platform.ctr}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Uitgegeven</p>
                    <p className="text-white font-medium">€{platform.spent.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Audience Inzichten</h2>
          <div className="space-y-4">
            {audienceInsights.slice(0, 6).map((audience, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="border border-[#2D3748] rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-[#3B82F6] hover:bg-gray-800/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{audience.ageGroup} - {audience.gender}</h3>
                  <span className="text-sm text-gray-400">CTR: {audience.ctr}%</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Impressies</p>
                    <p className="text-white font-medium">{audience.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Conversies</p>
                    <p className="text-white font-medium">{audience.conversions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Conv. Rate</p>
                    <p className="text-white font-medium">{audience.conversionRate}%</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Facebook Analytics Data */}
      {facebookAnalytics && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Facebook Analytics Overzicht</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <ClockIcon className="w-4 h-4" />
                <span>Laatste update: {new Date(facebookAnalytics.lastUpdated).toLocaleString('nl-NL')}</span>
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#2D3748] rounded-lg p-4">
                <p className="text-gray-400 text-sm">Totaal Impressies</p>
                <p className="text-xl font-bold text-white">{facebookAnalytics.summary.totalImpressions.toLocaleString()}</p>
              </div>
              <div className="bg-[#2D3748] rounded-lg p-4">
                <p className="text-gray-400 text-sm">Totaal Klikken</p>
                <p className="text-xl font-bold text-white">{facebookAnalytics.summary.totalClicks.toLocaleString()}</p>
              </div>
              <div className="bg-[#2D3748] rounded-lg p-4">
                <p className="text-gray-400 text-sm">Totaal Uitgegeven</p>
                <p className="text-xl font-bold text-white">€{facebookAnalytics.summary.totalSpend.toFixed(2)}</p>
              </div>
              <div className="bg-[#2D3748] rounded-lg p-4">
                <p className="text-gray-400 text-sm">Gemiddelde CTR</p>
                <p className="text-xl font-bold text-white">{facebookAnalytics.summary.averageCTR.toFixed(2)}%</p>
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-white">Campagnes ({facebookAnalytics.campaigns.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#2D3748]">
                    <tr>
                      <th className="text-left p-3 text-gray-300">Campagne</th>
                      <th className="text-left p-3 text-gray-300">Status</th>
                      <th className="text-right p-3 text-gray-300">Impressies</th>
                      <th className="text-right p-3 text-gray-300">Klikken</th>
                      <th className="text-right p-3 text-gray-300">CTR</th>
                      <th className="text-right p-3 text-gray-300">CPC</th>
                      <th className="text-right p-3 text-gray-300">Uitgegeven</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facebookAnalytics.campaigns.map((campaign, index) => (
                      <tr key={campaign.id} className="border-b border-[#2D3748] hover:bg-[#2D3748]/30">
                        <td className="p-3 text-white">{campaign.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            campaign.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="p-3 text-right text-white">{campaign.impressions.toLocaleString()}</td>
                        <td className="p-3 text-right text-white">{campaign.clicks.toLocaleString()}</td>
                        <td className="p-3 text-right text-white">{campaign.ctr.toFixed(2)}%</td>
                        <td className="p-3 text-right text-white">€{campaign.cpc.toFixed(2)}</td>
                        <td className="p-3 text-right text-white">€{campaign.spend.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Performance Metrics Table */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Gedetailleerde Prestaties</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2D3748]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Datum</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Impressies</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Klikken</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">CTR</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">CPC</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Conversies</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Conv. Rate</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Uitgegeven</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3748]">
              {analyticsData.map((data) => (
                <tr key={data.date} className="hover:bg-[#2D3748] transition-colors">
                  <td className="px-4 py-2 text-sm text-gray-300">{data.date}</td>
                  <td className="px-4 py-2 text-sm text-white">{data.impressions.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-white">{data.clicks.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-white">{data.ctr}%</td>
                  <td className="px-4 py-2 text-sm text-white">€{data.cpc}</td>
                  <td className="px-4 py-2 text-sm text-white">{data.conversions.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-white">{data.conversionRate}%</td>
                  <td className="px-4 py-2 text-sm text-white">€{data.spent.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-white">{data.roas}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 