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
  const [showWelcome, setShowWelcome] = useState(true);

  // Dummy data
  const notifications = [
    // Social notificaties
    { 
      id: 1, 
      category: 'social',
      icon: <UserGroupIcon className="w-6 h-6 text-[#8BAE5A]" />, 
      title: 'Mark V. heeft je connectieverzoek geaccepteerd', 
      time: '2 uur geleden', 
      unread: true,
      link: '/dashboard/brotherhood/leden'
    },
    { 
      id: 2, 
      category: 'social',
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#8BAE5A]" />, 
      title: 'Jeroen D. heeft gereageerd op jouw forumpost: "Hoe investeer je..."', 
      time: '4 uur geleden', 
      unread: true,
      link: '/dashboard/brotherhood/forum'
    },
    { 
      id: 3, 
      category: 'social',
      icon: <UserGroupIcon className="w-6 h-6 text-[#8BAE5A]" />, 
      title: 'Rick heeft je genoemd in een reactie: "@Rick, wat denk jij hiervan?"', 
      time: '1 dag geleden', 
      unread: false,
      link: '/dashboard/brotherhood/social-feed'
    },
    // Prestaties notificaties
    { 
      id: 4, 
      category: 'prestaties',
      icon: <TrophyIcon className="w-6 h-6 text-[#FFD700]" />, 
      title: 'Badge Ontgrendeld: Ochtendmens! Je hebt 7 dagen op rij voor 7 uur \'s ochtends een missie voltooid', 
      time: 'vandaag', 
      unread: true,
      link: '/dashboard/badges-en-rangen'
    },
    { 
      id: 5, 
      category: 'prestaties',
      icon: <TrophyIcon className="w-6 h-6 text-[#FFD700]" />, 
      title: 'Nieuwe Rang Bereikt: Veteraan! Bekijk je nieuwe voordelen', 
      time: '2 dagen geleden', 
      unread: true,
      link: '/dashboard/badges-en-rangen'
    },
    // Trainingen & Voortgang
    { 
      id: 6, 
      category: 'training',
      icon: <FireIcon className="w-6 h-6 text-[#8BAE5A]" />, 
      title: 'Nieuw PR gezet op Squat! Bekijk je progressie in je logboek', 
      time: 'vandaag', 
      unread: true,
      link: '/dashboard/mijn-trainingen'
    },
    { 
      id: 7, 
      category: 'training',
      icon: <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />, 
      title: 'Je hebt je wekelijkse trainingsdoel van 4 sessies behaald. Goed bezig!', 
      time: '1 dag geleden', 
      unread: false,
      link: '/dashboard/mijn-trainingen'
    },
    // Community
    { 
      id: 8, 
      category: 'community',
      icon: <CalendarDaysIcon className="w-6 h-6 text-[#8BAE5A]" />, 
      title: 'De online workshop "Onderhandelen als een Pro" waarvoor je bent aangemeld, begint over een uur', 
      time: 'nu', 
      unread: true,
      link: '/dashboard/brotherhood/mijn-groepen'
    },
    { 
      id: 9, 
      category: 'community',
      icon: <UserGroupIcon className="w-6 h-6 text-[#8BAE5A]" />, 
      title: 'Nieuwe leden in je Mastermind groep: Welkom Sven en Teun!', 
      time: '3 dagen geleden', 
      unread: false,
      link: '/dashboard/brotherhood/mijn-groepen'
    },
  ];
  const messages = [
    { id: 1, avatar: '/profielfoto.png', name: 'Coach Mark', text: 'Goed bezig met je missies deze week!', time: '2 uur geleden', unread: true },
    { id: 2, avatar: '/profielfoto.png', name: 'Top Tier Community', text: 'Welkom bij de Brotherhood!', time: 'vandaag', unread: true },
    { id: 3, avatar: '/profielfoto.png', name: 'Mentor Lisa', text: 'Je voortgang ziet er sterk uit!', time: '1 dag geleden', unread: false },
    { id: 4, avatar: '/profielfoto.png', name: 'Challenge Team', text: 'Nieuwe challenge: 30 dagen discipline', time: '2 dagen geleden', unread: false },
    { id: 5, avatar: '/profielfoto.png', name: 'Coach Mark', text: 'Vergeet je check-in niet vanavond!', time: '2 dagen geleden', unread: true },
    { id: 6, avatar: '/profielfoto.png', name: 'Top Tier Men', text: 'Je abonnement is verlengd', time: '3 dagen geleden', unread: true },
    { id: 7, avatar: '/profielfoto.png', name: 'Mentor Lisa', text: 'Plan een 1-op-1 call in voor extra support', time: '3 dagen geleden', unread: false },
  ];

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
    // Toastify notificaties
    const shown = new Set();
    // Eerste notificatie direct tonen
    shown.add(0);
    const n0 = notifications[0];
    setTimeout(() => {
      toast.info(
        <div className="flex items-center gap-3">
          <span>{n0.icon}</span>
          <span className="font-semibold">{n0.title}</span>
        </div>,
        {
          position: 'bottom-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        }
      );
    }, 500);
    // Overige 2 random binnen 1 minuut
    function showRandomToast() {
      if (shown.size >= 3) return;
      let idx;
      do {
        idx = Math.floor(Math.random() * notifications.length);
      } while (shown.has(idx));
      shown.add(idx);
      const n = notifications[idx];
      toast.info(
        <div className="flex items-center gap-3">
          <span>{n.icon}</span>
          <span className="font-semibold">{n.title}</span>
        </div>,
        {
          position: 'bottom-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        }
      );
      if (shown.size < 3) {
        setTimeout(showRandomToast, 1000 + Math.random() * 20000);
      }
    }
    setTimeout(showRandomToast, 1000 + Math.random() * 20000);
    // eslint-disable-next-line
  }, []);

  return (
    <ClientLayout>
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-0">
        <div className="relative">
          {/* Responsive header icons */}
          <div className="md:absolute md:top-0 md:right-0 z-20 flex items-center gap-4 md:gap-4 mb-4 md:mb-0 justify-end md:justify-end w-full md:w-auto px-2 md:px-0 mt-4 md:mt-0">
            {/* Notificatie */}
            <div className="relative">
              <button className={`relative p-2 rounded-full bg-[#232D1A] hover:bg-[#8BAE5A]/10 transition md:w-12 md:h-12 w-10 h-10 ${dropdownOpen==='notifications' ? 'ring-2 ring-[#8BAE5A]' : ''}`} onClick={() => setDropdownOpen(dropdownOpen==='notifications'?null:'notifications')}>
                <BellIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-[#FFD600] border-2 border-[#232D1A] rounded-full"></span>
              </button>
              {dropdownOpen==='notifications' && (
                <div ref={dropdownRef} className="absolute right-0 mt-3 w-96 bg-[#181F17] border border-[#232D1A] rounded-2xl shadow-2xl py-4 px-0 text-white">
                  <div className="flex items-center justify-between px-6 mb-3">
                    <span className="text-xl font-bold">Notifications</span>
                    <button 
                      onClick={() => {
                        // Mark all as read functionality
                        toast.success('Alle notificaties als gelezen gemarkeerd');
                      }}
                      className="text-[#8BAE5A] text-sm font-semibold hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {/* Social Notificaties */}
                    <div className="px-6 py-2">
                      <h4 className="text-sm font-semibold text-[#8BAE5A] mb-2">Social</h4>
                      {notifications.filter(n => n.category === 'social').map(n => (
                        <Link href={n.link} key={n.id} className="flex items-center gap-4 py-3 hover:bg-[#232D1A] transition">
                          <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#232D1A]">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate text-sm">{n.title}</div>
                            <div className="text-xs text-[#8BAE5A]">{n.time}</div>
                          </div>
                          {n.unread ? <span className="w-3 h-3 bg-blue-500 rounded-full ml-2"></span> : <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A] ml-2" />}
                        </Link>
                      ))}
                    </div>
                    
                    {/* Prestaties Notificaties */}
                    <div className="px-6 py-2">
                      <h4 className="text-sm font-semibold text-[#FFD700] mb-2">Prestaties</h4>
                      {notifications.filter(n => n.category === 'prestaties').map(n => (
                        <Link href={n.link} key={n.id} className="flex items-center gap-4 py-3 hover:bg-[#232D1A] transition">
                          <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#232D1A]">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate text-sm">{n.title}</div>
                            <div className="text-xs text-[#8BAE5A]">{n.time}</div>
                          </div>
                          {n.unread ? <span className="w-3 h-3 bg-blue-500 rounded-full ml-2"></span> : <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A] ml-2" />}
                        </Link>
                      ))}
                    </div>
                    
                    {/* Training Notificaties */}
                    <div className="px-6 py-2">
                      <h4 className="text-sm font-semibold text-[#8BAE5A] mb-2">Trainingen</h4>
                      {notifications.filter(n => n.category === 'training').map(n => (
                        <Link href={n.link} key={n.id} className="flex items-center gap-4 py-3 hover:bg-[#232D1A] transition">
                          <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#232D1A]">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate text-sm">{n.title}</div>
                            <div className="text-xs text-[#8BAE5A]">{n.time}</div>
                          </div>
                          {n.unread ? <span className="w-3 h-3 bg-blue-500 rounded-full ml-2"></span> : <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A] ml-2" />}
                        </Link>
                      ))}
                    </div>
                    
                    {/* Community Notificaties */}
                    <div className="px-6 py-2">
                      <h4 className="text-sm font-semibold text-[#8BAE5A] mb-2">Community</h4>
                      {notifications.filter(n => n.category === 'community').map(n => (
                        <Link href={n.link} key={n.id} className="flex items-center gap-4 py-3 hover:bg-[#232D1A] transition">
                          <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#232D1A]">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate text-sm">{n.title}</div>
                            <div className="text-xs text-[#8BAE5A]">{n.time}</div>
                          </div>
                          {n.unread ? <span className="w-3 h-3 bg-blue-500 rounded-full ml-2"></span> : <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A] ml-2" />}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 px-6">
                    <a href="#" className="block text-center text-[#8BAE5A] hover:underline text-sm font-semibold">View All Activity</a>
                  </div>
                </div>
              )}
            </div>
            {/* Inbox */}
            <div className="relative">
              <button className={`relative p-2 rounded-full bg-[#232D1A] hover:bg-[#8BAE5A]/10 transition md:w-12 md:h-12 w-10 h-10 ${dropdownOpen==='messages' ? 'ring-2 ring-[#8BAE5A]' : ''}`} onClick={() => setDropdownOpen(dropdownOpen==='messages'?null:'messages')}>
                <EnvelopeIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-[#4ADE80] border-2 border-[#232D1A] rounded-full"></span>
              </button>
              {dropdownOpen==='messages' && (
                <div ref={dropdownRef} className="absolute right-0 mt-3 w-96 bg-[#181F17] border border-[#232D1A] rounded-2xl shadow-2xl py-4 px-0 text-white">
                  <div className="flex items-center justify-between px-6 mb-3">
                    <span className="text-xl font-bold">Messages</span>
                    <a href="/dashboard/inbox" className="text-[#8BAE5A] text-sm font-semibold hover:underline">View all</a>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {messages.map(m => (
                      <a href="/dashboard/inbox" key={m.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#232D1A] transition cursor-pointer">
                        <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{m.name}</div>
                          <div className="text-xs text-[#8BAE5A] truncate">{m.text}</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-[#8BAE5A]">{m.time}</span>
                          {m.unread ? <span className="w-3 h-3 bg-blue-500 rounded-full mt-1"></span> : <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A] mt-1" />}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Profielfoto */}
            <div className="relative">
              <img src="/profielfoto.png" alt="Profielfoto" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#8BAE5A] object-cover" />
            </div>
          </div>
          <div className={`mb-8 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-2 text-white">
                    {getGreeting()}, <span className="text-[#8BAE5A]">Rick</span>!
                  </h1>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-white px-4 py-1 rounded-full text-sm font-semibold shadow">
                      Rang: Warrior
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
          </Link>

          {/* Passief Inkomen */}
          <Link href="/dashboard/finance-en-business/passief-inkomen" className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#f0a14f] cursor-pointer block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Passief Inkomen</h3>
              <span className="text-[#8BAE5A] text-2xl">📈</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl font-bold text-white">€150</span>
              <span className="text-[#8BAE5A]">/ €500 doel</span>
            </div>
            <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full">
              <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" style={{ width: '30%' }}></div>
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
      </div>

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

      <ToastContainer toastClassName="!bg-[#181F17] !text-white" progressClassName="!bg-[#232D1A]" />
    </ClientLayout>
  );
} 