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
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import AdDetailModal from '@/app/components/marketing/AdDetailModal';

// Types
interface Advertisement {
  id: string;
  name: string;
  campaign: string;
  adSet: string;
  platform: string;
  status: 'active' | 'paused' | 'rejected' | 'draft' | 'pending_review';
  type: 'image' | 'video' | 'carousel' | 'story';
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spent: number;
  reach: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  targetAudience: string;
  startDate: string;
  endDate: string;
  budget: number;
  dailyBudget: number;
  createdAt: string;
  lastUpdated: string;
  videoName?: string | null;
  // Facebook-specific fields for detailed modal
  title?: string;
  body?: string;
  link_url?: string;
  video_id?: string;
  image_url?: string;
  creative_id?: string;
  raw_creative?: any;
}

interface FacebookCampaign {
  id: string;
  name: string;
  status: string;
  created_time: string;
}

interface FacebookAdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
  created_time: string;
}

interface FacebookAd {
  id: string;
  name: string;
  adset_id: string;
  campaign_id?: string;
  status: string;
  created_time: string;
  creative_type?: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  spent?: number;
  reach?: number;
  video_name?: string;
  title?: string;
  body?: string;
  link_url?: string;
  video_id?: string;
  image_url?: string;
  creative_id?: string;
  raw_creative?: any;
}

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdDetailModal, setShowAdDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'calendar'>('table');
  const [updatingTitle, setUpdatingTitle] = useState<string | null>(null);
  const [updatingAllTitles, setUpdatingAllTitles] = useState(false);

  // Load Facebook data on component mount
  useEffect(() => {
    loadFacebookData();
  }, []);

  const updateAdTitle = async (adId: string, adName: string) => {
    try {
      setUpdatingTitle(adId);
      
      const response = await fetch('/api/facebook/update-ad-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adId, adName })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Ad title updated successfully for ${adName}`);
        alert(`✅ Ad title bijgewerkt voor ${adName}`);
      } else {
        console.error(`❌ Failed to update ad title:`, result.error);
        alert(`❌ Fout bij het updaten van ad title: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ad title:`, error);
      alert(`❌ Fout bij het updaten van ad title`);
    } finally {
      setUpdatingTitle(null);
    }
  };

  const updateAllAdTitles = async () => {
    try {
      setUpdatingAllTitles(true);
      let successCount = 0;
      let errorCount = 0;

      for (const ad of ads) {
        try {
          const response = await fetch('/api/facebook/update-ad-title', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ adId: ad.id, adName: ad.name })
          });

          const result = await response.json();

          if (result.success) {
            successCount++;
            console.log(`✅ Ad title updated for ${ad.name}`);
          } else {
            errorCount++;
            console.error(`❌ Failed to update ad title for ${ad.name}:`, result.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error updating ad title for ${ad.name}:`, error);
        }
      }

      alert(`✅ Ad titles update voltooid!\nSuccesvol: ${successCount}\nFouten: ${errorCount}`);
    } catch (error) {
      console.error('❌ Error in bulk ad title update:', error);
      alert('❌ Fout bij bulk ad title update');
    } finally {
      setUpdatingAllTitles(false);
    }
  };

  const loadFacebookData = async () => {
    setLoading(true);
    try {
      console.log('🚀 Starting to load Facebook data...');
      
      // Load ads data with cache busting
      const response = await fetch(`/api/facebook/get-ads?_t=${Date.now()}`);
      const data = await response.json();
      console.log('📊 Ads API response:', data);

      if (data.success && data.data) {
        console.log('✅ Facebook ads loaded:', data.data.length);

        // Transform Facebook data to our Advertisement format
        const transformedAds: Advertisement[] = data.data.map((ad: any) => ({
          id: ad.id,
          name: ad.name,
          campaign: 'TTM Campaign',
          adSet: ad.adset_id || 'Unknown Ad Set',
          platform: 'Facebook',
          status: 'active' as const,
          type: 'video' as const,
          impressions: ad.impressions || 0,
          clicks: ad.clicks || 0,
          ctr: ad.ctr || 0,
          cpc: ad.cpc || 0,
          spent: ad.spent || 0,
          reach: ad.reach || 0,
          performance: 'good' as const,
          targetAudience: 'Facebook Targeting',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          budget: 5,
          dailyBudget: 5,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          videoName: ad.video_name,
          title: ad.title,
          body: ad.body,
          link_url: ad.link_url,
          video_id: ad.video_id,
          image_url: ad.image_url,
          creative_id: ad.creative_id,
          raw_creative: ad.raw_creative
        }));

        console.log('✅ Transformed ads:', transformedAds.length);
        setAds(transformedAds);
      } else {
        console.error('Failed to load Facebook ads data:', data);
        setAds([]);
      }
    } catch (error) {
      console.error('Error loading Facebook data:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = (ad: Advertisement) => {
    setSelectedAd(ad);
    setShowAdDetailModal(true);
  };

  const handleCloseAdDetailModal = () => {
    setShowAdDetailModal(false);
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

  // Function to convert title case to sentence case for Dutch
  const formatDutchTitle = (title: string) => {
    // Simple approach: convert to lowercase first, then capitalize specific patterns
    let result = title.toLowerCase();
    
    // Capitalize first letter of sentence
    if (result.length > 0) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    
    // Capitalize words after dash
    result = result.replace(/-([a-z])/g, (match, letter) => {
      return '-' + letter.toUpperCase();
    });
    
    // Restore specific terms that should always be capitalized
    result = result.replace(/top tier men/gi, 'Top Tier Men');
    result = result.replace(/ttm/gi, 'TTM');
    
    return result;
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
                         ad.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.adSet.toLowerCase().includes(searchTerm.toLowerCase());
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
        <div className="flex items-center space-x-3">
          <button
            onClick={updateAllAdTitles}
            disabled={updatingAllTitles}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatingAllTitles ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Alle Titles Fixen...
              </div>
            ) : (
              'Fix Alle Ad Titles'
            )}
          </button>
          <button 
            onClick={loadFacebookData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Ververs Facebook Data</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nieuwe Advertentie</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-6 h-6 text-green-400 mt-0.5" />
          <div>
            <h3 className="text-green-400 font-semibold mb-1">Live Facebook Data</h3>
            <p className="text-green-200 text-sm mb-2">
              De advertenties worden nu live geladen van Facebook. Elke advertentie is gekoppeld aan een campagne en ad set.
            </p>
            <div className="flex items-center space-x-4 text-xs text-green-300">
              <span>📊 Live: {ads.length} advertenties van Facebook</span>
                              <span>🎯 campagnes: {new Set(ads.map(ad => ad.campaign)).size} uniek</span>
                              <span>📱 ad sets: {new Set(ads.map(ad => ad.adSet)).size} uniek</span>
              <a 
                href="/dashboard-marketing/campagnes" 
                className="text-green-400 hover:text-green-300 underline"
              >
                → bekijk campagnes
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
              <p className="text-gray-400 text-sm">totaal advertenties</p>
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
              <p className="text-gray-400 text-sm">actieve advertenties</p>
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
              <p className="text-gray-400 text-sm">unieke campagnes</p>
              <p className="text-2xl font-bold text-white">{new Set(ads.map(ad => ad.campaign)).size}</p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-400" />
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
              <p className="text-gray-400 text-sm">gemiddelde CTR</p>
              <p className="text-2xl font-bold text-white">
                {ads.length > 0 ? (ads.reduce((sum, ad) => sum + ad.ctr, 0) / ads.length).toFixed(1) : '0.0'}%
              </p>
            </div>
            <ArrowTrendingUpIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </motion.div>
      </div>

      {/* Advertisements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAds.map((ad) => (
          <div key={ad.id} className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
            <div className="flex gap-4">
              {/* Video Preview - 1/4 of the card */}
              <div className="w-1/4 flex-shrink-0">
                {ad.videoName ? (
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '200px' }}>
                    <video
                      className="w-full h-full object-contain"
                      preload="metadata"
                      muted
                      loop
                      playsInline
                      src={`https://ggrvcrffzprmutrzrtxf.supabase.co/storage/v1/object/public/advertenties/${ad.videoName}`}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg flex items-center justify-center" style={{ aspectRatio: '9/16', maxHeight: '200px' }}>
                    <VideoCameraIcon className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </div>
              
              {/* Ad Information - 3/4 of the card */}
              <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{formatDutchTitle(ad.name)}</h3>
                <p className="text-gray-400 text-sm">{ad.platform}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(ad.status)}
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ad.status)}`}>
                  {ad.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">campagne</p>
                <p className="text-white font-medium text-sm">{ad.campaign}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">ad set</p>
                <p className="text-white font-medium text-sm">{ad.adSet}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">budget</p>
                <p className="text-white font-medium">€{ad.budget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">type</p>
                <p className="text-white font-medium text-sm">{ad.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-gray-400 text-xs">impressies</p>
                <p className="text-white font-medium text-sm">{ad.impressions.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs">klikken</p>
                <p className="text-white font-medium text-sm">{ad.clicks.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs">CTR</p>
                <p className="text-white font-medium text-sm">{ad.ctr}%</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs">prestaties</p>
                <p className={`text-sm font-medium ${getPerformanceColor(ad.performance)}`}>
                  {ad.performance}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2D3748]">
              <div className="text-sm text-gray-400">
                {ad.startDate} - {ad.endDate}
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleAdClick(ad)}
                  className="text-[#8BAE5A] hover:text-[#9BBE6A]"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => updateAdTitle(ad.id, ad.name)}
                  disabled={updatingTitle === ad.id}
                  className="text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingTitle === ad.id ? (
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <PencilIcon className="w-4 h-4" />
                  )}
                </button>
                <button className="text-red-400 hover:text-red-300">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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

      {/* Ad Detail Modal */}
      <AdDetailModal
        ad={selectedAd}
        isOpen={showAdDetailModal}
        onClose={handleCloseAdDetailModal}
      />
    </div>
  );
} 