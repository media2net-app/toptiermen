import React from 'react';
import Link from 'next/link';

const categories = [
  {
    emoji: '💪',
    title: 'Fitness & Gezondheid',
    description: "Alles over trainingsschema's, voeding, herstel en blessurepreventie.",
    stats: { topics: 56, replies: 312 },
    lastPost: { title: 'Beste eiwitshake?', author: 'Mark V.', time: '2 min geleden' },
    href: '/dashboard/brotherhood/forum/fitness-gezondheid',
  },
  {
    emoji: '💰',
    title: 'Finance & Business',
    description: 'Discussies over investeren, ondernemen, budgetteren en financiële onafhankelijkheid.',
    stats: { topics: 34, replies: 189 },
    lastPost: { title: "Risico's van crypto?", author: 'Jeroen D.', time: '15 min geleden' },
  },
  {
    emoji: '🧠',
    title: 'Mind & Focus',
    description: 'Mindset, productiviteit, focus en mentale kracht.',
    stats: { topics: 22, replies: 98 },
    lastPost: { title: 'Morning routine tips', author: 'Rick', time: '1 uur geleden' },
  },
  {
    emoji: '📚',
    title: 'Boekenkamer Discussies',
    description: 'Boekentips, samenvattingen en leeservaringen.',
    stats: { topics: 18, replies: 77 },
    lastPost: { title: 'Top 3 mindset boeken', author: 'Sven', time: '3 uur geleden' },
  },
  {
    emoji: '🏆',
    title: 'Successen & Mislukkingen',
    description: 'Deel je overwinningen en leer van tegenslagen.',
    stats: { topics: 12, replies: 54 },
    lastPost: { title: 'Mijn grootste les', author: 'Teun', time: '5 uur geleden' },
  },
];

const ForumOverview = () => {
  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-0">
      {/* Linkerkolom: Categorieën */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Forum</h2>
          <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">+ Start Nieuwe Discussie</button>
        </div>
        {categories.map((cat, idx) => (
          idx === 0 ? (
            <Link key={cat.title} href={cat.href!} className="group bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 flex flex-col gap-4 hover:shadow-2xl hover:-translate-y-1 hover:border-[#FFD700] transition-all cursor-pointer no-underline">
              <div className="flex items-center gap-4">
                <span className="text-4xl md:text-5xl">{cat.emoji}</span>
                <div>
                  <div className="text-xl font-bold text-white mb-1">{cat.title}</div>
                  <div className="text-[#8BAE5A] text-sm mb-2">{cat.description}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs mt-2">
                <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-3 py-1 rounded-full font-semibold">Topics: {cat.stats.topics}</span>
                <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-3 py-1 rounded-full font-semibold">Reacties: {cat.stats.replies}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-[#8BAE5A]">
                <span className="hidden sm:inline">Laatste post:</span>
                <span className="text-white font-semibold truncate max-w-[120px] sm:max-w-[180px]">Re: {cat.lastPost.title}</span>
                <span className="text-[#FFD700]">door {cat.lastPost.author}</span>
                <span className="text-[#8BAE5A]">- {cat.lastPost.time}</span>
              </div>
            </Link>
          ) : (
            <div key={cat.title} className="group bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 flex flex-col gap-4 hover:shadow-2xl hover:-translate-y-1 hover:border-[#FFD700] transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <span className="text-4xl md:text-5xl">{cat.emoji}</span>
                <div>
                  <div className="text-xl font-bold text-white mb-1">{cat.title}</div>
                  <div className="text-[#8BAE5A] text-sm mb-2">{cat.description}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs mt-2">
                <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-3 py-1 rounded-full font-semibold">Topics: {cat.stats.topics}</span>
                <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-3 py-1 rounded-full font-semibold">Reacties: {cat.stats.replies}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-[#8BAE5A]">
                <span className="hidden sm:inline">Laatste post:</span>
                <span className="text-white font-semibold truncate max-w-[120px] sm:max-w-[180px]">Re: {cat.lastPost.title}</span>
                <span className="text-[#FFD700]">door {cat.lastPost.author}</span>
                <span className="text-[#8BAE5A]">- {cat.lastPost.time}</span>
              </div>
            </div>
          )
        ))}
      </div>
      {/* Rechterkolom: Widgets */}
      <aside className="w-full md:w-[340px] flex flex-col gap-6 mt-10 md:mt-0">
        <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-5">
          <h3 className="text-lg font-bold text-white mb-3">Recente Activiteit</h3>
          <ul className="text-[#8BAE5A] text-sm space-y-2">
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Re: Beste eiwitshake? <span className="text-[#FFD700]">Mark V.</span></li>
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Re: Risico's van crypto? <span className="text-[#FFD700]">Jeroen D.</span></li>
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Re: Morning routine tips <span className="text-[#FFD700]">Rick</span></li>
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Re: Top 3 mindset boeken <span className="text-[#FFD700]">Sven</span></li>
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Re: Mijn grootste les <span className="text-[#FFD700]">Teun</span></li>
          </ul>
        </div>
        <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-5">
          <h3 className="text-lg font-bold text-white mb-3">Populaire Topics (Deze Week)</h3>
          <ul className="text-[#8BAE5A] text-sm space-y-2">
            <li><span className="inline-block w-2 h-2 bg-[#8BAE5A] rounded-full mr-2 align-middle"></span>Beste eiwitshake? <span className="text-[#8BAE5A]">(23 reacties)</span></li>
            <li><span className="inline-block w-2 h-2 bg-[#8BAE5A] rounded-full mr-2 align-middle"></span>Risico's van crypto? <span className="text-[#8BAE5A]">(19 reacties)</span></li>
            <li><span className="inline-block w-2 h-2 bg-[#8BAE5A] rounded-full mr-2 align-middle"></span>Morning routine tips <span className="text-[#8BAE5A]">(15 reacties)</span></li>
          </ul>
        </div>
        <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-5">
          <h3 className="text-lg font-bold text-white mb-3">Onbeantwoorde Vragen</h3>
          <ul className="text-[#8BAE5A] text-sm space-y-2">
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Hoe herstel je sneller na een zware training?</li>
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Wat is de beste manier om te starten met beleggen?</li>
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Welke boeken raden jullie aan voor focus?</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default ForumOverview; 