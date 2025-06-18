'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const ranks = [
  { name: 'Legende', icon: '🦁' },
  { name: 'Veteraan', icon: '🎖️' },
  { name: 'Alpha', icon: '💪' },
  { name: 'Member', icon: '👊' },
];
const interests = ['Finance', 'Fitness', 'Mindset', 'Vaderschap', 'Digitale Nomaden', 'Ondernemerschap'];
const badges = [
  { name: 'Discipline', img: '/badge1.png' },
  { name: 'Brotherhood', img: '/badge2.png' },
  { name: 'Mindset', img: '/badge3.png' },
];
const mockMembers = Array.from({ length: 24 }, (_, i) => ({
  id: (i + 1).toString(),
  name: ['Rick Cuijpers', 'Mark V.', 'Jeroen D.', 'Sven', 'Teun'][i % 5],
  avatar: `https://randomuser.me/api/portraits/men/${30 + i}.jpg`,
  rank: ranks[i % 4],
  location: ['Amsterdam, NL', 'Rotterdam, NL', 'Utrecht, NL', 'Antwerpen, BE', 'Brussel, BE'][i % 5],
  interests: [interests[i % 6], interests[(i + 1) % 6]],
  status: i % 3 === 0 ? 'connectie' : i % 3 === 1 ? 'verzoek' : 'geen',
  bio: 'Gedreven om het beste uit mezelf en anderen te halen. Altijd op zoek naar groei, verbinding en avontuur.',
  badges: badges.slice(0, (i % 3) + 1),
  activity: [
    { type: 'feed', content: 'Deelgenomen aan de Mindset Challenge', date: '2 dagen geleden' },
    { type: 'forum', content: 'Nieuw topic gestart: "Hoe combineer jij vaderschap en ondernemerschap?"', date: '5 dagen geleden' },
  ],
}));

export default function ProfielDetail() {
  const params = useParams();
  const id = params?.id as string;
  const member = mockMembers.find(m => m.id === id);
  const [connectionStatus, setConnectionStatus] = useState(member?.status || 'geen');
  const [notification, setNotification] = useState<string | null>(null);

  if (!member) {
    return <div className="text-white p-8">Lid niet gevonden.</div>;
  }

  const handleConnect = () => {
    setConnectionStatus('verzoek');
    setNotification(`Connectieverzoek verzonden naar ${member.name}.`);
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="px-4 md:px-12 py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
        <div className="relative">
          <Image src={member.avatar} alt={member.name} width={120} height={120} className="w-32 h-32 rounded-full border-4 border-[#8BAE5A] object-cover" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{member.name}</h2>
            <span className="flex items-center gap-1 text-[#FFD700] font-semibold text-lg">{member.rank.icon} {member.rank.name}</span>
          </div>
          <div className="text-[#8BAE5A] text-sm">{member.location}</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {member.interests.map(tag => (
              <span key={tag} className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 py-0.5 rounded-full text-xs font-semibold">#{tag}</span>
            ))}
          </div>
          <div className="mt-3 text-white/80 text-base">{member.bio}</div>
          <div className="flex gap-2 mt-3">
            {member.badges.map(b => (
              <div key={b.name} className="flex flex-col items-center">
                <Image src={b.img} alt={b.name} width={32} height={32} className="rounded-full" />
                <span className="text-xs text-[#FFD700] mt-1">{b.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            {connectionStatus === 'verzoek' ? (
              <button className="px-5 py-2 rounded-xl bg-[#8BAE5A]/30 text-[#8BAE5A] font-bold shadow cursor-default" disabled>✓ Verzoek Verzonden</button>
            ) : connectionStatus === 'connectie' ? (
              <button className="px-5 py-2 rounded-xl bg-[#FFD700]/30 text-[#FFD700] font-bold shadow cursor-default" disabled>✓ Connectie</button>
            ) : (
              <button
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
                onClick={handleConnect}
              >
                + Maak Connectie
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Recente activiteit */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-2">Recente activiteit</h3>
        <ul className="space-y-2">
          {member.activity.map((a, idx) => (
            <li key={idx} className="bg-[#232D1A]/80 rounded-lg px-4 py-3 text-white flex items-center gap-3 border border-[#3A4D23]/40">
              <span className="text-[#8BAE5A] font-bold text-xs uppercase">{a.type === 'feed' ? 'Feed' : 'Forum'}</span>
              <span className="flex-1">{a.content}</span>
              <span className="text-xs text-[#FFD700]">{a.date}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Forumposts (mock) */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-2">Recente forumposts</h3>
        <ul className="space-y-2">
          <li className="bg-[#232D1A]/80 rounded-lg px-4 py-3 text-white border border-[#3A4D23]/40">
            <Link href="/dashboard/brotherhood/forum/fitness-gezondheid/thread" className="text-[#8BAE5A] hover:underline font-semibold">Hoe combineer jij vaderschap en ondernemerschap?</Link>
            <span className="ml-2 text-xs text-[#FFD700]">5 dagen geleden</span>
          </li>
        </ul>
      </div>
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#232D1A] text-[#8BAE5A] px-6 py-3 rounded-xl shadow-lg border border-[#3A4D23]/40 z-50 animate-fade-in">
          {notification}
        </div>
      )}
    </div>
  );
} 