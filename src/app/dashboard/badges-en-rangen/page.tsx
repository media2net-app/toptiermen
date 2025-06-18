"use client";
import { useState, useEffect } from 'react';
import { FaMedal, FaDumbbell, FaBrain, FaUsers, FaFire, FaCrown, FaStar, FaTrophy, FaLock, FaBolt, FaBookOpen, FaRunning, FaSnowflake, FaUserShield, FaFlag, FaCheckCircle, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const ranks = [
  { name: 'Recruit', icon: <FaFlag />, needed: 0, unlocks: 'Toegang tot community', xpNeeded: 0 },
  { name: 'Initiate', icon: <FaUserShield />, needed: 3, unlocks: 'Squad toegang', xpNeeded: 1000 },
  { name: 'Disciplined', icon: <FaBolt />, needed: 7, unlocks: 'Challenges & badges', xpNeeded: 2500 },
  { name: 'Warrior', icon: <FaDumbbell />, needed: 12, unlocks: 'Exclusieve content', xpNeeded: 5000 },
  { name: 'Alpha', icon: <FaCrown />, needed: 18, unlocks: 'Squad level-ups', xpNeeded: 10000 },
  { name: 'Legion Commander', icon: <FaStar />, needed: 25, unlocks: 'Communityrechten', xpNeeded: 20000 },
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

// XP rewards voor verschillende acties
const xpRewards = {
  dailyLogin: 50,
  completeMission: 100,
  completeChallenge: 250,
  earnBadge: 500,
  squadActivity: 75,
  communityPost: 25,
  readArticle: 50,
  watchVideo: 30,
  completeWorkout: 150,
  streakBonus: 100,
};

// Streak rewards
const streakRewards = {
  3: { xp: 100, badge: 'Beginner Streak' },
  7: { xp: 250, badge: 'Weekly Warrior' },
  14: { xp: 500, badge: 'Consistency King' },
  30: { xp: 1000, badge: 'Monthly Master' },
  100: { xp: 5000, badge: 'Century Club' },
};

// Leaderboard data
const leaderboardData = [
  { rank: 1, name: 'Daniel V.', xp: 18750, badges: 24, streak: 45, squad: 'Elite' },
  { rank: 2, name: 'Rico B.', xp: 16500, badges: 21, streak: 38, squad: 'Alpha' },
  { rank: 3, name: 'Sem J.', xp: 14200, badges: 18, streak: 30, squad: 'Warrior' },
  { rank: 4, name: 'Marco D.', xp: 12800, badges: 15, streak: 25, squad: 'Elite' },
  { rank: 5, name: 'Rick S.', xp: 4200, badges: 8, streak: 12, squad: 'Disciplined' },
];

function BadgeModal({ badge, open, onClose }: { badge: any, open: boolean, onClose: () => void }) {
  if (!open || !badge) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#232D1A] rounded-2xl shadow-2xl p-8 max-w-md w-full relative flex flex-col items-center">
        <button className="absolute top-4 right-4 text-white text-2xl hover:text-[#8BAE5A]" onClick={onClose}>&times;</button>
        <div className="mb-4 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8BAE5A] to-[#FFD700] flex items-center justify-center shadow-2xl mb-2 animate-bounce-slow">
            <span className="text-5xl">{badge.icon}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{badge.title}</div>
          <div className="text-[#8BAE5A] text-sm mb-2">{badge.desc}</div>
          <div className="text-xs text-[#FFD700] mb-2">Ontgrendeld op: 15 juni 2025</div>
          <div className="text-xs text-[#FFD700] mb-4">Zeldzaamheid: Slechts 8% van de leden heeft deze badge</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-xs font-semibold shadow">Deel op profiel</button>
            <button className="px-3 py-1 rounded-xl bg-[#232D1A] text-[#8BAE5A] text-xs font-semibold shadow border border-[#3A4D23]/40">Deel in Brotherhood</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BadgesRangen() {
  const [showRanks, setShowRanks] = useState(true);
  const [showBadge, setShowBadge] = useState<any>(null);
  const [showXpHistory, setShowXpHistory] = useState(false);
  const currentRank = ranks[2]; // Disciplined
  const currentXP = 4200;
  const nextRank = ranks[3];
  const badgesUnlocked = 8;
  const badgesNeeded = nextRank.needed - badgesUnlocked;
  
  // XP geschiedenis voor de laatste 7 dagen
  const xpHistory = [
    { date: '2025-06-01', xp: 150, source: 'Dagelijkse missie' },
    { date: '2025-06-02', xp: 250, source: 'Challenge voltooid' },
    { date: '2025-06-03', xp: 500, source: 'Nieuwe badge' },
    { date: '2025-06-04', xp: 75, source: 'Squad activiteit' },
    { date: '2025-06-05', xp: 100, source: 'Streak bonus' },
    { date: '2025-06-06', xp: 50, source: 'Artikel gelezen' },
    { date: '2025-06-07', xp: 150, source: 'Workout voltooid' },
  ];

  // Bereken XP progressie naar volgende level
  const xpProgress = ((currentXP - currentRank.xpNeeded) / (nextRank.xpNeeded - currentRank.xpNeeded)) * 100;

  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'global'|'squad'>('global');

  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const currentStreak = 12;
  const longestStreak = 17;
  const streakProgress = (currentStreak / 14) * 100; // Progress naar 14-dagen badge

  // Bereken volgende streak milestone
  const nextStreakMilestone = Object.keys(streakRewards)
    .map(Number)
    .find(milestone => milestone > currentStreak) || 30;

  const [xpBarAnimated, setXpBarAnimated] = useState(false);
  useEffect(() => { setXpBarAnimated(true); }, []);

  return (
    <div className="min-h-screen bg-[#181F17] text-white">
      {/* Hero-sectie */}
      <div className="relative w-full h-48 md:h-64 bg-[#232D1A] flex flex-col justify-center items-center shadow-xl border-b-4 border-[#3A4D23] mb-8">
        <div className="absolute left-8 top-8 flex items-center gap-3">
          <span className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">Badges & Rangen</span>
          <span className="ml-2 text-[#FFD700] text-2xl"><FaCrown /></span>
        </div>
        <div className="absolute right-8 top-8">
          <span className="bg-[#232D1A] px-3 py-1 rounded-xl text-[#8BAE5A] text-xs font-semibold border border-[#3A4D23]">Jouw pad naar elite begint hier.</span>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20 rounded-b-3xl z-0" />
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#181F17] to-transparent z-10" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
          <span className="text-[#8BAE5A] text-lg font-bold mb-2">Verdien je plek. Claim je rang.</span>
        </div>
      </div>

      {/* Gecombineerde XP & Rang kaart */}
      <div className="px-4 md:px-12 mb-10">
        <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex items-center gap-4 flex-1 mb-4 md:mb-0">
            <span className="text-4xl md:text-5xl text-[#FFD700]">{currentRank.icon}</span>
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-bold text-[#8BAE5A] flex items-center gap-2">{currentRank.name} <span className="text-base font-normal text-[#8BAE5A]/70">(Level 7)</span></span>
              <span className="text-[#8BAE5A] text-sm">Volgende rang: <b>{nextRank.name}</b> bij <span className="text-[#FFD700] font-bold">{nextRank.xpNeeded} XP</span></span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-3xl font-bold text-[#FFD700] flex items-center gap-2"><FaMedal className="text-[#FFD700]" /> {badgesUnlocked} <span className="text-lg font-normal text-[#8BAE5A]">Badges</span></span>
            <span className="text-[#8BAE5A] text-xs">Volgende rang bij <span className="text-[#FFD700] font-bold">{badgesNeeded} badges</span></span>
          </div>
        </div>
        {/* Geanimeerde XP-balk */}
        <div className="bg-[#232D1A]/80 rounded-2xl p-4 mt-2 shadow-xl border border-[#3A4D23]/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[#8BAE5A] text-sm font-semibold">XP Progressie</span>
            <span className="text-[#FFD700] text-sm font-semibold">{currentXP} / {nextRank.xpNeeded} XP</span>
          </div>
          <div className="w-full h-3 bg-[#8BAE5A]/20 rounded-full overflow-hidden">
            <div 
              className="h-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full transition-all duration-1000"
              style={{ width: xpBarAnimated ? `${xpProgress}%` : '0%', transitionProperty: 'width' }}
            ></div>
          </div>
        </div>
      </div>

      {/* XP Status */}
      <div className="px-4 md:px-12 mb-10">
        <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-[#8BAE5A]">XP Geschiedenis</span>
                <button 
                  onClick={() => setShowXpHistory(!showXpHistory)}
                  className="text-[#8BAE5A] text-sm hover:text-[#FFD700] transition-colors"
                >
                  {showXpHistory ? 'Verberg geschiedenis' : 'Toon geschiedenis'}
                </button>
              </div>
              <div className="space-y-2">
                {xpHistory.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-[#FFD700]">+{entry.xp}</span>
                      <span className="text-[#8BAE5A]">{entry.source}</span>
                    </div>
                    <span className="text-[#8BAE5A]/60">{entry.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Tracking */}
      <div className="px-4 md:px-12 mb-16">
        <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-[#8BAE5A]">Dagelijkse Streak</span>
                <button 
                  onClick={() => setShowStreakDetails(!showStreakDetails)}
                  className="text-[#8BAE5A] text-sm hover:text-[#FFD700] transition-colors"
                >
                  {showStreakDetails ? 'Verberg details' : 'Toon details'}
                </button>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="text-3xl font-bold text-[#FFD700]">{currentStreak}</div>
                <div className="flex flex-col">
                  <span className="text-[#8BAE5A] text-sm">Huidige streak</span>
                  <span className="text-[#8BAE5A]/60 text-xs">Langste: {longestStreak} dagen</span>
                </div>
              </div>
              <div className="w-full h-3 bg-[#8BAE5A]/20 rounded-full overflow-hidden">
                <div 
                  className="h-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full transition-all duration-1000" 
                  style={{ width: `${streakProgress}%`, transitionProperty: 'width' }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8BAE5A]">Volgende milestone</span>
                <span className="text-[#FFD700]">{nextStreakMilestone} dagen</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-[#FFD700]">🔥</span>
              <span className="text-[#8BAE5A] text-sm">Streak Bonus</span>
            </div>
          </div>

          {/* Streak Details */}
          {showStreakDetails && (
            <div className="mt-6 border-t border-[#3A4D23]/40 pt-4">
              <h3 className="text-lg font-semibold text-[#8BAE5A] mb-3">Streak Milestones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(streakRewards).map(([days, reward]) => (
                  <div 
                    key={days}
                    className={`p-3 rounded-xl border ${
                      currentStreak >= Number(days)
                        ? 'bg-gradient-to-r from-[#8BAE5A]/20 to-[#232D1A]/80 border-[#8BAE5A]'
                        : 'bg-[#232D1A]/40 border-[#3A4D23]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#8BAE5A]">{days} dagen</span>
                      {currentStreak >= Number(days) && (
                        <span className="text-[#FFD700]">✓</span>
                      )}
                    </div>
                    <div className="text-sm">
                      <div className="text-[#FFD700]">+{reward.xp} XP</div>
                      <div className="text-[#8BAE5A]">{reward.badge}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Badges-overzicht */}
      <div className="px-4 md:px-12 mb-16">
        <h2 className="text-xl font-bold text-[#8BAE5A] mb-4">Jouw Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {badgeCategories.map(cat => (
            <div key={cat.name} className="bg-[#232D1A]/80 rounded-2xl p-4 shadow-xl border border-[#3A4D23]/40 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2 text-lg font-semibold text-[#8BAE5A]">{cat.icon} {cat.name}</div>
              <div className="flex flex-col gap-3">
                {cat.badges.map((badge, i) => {
                  const unlocked = badge.status === 'unlocked';
                  const progress = badge.status === 'progress';
                  const locked = badge.status === 'locked';
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 shadow transition-all duration-200 relative
                        ${unlocked ? 'border-[#8BAE5A] bg-gradient-to-r from-[#8BAE5A]/20 to-[#232D1A]/80 hover:scale-105 hover:shadow-2xl hover:ring-2 hover:ring-[#FFD700] cursor-pointer animate-glow' :
                          progress ? 'border-[#FFD700] bg-[#232D1A]/60 opacity-90' :
                          'border-[#3A4D23]/40 bg-[#232D1A]/40 opacity-60 grayscale'}
                      `}
                      title={badge.desc}
                      onClick={() => unlocked && setShowBadge({ ...badge, category: cat.name })}
                      style={unlocked ? { boxShadow: '0 0 16px 2px #FFD70055' } : {}}
                    >
                      <span className={`text-2xl ${unlocked ? 'drop-shadow-glow text-[#8BAE5A] animate-bounce-slow' : locked ? 'text-[#8BAE5A]/30' : 'text-[#FFD700]'}`}>{badge.icon}</span>
                      <div className="flex flex-col">
                        <span className={`font-bold text-sm ${unlocked ? 'text-[#8BAE5A]' : locked ? 'text-[#8BAE5A]/40' : 'text-[#FFD700]'}`}>{badge.title}</span>
                        <span className={`text-xs ${unlocked ? 'text-[#FFD700]' : locked ? 'text-[#FFD700]/40' : 'text-[#FFD700]'}`}>{badge.desc}</span>
                      </div>
                      {unlocked && <FaCheckCircle className="text-[#8BAE5A] ml-auto" />}
                      {progress && <span className="ml-auto text-[#FFD700] text-xs font-bold">In progress</span>}
                      {locked && <FaLock className="text-[#3A4D23]/40 ml-auto" />}
                      {unlocked && <span className="absolute -top-2 -right-2 animate-pulse text-[#FFD700] text-xl">★</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <BadgeModal badge={showBadge} open={!!showBadge} onClose={() => setShowBadge(null)} />
      </div>

      {/* Rangen & Levels-overzicht */}
      <div className="px-4 md:px-12 mb-16">
        <div className="flex items-center gap-2 mb-4 cursor-pointer select-none" onClick={() => setShowRanks(!showRanks)}>
          <span className="text-lg font-bold text-[#8BAE5A]">Rangen & Progressie</span>
          {showRanks ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {showRanks && (
          <div className="flex flex-col md:flex-row gap-8">
            {ranks.map((rank, i) => (
              <div key={rank.name} className="flex-1 bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border-2 border-[#8BAE5A] flex flex-col items-center gap-2">
                <span className="text-3xl mb-2 text-[#FFD700]">{rank.icon}</span>
                <span className="font-bold text-[#8BAE5A] text-lg">{rank.name}</span>
                <span className="text-xs text-[#FFD700]">Nodig: <b>{rank.needed} badges</b></span>
                <span className="text-xs text-[#FFD700]">Unlocks: {rank.unlocks}</span>
                {i === 2 && <span className="mt-2 px-2 py-1 rounded bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-xs font-bold text-[#181F17] shadow">Jouw huidige rang</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Community highlights */}
      <div className="px-4 md:px-12 mb-16">
        <h2 className="text-xl font-bold text-[#8BAE5A] mb-4">Legends Wall</h2>
        <div className="flex gap-6 flex-wrap">
          {communityBadges.map((b, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#232D1A]/80 rounded-xl p-4 shadow border border-[#3A4D23]/40 min-w-[180px]">
              <span className="text-3xl text-[#FFD700]">{b.icon}</span>
              <div className="flex flex-col">
                <span className="font-bold text-[#8BAE5A] text-sm mb-1">{b.title}</span>
                <span className="text-[#FFD700] text-xs">{b.count}x behaald</span>
              </div>
          </div>
        ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="px-4 md:px-12 mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#8BAE5A]">Leaderboard</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setLeaderboardFilter('global')}
              className={`px-3 py-1 rounded-xl text-sm font-semibold transition-colors ${
                leaderboardFilter === 'global' 
                  ? 'bg-[#8BAE5A] text-[#181F17]' 
                  : 'bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]/40'
              }`}
            >
              Globaal
            </button>
            <button 
              onClick={() => setLeaderboardFilter('squad')}
              className={`px-3 py-1 rounded-xl text-sm font-semibold transition-colors ${
                leaderboardFilter === 'squad' 
                  ? 'bg-[#8BAE5A] text-[#181F17]' 
                  : 'bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]/40'
              }`}
            >
              Squad
            </button>
          </div>
        </div>

        <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40">
          <div className="space-y-4">
            {leaderboardData.map((user, i) => (
              <div 
                key={i}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
                  i === 4 ? 'bg-gradient-to-r from-[#8BAE5A]/20 to-[#232D1A]/80 border-2 border-[#8BAE5A]' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#232D1A] border border-[#3A4D23]/40 flex items-center justify-center font-bold text-[#FFD700]">
                  {user.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#8BAE5A]">{user.name}</span>
                    <span className="text-xs text-[#FFD700]">Squad: {user.squad}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-[#8BAE5A]">{user.xp} XP</span>
                    <span className="text-xs text-[#8BAE5A]">{user.badges} badges</span>
                    <span className="text-xs text-[#FFD700]">{user.streak} dagen streak</span>
                  </div>
                </div>
                {i < 3 && (
                  <div className="text-2xl">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="px-4 md:px-12 mb-16 flex flex-col items-center">
        <span className="text-lg font-bold text-[#8BAE5A] mb-2">Klaar om jouw volgende badge te halen?</span>
        <div className="flex gap-4">
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow hover:from-[#FFD700] hover:to-[#8BAE5A] flex items-center gap-2">Bekijk actieve challenges</button>
          <button className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] font-semibold shadow hover:bg-[#FFD700] hover:text-[#181F17] flex items-center gap-2">Naar routines</button>
          <button className="px-4 py-2 rounded-xl bg-[#FFD700] text-[#181F17] font-semibold shadow hover:bg-[#8BAE5A] hover:text-white flex items-center gap-2">Community Wall</button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes glow {
          0% { box-shadow: 0 0 8px 2px #FFD70055; }
          50% { box-shadow: 0 0 24px 6px #FFD70099; }
          100% { box-shadow: 0 0 8px 2px #FFD70055; }
        }
        .animate-glow { animation: glow 2s infinite; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-slow { animation: bounce-slow 1.8s infinite; }
      `}</style>
    </div>
  );
} 