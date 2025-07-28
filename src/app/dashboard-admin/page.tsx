'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  HeartIcon,
  FireIcon,
  TrophyIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  AcademicCapIcon as AcademicCapIconSolid,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { AdminCard, AdminStatsCard, AdminButton } from '../../components/admin';

interface DashboardStats {
  // Community Health
  communityHealthScore: number;
  totalUsers: number;
  activeUsers: number;
  completedOnboarding: number;
  onboardingRate: number;

  // Leden Statistics
  activeMembersThisMonth: number;
  newRegistrationsThisWeek: number;
  averageDailyLogins: number;
  activeCoachingPackages: number;

  // Community Activity
  postsLastWeek: number;
  mostActiveUser: {
    name: string;
    posts: number;
  };
  reportsLastWeek: number;
  mostPopularSquad: {
    name: string;
    members: number;
  };

  // Content Performance
  contentPerformance: {
    academy: {
      totalModules: number;
      totalLessons: number;
      averageCompletionRate: number;
    };
    training: {
      totalSchemas: number;
      activeUsers: number;
      averageCompletionRate: number;
    };
    forum: {
      totalPosts: number;
      recentPosts: number;
      averageResponseTime: number;
    };
  };

  // User Engagement
  userEngagement: {
    usersWithXP: number;
    usersWithBadges: number;
    averageXP: number;
    totalMissions: number;
    completedMissions: number;
  };

  period: string;
  lastUpdated: string;
}

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const { user } = useAuth();
  
  // State voor echte data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read tab from URL parameter and set initial active tab
  const tabFromUrl = searchParams?.get('tab') as 'overview' | 'content' | 'actions' | 'financial' | 'users' | 'realtime' | 'technical';
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'actions' | 'financial' | 'users' | 'realtime' | 'technical'>(
    tabFromUrl || 'overview'
  );

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Fetch real dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching admin dashboard data for period:', selectedPeriod);
      
      const response = await fetch(`/api/admin/dashboard-stats?period=${selectedPeriod}`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please try again.');
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setDashboardStats(data.stats);
        console.log('✅ Admin dashboard data loaded:', data.stats);
      } else {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('❌ Error fetching admin dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when period changes
  useEffect(() => {
    fetchDashboardData();
  }, [user, selectedPeriod]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Laden van dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ Fout</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <AdminButton onClick={fetchDashboardData} variant="primary">
            Opnieuw Proberen
          </AdminButton>
        </div>
      </div>
    );
  }

  // Helper function to get trend icon
  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) return <ArrowUpIcon className="w-4 h-4 text-green-400" />;
    return <ArrowDownIcon className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Elite Command Center</h1>
          <p className="text-[#B6C948] mt-2">Strategisch overzicht van je Top Tier Men platform</p>
          {dashboardStats && (
            <p className="text-gray-400 text-sm mt-1">
              Laatste update: {new Date(dashboardStats.lastUpdated).toLocaleString('nl-NL')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {activeTab !== 'realtime' && (
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
              className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            >
              <option value="7d">Laatste 7 dagen</option>
              <option value="30d">Laatste 30 dagen</option>
              <option value="90d">Laatste 90 dagen</option>
            </select>
          )}
          {activeTab === 'realtime' && (
            <div className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]">
              <span className="text-sm">🔄 Live Data</span>
            </div>
          )}
          <AdminButton 
            onClick={fetchDashboardData} 
            variant="secondary" 
            icon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Vernieuwen
          </AdminButton>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Community Health
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'content'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Content Performance
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'actions'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Actiegerichte Inzichten
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'financial'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Financiële Metrics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Gebruikers Segmentatie
        </button>
        <button
          onClick={() => setActiveTab('realtime')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'realtime'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Real-time Activiteit
        </button>
        <button
          onClick={() => setActiveTab('technical')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'technical'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Technische Performance
        </button>
      </div>

      {activeTab === 'overview' && dashboardStats && (
        <>
          {/* Community Health Score */}
          <AdminCard
            title="Community Health Score"
            subtitle="Algehele gezondheid van je community"
            icon={<HeartIcon className="w-6 h-6" />}
            gradient
          >
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#8BAE5A] mb-2">
                  {dashboardStats.communityHealthScore}/100
                </div>
                <div className="text-sm text-[#B6C948]">Gezondheidsscore</div>
                <div className="mt-4 text-xs text-gray-400">
                  Gebaseerd op engagement, content creatie en activiteit
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Onboarding rate: {dashboardStats.onboardingRate}% | 
                  Actieve gebruikers: {dashboardStats.activeUsers} | 
                  Recente posts: {dashboardStats.postsLastWeek}
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Ledenstatistieken */}
          <AdminCard
            title="Ledenstatistieken"
            subtitle="Overzicht van platform activiteit"
            icon={<UserGroupIcon className="w-6 h-6" />}
            gradient
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminStatsCard
                title="Actieve leden deze maand"
                value={dashboardStats.activeMembersThisMonth}
                icon={<UserGroupIcon className="w-8 h-8" />}
                color="green"
                trend={dashboardStats.activeMembersThisMonth > 0 ? 1 : -1}
              />
              <AdminStatsCard
                title="Nieuwe aanmeldingen deze week"
                value={dashboardStats.newRegistrationsThisWeek}
                icon={<UserIcon className="w-8 h-8" />}
                color="blue"
                trend={dashboardStats.newRegistrationsThisWeek > 0 ? 1 : -1}
              />
              <AdminStatsCard
                title="Gem. dagelijkse logins"
                value={dashboardStats.averageDailyLogins}
                icon={<ClockIcon className="w-8 h-8" />}
                color="orange"
                trend={dashboardStats.averageDailyLogins > 0 ? 1 : -1}
              />
              <AdminStatsCard
                title="Actief coachingpakket"
                value={dashboardStats.activeCoachingPackages}
                icon={<TrophyIcon className="w-8 h-8" />}
                color="purple"
                trend={dashboardStats.activeCoachingPackages > 0 ? 1 : -1}
              />
            </div>
          </AdminCard>

          {/* Communityactiviteit */}
          <AdminCard
            title="Communityactiviteit"
            subtitle="Activiteit en engagement van je community"
            icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
            gradient
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminStatsCard
                title="Posts afgelopen 7 dagen"
                value={dashboardStats.postsLastWeek}
                icon={<ChatBubbleLeftRightIcon className="w-8 h-8" />}
                color="green"
                trend={dashboardStats.postsLastWeek > 0 ? 1 : -1}
              />
              <AdminStatsCard
                title="Meest actieve gebruiker"
                value={dashboardStats.mostActiveUser.posts}
                subtitle={dashboardStats.mostActiveUser.name}
                icon={<StarIcon className="w-8 h-8" />}
                color="orange"
                trend={dashboardStats.mostActiveUser.posts > 0 ? 1 : -1}
              />
              <AdminStatsCard
                title="Rapportages laatste week"
                value={dashboardStats.reportsLastWeek}
                icon={<ExclamationTriangleIcon className="w-8 h-8" />}
                color="red"
                trend={dashboardStats.reportsLastWeek > 0 ? 1 : -1}
              />
              <AdminStatsCard
                title="Populairste squad"
                value={dashboardStats.mostPopularSquad.members}
                subtitle={dashboardStats.mostPopularSquad.name}
                icon={<UsersIcon className="w-8 h-8" />}
                color="blue"
                trend={dashboardStats.mostPopularSquad.members > 0 ? 1 : -1}
              />
            </div>
          </AdminCard>
        </>
      )}

      {activeTab === 'content' && dashboardStats && (
        <AdminCard
          title="Content Performance"
          subtitle="Analyse van academy, training en forum prestaties"
          icon={<AcademicCapIcon className="w-6 h-6" />}
          gradient
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Academy Performance */}
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#8BAE5A]/20">
                  <AcademicCapIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Academy</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Modules</span>
                  <span className="text-white font-semibold">{dashboardStats.contentPerformance.academy.totalModules}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lessen</span>
                  <span className="text-white font-semibold">{dashboardStats.contentPerformance.academy.totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Voltooiingspercentage</span>
                  <span className="text-[#8BAE5A] font-semibold">{dashboardStats.contentPerformance.academy.averageCompletionRate}%</span>
                </div>
              </div>
            </div>

            {/* Training Performance */}
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#f0a14f]/20">
                  <FireIcon className="w-6 h-6 text-[#f0a14f]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Training</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Schema's</span>
                  <span className="text-white font-semibold">{dashboardStats.contentPerformance.training.totalSchemas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Actieve gebruikers</span>
                  <span className="text-white font-semibold">{dashboardStats.contentPerformance.training.activeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Voltooiingspercentage</span>
                  <span className="text-[#f0a14f] font-semibold">{dashboardStats.contentPerformance.training.averageCompletionRate}%</span>
                </div>
              </div>
            </div>

            {/* Forum Performance */}
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#FFD700]/20">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#FFD700]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Forum</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Totaal posts</span>
                  <span className="text-white font-semibold">{dashboardStats.contentPerformance.forum.totalPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recente posts</span>
                  <span className="text-white font-semibold">{dashboardStats.contentPerformance.forum.recentPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gem. response tijd</span>
                  <span className="text-[#FFD700] font-semibold">{dashboardStats.contentPerformance.forum.averageResponseTime}h</span>
                </div>
              </div>
            </div>
          </div>
        </AdminCard>
      )}

      {activeTab === 'actions' && dashboardStats && (
        <AdminCard
          title="Actiegerichte Inzichten"
          subtitle="Identificeer risico's en kansen"
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          gradient
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Engagement Insights */}
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
              <h3 className="text-lg font-semibold text-white mb-4">Gebruikers Engagement</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Gebruikers met XP</span>
                  <span className="text-white font-semibold">{dashboardStats.userEngagement.usersWithXP}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gebruikers met badges</span>
                  <span className="text-white font-semibold">{dashboardStats.userEngagement.usersWithBadges}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gemiddelde XP</span>
                  <span className="text-[#8BAE5A] font-semibold">{dashboardStats.userEngagement.averageXP}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Voltooide missies</span>
                  <span className="text-[#f0a14f] font-semibold">{dashboardStats.userEngagement.completedMissions}</span>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
              <h3 className="text-lg font-semibold text-white mb-4">Aanbevolen Acties</h3>
              <div className="space-y-3">
                {dashboardStats.onboardingRate < 50 && (
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-white font-medium">Lage onboarding rate</div>
                      <div className="text-gray-400 text-sm">Verbetert onboarding proces</div>
                    </div>
                  </div>
                )}
                {dashboardStats.postsLastWeek < 10 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-orange-400" />
                    <div>
                      <div className="text-white font-medium">Weinig forum activiteit</div>
                      <div className="text-gray-400 text-sm">Stimuleer community discussies</div>
                    </div>
                  </div>
                )}
                {dashboardStats.activeUsers < dashboardStats.totalUsers * 0.3 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <UserIcon className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-white font-medium">Lage gebruikersactiviteit</div>
                      <div className="text-gray-400 text-sm">Verhoog engagement strategieën</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AdminCard>
      )}

      {activeTab === 'financial' && dashboardStats && (
        <AdminCard
          title="Financiële Metrics"
          subtitle="MRR, LTV en andere financiële KPI's"
          icon={<ChartBarIcon className="w-6 h-6" />}
          gradient
        >
          <div className="text-center py-8">
            <div className="text-2xl font-bold text-[#8BAE5A] mb-4">Financiële Metrics</div>
            <p className="text-[#B6C948] mb-6">Maandelijkse terugkerende inkomsten en andere financiële indicatoren</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                <div className="text-3xl font-bold text-[#8BAE5A] mb-2">€0</div>
                <div className="text-gray-400 text-sm">MRR</div>
              </div>
              <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                <div className="text-3xl font-bold text-[#f0a14f] mb-2">€0</div>
                <div className="text-gray-400 text-sm">LTV</div>
              </div>
              <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                <div className="text-3xl font-bold text-[#FFD700] mb-2">0%</div>
                <div className="text-gray-400 text-sm">Churn Rate</div>
              </div>
            </div>
            <div className="mt-6">
              <AdminButton variant="primary" size="lg">
                Bekijk Financiële Rapportage
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      )}

      {activeTab === 'users' && dashboardStats && (
        <AdminCard
          title="Gebruikers Segmentatie"
          subtitle="Analyse van gebruikersgroepen en gedrag"
          icon={<UsersIcon className="w-6 h-6" />}
          gradient
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
              title="Totaal Gebruikers"
              value={dashboardStats.totalUsers}
              icon={<UsersIcon className="w-8 h-8" />}
              color="blue"
            />
            <AdminStatsCard
              title="Actieve Gebruikers"
              value={dashboardStats.activeUsers}
              icon={<UserIcon className="w-8 h-8" />}
              color="green"
            />
            <AdminStatsCard
              title="Onboarding Voltooid"
              value={dashboardStats.completedOnboarding}
              icon={<TrophyIcon className="w-8 h-8" />}
              color="orange"
            />
            <AdminStatsCard
              title="Gemiddelde XP"
              value={dashboardStats.userEngagement.averageXP}
              icon={<StarIcon className="w-8 h-8" />}
              color="purple"
            />
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
              <h3 className="text-lg font-semibold text-white mb-4">Gebruikers Distributie</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nieuwe gebruikers</span>
                  <span className="text-white">{dashboardStats.newRegistrationsThisWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Actieve gebruikers</span>
                  <span className="text-white">{dashboardStats.activeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Inactieve gebruikers</span>
                  <span className="text-white">{dashboardStats.totalUsers - dashboardStats.activeUsers}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
              <h3 className="text-lg font-semibold text-white mb-4">Engagement Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Gebruikers met XP</span>
                  <span className="text-white">{dashboardStats.userEngagement.usersWithXP}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gebruikers met badges</span>
                  <span className="text-white">{dashboardStats.userEngagement.usersWithBadges}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Voltooide missies</span>
                  <span className="text-white">{dashboardStats.userEngagement.completedMissions}</span>
                </div>
              </div>
            </div>
          </div>
        </AdminCard>
      )}

      {activeTab === 'realtime' && dashboardStats && (
        <AdminCard
          title="Real-time Activiteit"
          subtitle="Live tracking van platform activiteit"
          icon={<ClockIcon className="w-6 h-6" />}
          gradient
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
              title="Huidige Online"
              value={dashboardStats.activeUsers}
              icon={<EyeIcon className="w-8 h-8" />}
              color="green"
            />
            <AdminStatsCard
              title="Recente Posts"
              value={dashboardStats.postsLastWeek}
              icon={<ChatBubbleLeftRightIcon className="w-8 h-8" />}
              color="blue"
            />
            <AdminStatsCard
              title="Actieve Missies"
              value={dashboardStats.userEngagement.completedMissions}
              icon={<FireIcon className="w-8 h-8" />}
              color="orange"
            />
            <AdminStatsCard
              title="Gemiddelde XP"
              value={dashboardStats.userEngagement.averageXP}
              icon={<StarIcon className="w-8 h-8" />}
              color="purple"
            />
          </div>
          <div className="mt-6 bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
            <h3 className="text-lg font-semibold text-white mb-4">Live Activiteit</h3>
            <div className="text-center py-8">
              <div className="text-2xl font-bold text-[#8BAE5A] mb-2">Real-time Dashboard</div>
              <p className="text-[#B6C948]">Live updates van gebruikersactiviteit en trending content</p>
              <div className="mt-6">
                <AdminButton variant="primary" size="lg">
                  Bekijk Live Dashboard
                </AdminButton>
              </div>
            </div>
          </div>
        </AdminCard>
      )}

      {activeTab === 'technical' && dashboardStats && (
        <AdminCard
          title="Technische Performance"
          subtitle="API response times, uptime en error monitoring"
          icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
          gradient
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
              title="API Response Time"
              value="245ms"
              icon={<ClockIcon className="w-8 h-8" />}
              color="green"
            />
            <AdminStatsCard
              title="System Uptime"
              value="99.8%"
              icon={<ChartBarIcon className="w-8 h-8" />}
              color="green"
            />
            <AdminStatsCard
              title="Active Users"
              value={dashboardStats.activeUsers}
              icon={<UsersIcon className="w-8 h-8" />}
              color="blue"
            />
            <AdminStatsCard
              title="Database Size"
              value="2.4GB"
              icon={<WrenchScrewdriverIcon className="w-8 h-8" />}
              color="purple"
            />
          </div>
          <div className="mt-6 bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="text-center py-8">
              <div className="text-2xl font-bold text-[#8BAE5A] mb-2">Technische Performance</div>
              <p className="text-[#B6C948]">Systeem gezondheid, performance metrics en error logs</p>
              <div className="mt-6">
                <AdminButton variant="primary" size="lg">
                  Bekijk Technische Rapportage
                </AdminButton>
              </div>
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  );
} 