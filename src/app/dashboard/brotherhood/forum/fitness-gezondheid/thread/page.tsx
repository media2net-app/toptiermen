import React from 'react';
import Image from 'next/image';

const thread = {
  id: 1,
  title: 'Hoe herstel je sneller na een zware training?',
  author: {
    name: 'Rick Cuijpers',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rank: 'Alpha',
  },
  timestamp: '18 juni 2025, 08:15',
  content: `Ik heb gisteren een zware legsessie gedaan en voel me vandaag echt gesloopt. Wat zijn jullie beste tips voor sneller herstel? Denk aan voeding, supplementen, slaap, etc.`,
};

const replies = [
  {
    id: 1,
    author: {
      name: 'Sven',
      avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
      rank: 'Member',
    },
    timestamp: '18 juni 2025, 09:12',
    content: 'Veel water drinken en een goede nachtrust maken bij mij het grootste verschil! Foamrollen helpt ook.',
  },
  {
    id: 2,
    author: {
      name: 'Jeroen D.',
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
      rank: 'Member',
    },
    timestamp: '18 juni 2025, 09:45',
    content: 'Magnesium nemen voor het slapen en een lichte wandeling doen. En natuurlijk: eiwitten!',
  },
  {
    id: 3,
    author: {
      name: 'Teun',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      rank: 'Member',
    },
    timestamp: '18 juni 2025, 10:02',
    content: 'Contrast-douches (warm/koud) werken bij mij top. En luister naar je lichaam, soms is rust de beste optie.',
  },
];

const ThreadPage = () => {
  return (
    <div className="px-4 md:px-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#8BAE5A] mb-6 flex gap-2 items-center">
        <span>Forum</span>
        <span className="mx-1">&gt;</span>
        <span>Fitness & Gezondheid</span>
        <span className="mx-1">&gt;</span>
        <span className="text-white font-semibold">{thread.title}</span>
      </nav>

      {/* Opening Post */}
      <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border-l-4 border-[#FFD700] border border-[#3A4D23]/40 p-6 mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Image src={thread.author.avatar} alt={thread.author.name} width={48} height={48} className="w-12 h-12 rounded-full border-2 border-[#8BAE5A] object-cover" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{thread.author.name}</span>
              <span className="text-xs text-[#FFD700] bg-[#3A4D23] px-2 py-0.5 rounded">{thread.author.rank}</span>
            </div>
            <div className="text-xs text-[#8BAE5A]">{thread.timestamp}</div>
          </div>
        </div>
        <div className="text-white text-base mt-2 whitespace-pre-line">{thread.content}</div>
      </div>

      {/* Replies */}
      <div className="space-y-6 mb-10">
        {replies.map((reply) => (
          <div key={reply.id} className="bg-[#232D1A]/80 rounded-2xl shadow border border-[#3A4D23]/40 p-5 flex gap-4">
            <Image src={reply.author.avatar} alt={reply.author.name} width={40} height={40} className="w-10 h-10 rounded-full border-2 border-[#8BAE5A] object-cover" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white">{reply.author.name}</span>
                <span className="text-xs text-[#FFD700] bg-[#3A4D23] px-2 py-0.5 rounded">{reply.author.rank}</span>
                <span className="text-xs text-[#8BAE5A] ml-2">{reply.timestamp}</span>
              </div>
              <div className="text-[#E1CBB3] mb-2">{reply.content}</div>
              <div className="flex gap-4 text-[#8BAE5A] text-sm">
                <button className="hover:text-[#FFD700] transition-colors flex items-center gap-1"><span role="img" aria-label="boks">👊</span> Boks</button>
                <button className="hover:text-[#FFD700] transition-colors flex items-center gap-1"><span role="img" aria-label="reageer">💬</span> Reageer</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <div className="bg-[#232D1A]/80 rounded-2xl shadow border border-[#3A4D23]/40 p-5">
        <textarea
          className="w-full bg-[#181F17] text-white rounded-xl p-3 border-none focus:ring-0 placeholder:text-[#8BAE5A] mb-3"
          rows={3}
          placeholder="Schrijf een reactie..."
        />
        <div className="flex justify-end">
          <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">Plaats Reactie</button>
        </div>
      </div>
    </div>
  );
};

export default ThreadPage; 