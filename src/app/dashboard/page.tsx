'use client';
import { useEffect, useState } from 'react';
import ClientLayout from '../components/ClientLayout';
import { CheckCircleIcon, TrophyIcon, FireIcon, BookOpenIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { BeakerIcon as DumbbellIcon, LightBulbIcon as BrainIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import BadgeDisplay from '@/components/BadgeDisplay';
import UserTasksWidget from '@/components/UserTasksWidget';
import { useAuth } from '@/auth-systems/optimal/useAuth';


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
    active: number;
    completed: number;
    totalDays: number;
    progress: number;
  };
  training: {
    hasActiveSchema: boolean;
    currentDay: number;
    totalDays: number;
    weeklySessions: number;
    progress: number;
  };
  mindFocus: {
    total: number;
    completedToday: number;
    progress: number;
  };
  boekenkamer: {
    total: number;
    completedToday: number;
    progress: number;
  };
  finance: {
    netWorth: number;
    monthlyIncome: number;
    savings: number;
    investments: number;
    progress: number;
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
  const [loading, setLoading] = useState(false); // DISABLED TO FIX FLICKERING
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

  const { user, profile } = useAuth();

  // 2.0.1: Fetch real dashboard data from database
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        // setLoading(true); // DISABLED TO FIX FLICKERING
        
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
        } else {
          console.error('Failed to fetch dashboard stats');
          // Set minimal fallback data (not mock, just empty)
          setStats({
            missions: { total: 0, completedToday: 0, completedThisWeek: 0, progress: 0 },
            challenges: { active: 0, completed: 0, totalDays: 0, progress: 0 },
            training: { hasActiveSchema: false, currentDay: 0, totalDays: 0, weeklySessions: 0, progress: 0 },
            mindFocus: { total: 0, completedToday: 0, progress: 0 },
            boekenkamer: { total: 0, completedToday: 0, progress: 0 },
            finance: { netWorth: 0, monthlyIncome: 0, savings: 0, investments: 0, progress: 0 },
            brotherhood: { totalMembers: 0, activeMembers: 0, communityScore: 0, progress: 0 },
            academy: { totalCourses: 0, completedCourses: 0, learningProgress: 0, progress: 0 },
            xp: { total: 0, rank: null, level: 1 },
            summary: { totalProgress: 0 }
          });
          setUserBadges([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set minimal fallback data (not mock, just empty)
        setStats({
          missions: { total: 0, completedToday: 0, completedThisWeek: 0, progress: 0 },
          challenges: { active: 0, completed: 0, totalDays: 0, progress: 0 },
          training: { hasActiveSchema: false, currentDay: 0, totalDays: 0, weeklySessions: 0, progress: 0 },
          mindFocus: { total: 0, completedToday: 0, progress: 0 },
          boekenkamer: { total: 0, completedToday: 0, progress: 0 },
          finance: { netWorth: 0, monthlyIncome: 0, savings: 0, investments: 0, progress: 0 },
          brotherhood: { totalMembers: 0, activeMembers: 0, communityScore: 0, progress: 0 },
                      academy: { totalCourses: 0, completedCourses: 0, learningProgress: 0, progress: 0 },
          xp: { total: 0, rank: null, level: 1 },
          summary: { totalProgress: 0 }
        });
        setUserBadges([]);
      } finally {
        // setLoading(false); // DISABLED TO FIX FLICKERING
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  // Simple fade in effect
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setFadeIn(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-[#0F1411] via-[#181F17] to-[#232D1A] flex items-center justify-center">
  //       <ClientLayout>
  //         <div className="text-center w-full">
  //           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A] mx-auto"></div>
  //           <p className="text-white mt-4 text-lg">Dashboard laden...</p>
  //         </div>
  //       </ClientLayout>
  //     </div>
  //   );
  // }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0F1411] via-[#181F17] to-[#232D1A] transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <ClientLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tight mb-2 text-white leading-tight">
              {getGreeting()},<br />
              <span className="text-[#8BAE5A] break-words">{profile?.full_name || 'Gebruiker'}</span>!
            </h1>
            <p className="text-white text-sm sm:text-lg my-2 sm:my-4">Jouw persoonlijke Top Tier Men dashboard</p>
          </div>

          {/* Badges Display */}
          <div className="mb-6 sm:mb-8">
            <BadgeDisplay 
              badges={userBadges}
              maxDisplay={6}
              showTitle={true}
              size="md"
            />
          </div>

          {/* User Tasks Widget */}
          <div className="mb-6 sm:mb-8">
            <UserTasksWidget userName={profile?.full_name || ''} />
          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fade-in-up">
            {/* Mijn Missies */}
            <Link href="/dashboard/mijn-missies" className={`bg-gradient-to-br from-[#181F17] to-[#232D1A] border rounded-xl p-4 sm:p-6 text-center transition-transform duration-300 cursor-pointer block ${
              stats?.missions.completedToday === stats?.missions.total && (stats?.missions.total || 0) > 0
                ? 'border-[#8BAE5A] shadow-2xl shadow-[#8BAE5A]/20 hover:scale-105 hover:shadow-[#8BAE5A]/40'
                : 'border-[#3A4D23]/30 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50'
            }`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Mijn Missies</h3>
                <span className={`text-xl sm:text-2xl ${
                  stats?.missions.completedToday === stats?.missions.total && (stats?.missions.total || 0) > 0
                    ? 'text-[#FFD700]'
                    : 'text-[#8BAE5A]'
                }`}>
                  {stats?.missions.completedToday === stats?.missions.total && (stats?.missions.total || 0) > 0 ? (
                    <TrophyIcon className="w-6 h-6" />
                  ) : (
                    <CheckCircleIcon className="w-6 h-6" />
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#FFD700]">{stats?.missions.completedToday || 0}/{stats?.missions.total || 0}</span>
                <span className={`text-sm sm:text-base ${
                  stats?.missions.completedToday === stats?.missions.total && (stats?.missions.total || 0) > 0
                    ? 'text-[#FFD700] font-bold'
                    : 'text-[#8BAE5A]'
                }`}>
                  {stats?.missions.completedToday === stats?.missions.total && (stats?.missions.total || 0) > 0 ? 'VOLBRACHT!' : 'volbracht'}
                </span>
              </div>
              <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                <div 
                  className={`h-2 rounded-full transition-all duration-700 ${
                    stats?.missions.completedToday === stats?.missions.total && (stats?.missions.total || 0) > 0
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#f0a14f]'
                      : 'bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f]'
                  }`}
                  style={{ width: `${stats?.missions.progress || 0}%` }}
                ></div>
              </div>
              <div className={`text-xs mt-2 ${
                stats?.missions.completedToday === stats?.missions.total && (stats?.missions.total || 0) > 0
                  ? 'text-[#FFD700] font-semibold'
                  : 'text-gray-400'
              }`}>
                {stats?.missions.completedToday === stats?.missions.total && (stats?.missions.total || 0) > 0 
                  ? '🎉 Perfecte dag behaald!' 
                  : `${stats?.missions.completedToday || 0} vandaag`
                }
              </div>
            </Link>

            {/* Challenges */}
            <Link href="/dashboard/challenges" className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Challenges</h3>
                <FireIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#FFD700]">{stats?.challenges.active || 0}</span>
                <span className="text-[#8BAE5A] text-sm sm:text-base">actief</span>
              </div>
              <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                  style={{ width: `${stats?.challenges.progress || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {stats?.challenges.totalDays || 0} dagen voltooid
              </div>
            </Link>

            {/* Mijn Trainingen */}
            <Link href="/dashboard/mijn-trainingen" className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Mijn Trainingen</h3>
                <DumbbellIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <div className="text-xs sm:text-sm text-[#8BAE5A] mb-1">Schema status:</div>
                  <div className="text-white font-semibold text-sm sm:text-base">
                    {stats?.training.hasActiveSchema ? 'Actief' : 'Geen schema'}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-3">
                  <span className="text-xl sm:text-2xl font-bold text-[#FFD700]">{stats?.training.weeklySessions || 0}</span>
                  <span className="text-[#8BAE5A] text-sm sm:text-base">trainingen/week</span>
                </div>
                <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                    style={{ width: `${stats?.training.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </Link>

            {/* Mind & Focus */}
            <Link href="/dashboard/mind-en-focus" className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Mind & Focus</h3>
                <BrainIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#FFD700]">{stats?.mindFocus.completedToday || 0}/{stats?.mindFocus.total || 0}</span>
                <span className="text-[#8BAE5A] text-sm sm:text-base">volbracht</span>
              </div>
              <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                  style={{ width: `${stats?.mindFocus.progress || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Meditatie & Focus
              </div>
            </Link>

            {/* Boekenkamer */}
            <Link href="/dashboard/boekenkamer" className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Boekenkamer</h3>
                <BookOpenIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#FFD700]">{stats?.boekenkamer.completedToday || 0}/{stats?.boekenkamer.total || 0}</span>
                <span className="text-[#8BAE5A] text-sm sm:text-base">volbracht</span>
              </div>
              <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                  style={{ width: `${stats?.boekenkamer.progress || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Lezen & Kennis
              </div>
            </Link>

            {/* Finance & Business */}
            <Link href="/dashboard/finance-en-business" className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Finance & Business</h3>
                <CurrencyDollarIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
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
            </Link>

            {/* Brotherhood */}
            <Link href="/dashboard/brotherhood" className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
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
            <Link href="/dashboard/academy" className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50 cursor-pointer block">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Academy</h3>
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#FFD700]">{stats?.academy?.completedCourses || 0}/{stats?.academy?.totalCourses || 0}</span>
                <span className="text-[#8BAE5A] text-sm sm:text-base">cursussen</span>
              </div>
              <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                  style={{ width: `${stats?.academy?.progress || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Kennis & Vaardigheden
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
                  style={{ width: `${(stats.xp.total % 1000) / 10}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>Level {stats.xp.level}</span>
                <span>Level {stats.xp.level + 1}</span>
              </div>
            </div>
          )}
        </div>
      </ClientLayout>
    </div>
  );
} 