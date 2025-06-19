'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const ranks = [
  { name: 'Legende', icon: '🦁' },
  { name: 'Veteraan', icon: '🎖️' },
  { name: 'Alpha', icon: '💪' },
  { name: 'Member', icon: '👊' },
];

const interests = ['Finance', 'Fitness', 'Mindset', 'Vaderschap', 'Digitale Nomaden', 'Ondernemerschap'];

const mockMembers = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: ['Rick Cuijpers', 'Mark V.', 'Jeroen D.', 'Sven', 'Teun'][i % 5],
  avatar: '/profielfoto.png',
  rank: ranks[i % 4],
  location: ['Amsterdam, NL', 'Rotterdam, NL', 'Utrecht, NL', 'Antwerpen, BE', 'Brussel, BE'][i % 5],
  interests: [interests[i % 6], interests[(i + 1) % 6]],
  status: i % 3 === 0 ? 'connectie' : i % 3 === 1 ? 'verzoek' : 'geen',
  joined: i < 5, // Laatste 5 zijn nieuwe leden
  online: i % 4 === 0,
}));

export default function LedenOverzicht() {
  const [search, setSearch] = useState('');
  const [selectedRank, setSelectedRank] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [location, setLocation] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showOnline, setShowOnline] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<Record<number, string>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);

  const filtered = mockMembers.filter((m) => {
    return (
      (!search || m.name.toLowerCase().includes(search.toLowerCase()) || m.interests.some(tag => tag.toLowerCase().includes(search.toLowerCase()))) &&
      (!selectedRank || m.rank.name === selectedRank) &&
      (!selectedInterest || m.interests.includes(selectedInterest)) &&
      (!location || m.location.toLowerCase().includes(location.toLowerCase())) &&
      (!showNew || m.joined) &&
      (!showOnline || m.online)
    );
  });

  const handleConnect = (id: number) => {
    setConnectionStatus((prev) => ({ ...prev, [id]: 'verzoek' }));
    const member = mockMembers.find(m => m.id === id);
    setNotification(`Connectieverzoek verzonden naar ${member?.name || 'lid'}.`);
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    notificationTimeout.current = setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="px-4 md:px-12">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-1">De Broeders</h2>
        <p className="text-[#8BAE5A] text-lg mb-2">Vind, connect en leer van de andere leden van Top Tier Men.</p>
        <span className="text-[#FFD700] text-sm font-semibold">Momenteel {mockMembers.length} actieve leden.</span>
      </div>
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
        <input
          type="text"
          className="flex-1 bg-[#232D1A]/80 rounded-xl p-3 text-white placeholder:text-[#8BAE5A] border border-[#3A4D23]/40"
          placeholder="Zoek een lid op naam, trefwoord of motto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="bg-[#232D1A]/80 rounded-xl p-3 text-white border border-[#3A4D23]/40"
          value={selectedRank}
          onChange={e => setSelectedRank(e.target.value)}
        >
          <option value="">Alle rangen</option>
          {ranks.map(r => <option key={r.name} value={r.name}>{r.icon} {r.name}</option>)}
        </select>
        <select
          className="bg-[#232D1A]/80 rounded-xl p-3 text-white border border-[#3A4D23]/40"
          value={selectedInterest}
          onChange={e => setSelectedInterest(e.target.value)}
        >
          <option value="">Alle interesses</option>
          {interests.map(i => <option key={i} value={i}>#{i}</option>)}
        </select>
        <input
          type="text"
          className="bg-[#232D1A]/80 rounded-xl p-3 text-white border border-[#3A4D23]/40"
          placeholder="Locatie..."
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-1 text-[#8BAE5A] text-xs">
            <input type="checkbox" checked={showNew} onChange={e => setShowNew(e.target.checked)} className="accent-[#FFD700]" /> Nieuwe leden
          </label>
          <label className="flex items-center gap-1 text-[#8BAE5A] text-xs">
            <input type="checkbox" checked={showOnline} onChange={e => setShowOnline(e.target.checked)} className="accent-[#FFD700]" /> Online nu
          </label>
        </div>
      </div>
      {/* Leden Gallerij */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((m) => (
          <div key={m.id} className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-5 flex flex-col items-center gap-3 hover:shadow-2xl transition-all">
            <Link href={`/dashboard/brotherhood/leden/${m.id}`} className="w-full flex flex-col items-center gap-3 group cursor-pointer" style={{ textDecoration: 'none' }}>
              <div className="relative">
                <Image src={m.avatar} alt={m.name} width={80} height={80} className="w-20 h-20 rounded-full border-2 border-[#8BAE5A] object-cover group-hover:scale-105 transition-transform" />
                {m.online && <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#8BAE5A] border-2 border-white rounded-full" title="Online" />}
              </div>
              <div className="text-lg font-bold text-white text-center group-hover:text-[#FFD700] transition-colors">{m.name}</div>
              <div className="flex items-center gap-2 text-[#FFD700] font-semibold text-sm">
                <span>{m.rank.icon}</span>
                <span>{m.rank.name}</span>
              </div>
              <div className="text-xs text-[#8BAE5A] mb-1">{m.location}</div>
              <div className="flex flex-wrap gap-2 justify-center mb-2">
                {m.interests.map(tag => (
                  <span key={tag} className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 py-0.5 rounded-full text-xs font-semibold">#{tag}</span>
                ))}
              </div>
            </Link>
            <div className="w-full mt-auto">
              {connectionStatus[m.id] === 'verzoek' || m.status === 'verzoek' ? (
                <button className="w-full px-4 py-2 rounded-xl bg-[#8BAE5A]/30 text-[#8BAE5A] font-bold shadow cursor-default" disabled>✓ Verzoek Verzonden</button>
              ) : m.status === 'connectie' ? (
                <button className="w-full px-4 py-2 rounded-xl bg-[#FFD700]/30 text-[#FFD700] font-bold shadow cursor-default" disabled>✓ Connectie</button>
              ) : (
                <button
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
                  onClick={() => handleConnect(m.id)}
                >
                  + Maak Connectie
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#232D1A] text-[#8BAE5A] px-6 py-3 rounded-xl shadow-lg border border-[#3A4D23]/40 z-50 animate-fade-in">
          {notification}
        </div>
      )}
    </div>
  );
} 