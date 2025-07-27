'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import AdModal from '@/components/marketing/AdModal';

// Types
interface Advertisement {
  id: string;
  name: string;
  campaign: string;
  platform: string;
  status: 'active' | 'paused' | 'rejected' | 'draft' | 'pending_review';
  type: 'image' | 'video' | 'carousel' | 'story';
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spent: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  targetAudience: string;
  startDate: string;
  endDate: string;
  budget: number;
  dailyBudget: number;
  createdAt: string;
  lastUpdated: string;
}

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Mock data
  useEffect(() => {
    const mockAds: Advertisement[] = [
      {
        id: "1",
        name: "Transform Your Life - Summer Edition",
        campaign: "Summer Fitness Challenge",
        platform: "Facebook",
        status: "active",
        type: "image",
        impressions: 85000,
        clicks: 2900,
        ctr: 3.4,
        cpc: 0.33,
        spent: 957,
        performance: "excellent",
        targetAudience: "Fitness enthusiasts, 25-45",
        startDate: "2025-07-01",
        endDate: "2025-08-31",
        budget: 1500,
        dailyBudget: 25,
        createdAt: "2025-07-01T10:00:00Z",
        lastUpdated: "2025-07-27T10:30:00Z"
      },
      {
        id: "2",
        name: "Join the Brotherhood Community",
        campaign: "Brotherhood Community",
        platform: "Instagram",
        status: "active",
        type: "carousel",
        impressions: 62000,
        clicks: 2480,
        ctr: 4.0,
        cpc: 0.33,
        spent: 818,
        performance: "good",
        targetAudience: "Men, 18-35, interested in self-improvement",
        startDate: "2025-07-15",
        endDate: "2025-09-15",
        budget: 1200,
        dailyBudget: 20,
        createdAt: "2025-07-15T14:00:00Z",
        lastUpdated: "2025-07-27T09:15:00Z"
      },
      {
        id: "3",
        name: "Premium Features Showcase",
        campaign: "Premium Membership",
        platform: "Google Ads",
        status: "active",
        type: "video",
        impressions: 105000,
        clicks: 4200,
        ctr: 4.0,
        cpc: 0.33,
        spent: 1386,
        performance: "excellent",
        targetAudience: "Professionals, 30-50, high income",
        startDate: "2025-06-01",
        endDate: "2025-12-31",
        budget: 3000,
        dailyBudget: 50,
        createdAt: "2025-06-01T09:00:00Z",
        lastUpdated: "2025-07-27T08:45:00Z"
      },
      {
        id: "4",
        name: "Mind & Focus Meditation",
        campaign: "Mind & Focus",
        platform: "Facebook",
        status: "paused",
        type: "video",
        impressions: 45000,
        clicks: 1350,
        ctr: 3.0,
        cpc: 0.35,
        spent: 472,
        performance: "average",
        targetAudience: "Wellness seekers, 25-40",
        startDate: "2025-07-10",
        endDate: "2025-08-10",
        budget: 800,
        dailyBudget: 15,
        createdAt: "2025-07-10T11:00:00Z",
        lastUpdated: "2025-07-25T16:20:00Z"
      },
      {
        id: "5",
        name: "Finance & Business Tools",
        campaign: "Finance & Business",
        platform: "LinkedIn",
        status: "draft",
        type: "image",
        impressions: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        spent: 0,
        performance: "poor",
        targetAudience: "Entrepreneurs, 30-50",
        startDate: "2025-08-01",
        endDate: "2025-09-30",
        budget: 2000,
        dailyBudget: 30,
        createdAt: "2025-07-26T15:00:00Z",
        lastUpdated: "2025-07-26T15:00:00Z"
      }
    ];

    setAds(mockAds);
    setLoading(false);
  }, []);

  const handleAdClick = (ad: Advertisement) => {
    setSelectedAd(ad);
    setShowAdModal(true);
  };

  const handleCloseAdModal = () => {
    setShowAdModal(false);
    setSelectedAd(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'paused': return 'text-yellow-400 bg-yellow-900/20';
      case 'rejected': return 'text-red-400 bg-red-900/20';
      case 'draft': return 'text-gray-400 bg-gray-900/20';
      case 'pending_review': return 'text-blue-400 bg-blue-900/20';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'paused': return <PauseIcon className="w-4 h-4 text-yellow-400" />;
      case 'rejected': return <XCircleIcon className="w-4 h-4 text-red-400" />;
      case 'draft': return <ClockIcon className="w-4 h-4 text-gray-400" />;
      case 'pending_review': return <ExclamationTriangleIcon className="w-4 h-4 text-blue-400" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.campaign.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ad.status === filterStatus;
    const matchesPlatform = filterPlatform === 'all' || ad.platform === filterPlatform;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading advertisements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Advertenties</h1>
          <p className="text-gray-400 mt-1">Beheer je advertenties en campagnes</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nieuwe Advertentie</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek advertenties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
          >
            <option value="all">Alle Statussen</option>
            <option value="active">Actief</option>
            <option value="paused">Gepauzeerd</option>
            <option value="draft">Concept</option>
            <option value="rejected">Afgewezen</option>
            <option value="pending_review">In Review</option>
          </select>

          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
          >
            <option value="all">Alle Platforms</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
            <option value="Google Ads">Google Ads</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>

          <button className="px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white hover:bg-[#3A4D23] transition-colors flex items-center justify-center space-x-2">
            <FunnelIcon className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-[#3B82F6] text-white'
                : 'bg-[#2D3748] text-gray-400 hover:text-white'
            }`}
          >
            Tabel
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'cards'
                ? 'bg-[#3B82F6] text-white'
                : 'bg-[#2D3748] text-gray-400 hover:text-white'
            }`}
          >
            Kaarten
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Advertenties</p>
              <p className="text-2xl font-bold text-white">{ads.length}</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Actieve Advertenties</p>
              <p className="text-2xl font-bold text-white">{ads.filter(ad => ad.status === 'active').length}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gemiddelde CTR</p>
              <p className="text-2xl font-bold text-white">
                {(ads.reduce((sum, ad) => sum + ad.ctr, 0) / ads.length).toFixed(1)}%
              </p>
            </div>
            <ArrowTrendingUpIcon className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Uitgegeven</p>
              <p className="text-2xl font-bold text-white">
                €{ads.reduce((sum, ad) => sum + ad.spent, 0).toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </motion.div>
      </div>

      {/* Advertisements Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2D3748]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Advertentie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Campagne
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Prestaties
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Impressies
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Uitgegeven
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D3748]">
                  {filteredAds.map((ad, index) => (
                    <motion.tr
                      key={ad.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#2D3748] transition-colors cursor-pointer"
                      onClick={() => handleAdClick(ad)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{ad.name}</div>
                          <div className="text-sm text-gray-400">{ad.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {ad.campaign}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {ad.platform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(ad.status)}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ad.status)}`}>
                            {ad.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getPerformanceColor(ad.performance)}`}>
                          {ad.performance}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {ad.impressions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {ad.ctr}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        €{ad.spent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="text-[#8BAE5A] hover:text-[#9BBE6A]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdClick(ad);
                            }}
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="text-blue-400 hover:text-blue-300">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="text-red-400 hover:text-red-300">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAds.map((ad, index) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6 cursor-pointer transition-all duration-200 hover:border-[#3B82F6] hover:bg-gray-800/30"
                onClick={() => handleAdClick(ad)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(ad.status)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ad.status)}`}>
                      {ad.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${getPerformanceColor(ad.performance)}`}>
                    {ad.performance}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{ad.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{ad.campaign} • {ad.platform}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Impressies</p>
                    <p className="text-white font-medium">{ad.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">CTR</p>
                    <p className="text-white font-medium">{ad.ctr}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Uitgegeven</p>
                    <p className="text-white font-medium">€{ad.spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Budget</p>
                    <p className="text-white font-medium">€{ad.budget.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-xs text-gray-500">Klik voor details →</span>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-400 hover:text-blue-300">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Toon {filteredAds.length} van {ads.length} advertenties
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-[#2D3748] border border-[#4A5568] rounded text-white hover:bg-[#3A4D23] transition-colors">
            Vorige
          </button>
          <span className="px-3 py-1 text-white">1</span>
          <button className="px-3 py-1 bg-[#2D3748] border border-[#4A5568] rounded text-white hover:bg-[#3A4D23] transition-colors">
            Volgende
          </button>
        </div>
      </div>

      {/* Ad Modal */}
      <AdModal
        ad={selectedAd}
        isOpen={showAdModal}
        onClose={handleCloseAdModal}
      />
    </div>
  );
} 