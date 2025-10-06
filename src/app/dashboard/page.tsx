'use client';
import { useEffect, useState, useRef } from 'react';
import ClientLayout from '../components/ClientLayout';
import { CheckCircleIcon, TrophyIcon, BookOpenIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { BeakerIcon as DumbbellIcon, LightBulbIcon as BrainIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import BadgeDisplay from '@/components/BadgeDisplay';
import { useAuth } from '@/hooks/useAuth';
import DashboardLoadingModal from '@/components/ui/DashboardLoadingModal';
import { useRouter } from 'next/navigation';
import InboxIcon from '@/components/InboxIcon';
import OnboardingV2Modal from '@/components/OnboardingV2Modal';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DashboardStats {
  missions: {
    total: number;
    completedToday: number;
    completedThisWeek: number;
    progress: number;
  };
  challenges: {
    total: number;
    completedToday: number;
    completedThisWeek: number;
    progress: number;
  };
  training: {
    hasActiveSchema: boolean;
    currentDay: number;
    totalDays: number;
    weeklySessions: number;
    progress: number;
    schemaName?: string;
    completedDaysThisWeek?: number;
    currentWeek?: number;
    totalWeeks?: number;
  };
  mindFocus: {
    total: number;
    completedToday: number;
    progress: number;
    hasProfile?: boolean;
    stressLevel?: number;
    personalGoals?: string[];
    currentStreak?: number;
    currentWeek?: number;
    completedWeeks?: number[];
    intensity?: number;
    todaysTasks?: string[];
    weeklyTasks?: string[];
  };
  boekenkamer: {
    total: number;
    completedToday: number;
    progress: number;
    totalBooks?: number;
    readBooks?: number;
  };
  finance: {
    netWorth: number;
    monthlyIncome: number;
    savings: number;
    investments: number;
    progress: number;
    hasProfile?: boolean;
  };
  brotherhood: {
    totalMembers: number;
    activeMembers: number;
    communityScore: number;
    progress: number;
  };
  academy: {
    totalCourses: number;
    completedCourses: number;
    learningProgress: number;
    progress: number;
  };
  xp: {
    total: number;
    rank: any;
    level: number;
    nextLevelRequirements: {
      xpNeeded: number;
      badgesNeeded: number;
      challengesNeeded: number;
      academyModulesNeeded: number;
    };
  };
  summary: {
    totalProgress: number;
  };
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true); // RE-ENABLED WITH LOADING MODAL
  const [fadeIn, setFadeIn] = useState(false);
  const [userBadges, setUserBadges] = useState<Array<{
    id: string;
    title: string;
    description: string;
    icon_name: string;
    image_url?: string;
    rarity_level: 'common' | 'rare' | 'epic' | 'legendary';
    xp_reward: number;
    unlocked_at?: string;
  }>>([]);
  const [activityLog, setActivityLog] = useState<Array<{
    id: string;
    type: 'mission' | 'badge' | 'lesson';
    title: string;
    description: string;
    xp_reward: number;
    date: string;
    category: string;
    icon: string;
  }>>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [hasMoreActivities, setHasMoreActivities] = useState(false);
  const [activityOffset, setActivityOffset] = useState(0);
  const [activeNutritionPlan, setActiveNutritionPlan] = useState<{ id: string; title: string } | null>(null);

  

  const { 
    user, 
    profile, 
    isLoading: authLoading, 
    onboarding,
    isAdmin, 
    hasTrainingAccess, 
    hasNutritionAccess, 
    isBasic,
    getRedirectPath
  } = useAuth();
  const router = useRouter();
  
  // Fallback redirect if onboarding context fails to load
  const [fallbackRedirectAttempted, setFallbackRedirectAttempted] = useState(false);
  
  // Ref to prevent multiple redirects
  const dashboardRedirectExecuted = useRef(false);

  useEffect(() => {
    if (!user || !user.email || authLoading) return;
    
    console.log(`🔍 Dashboard Redirect Check: user=${user.email}, onboarding=${JSON.stringify(onboarding)}, authLoading=${authLoading}`);
    
    // If onboarding not completed, handle routing for steps >= 3 (modal only covers 1-2)
    if (onboarding && !onboarding.isCompleted) {
      const step = onboarding.currentStep;
      if (step >= 3 && !dashboardRedirectExecuted.current) {
        dashboardRedirectExecuted.current = true;
        let target;
        switch (step) {
          case 3:
            target = '/dashboard/mijn-challenges';
            break;
          case 4:
            target = hasTrainingAccess ? '/dashboard/trainingsschemas' : '/dashboard/voedingsplannen-v2';
            break;
          case 5:
            target = '/dashboard/voedingsplannen-v2';
            break;
          case 6:
            // Premium onboarding final step: direct to introductions thread in the forum
            target = '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden';
            break;
          default:
            return;
        }
        console.log(`➡️ Redirecting for step ${step} to`, target);
        router.push(target);
        return;
      }
      // For steps 1-2, modal will handle UI; avoid redirect here
      console.log(`🔄 Dashboard: User on step ${onboarding.currentStep}, isCompleted: ${onboarding.isCompleted}`);
      console.log(`✅ Onboarding modal will be shown on dashboard (if step <= 2)`);
      return;
    }
    console.log(`✅ Onboarding completed or not active, staying on dashboard`);
  }, [user, onboarding, router, authLoading, getRedirectPath, hasTrainingAccess]);
  
  // ✅ PHASE 2.1: Simplified fallback - no redirects needed, onboarding modal handles flow
  useEffect(() => {
    if (!user || !user.email || authLoading || fallbackRedirectAttempted) return;
    
    // Fallback onboarding status fetch if context is undefined
    // If onboarding context hasn't loaded shortly, try direct API call for context
    const timeout = setTimeout(async () => {
      if (onboarding === undefined) {
        console.log('🔄 Fallback: Onboarding context not loaded, trying direct API call...');
        setFallbackRedirectAttempted(true);
        
        try {
          const response = await fetch(`/api/onboarding-v2?email=${encodeURIComponent(user.email || '')}`);
          const data = await response.json();
          
          if (data.success && !data.onboarding.isCompleted && data.onboarding.currentStep !== null) {
            console.log(`🔄 Fallback: Onboarding modal will handle step ${data.onboarding.currentStep}`);
            // No redirect needed - onboarding modal will handle the flow
          }
        } catch (error) {
          console.error('❌ Fallback onboarding check failed:', error);
        }
      }
    }, 200);
    
    return () => clearTimeout(timeout);
  }, [user, authLoading, onboarding, fallbackRedirectAttempted]);

  // 2.0.1: Fetch real dashboard data from database - FIXED INFINITE LOOP + DEBOUNCED
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        // If no user after auth loading is complete, show fallback
        if (!authLoading) {
          setLoading(false);
        }
        return;
      }

      // Always set loading to false if no user, regardless of authLoading state
      if (!user) {
        setLoading(false);
        return;
      }

      // If onboarding is in progress (any step while not completed), skip heavy dashboard load entirely
      if (onboarding && !onboarding.isCompleted) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true); // RE-ENABLED WITH LOADING MODAL
        
        const response = await fetch(`/api/dashboard-stats`, {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          body: JSON.stringify({
            userId: user.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setUserBadges(data.userBadges || []);
          
          // Check for onboarding completion badge unlock
          if (data.stats && onboarding?.isCompleted && (data.userBadges || []).length === 0) {
            await checkOnboardingCompletionBadge(user.id);
          }
        } else {
          console.error('Failed to fetch dashboard stats');
          // Set minimal fallback data (not mock, just empty)
          setStats({
            missions: { total: 0, completedToday: 0, completedThisWeek: 0, progress: 0 },
            challenges: { total: 0, completedToday: 0, completedThisWeek: 0, progress: 0 },
            training: { hasActiveSchema: false, currentDay: 0, totalDays: 0, weeklySessions: 0, progress: 0, schemaName: undefined, completedDaysThisWeek: 0, currentWeek: 0, totalWeeks: 8 },
            mindFocus: { total: 0, completedToday: 0, progress: 0, hasProfile: false, stressLevel: 0, personalGoals: [], currentStreak: 0, currentWeek: 1, completedWeeks: [], intensity: 3, todaysTasks: [], weeklyTasks: [] },
            boekenkamer: { total: 0, completedToday: 0, progress: 0, totalBooks: 0, readBooks: 0 },
            finance: { netWorth: 0, monthlyIncome: 0, savings: 0, investments: 0, progress: 0, hasProfile: false },
            brotherhood: { totalMembers: 0, activeMembers: 0, communityScore: 0, progress: 0 },
            academy: { totalCourses: 0, completedCourses: 0, learningProgress: 0, progress: 0 },
            xp: { 
              total: 0, 
              rank: null, 
              level: 1,
              nextLevelRequirements: {
                xpNeeded: 100,
                badgesNeeded: 1,
                challengesNeeded: 5,
                academyModulesNeeded: 1
              }
            },
            summary: { totalProgress: 0 }
          });
          setUserBadges([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set minimal fallback data (not mock, just empty)
        setStats({
          missions: { total: 0, completedToday: 0, completedThisWeek: 0, progress: 0 },
          challenges: { total: 0, completedToday: 0, completedThisWeek: 0, progress: 0 },
          training: { hasActiveSchema: false, currentDay: 0, totalDays: 0, weeklySessions: 0, progress: 0, schemaName: undefined, completedDaysThisWeek: 0, currentWeek: 0, totalWeeks: 8 },
          mindFocus: { total: 0, completedToday: 0, progress: 0, hasProfile: false, stressLevel: 0, personalGoals: [], currentStreak: 0, currentWeek: 1, completedWeeks: [], intensity: 3, todaysTasks: [], weeklyTasks: [] },
          boekenkamer: { total: 0, completedToday: 0, progress: 0, totalBooks: 0, readBooks: 0 },
          finance: { netWorth: 0, monthlyIncome: 0, savings: 0, investments: 0, progress: 0, hasProfile: false },
          brotherhood: { totalMembers: 0, activeMembers: 0, communityScore: 0, progress: 0 },
                      academy: { totalCourses: 0, completedCourses: 0, learningProgress: 0, progress: 0 },
          xp: { 
            total: 0, 
            rank: null, 
            level: 1,
            nextLevelRequirements: {
              xpNeeded: 100,
              badgesNeeded: 1,
              challengesNeeded: 5,
              academyModulesNeeded: 1
            }
          },
          summary: { totalProgress: 0 }
        });
        setUserBadges([]);
      } finally {
        setLoading(false); // RE-ENABLED WITH LOADING MODAL
      }
    };

    // OPTIMIZED: Debounce the API call to prevent excessive requests
    const timeoutId = setTimeout(() => {
      fetchDashboardData();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [user?.id, authLoading, onboarding?.isCompleted, onboarding?.currentStep]); // Added onboarding dependencies

  // Check for onboarding completion badge unlock
  const checkOnboardingCompletionBadge = async (userId: string) => {
    try {
      const response = await fetch('/api/badges/check-onboarding-completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (response.ok && data.unlocked) {
        // Refresh badges to show the newly unlocked badge
        const badgesResponse = await fetch(`/api/dashboard-stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        });

        if (badgesResponse.ok) {
          const badgesData = await badgesResponse.json();
          setUserBadges(badgesData.userBadges || []);
        }
      }
    } catch (error) {
      console.error('Error checking onboarding completion badge:', error);
    }
  };

  // Fetch activity log
  const fetchActivityLog = async (offset = 0, append = false) => {
    if (!user?.id) return;
    
    try {
      setActivityLoading(true);
      const response = await fetch(`/api/activity-log?userId=${user.id}&limit=10&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity log');
      }
      const data = await response.json();
      
      if (append) {
        setActivityLog(prev => [...prev, ...data.activities]);
      } else {
        setActivityLog(data.activities);
      }
      setHasMoreActivities(data.hasMore);
      setActivityOffset(offset + data.activities.length);
    } catch (error) {
      console.error('Error fetching activity log:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const loadMoreActivities = () => {
    fetchActivityLog(activityOffset, true);
  };

  // Fetch activity log when user is available
  useEffect(() => {
    if (user?.id) {
      fetchActivityLog(0, false);
    }
  }, [user?.id]);

  // Fetch active nutrition plan (resolve ID to title)
  useEffect(() => {
    const fetchActivePlan = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/nutrition-plan-active?userId=${user.id}`, { cache: 'no-cache' });
        if (!res.ok) { setActiveNutritionPlan(null); return; }
        const data = await res.json();
        if (data?.success && data?.hasActivePlan && data?.activePlanId) {
          const activeId = data.activePlanId as string;
          // Resolve title via dedicated endpoint
          try {
            const planRes = await fetch(`/api/nutrition-plan-by-id?planId=${encodeURIComponent(activeId)}`, { cache: 'no-cache' });
            if (planRes.ok) {
              const planData = await planRes.json();
              if (planData?.success && planData?.plan) {
                setActiveNutritionPlan({ id: activeId, title: planData.plan.name || 'Voedingsplan' });
                return;
              }
            }
          } catch {}
          // Fallback: show the ID if no plan found
          setActiveNutritionPlan({ id: activeId, title: 'Voedingsplan' });
        } else {
          setActiveNutritionPlan(null);
        }
      } catch {
        setActiveNutritionPlan(null);
      }
    };
    fetchActivePlan();
  }, [user?.id]);

  // Simple fade in effect - only on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      const timer = setTimeout(() => setFadeIn(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Suppress any dashboard UI until onboarding decision is made
  if (!authLoading && user && onboarding === undefined) {
    return null;
  }

  // Allow dashboard rendering during onboarding - modal will handle the flow

  // Show loading modal while data is being fetched, but NEVER during onboarding flow
  const isOnboardingActive = Boolean(onboarding && !onboarding.isCompleted);
  if ((loading || authLoading) && !isOnboardingActive) {
    return (
      <DashboardLoadingModal 
        isOpen={loading || authLoading} 
        message="Jouw persoonlijke dashboard wordt geladen..."
      />
    );
  }

  // Show fallback if no user is logged in
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1411] via-[#181F17] to-[#232D1A] flex items-center justify-center">
        <div className="bg-[#232D1A] p-8 rounded-lg border border-[#3A4D23] max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Dashboard
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-300 text-center">
              Je bent niet ingelogd. Log in om je dashboard te bekijken.
            </p>
            
            <div className="space-y-3">
              <a 
                href="/test-login"
                className="w-full bg-[#8BAE5A] text-[#232D1A] font-semibold py-3 px-4 rounded-lg hover:bg-[#7A9D4A] transition-colors block text-center"
              >
                Test Login (Localhost)
              </a>
              
              <a 
                href="/login"
                className="w-full bg-[#3A4D23] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#4A5D33] transition-colors block text-center"
              >
                Normale Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0F1411] via-[#181F17] to-[#232D1A] transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'} overflow-x-hidden`}>
      <ClientLayout>
        {/* Onboarding Modal */}
        <OnboardingV2Modal 
          isOpen={Boolean(onboarding && !onboarding.isCompleted && onboarding.currentStep !== null && onboarding.currentStep <= 2)}
        />
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tight mb-2 text-white leading-tight">
                {getGreeting()},<br />
                <span className="text-[#8BAE5A] break-words">{profile?.full_name || 'Gebruiker'}</span>!
              </h1>
              <p className="text-white text-sm sm:text-lg my-2 sm:my-4">Jouw persoonlijke Top Tier Men dashboard</p>
            </div>
            {/* Inbox icon in header */}
            <div className="pt-1">
              <InboxIcon />
            </div>
          </div>

          {/* Badges Display */}
          <div className="mb-6 sm:mb-8">
            <BadgeDisplay 
              badges={userBadges}
              maxDisplay={6}
              showTitle={true}
              size="md"
              loading={loading}
            />
          </div>


          {/* Dashboard Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fade-in-up">
            {/* Mijn Challenges */}
            <Link href="/dashboard/mijn-challenges" className={`border rounded-xl p-4 sm:p-6 text-left transition-transform duration-300 cursor-pointer block ${
              stats?.challenges.completedToday === stats?.challenges.total && (stats?.challenges.total || 0) > 0
                ? 'bg-[#3A4D23] border-[#8BAE5A] shadow-2xl shadow-[#8BAE5A]/20 hover:scale-105 hover:shadow-[#8BAE5A]/40'
                : 'bg-gradient-to-br from-[#181F17] to-[#232D1A] border-[#3A4D23]/30 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50'
            }`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Mijn Challenges</h3>
                <span className={`text-xl sm:text-2xl ${
                  stats?.challenges.completedToday === stats?.challenges.total && (stats?.challenges.total || 0) > 0
                    ? 'text-[#FFD700]'
                    : 'text-[#8BAE5A]'
                }`}>
                  {stats?.challenges.completedToday === stats?.challenges.total && (stats?.challenges.total || 0) > 0 ? (
                    <TrophyIcon className="w-6 h-6" />
                  ) : (
                    <CheckCircleIcon className="w-6 h-6" />
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#FFD700]">{stats?.challenges.completedToday || 0}/{stats?.challenges.total || 0}</span>
                <span className={`text-sm sm:text-base ${
                  stats?.challenges.completedToday === stats?.challenges.total && (stats?.challenges.total || 0) > 0
                    ? 'text-[#FFD700] font-bold'
                    : 'text-[#8BAE5A]'
                }`}>
                  {stats?.challenges.completedToday === stats?.challenges.total && (stats?.challenges.total || 0) > 0 ? 'VOLBRACHT!' : 'volbracht'}
                </span>
              </div>
              <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                <div 
                  className={`h-2 rounded-full transition-all duration-700 ${
                    stats?.challenges.completedToday === stats?.challenges.total && (stats?.challenges.total || 0) > 0
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#f0a14f]'
                      : 'bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f]'
                  }`}
                  style={{ width: `${stats?.challenges.progress || 0}%` }}
                ></div>
              </div>
              <div className={`text-xs mt-2 ${
                stats?.challenges.completedToday === stats?.challenges.total && (stats?.challenges.total || 0) > 0
                  ? 'text-[#FFD700] font-semibold'
                  : 'text-gray-400'
              }`}>
                {stats?.challenges.completedToday === stats?.challenges.total && (stats?.challenges.total || 0) > 0 
                  ? '🎉 Perfecte dag behaald!' 
                  : `${stats?.challenges.completedToday || 0} vandaag`
                }
              </div>
            </Link>

            {/* Voedingsplan */}
            <Link href={activeNutritionPlan ? `/dashboard/voedingsplannen-v2/${activeNutritionPlan.id}` : "/dashboard/voedingsplannen-v2"} className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-left transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Voedingsplan</h3>
                <span className="text-[#8BAE5A] text-sm sm:text-base">{activeNutritionPlan ? 'Geselecteerd' : 'Geen selectie'}</span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {activeNutritionPlan ? (
                  <div className="text-white font-semibold text-sm sm:text-base truncate">
                    {activeNutritionPlan.title}
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-gray-400">
                    Je hebt nog geen voedingsplan geselecteerd. Klik om een plan te kiezen.
                  </div>
                )}
                <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                  <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" style={{ width: activeNutritionPlan ? '60%' : '0%' }} />
                </div>
              </div>
            </Link>


            {/* Mijn Trainingen */}
            <Link href="/dashboard/mijn-trainingen" className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-left transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Mijn Trainingen</h3>
                <DumbbellIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                {/* Schema naam */}
                {stats?.training.schemaName && (
                  <div className="text-left">
                    <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Actief schema:</div>
                    <div className="text-white font-semibold text-sm sm:text-base truncate">
                      {stats.training.schemaName}
                    </div>
                  </div>
                )}
                
                {/* Week progressie */}
                {stats?.training.currentWeek && stats?.training.totalWeeks && (
                  <div className="text-left">
                    <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Week:</div>
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {stats.training.currentWeek}/{stats.training.totalWeeks}
                    </div>
                  </div>
                )}
                
                {/* Dagen deze week */}
                {stats?.training.completedDaysThisWeek !== undefined && stats?.training.weeklySessions && (
                  <div className="text-left">
                    <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Dagen deze week:</div>
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {stats.training.completedDaysThisWeek}/{stats.training.weeklySessions}
                    </div>
                  </div>
                )}
                
                {/* Fallback voor oude data */}
                {!stats?.training.schemaName && (
                  <div>
                    <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Schema status:</div>
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {stats?.training.hasActiveSchema ? 'Actief' : 'Geen schema'}
                    </div>
                  </div>
                )}
                
                <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                    style={{ width: `${stats?.training.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </Link>

            {/* Mind & Focus */}
            <Link href="/dashboard/mind-focus" className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-left transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Mind & Focus</h3>
                <BrainIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              
              {/* Geen profiel - Start intake */}
              {!stats?.mindFocus.hasProfile && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="text-left">
                    <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Status:</div>
                    <div className="text-white font-semibold text-sm sm:text-base">Start intake</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Maak je persoonlijke stress management profiel
                  </div>
                </div>
              )}
              
              {/* Wel profiel - Toon actuele data */}
              {stats?.mindFocus.hasProfile && (
                <div className="space-y-2 sm:space-y-3">
                  {/* Huidige week */}
                  {stats.mindFocus.currentWeek && (
                    <div className="text-left">
                      <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Huidige week:</div>
                      <div className="text-white font-semibold text-sm sm:text-base">
                        Week {stats.mindFocus.currentWeek}
                        {stats.mindFocus.completedWeeks && stats.mindFocus.completedWeeks.includes(stats.mindFocus.currentWeek) && (
                          <span className="ml-2 text-green-400 text-xs">✅ Voltooid</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Stress level */}
                  {stats.mindFocus.stressLevel !== undefined && (
                    <div className="text-left">
                      <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Huidige stress:</div>
                      <div className="text-white font-semibold text-sm sm:text-base">
                        {stats.mindFocus.stressLevel}/10
                      </div>
                    </div>
                  )}
                  
                  {/* Intensiteit */}
                  {stats.mindFocus.intensity && (
                    <div className="text-left">
                      <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Intensiteit:</div>
                      <div className="text-white font-semibold text-sm sm:text-base">
                        {stats.mindFocus.intensity} {stats.mindFocus.intensity === 1 ? 'dag' : 'dagen'}/week
                      </div>
                    </div>
                  )}
                  
                  {/* Vandaag's taken */}
                  {stats.mindFocus.todaysTasks && stats.mindFocus.todaysTasks.length > 0 && (
                    <div className="text-left">
                      <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Vandaag:</div>
                      <div className="text-white font-semibold text-sm sm:text-base">
                        {stats.mindFocus.todaysTasks.length} {stats.mindFocus.todaysTasks.length === 1 ? 'taak' : 'taken'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {stats.mindFocus.todaysTasks.slice(0, 2).join(', ')}
                        {stats.mindFocus.todaysTasks.length > 2 && '...'}
                      </div>
                    </div>
                  )}
                  
                  {/* Streak */}
                  {stats.mindFocus.currentStreak && stats.mindFocus.currentStreak > 0 && (
                    <div className="text-left">
                      <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Streak:</div>
                      <div className="text-white font-semibold text-sm sm:text-base">
                        {stats.mindFocus.currentStreak} dagen
                      </div>
                    </div>
                  )}
                  
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                    <div 
                      className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                      style={{ width: `${stats?.mindFocus.progress || 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {stats.mindFocus.completedWeeks && stats.mindFocus.completedWeeks.length > 0 
                      ? `${stats.mindFocus.completedWeeks.length} week${stats.mindFocus.completedWeeks.length === 1 ? '' : 's'} voltooid`
                      : 'Meditatie & Focus'
                    }
                  </div>
                </div>
              )}
            </Link>

            {/* Boekenkamer */}
            <Link href="/dashboard/boekenkamer" className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-left transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Boekenkamer</h3>
                <BookOpenIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              
              {/* Toon gelezen boeken vs totaal beschikbare boeken */}
              <div className="space-y-2 sm:space-y-3">
                <div className="text-left">
                  <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Boeken gelezen:</div>
                  <div className="text-white font-semibold text-sm sm:text-base">
                    {stats?.boekenkamer.readBooks || 0}/{stats?.boekenkamer.totalBooks || 0}
                  </div>
                </div>
                
                {/* Vandaag voltooid */}
                {stats?.boekenkamer.completedToday && stats.boekenkamer.completedToday > 0 && (
                  <div className="text-left">
                    <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Vandaag:</div>
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {stats.boekenkamer.completedToday} voltooid
                    </div>
                  </div>
                )}
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                    style={{ width: `${stats?.boekenkamer.progress || 0}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-400">
                  Lezen & Kennis
                </div>
              </div>
            </Link>

            {/* Finance & Business */}
            <Link href="/dashboard/finance-en-business" className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-left transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Finance & Business</h3>
                <CurrencyDollarIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              {stats?.finance?.hasProfile ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl sm:text-3xl font-bold text-[#FFD700]">€{stats?.finance?.netWorth?.toLocaleString() || '0'}</span>
                    <span className="text-[#8BAE5A] text-sm sm:text-base">Netto Waarde</span>
                  </div>
                  <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                    <div 
                      className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                      style={{ width: `${stats?.finance?.progress || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Financiële Groei
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left py-4">
                    <div className="text-lg sm:text-xl font-bold text-[#8BAE5A] mb-2">Start Profiel</div>
                    <div className="text-xs text-gray-400">Maak je financiële profiel aan</div>
                  </div>
                </>
              )}
            </Link>

            {/* Brotherhood */}
            <Link href="/dashboard/brotherhood" className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-left transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Brotherhood</h3>
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">B</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#FFD700]">{stats?.brotherhood?.totalMembers || 0}</span>
                <span className="text-[#8BAE5A] text-sm sm:text-base">broeders</span>
              </div>
              <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                  style={{ width: `${stats?.brotherhood?.progress || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Community & Support
              </div>
            </Link>

            {/* Academy */}
            <Link href="/dashboard/academy" className={`border rounded-xl p-4 sm:p-6 text-left transition-transform duration-300 cursor-pointer block ${
              stats?.academy?.completedCourses === stats?.academy?.totalCourses && (stats?.academy?.totalCourses || 0) > 0
                ? 'bg-[#3A4D23] border-[#8BAE5A] shadow-2xl shadow-[#8BAE5A]/20 hover:scale-105 hover:shadow-[#8BAE5A]/40'
                : 'bg-gradient-to-br from-[#181F17] to-[#232D1A] border-[#3A4D23]/30 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50'
            }`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Academy</h3>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  stats?.academy?.completedCourses === stats?.academy?.totalCourses && (stats?.academy?.totalCourses || 0) > 0
                    ? 'bg-[#FFD700]'
                    : 'bg-[#8BAE5A]'
                }`}>
                  <span className="text-white text-xs font-bold">A</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-2xl sm:text-3xl font-bold ${
                  stats?.academy?.completedCourses === stats?.academy?.totalCourses && (stats?.academy?.totalCourses || 0) > 0
                    ? 'text-[#FFD700]'
                    : 'text-[#FFD700]'
                }`}>
                  {stats?.academy?.completedCourses || 0}/{stats?.academy?.totalCourses || 0}
                </span>
                <span className={`text-sm sm:text-base ${
                  stats?.academy?.completedCourses === stats?.academy?.totalCourses && (stats?.academy?.totalCourses || 0) > 0
                    ? 'text-[#FFD700] font-bold'
                    : 'text-[#8BAE5A]'
                }`}>
                  {stats?.academy?.completedCourses === stats?.academy?.totalCourses && (stats?.academy?.totalCourses || 0) > 0 ? 'VOLBRACHT!' : 'cursussen'}
                </span>
              </div>
              <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                <div 
                  className={`h-2 rounded-full transition-all duration-700 ${
                    stats?.academy?.completedCourses === stats?.academy?.totalCourses && (stats?.academy?.totalCourses || 0) > 0
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#f0a14f]'
                      : 'bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f]'
                  }`}
                  style={{ width: `${stats?.academy?.progress || 0}%` }}
                ></div>
              </div>
              <div className={`text-xs mt-2 ${
                stats?.academy?.completedCourses === stats?.academy?.totalCourses && (stats?.academy?.totalCourses || 0) > 0
                  ? 'text-[#FFD700] font-semibold'
                  : 'text-gray-400'
              }`}>
                {stats?.academy?.completedCourses === stats?.academy?.totalCourses && (stats?.academy?.totalCourses || 0) > 0 
                  ? '🎉 Academy voltooid!' 
                  : 'Kennis & Vaardigheden'
                }
              </div>
            </Link>
          </div>

          {/* XP Progress */}
          {stats?.xp && (
            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">XP Progressie</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#FFD700]">{stats.xp.total}</div>
                  <div className="text-sm text-[#8BAE5A]">Totaal XP</div>
                </div>
              </div>
              <div className="w-full h-3 bg-[#3A4D23]/40 rounded-full">
                <div 
                  className="h-3 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                  style={{ width: `${(stats.xp.total % 100) / 1}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>Level {stats.xp.level}</span>
                <span>Level {stats.xp.level + 1}</span>
              </div>
              
              {/* Level Requirements */}
              {stats.xp.nextLevelRequirements && (
                <div className="mt-6 pt-4 border-t border-[#3A4D23]/30">
                  <h4 className="text-lg font-semibold text-white mb-3">Vereisten voor Level {stats.xp.level + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-[#2A3317]/50 rounded-lg border border-[#3A4D23]/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#FFD700] rounded-full"></div>
                        <span className="text-sm text-[#8BAE5A]">XP Nodig</span>
                      </div>
                      <span className="text-sm font-semibold text-[#FFD700]">{stats.xp.nextLevelRequirements.xpNeeded}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-[#2A3317]/50 rounded-lg border border-[#3A4D23]/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                        <span className="text-sm text-[#8BAE5A]">Badges Nodig</span>
                      </div>
                      <span className="text-sm font-semibold text-[#8BAE5A]">{stats.xp.nextLevelRequirements.badgesNeeded}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-[#2A3317]/50 rounded-lg border border-[#3A4D23]/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#f0a14f] rounded-full"></div>
                        <span className="text-sm text-[#8BAE5A]">Challenges Nodig</span>
                      </div>
                      <span className="text-sm font-semibold text-[#f0a14f]">{stats.xp.nextLevelRequirements.challengesNeeded}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-[#2A3317]/50 rounded-lg border border-[#3A4D23]/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#B6C948] rounded-full"></div>
                        <span className="text-sm text-[#8BAE5A]">Academy Modules</span>
                      </div>
                      <span className="text-sm font-semibold text-[#B6C948]">{stats.xp.nextLevelRequirements.academyModulesNeeded}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Log Section */}
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">📊 Recente Activiteiten</h3>
              <div className="text-sm text-[#8BAE5A]">
                {activityLog.length} activiteiten
              </div>
            </div>
            
            {activityLog.length > 0 ? (
              <div className="space-y-3">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-[#2A3317]/50 rounded-lg border border-[#3A4D23]/20 hover:bg-[#2A3317]/70 transition-colors">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white text-sm">{activity.title}</h4>
                        <span className="px-2 py-1 bg-[#3A4D23] text-[#8BAE5A] text-xs rounded-full">
                          {activity.category}
                        </span>
                      </div>
                      <p className="text-[#8BAE5A] text-xs mb-1">{activity.description}</p>
                      <div className="text-xs text-gray-400">
                        {new Date(activity.date).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#FFD700]">+{activity.xp_reward}</div>
                      <div className="text-xs text-[#8BAE5A]">XP</div>
                    </div>
                  </div>
                ))}
                
                {hasMoreActivities && (
                  <div className="text-center pt-4">
                    <button
                      onClick={loadMoreActivities}
                      disabled={activityLoading}
                      className="px-6 py-2 bg-[#8BAE5A] hover:bg-[#7A9D4A] disabled:bg-[#3A4D23] disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      {activityLoading ? 'Laden...' : 'Laad meer activiteiten'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="text-lg font-semibold text-white mb-2">Nog geen activiteiten</h4>
                <p className="text-[#8BAE5A] text-sm">
                  Voltooi challenges, behaal badges of volg academy lessen om je activiteiten hier te zien!
                </p>
              </div>
            )}
          </div>

        </div>
      </ClientLayout>
    </div>
  );
}