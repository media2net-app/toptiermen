"use client";
import { useState, useEffect } from 'react';
import { FaMedal, FaDumbbell, FaBrain, FaUsers, FaFire, FaCrown, FaStar, FaTrophy, FaLock, FaBolt, FaBookOpen, FaRunning, FaSnowflake, FaUserShield, FaFlag, FaCheckCircle, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getRanks, 
  getBadgeCategories, 
  getUserXP, 
  getUserBadges, 
  getXPHistory, 
  getUserStreaks, 
  getLeaderboard, 
  getStreakRewards,
  getIconForDisplay,
  type Rank,
  type BadgeCategory,
  type Badge,
  type UserBadge,
  type UserXP,
  type XPTransaction,
  type UserStreak,
  type LeaderboardEntry
} from '@/lib/badges-api';

// React Icon mapping
const iconComponents = {
  FaFlag: <FaFlag />,
  FaUserShield: <FaUserShield />,
  FaBolt: <FaBolt />,
  FaDumbbell: <FaDumbbell />,
  FaCrown: <FaCrown />,
  FaStar: <FaStar />,
  FaFire: <FaFire />,
  FaBrain: <FaBrain />,
  FaUsers: <FaUsers />,
  FaBookOpen: <FaBookOpen />,
  FaRunning: <FaRunning />,
  FaSnowflake: <FaSnowflake />,
  FaMedal: <FaMedal />,
  FaTrophy: <FaTrophy />,
  FaLock: <FaLock />
};

function getIconComponent(iconName: string) {
  return iconComponents[iconName as keyof typeof iconComponents] || <FaStar />;
}

function BadgeModal({ badge, open, onClose }: { badge: any, open: boolean, onClose: () => void }) {
  if (!open || !badge) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#1A2317] rounded-xl shadow-2xl p-6 max-w-sm w-full relative flex flex-col items-center">
        <button className="absolute top-3 right-3 text-white text-xl hover:text-[#8BAE5A]" onClick={onClose}>&times;</button>
        <div className="mb-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8BAE5A] to-[#FFD700] flex items-center justify-center shadow-lg mb-2 animate-bounce-slow">
            <span className="text-3xl">{getIconComponent(badge.badge?.icon_name || badge.icon_name)}</span>
          </div>
          <div className="text-lg font-bold text-white mb-1">{badge.badge?.title || badge.title}</div>
          <div className="text-[#8BAE5A] text-xs mb-2">{badge.badge?.description || badge.desc}</div>
          <div className="text-xs text-[#FFD700] mb-2">
            {badge.unlocked_at ? `Ontgrendeld op: ${new Date(badge.unlocked_at).toLocaleDateString()}` : 'Nog niet ontgrendeld'}
          </div>
          <div className="text-xs text-[#FFD700] mb-4">
            Zeldzaamheid: {badge.badge?.rarity_level || 'common'}
          </div>
          <div className="flex gap-2">
            <button className="px-2 py-1 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-xs font-semibold shadow">Deel op profiel</button>
            <button className="px-2 py-1 rounded-lg bg-[#232D1A] text-[#8BAE5A] text-xs font-semibold shadow border border-[#3A4D23]/40">Deel in Brotherhood</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BadgesRangen() {
  const { user } = useAuth();
  const [showRanks, setShowRanks] = useState(true);
  const [showBadge, setShowBadge] = useState<any>(null);
  const [showXpHistory, setShowXpHistory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'global'|'squad'>('global');
  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const [xpBarAnimated, setXpBarAnimated] = useState(false);

  // Data states
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [badgeCategories, setBadgeCategories] = useState<(BadgeCategory & { badges: Badge[] })[]>([]);
  const [userXP, setUserXP] = useState<UserXP | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [xpHistory, setXpHistory] = useState<XPTransaction[]>([]);
  const [userStreaks, setUserStreaks] = useState<UserStreak[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [streakRewards, setStreakRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    async function loadData() {
      if (!user?.id) {
        console.log('No user ID found, user:', user);
        return;
      }
      
      console.log('Loading badges data for user:', user.id);
      
      try {
        setLoading(true);
        setError(null);

        // Load all data in parallel
        const [
          ranksData,
          categoriesData,
          userXPData,
          userBadgesData,
          xpHistoryData,
          userStreaksData,
          leaderboardData,
          streakRewardsData
        ] = await Promise.all([
          getRanks(),
          getBadgeCategories(),
          getUserXP(user.id),
          getUserBadges(user.id),
          getXPHistory(user.id, 7),
          getUserStreaks(user.id),
          getLeaderboard(5),
          getStreakRewards()
        ]);

        setRanks(ranksData);
        setBadgeCategories(categoriesData);
        setUserXP(userXPData);
        setUserBadges(userBadgesData);
        setXpHistory(xpHistoryData);
        setUserStreaks(userStreaksData);
        setLeaderboard(leaderboardData);
        setStreakRewards(streakRewardsData);

      } catch (err) {
        console.error('Error loading badges data:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        setError(`Fout bij laden van data: ${err instanceof Error ? err.message : 'Onbekende fout'}`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  useEffect(() => { 
    setXpBarAnimated(true); 
  }, [userXP]);

  // Calculate derived values
  const currentRank = userXP?.ranks || ranks[0];
  const currentXP = userXP?.total_xp || 0;
  const nextRank = ranks.find(r => r.rank_order === (currentRank?.rank_order || 0) + 1);
  const badgesUnlocked = userBadges.filter(b => b.status === 'unlocked').length;
  const badgesNeeded = nextRank ? nextRank.badges_needed - badgesUnlocked : 0;
  const xpProgress = nextRank ? ((currentXP - (currentRank?.xp_needed || 0)) / (nextRank.xp_needed - (currentRank?.xp_needed || 0))) * 100 : 100;

  // Get daily login streak
  const dailyStreak = userStreaks.find(s => s.streak_type === 'daily_login');
  const currentStreak = dailyStreak?.current_streak || 0;
  const longestStreak = dailyStreak?.longest_streak || 0;
  
  // Calculate streak progress to next milestone
  const nextStreakMilestone = streakRewards.find(r => r.milestone_days > currentStreak)?.milestone_days || 30;
  const streakProgress = (currentStreak / nextStreakMilestone) * 100;

  // Group badges by category
  const badgesByCategory = badgeCategories.map(category => ({
    ...category,
    badges: userBadges.filter(ub => ub.badge.category_id === category.id)
  }));

  if (loading) {
    return (
      <div className="w-full bg-[#232D1A] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Laden van badges & rangen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#232D1A] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#A6C97B] transition-colors"
          >
            Probeer opnieuw
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#232D1A] min-h-screen">
      {/* Hero Section */}
      <div className="relative py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Badges & Rangen
            </h1>
            <p className="text-base md:text-lg text-[#8BAE5A] font-medium max-w-2xl mx-auto leading-relaxed">
              Verdien je plek. Claim je rang. Word een legende.
            </p>
          </div>
        </div>
      </div>

      {/* Current Rank & XP Section */}
      <div className="px-4 mb-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1A2317]/80 rounded-xl border border-[#3A4D23]/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Jouw Status</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Rank */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#2A3317]/50 border border-[#3A4D23]/30">
                <span className="text-2xl text-[#FFD700]">{getIconComponent(currentRank?.icon_name || 'FaFlag')}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#8BAE5A]">{currentRank?.name || 'Recruit'}</span>
                  <span className="text-xs text-[#8BAE5A]/70">Level {currentRank?.rank_order || 1}</span>
                </div>
              </div>
              
              {/* XP Progress */}
              <div className="flex flex-col gap-2 p-3 rounded-lg bg-[#2A3317]/50 border border-[#3A4D23]/30">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8BAE5A]">XP Progressie</span>
                  <span className="text-[#FFD700] font-semibold">{currentXP} / {nextRank?.xp_needed || 'MAX'}</span>
                </div>
                <div className="w-full h-2 bg-[#8BAE5A]/20 rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full transition-all duration-1000"
                    style={{ width: xpBarAnimated ? `${Math.min(xpProgress, 100)}%` : '0%' }}
                  ></div>
                </div>
                <span className="text-xs text-[#8BAE5A]/70">Volgende: {nextRank?.name || 'Max Level'}</span>
              </div>
              
              {/* Badges Count */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#2A3317]/50 border border-[#3A4D23]/30">
                <span className="text-2xl text-[#FFD700]"><FaMedal /></span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#8BAE5A]">{badgesUnlocked} Badges</span>
                  <span className="text-xs text-[#8BAE5A]/70">
                    {nextRank ? `${Math.max(badgesNeeded, 0)} nodig voor ${nextRank.name}` : 'Max Level'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streak Section */}
      <div className="px-4 mb-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1A2317]/80 rounded-xl border border-[#3A4D23]/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Dagelijkse Streak</h2>
              <button 
                onClick={() => setShowStreakDetails(!showStreakDetails)}
                className="text-[#8BAE5A] text-xs hover:text-[#FFD700] transition-colors"
              >
                {showStreakDetails ? 'Verberg details' : 'Toon details'}
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="text-2xl font-bold text-[#FFD700]">{currentStreak}</div>
              <div className="flex flex-col">
                <span className="text-[#8BAE5A] text-sm">Huidige streak</span>
                <span className="text-[#8BAE5A]/60 text-xs">Langste: {longestStreak} dagen</span>
              </div>
              <div className="ml-auto text-2xl">🔥</div>
            </div>
            
            <div className="w-full h-2 bg-[#8BAE5A]/20 rounded-full overflow-hidden mb-2">
              <div 
                className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(streakProgress, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-[#8BAE5A]">Volgende milestone</span>
              <span className="text-[#FFD700]">{nextStreakMilestone} dagen</span>
            </div>

            {/* Streak Details */}
            {showStreakDetails && (
              <div className="mt-4 pt-4 border-t border-[#3A4D23]/40">
                <h3 className="text-sm font-semibold text-[#8BAE5A] mb-3">Streak Milestones</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {streakRewards.map((reward) => (
                    <div 
                      key={reward.milestone_days}
                      className={`p-2 rounded-lg border text-xs ${
                        currentStreak >= reward.milestone_days
                          ? 'bg-gradient-to-r from-[#8BAE5A]/20 to-[#232D1A]/80 border-[#8BAE5A]'
                          : 'bg-[#232D1A]/40 border-[#3A4D23]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#8BAE5A]">{reward.milestone_days} dagen</span>
                        {currentStreak >= reward.milestone_days && (
                          <span className="text-[#FFD700]">✓</span>
                        )}
                      </div>
                      <div>
                        <div className="text-[#FFD700]">+{reward.xp_reward} XP</div>
                        <div className="text-[#8BAE5A]">{reward.reward_description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* XP History Section */}
      <div className="px-4 mb-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1A2317]/80 rounded-xl border border-[#3A4D23]/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">XP Geschiedenis</h2>
              <button 
                onClick={() => setShowXpHistory(!showXpHistory)}
                className="text-[#8BAE5A] text-xs hover:text-[#FFD700] transition-colors"
              >
                {showXpHistory ? 'Verberg geschiedenis' : 'Toon geschiedenis'}
              </button>
            </div>
            
            {showXpHistory && (
              <div className="space-y-2">
                {xpHistory.length > 0 ? (
                  xpHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[#FFD700]">+{entry.xp_amount}</span>
                        <span className="text-[#8BAE5A]">{entry.description}</span>
                      </div>
                      <span className="text-[#8BAE5A]/60">{new Date(entry.created_at).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[#8BAE5A]/60 text-xs">Nog geen XP geschiedenis</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="px-4 mb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Jouw Badges</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badgesByCategory.map(category => (
              <div key={category.id} className="bg-[#1A2317]/80 rounded-xl border border-[#3A4D23]/30 p-4">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[#8BAE5A]">
                  <span className={category.icon_color}>{getIconComponent(category.icon_name)}</span>
                  {category.name}
                </div>
                <div className="flex flex-col gap-2">
                  {category.badges.map((userBadge) => {
                    const unlocked = userBadge.status === 'unlocked';
                    const progress = userBadge.status === 'progress';
                    const locked = userBadge.status === 'locked';
                    
                    return (
                      <div
                        key={userBadge.badge.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 relative cursor-pointer
                          ${unlocked ? 'border-[#8BAE5A] bg-gradient-to-r from-[#8BAE5A]/20 to-[#232D1A]/80 hover:scale-105' :
                            progress ? 'border-[#FFD700] bg-[#232D1A]/60 opacity-90' :
                            'border-[#3A4D23]/40 bg-[#232D1A]/40 opacity-60 grayscale'}
                        `}
                        onClick={() => unlocked && setShowBadge(userBadge)}
                      >
                        <span className={`text-lg ${unlocked ? 'text-[#8BAE5A]' : locked ? 'text-[#8BAE5A]/30' : 'text-[#FFD700]'}`}>
                          {getIconComponent(userBadge.badge.icon_name)}
                        </span>
                        <div className="flex flex-col flex-1">
                          <span className={`font-bold text-xs ${unlocked ? 'text-[#8BAE5A]' : locked ? 'text-[#8BAE5A]/40' : 'text-[#FFD700]'}`}>
                            {userBadge.badge.title}
                          </span>
                          <span className={`text-xs ${unlocked ? 'text-[#FFD700]' : locked ? 'text-[#FFD700]/40' : 'text-[#FFD700]'}`}>
                            {userBadge.badge.description}
                          </span>
                        </div>
                        {unlocked && <FaCheckCircle className="text-[#8BAE5A] text-xs" />}
                        {progress && <span className="text-[#FFD700] text-xs font-bold">In progress</span>}
                        {locked && <FaLock className="text-[#3A4D23]/40 text-xs" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ranks Section */}
      <div className="px-4 mb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4 cursor-pointer select-none" onClick={() => setShowRanks(!showRanks)}>
            <span className="text-lg font-bold text-white">Rangen & Progressie</span>
            {showRanks ? <FaChevronUp className="text-[#8BAE5A]" /> : <FaChevronDown className="text-[#8BAE5A]" />}
          </div>
          
          {showRanks && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {ranks.map((rank) => (
                <div 
                  key={rank.id} 
                  className={`bg-[#1A2317]/80 rounded-xl p-3 border-2 flex flex-col items-center gap-2 ${
                    rank.id === currentRank?.id ? 'border-[#FFD700]' : 'border-[#8BAE5A]'
                  }`}
                >
                  <span className="text-xl text-[#FFD700]">{getIconComponent(rank.icon_name)}</span>
                  <span className="font-bold text-[#8BAE5A] text-sm text-center">{rank.name}</span>
                  <span className="text-xs text-[#FFD700] text-center">Nodig: <b>{rank.badges_needed} badges</b></span>
                  <span className="text-xs text-[#FFD700] text-center">{rank.unlock_description}</span>
                  {rank.id === currentRank?.id && (
                    <span className="mt-1 px-2 py-1 rounded bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-xs font-bold text-[#181F17] shadow">
                      Jouw rang
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="px-4 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Leaderboard</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setLeaderboardFilter('global')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  leaderboardFilter === 'global' 
                    ? 'bg-[#8BAE5A] text-[#181F17]' 
                    : 'bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]/40'
                }`}
              >
                Globaal
              </button>
              <button 
                onClick={() => setLeaderboardFilter('squad')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  leaderboardFilter === 'squad' 
                    ? 'bg-[#8BAE5A] text-[#181F17]' 
                    : 'bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]/40'
                }`}
              >
                Squad
              </button>
            </div>
          </div>

          <div className="bg-[#1A2317]/80 rounded-xl p-4 border border-[#3A4D23]/30">
            <div className="space-y-3">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, i) => (
                  <div 
                    key={entry.user_id}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                      entry.user_id === user?.id ? 'bg-gradient-to-r from-[#8BAE5A]/20 to-[#232D1A]/80 border-2 border-[#8BAE5A]' : ''
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#232D1A] border border-[#3A4D23]/40 flex items-center justify-center font-bold text-[#FFD700] text-xs">
                      {entry.rank_position}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#8BAE5A] text-sm">{entry.full_name}</span>
                        <span className="text-xs text-[#FFD700]">Rang: {entry.rank_name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[#8BAE5A]">{entry.total_xp} XP</span>
                        <span className="text-xs text-[#8BAE5A]">{entry.badge_count} badges</span>
                        <span className="text-xs text-[#FFD700]">{entry.current_streak} dagen streak</span>
                      </div>
                    </div>
                    {i < 3 && (
                      <div className="text-lg">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[#8BAE5A]/60 text-xs text-center">Geen leaderboard data beschikbaar</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="px-4 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center">
            <span className="text-base font-bold text-[#8BAE5A] mb-3">Klaar om jouw volgende badge te halen?</span>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow hover:from-[#FFD700] hover:to-[#8BAE5A] flex items-center gap-2 text-sm">
                Bekijk challenges
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#232D1A] text-[#8BAE5A] font-semibold shadow hover:bg-[#FFD700] hover:text-[#181F17] flex items-center gap-2 text-sm">
                Naar routines
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#FFD700] text-[#181F17] font-semibold shadow hover:bg-[#8BAE5A] hover:text-white flex items-center gap-2 text-sm">
                Community Wall
              </button>
            </div>
          </div>
        </div>
      </div>

      <BadgeModal badge={showBadge} open={!!showBadge} onClose={() => setShowBadge(null)} />

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-slow { animation: bounce-slow 1.8s infinite; }
      `}</style>
    </div>
  );
} 