'use client';
import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, TrophyIcon, StarIcon, FireIcon, AcademicCapIcon, UserGroupIcon, ArrowPathIcon, PlayIcon } from '@heroicons/react/24/outline';
import { AdminCard, AdminStatsCard, AdminButton } from '../../../components/admin';
import BadgeModal from './components/BadgeModal';
import RankModal from './components/RankModal';
import BadgeUnlockModal from '../../../components/BadgeUnlockModal';

// Icon mapping function
const getIconDisplay = (iconName: string): string => {
  const iconMap: { [key: string]: string } = {
    'FaBolt': '⚡',
    'FaFire': '🔥',
    'FaBookOpen': '📖',
    'FaRunning': '🏃',
    'FaDumbbell': '🏋️',
    'FaSnowflake': '❄️',
    'FaMedal': '🏅',
    'FaUsers': '👥',
    'FaTrophy': '🏆',
    'FaStar': '⭐',
    'FaHeart': '❤️',
    'FaBrain': '🧠',
    'FaDollarSign': '💰',
    'FaClock': '⏰',
    'FaCheck': '✅',
    'FaTarget': '🎯',
    'FaLightbulb': '💡',
    'FaShield': '🛡️',
    'FaCrown': '👑',
    'FaGem': '💎'
  };
  
  return iconMap[iconName] || '🏆'; // Default to trophy if not found
};

// Types
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  image?: string;
  category: string;
  levels: any[];
  trigger: string;
  conditions: any[];
  isActive: boolean;
  ruleLogic: 'AND' | 'OR';
  timeWindow?: number;
  cooldown?: number;
}

interface Rank {
  id: string;
  name: string;
  level: number;
  color: string;
  requirements: string;
  benefits: string;
}

interface BadgeStats {
  totalBadges: number;
  activeBadges: number;
  totalUnlocked: number;
  averageUnlocks: number;
  mostPopularBadge: string;
  recentUnlocks: number;
}

interface RankStats {
  totalRanks: number;
  usersWithRanks: number;
  averageRank: number;
  highestRank: string;
  recentPromotions: number;
}

export default function AdminBadgesRangenPage() {
  const [activeTab, setActiveTab] = useState<'badges' | 'ranks'>('badges');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [isBadgeUnlockModalOpen, setIsBadgeUnlockModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [badgeStats, setBadgeStats] = useState<BadgeStats | null>(null);
  const [rankStats, setRankStats] = useState<RankStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from database
  const fetchBadgeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch badges from database
      const badgesResponse = await fetch('/api/admin/badges');
      const badgesData = await badgesResponse.json();

      // Fetch ranks from database
      const ranksResponse = await fetch('/api/admin/ranks');
      const ranksData = await ranksResponse.json();

      // Fetch badge statistics
      const statsResponse = await fetch('/api/admin/badge-stats');
      const statsData = await statsResponse.json();

      if (badgesResponse.ok && ranksResponse.ok && statsResponse.ok) {
        setBadges(badgesData.badges || []);
        setRanks(ranksData.ranks || []);
        setBadgeStats(statsData.badgeStats || null);
        setRankStats(statsData.rankStats || null);
      } else {
        throw new Error('Failed to fetch badge and rank data');
      }
    } catch (error) {
      console.error('Error fetching badge data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback to mock data
      setBadges([
        {
          id: '1',
          name: 'First Workout',
          description: 'Complete your first workout',
          icon: 'FaDumbbell',
          image: '/badge-no-excuses.png',
          category: 'Training',
          levels: [],
          trigger: 'workout_completed',
          conditions: [{ 
            field: 'total_workouts', 
            operator: 'equals', 
            value: '1',
            unit: 'workouts',
            timePeriod: 'lifetime'
          }],
          isActive: true,
          ruleLogic: 'AND',
          timeWindow: 0,
          cooldown: 0
        },
        {
          id: '2',
          name: 'Streak Master',
          description: 'Complete 7 workouts in a row',
          icon: 'FaFire',
          image: '/badge-no-excuses.png',
          category: 'Training',
          levels: [],
          trigger: 'workout_completed',
          conditions: [{ 
            field: 'streak_days', 
            operator: 'greater_than_or_equal', 
            value: '7',
            unit: 'days',
            timePeriod: 'consecutive'
          }],
          isActive: true,
          ruleLogic: 'AND',
          timeWindow: 7,
          cooldown: 0
        },
        {
          id: '3',
          name: 'Early Bird',
          description: '5 dagen vroeg op',
          icon: 'FaClock',
          image: '/badge-no-excuses.png',
          category: 'Lifestyle',
          levels: [],
          trigger: 'early_wake',
          conditions: [{ 
            field: 'early_wake_days', 
            operator: 'greater_than_or_equal', 
            value: '5',
            unit: 'days',
            timePeriod: 'consecutive'
          }],
          isActive: true,
          ruleLogic: 'AND',
          timeWindow: 5,
          cooldown: 0
        },
        {
          id: '4',
          name: 'No Excuses',
          description: '10 dagen geen excuus',
          icon: 'FaCheck',
          image: '/badge-no-excuses.png',
          category: 'Lifestyle',
          levels: [],
          trigger: 'daily_check',
          conditions: [{ 
            field: 'no_excuse_days', 
            operator: 'greater_than_or_equal', 
            value: '10',
            unit: 'days',
            timePeriod: 'consecutive'
          }],
          isActive: true,
          ruleLogic: 'AND',
          timeWindow: 10,
          cooldown: 0
        },
        {
          id: '5',
          name: 'Bookworm',
          description: 'Eerste boek uitgelezen',
          icon: 'FaBookOpen',
          category: 'Learning',
          levels: [],
          trigger: 'book_completed',
          conditions: [{ 
            field: 'books_completed', 
            operator: 'greater_than', 
            value: '0',
            unit: 'books',
            timePeriod: 'lifetime'
          }],
          isActive: true,
          ruleLogic: 'AND',
          timeWindow: 0,
          cooldown: 0
        },
        {
          id: '6',
          name: 'Social Butterfly',
          description: 'Eerste post gedeeld',
          icon: 'FaUsers',
          category: 'Social',
          levels: [],
          trigger: 'post_shared',
          conditions: [{ 
            field: 'posts_shared', 
            operator: 'greater_than', 
            value: '0',
            unit: 'posts',
            timePeriod: 'lifetime'
          }],
          isActive: true,
          ruleLogic: 'AND',
          timeWindow: 0,
          cooldown: 0
        },
        {
          id: '7',
          name: 'Mind Master',
          description: '7 dagen meditatie',
          icon: 'FaBrain',
          category: 'Mind',
          levels: [],
          trigger: 'meditation_completed',
          conditions: [{ 
            field: 'meditation_days', 
            operator: 'greater_than_or_equal', 
            value: '7',
            unit: 'days',
            timePeriod: 'consecutive'
          }],
          isActive: true,
          ruleLogic: 'AND',
          timeWindow: 7,
          cooldown: 0
        },
        {
          id: '8',
          name: 'Financial Freedom',
          description: 'Eerste investering gedaan',
          icon: 'FaDollarSign',
          category: 'Finance',
          levels: [],
          trigger: 'investment_made',
          conditions: [{ 
            field: 'investments_count', 
            operator: 'greater_than', 
            value: '0',
            unit: 'investments',
            timePeriod: 'lifetime'
          }],
          isActive: true,
          ruleLogic: 'AND',
          timeWindow: 0,
          cooldown: 0
        },
        {
          id: '9',
          name: 'Goal Setter',
          description: '3 doelen gesteld en bereikt',
          icon: 'FaTarget',
          category: 'Goals',
          levels: [],
          trigger: 'goal_completed',
          conditions: [{ 
            field: 'goals_completed', 
            operator: 'greater_than_or_equal', 
            value: '3',
            unit: 'goals',
            timePeriod: 'lifetime'
          }],
          isActive: true,
          ruleLogic: 'AND',
          timeWindow: 0,
          cooldown: 0
        },
        {
          id: '10',
          name: 'Consistency King',
          description: '30 dagen consistent',
          icon: 'FaCrown',
          category: 'Lifestyle',
          levels: [],
          trigger: 'daily_check',
          conditions: [{ 
            field: 'consistent_days', 
            operator: 'greater_than_or_equal', 
            value: '30',
            unit: 'days',
            timePeriod: 'consecutive'
          }],
          isActive: true,
          ruleLogic: 'AND',
          timeWindow: 30,
          cooldown: 7
        },
        {
          id: '11',
          name: 'Speed Demon',
          description: '5 workouts onder 30 minuten',
          icon: 'FaBolt',
          category: 'Training',
          levels: [],
          trigger: 'workout_completed',
          conditions: [{ 
            field: 'fast_workouts', 
            operator: 'greater_than_or_equal', 
            value: '5',
            unit: 'workouts',
            timePeriod: 'lifetime'
          }],
          isActive: true,
          ruleLogic: 'AND',
          timeWindow: 0,
          cooldown: 0
        },
        {
          id: '12',
          name: 'Knowledge Seeker',
          description: '10 artikelen gelezen',
          icon: 'FaLightbulb',
          category: 'Learning',
          levels: [],
          trigger: 'article_read',
          conditions: [{ 
            field: 'articles_read', 
            operator: 'greater_than_or_equal', 
            value: '10',
            unit: 'articles',
            timePeriod: 'lifetime'
          }],
          isActive: true,
          ruleLogic: 'AND',
          timeWindow: 0,
          cooldown: 0
        }
      ]);
      setRanks([
        {
          id: '1',
          name: 'Rookie',
          level: 1,
          color: '#8BAE5A',
          requirements: '0 XP',
          benefits: 'Basic access'
        },
        {
          id: '2',
          name: 'Warrior',
          level: 2,
          color: '#f0a14f',
          requirements: '1000 XP',
          benefits: 'Enhanced features'
        }
      ]);
      setBadgeStats({
        totalBadges: 2,
        activeBadges: 2,
        totalUnlocked: 15,
        averageUnlocks: 7.5,
        mostPopularBadge: 'First Workout',
        recentUnlocks: 3
      });
      setRankStats({
        totalRanks: 2,
        usersWithRanks: 3,
        averageRank: 1.5,
        highestRank: 'Warrior',
        recentPromotions: 1
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadgeData();
  }, []);

  const handleBadgeSave = (badge: Badge) => {
    if (editingBadge) {
      setBadges(badges.map(b => b.id === editingBadge.id ? badge : b));
    } else {
      setBadges([...badges, { ...badge, id: Date.now().toString() }]);
    }
    setIsBadgeModalOpen(false);
    setEditingBadge(null);
  };

  const handleBadgeDelete = (badgeId: string) => {
    if (confirm('Weet je zeker dat je deze badge wilt verwijderen?')) {
      setBadges(badges.filter(b => b.id !== badgeId));
    }
  };

  const handleToggleBadgeStatus = (badgeId: string) => {
    setBadges(badges.map(b => 
      b.id === badgeId ? { ...b, isActive: !b.isActive } : b
    ));
  };

  const handleRankSave = (rank: Rank) => {
    if (editingRank) {
      setRanks(ranks.map(r => r.id === editingRank.id ? rank : r));
    } else {
      setRanks([...ranks, { ...rank, id: Date.now().toString() }]);
    }
    setIsRankModalOpen(false);
    setEditingRank(null);
  };

  const handleRankDelete = (rankId: string) => {
    if (confirm('Weet je zeker dat je deze rang wilt verwijderen?')) {
      setRanks(ranks.filter(r => r.id !== rankId));
    }
  };

  // Test badge unlock function
  const handleTestBadgeUnlock = async (badgeId: string, badgeName: string) => {
    try {
      // Find a test user (Chiel)
      const testUserEmail = 'chiel@media2net.nl';
      
      const response = await fetch('/api/badges/test-unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          badgeId: badgeId,
          userEmail: testUserEmail
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Badge "${badgeName}" succesvol toegekend aan ${testUserEmail}!`);
        console.log('Badge unlock result:', result);
      } else {
        const error = await response.json();
        alert(`❌ Fout bij unlocken van badge: ${error.error}`);
        console.error('Badge unlock error:', error);
      }
    } catch (error) {
      console.error('Error testing badge unlock:', error);
      alert('❌ Er is een fout opgetreden bij het testen van de badge unlock');
    }
  };

  const handleEditRank = (rank: Rank) => {
    setEditingRank(rank);
    setIsRankModalOpen(true);
  };

  const exportData = (type: 'badges' | 'ranks') => {
    const data = type === 'badges' ? badges : ranks;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (type: 'badges' | 'ranks', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (type === 'badges') {
          setBadges(data);
        } else {
          setRanks(data);
        }
        console.log(`✅ ${type} data imported successfully`);
      } catch (error) {
        console.error(`❌ Error importing ${type} data:`, error);
        alert(`Fout bij importeren van ${type} data`);
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Laden van badges en rangen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ Fout</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <AdminButton onClick={fetchBadgeData} variant="primary">
            Opnieuw Proberen
          </AdminButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Badges & Rangen Beheer</h1>
          <p className="text-[#B6C948] mt-2">Game Design Studio - Beheer het gamification systeem</p>
        </div>
        <AdminButton 
          onClick={fetchBadgeData} 
          variant="secondary" 
          icon={<ArrowPathIcon className="w-4 h-4" />}
        >
          Vernieuwen
        </AdminButton>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'badges'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Badges Beheren
        </button>
        <button
          onClick={() => setActiveTab('ranks')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'ranks'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Rangen Beheren
        </button>
      </div>

      {activeTab === 'badges' && (
        <>
          {/* Badge Statistics */}
          {badgeStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatsCard
                title="Totaal Badges"
                value={badgeStats.totalBadges}
                icon={<TrophyIcon className="w-8 h-8" />}
                color="green"
              />
              <AdminStatsCard
                title="Actieve Badges"
                value={badgeStats.activeBadges}
                icon={<StarIcon className="w-8 h-8" />}
                color="orange"
              />
              <AdminStatsCard
                title="Totaal Ontgrendeld"
                value={badgeStats.totalUnlocked}
                icon={<FireIcon className="w-8 h-8" />}
                color="blue"
              />
              <AdminStatsCard
                title="Gemiddelde Ontgrendelingen"
                value={badgeStats.averageUnlocks}
                icon={<AcademicCapIcon className="w-8 h-8" />}
                color="purple"
              />
            </div>
          )}

          {/* Badge Management */}
          <AdminCard
            title="Badges Beheren"
            subtitle="Ontwerp en beheer gamification badges"
            icon={<TrophyIcon className="w-6 h-6" />}
            gradient
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-3">
                <AdminButton
                  onClick={() => exportData('badges')}
                  variant="secondary"
                  icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                >
                  Exporteren
                </AdminButton>
                <label className="cursor-pointer">
                  <AdminButton
                    variant="secondary"
                    icon={<ArrowUpTrayIcon className="w-4 h-4" />}
                  >
                    Importeren
                  </AdminButton>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => importData('badges', e)}
                    className="hidden"
                  />
                </label>
                <AdminButton
                  onClick={() => {
                    setEditingBadge(null);
                    setIsBadgeModalOpen(true);
                  }}
                  variant="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                >
                  Nieuwe Badge Ontwerpen
                </AdminButton>
                <AdminButton
                  onClick={() => setIsBadgeUnlockModalOpen(true)}
                  variant="secondary"
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-black font-semibold hover:from-[#7A9D4A] hover:to-[#A5B847]"
                >
                  🎖️ Test Badge Unlock
                </AdminButton>
              </div>
            </div>

            <div className="bg-[#181F17] rounded-xl overflow-hidden border border-[#3A4D23]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#232D1A] border-b border-[#3A4D23]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Badge</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Naam Badge</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Omschrijving</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trigger</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A4D23]">
                    {badges.map((badge) => (
                      <tr key={badge.id} className="hover:bg-[#232D1A]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img 
                              src={badge.image || "/badge-no-excuses.png"} 
                              alt={`${badge.name} badge`}
                              className="w-12 h-12 rounded-lg object-cover border-2 border-[#3A4D23]"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">{badge.name}</div>
                            <div className="text-sm text-gray-400">{badge.category}</div>
                            {badge.levels && badge.levels.length > 0 && (
                              <div className="text-xs text-[#8BAE5A]">Multi-level</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {badge.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {badge.trigger}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            badge.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {badge.isActive ? 'Actief' : 'Inactief'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingBadge(badge);
                                setIsBadgeModalOpen(true);
                              }}
                              className="p-1 text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23] rounded"
                              title="Bewerken"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleBadgeStatus(badge.id)}
                              className={`p-1 rounded ${
                                badge.isActive 
                                  ? 'text-orange-400 hover:text-orange-300' 
                                  : 'text-green-400 hover:text-green-300'
                              } hover:bg-[#3A4D23]`}
                              title={badge.isActive ? 'Pauzeren' : 'Activeren'}
                            >
                              {badge.isActive ? '⏸️' : '▶️'}
                            </button>
                            <button
                              onClick={() => handleTestBadgeUnlock(badge.id, badge.name)}
                              className="p-1 text-blue-400 hover:text-blue-300 hover:bg-[#3A4D23] rounded"
                              title="Test Unlock"
                            >
                              <PlayIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleBadgeDelete(badge.id)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-[#3A4D23] rounded"
                              title="Verwijderen"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AdminCard>
        </>
      )}

      {activeTab === 'ranks' && (
        <>
          {/* Rank Statistics */}
          {rankStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminStatsCard
                title="Totaal Rangen"
                value={rankStats.totalRanks}
                icon={<TrophyIcon className="w-8 h-8" />}
                color="green"
              />
              <AdminStatsCard
                title="Gebruikers met Rangen"
                value={rankStats.usersWithRanks}
                icon={<UserGroupIcon className="w-8 h-8" />}
                color="blue"
              />
              <AdminStatsCard
                title="Gemiddelde Rang"
                value={rankStats.averageRank}
                icon={<StarIcon className="w-8 h-8" />}
                color="orange"
              />
              <AdminStatsCard
                title="Recente Promoties"
                value={rankStats.recentPromotions}
                icon={<FireIcon className="w-8 h-8" />}
                color="purple"
              />
            </div>
          )}

          {/* Rank Management */}
          <AdminCard
            title="Rangen Beheren"
            subtitle="Beheer gebruikersrangen en promoties"
            icon={<UserGroupIcon className="w-6 h-6" />}
            gradient
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-3">
                <AdminButton
                  onClick={() => exportData('ranks')}
                  variant="secondary"
                  icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                >
                  Exporteren
                </AdminButton>
                <label className="cursor-pointer">
                  <AdminButton
                    variant="secondary"
                    icon={<ArrowUpTrayIcon className="w-4 h-4" />}
                  >
                    Importeren
                  </AdminButton>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => importData('ranks', e)}
                    className="hidden"
                  />
                </label>
                <AdminButton
                  onClick={() => {
                    setEditingRank(null);
                    setIsRankModalOpen(true);
                  }}
                  variant="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                >
                  Nieuwe Rang Toevoegen
                </AdminButton>
              </div>
            </div>

            <div className="bg-[#181F17] rounded-xl overflow-hidden border border-[#3A4D23]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#232D1A] border-b border-[#3A4D23]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rang</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Naam</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vereisten</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Voordelen</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A4D23]">
                    {ranks.map((rank) => (
                      <tr key={rank.id} className="hover:bg-[#232D1A]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: rank.color }}
                            >
                              {rank.level}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{rank.name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {rank.level}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {rank.requirements}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {rank.benefits}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditRank(rank)}
                              className="p-1 text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23] rounded"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRankDelete(rank.id)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-[#3A4D23] rounded"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AdminCard>
        </>
      )}

      {/* Modals */}
      {isBadgeModalOpen && (
        <BadgeModal
          isOpen={isBadgeModalOpen}
          onClose={() => setIsBadgeModalOpen(false)}
          onSave={handleBadgeSave}
          badge={editingBadge}
          availableActions={[
            { value: 'workout_completed', label: 'Workout Voltooid', type: 'number' },
            { value: 'early_wake', label: 'Vroeg Opstaan', type: 'number' },
            { value: 'daily_check', label: 'Dagelijkse Check', type: 'number' },
            { value: 'book_completed', label: 'Boek Uitgelezen', type: 'number' },
            { value: 'post_shared', label: 'Post Gedeeld', type: 'number' },
            { value: 'meditation_completed', label: 'Meditatie Voltooid', type: 'number' },
            { value: 'investment_made', label: 'Investering Gedaan', type: 'number' },
            { value: 'goal_completed', label: 'Doel Voltooid', type: 'number' },
            { value: 'article_read', label: 'Artikel Gelezen', type: 'number' }
          ]}
          getConditionsForAction={(action: string) => {
            const conditions: { [key: string]: Array<{ value: string; label: string; type: 'text' | 'number' }> } = {
              workout_completed: [
                { value: 'total_workouts', label: 'Totaal aantal workouts', type: 'number' },
                { value: 'streak_days', label: 'Aantal dagen op rij', type: 'number' },
                { value: 'fast_workouts', label: 'Snelle workouts (<30 min)', type: 'number' },
                { value: 'workout_type', label: 'Type workout', type: 'text' }
              ],
              early_wake: [
                { value: 'early_wake_days', label: 'Aantal dagen vroeg op', type: 'number' }
              ],
              daily_check: [
                { value: 'no_excuse_days', label: 'Dagen zonder excuus', type: 'number' },
                { value: 'consistent_days', label: 'Consistente dagen', type: 'number' }
              ],
              book_completed: [
                { value: 'books_completed', label: 'Aantal boeken uitgelezen', type: 'number' }
              ],
              post_shared: [
                { value: 'posts_shared', label: 'Aantal posts gedeeld', type: 'number' }
              ],
              meditation_completed: [
                { value: 'meditation_days', label: 'Aantal meditatie dagen', type: 'number' }
              ],
              investment_made: [
                { value: 'investments_count', label: 'Aantal investeringen', type: 'number' }
              ],
              goal_completed: [
                { value: 'goals_completed', label: 'Aantal doelen voltooid', type: 'number' }
              ],
              article_read: [
                { value: 'articles_read', label: 'Aantal artikelen gelezen', type: 'number' }
              ]
            };
            return conditions[action] || [];
          }}
          operators={[
            { value: 'equals', label: 'is gelijk aan' },
            { value: 'greater_than', label: 'is groter dan' },
            { value: 'greater_than_or_equal', label: 'is groter dan of gelijk aan' },
            { value: 'less_than', label: 'is kleiner dan' },
            { value: 'less_than_or_equal', label: 'is kleiner dan of gelijk aan' },
            { value: 'contains', label: 'bevat' },
            { value: 'starts_with', label: 'begint met' },
            { value: 'ends_with', label: 'eindigt met' }
          ]}
        />
      )}

      {isRankModalOpen && (
        <RankModal
          isOpen={isRankModalOpen}
          onClose={() => setIsRankModalOpen(false)}
          onSave={handleRankSave}
          editingRank={editingRank}
          isReorderMode={false}
          ranks={ranks}
          setRanks={setRanks}
        />
      )}

      {/* Badge Unlock Modal */}
      <BadgeUnlockModal
        isOpen={isBadgeUnlockModalOpen}
        onClose={() => setIsBadgeUnlockModalOpen(false)}
        badge={{
          name: "No Excuses",
          image: "/badge-no-excuses.png",
          description: "Je hebt 10 dagen achter elkaar geen excuus gebruikt! Consistentie is de sleutel tot succes."
        }}
        hasUnlockedBadge={false}
      />
    </div>
  );
}