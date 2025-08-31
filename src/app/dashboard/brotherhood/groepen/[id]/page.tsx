'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    feed: [
      { user: 'Mark', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', content: 'Heeft een interessante podcast gedeeld over DeFi.', date: '2u geleden' },
      { user: 'Rick', avatar: 'https://randomuser.me/api/portraits/men/31.jpg', content: 'Deelgenomen aan de call: Portfolio Review.', date: '1 dag geleden' },
      { user: 'Jij', avatar: 'https://randomuser.me/api/portraits/men/38.jpg', content: 'Stelde de vraag: "Wat zijn jullie favoriete DeFi tools?"', date: '2 dagen geleden' },
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
    feed: [
      { user: 'Teun', avatar: 'https://randomuser.me/api/portraits/men/35.jpg', content: 'Deelde een inspirerend artikel over vaderschap.', date: '3u geleden' },
      { user: 'Jij', avatar: 'https://randomuser.me/api/portraits/men/38.jpg', content: 'Stelde de vraag: "Hoe combineer jij vaderschap en ondernemerschap?"', date: '1 dag geleden' },
    ],
  },
];

export default function GroepsHub() {
  const params = useParams();
  const id = params?.id as string;
  const group = mockGroups.find(g => g.id === id);
  const [tab, setTab] = useState<'feed' | 'forum' | 'leden' | 'calls'>('feed');

  if (!group) {
    return <div className="text-white p-8">Groep niet gevonden.</div>;
  }

  return (
    <div className="px-4 md:px-12 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">{group.name}</h2>
          <div className="flex -space-x-3">
            {group.members.slice(0, 5).map((m, idx) => (
              <Image key={m.name} src={m.avatar} alt={m.name} width={32} height={32} className="rounded-full border-2 border-[#8BAE5A] bg-[#232D1A]" style={{ zIndex: 10 - idx }} />
            ))}
          </div>
          <span className="text-xs text-[#8BAE5A] ml-2">+{group.members.length - 5 > 0 ? group.members.length - 5 : 0}</span>
        </div>
        <button className="text-[#8BAE5A] hover:text-[#FFD700] text-xl px-2 py-1 rounded-full transition-colors self-start md:self-auto" title="Groep opties">⋯</button>
      </div>
      {/* Subnavigatie */}
      <div className="flex gap-2 mb-8 border-b border-[#3A4D23]/40">
        <button
          className={`px-4 py-2 font-bold text-white border-b-2 transition-all ${tab === 'feed' ? 'border-[#8BAE5A] text-[#8BAE5A]' : 'border-transparent text-white/60'}`}
          onClick={() => setTab('feed')}
        >
          Feed
        </button>
        <button
          className={`px-4 py-2 font-bold text-white border-b-2 transition-all ${tab === 'forum' ? 'border-[#8BAE5A] text-[#8BAE5A]' : 'border-transparent text-white/60'}`}
          onClick={() => setTab('forum')}
        >
          Forum
        </button>
        <button
          className={`px-4 py-2 font-bold text-white border-b-2 transition-all ${tab === 'leden' ? 'border-[#8BAE5A] text-[#8BAE5A]' : 'border-transparent text-white/60'}`}
          onClick={() => setTab('leden')}
        >
          Leden
        </button>
        <button
          className={`px-4 py-2 font-bold text-white border-b-2 transition-all ${tab === 'calls' ? 'border-[#8BAE5A] text-[#8BAE5A]' : 'border-transparent text-white/60'}`}
          onClick={() => setTab('calls')}
        >
          Calls & Agenda
        </button>
      </div>
      {/* Content */}
      {tab === 'feed' && (
        <div className="space-y-4">
          {group.feed.map((post, idx) => (
            <div key={idx} className="bg-[#232D1A]/90 rounded-xl border border-[#3A4D23]/40 p-5 flex items-start gap-4">
              <Image src={post.avatar} alt={post.user} width={40} height={40} className="rounded-full border-2 border-[#8BAE5A] bg-[#232D1A]" />
              <div>
                <div className="text-white font-bold">{post.user}</div>
                <div className="text-white/90 mb-1">{post.content}</div>
                <div className="text-xs text-[#8BAE5A]">{post.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'forum' && (
        <div className="text-white/80">(Mock) Forumkanaal voor deze groep.</div>
      )}
      {tab === 'leden' && (
        <div className="flex flex-wrap gap-4">
          {group.members.map((m, idx) => (
            <div key={m.name} className="flex flex-col items-center bg-[#232D1A]/80 rounded-xl p-4 border border-[#3A4D23]/40">
              <Image src={m.avatar} alt={m.name} width={48} height={48} className="rounded-full border-2 border-[#8BAE5A] bg-[#232D1A] mb-2" />
              <div className="text-white font-semibold text-sm">{m.name}</div>
            </div>
          ))}
        </div>
      )}
      {tab === 'calls' && (
        <div className="text-white/80">(Mock) Agenda en geplande video-calls/meetups van deze groep.</div>
      )}
    </div>
  );
} 