'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

interface Mission {
  id: string;
  title: string;
  type: string;
  done: boolean;
  category: string;
  icon: string;
  badge: string;
  progress: number;
  shared: boolean;
  accountabilityPartner: string | null;
  xp_reward: number;
  last_completion_date?: string | null;
}

interface Summary {
  completedToday: number;
  totalToday: number;
  dailyStreak: number;
}

export default function MijnMissiesPage() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [summary, setSummary] = useState<Summary>({ completedToday: 0, totalToday: 0, dailyStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMission, setNewMission] = useState({ title: '', type: 'Dagelijks' });
  const [showDailyCompletion, setShowDailyCompletion] = useState(false);
  const [showAlmostCompleted, setShowAlmostCompleted] = useState(false);
  const [hasDismissedDaily, setHasDismissedDaily] = useState(false);
  const [hasDismissedAlmost, setHasDismissedAlmost] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);

  // Helper function to check if mission was completed today
  const isMissionCompletedToday = (completionDate: string | null | undefined): boolean => {
    if (!completionDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return completionDate === today;
  };

  // Load missions
  useEffect(() => {
    if (!user?.id) return;

    async function loadMissions() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/missions-simple?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to load missions');
        }

        const data = await response.json();
        
        // Update missions with proper daily tracking
        const updatedMissions = data.missions.map((mission: Mission) => ({
          ...mission,
          done: mission.type === 'Dagelijks' 
            ? isMissionCompletedToday(mission.last_completion_date)
            : mission.done
        }));

                setMissions(updatedMissions);
        setSummary(data.summary);
      } catch (err) {
        console.error('Error loading missions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load missions');
      } finally {
        setLoading(false);
      }
    }

    loadMissions();
  }, [user?.id]);

  // Check for daily completion notifications
  useEffect(() => {
    if (summary.totalToday > 0) {
      const allDailyCompleted = summary.completedToday === summary.totalToday;
      const almostCompleted = summary.completedToday >= summary.totalToday - 1 && summary.completedToday > 0;
      const wasCompletedBefore = showDailyCompletion;
      const wasAlmostCompletedBefore = showAlmostCompleted;

      setShowDailyCompletion(allDailyCompleted && !hasDismissedDaily);
      setShowAlmostCompleted(almostCompleted && !allDailyCompleted && !hasDismissedAlmost);

      // Show toast notification when all missions are completed
      if (allDailyCompleted && !wasCompletedBefore && !loading) {
        toast.success('🏆 Alle dagelijkse missies volbracht! Je bent een echte Top Tier Man! Morgen staan er weer nieuwe uitdagingen klaar! 💪', {
          autoClose: 6000,
          position: "top-center",
          style: {
            background: '#232D1A',
            color: '#8BAE5A',
            border: '2px solid #8BAE5A',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            maxWidth: '500px'
          }
        });
      }

      // Show encouragement when almost completed
      if (almostCompleted && !allDailyCompleted && !wasAlmostCompletedBefore && !loading) {
        toast.info('🔥 Bijna alle missies volbracht! Nog even doorzetten voor de perfecte dag! 💪', {
          autoClose: 4000,
          position: "top-center",
          style: {
            background: '#232D1A',
            color: '#f0a14f',
            border: '2px solid #f0a14f',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            maxWidth: '500px'
          }
        });
      }
    }
  }, [summary, loading, showDailyCompletion, showAlmostCompleted, hasDismissedDaily, hasDismissedAlmost]);

  // Load user preferences from database
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/user-preferences?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user preferences');
        }

        const data = await response.json();
        
        if (data.success) {
          const today = new Date().toISOString().split('T')[0];
          const lastDismissDate = data.preferences.last_dismiss_date || '2024-01-01';
          
          // Reset dismiss states on new day
          if (lastDismissDate !== today) {
            setHasDismissedDaily(false);
            setHasDismissedAlmost(false);
            // Update last dismiss date in database
            await fetch('/api/user-preferences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                preferenceKey: 'last_dismiss_date',
                preferenceValue: today
              })
            });
          } else {
            setHasDismissedDaily(data.preferences.daily_completion_dismissed === 'true');
            setHasDismissedAlmost(data.preferences.almost_completed_dismissed === 'true');
          }
          
          setPreferencesLoaded(true);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
        setPreferencesLoaded(true); // Continue without preferences
      }
    };

    loadUserPreferences();
  }, [user?.id]);

  // Toggle mission completion
  const toggleMission = async (missionId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/missions-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          userId: user.id,
          missionId: missionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle mission');
      }

      const data = await response.json();

      if (data.success) {
        // Update missions state
        setMissions(prevMissions => 
          prevMissions.map(mission => {
            if (mission.id === missionId) {
              const isCompleted = data.completed;
              return {
                ...mission,
                done: isCompleted,
                last_completion_date: data.completionDate || null
              };
            }
            return mission;
          })
        );

        // Update summary
        if (data.completed) {
          setSummary(prev => ({
            ...prev,
            completedToday: prev.completedToday + 1
          }));
        } else {
          setSummary(prev => ({
            ...prev,
            completedToday: Math.max(0, prev.completedToday - 1)
          }));
        }

        // Show success message
        if (data.xpEarned > 0) {
          toast.success(`🎉 ${data.message || `Missie voltooid! +${data.xpEarned} XP verdiend!`}`);
        } else if (data.xpEarned < 0) {
          toast.info(`Missie ongedaan gemaakt. ${Math.abs(data.xpEarned)} XP afgetrokken.`);
        }
      }
    } catch (err) {
      console.error('Error toggling mission:', err);
      toast.error('Fout bij het voltooien van de missie');
    }
  };

  // Add new mission
  const addMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newMission.title.trim()) return;

    try {
      const response = await fetch('/api/missions-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          userId: user.id,
          title: newMission.title,
          type: newMission.type
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create mission');
      }

      const data = await response.json();

      if (data.success) {
                // Add the new mission to the list
        const newMissionData = data.mission;
        setMissions(prev => [...prev, newMissionData]);

        // Update summary to include the new daily mission
        if (newMissionData.type === 'Dagelijks') {
          setSummary(prev => ({
            ...prev,
            totalToday: prev.totalToday + 1
          }));
        }
        
        setNewMission({ title: '', type: 'Dagelijks' });
        toast.success(data.message || 'Missie toegevoegd!');
      }
    } catch (err) {
      console.error('Error creating mission:', err);
      toast.error('Fout bij het toevoegen van de missie');
    }
  };

  // Delete mission
  const deleteMission = async (missionId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/missions-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          userId: user.id,
          missionId: missionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete mission');
      }

      const data = await response.json();

      if (data.success) {
        // Remove mission from state
        setMissions(prev => prev.filter(mission => mission.id !== missionId));
        
        // Update summary if it was a daily mission
        if (missionToDelete?.type === 'Dagelijks') {
          setSummary(prev => ({
            ...prev,
            totalToday: Math.max(0, prev.totalToday - 1),
            completedToday: missionToDelete.done ? Math.max(0, prev.completedToday - 1) : prev.completedToday
          }));
        }
        
        setShowDeleteConfirm(false);
        setMissionToDelete(null);
        toast.success(data.message || 'Missie succesvol verwijderd! 💪');
      }
    } catch (err) {
      console.error('Error deleting mission:', err);
      toast.error('Fout bij het verwijderen van de missie');
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (mission: Mission) => {
    setMissionToDelete(mission);
    setShowDeleteConfirm(true);
  };

  // Filter missions
  const pendingMissions = missions.filter(m => !m.done);
  const completedMissions = missions.filter(m => m.done);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-red-400 text-center py-8">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mijn Missies</h1>
          <p className="text-gray-400">Voltooi dagelijkse missies en verdien XP</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#FFD700]">{summary.completedToday}</div>
            <div className="text-[#8BAE5A] text-sm">Vandaag Voltooid</div>
          </div>
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#FFD700]">{summary.totalToday}</div>
            <div className="text-[#8BAE5A] text-sm">Totaal Vandaag</div>
          </div>
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#FFD700]">{summary.dailyStreak}</div>
            <div className="text-[#8BAE5A] text-sm">Dagelijkse Streak</div>
          </div>
        </div>

        {/* Daily Completion Celebration */}
        {showDailyCompletion && (
          <div className="mb-8 animate-fade-in-up">
            <div className="bg-gradient-to-br from-[#8BAE5A]/20 to-[#f0a14f]/20 border-2 border-[#8BAE5A] rounded-2xl p-6 text-center shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl mr-3">🏆</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Alle Dagelijkse Missies Volbracht!
                </h2>
                <span className="text-4xl ml-3">🏆</span>
              </div>
              <p className="text-[#8BAE5A] text-lg mb-4 font-semibold">
                Je bent een echte Top Tier Man! 💪
              </p>
              <div className="bg-[#181F17]/80 rounded-xl p-4 mb-4">
                <p className="text-white text-sm leading-relaxed">
                  <strong>Gefeliciteerd!</strong> Je hebt vandaag alle dagelijkse missies succesvol afgerond. 
                  Dit toont aan dat je de discipline en doorzettingsvermogen hebt van een echte leider. 
                  Blijf deze momentum vasthouden en blijf jezelf elke dag uitdagen.
                </p>
              </div>
              <div className="bg-[#232D1A]/80 rounded-xl p-4 border border-[#3A4D23]">
                <p className="text-[#8BAE5A] text-sm font-semibold">
                  🌅 <strong>Morgen staan er weer nieuwe uitdagingen voor je klaar!</strong> 
                  Blijf scherp, blijf gefocust en blijf groeien. Jouw toekomstige zelf zal je dankbaar zijn.
                </p>
              </div>
              <button 
                onClick={async () => {
                  setShowDailyCompletion(false);
                  setHasDismissedDaily(true);
                  
                  // Save to database
                  if (user?.id) {
                    try {
                      await fetch('/api/user-preferences', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: user.id,
                          preferenceKey: 'daily_completion_dismissed',
                          preferenceValue: 'true'
                        })
                      });
                    } catch (error) {
                      console.error('Error saving dismiss state:', error);
                    }
                  }
                }}
                className="mt-4 px-6 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#8BAE5A] hover:text-white transition-colors duration-300 font-semibold"
              >
                Begrepen
              </button>
            </div>
          </div>
        )}

        {/* Almost Completed Encouragement */}
        {showAlmostCompleted && (
          <div className="mb-8 animate-fade-in-up">
            <div className="bg-gradient-to-br from-[#f0a14f]/20 to-[#FFD700]/20 border-2 border-[#f0a14f] rounded-2xl p-6 text-center shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl mr-3">🔥</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Bijna Alle Missies Volbracht!
                </h2>
                <span className="text-4xl ml-3">🔥</span>
              </div>
              <p className="text-[#f0a14f] text-lg mb-4 font-semibold">
                Nog even doorzetten voor de perfecte dag! 💪
              </p>
              <div className="bg-[#181F17]/80 rounded-xl p-4 mb-4">
                <p className="text-white text-sm leading-relaxed">
                  <strong>Fantastisch werk!</strong> Je hebt al {summary.completedToday} van de {summary.totalToday} dagelijkse missies volbracht. 
                  Je bent zo dichtbij een perfecte dag! Blijf gefocust en voltooi die laatste missie om jezelf te bewijzen dat je een echte Top Tier Man bent.
                </p>
              </div>
              <div className="bg-[#232D1A]/80 rounded-xl p-4 border border-[#3A4D23]">
                <p className="text-[#f0a14f] text-sm font-semibold">
                  ⚡ <strong>Die laatste missie maakt het verschil!</strong> 
                  Het is de discipline in de moeilijke momenten die echte leiders onderscheidt van de rest.
                </p>
              </div>
              <button 
                onClick={async () => {
                  setShowAlmostCompleted(false);
                  setHasDismissedAlmost(true);
                  
                  // Save to database
                  if (user?.id) {
                    try {
                      await fetch('/api/user-preferences', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: user.id,
                          preferenceKey: 'almost_completed_dismissed',
                          preferenceValue: 'true'
                        })
                      });
                    } catch (error) {
                      console.error('Error saving dismiss state:', error);
                    }
                  }
                }}
                className="mt-4 px-6 py-2 bg-[#3A4D23] text-[#f0a14f] rounded-lg hover:bg-[#f0a14f] hover:text-white transition-colors duration-300 font-semibold"
              >
                Begrepen
              </button>
            </div>
          </div>
        )}

        {/* Add New Mission */}
        <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Nieuwe Missie Toevoegen</h2>
          <form onSubmit={addMission} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newMission.title}
              onChange={(e) => setNewMission(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Missie titel..."
              className="flex-1 bg-[#0F1419] border border-[#3A4D23]/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
            />
            <select
              value={newMission.type}
              onChange={(e) => setNewMission(prev => ({ ...prev, type: e.target.value }))}
              className="bg-[#0F1419] border border-[#3A4D23]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8BAE5A]"
            >
              <option value="Dagelijks">Dagelijks</option>
            </select>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] hover:from-[#7A9D4A] hover:to-[#5A7D2A] text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200"
            >
              Toevoegen
            </button>
          </form>
        </div>

        {/* TO DO Missions */}
        {pendingMissions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Te Doen</h2>
            <div className="space-y-4">
              {pendingMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 hover:border-[#8BAE5A]/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{mission.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{mission.title}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-[#8BAE5A]">{mission.type}</span>
                          <span className="text-sm text-gray-400">{mission.category}</span>
                          {mission.shared && (
                            <span className="text-sm text-[#FFD700]">👥 Gedeeld</span>
                          )}
                        </div>
                        {mission.accountabilityPartner && (
                          <p className="text-sm text-gray-400 mt-1">
                            Accountability Partner: {mission.accountabilityPartner}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#FFD700]">+{mission.xp_reward} XP</div>
                        <div className="text-sm text-gray-400">{mission.badge}</div>
                      </div>
                      <button
                        onClick={() => toggleMission(mission.id)}
                        className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] hover:from-[#7A9D4A] hover:to-[#5A7D2A] text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                      >
                        Voltooien
                      </button>
                      <button
                        onClick={() => handleDeleteClick(mission)}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                        title="Verwijder missie"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Missions */}
        {completedMissions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Voltooid</h2>
            <div className="space-y-4">
              {completedMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-gradient-to-br from-[#1A1F2E] to-[#232D1A] border border-[#3A4D23]/50 rounded-xl p-6 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{mission.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white line-through">{mission.title}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-[#8BAE5A]">{mission.type}</span>
                          <span className="text-sm text-gray-400">{mission.category}</span>
                          {mission.shared && (
                            <span className="text-sm text-[#FFD700]">👥 Gedeeld</span>
                          )}
                        </div>
                        {mission.last_completion_date && (
                          <p className="text-sm text-gray-400 mt-1">
                            Voltooid op: {new Date(mission.last_completion_date).toLocaleDateString('nl-NL')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#FFD700]">+{mission.xp_reward} XP</div>
                        <div className="text-sm text-gray-400">{mission.badge}</div>
                      </div>
                      <button
                        onClick={() => toggleMission(mission.id)}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                      >
                        Ongedaan
                      </button>
                      <button
                        onClick={() => handleDeleteClick(mission)}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                        title="Verwijder missie"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {missions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">Geen missies gevonden</h3>
            <p className="text-gray-400">Voeg je eerste missie toe om te beginnen!</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && missionToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border-2 border-red-600 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="text-4xl mb-4">⚔️</div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Missie Verwijderen
                </h2>
                <div className="bg-[#0F1419]/80 rounded-xl p-4 mb-6 border border-[#3A4D23]">
                  <p className="text-white text-sm leading-relaxed mb-3">
                    <strong>Top Tier Man,</strong> ben je zeker dat je deze missie wilt verwijderen?
                  </p>
                  <div className="bg-[#232D1A]/80 rounded-lg p-3 border border-red-600/30">
                    <p className="text-red-400 text-sm font-semibold">
                      "{missionToDelete.title}"
                    </p>
                  </div>
                </div>
                <div className="bg-[#232D1A]/80 rounded-xl p-4 border border-[#3A4D23] mb-6">
                  <p className="text-[#8BAE5A] text-sm font-semibold">
                    💪 <strong>Herinnering:</strong> Echte leiders maken bewuste keuzes. 
                    Zorg ervoor dat je deze missie niet meer nodig hebt voor je groei.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setMissionToDelete(null);
                    }}
                    className="flex-1 bg-[#3A4D23] text-[#8BAE5A] px-6 py-3 rounded-lg hover:bg-[#8BAE5A] hover:text-white transition-colors duration-300 font-semibold"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() => deleteMission(missionToDelete.id)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg transition-all duration-300 font-semibold"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 