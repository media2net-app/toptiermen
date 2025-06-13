'use client';
import { useEffect, useState } from 'react';
import ClientLayout from '../components/ClientLayout';
import Image from 'next/image';

const badges = [
  {
    name: 'Iron Discipline',
    description: '30 dagen geen enkele afspraak gemist',
    icon: '🛡️',
  },
  {
    name: 'Spartan Week Survivor',
    description: 'Fysieke challenge behaald',
    icon: '⚔️',
  },
  {
    name: 'Money Machine',
    description: 'Eerste €10k eigen omzet',
    icon: '💰',
  },
  {
    name: 'Silent Strength',
    description: '7 dagen digitale stilte volbracht',
    icon: '🤫',
  },
  {
    name: 'Warrior Monk',
    description: 'Geen alcohol/sugar/socials 30 dagen',
    icon: '🧘‍♂️',
  },
];

export default function Dashboard() {
  const [progress, setProgress] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const end = 68;
    const duration = 900;
    const step = () => {
      setProgress((prev) => {
        if (prev < end) {
          return Math.min(prev + 2, end);
        }
        return prev;
      });
    };
    if (progress < end) {
      const interval = setInterval(step, duration / end);
      return () => clearInterval(interval);
    }
  }, [progress]);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  return (
    <ClientLayout>
      <div className={`mb-8 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-2">
          <span className="text-white">WELKOM, </span>
          <span className="text-[#8BAE5A]">RICK!</span>
        </h1>
        <p className="text-[#8BAE5A] text-lg mb-4">Jouw persoonlijke Top Tier Men dashboard</p>
        <div className="bg-[#232D1A]/80 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl border border-[#3A4D23]/40">
          <div className="flex-1">
            <div className="text-xl text-white font-semibold mb-2">Motivational quote</div>
            <blockquote className="italic text-[#8BAE5A]">"Discipline is the bridge between goals and accomplishment."</blockquote>
            <div className="mt-4 text-xs text-[#8BAE5A]">- Rick</div>
          </div>
        </div>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-[#181F17]/90 rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]">
          <span className="text-[#8BAE5A] text-sm mb-1">Voortgang</span>
          <span className="text-3xl font-bold text-[#8BAE5A]">{progress}%</span>
          <div className="w-full h-2 bg-[#8BAE5A]/20 rounded-full mt-2">
            <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="bg-[#181F17]/90 rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]">
          <span className="text-[#8BAE5A] text-sm mb-1">Level</span>
          <span className="text-3xl font-bold text-[#8BAE5A]">4</span>
        </div>
        <div className="bg-[#181F17]/90 rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]">
          <span className="text-[#8BAE5A] text-sm mb-1">Badges</span>
          <span className="text-3xl font-bold text-[#8BAE5A]">7</span>
        </div>
        <div className="bg-[#181F17]/90 rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]">
          <span className="text-[#8BAE5A] text-sm mb-1">Dagelijkse Missie</span>
          <span className="text-lg font-semibold text-[#8BAE5A] text-center">10.000 stappen<br />30 min lezen</span>
        </div>
      </div>
      {/* Badges sectie */}
      <div className={`mb-8 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">Behaalde Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Badge 1: No Excuses */}
          <div className="bg-[#181F17]/90 rounded-2xl p-5 shadow-xl border border-[#8BAE5A]/40 flex flex-col items-center gap-2 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]">
            <span className="mb-2">
              <Image src={require('../../badge1.png')} alt="No Excuses badge" width={90} height={90} className="rounded-lg" />
            </span>
            <span className="text-lg font-semibold text-[#8BAE5A] text-center">No Excuses</span>
          </div>
          {/* Badge 2: Pain is Fuel */}
          <div className="bg-[#181F17]/90 rounded-2xl p-5 shadow-xl border border-[#8BAE5A]/40 flex flex-col items-center gap-2 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]">
            <span className="mb-2">
              <Image src={require('../../badge2.png')} alt="Pain is Fuel badge" width={90} height={90} className="rounded-lg" />
            </span>
            <span className="text-lg font-semibold text-[#8BAE5A] text-center">Pain is Fuel</span>
          </div>
          {/* Badge 3: Iron Discipline */}
          <div className="bg-[#181F17]/90 rounded-2xl p-5 shadow-xl border border-[#8BAE5A]/40 flex flex-col items-center gap-2 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A]">
            <span className="mb-2">
              <Image src={require('../../badge3.png')} alt="Iron Discipline badge" width={90} height={90} className="rounded-lg" />
            </span>
            <span className="text-lg font-semibold text-[#8BAE5A] text-center">Iron Discipline</span>
          </div>
        </div>
      </div>
      {/* Overzicht van modules, badges, missies etc. kan hier verder worden uitgebreid */}
    </ClientLayout>
  );
} 