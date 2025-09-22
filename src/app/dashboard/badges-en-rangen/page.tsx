"use client";
import { useState, useEffect } from 'react';
import { 
  FaMedal, FaDumbbell, FaBrain, FaUsers, FaFire, FaCrown, FaStar, 
  FaTrophy, FaLock, FaBolt, FaBookOpen, FaRunning, FaSnowflake, 
  FaUserShield, FaFlag, FaCheckCircle, FaChevronUp, FaChevronDown,
  FaInfoCircle, FaGift, FaChartLine, FaAward, FaGamepad
} from 'react-icons/fa';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

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

// Badge Tooltip Component
function BadgeTooltip({ badge, children }: { badge: any, children: React.ReactNode }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-[#1A2317] border border-[#3A4D23] rounded-lg p-3 shadow-xl z-50">
          <div className="text-center">
            <div className="text-lg font-bold text-white mb-1">{badge.title}</div>
            <div className="text-sm text-[#8BAE5A] mb-2">{badge.description}</div>
            <div className="text-xs text-[#FFD700] mb-2">
              Zeldzaamheid: {badge.rarity_level}
            </div>
            <div className="text-xs text-[#8BAE5A] mb-2">
              XP Beloning: {badge.xp_reward}
            </div>
            {badge.requirements && (
              <div className="text-xs text-[#8BAE5A]">
                <div className="font-semibold mb-1">Vereisten:</div>
                <div className="text-left">
                  {typeof badge.requirements === 'string' ? (
                    <div>{badge.requirements}</div>
                  ) : (
                    <div>
                      {Object.entries(badge.requirements).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span className="text-[#FFD700]">{String(value)}</span>
                        </div>
                      ))}
          </div>
                  )}
          </div>
          </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#3A4D23]"></div>
        </div>
      )}
    </div>
  );
}

export default function BadgesRangen() {
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<'requirements' | 'badges' | 'leaderboard'>('requirements');
  const [leaderboardCategory, setLeaderboardCategory] = useState<'xp' | 'badges' | 'levels'>('xp');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'allTime' | 'weekly' | 'monthly'>('allTime');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);

  // Load data
  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Load badges data
        const badgesResponse = await fetch('/api/badges/all');
        const badgesData = await badgesResponse.json();
        
        if (badgesData.success) {
          setData(badgesData.data);
          
          // Get user's specific badges
          const userBadgeData = badgesData.data.userBadges.filter((ub: any) => ub.user_id === user.id);
          setUserBadges(userBadgeData);
        }
      } catch (error) {
        console.error('Error loading badges data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

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

  if (!data) {
    return (
      <div className="w-full bg-[#232D1A] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Fout bij laden van data</p>
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

  const { badges, ranks, leaderboard } = data;
  const userUnlockedBadges = userBadges.filter(ub => ub.status === 'unlocked');
  const userProgressBadges = userBadges.filter(ub => ub.status === 'progress');

  return (
    <div className="w-full bg-[#232D1A] min-h-screen">
      {/* Hero Section */}
      <div className="relative py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Badges & Rangen
            </h1>
            <p className="text-lg md:text-xl text-[#8BAE5A] font-medium max-w-3xl mx-auto leading-relaxed">
              Verdien je plek. Claim je rang. Word een legende.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="bg-[#1A2317]/80 rounded-xl p-1 border border-[#3A4D23]/30">
              <button
                onClick={() => setActiveTab('requirements')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'requirements'
                    ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] shadow-lg'
                    : 'text-[#8BAE5A] hover:text-white'
                }`}
              >
                <FaChartLine />
                Level Vereisten
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'badges'
                    ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] shadow-lg'
                    : 'text-[#8BAE5A] hover:text-white'
                }`}
              >
                <FaMedal />
                Alle Badges
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'leaderboard'
                    ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] shadow-lg'
                    : 'text-[#8BAE5A] hover:text-white'
                }`}
              >
                <FaTrophy />
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Level Requirements Tab */}
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Level Vereisten Overzicht</h2>
                <p className="text-[#8BAE5A]">Ontdek wat je nodig hebt om naar het volgende level te gaan</p>
            </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ranks.map((rank: any, index: number) => (
                  <div 
                    key={rank.id} 
                    className={`bg-gradient-to-br from-[#1A2317] to-[#232D1A] rounded-xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                      index === 0 ? 'border-[#FFD700] shadow-lg shadow-[#FFD700]/20' : 'border-[#3A4D23]/30'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <div className="text-4xl text-[#FFD700] mb-2">
                        {getIconComponent(rank.icon_name)}
              </div>
                      <h3 className="text-xl font-bold text-white mb-1">{rank.name}</h3>
                      <p className="text-sm text-[#8BAE5A]">Level {rank.rank_order}</p>
            </div>
            
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-[#2A3317]/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaStar className="text-[#FFD700]" />
                          <span className="text-sm text-[#8BAE5A]">XP Vereist</span>
                        </div>
                        <span className="text-sm font-bold text-[#FFD700]">{rank.xp_needed}</span>
            </div>
            
                      <div className="flex justify-between items-center p-3 bg-[#2A3317]/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaMedal className="text-[#8BAE5A]" />
                          <span className="text-sm text-[#8BAE5A]">Badges Vereist</span>
                        </div>
                        <span className="text-sm font-bold text-[#8BAE5A]">{rank.badges_needed}</span>
            </div>

                      <div className="p-3 bg-[#2A3317]/30 rounded-lg">
                        <p className="text-xs text-[#8BAE5A] text-center">{rank.unlock_description}</p>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* All Badges Tab */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Alle Beschikbare Badges</h2>
                <p className="text-[#8BAE5A]">Hover over een badge om de vereisten te zien</p>
            </div>
            
              {/* User Progress Summary */}
              <div className="bg-gradient-to-r from-[#1A2317] to-[#232D1A] rounded-xl p-6 border border-[#3A4D23]/30 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#8BAE5A] mb-1">{userUnlockedBadges.length}</div>
                    <div className="text-sm text-[#8BAE5A]">Ontgrendeld</div>
                      </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#FFD700] mb-1">{userProgressBadges.length}</div>
                    <div className="text-sm text-[#8BAE5A]">In Progress</div>
                    </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#8BAE5A]/60 mb-1">{badges.length - userUnlockedBadges.length - userProgressBadges.length}</div>
                    <div className="text-sm text-[#8BAE5A]">Nog Te Verdienen</div>
          </div>
        </div>
      </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {badges.map((badge: any) => {
                  const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
                  const isUnlocked = userBadge?.status === 'unlocked';
                  const isProgress = userBadge?.status === 'progress';
                    
                    return (
                    <BadgeTooltip key={badge.id} badge={badge}>
                      <div 
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                          isUnlocked 
                            ? 'border-[#8BAE5A] bg-gradient-to-br from-[#8BAE5A]/20 to-[#232D1A] shadow-lg shadow-[#8BAE5A]/20' 
                            : isProgress
                            ? 'border-[#FFD700] bg-gradient-to-br from-[#FFD700]/20 to-[#232D1A] shadow-lg shadow-[#FFD700]/20'
                            : 'border-[#3A4D23]/40 bg-[#232D1A]/40 opacity-60'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-3xl mb-2 ${
                            isUnlocked ? 'text-[#8BAE5A]' : isProgress ? 'text-[#FFD700]' : 'text-[#8BAE5A]/30'
                          }`}>
                            {getIconComponent(badge.icon_name)}
                          </div>
                          <h4 className={`font-bold text-sm mb-1 ${
                            isUnlocked ? 'text-white' : isProgress ? 'text-[#FFD700]' : 'text-[#8BAE5A]/40'
                          }`}>
                            {badge.title}
                          </h4>
                          <p className={`text-xs mb-2 ${
                            isUnlocked ? 'text-[#8BAE5A]' : isProgress ? 'text-[#FFD700]' : 'text-[#8BAE5A]/40'
                          }`}>
                            {badge.description}
                          </p>
                          <div className="flex justify-between items-center text-xs">
                            <span className={`${
                              isUnlocked ? 'text-[#FFD700]' : isProgress ? 'text-[#FFD700]' : 'text-[#8BAE5A]/40'
                            }`}>
                              {badge.xp_reward} XP
                        </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              badge.rarity_level === 'legendary' ? 'bg-[#FFD700] text-[#181F17]' :
                              badge.rarity_level === 'epic' ? 'bg-[#8BAE5A] text-white' :
                              badge.rarity_level === 'rare' ? 'bg-[#3A4D23] text-[#8BAE5A]' :
                              'bg-[#232D1A] text-[#8BAE5A]'
                            }`}>
                              {badge.rarity_level}
                          </span>
                          </div>
                        </div>
                        
                        {/* Status Indicators */}
                        {isUnlocked && (
                          <div className="absolute top-2 right-2">
                            <FaCheckCircle className="text-[#8BAE5A] text-sm" />
                          </div>
                        )}
                        {isProgress && (
                          <div className="absolute top-2 right-2">
                            <FaBolt className="text-[#FFD700] text-sm" />
                          </div>
                        )}
                        {!isUnlocked && !isProgress && (
                          <div className="absolute top-2 right-2">
                            <FaLock className="text-[#3A4D23]/40 text-sm" />
                          </div>
                        )}
                      </div>
                    </BadgeTooltip>
                    );
                  })}
                </div>
              </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Top Tier Men Leaderboard</h2>
                <p className="text-[#8BAE5A]">De beste presteerders van de community</p>
          </div>
          
              {/* Leaderboard Controls */}
              <div className="bg-gradient-to-br from-[#1A2317] to-[#232D1A] rounded-xl p-6 border border-[#3A4D23]/30">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {/* Category Selection */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">Categorie</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLeaderboardCategory('xp')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          leaderboardCategory === 'xp'
                            ? 'bg-[#8BAE5A] text-[#181F17]'
                            : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-[#181F17]'
                        }`}
                      >
                        <FaStar className="inline mr-2" />
                        XP
                      </button>
                      <button
                        onClick={() => setLeaderboardCategory('badges')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          leaderboardCategory === 'badges'
                            ? 'bg-[#8BAE5A] text-[#181F17]'
                            : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-[#181F17]'
                        }`}
                      >
                        <FaMedal className="inline mr-2" />
                        Badges
                      </button>
                      <button
                        onClick={() => setLeaderboardCategory('levels')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          leaderboardCategory === 'levels'
                            ? 'bg-[#8BAE5A] text-[#181F17]'
                            : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-[#181F17]'
                        }`}
                      >
                        <FaCrown className="inline mr-2" />
                        Levels
                      </button>
                    </div>
                  </div>

                  {/* Period Selection */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">Periode</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLeaderboardPeriod('allTime')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          leaderboardPeriod === 'allTime'
                            ? 'bg-[#FFD700] text-[#181F17]'
                            : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#FFD700] hover:text-[#181F17]'
                        }`}
                      >
                        All-time
                      </button>
                      <button
                        onClick={() => setLeaderboardPeriod('monthly')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          leaderboardPeriod === 'monthly'
                            ? 'bg-[#FFD700] text-[#181F17]'
                            : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#FFD700] hover:text-[#181F17]'
                        }`}
                      >
                        Deze maand
                      </button>
                      <button
                        onClick={() => setLeaderboardPeriod('weekly')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          leaderboardPeriod === 'weekly'
                            ? 'bg-[#FFD700] text-[#181F17]'
                            : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#FFD700] hover:text-[#181F17]'
                        }`}
                      >
                        Deze week
                      </button>
                    </div>
                  </div>
                </div>

                {/* Leaderboard Content */}
                <div className="space-y-4">
                  {data?.leaderboard?.[leaderboardCategory]?.[leaderboardPeriod]?.map((member: any, index: number) => (
                    <div 
                      key={member.id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                        member.id === user?.id 
                          ? 'bg-gradient-to-r from-[#8BAE5A]/20 to-[#232D1A]/80 border-2 border-[#8BAE5A] shadow-lg' 
                          : 'bg-[#2A3317]/30 hover:bg-[#2A3317]/50'
                      }`}
                    >
                      {/* Rank */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#181F17]' :
                        index === 1 ? 'bg-gradient-to-r from-[#C0C0C0] to-[#E5E5E5] text-[#181F17]' :
                        index === 2 ? 'bg-gradient-to-r from-[#CD7F32] to-[#B8860B] text-white' :
                        'bg-[#3A4D23] text-[#8BAE5A]'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full border-2 border-[#8BAE5A] overflow-hidden">
                        {member.avatar_url ? (
                          <img 
                            src={member.avatar_url} 
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#3A4D23] to-[#232D1A] flex items-center justify-center">
                            <span className="text-[#8BAE5A] font-bold text-lg">
                              {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{member.name}</h3>
                          {member.id === user?.id && (
                            <span className="px-2 py-1 bg-[#8BAE5A] text-[#181F17] text-xs font-semibold rounded">
                              Jij
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#8BAE5A]">
                          {leaderboardCategory === 'xp' && (
                            <div className="flex items-center gap-1">
                              <FaStar className="text-[#FFD700]" />
                              <span>{member.xp[leaderboardPeriod]} XP</span>
                            </div>
                          )}
                          {leaderboardCategory === 'badges' && (
                            <div className="flex items-center gap-1">
                              <FaMedal className="text-[#8BAE5A]" />
                              <span>{member.badges[leaderboardPeriod]} badges</span>
                            </div>
                          )}
                          {leaderboardCategory === 'levels' && (
                            <div className="flex items-center gap-1">
                              <FaCrown className="text-[#FFD700]" />
                              <span>Level {member.level}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <FaUsers className="text-[#8BAE5A]" />
                            <span>Lid sinds {new Date(member.joinDate).getFullYear()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Achievement Badge */}
                      {index < 3 && (
                        <div className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[#1A2317] to-[#232D1A] rounded-xl p-8 border border-[#3A4D23]/30 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Klaar om je volgende badge te verdienen?</h3>
            <p className="text-[#8BAE5A] mb-6">Start vandaag nog met het voltooien van challenges en het behalen van je doelen!</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all duration-200 flex items-center gap-2">
                <FaGamepad />
                Bekijk Challenges
              </button>
              <button className="px-6 py-3 rounded-lg bg-[#232D1A] text-[#8BAE5A] font-semibold border border-[#3A4D23]/40 hover:bg-[#8BAE5A] hover:text-white transition-all duration-200 flex items-center gap-2">
                <FaDumbbell />
                Start Training
              </button>
              <button className="px-6 py-3 rounded-lg bg-[#FFD700] text-[#181F17] font-semibold hover:bg-[#8BAE5A] hover:text-white transition-all duration-200 flex items-center gap-2">
                <FaUsers />
                Join Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 