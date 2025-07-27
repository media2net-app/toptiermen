'use client';
import { useEffect, useState } from 'react';
import ClientLayout from '../components/ClientLayout';
import { CheckCircleIcon, TrophyIcon, FireIcon, UserGroupIcon, CalendarDaysIcon, ArrowTrendingUpIcon, DocumentCheckIcon, PlusIcon, BookOpenIcon } from '@heroicons/react/24/solid';
import { BeakerIcon as DumbbellIcon, LightBulbIcon as BrainIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

import OnboardingWidget from '../components/OnboardingWidget';
import { useAuth } from '@/contexts/AuthContext';

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
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [showDailyCompletion, setShowDailyCompletion] = useState(false);
  const [showAlmostCompleted, setShowAlmostCompleted] = useState(false);
  const [hasDismissedDaily, setHasDismissedDaily] = useState(false);
  const [hasDismissedAlmost, setHasDismissedAlmost] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  const { user } = useAuth();

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        const response = await fetch(`/api/dashboard-stats?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Fout bij het laden van dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user?.id]);

  // Fade in animation
  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  // Check onboarding status
  useEffect(() => {
    // Temporarily disable onboarding check
    setOnboardingCompleted(true);
    setShowOnboarding(false);
  }, []);

  // Check if all daily missions are completed
  useEffect(() => {
    if (stats?.missions && stats.missions.total > 0) {
      const allDailyCompleted = stats.missions.completedToday === stats.missions.total;
      const almostCompleted = stats.missions.completedToday >= stats.missions.total - 1 && stats.missions.completedToday > 0;
      const wasCompletedBefore = showDailyCompletion;
      const wasAlmostCompletedBefore = showAlmostCompleted;
      
      // Only show if not dismissed
      setShowDailyCompletion(allDailyCompleted && !hasDismissedDaily);
      setShowAlmostCompleted(almostCompleted && !allDailyCompleted && !hasDismissedAlmost);
      
      // Show toast notification when all missions are completed
      if (allDailyCompleted && !wasCompletedBefore && !loading && !hasDismissedDaily) {
        toast.success('🏆 Alle dagelijkse missies volbracht! Je bent een echte Top Tier Man! Morgen staan er weer nieuwe uitdagingen klaar! 💪', {
          autoClose: 6000,
          position: "top-center",
          style: {
            background: '#232D1A',
            color: '#8BAE5A',
            border: '2px solid #8BAE5A',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            maxWidth: '500px'
          }
        });
      }
      
      // Show encouragement when almost completed
      if (almostCompleted && !allDailyCompleted && !wasAlmostCompletedBefore && !loading && !hasDismissedAlmost) {
        toast.info('🔥 Bijna alle missies volbracht! Nog even doorzetten voor de perfecte dag! 💪', {
          autoClose: 4000,
          position: "top-center",
          style: {
            background: '#232D1A',
            color: '#f0a14f',
            border: '2px solid #f0a14f',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            maxWidth: '500px'
          }
        });
      }
    }
  }, [stats?.missions, loading, showDailyCompletion, showAlmostCompleted, hasDismissedDaily, hasDismissedAlmost]);

  // Load user preferences from database
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/user-preferences?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user preferences');
        }

        const data = await response.json();
        
        if (data.success) {
          const today = new Date().toISOString().split('T')[0];
          const lastDismissDate = data.preferences.last_dismiss_date || '2024-01-01';
          
          // Reset dismiss states on new day
          if (lastDismissDate !== today) {
            setHasDismissedDaily(false);
            setHasDismissedAlmost(false);
            // Update last dismiss date in database
            await fetch('/api/user-preferences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                preferenceKey: 'last_dismiss_date',
                preferenceValue: today
              })
            });
          } else {
            setHasDismissedDaily(data.preferences.daily_completion_dismissed === 'true');
            setHasDismissedAlmost(data.preferences.almost_completed_dismissed === 'true');
          }
          
          setPreferencesLoaded(true);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
        setPreferencesLoaded(true); // Continue without preferences
      }
    };

    loadUserPreferences();
  }, [user?.id]);

  if (!user) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Gebruiker niet gevonden.</div>
        </div>
      </ClientLayout>
    );
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className={`mb-6 sm:mb-8 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black uppercase tracking-tight mb-2 text-white leading-tight">
                  {getGreeting()}, <span className="text-[#8BAE5A] break-words">{user?.full_name || 'Gebruiker'}</span>!
                </h1>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-block bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow">
                    {stats?.xp.rank ? `Level ${stats.xp.level} - ${stats.xp.rank.name}` : 'Level 1 - Recruit'}
                  </span>
                  <span className="inline-block bg-[#3A4D23] text-[#8BAE5A] px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    {stats?.xp.total || 0} XP
                  </span>
                </div>
              </div>
            </div>
            <p className="text-white text-sm sm:text-lg mb-4 sm:mb-8">Jouw persoonlijke Top Tier Men dashboard</p>
          </div>
        </div>

        {/* Onboarding Widget */}
        <OnboardingWidget 
          isVisible={showOnboarding && !onboardingCompleted}
          onComplete={() => {
            setOnboardingCompleted(true);
            setShowOnboarding(false);
            toast.success('Gefeliciteerd! Je hebt je fundament gelegd! 🎉');
          }}
        />

        {/* Daily Completion Celebration */}
        {showDailyCompletion && onboardingCompleted && stats?.missions && (
          <div className="mb-8 animate-fade-in-up">
            <div className="bg-gradient-to-br from-[#8BAE5A]/20 to-[#f0a14f]/20 border-2 border-[#8BAE5A] rounded-2xl p-6 text-center shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl mr-3">🏆</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Alle Dagelijkse Missies Volbracht!
                </h2>
                <span className="text-4xl ml-3">🏆</span>
              </div>
              <p className="text-[#8BAE5A] text-lg mb-4 font-semibold">
                Je bent een echte Top Tier Man! 💪
              </p>
              <div className="bg-[#181F17]/80 rounded-xl p-4 mb-4">
                <p className="text-white text-sm leading-relaxed">
                  <strong>Gefeliciteerd!</strong> Je hebt vandaag alle dagelijkse missies succesvol afgerond. 
                  Dit toont aan dat je de discipline en doorzettingsvermogen hebt van een echte leider. 
                  Blijf deze momentum vasthouden en blijf jezelf elke dag uitdagen.
                </p>
              </div>
              <div className="bg-[#232D1A]/80 rounded-xl p-4 border border-[#3A4D23]">
                <p className="text-[#8BAE5A] text-sm font-semibold">
                  🌅 <strong>Morgen staan er weer nieuwe uitdagingen voor je klaar!</strong> 
                  Blijf scherp, blijf gefocust en blijf groeien. Jouw toekomstige zelf zal je dankbaar zijn.
                </p>
              </div>
              <button 
                onClick={async () => {
                  setShowDailyCompletion(false);
                  setHasDismissedDaily(true);
                  
                  // Save to database
                  if (user?.id) {
                    try {
                      await fetch('/api/user-preferences', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: user.id,
                          preferenceKey: 'daily_completion_dismissed',
                          preferenceValue: 'true'
                        })
                      });
                    } catch (error) {
                      console.error('Error saving dismiss state:', error);
                    }
                  }
                }}
                className="mt-4 px-6 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#8BAE5A] hover:text-white transition-colors duration-300 font-semibold"
              >
                Begrepen
              </button>
            </div>
          </div>
        )}

        {/* Almost Completed Encouragement */}
        {showAlmostCompleted && onboardingCompleted && stats?.missions && (
          <div className="mb-8 animate-fade-in-up">
            <div className="bg-gradient-to-br from-[#f0a14f]/20 to-[#FFD700]/20 border-2 border-[#f0a14f] rounded-2xl p-6 text-center shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl mr-3">🔥</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Bijna Alle Missies Volbracht!
                </h2>
                <span className="text-4xl ml-3">🔥</span>
              </div>
              <p className="text-[#f0a14f] text-lg mb-4 font-semibold">
                Nog even doorzetten voor de perfecte dag! 💪
              </p>
              <div className="bg-[#181F17]/80 rounded-xl p-4 mb-4">
                <p className="text-white text-sm leading-relaxed">
                  <strong>Fantastisch werk!</strong> Je hebt al {stats.missions.completedToday} van de {stats.missions.total} dagelijkse missies volbracht. 
                  Je bent zo dichtbij een perfecte dag! Blijf gefocust en voltooi die laatste missie om jezelf te bewijzen dat je een echte Top Tier Man bent.
                </p>
              </div>
              <div className="bg-[#232D1A]/80 rounded-xl p-4 border border-[#3A4D23]">
                <p className="text-[#f0a14f] text-sm font-semibold">
                  ⚡ <strong>Die laatste missie maakt het verschil!</strong> 
                  Het is de discipline in de moeilijke momenten die echte leiders onderscheidt van de rest.
                </p>
              </div>
              <button 
                onClick={async () => {
                  setShowAlmostCompleted(false);
                  setHasDismissedAlmost(true);
                  
                  // Save to database
                  if (user?.id) {
                    try {
                      await fetch('/api/user-preferences', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: user.id,
                          preferenceKey: 'almost_completed_dismissed',
                          preferenceValue: 'true'
                        })
                      });
                    } catch (error) {
                      console.error('Error saving dismiss state:', error);
                    }
                  }
                }}
                className="mt-4 px-6 py-2 bg-[#3A4D23] text-[#f0a14f] rounded-lg hover:bg-[#f0a14f] hover:text-white transition-colors duration-300 font-semibold"
              >
                Begrepen
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {onboardingCompleted && (
          <>
            {/* Jouw Week in Cijfers */}
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
                      ? 'text-[#FFD700]' // Goud wanneer volbracht
                      : 'text-[#8BAE5A]'
                  }`}>
                    {stats?.missions.completedToday === stats?.missions.total && (stats?.missions.total || 0) > 0 ? '🏆' : '🎯'}
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
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#f0a14f]' // Gouden gradient wanneer volbracht
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
                  <span className="text-[#8BAE5A] text-xl sm:text-2xl">🔥</span>
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
                  <span className="text-[#8BAE5A] text-xl sm:text-2xl">💪</span>
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
                  <span className="text-[#8BAE5A] text-xl sm:text-2xl">🧘‍♂️</span>
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
                  <span className="text-[#8BAE5A] text-xl sm:text-2xl">📚</span>
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
                  <span className="text-[#8BAE5A] text-xl sm:text-2xl">💰</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl sm:text-3xl font-bold text-[#FFD700]">€12.500</span>
                  <span className="text-[#8BAE5A] text-sm sm:text-base">Netto Waarde</span>
                </div>
                <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                    style={{ width: '68%' }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Groeiende portfolio
                </div>
              </Link>
            </div>

            {/* Algemene Voortgang */}
            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 shadow-xl mb-6 sm:mb-8 animate-fade-in-up">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Algemene Voortgang</h3>
                <span className="text-[#8BAE5A] text-xl sm:text-2xl">📊</span>
              </div>
              <div className="w-full h-3 bg-[#3A4D23]/40 rounded-full">
                <div 
                  className="h-3 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                  style={{ width: `${stats?.summary.totalProgress || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[#8BAE5A] text-sm">Start</span>
                <span className="text-[#8BAE5A] text-sm">{stats?.summary.totalProgress || 0}%</span>
                <span className="text-[#8BAE5A] text-sm">Doel</span>
              </div>
            </div>

            {/* Quote van de Dag */}
            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 shadow-xl mb-8 animate-fade-in-up">
              <div className="flex items-center gap-4">
                <span className="text-[#8BAE5A] text-4xl">💭</span>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Quote van de Dag</h3>
                  <blockquote className="text-white italic">"Discipline is the bridge between goals and accomplishment."</blockquote>
                  <p className="text-[#8BAE5A] text-sm mt-2">- Rick</p>
                </div>
              </div>
            </div>

            {/* Snelle Acties */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in-up">
              {/* Snelle Missie Toevoegen */}
              <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Snelle Acties</h3>
                  <span className="text-[#8BAE5A] text-2xl">⚡</span>
                </div>
                <div className="space-y-4">
                  <Link href="/dashboard/mijn-missies" className="flex items-center justify-between p-3 bg-[#3A4D23]/20 rounded-lg hover:bg-[#3A4D23]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-[#8BAE5A]" />
                      <span className="text-white">Missie voltooien</span>
                    </div>
                    <ArrowTrendingUpIcon className="w-4 h-4 text-[#8BAE5A]" />
                  </Link>
                  <Link href="/dashboard/challenges" className="flex items-center justify-between p-3 bg-[#3A4D23]/20 rounded-lg hover:bg-[#3A4D23]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <TrophyIcon className="w-5 h-5 text-[#8BAE5A]" />
                      <span className="text-white">Challenge dag voltooien</span>
                    </div>
                    <ArrowTrendingUpIcon className="w-4 h-4 text-[#8BAE5A]" />
                  </Link>
                  <Link href="/dashboard/mijn-trainingen" className="flex items-center justify-between p-3 bg-[#3A4D23]/20 rounded-lg hover:bg-[#3A4D23]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <DumbbellIcon className="w-5 h-5 text-[#8BAE5A]" />
                      <span className="text-white">Training starten</span>
                    </div>
                    <ArrowTrendingUpIcon className="w-4 h-4 text-[#8BAE5A]" />
                  </Link>
                </div>
              </div>

              {/* Vandaag's Focus */}
              <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Vandaag's Focus</h3>
                  <span className="text-[#8BAE5A] text-2xl">🎯</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">🎯</span>
                      <span className="text-white">Missies voltooid</span>
                    </div>
                    <span className="text-[#8BAE5A] font-bold">{stats?.missions.completedToday || 0}/{stats?.missions.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">🔥</span>
                      <span className="text-white">Challenge dagen</span>
                    </div>
                    <span className="text-[#8BAE5A] font-bold">{stats?.challenges.totalDays || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">🧘‍♂️</span>
                      <span className="text-white">Mind & Focus</span>
                    </div>
                    <span className="text-[#8BAE5A] font-bold">{stats?.mindFocus.completedToday || 0}/{stats?.mindFocus.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">📚</span>
                      <span className="text-white">Boekenkamer</span>
                    </div>
                    <span className="text-[#8BAE5A] font-bold">{stats?.boekenkamer.completedToday || 0}/{stats?.boekenkamer.total || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ClientLayout>
  );
} 