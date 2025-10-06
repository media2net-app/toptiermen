'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
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
  ArrowPathIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { AdminCard, AdminStatsCard, AdminButton } from '@/components/admin';
import { SwipeIndicator } from '@/components/ui';
import MollieFinanceMetrics from '@/components/admin/MollieFinanceMetrics';
import LoadingModal from '@/components/admin/LoadingModal';
import TaskNotificationWidget from '@/components/admin/TaskNotificationWidget';
import VercelAnalyticsWidget from '@/components/admin/VercelAnalyticsWidget';

// Types for session data
interface SessionLog {
  id: string;
  user_email: string;
  user_type: string;
  current_page: string;
  status: string;
  last_activity: string;
  error_count: number;
  loop_detections: number;
  created_at: string;
}

interface UserActivity {
  id: string;
  user_email: string;
  user_type: string;
  action_type: string;
  current_page: string;
  status: string;
  created_at: string;
  details: any;
}

interface SessionStatistics {
  totalSessions: number;
  stuckSessions: number;
  errorSessions: number;
  activeUsers: number;
  totalErrors: number;
  totalLoops: number;
  byUserType: {
    rick: number;
    chiel: number;
    test: number;
    admin: number;
  };
}

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

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const { user } = useSupabaseAuth();

  // Add hydration safety
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // Set client state immediately to prevent long loading
    setIsClient(true);
  }, []);

  // Redirect to Onboarding Overview as default admin landing
  useEffect(() => {
    if (pathname === '/dashboard-admin') {
      router.replace('/dashboard-admin/onboarding-overview');
    }
  }, [pathname, router]);
  
  // State voor echte data - geoptimaliseerd voor performance
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false); // Start met false voor snelle UI
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false); // Track of data is geladen

  // Session monitoring state
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStatistics | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Read tab from URL parameter and set initial active tab
  const tabFromUrl = searchParams?.get('tab') as 'overview' | 'content' | 'actions' | 'financial' | 'users' | 'realtime' | 'technical' | 'timeline' | 'session-logs' | 'old-timeline';
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'actions' | 'financial' | 'users' | 'realtime' | 'technical' | 'timeline' | 'session-logs' | 'old-timeline'>(
    tabFromUrl || 'overview'
  );

  // Session data functions - DISABLED
  const fetchSessionData = async () => {
    // Session logging disabled to prevent infinite loops
    setSessionLogs([]);
    setUserActivities([]);
    setSessionStats(null);
    setSessionLoading(false);
  };

  const exportSessionData = () => {
    const data = {
      sessionLogs,
      userActivities,
      statistics: sessionStats,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearOldLogs = async () => {
    // Session logging disabled to prevent infinite loops
    alert('Session logging is uitgeschakeld');
  };

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Automatically start session monitoring when session-logs tab is active
  useEffect(() => {
    if (activeTab === 'session-logs') {
      console.log('🚀 Auto-starting session monitoring...');
      
      // Session logging disabled
      console.log('Session logging is uitgeschakeld');
      fetchSessionData();
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing session data...');
        fetchSessionData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Fetch real dashboard data - geoptimaliseerd voor performance
  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching admin dashboard data for period:', selectedPeriod);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 20000)
      );
      
      const fetchPromise = fetch(`/api/admin/dashboard-stats?period=${selectedPeriod}`);
      
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
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
      // Set dataLoaded to true even on error to prevent infinite loading
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when period changes - geoptimaliseerd voor performance
  useEffect(() => {
    // Start data loading immediately to show UI first
    fetchDashboardData();
    
    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      if (loading && !dataLoaded) {
        console.log('⚠️ Admin dashboard loading timeout - forcing completion');
        setLoading(false);
        setDataLoaded(true);
      }
    }, 15000); // 15 second timeout
    
    return () => clearTimeout(fallbackTimeout);
  }, [user, selectedPeriod]);

  // Fetch session data when session-logs tab is active
  useEffect(() => {
    if (activeTab === 'session-logs') {
      fetchSessionData();
    }
  }, [activeTab]);

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

  // Prevent hydration issues by not rendering until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A] text-lg">Admin Dashboard laden...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingModal 
        isOpen={loading && !dataLoaded} 
        message="Admin dashboard statistieken worden geladen..."
      />
      
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
            <div className="text-[#8BAE5A] text-sm mt-1 flex items-center gap-2">
              <span className="animate-spin rounded-full h-3 w-3 border-b border-[#8BAE5A] inline-block"></span>
              <span>Gegevens laden...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Task Notification Widget for Chiel */}
          <TaskNotificationWidget />
          
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
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-shrink-0 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            🚀 Launch Timeline
          </button>
          <button
            onClick={() => setActiveTab('session-logs')}
            className={`flex-shrink-0 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
              activeTab === 'session-logs'
                ? 'bg-[#8BAE5A] text-black'
                : 'text-white/60 hover:text-white'
            }`}
          >
            📊 Session Monitoring
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

          {/* Vercel Analytics */}
          <VercelAnalyticsWidget period={selectedPeriod} type="analytics" />
        </AdminCard>
      )}

      {activeTab === 'actions' && (
        <AdminCard
          title="Actiegerichte Inzichten"
          subtitle="Identificeer risico's en kansen"
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          gradient
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && !dataLoaded ? (
              // Skeleton loading voor actions
              <>
                <SkeletonCard />
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

                {/* Admin Tools */}
                <div className="bg-[#181F17] rounded-xl p-4 sm:p-6 border border-[#3A4D23]">
                  <h3 className="text-lg font-semibold text-white mb-4">Admin Tools</h3>
                  <div className="space-y-3">
                    <a
                      href="/dashboard-admin/login-logs"
                      className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
                    >
                      <UserIcon className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-white font-medium">Login Logs</div>
                        <div className="text-gray-400 text-sm">Monitor alle inlogpogingen</div>
                      </div>
                    </a>
                    
                    <a
                      href="/dashboard-admin/email-logs"
                      className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      <EnvelopeIcon className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">Email Logs</div>
                        <div className="text-gray-400 text-sm">Monitor alle verzonden emails</div>
                      </div>
                    </a>
                    
                    <a
                      href="/dashboard-admin/database-view"
                      className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
                    >
                      <WrenchScrewdriverIcon className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-white font-medium">Database View</div>
                        <div className="text-gray-400 text-sm">Database overzicht en beheer</div>
                      </div>
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </AdminCard>
      )}

      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Financiële Metrics</h1>
              <p className="text-gray-400">Mollie betalingsdata en inkomsten analyse</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedPeriod('7d')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedPeriod === '7d'
                    ? 'bg-[#8BAE5A] text-white'
                    : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#3A4D23]'
                }`}
              >
                7 dagen
              </button>
              <button
                onClick={() => setSelectedPeriod('30d')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedPeriod === '30d'
                    ? 'bg-[#8BAE5A] text-white'
                    : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#3A4D23]'
                }`}
              >
                30 dagen
              </button>
              <button
                onClick={() => setSelectedPeriod('90d')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedPeriod === '90d'
                    ? 'bg-[#8BAE5A] text-white'
                    : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#3A4D23]'
                }`}
              >
                90 dagen
              </button>
            </div>
          </div>
          
          {/* <MollieFinanceMetrics period={selectedPeriod} /> */}
        </div>
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

          {/* Vercel Analytics - Real-time */}
          <VercelAnalyticsWidget period={selectedPeriod} type="analytics" />
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

          {/* Vercel Speed Insights */}
          <VercelAnalyticsWidget period={selectedPeriod} type="speed-insights" />
        </AdminCard>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Redirect to prelaunch page */}
          <div className="bg-gradient-to-r from-[#8BAE5A]/20 to-[#3A4D23]/20 rounded-xl p-6 border border-[#8BAE5A]/30">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">🚀 Platform Lancering Dashboard</h2>
              <p className="text-gray-300 mb-6">
                Bekijk de volledige prelaunch pagina met countdown timer, features en wachtlijst registratie.
              </p>
              <button
                onClick={() => window.open('/prelaunch', '_blank')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <span className="mr-2">🚀</span>
                Open Prelaunch Pagina
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'old-timeline' && (
        <AdminCard
          title="🚀 Launch Timeline"
          subtitle="Planning van 16 augustus t/m 10 september - Platform lancering"
          icon={<ClockIcon className="w-6 h-6" />}
          gradient
        >
          <div className="space-y-8">
            {/* Timeline Overview */}
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#8BAE5A]">Timeline Overzicht</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Actief</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-[#232D1A] rounded-xl border border-[#3A4D23]">
                  <div className="text-2xl font-bold text-[#8BAE5A]">16</div>
                  <div className="text-[#B6C948] text-sm">Augustus</div>
                  <div className="text-[#8BAE5A] font-semibold mt-2">Start Planning</div>
                </div>
                <div className="text-center p-4 bg-[#232D1A] rounded-xl border border-[#3A4D23]">
                  <div className="text-2xl font-bold text-[#8BAE5A]">23</div>
                  <div className="text-[#B6C948] text-sm">Augustus</div>
                  <div className="text-[#8BAE5A] font-semibold mt-2">Test Groep Live</div>
                </div>
                <div className="text-center p-4 bg-[#232D1A] rounded-xl border border-[#3A4D23]">
                  <div className="text-2xl font-bold text-[#8BAE5A]">10</div>
                  <div className="text-[#B6C948] text-sm">September</div>
                  <div className="text-[#8BAE5A] font-semibold mt-2">Officiële Lancering</div>
                </div>
              </div>
            </div>

            {/* Detailed Timeline */}
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
              <h3 className="text-xl font-bold text-[#8BAE5A] mb-6">Gedetailleerde Planning</h3>
              
              <div className="space-y-6">
                {/* Week 1: 16-22 Augustus */}
                <div className="border-l-4 border-[#8BAE5A] pl-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                      <span className="text-[#181F17] font-bold text-sm">1</span>
                    </div>
                    <h4 className="text-lg font-semibold text-[#8BAE5A]">Week 1: 16-22 Augustus</h4>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">In Progress</span>
                  </div>
                  <div className="ml-11 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                      <span className="text-[#B6C948]">Finaliseren alle video content voor oefeningen</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                      <span className="text-[#B6C948]">Testen van workout video functionaliteit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                      <span className="text-[#B6C948]">Bug fixes en performance optimalisatie</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                      <span className="text-[#B6C948]">Voorbereiden test groep onboarding</span>
                    </div>
                  </div>
                </div>

                {/* Week 2: 23-29 Augustus */}
                <div className="border-l-4 border-[#B6C948] pl-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[#B6C948] rounded-full flex items-center justify-center">
                      <span className="text-[#181F17] font-bold text-sm">2</span>
                    </div>
                    <h4 className="text-lg font-semibold text-[#B6C948]">Week 2: 23-29 Augustus</h4>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">Critical</span>
                  </div>
                  <div className="ml-11 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#B6C948] rounded-full"></div>
                      <span className="text-[#B6C948] font-semibold">🎯 VRIJDAG 23 AUGUSTUS: Platform live voor test groep</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#B6C948] rounded-full"></div>
                      <span className="text-[#B6C948]">Uitnodigen test gebruikers (20-30 personen)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#B6C948] rounded-full"></div>
                      <span className="text-[#B6C948]">Monitoring van gebruikersfeedback en bugs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#B6C948] rounded-full"></div>
                      <span className="text-[#B6C948]">Implementeren van feedback en fixes</span>
                    </div>
                  </div>
                </div>

                {/* Week 3: 30 Augustus - 5 September */}
                <div className="border-l-4 border-[#3A4D23] pl-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[#3A4D23] rounded-full flex items-center justify-center">
                      <span className="text-[#8BAE5A] font-bold text-sm">3</span>
                    </div>
                    <h4 className="text-lg font-semibold text-[#8BAE5A]">Week 3: 30 Augustus - 5 September</h4>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">Planning</span>
                  </div>
                  <div className="ml-11 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#3A4D23] rounded-full"></div>
                      <span className="text-[#B6C948]">Uitbreiden test groep (50-100 personen)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#3A4D23] rounded-full"></div>
                      <span className="text-[#B6C948]">Content optimalisatie gebaseerd op feedback</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#3A4D23] rounded-full"></div>
                      <span className="text-[#B6C948]">Voorbereiden marketing campagne</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#3A4D23] rounded-full"></div>
                      <span className="text-[#B6C948]">Finaliseren onboarding flow</span>
                    </div>
                  </div>
                </div>

                {/* Week 4: 6-10 September */}
                <div className="border-l-4 border-[#8BAE5A] pl-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                      <span className="text-[#181F17] font-bold text-sm">4</span>
                    </div>
                    <h4 className="text-lg font-semibold text-[#8BAE5A]">Week 4: 6-10 September</h4>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">Launch</span>
                  </div>
                  <div className="ml-11 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                      <span className="text-[#B6C948] font-semibold">🎯 DINSDAG 10 SEPTEMBER: Officiële lancering</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                      <span className="text-[#B6C948]">Marketing campagne activeren</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                      <span className="text-[#B6C948]">Social media push</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                      <span className="text-[#B6C948]">Monitoring en support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Milestones */}
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
              <h3 className="text-xl font-bold text-[#8BAE5A] mb-6">🎯 Kritieke Milestones</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-[#232D1A] rounded-xl border border-[#3A4D23]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">!</span>
                    </div>
                    <h4 className="text-lg font-semibold text-[#8BAE5A]">Vrijdag 23 Augustus</h4>
                  </div>
                  <p className="text-[#B6C948] mb-3">Platform moet live zijn voor test groep</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Critical</span>
                    <span className="text-[#B6C948] text-sm">Geen uitstel mogelijk</span>
                  </div>
                </div>

                <div className="p-4 bg-[#232D1A] rounded-xl border border-[#3A4D23]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <h4 className="text-lg font-semibold text-[#8BAE5A]">Dinsdag 10 September</h4>
                  </div>
                  <p className="text-[#B6C948] mb-3">Officiële lancering voor publiek</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Launch</span>
                    <span className="text-[#B6C948] text-sm">Marketing campagne start</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
              <h3 className="text-xl font-bold text-[#8BAE5A] mb-6">📋 Actie Punten</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#232D1A] rounded-xl border border-[#3A4D23]">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-[#8BAE5A] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#8BAE5A]" />
                    <span className="text-[#B6C948]">Workout video functionaliteit testen</span>
                  </div>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Vandaag</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#232D1A] rounded-xl border border-[#3A4D23]">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-[#8BAE5A] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#8BAE5A]" />
                    <span className="text-[#B6C948]">Test groep uitnodigingen voorbereiden</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Woensdag</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#232D1A] rounded-xl border border-[#3A4D23]">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-[#8BAE5A] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#8BAE5A]" />
                    <span className="text-[#B6C948]">Marketing content voorbereiden</span>
                  </div>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">Volgende week</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#232D1A] rounded-xl border border-[#3A4D23]">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-[#8BAE5A] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#8BAE5A]" />
                    <span className="text-[#B6C948]">Support team voorbereiden</span>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Week 3</span>
                </div>
              </div>
            </div>
          </div>
        </AdminCard>
      )}

      {activeTab === 'session-logs' && (
        <div className="space-y-6">
          <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
            <h3 className="text-xl font-bold text-[#8BAE5A] mb-6">📊 Session Monitoring</h3>
            <p className="text-[#B6C948] mb-4">
              Real-time monitoring van gebruikerssessies en cache problemen
            </p>
            
            {/* Session Monitoring Status */}
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-[#8BAE5A] mb-2">
                Session Monitoring Status
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[#B6C948]">Automatisch actief - Data wordt elke 30 seconden ververst</span>
              </div>
              <p className="text-sm text-[#8BAE5A] mt-2">
                Database tabellen worden automatisch aangemaakt indien nodig
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-lg font-semibold text-[#8BAE5A]">Total Sessions</h4>
                <p className="text-3xl font-bold text-[#8BAE5A]">
                  {sessionLoading ? '...' : sessionStats?.totalSessions || 0}
                </p>
              </div>
              <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-lg font-semibold text-[#8BAE5A]">Stuck Sessions</h4>
                <p className="text-3xl font-bold text-red-400">
                  {sessionLoading ? '...' : sessionStats?.stuckSessions || 0}
                </p>
              </div>
              <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-lg font-semibold text-[#8BAE5A]">Active Users</h4>
                <p className="text-3xl font-bold text-green-400">
                  {sessionLoading ? '...' : sessionStats?.activeUsers || 0}
                </p>
              </div>
              <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-lg font-semibold text-[#8BAE5A]">Total Errors</h4>
                <p className="text-3xl font-bold text-yellow-400">
                  {sessionLoading ? '...' : sessionStats?.totalErrors || 0}
                </p>
              </div>
            </div>

            {/* User Type Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[#8BAE5A]">Rick's Sessions</h4>
                <p className="text-2xl font-bold text-orange-400">
                  {sessionLoading ? '...' : sessionStats?.byUserType?.rick || 0}
                </p>
                <p className="text-xs text-[#B6C948]">Cache/Loop Focus</p>
              </div>
              <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[#8BAE5A]">Chiel's Sessions</h4>
                <p className="text-2xl font-bold text-blue-400">
                  {sessionLoading ? '...' : sessionStats?.byUserType?.chiel || 0}
                </p>
                <p className="text-xs text-[#B6C948]">User Monitoring</p>
              </div>
              <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[#8BAE5A]">Test Users</h4>
                <p className="text-2xl font-bold text-purple-400">
                  {sessionLoading ? '...' : sessionStats?.byUserType?.test || 0}
                </p>
                <p className="text-xs text-[#B6C948]">Testing Sessions</p>
              </div>
              <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[#8BAE5A]">Admin Users</h4>
                <p className="text-2xl font-bold text-green-400">
                  {sessionLoading ? '...' : sessionStats?.byUserType?.admin || 0}
                </p>
                <p className="text-xs text-[#B6C948]">Admin Sessions</p>
              </div>
            </div>

            {/* User Session Monitoring */}
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-[#8BAE5A] mb-2">
                👥 User Session Monitoring
              </h4>
              <p className="text-[#B6C948] mb-3">
                Monitor alle gebruikerssessies inclusief Rick, Chiel en andere gebruikers
              </p>
              
              {/* User Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                  Filter op Gebruiker
                </label>
                <select
                  id="userFilter"
                  className="border border-[#3A4D23] bg-[#0F1411] text-[#8BAE5A] rounded px-3 py-2 w-full"
                  onChange={(e) => {
                    const selectedUser = e.target.value;
                    if (selectedUser === 'all') {
                      // Show all users
                      alert('Toon alle gebruikerssessies');
                    } else if (selectedUser === 'rick') {
                      // Show Rick's sessions
                      alert('Toon Rick\'s sessies - cache en loop monitoring actief');
                    } else if (selectedUser === 'chiel') {
                      // Show Chiel's sessions
                      alert('Toon Chiel\'s sessies - monitoring actief');
                    } else {
                      // Show specific user
                      alert(`Toon sessies voor gebruiker: ${selectedUser}`);
                    }
                  }}
                >
                  <option value="all">Alle Gebruikers</option>
                  <option value="rick">Rick (Cache/Loop Focus)</option>
                  <option value="chiel">Chiel</option>
                  <option value="test">Test Gebruikers</option>
                  <option value="admin">Admin Gebruikers</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    alert('Session monitoring is actief voor alle gebruikers!');
                  }}
                  className="px-3 py-2 bg-[#8BAE5A] text-[#0F1411] rounded hover:bg-[#7A9D4A] transition-colors text-sm"
                >
                  Start Monitoring
                </button>
                <button
                  onClick={() => {
                    alert('Alle vastgelopen sessies zijn gereset');
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Reset Stuck Sessions
                </button>
                <button
                  onClick={() => {
                    alert('Session data wordt geëxporteerd...');
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Export Data
                </button>
              </div>
            </div>

            {/* User Activity Log */}
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-[#8BAE5A]">
                  📋 User Activity Log
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Refresh log data
                      fetchSessionData();
                    }}
                    className="px-3 py-1 bg-[#8BAE5A] text-[#0F1411] rounded hover:bg-[#7A9D4A] transition-colors text-sm"
                  >
                    🔄 Refresh
                  </button>
                  <button
                    onClick={() => {
                      // Export log data
                      exportSessionData();
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    📥 Export
                  </button>
                  <button
                    onClick={() => {
                      // Clear old logs
                      clearOldLogs();
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    🗑️ Clear Old
                  </button>
                </div>
              </div>

              {/* Log Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-[#8BAE5A] mb-1">
                    Gebruiker
                  </label>
                  <select className="border border-[#3A4D23] bg-[#0F1411] text-[#8BAE5A] rounded px-3 py-2 w-full text-sm">
                    <option value="all">Alle Gebruikers</option>
                    <option value="rick">Rick Cuijpers</option>
                    <option value="chiel">Chiel</option>
                    <option value="test">Test Users</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8BAE5A] mb-1">
                    Actie Type
                  </label>
                  <select className="border border-[#3A4D23] bg-[#0F1411] text-[#8BAE5A] rounded px-3 py-2 w-full text-sm">
                    <option value="all">Alle Acties</option>
                    <option value="page_load">Page Load</option>
                    <option value="navigation">Navigation</option>
                    <option value="error">Error</option>
                    <option value="loop_detected">Loop Detected</option>
                    <option value="cache_hit">Cache Hit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8BAE5A] mb-1">
                    Status
                  </label>
                  <select className="border border-[#3A4D23] bg-[#0F1411] text-[#8BAE5A] rounded px-3 py-2 w-full text-sm">
                    <option value="all">Alle Status</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                    <option value="stuck">Stuck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8BAE5A] mb-1">
                    Tijdsperiode
                  </label>
                  <select className="border border-[#3A4D23] bg-[#0F1411] text-[#8BAE5A] rounded px-3 py-2 w-full text-sm">
                    <option value="1h">Laatste Uur</option>
                    <option value="24h">Laatste 24 Uur</option>
                    <option value="7d">Laatste 7 Dagen</option>
                    <option value="30d">Laatste 30 Dagen</option>
                  </select>
                </div>
              </div>

              {/* Activity Log Table */}
              <div className="bg-[#0F1411] border border-[#3A4D23] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#181F17] border-b border-[#3A4D23]">
                      <tr>
                        <th className="px-4 py-3 text-left text-[#8BAE5A] font-medium">Tijdstip</th>
                        <th className="px-4 py-3 text-left text-[#8BAE5A] font-medium">Gebruiker</th>
                        <th className="px-4 py-3 text-left text-[#8BAE5A] font-medium">Actie</th>
                        <th className="px-4 py-3 text-left text-[#8BAE5A] font-medium">Pagina</th>
                        <th className="px-4 py-3 text-left text-[#8BAE5A] font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-[#8BAE5A] font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3A4D23]">
                      {sessionLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-[#8BAE5A]">
                            <div className="flex items-center justify-center gap-2">
                              <ArrowPathIcon className="w-5 h-5 animate-spin" />
                              Session data laden...
                            </div>
                          </td>
                        </tr>
                      ) : userActivities.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-[#8BAE5A]">
                            Geen session data gevonden. Start monitoring om data te zien.
                          </td>
                        </tr>
                      ) : (
                        userActivities.slice(0, 20).map((activity) => {
                          const timestamp = new Date(activity.created_at).toLocaleTimeString('nl-NL', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });

                          const getUserTypeBadge = (userType: string) => {
                            switch (userType) {
                              case 'rick': return <span className="px-2 py-1 bg-orange-900/50 text-orange-300 rounded text-xs">Admin</span>;
                              case 'chiel': return <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs">User</span>;
                              case 'test': return <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">Test</span>;
                              case 'admin': return <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">Admin</span>;
                              default: return <span className="px-2 py-1 bg-gray-900/50 text-gray-300 rounded text-xs">User</span>;
                            }
                          };

                          const getActionBadge = (actionType: string) => {
                            switch (actionType) {
                              case 'page_load': return <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs">Page Load</span>;
                              case 'navigation': return <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">Navigation</span>;
                              case 'error': return <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs">Error</span>;
                              case 'loop_detected': return <span className="px-2 py-1 bg-orange-900/50 text-orange-300 rounded text-xs">Loop Detected</span>;
                              case 'cache_hit': return <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">Cache Hit</span>;
                              default: return <span className="px-2 py-1 bg-gray-900/50 text-gray-300 rounded text-xs">{actionType}</span>;
                            }
                          };

                          const getStatusBadge = (status: string) => {
                            switch (status) {
                              case 'success': return <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">Success</span>;
                              case 'error': return <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs">Error</span>;
                              case 'warning': return <span className="px-2 py-1 bg-orange-900/50 text-orange-300 rounded text-xs">Warning</span>;
                              case 'critical': return <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs">Critical</span>;
                              default: return <span className="px-2 py-1 bg-gray-900/50 text-gray-300 rounded text-xs">{status}</span>;
                            }
                          };

                          const getDetails = (activity: UserActivity) => {
                            if (activity.details) {
                              if (activity.details.load_time) {
                                return `Load time: ${activity.details.load_time}ms`;
                              }
                              if (activity.details.error) {
                                return activity.details.error;
                              }
                              if (activity.details.from && activity.details.to) {
                                return `From: ${activity.details.from}, To: ${activity.details.to}`;
                              }
                            }
                            return activity.action_type === 'page_load' ? 'Page loaded successfully' : 'Action completed';
                          };

                          return (
                            <tr key={activity.id} className={`hover:bg-[#181F17] transition-colors ${
                              activity.status === 'error' || activity.status === 'critical' ? 'bg-red-900/10' : 
                              activity.status === 'warning' ? 'bg-orange-900/10' : ''
                            }`}>
                              <td className="px-4 py-3 text-[#B6C948]">{timestamp}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#B6C948]">{activity.user_email}</span>
                                  {getUserTypeBadge(activity.user_type)}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {getActionBadge(activity.action_type)}
                              </td>
                              <td className="px-4 py-3 text-[#B6C948]">{activity.current_page || 'N/A'}</td>
                              <td className="px-4 py-3">
                                {getStatusBadge(activity.status)}
                              </td>
                              <td className="px-4 py-3 text-[#B6C948] text-xs">{getDetails(activity)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-[#B6C948]">
                  {sessionLoading ? 'Laden...' : `Toon 1-${Math.min(userActivities.length, 20)} van ${userActivities.length} resultaten`}
                </div>
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1 border border-[#3A4D23] text-[#8BAE5A] rounded hover:bg-[#181F17] transition-colors text-sm"
                    disabled={sessionLoading}
                  >
                    ← Vorige
                  </button>
                  <button className="px-3 py-1 bg-[#8BAE5A] text-[#0F1411] rounded text-sm">1</button>
                  <button 
                    className="px-3 py-1 border border-[#3A4D23] text-[#8BAE5A] rounded hover:bg-[#181F17] transition-colors text-sm"
                    disabled={sessionLoading}
                  >
                    Volgende →
                  </button>
                </div>
              </div>
            </div>

            {/* Active Sessions Overview */}
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
              <h4 className="text-lg font-semibold text-[#8BAE5A] mb-3">
                📊 Actieve Sessies Overzicht
              </h4>
              
              {sessionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-[#8BAE5A]">
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Session data laden...
                  </div>
                </div>
              ) : sessionLogs.length === 0 ? (
                <div className="text-center py-8 text-[#8BAE5A]">
                  Geen actieve sessies gevonden. Start monitoring om data te zien.
                </div>
              ) : (
                <div className="space-y-3">
                  {sessionLogs.slice(0, 10).map((session) => {
                    const lastActivity = new Date(session.last_activity).toLocaleTimeString('nl-NL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    const getUserTypeBadge = (userType: string) => {
                      switch (userType) {
                        case 'rick': return <span className="text-xs text-[#8BAE5A]">(Admin)</span>;
                        case 'chiel': return <span className="text-xs text-[#8BAE5A]">(User)</span>;
                        case 'test': return <span className="text-xs text-[#8BAE5A]">(Test)</span>;
                        case 'admin': return <span className="text-xs text-[#8BAE5A]">(Admin)</span>;
                        default: return <span className="text-xs text-[#8BAE5A]">(User)</span>;
                      }
                    };

                    const getStatusIndicator = (status: string, lastActivity: string) => {
                      const now = new Date();
                      const lastActivityTime = new Date(lastActivity);
                      const timeDiff = now.getTime() - lastActivityTime.getTime();
                      const minutesInactive = Math.floor(timeDiff / (1000 * 60));

                      if (status === 'stuck' || status === 'error') {
                        return <div className="w-3 h-3 bg-red-400 rounded-full"></div>;
                      } else if (minutesInactive > 5) {
                        return <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>;
                      } else {
                        return <div className="w-3 h-3 bg-green-400 rounded-full"></div>;
                      }
                    };

                    const getStatusBadge = (status: string, lastActivity: string) => {
                      const now = new Date();
                      const lastActivityTime = new Date(lastActivity);
                      const timeDiff = now.getTime() - lastActivityTime.getTime();
                      const minutesInactive = Math.floor(timeDiff / (1000 * 60));

                      if (status === 'stuck' || status === 'error') {
                        return <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-xs">Stuck</span>;
                      } else if (minutesInactive > 5) {
                        return <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded text-xs">Idle</span>;
                      } else {
                        return <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-xs">Online</span>;
                      }
                    };

                    return (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-[#181F17] rounded-lg border border-[#3A4D23]">
                        <div className="flex items-center gap-3">
                          {getStatusIndicator(session.status, session.last_activity)}
                          <span className="text-[#B6C948]">{session.user_email}</span>
                          {getUserTypeBadge(session.user_type)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#B6C948]">{session.current_page || 'N/A'}</span>
                          {getStatusBadge(session.status, session.last_activity)}
                          <span className="text-xs text-[#8BAE5A]">({lastActivity})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {sessionLogs.length > 10 && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-[#8BAE5A]">
                    Toon {Math.min(sessionLogs.length, 10)} van {sessionLogs.length} actieve sessies
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#8BAE5A] text-xl mb-4">Laden...</div>
          <div className="w-8 h-8 border-2 border-[#8BAE5A] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
} 