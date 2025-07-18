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

  // Check onboarding status on component mount
  useEffect(() => {
    const onboardingStatus = localStorage.getItem('onboardingCompleted');
    if (!onboardingStatus) {
      setShowOnboarding(true);
    } else {
      setOnboardingCompleted(true);
      setShowOnboarding(false);
    }
  }, []);

  // Dummy data
  const notifications: any[] = [];
  const messages: any[] = [];

  useEffect(() => {
    const end = 68;
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
  }, [progress]);

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

  useEffect(() => {
    // Toastify notificaties - UITGESCHAKELD
    // const shown = new Set();
    // // Eerste notificatie direct tonen
    // shown.add(0);
    // const n0 = notifications[0];
    // setTimeout(() => {
    //   toast.info(
    //     <div className="flex items-center gap-3">
    //       <span>{n0.icon}</span>
    //       <span className="font-semibold">{n0.title}</span>
    //     </div>,
    //     {
    //       position: 'bottom-right',
    //       autoClose: 5000,
    //       hideProgressBar: false,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //       theme: 'dark',
    //     }
    //   );
    // }, 500);
    // // Overige 2 random binnen 1 minuut
    // function showRandomToast() {
    //   if (shown.size >= 3) return;
    //   let idx;
    //   do {
    //     idx = Math.floor(Math.random() * notifications.length);
    //   } while (shown.has(idx));
    //   shown.add(idx);
    //   const n = notifications[idx];
    //   toast.info(
    //     <div className="flex items-center gap-3">
    //       <span>{n.icon}</span>
    //       <span className="font-semibold">{n.title}</span>
    //     </div>,
    //     {
    //       position: 'bottom-right',
    //       autoClose: 5000,
    //       hideProgressBar: false,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //       theme: 'dark',
    //     }
    //   );
    //   if (shown.size < 3) {
    //     setTimeout(showRandomToast, 1000 + Math.random() * 20000);
    //   }
    // }
    // setTimeout(showRandomToast, 1000 + Math.random() * 20000);
    // eslint-disable-next-line
  }, []);

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

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-0">
        <div className="relative">
          <div className={`mb-8 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-2 text-white">
                    {getGreeting()}, <span className="text-[#8BAE5A]">{user?.full_name || 'Gebruiker'}</span>!
                  </h1>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-white px-4 py-1 rounded-full text-sm font-semibold shadow">
                      Rang: {user?.rank || 'Beginner'}
                    </span>
                  </div>
                </div>
                {/* eventueel andere header icons */}
              </div>
              {/* Badges */}
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
                <div className="flex flex-row gap-3">
                  {/* Voorbeeld badges */}
                  <button className="flex flex-col items-center group focus:outline-none">
                    <img src="/badge1.png" alt="Discipline Badge" className="w-12 h-12 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-xs text-white mt-1">Discipline</span>
                  </button>
                  <button className="flex flex-col items-center group focus:outline-none">
                    <img src="/badge2.png" alt="Consistency Badge" className="w-12 h-12 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-xs text-white mt-1">Consistency</span>
                  </button>
                  <button className="flex flex-col items-center group focus:outline-none">
                    <img src="/badge3.png" alt="Leader Badge" className="w-12 h-12 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-xs text-white mt-1">Leader</span>
                  </button>
                  {/* Meer badges indicator */}
                  <button className="flex flex-col items-center justify-center group focus:outline-none">
                    <div className="w-12 h-12 flex items-center justify-center bg-[#232D1A] border border-[#8BAE5A] rounded-full text-[#8BAE5A] font-bold text-lg transition-transform duration-200 group-hover:scale-110">
                      +17
                    </div>
                    <span className="text-xs text-white mt-1">meer</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-white text-lg mb-8">Jouw persoonlijke Top Tier Men dashboard</p>
          </div>
        </div>
        
        {/* Onboarding Widget - Only show for new users */}
        <OnboardingWidget 
          isVisible={showOnboarding && !onboardingCompleted}
          onComplete={() => {
            setOnboardingCompleted(true);
            setShowOnboarding(false);
            localStorage.setItem('onboardingCompleted', 'true');
            toast.success('Gefeliciteerd! Je hebt je fundament gelegd! 🎉');
          }}
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
                  <span className="text-3xl font-bold text-white">3/5</span>
                  <span className="text-[#8BAE5A]">volbracht</span>
                </div>
                <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                  <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" style={{ width: '60%' }}></div>
                </div>
              </Link>

              {/* Trainingscentrum */}
              {/* (verwijderd) */}

              {/* Mind & Focus */}
              <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#f0a14f]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Mind & Focus</h3>
                  <span className="text-[#8BAE5A] text-2xl">🧘‍♂️</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-white">4</span>
                  <span className="text-[#8BAE5A]">meditaties voltooid</span>
                </div>
                <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                  <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              {/* Boekenkamer */}
              <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#f0a14f]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Boekenkamer</h3>
                  <span className="text-[#8BAE5A] text-2xl">📚</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-white">45</span>
                  <span className="text-[#8BAE5A]">minuten gelezen</span>
                </div>
                <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                  <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" style={{ width: '75%' }}></div>
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
                    <div className="text-sm text-[#8BAE5A] mb-1">Je volgt nu:</div>
                    <div className="text-lg font-bold text-white">Full Body Krachttraining</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#8BAE5A] mb-1">Vandaag op het programma:</div>
                    <div className="text-white font-semibold">Pull Day</div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-2xl font-bold text-white">2/3</span>
                    <span className="text-[#8BAE5A]">trainingen gedaan</span>
                  </div>
                  <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" style={{ width: '66%' }}></div>
                  </div>
                  {/* Cross-module actie */}
                  <div className="mt-4 pt-3 border-t border-[#3A4D23]/40">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toast.success('Gedeeld in Brotherhood!');
                      }}
                      className="w-full px-4 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-colors text-sm"
                    >
                      🏆 Deel je Pull Day in Brotherhood
                    </button>
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
                    <div className="text-sm text-[#8BAE5A] mb-1">Jouw actieve plan:</div>
                    <div className="text-lg font-bold text-white">Gebalanceerd Dieet</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#8BAE5A] mb-1">Calorie-doel:</div>
                    <div className="text-white font-semibold">2.450 kcal</div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-2xl font-bold text-white">1.850</span>
                    <span className="text-[#8BAE5A]">kcal gegeten</span>
                  </div>
                  <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" style={{ width: '75%' }}></div>
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
                  <span className="text-3xl font-bold text-white">€12.500</span>
                  <span className="text-[#8BAE5A]">Netto Waarde</span>
                </div>
                <div className="w-full h-16 flex items-end">
                  {/* Mini Chart.js grafiek */}
                  <div className="w-full h-full">
                    <Line data={generateMiniFinanceChartData()} options={miniChartOptions} />
                  </div>
                </div>
                {/* Cross-module actie */}
                <div className="mt-4 pt-3 border-t border-[#3A4D23]/40">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toast.success('Gedeeld in Brotherhood!');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFD700] text-[#181F17] font-semibold hover:bg-[#FFED4E] transition-colors text-sm"
                  >
                    💰 Deel je financiële mijlpaal in Brotherhood
                  </button>
                </div>
              </Link>
            </div>

            {/* Voortgang naar Hoofddoel */}
            <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 mb-8 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Voortgang naar Hoofddoel</h3>
                <span className="text-[#8BAE5A] text-2xl">🎯</span>
              </div>
              <p className="text-white mb-4">Fitter worden en 10% lichaamsvet bereiken</p>
              <div className="w-full h-3 bg-[#3A4D23]/40 rounded-full">
                <div className="h-3 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[#8BAE5A] text-sm">Start</span>
                <span className="text-[#8BAE5A] text-sm">{progress}%</span>
                <span className="text-[#8BAE5A] text-sm">Doel</span>
              </div>
            </div>

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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">✓</span>
                      <span className="text-white">Dagelijkse meditatie</span>
                    </div>
                    <span className="text-[#8BAE5A]">3/7 dagen</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">✓</span>
                      <span className="text-white">10.000 stappen</span>
                    </div>
                    <span className="text-[#8BAE5A]">5/7 dagen</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">✓</span>
                      <span className="text-white">30 min lezen</span>
                    </div>
                    <span className="text-[#8BAE5A]">4/7 dagen</span>
                  </div>
                  {/* Cross-module suggestie */}
                  <div className="mt-4 pt-3 border-t border-[#3A4D23]/40">
                    <div className="text-sm text-[#8BAE5A] mb-2">💡 Inspireer anderen:</div>
                    <button
                      onClick={() => toast.success('Gedeeld in Social Feed!')}
                      className="w-full px-3 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold hover:bg-[#232D1A] transition-colors text-sm border border-[#3A4D23]"
                    >
                      📚 Deel je leesvoortgang in Social Feed
                    </button>
                  </div>
                </div>
              </div>

              {/* Trainingscentrum */}
              {/* (verwijderd) */}

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
                    <span className="text-[#8BAE5A]">4 dagen</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">📝</span>
                      <span className="text-white">Journal entries</span>
                    </div>
                    <span className="text-[#8BAE5A]">3 deze week</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">🎯</span>
                      <span className="text-white">Focus score</span>
                    </div>
                    <span className="text-[#8BAE5A]">85%</span>
                  </div>
                  {/* Cross-module actie */}
                  <div className="mt-4 pt-3 border-t border-[#3A4D23]/40">
                    <Link href="/dashboard/brotherhood/forum/fitness-gezondheid" className="block">
                      <button className="w-full px-3 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold hover:bg-[#232D1A] transition-colors text-sm border border-[#3A4D23]">
                        💭 Vraag advies in Mind & Focus forum
                      </button>
                    </Link>
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
                      <span className="text-white">Huidig boek</span>
                    </div>
                    <span className="text-[#8BAE5A]">Atomic Habits</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">⏱️</span>
                      <span className="text-white">Leestijd deze week</span>
                    </div>
                    <span className="text-[#8BAE5A]">45 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8BAE5A]">🎯</span>
                      <span className="text-white">Doel: 30 min/dag</span>
                    </div>
                    <span className="text-[#8BAE5A]">64%</span>
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
                      {!videoTimeout && (
                        <button 
                          onClick={() => {
                            setVideoError(false);
                            setVideoLoading(true);
                            setVideoTimeout(false);
                            // Retry loading the video
                            const video = document.querySelector('video') as HTMLVideoElement;
                            if (video) {
                              video.load();
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-colors"
                        >
                          Opnieuw proberen
                        </button>
                      )}
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
                        // Try to play the video when it's ready
                        const video = document.querySelector('video') as HTMLVideoElement;
                        if (video) {
                          video.play().catch(() => {
                            // If autoplay fails, show a play button overlay
                            console.log('Autoplay blocked, showing play button');
                            setAutoplayBlocked(true);
                          });
                        }
                      }}
                      onCanPlayThrough={() => {
                        setVideoLoading(false);
                        // Video is fully loaded, ensure it plays
                        const video = document.querySelector('video') as HTMLVideoElement;
                        if (video && video.paused) {
                          video.play().catch(() => {
                            console.log('Autoplay still blocked');
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
                                // Unmute the video when user clicks play
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
                onClick={() => {
                  if (newMission.trim()) {
                    // Hier zou je de missie toevoegen aan de state/database
                    toast.success('Missie toegevoegd!');
                    setNewMission('');
                  }
                  setShowAddMissionModal(false);
                }}
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