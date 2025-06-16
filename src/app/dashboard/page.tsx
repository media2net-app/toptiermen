'use client';
import { useEffect, useState, useRef } from 'react';
import ClientLayout from '../components/ClientLayout';
import Image from 'next/image';
import { BellIcon, EnvelopeIcon, CheckCircleIcon, TrophyIcon, FireIcon, ChatBubbleLeftRightIcon, UserGroupIcon, CalendarDaysIcon, ArrowTrendingUpIcon, DocumentCheckIcon } from '@heroicons/react/24/solid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

export default function Dashboard() {
  const [progress, setProgress] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<'profile'|'notifications'|'messages'|null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Dummy data
  const notifications = [
    { id: 1, icon: <TrophyIcon className="w-6 h-6 text-[#8BAE5A]" />, title: 'Nieuwe badge: Iron Discipline behaald!', time: '2 uur geleden', unread: true },
    { id: 2, icon: <FireIcon className="w-6 h-6 text-[#8BAE5A]" />, title: 'Je dagelijkse missie is voltooid!', time: 'vandaag', unread: true },
    { id: 3, icon: <UserGroupIcon className="w-6 h-6 text-[#8BAE5A]" />, title: 'Nieuwe reactie in de community', time: '1 dag geleden', unread: false },
    { id: 4, icon: <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#8BAE5A]" />, title: 'Mentor heeft feedback gegeven op je voortgang', time: '2 dagen geleden', unread: false },
    { id: 5, icon: <CalendarDaysIcon className="w-6 h-6 text-[#8BAE5A]" />, title: 'Live sessie vanavond om 20:00', time: '2 dagen geleden', unread: true },
    { id: 6, icon: <ArrowTrendingUpIcon className="w-6 h-6 text-[#8BAE5A]" />, title: 'Je bent een level gestegen!', time: '3 dagen geleden', unread: true },
    { id: 7, icon: <DocumentCheckIcon className="w-6 h-6 text-[#8BAE5A]" />, title: 'Intakeformulier succesvol afgerond', time: '3 dagen geleden', unread: false },
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
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#232D1A] rounded-2xl p-8 shadow-2xl flex flex-col items-center max-w-2xl w-full relative">
            <button
              className="absolute top-5 right-5 text-white text-3xl font-bold hover:text-[#8BAE5A] transition"
              onClick={() => setShowWelcome(false)}
              aria-label="Sluit welkom popup"
            >
              ×
            </button>
            <div className="w-full h-[28rem] bg-[#181F17] rounded-xl flex items-center justify-center mb-6 overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/26U_seo0a1g"
                title="Welkom video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full rounded-xl"
              ></iframe>
            </div>
            <h2 className="text-3xl font-bold text-[#8BAE5A] mb-3 text-center">Welkom bij Top Tier Men!</h2>
            <p className="text-white text-center mb-6 text-lg">Bekijk de korte introductievideo om direct van start te gaan.</p>
            <button
              className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-[#181F17] font-semibold text-xl shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all duration-200 border border-[#8BAE5A]"
              onClick={() => setShowWelcome(false)}
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
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
                  <label className="flex items-center gap-2 text-sm select-none cursor-pointer">
                    <input type="checkbox" className="accent-[#8BAE5A]" />
                    Mark all as read
                  </label>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#232D1A] transition">
                      <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#232D1A] text-2xl">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{n.title}</div>
                        <div className="text-xs text-[#8BAE5A]">{n.time}</div>
                      </div>
                      {n.unread ? <span className="w-3 h-3 bg-blue-500 rounded-full ml-2"></span> : <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A] ml-2" />}
                    </div>
                  ))}
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
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-4 text-white">
            {getGreeting()}, <span className="text-[#8BAE5A]">Rick</span>!
          </h1>
          <p className="text-white text-lg mb-8">Jouw persoonlijke Top Tier Men dashboard</p>
          <div className="bg-[#232D1A]/80 rounded-2xl p-10 flex flex-col md:flex-row gap-8 items-center shadow-xl border border-[#3A4D23]/40">
            <div className="flex-1">
              <div className="text-xl text-white font-semibold mb-2">Motivational quote</div>
              <blockquote className="italic text-white">&ldquo;Discipline is the bridge between goals and accomplishment.&rdquo;</blockquote>
              <div className="mt-4 text-xs text-[#8BAE5A]">- Rick</div>
            </div>
          </div>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}> 
          <div className="bg-[#181F17]/90 rounded-2xl p-8 shadow-xl border border-[#8BAE5A]/40 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]">
            <span className="text-white text-sm mb-1">Voortgang</span>
            <span className="text-3xl font-bold text-white">{progress}%</span>
            <div className="w-full h-2 bg-[#8BAE5A]/20 rounded-full mt-2">
              <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="bg-[#181F17]/90 rounded-2xl p-8 shadow-xl border border-[#8BAE5A]/40 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]">
            <span className="text-white text-sm mb-1">Level</span>
            <span className="text-3xl font-bold text-white">4</span>
          </div>
          <div className="bg-[#181F17]/90 rounded-2xl p-8 shadow-xl border border-[#8BAE5A]/40 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]">
            <span className="text-white text-sm mb-1">Badges</span>
            <span className="text-3xl font-bold text-white">7</span>
          </div>
          <div className="bg-[#181F17]/90 rounded-2xl p-8 shadow-xl border border-[#8BAE5A]/40 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]">
            <span className="text-white text-sm mb-1">Dagelijkse Missie</span>
            <span className="text-lg font-semibold text-white text-center">10.000 stappen<br />30 min lezen</span>
          </div>
        </div>
      </div>
      <ToastContainer toastClassName="!bg-[#181F17] !text-white" progressClassName="!bg-[#232D1A]" />
    </ClientLayout>
  );
} 