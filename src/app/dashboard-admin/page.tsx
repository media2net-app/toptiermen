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
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { AdminCard, AdminStatsCard, AdminButton } from '@/components/admin';
import { SwipeIndicator } from '@/components/ui';

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
  const { user } = useSupabaseAuth();
  
  // State voor echte data - geoptimaliseerd voor performance
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false); // Start met false voor snelle UI
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false); // Track of data is geladen

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

  // Fetch real dashboard data - geoptimaliseerd voor performance
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
        setDataLoaded(true);
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

  // Fetch data on mount and when period changes - geoptimaliseerd voor performance
  useEffect(() => {
    // Start data loading immediately to show UI first
    fetchDashboardData();
  }, [user, selectedPeriod]);

  // Helper function to get trend icon
  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) return <ArrowUpIcon className="w-4 h-4 text-green-400" />;
    return <ArrowDownIcon className="w-4 h-4 text-red-400" />;
  };

  // Skeleton loading component voor betere UX
  const SkeletonCard = ({ className = "" }: { className?: string }) => (
    <div className={`bg-[#232D1A] rounded-xl p-6 border border-[#3A4D23] animate-pulse ${className}`}>
      <div className="h-4 bg-[#3A4D23] rounded mb-3 w-3/4"></div>
      <div className="h-8 bg-[#3A4D23] rounded mb-2 w-1/2"></div>
      <div className="h-3 bg-[#3A4D23] rounded w-2/3"></div>
    </div>
  );

  // Helper function om data veilig weer te geven
  const getDisplayValue = (value: number | undefined, loading: boolean, fallback: string = "0") => {
    if (loading) return "Gegevens laden...";
    return value !== undefined ? value.toString() : fallback;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#8BAE5A]">Admin Panel</h1>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-green-400 text-sm font-medium">Live</span>
            </div>
          </div>
          <p className="text-[#B6C948] mt-2">Strategisch overzicht van je Top Tier Men platform</p>
          {dashboardStats && (
            <p className="text-gray-400 text-sm mt-1">
              Laatste update: {new Date(dashboardStats.lastUpdated).toLocaleString('nl-NL')}
            </p>
          )}
          {loading && !dataLoaded && (
            <p className="text-[#8BAE5A] text-sm mt-1 flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-[#8BAE5A]"></div>
              Gegevens laden...
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {activeTab !== 'realtime' && (
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
              className="px-3 sm:px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] text-sm"
            >
              <option value="7d">Laatste 7 dagen</option>
              <option value="30d">Laatste 30 dagen</option>
              <option value="90d">Laatste 90 dagen</option>
            </select>
          )}
          <AdminButton 
            onClick={fetchDashboardData} 
            variant="secondary" 
            icon={<ArrowPathIcon className="w-4 h-4" />}
            disabled={loading}
          >
            {loading ? 'Laden...' : 'Vernieuwen'}
          </AdminButton>
        </div>
      </div>

      {/* Tab Navigation */}
      <SwipeIndicator className="bg-[#181F17] rounded-lg p-1" showFadeIndicators={false}>
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-shrink-0 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Community Health
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-shrink-0 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
              activeTab === 'content'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Content Performance
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-shrink-0 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
              activeTab === 'actions'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Actiegerichte Inzichten
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`flex-shrink-0 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
              activeTab === 'financial'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Financiële Metrics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-shrink-0 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Gebruikers Segmentatie
          </button>
          <button
            onClick={() => setActiveTab('realtime')}
            className={`flex-shrink-0 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
              activeTab === 'realtime'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Real-time Activiteit
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`flex-shrink-0 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
              activeTab === 'technical'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Technische Performance
          </button>
        </div>
      </SwipeIndicator>

      {/* Error state */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            <h3 className="text-red-400 font-semibold">Fout bij laden van gegevens</h3>
          </div>
          <p className="text-gray-300 mb-4">{error}</p>
          <AdminButton onClick={fetchDashboardData} variant="primary">
            Opnieuw Proberen
          </AdminButton>
        </div>
      )}

      {activeTab === 'overview' && (
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
                {loading && !dataLoaded ? (
                  <div className="animate-pulse">
                    <div className="h-12 bg-[#3A4D23] rounded mb-2 w-32 mx-auto"></div>
                    <div className="h-4 bg-[#3A4D23] rounded mb-4 w-24 mx-auto"></div>
                    <div className="h-3 bg-[#3A4D23] rounded mb-2 w-48 mx-auto"></div>
                    <div className="h-3 bg-[#3A4D23] rounded w-56 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl sm:text-4xl font-bold text-[#8BAE5A] mb-2">
                      {dashboardStats?.communityHealthScore || 0}/100
                    </div>
                    <div className="text-sm text-[#B6C948]">Gezondheidsscore</div>
                    <div className="mt-4 text-xs text-gray-400">
                      Gebaseerd op engagement, content creatie en activiteit
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Onboarding rate: {dashboardStats?.onboardingRate || 0}% | 
                      Actieve gebruikers: {dashboardStats?.activeUsers || 0} | 
                      Recente posts: {dashboardStats?.postsLastWeek || 0}
                    </div>
                  </>
                )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading && !dataLoaded ? (
                // Skeleton loading voor ledenstatistieken
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  <AdminStatsCard
                    title="Actieve leden deze maand"
                    value={dashboardStats?.activeMembersThisMonth || 0}
                    icon={<UserGroupIcon className="w-8 h-8" />}
                    color="green"
                    trend={(dashboardStats?.activeMembersThisMonth || 0) > 0 ? 1 : -1}
                  />
                  <AdminStatsCard
                    title="Nieuwe aanmeldingen deze week"
                    value={dashboardStats?.newRegistrationsThisWeek || 0}
                    icon={<UserIcon className="w-8 h-8" />}
                    color="blue"
                    trend={(dashboardStats?.newRegistrationsThisWeek || 0) > 0 ? 1 : -1}
                  />
                  <AdminStatsCard
                    title="Gem. dagelijkse logins"
                    value={dashboardStats?.averageDailyLogins || 0}
                    icon={<ClockIcon className="w-8 h-8" />}
                    color="orange"
                    trend={(dashboardStats?.averageDailyLogins || 0) > 0 ? 1 : -1}
                  />
                  <AdminStatsCard
                    title="Actief coachingpakket"
                    value={dashboardStats?.activeCoachingPackages || 0}
                    icon={<TrophyIcon className="w-8 h-8" />}
                    color="purple"
                    trend={(dashboardStats?.activeCoachingPackages || 0) > 0 ? 1 : -1}
                  />
                </>
              )}
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
              {loading && !dataLoaded ? (
                // Skeleton loading voor communityactiviteit
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  <AdminStatsCard
                    title="Posts afgelopen 7 dagen"
                    value={dashboardStats?.postsLastWeek || 0}
                    icon={<ChatBubbleLeftRightIcon className="w-8 h-8" />}
                    color="green"
                    trend={(dashboardStats?.postsLastWeek || 0) > 0 ? 1 : -1}
                  />
                  <AdminStatsCard
                    title="Meest actieve gebruiker"
                    value={dashboardStats?.mostActiveUser?.posts || 0}
                    subtitle={dashboardStats?.mostActiveUser?.name || "N/A"}
                    icon={<StarIcon className="w-8 h-8" />}
                    color="orange"
                    trend={(dashboardStats?.mostActiveUser?.posts || 0) > 0 ? 1 : -1}
                  />
                  <AdminStatsCard
                    title="Rapportages laatste week"
                    value={dashboardStats?.reportsLastWeek || 0}
                    icon={<ExclamationTriangleIcon className="w-8 h-8" />}
                    color="red"
                    trend={(dashboardStats?.reportsLastWeek || 0) > 0 ? 1 : -1}
                  />
                  <AdminStatsCard
                    title="Populairste squad"
                    value={dashboardStats?.mostPopularSquad?.members || 0}
                    subtitle={dashboardStats?.mostPopularSquad?.name || "N/A"}
                    icon={<UsersIcon className="w-8 h-8" />}
                    color="blue"
                    trend={(dashboardStats?.mostPopularSquad?.members || 0) > 0 ? 1 : -1}
                  />
                </>
              )}
            </div>
          </AdminCard>
        </>
      )}

      {activeTab === 'content' && (
        <AdminCard
          title="Content Performance"
          subtitle="Analyse van academy, training en forum prestaties"
          icon={<AcademicCapIcon className="w-6 h-6" />}
          gradient
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading && !dataLoaded ? (
              // Skeleton loading voor content performance
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {/* Academy Performance */}
                <div className="bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[#8BAE5A]/20">
                      <AcademicCapIcon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Academy</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Modules</span>
                      <span className="text-white font-semibold">{dashboardStats?.contentPerformance?.academy?.totalModules || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lessen</span>
                      <span className="text-white font-semibold">{dashboardStats?.contentPerformance?.academy?.totalLessons || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Voltooiingspercentage</span>
                      <span className="text-[#8BAE5A] font-semibold">{dashboardStats?.contentPerformance?.academy?.averageCompletionRate || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Training Performance */}
                <div className="bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[#f0a14f]/20">
                      <FireIcon className="w-6 h-6 text-[#f0a14f]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Training</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Schema's</span>
                      <span className="text-white font-semibold">{dashboardStats?.contentPerformance?.training?.totalSchemas || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Actieve gebruikers</span>
                      <span className="text-white font-semibold">{dashboardStats?.contentPerformance?.training?.activeUsers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Voltooiingspercentage</span>
                      <span className="text-[#f0a14f] font-semibold">{dashboardStats?.contentPerformance?.training?.averageCompletionRate || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Forum Performance */}
                <div className="bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[#FFD700]/20">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#FFD700]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Forum</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Totaal posts</span>
                      <span className="text-white font-semibold">{dashboardStats?.contentPerformance?.forum?.totalPosts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Recente posts</span>
                      <span className="text-white font-semibold">{dashboardStats?.contentPerformance?.forum?.recentPosts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gem. response tijd</span>
                      <span className="text-[#FFD700] font-semibold">{dashboardStats?.contentPerformance?.forum?.averageResponseTime || 0}h</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </AdminCard>
      )}

      {activeTab === 'actions' && (
        <AdminCard
          title="Actiegerichte Inzichten"
          subtitle="Identificeer risico's en kansen"
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          gradient
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading && !dataLoaded ? (
              // Skeleton loading voor actions
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {/* User Engagement Insights */}
                <div className="bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
                  <h3 className="text-lg font-semibold text-white mb-4">Gebruikers Engagement</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gebruikers met XP</span>
                      <span className="text-white font-semibold">{dashboardStats?.userEngagement?.usersWithXP || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gebruikers met badges</span>
                      <span className="text-white font-semibold">{dashboardStats?.userEngagement?.usersWithBadges || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gemiddelde XP</span>
                      <span className="text-[#8BAE5A] font-semibold">{dashboardStats?.userEngagement?.averageXP || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Voltooide missies</span>
                      <span className="text-[#f0a14f] font-semibold">{dashboardStats?.userEngagement?.completedMissions || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                <div className="bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
                  <h3 className="text-lg font-semibold text-white mb-4">Aanbevolen Acties</h3>
                  <div className="space-y-3">
                    {(dashboardStats?.onboardingRate || 0) < 50 && (
                      <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                        <div>
                          <div className="text-white font-medium">Lage onboarding rate</div>
                          <div className="text-gray-400 text-sm">Verbetert onboarding proces</div>
                        </div>
                      </div>
                    )}
                    {(dashboardStats?.postsLastWeek || 0) < 10 && (
                      <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-orange-400" />
                        <div>
                          <div className="text-white font-medium">Weinig forum activiteit</div>
                          <div className="text-gray-400 text-sm">Stimuleer community discussies</div>
                        </div>
                      </div>
                    )}
                    {(dashboardStats?.activeUsers || 0) < (dashboardStats?.totalUsers || 0) * 0.3 && (
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
              </>
            )}
          </div>
        </AdminCard>
      )}

      {activeTab === 'financial' && (
        <AdminCard
          title="Financiële Metrics"
          subtitle="MRR, LTV en andere financiële KPI's"
          icon={<ChartBarIcon className="w-6 h-6" />}
          gradient
        >
          <div className="text-center py-8">
            <div className="text-2xl font-bold text-[#8BAE5A] mb-4">Financiële Metrics</div>
            <p className="text-[#B6C948] mb-6">Maandelijkse terugkerende inkomsten en andere financiële indicatoren</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
                <div className="text-2xl sm:text-3xl font-bold text-[#8BAE5A] mb-2">€0</div>
                <div className="text-gray-400 text-sm">MRR</div>
              </div>
              <div className="bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
                <div className="text-2xl sm:text-3xl font-bold text-[#f0a14f] mb-2">€0</div>
                <div className="text-gray-400 text-sm">LTV</div>
              </div>
              <div className="bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
                <div className="text-2xl sm:text-3xl font-bold text-[#FFD700] mb-2">0%</div>
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

      {activeTab === 'users' && (
        <AdminCard
          title="Gebruikers Segmentatie"
          subtitle="Analyse van gebruikersgroepen en gedrag"
          icon={<UsersIcon className="w-6 h-6" />}
          gradient
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading && !dataLoaded ? (
              // Skeleton loading voor users
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <AdminStatsCard
                  title="Totaal Gebruikers"
                  value={dashboardStats?.totalUsers || 0}
                  icon={<UsersIcon className="w-8 h-8" />}
                  color="blue"
                />
                <AdminStatsCard
                  title="Actieve Gebruikers"
                  value={dashboardStats?.activeUsers || 0}
                  icon={<UserIcon className="w-8 h-8" />}
                  color="green"
                />
                <AdminStatsCard
                  title="Onboarding Voltooid"
                  value={dashboardStats?.completedOnboarding || 0}
                  icon={<TrophyIcon className="w-8 h-8" />}
                  color="orange"
                />
                <AdminStatsCard
                  title="Gemiddelde XP"
                  value={dashboardStats?.userEngagement?.averageXP || 0}
                  icon={<StarIcon className="w-8 h-8" />}
                  color="purple"
                />
              </>
            )}
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading && !dataLoaded ? (
              // Skeleton loading voor users details
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <div className="bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
                  <h3 className="text-lg font-semibold text-white mb-4">Gebruikers Distributie</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nieuwe gebruikers</span>
                      <span className="text-white">{dashboardStats?.newRegistrationsThisWeek || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Actieve gebruikers</span>
                      <span className="text-white">{dashboardStats?.activeUsers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Inactieve gebruikers</span>
                      <span className="text-white">{(dashboardStats?.totalUsers || 0) - (dashboardStats?.activeUsers || 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
                  <h3 className="text-lg font-semibold text-white mb-4">Engagement Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gebruikers met XP</span>
                      <span className="text-white">{dashboardStats?.userEngagement?.usersWithXP || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gebruikers met badges</span>
                      <span className="text-white">{dashboardStats?.userEngagement?.usersWithBadges || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Voltooide missies</span>
                      <span className="text-white">{dashboardStats?.userEngagement?.completedMissions || 0}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </AdminCard>
      )}

      {activeTab === 'realtime' && (
        <AdminCard
          title="Real-time Activiteit"
          subtitle="Tracking van platform activiteit"
          icon={<ClockIcon className="w-6 h-6" />}
          gradient
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading && !dataLoaded ? (
              // Skeleton loading voor realtime
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <AdminStatsCard
                  title="Huidige Online"
                  value={dashboardStats?.activeUsers || 0}
                  icon={<EyeIcon className="w-8 h-8" />}
                  color="green"
                />
                <AdminStatsCard
                  title="Recente Posts"
                  value={dashboardStats?.postsLastWeek || 0}
                  icon={<ChatBubbleLeftRightIcon className="w-8 h-8" />}
                  color="blue"
                />
                <AdminStatsCard
                  title="Actieve Missies"
                  value={dashboardStats?.userEngagement?.completedMissions || 0}
                  icon={<FireIcon className="w-8 h-8" />}
                  color="orange"
                />
                <AdminStatsCard
                  title="Gemiddelde XP"
                  value={dashboardStats?.userEngagement?.averageXP || 0}
                  icon={<StarIcon className="w-8 h-8" />}
                  color="purple"
                />
              </>
            )}
          </div>
          <div className="mt-6 bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
            <h3 className="text-lg font-semibold text-white mb-4">Platform Activiteit</h3>
            <div className="text-center py-8">
              <div className="text-2xl font-bold text-[#8BAE5A] mb-2">Real-time Dashboard</div>
              <p className="text-[#B6C948]">Updates van gebruikersactiviteit en trending content</p>
              <div className="mt-6">
                <AdminButton variant="primary" size="lg">
                  Bekijk Dashboard
                </AdminButton>
              </div>
            </div>
          </div>
        </AdminCard>
      )}

      {activeTab === 'technical' && (
        <AdminCard
          title="Technische Performance"
          subtitle="API response times, uptime en error monitoring"
          icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
          gradient
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading && !dataLoaded ? (
              // Skeleton loading voor technical
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
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
                  value={dashboardStats?.activeUsers || 0}
                  icon={<UsersIcon className="w-8 h-8" />}
                  color="blue"
                />
                <AdminStatsCard
                  title="Database Size"
                  value="2.4GB"
                  icon={<WrenchScrewdriverIcon className="w-8 h-8" />}
                  color="purple"
                />
              </>
            )}
          </div>
          <div className="mt-6 bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
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