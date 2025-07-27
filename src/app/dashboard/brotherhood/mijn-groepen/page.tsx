'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const mockGroups = [
  {
    id: '1',
    name: 'Crypto & DeFi Pioniers',
    members: [
      { name: 'Rick', avatar: 'https://randomuser.me/api/portraits/men/31.jpg' },
      { name: 'Mark', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { name: 'Jeroen', avatar: 'https://randomuser.me/api/portraits/men/33.jpg' },
      { name: 'Sven', avatar: 'https://randomuser.me/api/portraits/men/34.jpg' },
      { name: 'Teun', avatar: 'https://randomuser.me/api/portraits/men/35.jpg' },
      { name: 'Pieter', avatar: 'https://randomuser.me/api/portraits/men/36.jpg' },
      { name: 'Daan', avatar: 'https://randomuser.me/api/portraits/men/37.jpg' },
      { name: 'Jij', avatar: 'https://randomuser.me/api/portraits/men/38.jpg' },
    ],
    activity: [
      { type: 'forum', content: "Mark V. startte de discussie: 'Analyse van de laatste Bitcoin halving'.", date: '2u geleden' },
      { type: 'member', content: 'Welkom bij de groep, Jeroen D.!', date: '1 dag geleden' },
      { type: 'event', content: 'Volgende call: Wekelijkse Portfolio Review - morgen om 20:00.', date: 'Morgen' },
    ],
  },
  {
    id: '2',
    name: 'Vaders & Leiders',
    members: [
      { name: 'Rick', avatar: 'https://randomuser.me/api/portraits/men/31.jpg' },
      { name: 'Jij', avatar: 'https://randomuser.me/api/portraits/men/38.jpg' },
      { name: 'Teun', avatar: 'https://randomuser.me/api/portraits/men/35.jpg' },
    ],
    activity: [
      { type: 'forum', content: 'Sven plaatste: "Hoe combineer jij vaderschap en ondernemerschap?"', date: '3u geleden' },
      { type: 'event', content: 'Volgende call: Reflectie & Groei - vrijdag 21:00.', date: 'Vrijdag' },
    ],
  },
];

const mockEvents = [
  {
    id: '1',
    title: 'Online Workshop: Onderhandelen als een Pro',
    type: 'Online Workshop',
    date: 'Morgen',
    time: '20:00',
    status: 'aangemeld',
    upcoming: true,
  },
  {
    id: '2',
    title: 'Fysieke Meetup: Kracht & Connectie',
    type: 'Fysieke Meetup (Amsterdam)',
    date: 'Donderdag 26 juni',
    time: '19:30',
    status: 'aangemeld',
    upcoming: true,
  },
  {
    id: '3',
    title: 'Online Masterclass: Mindset & Groei',
    type: 'Online Masterclass',
    date: 'Vorige week',
    time: '20:00',
    status: 'deelgenomen',
    upcoming: false,
  },
];

export default function MijnGroepenEnEvenementen() {
  const [tab, setTab] = useState<'groepen' | 'evenementen'>('groepen');
  const [eventView, setEventView] = useState<'aankomend' | 'voorbij'>('aankomend');

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-[#3A4D23]/40">
        <button
          className={`px-4 py-2 font-bold text-white border-b-2 transition-all ${tab === 'groepen' ? 'border-[#8BAE5A] text-[#8BAE5A]' : 'border-transparent text-white/60'}`}
          onClick={() => setTab('groepen')}
        >
          Mijn Mastermind Groepen
        </button>
        <button
          className={`px-4 py-2 font-bold text-white border-b-2 transition-all ${tab === 'evenementen' ? 'border-[#8BAE5A] text-[#8BAE5A]' : 'border-transparent text-white/60'}`}
          onClick={() => setTab('evenementen')}
        >
          Mijn Evenementen
        </button>
      </div>
      {/* Tab 1: Groepen */}
      {tab === 'groepen' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Mijn Mastermind Groepen</h2>
            <Link href="/dashboard/brotherhood/groepen-directory">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">
                + Vind of creëer een groep
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockGroups.map(group => (
              <div key={group.id} className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{group.name}</h3>
                  <button className="text-[#8BAE5A] hover:text-[#FFD700] text-xl px-2 py-1 rounded-full transition-colors" title="Groep opties">⋯</button>
                </div>
                <div className="mb-2">
                  <div className="text-xs text-[#8BAE5A] font-semibold mb-1">Recente activiteit</div>
                  <ul className="space-y-1">
                    {group.activity.map((a, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-white/90 text-sm">
                        <span className="text-[#FFD700] text-xs font-bold">{a.type === 'forum' ? 'Forum' : a.type === 'member' ? 'Lid' : 'Event'}</span>
                        <span className="flex-1">{a.content}</span>
                        <span className="text-xs text-[#8BAE5A]">{a.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex -space-x-3">
                    {group.members.slice(0, 5).map((m, idx) => (
                      <Image key={m.name} src={m.avatar} alt={m.name} width={32} height={32} className="rounded-full border-2 border-[#8BAE5A] bg-[#232D1A]" style={{ zIndex: 10 - idx }} />
                    ))}
                  </div>
                  <span className="text-xs text-[#8BAE5A] ml-2">Jij en {group.members.length - 1} anderen.</span>
                  <button className="text-xs text-[#FFD700] underline ml-2 hover:text-[#8BAE5A]">Bekijk leden</button>
                </div>
                <div className="mt-auto">
                  <Link href={`/dashboard/brotherhood/groepen/${group.id}`}>
                    <button className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all flex items-center justify-center gap-2">
                      <span>Ga naar de Groepshub</span>
                      <span className="text-lg">→</span>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Tab 2: Evenementen */}
      {tab === 'evenementen' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white">Mijn Evenementen</h2>
            <div className="flex gap-2 ml-4">
              <button
                className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${eventView === 'aankomend' ? 'bg-[#8BAE5A] text-[#181F17]' : 'bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]/40'}`}
                onClick={() => setEventView('aankomend')}
              >
                Aankomend
              </button>
              <button
                className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${eventView === 'voorbij' ? 'bg-[#8BAE5A] text-[#181F17]' : 'bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]/40'}`}
                onClick={() => setEventView('voorbij')}
              >
                Voorbij
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {mockEvents.filter(e => e.upcoming === (eventView === 'aankomend')).map(event => (
              <div key={event.id} className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex flex-col items-start min-w-[120px] mb-2 md:mb-0">
                  <div className="text-lg font-bold text-[#FFD700]">{event.date}, {event.time}</div>
                  <div className="text-xs text-[#8BAE5A] font-semibold">{event.type}</div>
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-base mb-1">{event.title}</div>
                  <div className="text-xs text-[#8BAE5A] font-semibold mb-2">{event.status === 'aangemeld' ? '✓ Je bent aangemeld' : '✓ Deelgenomen'}</div>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <Link href={`/dashboard/brotherhood/evenementen/${event.id}`}>
                    <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all flex items-center gap-2">
                      {event.upcoming ? <span>Bekijk Details</span> : <span>Throwback</span>}
                      <span className="text-lg">{event.upcoming ? '→' : '⏪'}</span>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 