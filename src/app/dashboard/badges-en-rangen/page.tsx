"use client";
import { useState } from 'react';
import { FaMedal, FaDumbbell, FaBrain, FaUsers, FaFire, FaCrown, FaStar, FaTrophy, FaLock, FaBolt, FaBookOpen, FaRunning, FaSnowflake, FaUserShield, FaFlag, FaCheckCircle, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const ranks = [
  { name: 'Recruit', icon: <FaFlag />, needed: 0, unlocks: 'Toegang tot community' },
  { name: 'Initiate', icon: <FaUserShield />, needed: 3, unlocks: 'Squad toegang' },
  { name: 'Disciplined', icon: <FaBolt />, needed: 7, unlocks: 'Challenges & badges' },
  { name: 'Warrior', icon: <FaDumbbell />, needed: 12, unlocks: 'Exclusieve content' },
  { name: 'Alpha', icon: <FaCrown />, needed: 18, unlocks: 'Squad level-ups' },
  { name: 'Legion Commander', icon: <FaStar />, needed: 25, unlocks: 'Communityrechten' },
];

const badgeCategories = [
  {
    name: 'Dagelijkse discipline',
    icon: <FaFire className="text-orange-400" />,
    badges: [
      { icon: <FaBolt />, title: 'Vroege Vogel', desc: '5 dagen vroeg op', status: 'unlocked' },
      { icon: <FaFire />, title: 'No Excuses', desc: '10 dagen geen excuus', status: 'progress' },
      { icon: <FaBookOpen />, title: 'Lezer', desc: 'Eerste boek uitgelezen', status: 'locked' },
    ],
  },
  {
    name: 'Fysieke groei',
    icon: <FaDumbbell className="text-blue-400" />,
    badges: [
      { icon: <FaRunning />, title: 'Runner', desc: '5 km hardlopen', status: 'unlocked' },
      { icon: <FaDumbbell />, title: 'Workout King', desc: '30 workouts voltooid', status: 'progress' },
      { icon: <FaFire />, title: 'Vetverlies', desc: '5% vetpercentage kwijt', status: 'locked' },
    ],
  },
  {
    name: 'Mentale kracht',
    icon: <FaBrain className="text-purple-400" />,
    badges: [
      { icon: <FaSnowflake />, title: 'Cold Shower', desc: '10 koude douches', status: 'unlocked' },
      { icon: <FaBookOpen />, title: 'Mindset Master', desc: '3 mindsetboeken gelezen', status: 'progress' },
      { icon: <FaMedal />, title: 'Meditatie', desc: '7 dagen meditatie', status: 'locked' },
    ],
  },
  {
    name: 'Brotherhood activiteit',
    icon: <FaUsers className="text-green-400" />,
    badges: [
      { icon: <FaUsers />, title: 'Connector', desc: 'Eerste post gedeeld', status: 'unlocked' },
      { icon: <FaTrophy />, title: 'Buddy', desc: 'Buddy uitgedaagd', status: 'progress' },
      { icon: <FaCrown />, title: 'Challenge Winner', desc: 'Challenge afgerond', status: 'locked' },
    ],
  },
  {
    name: 'Specials',
    icon: <FaStar className="text-yellow-400" />,
    badges: [
      { icon: <FaFire />, title: 'Spartan', desc: 'Spartan Challenge voltooid', status: 'unlocked' },
      { icon: <FaCrown />, title: '75 Hard', desc: '75 Hard Completion', status: 'progress' },
      { icon: <FaLock />, title: 'No Surrender', desc: 'No Surrender-badge', status: 'locked' },
    ],
  },
];

const communityBadges = [
  { icon: <FaCrown className="text-yellow-400" />, title: 'Consistency King', count: 12 },
  { icon: <FaFire className="text-orange-400" />, title: 'No Excuses', count: 9 },
  { icon: <FaDumbbell className="text-blue-400" />, title: 'Workout King', count: 7 },
];

export default function BadgesRangen() {
  const [showRanks, setShowRanks] = useState(true);
  const currentRank = ranks[2]; // Disciplined
  const currentXP = 420;
  const nextRank = ranks[3];
  const badgesUnlocked = 8;
  const badgesNeeded = nextRank.needed - badgesUnlocked;

  return (
    <div className="min-h-screen bg-[#111111] text-[#C49C48]">
      {/* Hero-sectie */}
      <div className="relative w-full h-48 md:h-64 bg-[#181818] flex flex-col justify-center items-center shadow-xl border-b-4 border-[#C49C48] mb-8">
        <div className="absolute left-8 top-8 flex items-center gap-3">
          <span className="text-3xl md:text-4xl font-bold text-[#C49C48] drop-shadow-lg">Badges & Rangen</span>
          <span className="ml-2 text-[#C49C48] text-2xl"><FaCrown /></span>
        </div>
        <div className="absolute right-8 top-8">
          <span className="bg-[#181818] px-3 py-1 rounded-xl text-[#C49C48] text-xs font-semibold border border-[#C49C48]">Jouw pad naar elite begint hier.</span>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 rounded-b-3xl z-0" />
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#111111] to-transparent z-10" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
          <span className="text-[#C49C48] text-lg font-bold mb-2">Verdien je plek. Claim je rang.</span>
        </div>
      </div>

      {/* Je huidige status */}
      <div className="px-4 md:px-12 mb-10">
        <div className="bg-[#181818]/80 rounded-2xl p-6 shadow-xl border border-[#C49C48]/40 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex flex-col gap-2 flex-1">
            <span className="text-2xl font-bold text-[#C49C48] flex items-center gap-2">{currentRank.icon} Huidige rang: <span className="text-[#C49C48]">{currentRank.name}</span></span>
            <span className="text-[#C49C48] text-sm">Level 7</span>
            <div className="w-full h-3 bg-[#C49C48]/20 rounded-full overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-[#C49C48] to-[#B8860B] rounded-full transition-all duration-1000" style={{ width: '60%', transitionProperty: 'width' }}></div>
            </div>
            <span className="text-[#C49C48] text-xs">XP: {currentXP} / 700</span>
          </div>
          <div>
            <span className="text-3xl font-bold text-[#C49C48] flex items-center gap-2"><FaMedal className="text-[#C49C48]" /> {badgesUnlocked} Badges</span>
            <span className="text-[#C49C48] text-xs">Volgende rang bij <span className="text-[#C49C48] font-bold">{badgesNeeded} badges</span></span>
          </div>
        </div>
      </div>

      {/* Badges-overzicht */}
      <div className="px-4 md:px-12 mb-16">
        <h2 className="text-xl font-bold text-[#C49C48] mb-4">Jouw Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {badgeCategories.map(cat => (
            <div key={cat.name} className="bg-[#181818]/80 rounded-2xl p-4 shadow-xl border border-[#C49C48]/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2 text-lg font-semibold text-[#C49C48]">{cat.icon} {cat.name}</div>
              <div className="flex flex-col gap-3">
                {cat.badges.map((badge, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 shadow transition-all duration-200 ${badge.status === 'unlocked' ? 'border-[#C49C48] bg-gradient-to-r from-[#C49C48]/20 to-[#181818]/80 animate-pulse' : badge.status === 'progress' ? 'border-[#B8860B] bg-[#181818]/60' : 'border-[#C49C48]/40 bg-[#181818]/40 opacity-60'} hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-[#E5C97B]`}
                    title={badge.desc}
                  >
                    <span className={`text-2xl ${badge.status === 'unlocked' ? 'drop-shadow-glow text-[#C49C48]' : 'text-[#C49C48]'}`}>{badge.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#C49C48] text-sm">{badge.title}</span>
                      <span className="text-xs text-[#E5C97B]">{badge.desc}</span>
                    </div>
                    {badge.status === 'unlocked' && <FaCheckCircle className="text-[#C49C48] ml-auto" />}
                    {badge.status === 'progress' && <span className="ml-auto text-[#E5C97B] text-xs font-bold">In progress</span>}
                    {badge.status === 'locked' && <FaLock className="text-[#C49C48]/40 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rangen & Levels-overzicht */}
      <div className="px-4 md:px-12 mb-16">
        <div className="flex items-center gap-2 mb-4 cursor-pointer select-none" onClick={() => setShowRanks(!showRanks)}>
          <span className="text-lg font-bold text-[#C49C48]">Rangen & Progressie</span>
          {showRanks ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {showRanks && (
          <div className="flex flex-col md:flex-row gap-8">
            {ranks.map((rank, i) => (
              <div key={rank.name} className="flex-1 bg-[#181818]/80 rounded-2xl p-6 shadow-xl border-2 border-[#C49C48] flex flex-col items-center gap-2">
                <span className="text-3xl mb-2">{rank.icon}</span>
                <span className="font-bold text-[#C49C48] text-lg">{rank.name}</span>
                <span className="text-xs text-[#E5C97B]">Nodig: <b>{rank.needed} badges</b></span>
                <span className="text-xs text-[#E5C97B]">Unlocks: {rank.unlocks}</span>
                {i === 2 && <span className="mt-2 px-2 py-1 rounded bg-gradient-to-r from-[#C49C48] to-[#B8860B] text-xs font-bold text-[#181818] shadow">Jouw huidige rang</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Community highlights */}
      <div className="px-4 md:px-12 mb-16">
        <h2 className="text-xl font-bold text-[#C49C48] mb-4">Legends Wall</h2>
        <div className="flex gap-6 flex-wrap">
          {communityBadges.map((b, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#181818]/80 rounded-xl p-4 shadow border border-[#C49C48]/40 min-w-[180px]">
              <span className="text-3xl">{b.icon}</span>
              <div className="flex flex-col">
                <span className="font-bold text-[#C49C48] text-sm mb-1">{b.title}</span>
                <span className="text-[#E5C97B] text-xs">{b.count}x behaald</span>
              </div>
          </div>
        ))}
        </div>
      </div>

      {/* Call to action */}
      <div className="px-4 md:px-12 mb-16 flex flex-col items-center">
        <span className="text-lg font-bold text-[#C49C48] mb-2">Klaar om jouw volgende badge te halen?</span>
        <div className="flex gap-4">
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C49C48] to-[#B8860B] text-black font-semibold shadow hover:from-[#E5C97B] hover:to-[#C49C48] flex items-center gap-2">Bekijk actieve challenges</button>
          <button className="px-4 py-2 rounded-xl bg-[#181818] text-[#C49C48] font-semibold shadow hover:bg-[#B8860B] flex items-center gap-2">Naar routines</button>
          <button className="px-4 py-2 rounded-xl bg-[#B8860B] text-black font-semibold shadow hover:bg-[#C49C48] flex items-center gap-2">Community Wall</button>
        </div>
      </div>
    </div>
  );
} 