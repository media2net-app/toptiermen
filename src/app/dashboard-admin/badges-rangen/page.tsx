'use client';
import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, TrophyIcon, StarIcon, FireIcon, AcademicCapIcon, UserGroupIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { AdminCard, AdminStatsCard, AdminButton } from '../../../components/admin';
import BadgeModal from './components/BadgeModal';
import RankModal from './components/RankModal';

// Types
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
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
          icon: '🏋️',
          category: 'Training',
          levels: [],
          trigger: 'workout_completed',
          conditions: [{ field: 'total_count', operator: 'equals', value: '1' }],
          isActive: true,
          ruleLogic: 'AND'
        },
        {
          id: '2',
          name: 'Streak Master',
          description: 'Complete 7 workouts in a row',
          icon: '🔥',
          category: 'Training',
          levels: [],
          trigger: 'workout_completed',
          conditions: [{ field: 'streak_days', operator: 'greater_than', value: '6' }],
          isActive: true,
          ruleLogic: 'AND'
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#8BAE5A]">Badges & Rangen Beheer</h1>
          <p className="text-[#B6C948] mt-2 text-sm sm:text-base">Game Design Studio - Beheer het gamification systeem</p>
        </div>
        <AdminButton 
          onClick={fetchBadgeData} 
          variant="secondary" 
          icon={<ArrowPathIcon className="w-4 h-4" />}
          className="text-sm"
        >
          <span className="hidden sm:inline">Vernieuwen</span>
          <span className="sm:hidden">🔄</span>
        </AdminButton>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-shrink-0 py-2 px-3 sm:py-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
            activeTab === 'badges'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Badges Beheren</span>
          <span className="sm:hidden">Badges</span>
        </button>
        <button
          onClick={() => setActiveTab('ranks')}
          className={`flex-shrink-0 py-2 px-3 sm:py-3 sm:px-4 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
            activeTab === 'ranks'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Rangen Beheren</span>
          <span className="sm:hidden">Rangen</span>
        </button>
      </div>

      {activeTab === 'badges' && (
        <>
          {/* Badge Statistics */}
          {badgeStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <AdminButton
                  onClick={() => exportData('badges')}
                  variant="secondary"
                  icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                  className="text-sm"
                >
                  <span className="hidden sm:inline">Exporteren</span>
                  <span className="sm:hidden">Export</span>
                </AdminButton>
                <label className="cursor-pointer">
                  <AdminButton
                    variant="secondary"
                    icon={<ArrowUpTrayIcon className="w-4 h-4" />}
                    className="text-sm"
                  >
                    <span className="hidden sm:inline">Importeren</span>
                    <span className="sm:hidden">Import</span>
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
                  className="text-sm"
                >
                  <span className="hidden sm:inline">Nieuwe Badge Ontwerpen</span>
                  <span className="sm:hidden">Nieuwe Badge</span>
                </AdminButton>
              </div>
            </div>

            <div className="bg-[#181F17] rounded-xl overflow-hidden border border-[#3A4D23]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#232D1A] border-b border-[#3A4D23]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Icoon</th>
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
                          <span className="text-2xl">{badge.icon}</span>
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
                            >
                              {badge.isActive ? '⏸️' : '▶️'}
                            </button>
                            <button
                              onClick={() => handleBadgeDelete(badge.id)}
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

      {activeTab === 'ranks' && (
        <>
          {/* Rank Statistics */}
          {rankStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <AdminButton
                  onClick={() => exportData('ranks')}
                  variant="secondary"
                  icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                  className="text-sm"
                >
                  <span className="hidden sm:inline">Exporteren</span>
                  <span className="sm:hidden">Export</span>
                </AdminButton>
                <label className="cursor-pointer">
                  <AdminButton
                    variant="secondary"
                    icon={<ArrowUpTrayIcon className="w-4 h-4" />}
                    className="text-sm"
                  >
                    <span className="hidden sm:inline">Importeren</span>
                    <span className="sm:hidden">Import</span>
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
                  className="text-sm"
                >
                  <span className="hidden sm:inline">Nieuwe Rang Toevoegen</span>
                  <span className="sm:hidden">Nieuwe Rang</span>
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
            { value: 'streak_reached', label: 'Streak Bereikt', type: 'number' },
            { value: 'goal_achieved', label: 'Doel Behaald', type: 'boolean' },
            { value: 'community_contribution', label: 'Community Bijdrage', type: 'text' },
            { value: 'learning_completed', label: 'Leermodule Voltooid', type: 'number' },
            { value: 'financial_milestone', label: 'Financiële Mijlpaal', type: 'number' }
          ]}
          getConditionsForAction={(action: string) => {
            const conditions: { [key: string]: Array<{ value: string; label: string; type: 'text' | 'number' }> } = {
              workout_completed: [
                { value: 'total_count', label: 'Totaal aantal workouts', type: 'number' },
                { value: 'streak_days', label: 'Aantal dagen op rij', type: 'number' },
                { value: 'workout_type', label: 'Type workout', type: 'text' }
              ],
              streak_reached: [
                { value: 'days', label: 'Aantal dagen', type: 'number' },
                { value: 'activity_type', label: 'Type activiteit', type: 'text' }
              ]
            };
            return conditions[action] || [];
          }}
          operators={[
            { value: 'equals', label: 'is gelijk aan' },
            { value: 'greater_than', label: 'is groter dan' },
            { value: 'less_than', label: 'is kleiner dan' },
            { value: 'contains', label: 'bevat' },
            { value: 'starts_with', label: 'begint met' }
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
    </div>
  );
}