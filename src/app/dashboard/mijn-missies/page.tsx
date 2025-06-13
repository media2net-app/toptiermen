'use client';
import ClientLayout from '../../components/ClientLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const modules = [
  {
    title: 'Discipline & Identiteit',
    description: 'Ontwikkel een onwankelbare identiteit en dagelijkse discipline.',
    progress: 80,
    href: '/dashboard/mijn-missies/discipline-identiteit',
  },
  {
    title: 'Fysieke Dominantie',
    description: 'Werk aan kracht, uithoudingsvermogen en fysieke gezondheid.',
    progress: 60,
  },
  {
    title: 'Mentale Weerbaarheid',
    description: 'Vergroot je mentale kracht en veerkracht.',
    progress: 45,
  },
  {
    title: 'Financiële Groei',
    description: 'Leer alles over geld, investeren en financiële vrijheid.',
    progress: 30,
  },
  {
    title: 'High Performance Lifestyle',
    description: 'Optimaliseer je routines voor maximale prestaties.',
    progress: 55,
  },
  {
    title: 'Broederschap',
    description: 'Bouw aan een sterk netwerk en accountability.',
    progress: 20,
  },
];

export default function MijnMissies() {
  const [animated, setAnimated] = useState(Array(modules.length).fill(0));

  useEffect(() => {
    modules.forEach((mod, i) => {
      const end = mod.progress;
      const duration = 900;
      const step = () => {
        setAnimated((prev) => {
          const next = [...prev];
          if (next[i] < end) {
            next[i] = Math.min(next[i] + 2, end);
          }
          return next;
        });
      };
      if (animated[i] < end) {
        const interval = setInterval(step, duration / end);
        return () => clearInterval(interval);
      }
    });
  }, [animated]);

  return (
    <ClientLayout>
      <div className="p-6 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mijn Missies</h1>
        <p className="text-[#8BAE5A] text-lg mb-8">Overzicht van alle modules en jouw voortgang</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modules.map((mod, i) =>
            i === 0 ? (
              <Link
                key={mod.title}
                href={mod.href!}
                className="bg-[#181F17]/90 rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40 flex flex-col gap-2 cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-semibold text-[#8BAE5A]">{mod.title}</span>
                  <span className="text-[#8BAE5A] font-mono text-sm">{animated[i]}%</span>
                </div>
                <p className="text-[#A6C97B] mb-2 text-sm">{mod.description}</p>
                <div className="w-full h-2 bg-[#8BAE5A]/20 rounded-full">
                  <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-full transition-all duration-500" style={{ width: `${animated[i]}%` }}></div>
                </div>
              </Link>
            ) : (
              <div key={mod.title} className="bg-[#181F17]/90 rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-semibold text-[#8BAE5A]">{mod.title}</span>
                  <span className="text-[#8BAE5A] font-mono text-sm">{animated[i]}%</span>
                </div>
                <p className="text-[#A6C97B] mb-2 text-sm">{mod.description}</p>
                <div className="w-full h-2 bg-[#8BAE5A]/20 rounded-full">
                  <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-full transition-all duration-500" style={{ width: `${animated[i]}%` }}></div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </ClientLayout>
  );
} 