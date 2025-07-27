'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  GlobeAltIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShareIcon,
  TagIcon,
  HashtagIcon,
  ChatBubbleLeftRightIcon,
  BookmarkIcon,
  FireIcon,
  CursorArrowRaysIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'google-ads';
  status: 'draft' | 'in-progress' | 'published' | 'scheduled';
  author: string;
  createdDate: string;
  publishDate?: string;
  tags: string[];
  views?: number;
  engagement?: number;
  clicks?: number;
  conversions?: number;
  ctr?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAudience: string;
  budget?: number;
  platform: string;
}

export default function ContentPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sample advertising content data for Top Tier Men
  const contentItems: ContentItem[] = [
    {
      id: '1',
      title: 'Word een Top Tier Man - Ontwikkel je Potentieel',
      description: 'Ontdek hoe je jezelf kunt ontwikkelen tot een Top Tier Man. Leer de principes van leiderschap, discipline en persoonlijke groei.',
      type: 'facebook',
      status: 'published',
      author: 'Marketing Team',
      createdDate: '2025-01-15',
      publishDate: '2025-01-20',
      tags: ['top-tier', 'ontwikkeling', 'leiderschap'],
      views: 12500,
      engagement: 890,
      clicks: 450,
      conversions: 23,
      ctr: 3.6,
      priority: 'high',
      targetAudience: 'Mannen 25-45, ambitieus, persoonlijke ontwikkeling',
      budget: 2500,
      platform: 'Facebook Ads'
    },
    {
      id: '2',
      title: '5 Principes van een Top Tier Man - Video Serie',
      description: 'Een 5-delige video serie die de kernprincipes van Top Tier Man ontwikkeling behandelt.',
      type: 'youtube',
      status: 'in-progress',
      author: 'Video Team',
      createdDate: '2025-01-10',
      tags: ['video-serie', 'principes', 'ontwikkeling'],
      priority: 'critical',
      targetAudience: 'Mannen 25-45, YouTube kijkers, persoonlijke groei',
      budget: 5000,
      platform: 'YouTube Ads'
    },
    {
      id: '3',
      title: 'LinkedIn Campagne - Executive Development',
      description: 'Professionals die hun carrière naar het volgende niveau willen tillen. Top Tier Man principes voor de werkvloer.',
      type: 'linkedin',
      status: 'scheduled',
      author: 'Social Media Team',
      createdDate: '2025-01-08',
      publishDate: '2025-02-01',
      tags: ['linkedin', 'executive', 'carrière'],
      priority: 'high',
      targetAudience: 'Professionals 30-50, LinkedIn gebruikers, carrière groei',
      budget: 3000,
      platform: 'LinkedIn Ads'
    },
    {
      id: '4',
      title: 'Instagram Stories - Dagelijkse Top Tier Tips',
      description: 'Dagelijkse inspirerende content via Instagram Stories met praktische tips voor persoonlijke ontwikkeling.',
      type: 'instagram',
      status: 'published',
      author: 'Content Team',
      createdDate: '2025-01-05',
      publishDate: '2025-01-15',
      tags: ['instagram', 'stories', 'tips'],
      views: 8500,
      engagement: 1200,
      clicks: 320,
      conversions: 15,
      ctr: 3.8,
      priority: 'high',
      targetAudience: 'Mannen 20-40, Instagram actief, lifestyle',
      budget: 1800,
      platform: 'Instagram Ads'
    },
    {
      id: '5',
      title: 'TikTok Campagne - Top Tier Lifestyle',
      description: 'Korte, krachtige video\'s die de Top Tier Man lifestyle tonen. Focus op discipline, fitness en mindset.',
      type: 'tiktok',
      status: 'draft',
      author: 'Video Team',
      createdDate: '2025-01-12',
      tags: ['tiktok', 'lifestyle', 'fitness'],
      priority: 'critical',
      targetAudience: 'Mannen 18-35, TikTok gebruikers, fitness geïnteresseerd',
      budget: 4000,
      platform: 'TikTok Ads'
    },
    {
      id: '6',
      title: 'Google Ads - Top Tier Man Zoekcampagne',
      description: 'Zoekmachine advertenties gericht op mannen die zoeken naar persoonlijke ontwikkeling en leiderschap.',
      type: 'google-ads',
      status: 'in-progress',
      author: 'Marketing Team',
      createdDate: '2025-01-18',
      tags: ['google-ads', 'zoekcampagne', 'leiderschap'],
      priority: 'high',
      targetAudience: 'Mannen 25-50, Google zoekers, persoonlijke ontwikkeling',
      budget: 3500,
      platform: 'Google Ads'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'facebook': return <GlobeAltIcon className="w-5 h-5" />;
      case 'instagram': return <PhotoIcon className="w-5 h-5" />;
      case 'linkedin': return <UserGroupIcon className="w-5 h-5" />;
      case 'youtube': return <VideoCameraIcon className="w-5 h-5" />;
      case 'tiktok': return <VideoCameraIcon className="w-5 h-5" />;
      case 'google-ads': return <GlobeAltIcon className="w-5 h-5" />;
      default: return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'published': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'scheduled': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Concept';
      case 'in-progress': return 'In Ontwikkeling';
      case 'published': return 'Gepubliceerd';
      case 'scheduled': return 'Gepland';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Kritiek';
      case 'high': return 'Hoog';
      case 'medium': return 'Medium';
      case 'low': return 'Laag';
      default: return priority;
    }
  };

  const filteredContent = contentItems.filter(item => {
    const typeMatch = selectedType === 'all' || item.type === selectedType;
    const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  const stats = {
    total: contentItems.length,
    published: contentItems.filter(item => item.status === 'published').length,
    inProgress: contentItems.filter(item => item.status === 'in-progress').length,
    scheduled: contentItems.filter(item => item.status === 'scheduled').length,
    totalViews: contentItems.reduce((sum, item) => sum + (item.views || 0), 0),
    totalEngagement: contentItems.reduce((sum, item) => sum + (item.engagement || 0), 0),
    totalClicks: contentItems.reduce((sum, item) => sum + (item.clicks || 0), 0),
    totalConversions: contentItems.reduce((sum, item) => sum + (item.conversions || 0), 0),
    totalBudget: contentItems.reduce((sum, item) => sum + (item.budget || 0), 0),
    avgCTR: contentItems.filter(item => item.ctr).reduce((sum, item) => sum + (item.ctr || 0), 0) / contentItems.filter(item => item.ctr).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Advertising Content</h1>
          <p className="text-gray-400 mt-1">Beheer je advertising campagnes gericht op Top Tier Men ontwikkeling</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
              <span className="text-orange-500 font-medium">Onder Ontwikkeling</span>
            </div>
          </div>
          <button className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span>Nieuwe Content</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Campagnes</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
            <DocumentTextIcon className="w-6 h-6 text-[#8BAE5A]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Views</p>
              <p className="text-xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
            </div>
            <EyeIcon className="w-6 h-6 text-[#8BAE5A]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Clicks</p>
              <p className="text-xl font-bold text-white">{stats.totalClicks.toLocaleString()}</p>
            </div>
            <CursorArrowRaysIcon className="w-6 h-6 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Conversies</p>
              <p className="text-xl font-bold text-white">{stats.totalConversions}</p>
            </div>
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gem. CTR</p>
              <p className="text-xl font-bold text-white">{stats.avgCTR.toFixed(1)}%</p>
            </div>
            <ChartBarIcon className="w-6 h-6 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Budget</p>
              <p className="text-xl font-bold text-white">€{stats.totalBudget.toLocaleString()}</p>
            </div>
            <CurrencyDollarIcon className="w-6 h-6 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Alle Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="google-ads">Google Ads</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Alle Statussen</option>
            <option value="draft">Concept</option>
            <option value="in-progress">In Ontwikkeling</option>
            <option value="published">Gepubliceerd</option>
            <option value="scheduled">Gepland</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 bg-[#2D3748] rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#8BAE5A] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-[#8BAE5A] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Lijst
          </button>
        </div>
      </div>

      {/* Content Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg overflow-hidden hover:border-[#8BAE5A] transition-colors"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(item.type)}
                    <span className="text-sm text-gray-400 capitalize">{item.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                      {getPriorityText(item.priority)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-400">Door: {item.author}</span>
                  <span className="text-gray-400">{new Date(item.createdDate).toLocaleDateString('nl-NL')}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-[#2D3748] text-gray-300 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    {item.views && (
                      <span className="text-gray-400 flex items-center space-x-1">
                        <EyeIcon className="w-4 h-4" />
                        <span>{item.views.toLocaleString()}</span>
                      </span>
                    )}
                    {item.clicks && (
                      <span className="text-gray-400 flex items-center space-x-1">
                        <CursorArrowRaysIcon className="w-4 h-4" />
                        <span>{item.clicks.toLocaleString()}</span>
                      </span>
                    )}
                    {item.conversions && (
                      <span className="text-gray-400 flex items-center space-x-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>{item.conversions}</span>
                      </span>
                    )}
                    {item.ctr && (
                      <span className="text-gray-400 flex items-center space-x-1">
                        <ChartBarIcon className="w-4 h-4" />
                        <span>{item.ctr}%</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-white transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-white transition-colors">
                      <ShareIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContent.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6 hover:border-[#8BAE5A] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(item.type)}
                    <span className="text-sm text-gray-400 capitalize">{item.type}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{item.author}</p>
                    <p className="text-sm text-gray-400">{new Date(item.createdDate).toLocaleDateString('nl-NL')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                      {getPriorityText(item.priority)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <ShareIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Development Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6"
      >
        <div className="flex items-start space-x-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-orange-500 mb-2">🔄 Advertising Content Onder Ontwikkeling</h3>
            <p className="text-gray-300 mb-4">
              Deze advertising content pagina is momenteel onder actieve ontwikkeling. Functionaliteiten zoals campagne 
              beheer, performance tracking en targeting worden nog geïmplementeerd. De huidige weergave toont voorbeelddata 
              gericht op Top Tier Men ontwikkeling.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">Laatste update: Vandaag</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">Status: In ontwikkeling</span>
              </div>
              <div className="flex items-center space-x-2">
                <FireIcon className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">Volgende: Content editor</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 