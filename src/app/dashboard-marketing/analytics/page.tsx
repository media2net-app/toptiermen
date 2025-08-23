'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  EyeIcon, 
  CursorArrowRaysIcon, 
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  BellIcon
} from '@heroicons/react/24/outline';

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
    totalAdSets: number;
    totalAds: number;
    totalCreatives: number;
    totalConversions: number;
    averageCostPerConversion: number;
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
    action_values: Array<{ action_type: string; value: string }>;
    cost_per_action_type: Array<{ action_type: string; value: string }>;
    cost_per_conversion: number;
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
  insights: {
    topPerformingCampaigns: any[];
    topPerformingAds: any[];
    bestCTR: any[];
    bestCPC: any[];
    recentActivity: any[];
  };
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
  const [error, setError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'ads' | 'performance'>('overview');

  // Load comprehensive Facebook analytics data
  useEffect(() => {
    const loadFacebookAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('📊 Loading comprehensive Facebook analytics data...');
        
        const response = await fetch(`/api/facebook/comprehensive-analytics?dateRange=${timeRange}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          console.log('✅ Comprehensive Facebook analytics loaded:', data.data);
          setFacebookAnalytics(data.data);
          
          // Create platform performance data from Facebook data
          const facebookPlatformData: PlatformPerformance = {
            platform: "Facebook",
            impressions: data.data.summary.totalImpressions,
            clicks: data.data.summary.totalClicks,
            conversions: data.data.summary.totalConversions,
            spent: data.data.summary.totalSpend,
            ctr: data.data.summary.averageCTR,
            cpc: data.data.summary.averageCPC,
            conversionRate: data.data.summary.totalClicks > 0 ? 
              (data.data.summary.totalConversions / data.data.summary.totalClicks) * 100 : 0,
            roas: data.data.summary.totalSpend > 0 ? 
              (data.data.summary.totalConversions * 50) / data.data.summary.totalSpend : 0 // Assuming €50 value per conversion
          };
          
          setPlatformPerformance([facebookPlatformData]);
          
          // Create audience insights from campaign data
          const mockAudienceInsights: AudienceInsights[] = [
            { ageGroup: "25-34", gender: "Male", impressions: Math.floor(data.data.summary.totalImpressions * 0.4), clicks: Math.floor(data.data.summary.totalClicks * 0.4), conversions: Math.floor(data.data.summary.totalConversions * 0.4), ctr: data.data.summary.averageCTR, conversionRate: data.data.summary.totalClicks > 0 ? (data.data.summary.totalConversions / data.data.summary.totalClicks) * 100 : 0 },
            { ageGroup: "35-44", gender: "Male", impressions: Math.floor(data.data.summary.totalImpressions * 0.3), clicks: Math.floor(data.data.summary.totalClicks * 0.3), conversions: Math.floor(data.data.summary.totalConversions * 0.3), ctr: data.data.summary.averageCTR, conversionRate: data.data.summary.totalClicks > 0 ? (data.data.summary.totalConversions / data.data.summary.totalClicks) * 100 : 0 },
            { ageGroup: "45-54", gender: "Male", impressions: Math.floor(data.data.summary.totalImpressions * 0.2), clicks: Math.floor(data.data.summary.totalClicks * 0.2), conversions: Math.floor(data.data.summary.totalConversions * 0.2), ctr: data.data.summary.averageCTR, conversionRate: data.data.summary.totalClicks > 0 ? (data.data.summary.totalConversions / data.data.summary.totalClicks) * 100 : 0 },
            { ageGroup: "25-34", gender: "Female", impressions: Math.floor(data.data.summary.totalImpressions * 0.05), clicks: Math.floor(data.data.summary.totalClicks * 0.05), conversions: Math.floor(data.data.summary.totalConversions * 0.05), ctr: data.data.summary.averageCTR, conversionRate: data.data.summary.totalClicks > 0 ? (data.data.summary.totalConversions / data.data.summary.totalClicks) * 100 : 0 },
            { ageGroup: "35-44", gender: "Female", impressions: Math.floor(data.data.summary.totalImpressions * 0.05), clicks: Math.floor(data.data.summary.totalClicks * 0.05), conversions: Math.floor(data.data.summary.totalConversions * 0.05), ctr: data.data.summary.averageCTR, conversionRate: data.data.summary.totalClicks > 0 ? (data.data.summary.totalConversions / data.data.summary.totalClicks) * 100 : 0 }
          ];
          
          setAudienceInsights(mockAudienceInsights);
          
          // Create time series data from campaigns
          const timeSeriesData: AnalyticsData[] = data.data.campaigns.map((campaign: any, index: number) => ({
            date: new Date(campaign.created_time).toISOString().split('T')[0],
            impressions: campaign.impressions,
            clicks: campaign.clicks,
            conversions: campaign.actions?.filter((action: any) => 
              action.action_type === 'purchase' || action.action_type === 'lead' || action.action_type === 'complete_registration'
            ).reduce((sum: number, action: any) => sum + (parseInt(action.value) || 0), 0) || 0,
            spent: campaign.spend,
            ctr: campaign.ctr,
            cpc: campaign.cpc,
            conversionRate: campaign.clicks > 0 ? 
              (campaign.actions?.filter((action: any) => 
                action.action_type === 'purchase' || action.action_type === 'lead' || action.action_type === 'complete_registration'
              ).reduce((sum: number, action: any) => sum + (parseInt(action.value) || 0), 0) || 0) / campaign.clicks * 100 : 0,
            roas: campaign.spend > 0 ? 
              ((campaign.actions?.filter((action: any) => 
                action.action_type === 'purchase' || action.action_type === 'lead' || action.action_type === 'complete_registration'
              ).reduce((sum: number, action: any) => sum + (parseInt(action.value) || 0), 0) || 0) * 50) / campaign.spend : 0
          }));
          
          setAnalyticsData(timeSeriesData);
          
        } else {
          console.error('Failed to load Facebook analytics:', data);
          setError(data.error || 'Failed to load analytics data');
          // Fallback to empty data
          setAnalyticsData([]);
          setPlatformPerformance([]);
          setAudienceInsights([]);
        }
      } catch (error) {
        console.error('Error loading Facebook analytics:', error);
        setError('Error loading analytics data. Please try again.');
        // Fallback to empty data
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
      case 'impressions': return EyeIcon;
      case 'clicks': return CursorArrowRaysIcon;
      case 'conversions': return CheckCircleIcon;
      case 'spent': return CurrencyEuroIcon;
      case 'ctr': return ArrowTrendingUpIcon;
      case 'cpc': return CurrencyEuroIcon;
      case 'conversionRate': return ArrowTrendingUpIcon;
      case 'roas': return ArrowTrendingUpIcon;
      default: return EyeIcon;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Analytics</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketing Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive Facebook campaign performance insights</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white"
            >
              <option value="last_7d">Last 7 days</option>
              <option value="last_30d">Last 30 days</option>
              <option value="last_90d">Last 90 days</option>
              <option value="last_365d">Last year</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export
            </button>
            <button
              onClick={handleToggleAlerts}
              className={`flex items-center px-4 py-2 rounded-md ${
                showAlerts ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <BellIcon className="h-5 w-5 mr-2" />
              Alerts
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {facebookAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <EyeIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(facebookAnalytics.summary.totalImpressions)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CursorArrowRaysIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(facebookAnalytics.summary.totalClicks)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CurrencyEuroIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spend</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(facebookAnalytics.summary.totalSpend)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(facebookAnalytics.summary.totalConversions)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                { id: 'campaigns', name: 'Campaigns', icon: EyeIcon },
                { id: 'ads', name: 'Ads', icon: CursorArrowRaysIcon },
                { id: 'performance', name: 'Performance', icon: ArrowTrendingUpIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && facebookAnalytics && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Metrics */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average CTR</span>
                        <span className="font-semibold">{formatPercentage(facebookAnalytics.summary.averageCTR)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average CPC</span>
                        <span className="font-semibold">{formatCurrency(facebookAnalytics.summary.averageCPC)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average CPM</span>
                        <span className="font-semibold">{formatCurrency(facebookAnalytics.summary.averageCPM)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost per Conversion</span>
                        <span className="font-semibold">{formatCurrency(facebookAnalytics.summary.averageCostPerConversion)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Status */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Status</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Campaigns</span>
                        <span className="font-semibold text-green-600">{facebookAnalytics.summary.activeCampaigns}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Campaigns</span>
                        <span className="font-semibold">{facebookAnalytics.summary.totalCampaigns}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Ad Sets</span>
                        <span className="font-semibold">{facebookAnalytics.summary.totalAdSets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Ads</span>
                        <span className="font-semibold">{facebookAnalytics.summary.totalAds}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performing Campaigns */}
                {facebookAnalytics.insights.topPerformingCampaigns.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Campaigns</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPC</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {facebookAnalytics.insights.topPerformingCampaigns.map((campaign) => (
                            <tr key={campaign.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {campaign.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(campaign.spend)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(campaign.clicks)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPercentage(campaign.ctr)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(campaign.cpc)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && facebookAnalytics && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">All Campaigns</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objective</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPC</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {facebookAnalytics.campaigns.map((campaign) => (
                          <tr key={campaign.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {campaign.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.objective}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(campaign.impressions)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(campaign.clicks)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(campaign.spend)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPercentage(campaign.ctr)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(campaign.cpc)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Ads Tab */}
            {activeTab === 'ads' && facebookAnalytics && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">All Ads</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spend</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPC</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {facebookAnalytics.ads.map((ad) => (
                          <tr key={ad.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ad.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                ad.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {ad.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(ad.impressions)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(ad.clicks)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(ad.spend)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPercentage(ad.ctr)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(ad.cpc)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                {/* Metric Selector */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Metric:</label>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white"
                  >
                    <option value="impressions">Impressions</option>
                    <option value="clicks">Clicks</option>
                    <option value="conversions">Conversions</option>
                    <option value="spent">Spent</option>
                    <option value="ctr">CTR</option>
                    <option value="cpc">CPC</option>
                    <option value="conversionRate">Conversion Rate</option>
                    <option value="roas">ROAS</option>
                  </select>
                </div>

                {/* Performance Chart */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h3>
                  <div className="h-64 flex items-end justify-center space-x-2">
                    {analyticsData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-blue-600 rounded-t w-8"
                          style={{ 
                            height: `${Math.max((getMetricValue(data) / Math.max(...analyticsData.map(d => getMetricValue(d)), 1)) * 200, 4)}px` 
                          }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-1">{data.date}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-4">{getMetricLabel()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Last Updated */}
        {facebookAnalytics && (
          <div className="text-center text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 inline mr-1" />
            Last updated: {new Date(facebookAnalytics.lastUpdated).toLocaleString('nl-NL')}
          </div>
        )}
      </div>
    </div>
  );
} 