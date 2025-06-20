'use client';
import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
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

// Available actions for badge triggers
const availableActions = [
  { value: 'workout_completed', label: 'Workout Voltooid', type: 'number' as const },
  { value: 'streak_reached', label: 'Streak Bereikt', type: 'number' as const },
  { value: 'goal_achieved', label: 'Doel Behaald', type: 'boolean' as const },
  { value: 'community_contribution', label: 'Community Bijdrage', type: 'text' as const },
  { value: 'learning_completed', label: 'Leermodule Voltooid', type: 'number' as const },
  { value: 'financial_milestone', label: 'Financiële Mijlpaal', type: 'number' as const }
];

// Available conditions based on action
const getConditionsForAction = (action: string) => {
  const conditions: { [key: string]: Array<{ value: string; label: string; type: 'text' | 'number' }> } = {
    training_completed: [
      { value: 'total_count', label: 'Totaal aantal trainingen', type: 'number' },
      { value: 'streak_days', label: 'Aantal dagen op rij', type: 'number' },
      { value: 'workout_type', label: 'Type workout', type: 'text' },
    ],
    mission_completed: [
      { value: 'mission_name', label: 'Missie naam', type: 'text' },
      { value: 'total_count', label: 'Totaal aantal keer voltooid', type: 'number' },
      { value: 'mission_category', label: 'Missie categorie', type: 'text' },
    ],
    academy_lesson_completed: [
      { value: 'module_name', label: 'Module naam', type: 'text' },
      { value: 'lesson_name', label: 'Les naam', type: 'text' },
      { value: 'total_modules', label: 'Totaal aantal modules', type: 'number' },
    ],
    forum_post_created: [
      { value: 'total_posts', label: 'Totaal aantal posts', type: 'number' },
      { value: 'post_category', label: 'Post categorie', type: 'text' },
      { value: 'helpful_votes', label: 'Aantal nuttige stemmen', type: 'number' },
    ],
    connection_made: [
      { value: 'total_connections', label: 'Totaal aantal connecties', type: 'number' },
      { value: 'connection_type', label: 'Type connectie', type: 'text' },
    ],
    book_marked_read: [
      { value: 'total_books', label: 'Totaal aantal boeken', type: 'number' },
      { value: 'book_category', label: 'Boek categorie', type: 'text' },
    ],
    meditation_completed: [
      { value: 'total_sessions', label: 'Totaal aantal sessies', type: 'number' },
      { value: 'streak_days', label: 'Aantal dagen op rij', type: 'number' },
      { value: 'meditation_type', label: 'Type meditatie', type: 'text' },
    ],
    workout_completed: [
      { value: 'total_workouts', label: 'Totaal aantal workouts', type: 'number' },
      { value: 'workout_type', label: 'Type workout', type: 'text' },
      { value: 'streak_days', label: 'Aantal dagen op rij', type: 'number' },
    ],
    nutrition_plan_followed: [
      { value: 'total_days', label: 'Totaal aantal dagen', type: 'number' },
      { value: 'plan_name', label: 'Plan naam', type: 'text' },
    ],
    event_attended: [
      { value: 'total_events', label: 'Totaal aantal evenementen', type: 'number' },
      { value: 'event_type', label: 'Type evenement', type: 'text' },
    ],
  };
  return conditions[action] || [];
};

const operators = [
  { value: 'equals', label: 'is gelijk aan' },
  { value: 'greater_than', label: 'is groter dan' },
  { value: 'less_than', label: 'is kleiner dan' },
  { value: 'contains', label: 'bevat' },
  { value: 'starts_with', label: 'begint met' },
];

export default function AdminBadgesRangenPage() {
  const [activeTab, setActiveTab] = useState<'badges' | 'ranks'>('badges');
  const [badges, setBadges] = useState<Badge[]>([
    {
      id: '1',
      name: 'Fitness Warrior',
      description: 'Voltooid 10 workouts in 30 dagen',
      icon: '🏋️',
      category: 'Fitness',
      levels: [],
      trigger: 'workout_completed',
      conditions: [],
      isActive: true,
      ruleLogic: 'AND',
      timeWindow: 30
    },
    {
      id: '2',
      name: 'Mind Master',
      description: 'Voltooid 5 meditatiesessies',
      icon: '🧘',
      category: 'Mindset',
      levels: [],
      trigger: 'meditation_completed',
      conditions: [],
      isActive: true,
      ruleLogic: 'AND',
      timeWindow: 30
    },
    {
      id: '3',
      name: 'Academy Graduate',
      description: 'Voltooi Module 6: Broederschap',
      icon: '🎓',
      category: 'Academy',
      levels: [],
      trigger: 'learning_completed',
      conditions: [],
      isActive: true,
      ruleLogic: 'AND',
      timeWindow: 30
    },
    {
      id: '4',
      name: 'Community Leader',
      description: 'Plaats 100 forumposts en krijg 50 nuttige stemmen',
      icon: '👑',
      category: 'Community',
      levels: [
        {
          id: 'level-1',
          name: 'Brons',
          color: '#CD7F32',
          requirements: '25 posts, 10 stemmen',
          conditions: []
        },
        {
          id: 'level-2',
          name: 'Zilver',
          color: '#C0C0C0',
          requirements: '50 posts, 25 stemmen',
          conditions: []
        },
        {
          id: 'level-3',
          name: 'Goud',
          color: '#FFD700',
          requirements: '100 posts, 50 stemmen',
          conditions: []
        }
      ],
      trigger: 'community_contribution',
      conditions: [],
      isActive: true,
      ruleLogic: 'AND',
      timeWindow: 30
    }
  ]);
  const [ranks, setRanks] = useState<Rank[]>([
    {
      id: '1',
      name: 'Novice',
      level: 1,
      color: '#6B7280',
      requirements: 'Nieuwe lid',
      benefits: 'Basis toegang tot platform'
    },
    {
      id: '2',
      name: 'Warrior',
      level: 2,
      color: '#3B82F6',
      requirements: '5 badges behaald',
      benefits: 'Toegang tot exclusieve content'
    },
    {
      id: '3',
      name: 'Elite',
      level: 3,
      color: '#F59E0B',
      requirements: '15 badges behaald',
      benefits: 'Mentorship programma toegang'
    },
    {
      id: '4',
      name: 'Veteran',
      level: 4,
      color: '#8B5CF6',
      requirements: '30 badges behaald',
      benefits: 'Toegang tot alle premium features en persoonlijke coaching sessies'
    },
    {
      id: '5',
      name: 'Legend',
      level: 5,
      color: '#EF4444',
      requirements: '50 badges behaald',
      benefits: 'De hoogste rang. Kan content creëren en heeft volledige platform toegang'
    }
  ]);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);

  // Badge management
  const handleBadgeSave = (badge: Badge) => {
    setBadges((prev) => {
      const exists = prev.find((b) => b.id === badge.id);
      if (exists) {
        return prev.map((b) => (b.id === badge.id ? badge : b));
      } else {
        return [...prev, { ...badge, id: Date.now().toString() }];
      }
    });
    setIsBadgeModalOpen(false);
  };

  const handleBadgeDelete = (badgeId: string) => {
    if (confirm('Weet je zeker dat je deze badge wilt verwijderen?')) {
      setBadges((prev) => prev.filter((b) => b.id !== badgeId));
    }
  };

  const handleToggleBadgeStatus = (badgeId: string) => {
    setBadges((prev) =>
      prev.map((b) =>
        b.id === badgeId ? { ...b, isActive: !b.isActive } : b
      )
    );
  };

  // Rank management
  const handleRankSave = (rank: Rank) => {
    setRanks((prevRanks) => {
      const sortedRanks = [...prevRanks].sort((a, b) => a.level - b.level);
      const exists = sortedRanks.find((r) => r.id === rank.id);
      if (exists) {
        return sortedRanks.map((r) => (r.id === rank.id ? rank : r));
      } else {
        return [...sortedRanks, { ...rank, id: Date.now().toString() }];
      }
    });
    setIsRankModalOpen(false);
  };

  const handleRankDelete = (rankId: string) => {
    if (confirm('Weet je zeker dat je deze rang wilt verwijderen?')) {
      setRanks((prev) => prev.filter((r) => r.id !== rankId));
    }
  };

  const handleEditRank = (rank: Rank) => {
    setEditingRank(rank);
    setIsRankModalOpen(true);
  };
  
  // Export functionality
  const exportData = (type: 'badges' | 'ranks') => {
    const data = type === 'badges' ? badges : ranks;
    const filename = `toptiermen-${type}-${new Date().toISOString().split('T')[0]}.json`;
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import functionality
  const importData = (type: 'badges' | 'ranks', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (Array.isArray(data)) {
          if (type === 'badges') {
            setBadges(data);
          } else {
            setRanks(data);
          }
          alert(`${type === 'badges' ? 'Badges' : 'Rangen'} succesvol geïmporteerd!`);
        } else {
          alert('Ongeldig bestandsformaat. Verwacht een JSON array.');
        }
      } catch (error) {
        alert('Fout bij het importeren van het bestand. Controleer of het een geldig JSON bestand is.');
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };
  
  return (
    <div className="min-h-screen bg-[#0F1411] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Badges & Rangen Beheer</h1>
          <p className="text-white/60">Game Design Studio - Beheer het gamification systeem</p>
        </div>

        <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1 mb-8">
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
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Badges Beheren</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => exportData('badges')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Exporteren
                </button>
                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  Importeren
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => importData('badges', e)}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => {
                    setEditingBadge(null);
                    setIsBadgeModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Nieuwe Badge Ontwerpen
                </button>
              </div>
            </div>

            <div className="bg-[#232D1A] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#181F17]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Icoon</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Naam Badge</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Omschrijving</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Trigger</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A4D23]">
                    {badges.map((badge) => (
                      <tr key={badge.id} className="hover:bg-[#181F17]/50">
                        <td className="px-6 py-4">
                          <span className="text-2xl">{badge.icon}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium">{badge.name}</div>
                            <div className="text-sm text-white/60">{badge.category}</div>
                            {badge.levels.length > 0 && (
                              <div className="text-xs text-[#8BAE5A]">Multi-level</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/80 max-w-xs">
                          {badge.description}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-[#8BAE5A]">{badge.trigger}</div>
                            <div className="text-white/60 text-xs">
                              {badge.conditions.length} voorwaarde(n)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleBadgeStatus(badge.id)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              badge.isActive
                                ? 'bg-green-900/30 text-green-400 hover:bg-red-900/30 hover:text-red-400'
                                : 'bg-red-900/30 text-red-400 hover:bg-green-900/30 hover:text-green-400'
                            }`}
                          >
                            {badge.isActive ? 'Actief' : 'Inactief'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingBadge(badge);
                                setIsBadgeModalOpen(true);
                              }}
                              className="p-1 text-[#8BAE5A] hover:text-white transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleBadgeDelete(badge.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
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
          </div>
        )}

        {activeTab === 'ranks' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Rangen Beheren</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => exportData('ranks')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Exporteren
                </button>
                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  Importeren
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => importData('ranks', e)}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setIsReorderMode(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  Rangen Herordenen
                </button>
                <button
                  onClick={() => {
                    setEditingRank(null);
                    setIsRankModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Nieuwe Rang Toevoegen
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {ranks
                .sort((a, b) => a.level - b.level)
                .map((rank) => (
                  <div key={rank.id} className="bg-[#232D1A] rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: rank.color }}
                        ></div>
                        <div>
                          <h3 className="text-xl font-semibold text-[#8BAE5A]">{rank.name}</h3>
                          <p className="text-white/60 text-sm">
                            Niveau {rank.level} • {rank.requirements}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditRank(rank)}
                          className="p-2 text-[#8BAE5A] hover:text-white transition-colors"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRankDelete(rank.id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-white/80 mt-3">{rank.benefits}</p>
                  </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isBadgeModalOpen && (
        <BadgeModal
          isOpen={isBadgeModalOpen}
          onClose={() => setIsBadgeModalOpen(false)}
          onSave={handleBadgeSave}
          badge={editingBadge}
          availableActions={availableActions}
          getConditionsForAction={getConditionsForAction}
          operators={operators}
          onDelete={handleBadgeDelete}
        />
      )}

      {isRankModalOpen && (
        <RankModal
          isOpen={isRankModalOpen}
          onClose={() => {
            setIsRankModalOpen(false);
            setEditingRank(null);
          }}
          onSave={handleRankSave}
          editingRank={editingRank}
          ranks={ranks}
          setRanks={setRanks}
          isReorderMode={isReorderMode}
        />
      )}
    </div>
  );
}