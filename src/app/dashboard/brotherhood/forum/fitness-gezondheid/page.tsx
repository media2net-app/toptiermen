'use client';
import React from 'react';
import Link from 'next/link';

const pinnedTopics = [
  {
    id: 1,
    title: '📌 Categorie Regels',
    starter: 'Admin',
    date: '1 jan 2024',
    replies: 12,
    likes: 34,
    last: { author: 'Rick', time: '09:12' },
    pinned: true,
  },
  {
    id: 2,
    title: '📌 Lees dit eerst: Trainingsgids voor Beginners',
    starter: 'Jeroen D.',
    date: '3 jan 2024',
    replies: 8,
    likes: 21,
    last: { author: 'Sven', time: '10:45' },
    pinned: true,
  },
];

const topics = Array.from({ length: 54 }, (_, i) => ({
  id: i + 3,
  title: `Topic ${i + 1}: Vraag over training of voeding?`,
  starter: ['Rick', 'Sven', 'Teun', 'Jeroen D.'][i % 4],
  date: `18 juni 2025`,
  replies: Math.floor(Math.random() * 20),
  likes: Math.floor(Math.random() * 40),
  last: { author: ['Mark V.', 'Rick', 'Sven', 'Teun'][i % 4], time: `${8 + (i % 12)}:${(10 + i) % 60}` },
  pinned: false,
}));

const allTopics = [...pinnedTopics, ...topics];

const FitnessGezondheidCategory = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Fitness & Gezondheid</h2>
          <p className="text-[#8BAE5A] text-sm">Alles over trainingsschema's, voeding, herstel en blessurepreventie.</p>
        </div>
        <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">+ Start Nieuwe Discussie</button>
      </div>
      <div className="overflow-x-auto bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-[#8BAE5A] border-b border-[#3A4D23]/40">
              <th className="text-left px-6 py-4 font-semibold">Onderwerp</th>
              <th className="text-left px-6 py-4 font-semibold">Gestart door</th>
              <th className="text-center px-4 py-4 font-semibold">Reacties</th>
              <th className="text-center px-4 py-4 font-semibold">Boks 👊</th>
              <th className="text-left px-6 py-4 font-semibold">Laatste activiteit</th>
            </tr>
          </thead>
          <tbody>
            {allTopics.map((topic) => (
              topic.pinned ? (
                <tr key={topic.id} className="border-b border-[#3A4D23]/20 bg-[#3A4D23]/30">
                  <td className="px-6 py-4 text-white font-semibold flex items-center gap-2">
                    <span className="text-[#FFD700]">📌</span>
                    <span>{topic.title}</span>
                  </td>
                  <td className="px-6 py-4 text-[#8BAE5A]">{topic.starter}<br /><span className="text-xs text-[#8BAE5A]/70">{topic.date}</span></td>
                  <td className="px-4 py-4 text-center text-[#FFD700] font-bold">{topic.replies}</td>
                  <td className="px-4 py-4 text-center text-[#8BAE5A] font-bold">{topic.likes}</td>
                  <td className="px-6 py-4 text-[#8BAE5A]">
                    <span className="font-semibold text-white">{topic.last.author}</span>
                    <span className="ml-2 text-xs text-[#8BAE5A]/70">{topic.last.time}</span>
                  </td>
                </tr>
              ) : (
                <tr key={topic.id} className="border-b border-[#3A4D23]/20 hover:bg-[#181F17]/60 transition cursor-pointer">
                  <td className="px-6 py-4 text-white font-semibold flex items-center gap-2">
                    <Link href="/dashboard/brotherhood/forum/fitness-gezondheid/thread" className="w-full block hover:underline focus:outline-none">
                      {topic.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-[#8BAE5A]">{topic.starter}<br /><span className="text-xs text-[#8BAE5A]/70">{topic.date}</span></td>
                  <td className="px-4 py-4 text-center text-[#FFD700] font-bold">{topic.replies}</td>
                  <td className="px-4 py-4 text-center text-[#8BAE5A] font-bold">{topic.likes}</td>
                  <td className="px-6 py-4 text-[#8BAE5A]">
                    <span className="font-semibold text-white">{topic.last.author}</span>
                    <span className="ml-2 text-xs text-[#8BAE5A]/70">{topic.last.time}</span>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FitnessGezondheidCategory; 