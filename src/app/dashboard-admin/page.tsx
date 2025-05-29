'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useEffect, useState } from 'react';

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

export default function AdminDashboard() {
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
    <div className="min-h-screen bg-[#111111]">
      <h1 className="text-4xl font-bold text-[#C49C48] mb-8 tracking-tight drop-shadow-lg">Admin Dashboard</h1>
      {/* Ledenstatistieken */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-[#C49C48] mb-4">Ledenstatistiek</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ledenStats.map((stat, i) => (
            <div key={stat.label} className="bg-[#181818]/95 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6 flex flex-col items-center justify-center min-h-[110px]">
              <span className="text-3xl font-bold text-[#C49C48] mb-1">{counts[i]}</span>
              <span className="text-[#E5C97B] text-sm text-center">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Communityactiviteit */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-[#C49C48] mb-4">Communityactiviteit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {communityStats.map((stat, i) => (
            <div key={stat.label} className="bg-[#181818]/95 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6 flex flex-col items-center justify-center min-h-[110px]">
              <span className="text-3xl font-bold text-[#C49C48] mb-1">
                {stat.prefix || ''}&apos;{communityCounts[i]}&apos;{stat.suffix || ''}
              </span>
              <span className="text-[#E5C97B] text-sm text-center">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Overige statistieken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {/* Challenges */}
        <div className="bg-[#181818]/95 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#C49C48] mb-2">Challenges</h2>
          <div className="flex flex-col gap-1 text-[#E5C97B]">
            <span>Populairste challenge: <b className='text-[#C49C48]'>75 Discipline Days (312 deelnemers)</b></span>
            <span>Gemiddeld % voltooiing per challenge: <b className='text-[#C49C48]'>68%</b></span>
            <span>Nieuwe challenges deze maand: <b className='text-[#C49C48]'>5</b></span>
            <span>Behaalde badges afgelopen 7 dagen: <b className='text-[#C49C48]'>152</b></span>
          </div>
        </div>
        {/* Boekenkamer */}
        <div className="bg-[#181818]/95 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#C49C48] mb-2">Boekenkamer</h2>
          <div className="flex flex-col gap-1 text-[#E5C97B]">
            <span>Meest gelezen boek: <b className='text-[#C49C48]'>Can&apos;t Hurt Me – David Goggins (792 views)</b></span>
            <span>Boeken gemarkeerd als 'gelezen': <b className='text-[#C49C48]'>1.208</b></span>
            <span>Nieuw toegevoegde boeken deze maand: <b className='text-[#C49C48]'>7</b></span>
          </div>
        </div>
        {/* Financiën */}
        <div className="bg-[#181818]/95 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#C49C48] mb-2">Financiën</h2>
          <div className="flex flex-col gap-1 text-[#E5C97B]">
            <span>Totale abonnementsomzet deze maand: <b className='text-[#C49C48]'>€7.850,-</b></span>
            <span>Coachingomzet deze maand: <b className='text-[#C49C48]'>€9.450,-</b></span>
            <span>Leden met achterstallige betaling: <b className='text-[#C49C48]'>4</b></span>
          </div>
        </div>
        {/* Support / Systeem */}
        <div className="bg-[#181818]/95 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#C49C48] mb-2">Support & Systeem</h2>
          <div className="flex flex-col gap-1 text-[#E5C97B]">
            <span>Openstaande supporttickets: <b className='text-[#C49C48]'>2</b></span>
            <span>Gem. reactie binnen: <b className='text-[#C49C48]'>3u 12m</b></span>
            <span>Laatste bugmelding: <b className='text-[#C49C48]'>AI-coach laadt niet in iOS 17</b></span>
          </div>
        </div>
      </div>
      {/* Visual widgets placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-[#181818]/95 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6 flex flex-col items-center justify-center min-h-[180px]">
          <span className="text-[#C49C48] font-semibold mb-2">Grafiek: Actieve leden per dag (7 dagen)</span>
          <div className="w-full h-40 bg-[#111111] rounded-xl border border-[#C49C48]/20 flex items-center justify-center text-[#E5C97B]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ledenData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                <XAxis dataKey="dag" stroke="#E5C97B" fontSize={12} tickLine={false} axisLine={{stroke: '#C49C48'}} />
                <YAxis stroke="#E5C97B" fontSize={12} tickLine={false} axisLine={{stroke: '#C49C48'}} width={30} />
                <Tooltip contentStyle={{ background: '#181818', border: '1px solid #C49C48', color: '#C49C48' }} labelStyle={{ color: '#E5C97B' }} itemStyle={{ color: '#C49C48' }} />
                <Line type="monotone" dataKey="leden" stroke="#C49C48" strokeWidth={3} dot={{ r: 5, fill: '#C49C48', stroke: '#111111', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#E5C97B', stroke: '#C49C48', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Progressiekaart: Aantal badges per dag */}
        <div className="bg-[#181818]/95 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6 flex flex-col items-center justify-center min-h-[180px]">
          <span className="text-[#C49C48] font-semibold mb-2">Progressiekaart: Aantal badges per dag</span>
          <div className="w-full h-40 bg-[#111111] rounded-xl border border-[#C49C48]/20 flex items-center justify-center text-[#E5C97B]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={badgesData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                <XAxis dataKey="dag" stroke="#E5C97B" fontSize={12} tickLine={false} axisLine={{stroke: '#C49C48'}} />
                <YAxis stroke="#E5C97B" fontSize={12} tickLine={false} axisLine={{stroke: '#C49C48'}} width={30} />
                <Tooltip contentStyle={{ background: '#181818', border: '1px solid #C49C48', color: '#C49C48' }} labelStyle={{ color: '#E5C97B' }} itemStyle={{ color: '#C49C48' }} />
                <Bar dataKey="badges" fill="#C49C48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Bar chart: Coachingomzet per week */}
        <div className="bg-[#181818]/95 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6 flex flex-col items-center justify-center min-h-[180px]">
          <span className="text-[#C49C48] font-semibold mb-2">Bar chart: Coachingomzet per week</span>
          <div className="w-full h-40 bg-[#111111] rounded-xl border border-[#C49C48]/20 flex items-center justify-center text-[#E5C97B]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={omzetData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="#E5C97B" fontSize={12} tickLine={false} axisLine={{stroke: '#C49C48'}} />
                <YAxis stroke="#E5C97B" fontSize={12} tickLine={false} axisLine={{stroke: '#C49C48'}} width={30} />
                <Tooltip contentStyle={{ background: '#181818', border: '1px solid #C49C48', color: '#C49C48' }} labelStyle={{ color: '#E5C97B' }} itemStyle={{ color: '#C49C48' }} />
                <Bar dataKey="omzet" fill="#C49C48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Line chart: Challenge-inschrijvingen in de tijd */}
        <div className="bg-[#181818]/95 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6 flex flex-col items-center justify-center min-h-[180px]">
          <span className="text-[#C49C48] font-semibold mb-2">Line chart: Challenge-inschrijvingen in de tijd</span>
          <div className="w-full h-40 bg-[#111111] rounded-xl border border-[#C49C48]/20 flex items-center justify-center text-[#E5C97B]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={challengeData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                <XAxis dataKey="maand" stroke="#E5C97B" fontSize={12} tickLine={false} axisLine={{stroke: '#C49C48'}} />
                <YAxis stroke="#E5C97B" fontSize={12} tickLine={false} axisLine={{stroke: '#C49C48'}} width={30} />
                <Tooltip contentStyle={{ background: '#181818', border: '1px solid #C49C48', color: '#C49C48' }} labelStyle={{ color: '#E5C97B' }} itemStyle={{ color: '#C49C48' }} />
                <Line type="monotone" dataKey="inschrijvingen" stroke="#C49C48" strokeWidth={3} dot={{ r: 5, fill: '#C49C48', stroke: '#111111', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#E5C97B', stroke: '#C49C48', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Pie chart: Verdeling leden per rang */}
        <div className="bg-[#181818]/95 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6 flex flex-col items-center justify-center min-h-[180px]">
          <span className="text-[#C49C48] font-semibold mb-2">Pie chart: Verdeling leden per rang</span>
          <div className="w-full h-40 bg-[#111111] rounded-xl border border-[#C49C48]/20 flex items-center justify-center text-[#E5C97B]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rangData} dataKey="value" nameKey="naam" cx="50%" cy="50%" outerRadius={32} innerRadius={18} label={({ name }) => name} >
                  {rangData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: '#E5C97B', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#181818', border: '1px solid #C49C48', color: '#C49C48' }} labelStyle={{ color: '#E5C97B' }} itemStyle={{ color: '#C49C48' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 