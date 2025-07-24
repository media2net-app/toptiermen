'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  durationDays: number;
  xpReward: number;
  badgeName: string;
  badgeIcon: string;
  isCommunityChallenge: boolean;
  status: 'available' | 'active' | 'completed';
  progress: number;
  currentStreak: number;
  daysRemaining: number;
  isCompletedToday: boolean;
  startDate?: string;
  completionDate?: string;
}

interface ChallengeSummary {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  totalXpEarned: number;
  dailyXpEarned: number;
  completedXp: number;
  averageProgress: number;
}

export default function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [summary, setSummary] = useState<ChallengeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [joiningChallenge, setJoiningChallenge] = useState<string | null>(null);
  const [completingChallenge, setCompletingChallenge] = useState<string | null>(null);
  const [undoingChallenge, setUndoingChallenge] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  const loadChallenges = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/challenges?userId=${user.id}`);
      const data = await response.json();
      
      if (data.challenges) {
        setChallenges(data.challenges);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
      toast.error('Fout bij het laden van challenges');
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;
    
    setJoiningChallenge(challengeId);
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          userId: user.id,
          challengeId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        loadChallenges(); // Reload to update status
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error('Fout bij het starten van challenge');
    } finally {
      setJoiningChallenge(null);
    }
  };

  const completeDay = async (challengeId: string) => {
    if (!user) return;
    
    setCompletingChallenge(challengeId);
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete-day',
          userId: user.id,
          challengeId,
          notes: 'Dag voltooid'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        if (data.challengeCompleted) {
          toast.success(`🎉 Challenge voltooid! +${data.xpEarned} XP verdiend!`);
        }
        loadChallenges(); // Reload to update progress
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error completing day:', error);
      toast.error('Fout bij het voltooien van dag');
    } finally {
      setCompletingChallenge(null);
    }
  };

  const undoDay = async (challengeId: string) => {
    if (!user) return;
    
    setUndoingChallenge(challengeId);
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'undo-day',
          userId: user.id,
          challengeId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        loadChallenges(); // Reload to update progress
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error undoing day:', error);
      toast.error('Fout bij het ongedaan maken van dag');
    } finally {
      setUndoingChallenge(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
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
          <h1 className="text-3xl font-bold text-white mb-2">Challenges</h1>
          <p className="text-gray-400">Neem deel aan uitdagingen en verdien XP, badges en rangen</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#FFD700]">{summary.totalChallenges}</div>
              <div className="text-[#8BAE5A] text-sm">Totaal Challenges</div>
            </div>

            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#FFD700]">{summary.activeChallenges}</div>
              <div className="text-[#8BAE5A] text-sm">Actieve Challenges</div>
            </div>

            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#FFD700]">{summary.completedChallenges}</div>
              <div className="text-[#8BAE5A] text-sm">Voltooid</div>
            </div>

            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#FFD700]">{summary.totalXpEarned}</div>
              <div className="text-[#8BAE5A] text-sm">XP Verdiend</div>
              <div className="text-xs text-gray-400 mt-1">
                {summary.dailyXpEarned > 0 && `+${summary.dailyXpEarned} dagelijks`}
                {summary.completedXp > 0 && summary.dailyXpEarned > 0 && ' • '}
                {summary.completedXp > 0 && `+${summary.completedXp} voltooid`}
              </div>
            </div>
          </div>
        )}

        {/* Available Challenges */}
        {challenges.filter(c => c.status === 'available').length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Beschikbare Challenges</h2>
            <div className="space-y-4">
              {challenges.filter(c => c.status === 'available').map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 hover:border-[#8BAE5A]/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{challenge.badgeIcon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{challenge.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-[#8BAE5A]">{challenge.category}</span>
                          <span className="text-sm text-gray-400">{challenge.difficulty}</span>
                          <span className="text-sm text-gray-400">{challenge.durationDays} dagen</span>
                          {challenge.isCommunityChallenge && (
                            <span className="text-sm text-[#FFD700]">👥 Community</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#FFD700]">+{challenge.xpReward} XP</div>
                        <div className="text-sm text-gray-400">{challenge.badgeName}</div>
                      </div>
                      <button
                        onClick={() => joinChallenge(challenge.id)}
                        disabled={joiningChallenge === challenge.id}
                        className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] hover:from-[#7A9D4A] hover:to-[#5A7D2A] text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {joiningChallenge === challenge.id ? 'Starten...' : 'Start Challenge'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Challenges */}
        {challenges.filter(c => c.status === 'active').length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Actieve Challenges</h2>
            <div className="space-y-4">
              {challenges.filter(c => c.status === 'active').map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 hover:border-[#8BAE5A]/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{challenge.badgeIcon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{challenge.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-[#8BAE5A]">{challenge.category}</span>
                          <span className="text-sm text-gray-400">{challenge.difficulty}</span>
                          <span className="text-sm text-gray-400">{challenge.daysRemaining} dagen resterend</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>Voortgang</span>
                            <span>{challenge.progress}%</span>
                          </div>
                          <div className="w-full bg-[#0F1419] rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${challenge.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-[#FFD700]">🔥 {challenge.currentStreak} dagen streak</span>
                          {challenge.startDate && (
                            <span className="text-sm text-gray-400">
                              Gestart: {new Date(challenge.startDate).toLocaleDateString('nl-NL')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#FFD700]">+{challenge.xpReward} XP</div>
                        <div className="text-sm text-gray-400">{challenge.badgeName}</div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => completeDay(challenge.id)}
                          disabled={completingChallenge === challenge.id || challenge.isCompletedToday}
                          className={`font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                            challenge.isCompletedToday
                              ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed'
                              : 'bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] hover:from-[#7A9D4A] hover:to-[#5A7D2A] text-white'
                          }`}
                        >
                          {completingChallenge === challenge.id 
                            ? 'Voltooien...' 
                            : challenge.isCompletedToday 
                              ? '✅ Vandaag voltooid' 
                              : 'Dag voltooien (+10 XP)'}
                        </button>
                        {challenge.currentStreak > 0 && (
                          <button
                            onClick={() => undoDay(challenge.id)}
                            disabled={undoingChallenge === challenge.id}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {undoingChallenge === challenge.id ? 'Ongedaan maken...' : 'Ongedaan (-10 XP)'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Challenges */}
        {challenges.filter(c => c.status === 'completed').length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Voltooide Challenges</h2>
            <div className="space-y-4">
              {challenges.filter(c => c.status === 'completed').map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-gradient-to-br from-[#1A1F2E] to-[#232D1A] border border-[#3A4D23]/50 rounded-xl p-6 opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{challenge.badgeIcon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white line-through">{challenge.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{challenge.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-[#8BAE5A]">{challenge.category}</span>
                          <span className="text-sm text-gray-400">{challenge.difficulty}</span>
                          <span className="text-sm text-gray-400">{challenge.durationDays} dagen</span>
                        </div>
                        {challenge.completionDate && (
                          <p className="text-sm text-gray-400 mt-1">
                            Voltooid op: {new Date(challenge.completionDate).toLocaleDateString('nl-NL')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#FFD700]">+{challenge.xpReward} XP</div>
                        <div className="text-sm text-gray-400">{challenge.badgeName}</div>
                      </div>
                      <div className="text-4xl">🏆</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {challenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">Geen challenges beschikbaar</h3>
            <p className="text-gray-400">Er zijn momenteel geen challenges beschikbaar. Check later terug!</p>
          </div>
        )}
      </div>
    </div>
  );
} 