'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ChartBarIcon,
  MegaphoneIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import CampaignModal from '@/components/marketing/CampaignModal';

// Types
interface MarketingStats {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalSpent: number;
  totalRevenue: number;
  totalProfit: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  roas: number;
  averageOrderValue: number;
}

interface RecentCampaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
  revenue: number;
  profit: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  roas: number;
  startDate: string;
  endDate: string;
}

interface RecentAd {
  id: string;
  name: string;
  campaign: string;
  platform: string;
  status: 'active' | 'paused' | 'rejected' | 'draft';
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  lastUpdated: string;
}

export default function MarketingDashboard() {
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [recentCampaigns, setRecentCampaigns] = useState<RecentCampaign[]>([]);
  const [recentAds, setRecentAds] = useState<RecentAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data for now
  useEffect(() => {
    const mockStats: MarketingStats = {
      totalImpressions: 1250000,
      totalClicks: 45000,
      totalConversions: 2250,
      totalSpent: 15000,
      totalRevenue: 67500,
      totalProfit: 52500,
      ctr: 3.6,
      cpc: 0.33,
      conversionRate: 5.0,
      roas: 4.5,
      averageOrderValue: 30.0
    };

    const mockCampaigns: RecentCampaign[] = [
      {
        id: "1",
        name: "Summer Fitness Challenge",
        platform: "Facebook",
        status: "active",
        impressions: 250000,
        clicks: 8500,
        conversions: 425,
        spent: 2800,
        revenue: 12750,
        profit: 9950,
        ctr: 3.4,
        cpc: 0.33,
        conversionRate: 5.0,
        roas: 4.8,
        startDate: "2025-07-01",
        endDate: "2025-08-31"
      },
      {
        id: "2",
        name: "Brotherhood Community",
        platform: "Instagram",
        status: "active",
        impressions: 180000,
        clicks: 7200,
        conversions: 360,
        spent: 2400,
        revenue: 10800,
        profit: 8400,
        ctr: 4.0,
        cpc: 0.33,
        conversionRate: 5.0,
        roas: 4.2,
        startDate: "2025-07-15",
        endDate: "2025-09-15"
      },
      {
        id: "3",
        name: "Premium Membership",
        platform: "Google Ads",
        status: "active",
        impressions: 320000,
        clicks: 12800,
        conversions: 640,
        spent: 4200,
        revenue: 19200,
        profit: 15000,
        ctr: 4.0,
        cpc: 0.33,
        conversionRate: 5.0,
        roas: 4.1,
        startDate: "2025-06-01",
        endDate: "2025-12-31"
      }
    ];

    // Extended campaign data for modal
    const extendedCampaignData = {
      "1": {
        id: "1",
        name: "Summer Fitness Challenge",
        platform: "Facebook",
        status: "active" as const,
        budget: 5000,
        spent: 2800,
        impressions: 250000,
        clicks: 8500,
        conversions: 425,
        ctr: 3.4,
        cpc: 0.33,
        cpm: 11.2,
        roas: 4.8,
        startDate: "2025-07-01",
        endDate: "2025-08-31",
        targetAudience: {
          ageRange: "25-45",
          interests: ["Fitness", "Krachttraining", "Gezonde Voeding", "Persoonlijke Ontwikkeling"],
          locations: ["Nederland", "België", "Duitsland"],
          gender: "Male"
        },
        adSets: [
          {
            id: "1a",
            name: "Fitness Enthusiasts",
            status: "active",
            budget: 2000,
            spent: 1200,
            impressions: 100000,
            clicks: 3500,
            conversions: 175
          },
          {
            id: "1b",
            name: "Strength Training",
            status: "active",
            budget: 1500,
            spent: 900,
            impressions: 75000,
            clicks: 2500,
            conversions: 125
          },
          {
            id: "1c",
            name: "Health & Wellness",
            status: "active",
            budget: 1500,
            spent: 700,
            impressions: 75000,
            clicks: 2500,
            conversions: 125
          }
        ],
        performanceData: [
          { date: "2025-07-01", impressions: 8500, clicks: 290, conversions: 14, spend: 95, revenue: 420 },
          { date: "2025-07-02", impressions: 9200, clicks: 310, conversions: 16, spend: 102, revenue: 480 },
          { date: "2025-07-03", impressions: 8800, clicks: 300, conversions: 15, spend: 99, revenue: 450 },
          { date: "2025-07-04", impressions: 9500, clicks: 320, conversions: 17, spend: 106, revenue: 510 },
          { date: "2025-07-05", impressions: 9100, clicks: 310, conversions: 16, spend: 103, revenue: 480 },
          { date: "2025-07-06", impressions: 8700, clicks: 295, conversions: 15, spend: 98, revenue: 450 },
          { date: "2025-07-07", impressions: 9300, clicks: 315, conversions: 16, spend: 105, revenue: 480 }
        ],
        demographics: [
          { age: "18-24", percentage: 15, impressions: 37500 },
          { age: "25-34", percentage: 35, impressions: 87500 },
          { age: "35-44", percentage: 30, impressions: 75000 },
          { age: "45-54", percentage: 15, impressions: 37500 },
          { age: "55+", percentage: 5, impressions: 12500 }
        ],
        devices: [
          { device: "Mobile", percentage: 65, impressions: 162500 },
          { device: "Desktop", percentage: 30, impressions: 75000 },
          { device: "Tablet", percentage: 5, impressions: 12500 }
        ]
      },
      "2": {
        id: "2",
        name: "Brotherhood Community",
        platform: "Instagram",
        status: "active" as const,
        budget: 4000,
        spent: 2400,
        impressions: 180000,
        clicks: 7200,
        conversions: 360,
        ctr: 4.0,
        cpc: 0.33,
        cpm: 13.3,
        roas: 4.2,
        startDate: "2025-07-15",
        endDate: "2025-09-15",
        targetAudience: {
          ageRange: "20-40",
          interests: ["Brotherhood", "Community", "Leadership", "Personal Growth"],
          locations: ["Nederland", "Vlaanderen"],
          gender: "Male"
        },
        adSets: [
          {
            id: "2a",
            name: "Community Leaders",
            status: "active",
            budget: 1500,
            spent: 900,
            impressions: 67500,
            clicks: 2700,
            conversions: 135
          },
          {
            id: "2b",
            name: "Personal Development",
            status: "active",
            budget: 1500,
            spent: 900,
            impressions: 67500,
            clicks: 2700,
            conversions: 135
          },
          {
            id: "2c",
            name: "Fitness Community",
            status: "active",
            budget: 1000,
            spent: 600,
            impressions: 45000,
            clicks: 1800,
            conversions: 90
          }
        ],
        performanceData: [
          { date: "2025-07-15", impressions: 6000, clicks: 240, conversions: 12, spend: 80, revenue: 360 },
          { date: "2025-07-16", impressions: 6500, clicks: 260, conversions: 13, spend: 87, revenue: 390 },
          { date: "2025-07-17", impressions: 6200, clicks: 248, conversions: 12, spend: 83, revenue: 360 },
          { date: "2025-07-18", impressions: 6800, clicks: 272, conversions: 14, spend: 91, revenue: 420 },
          { date: "2025-07-19", impressions: 6400, clicks: 256, conversions: 13, spend: 86, revenue: 390 },
          { date: "2025-07-20", impressions: 6100, clicks: 244, conversions: 12, spend: 82, revenue: 360 },
          { date: "2025-07-21", impressions: 6600, clicks: 264, conversions: 13, spend: 89, revenue: 390 }
        ],
        demographics: [
          { age: "18-24", percentage: 20, impressions: 36000 },
          { age: "25-34", percentage: 40, impressions: 72000 },
          { age: "35-44", percentage: 25, impressions: 45000 },
          { age: "45-54", percentage: 12, impressions: 21600 },
          { age: "55+", percentage: 3, impressions: 5400 }
        ],
        devices: [
          { device: "Mobile", percentage: 80, impressions: 144000 },
          { device: "Desktop", percentage: 15, impressions: 27000 },
          { device: "Tablet", percentage: 5, impressions: 9000 }
        ]
      },
      "3": {
        id: "3",
        name: "Premium Membership",
        platform: "Google Ads",
        status: "active" as const,
        budget: 8000,
        spent: 4200,
        impressions: 320000,
        clicks: 12800,
        conversions: 640,
        ctr: 4.0,
        cpc: 0.33,
        cpm: 13.1,
        roas: 4.1,
        startDate: "2025-06-01",
        endDate: "2025-12-31",
        targetAudience: {
          ageRange: "25-50",
          interests: ["Premium Services", "Exclusive Content", "High-Value Products"],
          locations: ["Nederland", "België", "Duitsland", "Verenigd Koninkrijk"],
          gender: "Male"
        },
        adSets: [
          {
            id: "3a",
            name: "High-Value Prospects",
            status: "active",
            budget: 3000,
            spent: 1575,
            impressions: 120000,
            clicks: 4800,
            conversions: 240
          },
          {
            id: "3b",
            name: "Premium Content Seekers",
            status: "active",
            budget: 2500,
            spent: 1312,
            impressions: 100000,
            clicks: 4000,
            conversions: 200
          },
          {
            id: "3c",
            name: "Exclusive Services",
            status: "active",
            budget: 2500,
            spent: 1313,
            impressions: 100000,
            clicks: 4000,
            conversions: 200
          }
        ],
        performanceData: [
          { date: "2025-07-01", impressions: 10667, clicks: 427, conversions: 21, spend: 140, revenue: 630 },
          { date: "2025-07-02", impressions: 11500, clicks: 460, conversions: 23, spend: 152, revenue: 690 },
          { date: "2025-07-03", impressions: 11000, clicks: 440, conversions: 22, spend: 145, revenue: 660 },
          { date: "2025-07-04", impressions: 11833, clicks: 473, conversions: 24, spend: 156, revenue: 720 },
          { date: "2025-07-05", impressions: 11250, clicks: 450, conversions: 23, spend: 149, revenue: 690 },
          { date: "2025-07-06", impressions: 10833, clicks: 433, conversions: 22, spend: 143, revenue: 660 },
          { date: "2025-07-07", impressions: 11667, clicks: 467, conversions: 23, spend: 154, revenue: 690 }
        ],
        demographics: [
          { age: "18-24", percentage: 10, impressions: 32000 },
          { age: "25-34", percentage: 30, impressions: 96000 },
          { age: "35-44", percentage: 35, impressions: 112000 },
          { age: "45-54", percentage: 20, impressions: 64000 },
          { age: "55+", percentage: 5, impressions: 16000 }
        ],
        devices: [
          { device: "Mobile", percentage: 55, impressions: 176000 },
          { device: "Desktop", percentage: 40, impressions: 128000 },
          { device: "Tablet", percentage: 5, impressions: 16000 }
        ]
      }
    };

    const mockAds: RecentAd[] = [
      {
        id: "1",
        name: "Transform Your Life",
        campaign: "Summer Fitness Challenge",
        platform: "Facebook",
        status: "active",
        impressions: 85000,
        clicks: 2900,
        ctr: 3.4,
        cpc: 0.33,
        performance: "excellent",
        lastUpdated: "2025-07-27T10:30:00Z"
      },
      {
        id: "2",
        name: "Join the Brotherhood",
        campaign: "Brotherhood Community",
        platform: "Instagram",
        status: "active",
        impressions: 62000,
        clicks: 2480,
        ctr: 4.0,
        cpc: 0.33,
        performance: "good",
        lastUpdated: "2025-07-27T09:15:00Z"
      },
      {
        id: "3",
        name: "Premium Features",
        campaign: "Premium Membership",
        platform: "Google Ads",
        status: "active",
        impressions: 105000,
        clicks: 4200,
        ctr: 4.0,
        cpc: 0.33,
        performance: "excellent",
        lastUpdated: "2025-07-27T08:45:00Z"
      }
    ];

    setStats(mockStats);
    setRecentCampaigns(mockCampaigns);
    setRecentAds(mockAds);
    
    // Store extended campaign data in component state
    (window as any).extendedCampaignData = extendedCampaignData;
    
    setLoading(false);
  }, []);

  const handleCampaignClick = (campaignId: string) => {
    const campaignData = (window as any).extendedCampaignData?.[campaignId];
    if (campaignData) {
      setSelectedCampaign(campaignData);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'paused': return 'text-yellow-400 bg-yellow-900/20';
      case 'completed': return 'text-blue-400 bg-blue-900/20';
      case 'draft': return 'text-gray-400 bg-gray-900/20';
      case 'rejected': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'average': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return <StarIcon className="w-4 h-4 text-green-400" />;
      case 'good': return <FireIcon className="w-4 h-4 text-blue-400" />;
      case 'average': return <ClockIcon className="w-4 h-4 text-yellow-400" />;
      case 'poor': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-400" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading marketing dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing Overzicht</h1>
          <p className="text-gray-400 mt-1">Beheer je marketing activiteiten en prestaties</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard-marketing/marketingplan"
            className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors hover:bg-yellow-500/30"
          >
            <DocumentChartBarIcon className="w-5 h-5" />
            <span>Marketing Plan</span>
          </Link>
          <button className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span>Nieuwe Campagne</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.totalImpressions.toLocaleString()}
              </p>
            </div>
            <EyeIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+12.5%</span>
          </div>
        </motion.div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Klikken</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.totalClicks.toLocaleString()}
              </p>
            </div>
            <CursorArrowRaysIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+8.3%</span>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Conversies</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.totalConversions.toLocaleString()}
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+15.2%</span>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Uitgegeven</p>
              <p className="text-2xl font-bold text-white mt-1">
                €{stats?.totalSpent.toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+5.7%</span>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Omzet</p>
              <p className="text-2xl font-bold text-white mt-1">
                €{stats?.totalRevenue.toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+18.9%</span>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Winst</p>
              <p className="text-2xl font-bold text-white mt-1">
                €{stats?.totalProfit.toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+22.3%</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <p className="text-gray-400 text-sm">CTR</p>
          <p className="text-xl font-bold text-white">{stats?.ctr}%</p>
        </div>
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <p className="text-gray-400 text-sm">CPC</p>
          <p className="text-xl font-bold text-white">€{stats?.cpc}</p>
        </div>
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <p className="text-gray-400 text-sm">Conversie Rate</p>
          <p className="text-xl font-bold text-white">{stats?.conversionRate}%</p>
        </div>
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <p className="text-gray-400 text-sm">ROAS</p>
          <p className="text-xl font-bold text-white">{stats?.roas}x</p>
        </div>
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <p className="text-gray-400 text-sm">Gem. Orderwaarde</p>
          <p className="text-xl font-bold text-white">€{stats?.averageOrderValue}</p>
        </div>
      </div>

      {/* Recent Campaigns and Ads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recente Campagnes</h2>
            <button className="text-[#8BAE5A] hover:text-[#9BBE6A] text-sm">Bekijk alle</button>
          </div>
          <div className="space-y-4">
            {recentCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                className="border border-[#2D3748] rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-[#3B82F6] hover:bg-gray-800/30"
                onClick={() => handleCampaignClick(campaign.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{campaign.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{campaign.platform}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Impressies</p>
                    <p className="text-white font-medium">{campaign.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Conversies</p>
                    <p className="text-white font-medium">{campaign.conversions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Uitgegeven</p>
                    <p className="text-white font-medium">€{campaign.spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Omzet</p>
                    <p className="text-white font-medium text-green-400">€{campaign.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Winst</p>
                    <p className="text-white font-medium text-green-400">€{campaign.profit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">ROAS</p>
                    <p className="text-white font-medium">{campaign.roas}x</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500">Klik voor details →</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Ads */}
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recente Advertenties</h2>
            <button className="text-[#8BAE5A] hover:text-[#9BBE6A] text-sm">Bekijk alle</button>
          </div>
          <div className="space-y-4">
            {recentAds.map((ad) => (
              <div key={ad.id} className="border border-[#2D3748] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{ad.name}</h3>
                  <div className="flex items-center space-x-2">
                    {getPerformanceIcon(ad.performance)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ad.status)}`}>
                      {ad.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-2">{ad.campaign} • {ad.platform}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Impressies</p>
                    <p className="text-white font-medium">{ad.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">CTR</p>
                    <p className="text-white font-medium">{ad.ctr}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">CPC</p>
                    <p className="text-white font-medium">€{ad.cpc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Modal */}
      <CampaignModal
        campaign={selectedCampaign}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
} 