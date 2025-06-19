'use client';
import { useState } from 'react';
import { 
  ExclamationTriangleIcon, 
  ChatBubbleLeftRightIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  NoSymbolIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  ClockIcon,
  FlagIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// Mock data - in real app this would come from API
const mockReportedPosts = [
  {
    id: 1,
    title: 'Hoe bereik ik mijn fitness doelen?',
    author: 'Mark van der Berg',
    authorId: 1,
    content: 'Ik probeer al maanden mijn fitness doelen te bereiken maar kom niet verder. Heeft iemand tips?',
    category: 'Fitness & Gezondheid',
    reportReason: 'Spam',
    reportCount: 3,
    reportDate: '2024-01-20',
    status: 'pending',
    views: 45,
    replies: 8
  },
  {
    id: 2,
    title: 'Mijn ervaring met intermittent fasting',
    author: 'Thomas Jansen',
    authorId: 2,
    content: 'Ik heb de afgelopen 3 maanden intermittent fasting geprobeerd en de resultaten zijn geweldig!',
    category: 'Voeding',
    reportReason: 'Ongepaste inhoud',
    reportCount: 1,
    reportDate: '2024-01-19',
    status: 'reviewed',
    views: 123,
    replies: 15
  },
  {
    id: 3,
    title: 'Motivatie verliezen tijdens training',
    author: 'Lucas de Vries',
    authorId: 3,
    content: 'Ik verlies steeds mijn motivatie tijdens het trainen. Hoe blijf je gemotiveerd?',
    category: 'Mindset',
    reportReason: 'Spam',
    reportCount: 2,
    reportDate: '2024-01-18',
    status: 'pending',
    views: 67,
    replies: 12
  }
];

const mockRecentPosts = [
  {
    id: 4,
    title: 'Nieuwe workout routine',
    author: 'Daan Bakker',
    authorId: 4,
    content: 'Ik heb een nieuwe workout routine ontwikkeld die perfect werkt voor mij.',
    category: 'Fitness & Gezondheid',
    status: 'active',
    views: 89,
    replies: 6,
    lastActivity: '2024-01-20'
  },
  {
    id: 5,
    title: 'Boek aanbevelingen',
    author: 'Sem Visser',
    authorId: 5,
    content: 'Welke boeken hebben jullie gelezen die jullie leven hebben veranderd?',
    category: 'Persoonlijke Ontwikkeling',
    status: 'active',
    views: 156,
    replies: 23,
    lastActivity: '2024-01-19'
  }
];

const reportReasons = ['Spam', 'Ongepaste inhoud', 'Haatzaaien', 'Misleidende informatie', 'Anders'];

export default function ForumModeratie() {
  const [activeTab, setActiveTab] = useState('reported');
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [filterReason, setFilterReason] = useState('Alle Redenen');

  const filteredReportedPosts = mockReportedPosts.filter(post => 
    filterReason === 'Alle Redenen' || post.reportReason === filterReason
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'reviewed': return 'text-green-400';
      case 'removed': return 'text-red-400';
      case 'active': return 'text-[#8BAE5A]';
      default: return 'text-[#B6C948]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Wachtend';
      case 'reviewed': return 'Bekeken';
      case 'removed': return 'Verwijderd';
      case 'active': return 'Actief';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Forum Moderatie</h1>
          <p className="text-[#B6C948] mt-2">Beheer community content en houd de discussies gezond</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#232D1A] border border-[#3A4D23]">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <span className="text-[#8BAE5A] font-semibold">
              {mockReportedPosts.filter(p => p.status === 'pending').length} wachtend
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#232D1A] rounded-2xl p-2 border border-[#3A4D23]">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('reported')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'reported'
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'text-[#8BAE5A] hover:bg-[#181F17]'
            }`}
          >
            <FlagIcon className="w-5 h-5" />
            Gerapporteerde Posts
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'recent'
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'text-[#8BAE5A] hover:bg-[#181F17]'
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Recente Posts
          </button>
        </div>
      </div>

      {/* Filter */}
      {activeTab === 'reported' && (
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <span className="text-[#8BAE5A] font-semibold">Filter op reden:</span>
            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            >
              {reportReasons.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'reported' ? (
        <div className="space-y-4">
          {filteredReportedPosts.map((post) => (
            <div 
              key={post.id}
              className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-400/20">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#8BAE5A]">{post.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[#B6C948] text-sm">Door {post.author}</span>
                      <span className="text-[#B6C948] text-sm">• {post.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(post.status)} bg-[#181F17]`}>
                        {getStatusText(post.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-sm font-semibold">{post.reportCount} rapportages</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[#B6C948] text-sm mb-2">{post.content}</p>
                <div className="flex items-center gap-4 text-[#B6C948] text-xs">
                  <span>Reden: {post.reportReason}</span>
                  <span>• Gerapporteerd op {new Date(post.reportDate).toLocaleDateString('nl-NL')}</span>
                  <span>• {post.views} views</span>
                  <span>• {post.replies} replies</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center gap-2">
                  <EyeIcon className="w-4 h-4" />
                  Bekijk Post
                </button>
                <button className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center gap-2">
                  <PencilIcon className="w-4 h-4" />
                  Bewerk
                </button>
                <button className="px-4 py-2 rounded-xl bg-green-600 text-white border border-green-600 hover:bg-green-700 transition flex items-center gap-2">
                  <CheckIcon className="w-4 h-4" />
                  Goedkeuren
                </button>
                <button className="px-4 py-2 rounded-xl bg-red-600 text-white border border-red-600 hover:bg-red-700 transition flex items-center gap-2">
                  <TrashIcon className="w-4 h-4" />
                  Verwijderen
                </button>
                <button className="px-4 py-2 rounded-xl bg-yellow-600 text-white border border-yellow-600 hover:bg-yellow-700 transition flex items-center gap-2">
                  <NoSymbolIcon className="w-4 h-4" />
                  Blokkeer Auteur
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {mockRecentPosts.map((post) => (
            <div 
              key={post.id}
              className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#8BAE5A]/20">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-[#8BAE5A]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#8BAE5A]">{post.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[#B6C948] text-sm">Door {post.author}</span>
                      <span className="text-[#B6C948] text-sm">• {post.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(post.status)} bg-[#181F17]`}>
                        {getStatusText(post.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-[#B6C948]" />
                  <span className="text-[#B6C948] text-sm">{new Date(post.lastActivity).toLocaleDateString('nl-NL')}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[#B6C948] text-sm">{post.content}</p>
                <div className="flex items-center gap-4 mt-2 text-[#B6C948] text-xs">
                  <span>{post.views} views</span>
                  <span>• {post.replies} replies</span>
                  <span>• Laatste activiteit: {new Date(post.lastActivity).toLocaleDateString('nl-NL')}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center gap-2">
                  <EyeIcon className="w-4 h-4" />
                  Bekijk Post
                </button>
                <button className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center gap-2">
                  <PencilIcon className="w-4 h-4" />
                  Bewerk
                </button>
                <button className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center gap-2">
                  <FlagIcon className="w-4 h-4" />
                  Rapporteer
                </button>
                <button className="px-4 py-2 rounded-xl bg-red-600 text-white border border-red-600 hover:bg-red-700 transition flex items-center gap-2">
                  <TrashIcon className="w-4 h-4" />
                  Verwijderen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-400/20">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#8BAE5A]">
                {mockReportedPosts.filter(p => p.status === 'pending').length}
              </h3>
              <p className="text-[#B6C948] text-sm">Wachtend op Review</p>
            </div>
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-400/20">
              <CheckIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#8BAE5A]">
                {mockReportedPosts.filter(p => p.status === 'reviewed').length}
              </h3>
              <p className="text-[#B6C948] text-sm">Vandaag Bekeken</p>
            </div>
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#8BAE5A]">1,247</h3>
              <p className="text-[#B6C948] text-sm">Totaal Posts</p>
            </div>
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <ShieldCheckIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#8BAE5A]">98.5%</h3>
              <p className="text-[#B6C948] text-sm">Community Score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 