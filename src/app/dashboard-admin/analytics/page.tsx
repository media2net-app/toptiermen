'use client';

import { useState, useEffect } from 'react';
import { 
  AcademicCapIcon,
  FireIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  ChartBarIcon,
  EyeIcon,
  ClockIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'overview' | 'content' | 'engagement'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/analytics');
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpIcon className="w-4 h-4 text-green-400" />;
    return <ArrowDownIcon className="w-4 h-4 text-red-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#8BAE5A]">Analytics Dashboard</h1>
            <p className="text-[#B6C948] mt-2">Real-time insights over platform performance</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            >
              <option value="7d">Laatste 7 dagen</option>
              <option value="30d">Laatste 30 dagen</option>
              <option value="90d">Laatste 90 dagen</option>
            </select>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1">
          <button
            onClick={() => setSelectedCategory('overview')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              selectedCategory === 'overview'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setSelectedCategory('content')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              selectedCategory === 'content'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <AcademicCapIcon className="w-5 h-5" />
            Content
          </button>
          <button
            onClick={() => setSelectedCategory('engagement')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              selectedCategory === 'engagement'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            Engagement
          </button>
        </div>

        {/* Analytics Content */}
        {analyticsData && (
          <div className="space-y-8">
            {/* Overview Stats */}
            {selectedCategory === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                      <UsersIcon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analyticsData.trends.totalUsers)}
                      <span className={`text-sm font-medium ${getTrendColor(analyticsData.trends.totalUsers)}`}>
                        +{analyticsData.trends.totalUsers}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#8BAE5A]">{analyticsData.overview.totalUsers}</h3>
                    <p className="text-[#B6C948] text-sm">Totaal Gebruikers</p>
                  </div>
                </div>

                <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                      <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analyticsData.trends.onboardingCompletion)}
                      <span className={`text-sm font-medium ${getTrendColor(analyticsData.trends.onboardingCompletion)}`}>
                        +{analyticsData.trends.onboardingCompletion}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#8BAE5A]">{analyticsData.overview.onboardingCompletionRate}%</h3>
                    <p className="text-[#B6C948] text-sm">Onboarding Completion</p>
                  </div>
                </div>

                <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                      <ClockIcon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analyticsData.trends.activeUsers)}
                      <span className={`text-sm font-medium ${getTrendColor(analyticsData.trends.activeUsers)}`}>
                        +{analyticsData.trends.activeUsers}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#8BAE5A]">{analyticsData.overview.activeUsers}</h3>
                    <p className="text-[#B6C948] text-sm">Actieve Gebruikers</p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Stats */}
            {selectedCategory === 'content' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                      <StarIcon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analyticsData.trends.totalMissions)}
                      <span className={`text-sm font-medium ${getTrendColor(analyticsData.trends.totalMissions)}`}>
                        +{analyticsData.trends.totalMissions}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#8BAE5A]">{analyticsData.content.totalMissions}</h3>
                    <p className="text-[#B6C948] text-sm">Totaal Missies</p>
                  </div>
                </div>

                <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                      <FireIcon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analyticsData.content.totalTrainingSchemas)}
                      <span className={`text-sm font-medium ${getTrendColor(analyticsData.content.totalTrainingSchemas)}`}>
                        +{analyticsData.content.totalTrainingSchemas}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#8BAE5A]">{analyticsData.content.totalTrainingSchemas}</h3>
                    <p className="text-[#B6C948] text-sm">Training Schemas</p>
                  </div>
                </div>

                <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                      <BookOpenIcon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analyticsData.content.totalBooks)}
                      <span className={`text-sm font-medium ${getTrendColor(analyticsData.content.totalBooks)}`}>
                        +{analyticsData.content.totalBooks}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#8BAE5A]">{analyticsData.content.totalBooks}</h3>
                    <p className="text-[#B6C948] text-sm">Boeken</p>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Stats */}
            {selectedCategory === 'engagement' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analyticsData.trends.totalPosts)}
                      <span className={`text-sm font-medium ${getTrendColor(analyticsData.trends.totalPosts)}`}>
                        +{analyticsData.trends.totalPosts}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#8BAE5A]">{analyticsData.engagement.totalForumPosts}</h3>
                    <p className="text-[#B6C948] text-sm">Forum Posts</p>
                  </div>
                </div>

                <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                      <UsersIcon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analyticsData.trends.userEngagement)}
                      <span className={`text-sm font-medium ${getTrendColor(analyticsData.trends.userEngagement)}`}>
                        +{analyticsData.trends.userEngagement}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#8BAE5A]">{analyticsData.engagement.userEngagementRate}%</h3>
                    <p className="text-[#B6C948] text-sm">User Engagement</p>
                  </div>
                </div>

                <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                      <EyeIcon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analyticsData.content.avgPostsPerUser)}
                      <span className={`text-sm font-medium ${getTrendColor(analyticsData.content.avgPostsPerUser)}`}>
                        +{analyticsData.content.avgPostsPerUser}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#8BAE5A]">{analyticsData.content.avgPostsPerUser}</h3>
                    <p className="text-[#B6C948] text-sm">Gem. Posts per User</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Data State */}
        {!analyticsData && !loading && (
          <div className="text-center py-12">
            <div className="text-[#8BAE5A] text-lg font-medium">Geen data beschikbaar</div>
            <p className="text-[#B6C948] mt-2">Probeer het later opnieuw</p>
          </div>
        )}
      </div>
    </div>
  );
} 