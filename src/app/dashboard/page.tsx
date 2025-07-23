'use client';
import { useEffect, useState, useRef } from 'react';
import ClientLayout from '../components/ClientLayout';
import Image from 'next/image';
import { BellIcon, EnvelopeIcon, CheckCircleIcon, TrophyIcon, FireIcon, ChatBubbleLeftRightIcon, UserGroupIcon, CalendarDaysIcon, ArrowTrendingUpIcon, DocumentCheckIcon, PlusIcon } from '@heroicons/react/24/solid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import BrotherhoodWidget from '../components/BrotherhoodWidget';
import OnboardingWidget from '../components/OnboardingWidget';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const badges = [
  {
    name: 'Iron Discipline',
    description: '30 dagen geen enkele afspraak gemist',
    icon: '🛡️',
  },
  {
    name: 'Spartan Week Survivor',
    description: 'Fysieke challenge behaald',
    icon: '⚔️',
  },
  {
    name: 'Money Machine',
    description: 'Eerste €10k eigen omzet',
    icon: '💰',
  },
  {
    name: 'Silent Strength',
    description: '7 dagen digitale stilte volbracht',
    icon: '🤫',
  },
  {
    name: 'Warrior Monk',
    description: 'Geen alcohol/sugar/socials 30 dagen',
    icon: '🧘‍♂️',
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
};

// Kleine chart data generator voor dashboard kaart
const generateMiniFinanceChartData = () => {
  const now = new Date();
  const labels = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (5 - i));
    return date.toLocaleDateString('nl-NL', { month: 'short' });
  });
  const data = Array.from({ length: 6 }, (_, i) => 40000 + i * 2000 + Math.random() * 3000);
  const goalAmount = 100000;
  const startAmount = data[0];
  const goalData = Array.from({ length: 6 }, (_, i) => startAmount + ((goalAmount - startAmount) * i) / 5);
  return {
    labels,
    datasets: [
      {
        label: 'Netto Waarde',
        data,
        borderColor: '#8BAE5A',
        backgroundColor: 'rgba(139, 174, 90, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: 'Doel',
        data: goalData,
        borderColor: '#FFD700',
        borderDash: [5, 5],
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0,
      },
    ],
  };
};

const miniChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(35, 45, 26, 0.9)',
      titleColor: '#fff',
      bodyColor: '#8BAE5A',
      borderColor: '#3A4D23',
      borderWidth: 1,
      padding: 8,
      boxPadding: 4,
      usePointStyle: true,
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
          }
          return label;
        }
      }
    },
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    },
  },
  animation: {
    duration: 1200,
    easing: 'easeInOutQuart' as const,
  },
};

export default function Dashboard() {
  const [progress, setProgress] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<'profile'|'notifications'|'messages'|null>(null);
  const [showAddMissionModal, setShowAddMissionModal] = useState(false);
  const [newMission, setNewMission] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [videoTimeout, setVideoTimeout] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const { user } = useAuth();
  const dashboardData = useDashboard();

  // Check onboarding status on component mount
  useEffect(() => {
    // Temporarily disable onboarding check until RLS policies are fixed
    setOnboardingCompleted(true);
    setShowOnboarding(false);
    
    // Original code (commented out for now):
    // if (dashboardData.onboardingStatus) {
    //   if (!dashboardData.onboardingStatus.onboarding_completed) {
    //     setShowOnboarding(true);
    //     setOnboardingCompleted(false);
    //   } else {
    //     setOnboardingCompleted(true);
    //     setShowOnboarding(false);
    //   }
    // }
  }, [dashboardData.onboardingStatus]);

  // Handle onboarding completion
  const handleOnboardingComplete = async () => {
    try {
      await dashboardData.updateOnboardingStatus({ 
        onboarding_completed: true,
        completed_steps: JSON.stringify(['goal', 'missions', 'training', 'nutrition', 'challenge'])
      });
      setOnboardingCompleted(true);
      setShowOnboarding(false);
      toast.success('Gefeliciteerd! Je hebt je fundament gelegd! 🎉');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Even if there's an error, we should still close the widget
      // The user can always complete the onboarding later
      setOnboardingCompleted(true);
      setShowOnboarding(false);
      toast.error('Er is een fout opgetreden bij het voltooien van de onboarding, maar je kunt verder gaan');
    }
  };

  // Dummy data
  const notifications: any[] = [];
  const messages: any[] = [];

  useEffect(() => {
    const end = dashboardData.primaryGoal ? dashboardData.primaryGoal.progress_percentage : 68;
    const duration = 900;
    const step = () => {
      setProgress((prev) => {
        if (prev < end) {
          return Math.min(prev + 2, end);
        }
        return prev;
      });
    };
    if (progress < end) {
      const interval = setInterval(step, duration / end);
      return () => clearInterval(interval);
    }
  }, [progress, dashboardData.primaryGoal]);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Add timeout for video loading
  useEffect(() => {
    if (showWelcome && videoLoading) {
      const timer = setTimeout(() => {
        setVideoTimeout(true);
        setVideoLoading(false);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timer);
    }
  }, [showWelcome, videoLoading]);

  useEffect(() => {
    // Check of welkomsvideo al getoond is
    const shown = localStorage.getItem('welcomeVideoShown');
    setShowWelcome(!shown);
  }, []);

  const handleMissionComplete = async (missionId: string) => {
    try {
      await dashboardData.updateMissionStatus(missionId, 'completed');
      toast.success('Missie voltooid! 🎉');
    } catch (error) {
      toast.error('Fout bij het voltooien van missie');
    }
  };

  const handleAddMission = async () => {
    if (!newMission.trim()) return;

    try {
      await dashboardData.createMission({
        title: newMission,
        description: newMission,
        category: 'daily',
        difficulty: 'medium',
        points: 10,
        due_date: new Date().toISOString().split('T')[0]
      });
      
      setNewMission('');
      setShowAddMissionModal(false);
      toast.success('Missie toegevoegd! 🎯');
    } catch (error) {
      toast.error('Fout bij het toevoegen van missie');
    }
  };

  if (!user) {
    return <div className="text-white">Gebruiker niet gevonden.</div>;
  }

  if (dashboardData.loading) {
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
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-0">
        <div className="relative">
          <div className={`mb-8 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-2 text-white">
                    {getGreeting()}, <span className="text-[#8BAE5A]">{dashboardData.profile?.display_name || user?.full_name || 'Gebruiker'}</span>!
                  </h1>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-white px-4 py-1 rounded-full text-sm font-semibold shadow">
                      Rang: {dashboardData.profile?.rank || 'Beginner'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Badges */}
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
                <div className="flex flex-row gap-3">
                  {/* Real achievements */}
                  {dashboardData.achievements.slice(0, 3).map((achievement, index) => (
                    <button key={achievement.id} className="flex flex-col items-center group focus:outline-none">
                      <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center text-2xl transition-transform duration-200 group-hover:scale-110">
                        {achievement.icon || '🏆'}
                      </div>
                      <span className="text-xs text-white mt-1">{achievement.title}</span>
                    </button>
                  ))}
                  {/* More badges indicator */}
                  {dashboardData.achievements.length > 3 && (
                    <button className="flex flex-col items-center justify-center group focus:outline-none">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#232D1A] border border-[#8BAE5A] rounded-full text-[#8BAE5A] font-bold text-lg transition-transform duration-200 group-hover:scale-110">
                        +{dashboardData.achievements.length - 3}
                      </div>
                      <span className="text-xs text-white mt-1">meer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <p className="text-white text-lg mb-8">Jouw persoonlijke Top Tier Men dashboard</p>
          </div>
        </div>
        
        {/* Onboarding Widget - Only show for new users */}
        <OnboardingWidget 
          isVisible={showOnboarding && !onboardingCompleted}
          onComplete={handleOnboardingComplete}
        />
        
        {/* Dashboard Content - Only show after onboarding is completed */}
        {onboardingCompleted && (
          <>
            <BrotherhoodWidget />
            
            {/* Jouw Week in Cijfers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
              {/* Mijn Missies */}
              <Link href="/dashboard/mijn-missies" className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#f0a14f] cursor-pointer block">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Mijn Missies</h3>
                  <span className="text-[#8BAE5A] text-2xl">🎯</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-white">{dashboardData.completedMissions.length}/{dashboardData.missions.length}</span>
                  <span className="text-[#8BAE5A]">volbracht</span>
                </div>
                <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" 
                    style={{ width: `${dashboardData.missions.length > 0 ? (dashboardData.completedMissions.length / dashboardData.missions.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </Link>

              {/* Mind & Focus */}
              <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#f0a14f]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Mind & Focus</h3>
                  <span className="text-[#8BAE5A] text-2xl">🧘‍♂️</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-white">{dashboardData.dailyProgress?.meditation_minutes || 0}</span>
                  <span className="text-[#8BAE5A]">minuten gemediteerd</span>
                </div>
                <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" 
                    style={{ width: `${Math.min((dashboardData.dailyProgress?.meditation_minutes || 0) / 10 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Boekenkamer */}
              <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#f0a14f]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Boekenkamer</h3>
                  <span className="text-[#8BAE5A] text-2xl">📚</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-white">{dashboardData.dailyProgress?.reading_minutes || 0}</span>
                  <span className="text-[#8BAE5A]">minuten gelezen</span>
                </div>
                <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" 
                    style={{ width: `${Math.min((dashboardData.dailyProgress?.reading_minutes || 0) / 30 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Mijn Trainingen */}
              <Link href="/dashboard/mijn-trainingen" className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#f0a14f] cursor-pointer block">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Mijn Trainingen</h3>
                  <span className="text-[#8BAE5A] text-2xl">💪</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-[#8BAE5A] mb-1">Training vandaag:</div>
                    <div className="text-white font-semibold">
                      {dashboardData.dailyProgress?.training_completed ? 'Voltooid' : 'Nog te doen'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-2xl font-bold text-white">{dashboardData.weeklyStats[0]?.training_sessions || 0}</span>
                    <span className="text-[#8BAE5A]">trainingen deze week</span>
                  </div>
                  <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                    <div 
                      className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" 
                      style={{ width: `${Math.min(((dashboardData.weeklyStats[0]?.training_sessions || 0) / 5) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </Link>

              {/* Mijn Voedingsplan */}
              <Link href="/dashboard/voedingsplannen" className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#f0a14f] cursor-pointer block">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Mijn Voedingsplan</h3>
                  <span className="text-[#8BAE5A] text-2xl">🥗</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-[#8BAE5A] mb-1">Voeding vandaag:</div>
                    <div className="text-white font-semibold">
                      {dashboardData.dailyProgress?.nutrition_tracked ? 'Getrackt' : 'Nog niet getrackt'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-2xl font-bold text-white">{dashboardData.habits.filter(h => h.title.toLowerCase().includes('water')).length}</span>
                    <span className="text-[#8BAE5A]">gezonde gewoontes</span>
                  </div>
                  <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                    <div 
                      className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" 
                      style={{ width: `${Math.min((dashboardData.habits.filter(h => h.title.toLowerCase().includes('water')).length / 3) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </Link>

              {/* Finance & Business */}
              <Link href="/dashboard/finance-en-business" className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#f0a14f] cursor-pointer block">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Finance & Business</h3>
                  <span className="text-[#8BAE5A] text-2xl">💰</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-white">
                    {dashboardData.primaryGoal?.category === 'finance' 
                      ? `${dashboardData.primaryGoal.current_value}${dashboardData.primaryGoal.unit}`
                      : '€12.500'
                    }
                  </span>
                  <span className="text-[#8BAE5A]">Netto Waarde</span>
                </div>
                <div className="w-full h-16 flex items-end">
                  {/* Mini Chart.js grafiek */}
                  <div className="w-full h-full">
                    <Line data={generateMiniFinanceChartData()} options={miniChartOptions} />
                  </div>
                </div>
              </Link>
            </div>

            {/* Voortgang naar Hoofddoel */}
            {dashboardData.primaryGoal && (
              <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 mb-8 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Voortgang naar Hoofddoel</h3>
                  <span className="text-[#8BAE5A] text-2xl">🎯</span>
                </div>
                <p className="text-white mb-4">{dashboardData.primaryGoal.title}</p>
                <div className="w-full h-3 bg-[#3A4D23]/40 rounded-full">
                  <div 
                    className="h-3 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[#8BAE5A] text-sm">Start</span>
                  <span className="text-[#8BAE5A] text-sm">{progress}%</span>
                  <span className="text-[#8BAE5A] text-sm">Doel</span>
                </div>
              </div>
            )}

            {/* Quote van de Dag */}
            <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 mb-8 animate-fade-in-up">
              <div className="flex items-center gap-4">
                <span className="text-[#8BAE5A] text-4xl">💭</span>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Quote van de Dag</h3>
                  <blockquote className="text-white italic">"Discipline is the bridge between goals and accomplishment."</blockquote>
                  <p className="text-[#8BAE5A] text-sm mt-2">- Rick</p>
                </div>
              </div>
            </div>

            {/* Gedetailleerde Widgets per Module */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in-up">
              {/* Mijn Missies & Gewoontes */}
              <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#f0a14f]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Mijn Missies & Gewoontes</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8BAE5A] text-2xl">🎯</span>
                    <button
                      onClick={() => setShowAddMissionModal(true)}
                      className="p-2 rounded-full bg-[#8BAE5A] hover:bg-[#B6C948] transition-colors"
                    >
                      <PlusIcon className="w-5 h-5 text-[#181F17]" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {dashboardData.pendingMissions.slice(0, 3).map((mission) => (
                    <div key={mission.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleMissionComplete(mission.id)}
                          className="text-[#8BAE5A] hover:text-[#FFD700] transition-colors"
                        >
                          ○
                        </button>
                        <span className="text-white">{mission.title}</span>
                      </div>
                      <span className="text-[#8BAE5A]">{mission.points} punten</span>
                    </div>
                  ))}
                  {dashboardData.pendingMissions.length === 0 && (
                    <p className="text-[#8BAE5A] text-center py-4">Alle missies voltooid! 🎉</p>
                  )}
                </div>
              </div>

              {/* Mind & Focus */}
              <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#f0a14f]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Mind & Focus</h3>
                  <span className="text-[#8BAE5A] text-2xl">🧘‍♂️</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">⏱️</span>
                      <span className="text-white">Meditatie streak</span>
                    </div>
                    <span className="text-[#8BAE5A]">
                      {dashboardData.habits.find(h => h.title.toLowerCase().includes('meditatie'))?.current_streak || 0} dagen
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">📝</span>
                      <span className="text-white">Focus score</span>
                    </div>
                    <span className="text-[#8BAE5A]">{dashboardData.dailyProgress?.mood_rating || 0}/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">💧</span>
                      <span className="text-white">Water intake</span>
                    </div>
                    <span className="text-[#8BAE5A]">{dashboardData.dailyProgress?.water_intake_liters || 0}L</span>
                  </div>
                </div>
              </div>

              {/* Boekenkamer */}
              <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#f0a14f]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Boekenkamer</h3>
                  <span className="text-[#8BAE5A] text-2xl">📚</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">📖</span>
                      <span className="text-white">Leestijd vandaag</span>
                    </div>
                    <span className="text-[#8BAE5A]">{dashboardData.dailyProgress?.reading_minutes || 0} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">⏱️</span>
                      <span className="text-white">Leesstreak</span>
                    </div>
                    <span className="text-[#8BAE5A]">
                      {dashboardData.habits.find(h => h.title.toLowerCase().includes('lezen'))?.current_streak || 0} dagen
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">🎯</span>
                      <span className="text-white">Doel: 30 min/dag</span>
                    </div>
                    <span className="text-[#8BAE5A]">
                      {Math.round(((dashboardData.dailyProgress?.reading_minutes || 0) / 30) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] max-w-4xl w-full mx-4 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
              <div>
                <h2 className="text-2xl font-bold text-[#8BAE5A]">Welkom bij Top Tier Men</h2>
                <p className="text-[#B6C948] mt-1">Een persoonlijke boodschap van Rick</p>
              </div>
              <button
                onClick={() => {
                  setShowWelcome(false);
                  localStorage.setItem('welcomeVideoShown', 'true');
                }}
                className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-[#B6C948]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Content */}
            <div className="p-6">
              <div className="relative bg-[#181F17] rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {videoLoading && !videoError && !autoplayBlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#181F17]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
                      <p className="text-[#B6C948]">Video laden...</p>
                    </div>
                  </div>
                )}
                
                {videoError || videoTimeout ? (
                  <div className="flex items-center justify-center h-full text-center p-8">
                    <div>
                      <div className="text-[#8BAE5A] text-6xl mb-4">🎥</div>
                      <h3 className="text-xl font-bold text-[#8BAE5A] mb-2">
                        {videoTimeout ? 'Video laadt te langzaam' : 'Video niet beschikbaar'}
                      </h3>
                      <p className="text-[#B6C948] mb-4">
                        {videoTimeout 
                          ? 'De video duurt te lang om te laden. Je kunt de welkomstboodschap hieronder lezen.'
                          : 'De welkomstvideo kon niet worden geladen.'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      muted={!userInteracted}
                      playsInline
                      poster="/video-placeholder.svg"
                      onLoadStart={() => setVideoLoading(true)}
                      onCanPlay={() => {
                        setVideoLoading(false);
                        const video = document.querySelector('video') as HTMLVideoElement;
                        if (video) {
                          video.play().catch(() => {
                            setAutoplayBlocked(true);
                          });
                        }
                      }}
                      onCanPlayThrough={() => {
                        setVideoLoading(false);
                        const video = document.querySelector('video') as HTMLVideoElement;
                        if (video && video.paused) {
                          video.play().catch(() => {
                            setAutoplayBlocked(true);
                          });
                        }
                      }}
                      onPlay={() => {
                        setAutoplayBlocked(false);
                      }}
                      onClick={() => {
                        if (!userInteracted) {
                          setUserInteracted(true);
                          const video = document.querySelector('video') as HTMLVideoElement;
                          if (video) {
                            video.muted = false;
                          }
                        }
                      }}
                      onVolumeChange={() => {
                        if (!userInteracted) {
                          setUserInteracted(true);
                        }
                      }}
                      onError={() => {
                        setVideoLoading(false);
                        setVideoError(true);
                      }}
                    >
                      <source src="/welkom-v2.MP4" type="video/mp4" />
                      <source src="/welkom.MP4" type="video/mp4" />
                      Je browser ondersteunt geen video afspelen.
                    </video>
                    
                    {/* Autoplay blocked overlay */}
                    {autoplayBlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <button
                          onClick={() => {
                            const video = document.querySelector('video') as HTMLVideoElement;
                            if (video) {
                              video.play().then(() => {
                                setAutoplayBlocked(false);
                                setUserInteracted(true);
                                video.muted = false;
                              }).catch(() => {
                                console.log('Manual play also blocked');
                              });
                            }
                          }}
                          className="flex items-center justify-center w-20 h-20 rounded-full bg-[#8BAE5A] hover:bg-[#B6C948] transition-colors duration-200 shadow-lg"
                        >
                          <svg className="w-8 h-8 text-[#181F17] ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {/* Muted indicator */}
                    {!userInteracted && !videoLoading && !videoError && !autoplayBlocked && (
                      <div className="absolute top-4 right-4 bg-black/70 rounded-lg px-3 py-1">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                          </svg>
                          <span>Klik om geluid aan te zetten</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Welcome Message */}
              <div className="mt-6 text-center">
                <h3 className="text-xl font-bold text-[#8BAE5A] mb-3">
                  Welkom in je nieuwe Top Tier leven
                </h3>
                <p className="text-[#B6C948] mb-6 leading-relaxed">
                  Je bent nu onderdeel van een community van mannen die net als jij klaar zijn om te groeien. 
                  Gebruik dit platform om je discipline te ontwikkelen, je lichaam te transformeren, 
                  je mindset te versterken en je financiële vrijheid te creëren.
                </p>
                
                <div className="flex items-center justify-center gap-4 text-[#B6C948] text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#8BAE5A] rounded-full"></span>
                    <span>Discipline & Focus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#8BAE5A] rounded-full"></span>
                    <span>Fysieke Kracht</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#8BAE5A] rounded-full"></span>
                    <span>Financiële Vrijheid</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-[#3A4D23] bg-[#181F17]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8BAE5A]/20 flex items-center justify-center">
                  <span className="text-[#8BAE5A] font-bold">R</span>
                </div>
                <div>
                  <p className="text-[#8BAE5A] font-semibold">Rick</p>
                  <p className="text-[#B6C948] text-sm">Top Tier Men Founder</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowWelcome(false);
                  localStorage.setItem('welcomeVideoShown', 'true');
                }}
                className="px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200"
              >
                Begrijpen & Doorgaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Mission Modal */}
      {showAddMissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#232D1A] rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">Nieuwe Missie Toevoegen</h3>
            <input
              type="text"
              value={newMission}
              onChange={(e) => setNewMission(e.target.value)}
              placeholder="Bijv: 30 min wandelen"
              className="w-full p-3 rounded-xl bg-[#181F17] border border-[#3A4D23] text-white placeholder-[#8BAE5A] mb-6 focus:outline-none focus:border-[#8BAE5A]"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddMission}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-[#181F17] font-semibold hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all duration-200"
              >
                Toevoegen
              </button>
              <button
                onClick={() => {
                  setNewMission('');
                  setShowAddMissionModal(false);
                }}
                className="px-6 py-3 rounded-xl bg-[#181F17] text-white font-semibold hover:bg-[#3A4D23] transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
} 