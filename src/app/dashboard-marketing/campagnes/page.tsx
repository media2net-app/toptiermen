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
  FireIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useCampaigns } from '@/contexts/CampaignsContext';

// Mock campaigns data for demonstration (since we haven't created real campaigns yet)
const mockCampaigns = [
  {
    id: 'campaign_algemene',
    name: 'TTM - Algemene Prelaunch Campagne',
    platform: 'Facebook',
    status: 'paused' as const,
    objective: 'traffic' as const,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    spent: 0,
    budget: 150,
    dailyBudget: 150,
    ctr: 0,
    cpc: 0,
    conversionRate: 0,
    roas: 0,
    targetAudience: 'Algemeen (18-65 jaar)',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    adsCount: 5,
    createdAt: '2025-01-01T00:00:00Z',
    lastUpdated: '2025-01-01T00:00:00Z'
  },
  {
    id: 'campaign_jongeren',
    name: 'TTM - Jongeren Prelaunch Campagne',
    platform: 'Facebook',
    status: 'paused' as const,
    objective: 'traffic' as const,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    spent: 0,
    budget: 80,
    dailyBudget: 80,
    ctr: 0,
    cpc: 0,
    conversionRate: 0,
    roas: 0,
    targetAudience: 'Jongeren (18-25 jaar)',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    adsCount: 2,
    createdAt: '2025-01-01T00:00:00Z',
    lastUpdated: '2025-01-01T00:00:00Z'
  }
];

// Types
interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'completed' | 'draft' | 'scheduled';
  objective: 'awareness' | 'traffic' | 'conversions' | 'engagement' | 'sales';
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
  budget: number;
  dailyBudget: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  roas: number;
  targetAudience: string;
  startDate: string;
  endDate: string;
  adsCount: number;
  createdAt: string;
  lastUpdated: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'calendar'>('table');

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignModal(true);
  };

  const handleCloseCampaignModal = () => {
    setShowCampaignModal(false);
    setSelectedCampaign(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'paused': return 'text-yellow-400 bg-yellow-900/20';
      case 'completed': return 'text-blue-400 bg-blue-900/20';
      case 'draft': return 'text-gray-400 bg-gray-900/20';
      case 'scheduled': return 'text-purple-400 bg-purple-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getObjectiveColor = (objective: string) => {
    switch (objective) {
      case 'awareness': return 'text-blue-400';
      case 'traffic': return 'text-green-400';
      case 'conversions': return 'text-purple-400';
      case 'engagement': return 'text-orange-400';
      case 'sales': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'paused': return <PauseIcon className="w-4 h-4 text-yellow-400" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4 text-blue-400" />;
      case 'draft': return <ClockIcon className="w-4 h-4 text-gray-400" />;
      case 'scheduled': return <ClockIcon className="w-4 h-4 text-purple-400" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesPlatform = filterPlatform === 'all' || campaign.platform === filterPlatform;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campagnes</h1>
          <p className="text-gray-400 mt-1">Beheer je marketing campagnes</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={async () => {
              setLoading(true);
              try {
                const response = await fetch('/api/facebook/get-campaigns');
                const result = await response.json();
                if (result.success) {
                  setCampaigns(result.data);
                } else {
                  console.error('Failed to load Facebook campaigns:', result.error);
                }
              } catch (error) {
                console.error('Error loading Facebook campaigns:', error);
              } finally {
                setLoading(false);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Laad Facebook Campagnes</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nieuwe Campagne</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-blue-400 font-semibold mb-1">Facebook Campagnes</h3>
            <p className="text-blue-200 text-sm mb-2">
              Momenteel worden demo campagnes getoond. Klik op "Laad Facebook Campagnes" om echte campagnes van Facebook op te halen, 
              of ga naar "Advertentie Materiaal" om nieuwe campagnes aan te maken.
            </p>
            <div className="flex items-center space-x-4 text-xs text-blue-300">
              <span>📊 Demo: 2 campagnes (Algemeen + Jongeren)</span>
              <span>💰 Budget: €230/dag totaal</span>
              <span>🎯 Doel: TRAFFIC naar prelaunch</span>
              <a 
                href="/dashboard-marketing/advertentie-materiaal" 
                className="text-blue-400 hover:text-blue-300 underline"
              >
                → Ga naar Advertentie Materiaal
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek campagnes..."
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
            <option value="completed">Voltooid</option>
            <option value="draft">Concept</option>
            <option value="scheduled">Gepland</option>
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
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-[#3B82F6] text-white'
                : 'bg-[#2D3748] text-gray-400 hover:text-white'
            }`}
          >
            Kalender
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
              <p className="text-gray-400 text-sm">Totaal Campagnes</p>
              <p className="text-2xl font-bold text-white">{campaigns.length}</p>
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
              <p className="text-gray-400 text-sm">Actieve Campagnes</p>
              <p className="text-2xl font-bold text-white">{campaigns.filter(c => c.status === 'active').length}</p>
            </div>
            <PlayIcon className="w-8 h-8 text-green-400" />
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
              <p className="text-gray-400 text-sm">Totaal Uitgegeven</p>
              <p className="text-2xl font-bold text-white">
                €{campaigns.reduce((sum, c) => sum + c.spent, 0).toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-[#8BAE5A]" />
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
                <p className="text-gray-400 text-sm">Totaal Conversies</p>
                <p className="text-2xl font-bold text-white">
                  {campaigns.reduce((sum, c) => sum + c.conversions, 0).toLocaleString()}
                </p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-[#8BAE5A]" />
            </div>
        </motion.div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{campaign.name}</h3>
                <p className="text-gray-400 text-sm">{campaign.platform}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(campaign.status)}
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Doel</p>
                <p className={`text-sm font-medium ${getObjectiveColor(campaign.objective)}`}>
                  {campaign.objective}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Advertenties</p>
                <p className="text-white font-medium">{campaign.adsCount}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Budget</p>
                <p className="text-white font-medium">€{campaign.budget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Uitgegeven</p>
                <p className="text-white font-medium">€{campaign.spent.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-gray-400 text-xs">Impressies</p>
                <p className="text-white font-medium text-sm">{campaign.impressions.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs">Klikken</p>
                <p className="text-white font-medium text-sm">{campaign.clicks.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs">CTR</p>
                <p className="text-white font-medium text-sm">{campaign.ctr}%</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs">ROAS</p>
                <p className="text-white font-medium text-sm">{campaign.roas}x</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2D3748]">
              <div className="text-sm text-gray-400">
                {campaign.startDate} - {campaign.endDate}
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-[#8BAE5A] hover:text-[#9BBE6A]">
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button className="text-blue-400 hover:text-blue-300">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button className="text-red-400 hover:text-red-300">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Toon {filteredCampaigns.length} van {campaigns.length} campagnes
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
    </div>
  );
} 