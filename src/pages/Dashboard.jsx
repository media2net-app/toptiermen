import { useEffect, useState } from 'react';

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
    <>
      <div className={`mb-8 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Welkom, Rick!</h1>
        <p className="text-[#A3AED6] text-lg mb-4">Jouw persoonlijke Top Tier Men dashboard</p>
        <div className="bg-[#232042]/80 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl border border-[#393053]/40">
          <div className="flex-1">
            <div className="text-xl text-white font-semibold mb-2">Motivational quote</div>
            <blockquote className="italic text-[#A3AED6]">“Discipline is the bridge between goals and accomplishment.”</blockquote>
            <div className="mt-4 text-xs text-[#A3AED6]">- Rick</div>
          </div>
        </div>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#635985]">
          <span className="text-[#A3AED6] text-sm mb-1">Voortgang</span>
          <span className="text-3xl font-bold text-white">{progress}%</span>
          <div className="w-full h-2 bg-[#393053]/40 rounded-full mt-2">
            <div className="h-2 bg-gradient-to-r from-[#635985] to-[#443C68] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#635985]">
          <span className="text-[#A3AED6] text-sm mb-1">Level</span>
          <span className="text-3xl font-bold text-white">4</span>
        </div>
        <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#635985]">
          <span className="text-[#A3AED6] text-sm mb-1">Badges</span>
          <span className="text-3xl font-bold text-white">7</span>
        </div>
        <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#635985]">
          <span className="text-[#A3AED6] text-sm mb-1">Dagelijkse Missie</span>
          <span className="text-lg font-semibold text-white text-center">10.000 stappen<br />30 min lezen</span>
        </div>
      </div>
      {/* Badges sectie */}
      <div className={`mb-8 transition-opacity duration-700 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <h2 className="text-2xl font-bold text-white mb-4">Behaalde Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {badges.map((badge, i) => (
            <div
              key={badge.name}
              className="bg-[#232042]/80 rounded-2xl p-5 shadow-xl border border-[#393053]/40 flex flex-col items-center gap-2 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#635985]"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="text-4xl mb-2">{badge.icon}</span>
              <span className="text-lg font-semibold text-white text-center">{badge.name}</span>
              <span className="text-[#A3AED6] text-sm text-center">{badge.description}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Overzicht van modules, badges, missies etc. kan hier verder worden uitgebreid */}
    </>
  );
} 