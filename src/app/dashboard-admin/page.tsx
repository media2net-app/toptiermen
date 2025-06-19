'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const ledenData = [
  { dag: 'Ma', leden: 180 },
  { dag: 'Di', leden: 220 },
  { dag: 'Wo', leden: 210 },
  { dag: 'Do', leden: 260 },
  { dag: 'Vr', leden: 240 },
  { dag: 'Za', leden: 300 },
  { dag: 'Zo', leden: 270 },
];

const badgesData = [
  { dag: 'Ma', badges: 18 },
  { dag: 'Di', badges: 22 },
  { dag: 'Wo', badges: 15 },
  { dag: 'Do', badges: 30 },
  { dag: 'Vr', badges: 24 },
  { dag: 'Za', badges: 35 },
  { dag: 'Zo', badges: 28 },
];

const omzetData = [
  { week: 'W1', omzet: 1800 },
  { week: 'W2', omzet: 2200 },
  { week: 'W3', omzet: 2100 },
  { week: 'W4', omzet: 2600 },
  { week: 'W5', omzet: 2450 },
];

const challengeData = [
  { maand: 'Jan', inschrijvingen: 120 },
  { maand: 'Feb', inschrijvingen: 140 },
  { maand: 'Mrt', inschrijvingen: 180 },
  { maand: 'Apr', inschrijvingen: 160 },
  { maand: 'Mei', inschrijvingen: 200 },
  { maand: 'Jun', inschrijvingen: 220 },
  { maand: 'Jul', inschrijvingen: 210 },
];

const rangData = [
  { naam: 'Recruit', value: 40 },
  { naam: 'Warrior', value: 30 },
  { naam: 'Alpha', value: 20 },
  { naam: 'Overig', value: 10 },
];

const pieColors = ['#C49C48', '#E5C97B', '#B8860B', '#111111'];

// Mock data - in real app this would come from API
const mockData = {
  totalMembers: 1247,
  newMembersThisWeek: 14,
  dailyActiveUsers: 89,
  mostPopularModule: 'Brotherhood',
  recentSignups: [
    { id: 1, name: 'Mark van der Berg', email: 'mark@example.com', date: '2024-01-15', avatar: '/profielfoto.png' },
    { id: 2, name: 'Thomas Jansen', email: 'thomas@example.com', date: '2024-01-14', avatar: '/profielfoto.png' },
    { id: 3, name: 'Lucas de Vries', email: 'lucas@example.com', date: '2024-01-13', avatar: '/profielfoto.png' },
    { id: 4, name: 'Daan Bakker', email: 'daan@example.com', date: '2024-01-12', avatar: '/profielfoto.png' },
    { id: 5, name: 'Sem Visser', email: 'sem@example.com', date: '2024-01-11', avatar: '/profielfoto.png' },
  ],
  moderationQueue: {
    reportedPosts: 2,
    reportedFeedPosts: 1,
    pendingApprovals: 3
  },
  memberGrowth: [12, 15, 8, 22, 18, 25, 14] // Last 7 days
};

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Animated counters for ledenstatistieken
  const ledenStats = [
    { label: 'Actieve leden deze maand', value: 1245 },
    { label: 'Nieuwe aanmeldingen deze week', value: 86 },
    { label: 'Gem. dagelijkse logins', value: 231 },
    { label: 'Actief coachingpakket', value: 112 },
  ];
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  useEffect(() => {
    ledenStats.forEach((stat, i) => {
      const end = stat.value;
      const duration = 900;
      const step = () => {
        setCounts(prev => {
          const next = [...prev];
          if (next[i] < end) {
            next[i] = Math.min(next[i] + Math.ceil(end / 40), end);
          }
          return next;
        });
      };
      if (counts[i] < end) {
        const interval = setInterval(step, duration / end * 40);
        return () => clearInterval(interval);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts]);

  // Communityactiviteit stats
  const communityStats = [
    { label: 'Posts afgelopen 7 dagen', value: 384 },
    { label: 'Meest actieve gebruiker', value: 46, prefix: '@discipline_daniel (' , suffix: ' posts)' },
    { label: 'Rapportages laatste week', value: 3, suffix: ' gemeld' },
    { label: 'Populairste squad', value: 24, prefix: 'Alpha Arnhem (' , suffix: ' leden)' },
  ];
  const [communityCounts, setCommunityCounts] = useState([0, 0, 0, 0]);
  useEffect(() => {
    communityStats.forEach((stat, i) => {
      const end = stat.value;
      const duration = 900;
      const step = () => {
        setCommunityCounts(prev => {
          const next = [...prev];
          if (next[i] < end) {
            next[i] = Math.min(next[i] + Math.ceil(end / 40), end);
          }
          return next;
        });
      };
      if (communityCounts[i] < end) {
        const interval = setInterval(step, duration / end * 40);
        return () => clearInterval(interval);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityCounts]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Admin Dashboard</h1>
          <p className="text-[#B6C948] mt-2">Overzicht van je Top Tier Men platform</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
          >
            <option value="7d">Laatste 7 dagen</option>
            <option value="30d">Laatste 30 dagen</option>
            <option value="90d">Laatste 90 dagen</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Leden Statistieken */}
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <UserGroupIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <ArrowUpIcon className="w-4 h-4" />
              <span className="text-sm font-medium">+{mockData.newMembersThisWeek}</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#8BAE5A]">{mockData.totalMembers.toLocaleString('nl-NL')}</h3>
            <p className="text-[#B6C948] text-sm">Totaal Aantal Leden</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#181F17] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-full" style={{ width: '75%' }}></div>
            </div>
            <span className="text-[#B6C948] text-xs">75%</span>
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <ArrowUpIcon className="w-4 h-4" />
              <span className="text-sm font-medium">+12%</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#8BAE5A]">{mockData.dailyActiveUsers}</h3>
            <p className="text-[#B6C948] text-sm">Dagelijks Actieve Gebruikers</p>
          </div>
          <div className="mt-4">
            <p className="text-[#B6C948] text-sm">Populairste Module:</p>
            <p className="text-[#8BAE5A] font-semibold">{mockData.mostPopularModule}</p>
          </div>
        </div>

        {/* Recente Aanmeldingen */}
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <ClockIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <button className="text-[#8BAE5A] text-sm font-medium hover:text-[#B6C948] transition">
              Bekijk alle
            </button>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#8BAE5A]">{mockData.recentSignups.length.toLocaleString('nl-NL')}</h3>
            <p className="text-[#B6C948] text-sm">Nieuwe Leden</p>
          </div>
          <div className="mt-4 space-y-2">
            {mockData.recentSignups.slice(0, 3).map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#8BAE5A]/20 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-[#8BAE5A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#8BAE5A] text-sm font-medium truncate">{member.name}</p>
                  <p className="text-[#B6C948] text-xs">{new Date(member.date).toLocaleDateString('nl-NL')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Moderatie Wachtrij */}
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <ExclamationTriangleIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <button className="text-[#8BAE5A] text-sm font-medium hover:text-[#B6C948] transition">
              Bekijk alle
            </button>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#8BAE5A]">{mockData.moderationQueue.reportedPosts + mockData.moderationQueue.reportedFeedPosts}</h3>
            <p className="text-[#B6C948] text-sm">Wachtend op Moderatie</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#B6C948] text-sm">Gerapporteerde posts</span>
              <span className="text-[#8BAE5A] font-semibold">{mockData.moderationQueue.reportedPosts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#B6C948] text-sm">Feed posts</span>
              <span className="text-[#8BAE5A] font-semibold">{mockData.moderationQueue.reportedFeedPosts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#B6C948] text-sm">Goedkeuringen</span>
              <span className="text-[#8BAE5A] font-semibold">{mockData.moderationQueue.pendingApprovals}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Growth Chart */}
      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#8BAE5A]">Leden Groei</h2>
          <div className="flex items-center gap-2">
            <span className="text-[#B6C948] text-sm">Laatste 7 dagen</span>
          </div>
        </div>
        <div className="h-64 flex items-end justify-between gap-2">
          {mockData.memberGrowth.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-[#8BAE5A] to-[#B6C948] rounded-t-lg transition-all duration-300 hover:opacity-80"
                style={{ height: `${(value / Math.max(...mockData.memberGrowth)) * 200}px` }}
              ></div>
              <span className="text-[#B6C948] text-xs mt-2">{value}</span>
              <span className="text-[#8BAE5A] text-xs mt-1">
                {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'][index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300 text-left group">
          <div className="p-3 rounded-xl bg-[#8BAE5A]/20 w-fit mb-4 group-hover:bg-[#8BAE5A]/30 transition">
            <UserGroupIcon className="w-6 h-6 text-[#8BAE5A]" />
          </div>
          <h3 className="text-lg font-bold text-[#8BAE5A] mb-2">Ledenbeheer</h3>
          <p className="text-[#B6C948] text-sm">Beheer gebruikers, rangen en toegang</p>
        </button>

        <button className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300 text-left group">
          <div className="p-3 rounded-xl bg-[#8BAE5A]/20 w-fit mb-4 group-hover:bg-[#8BAE5A]/30 transition">
            <ExclamationTriangleIcon className="w-6 h-6 text-[#8BAE5A]" />
          </div>
          <h3 className="text-lg font-bold text-[#8BAE5A] mb-2">Moderatie</h3>
          <p className="text-[#B6C948] text-sm">Beheer gerapporteerde content</p>
        </button>

        <button className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300 text-left group">
          <div className="p-3 rounded-xl bg-[#8BAE5A]/20 w-fit mb-4 group-hover:bg-[#8BAE5A]/30 transition">
            <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
          </div>
          <h3 className="text-lg font-bold text-[#8BAE5A] mb-2">Analytics</h3>
          <p className="text-[#B6C948] text-sm">Bekijk gedetailleerde statistieken</p>
        </button>
      </div>
    </div>
  );
} 