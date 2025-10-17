'use client';

import { useEffect, useState } from 'react';

// Types for all data tabs
type TrainingSchemaRow = {
  userId: string;
  email: string | null;
  fullName: string | null;
  selectedSchemaId: string | null;
  selectedSchemaName: string | null;
  selectedSchemaNumber: number | null;
  trainingFrequency: number;
  totalDaysCompleted: number;
  weeksCompleted: number;
  completedAt: string | null;
};

type NutritionPlanRow = {
  userId: string;
  email: string | null;
  fullName: string | null;
  selectedPlanId: string | null;
  selectedPlanName: string | null;
  planGoal: string | null;
  fitnessGoal: string | null;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  daysSinceStart: number;
  hasCustomPlans: boolean;
  customPlanCount: number;
  isActive: boolean;
  lastUpdated: string | null;
};

type AcademyProgressRow = {
  userId: string;
  email: string | null;
  fullName: string | null;
  mainGoal: string | null;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  totalModules: number;
  completedModules: number;
  moduleProgressPercentage: number;
  totalTimeSpent: number;
  averageExamScore: number;
  daysSinceLastActivity: number | null;
  lastActivity: string | null;
  hasProgress: boolean;
  hasCompletions: boolean;
  unlockedModules: number;
};

type ActivityEngagementRow = {
  userId: string;
  email: string | null;
  fullName: string | null;
  mainGoal: string | null;
  points: number;
  badges: number;
  posts: number;
  missionsCompleted: number;
  accountAge: number;
  daysSinceLastLogin: number | null;
  daysSinceLastActivity: number | null;
  lastLogin: string | null;
  lastActivity: string | null;
  totalSessions: number;
  activeSessions: number;
  totalPageVisits: number;
  totalActivities: number;
  recentActivities: number;
  totalMissions: number;
  completedMissions: number;
  missionCompletionRate: number;
  totalMissionPoints: number;
  engagementScore: number;
  engagementLevel: string;
  hasRecentActivity: boolean;
  isActive: boolean;
};

type TabType = 'trainingschemas' | 'voedingsplannen' | 'academy-progress' | 'activity-engagement';

export default function DatabaseDataLedenPage() {
  const [activeTab, setActiveTab] = useState<TabType>('trainingschemas');
  const [trainingRows, setTrainingRows] = useState<TrainingSchemaRow[]>([]);
  const [nutritionRows, setNutritionRows] = useState<NutritionPlanRow[]>([]);
  const [academyRows, setAcademyRows] = useState<AcademyProgressRow[]>([]);
  const [activityRows, setActivityRows] = useState<ActivityEngagementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrainingData = async () => {
    try {
      const res = await fetch('/api/admin/database/trainingschemas', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTrainingRows(data.rows || []);
    } catch (e: any) {
      console.error('Error loading training data:', e);
    }
  };

  const loadNutritionData = async () => {
    try {
      const res = await fetch('/api/admin/database/voedingsplannen', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNutritionRows(data.rows || []);
    } catch (e: any) {
      console.error('Error loading nutrition data:', e);
    }
  };

  const loadAcademyData = async () => {
    try {
      const res = await fetch('/api/admin/database/academy-progress', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAcademyRows(data.rows || []);
    } catch (e: any) {
      console.error('Error loading academy data:', e);
    }
  };

  const loadActivityData = async () => {
    try {
      const res = await fetch('/api/admin/database/activity-engagement', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setActivityRows(data.rows || []);
    } catch (e: any) {
      console.error('Error loading activity data:', e);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        loadTrainingData(), 
        loadNutritionData(), 
        loadAcademyData(), 
        loadActivityData()
      ]);
    } catch (e: any) {
      setError(e?.message || 'Fout bij laden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getStatusColor = (isActive: boolean, hasCustomPlans: boolean) => {
    if (hasCustomPlans) return 'bg-purple-600 text-white';
    if (isActive) return 'bg-green-600 text-white';
    return 'bg-yellow-600 text-white';
  };

  const getStatusText = (isActive: boolean, hasCustomPlans: boolean) => {
    if (hasCustomPlans) return 'Custom';
    if (isActive) return 'Actief';
    return 'Inactief';
  };

  const getTrainingStatus = (completedAt: string | null, weeksCompleted: number) => {
    if (completedAt) return 'Voltooid';
    if (weeksCompleted >= 8) return 'Voltooid (auto)';
    return 'In progress';
  };

  const getTrainingStatusColor = (completedAt: string | null, weeksCompleted: number) => {
    if (completedAt || weeksCompleted >= 8) return 'bg-green-600 text-white';
    return 'bg-yellow-600 text-white';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#8BAE5A]">Database Data Leden</h1>
        <button
          onClick={load}
          className="px-3 py-2 rounded-lg bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#1F2819]"
        >
          Vernieuwen
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-[#232D1A] p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('trainingschemas')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'trainingschemas'
              ? 'bg-[#8BAE5A] text-[#181F17]'
              : 'text-[#B6C948] hover:text-[#8BAE5A]'
          }`}
        >
          Trainingschemas
        </button>
        <button
          onClick={() => setActiveTab('voedingsplannen')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'voedingsplannen'
              ? 'bg-[#8BAE5A] text-[#181F17]'
              : 'text-[#B6C948] hover:text-[#8BAE5A]'
          }`}
        >
          Voedingsplannen
        </button>
        <button
          onClick={() => setActiveTab('academy-progress')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'academy-progress'
              ? 'bg-[#8BAE5A] text-[#181F17]'
              : 'text-[#B6C948] hover:text-[#8BAE5A]'
          }`}
        >
          Academy Progress
        </button>
        <button
          onClick={() => setActiveTab('activity-engagement')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'activity-engagement'
              ? 'bg-[#8BAE5A] text-[#181F17]'
              : 'text-[#B6C948] hover:text-[#8BAE5A]'
          }`}
        >
          Activity & Engagement
        </button>
      </div>

      {loading && (
        <div className="text-[#B6C948]">Laden...</div>
      )}
      {error && (
        <div className="text-red-400">{error}</div>
      )}

      {!loading && !error && (
        <div className="overflow-auto border border-[#3A4D23] rounded-xl">
          <table className="min-w-full text-sm">
            {activeTab === 'trainingschemas' ? (
              <>
                <thead className="bg-[#232D1A] text-[#8BAE5A]">
                  <tr>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Naam</th>
                    <th className="px-4 py-3 text-left">Schema</th>
                    <th className="px-4 py-3 text-left">Nr</th>
                    <th className="px-4 py-3 text-left">Frequentie</th>
                    <th className="px-4 py-3 text-left">Dagen</th>
                    <th className="px-4 py-3 text-left">Weken</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B3820] text-[#B6C948]">
                  {trainingRows.map((r) => {
                    const status = getTrainingStatus(r.completedAt, r.weeksCompleted);
                    const statusColor = getTrainingStatusColor(r.completedAt, r.weeksCompleted);
                    
                    return (
                      <tr key={r.userId} className="hover:bg-[#1A2318]">
                        <td className="px-4 py-2">{r.email}</td>
                        <td className="px-4 py-2">{r.fullName}</td>
                        <td className="px-4 py-2">{r.selectedSchemaName || '-'}</td>
                        <td className="px-4 py-2">{r.selectedSchemaNumber ?? '-'}</td>
                        <td className="px-4 py-2">{r.trainingFrequency}</td>
                        <td className="px-4 py-2">{r.totalDaysCompleted}</td>
                        <td className="px-4 py-2">{r.weeksCompleted}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${statusColor}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            ) : activeTab === 'voedingsplannen' ? (
              <>
                <thead className="bg-[#232D1A] text-[#8BAE5A]">
                  <tr>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Naam</th>
                    <th className="px-4 py-3 text-left">Plan</th>
                    <th className="px-4 py-3 text-left">Calorieën</th>
                    <th className="px-4 py-3 text-left">Eiwit</th>
                    <th className="px-4 py-3 text-left">Koolhydraten</th>
                    <th className="px-4 py-3 text-left">Vetten</th>
                    <th className="px-4 py-3 text-left">Dagen</th>
                    <th className="px-4 py-3 text-left">Custom</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B3820] text-[#B6C948]">
                  {nutritionRows.map((r) => {
                    const status = getStatusText(r.isActive, r.hasCustomPlans);
                    const statusColor = getStatusColor(r.isActive, r.hasCustomPlans);
                    
                    return (
                      <tr key={r.userId} className="hover:bg-[#1A2318]">
                        <td className="px-4 py-2">{r.email}</td>
                        <td className="px-4 py-2">{r.fullName}</td>
                        <td className="px-4 py-2">{r.selectedPlanName || 'Geen plan geselecteerd'}</td>
                        <td className="px-4 py-2">{r.targetCalories > 0 ? r.targetCalories : '-'}</td>
                        <td className="px-4 py-2">{r.targetProtein > 0 ? `${r.targetProtein}g` : '-'}</td>
                        <td className="px-4 py-2">{r.targetCarbs > 0 ? `${r.targetCarbs}g` : '-'}</td>
                        <td className="px-4 py-2">{r.targetFat > 0 ? `${r.targetFat}g` : '-'}</td>
                        <td className="px-4 py-2">{r.daysSinceStart}</td>
                        <td className="px-4 py-2">
                          {r.hasCustomPlans ? (
                            <span className="px-2 py-1 rounded text-xs bg-purple-600 text-white">
                              {r.customPlanCount}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${statusColor}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            ) : activeTab === 'academy-progress' ? (
              <>
                <thead className="bg-[#232D1A] text-[#8BAE5A]">
                  <tr>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Naam</th>
                    <th className="px-4 py-3 text-left">Doel</th>
                    <th className="px-4 py-3 text-left">Lessen</th>
                    <th className="px-4 py-3 text-left">Modules</th>
                    <th className="px-4 py-3 text-left">Tijd</th>
                    <th className="px-4 py-3 text-left">Score</th>
                    <th className="px-4 py-3 text-left">Laatste</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B3820] text-[#B6C948]">
                  {academyRows.map((r) => {
                    const progressColor = r.completionPercentage >= 80 ? 'bg-green-600 text-white' : 
                                        r.completionPercentage >= 50 ? 'bg-yellow-600 text-white' : 
                                        r.completionPercentage > 0 ? 'bg-orange-600 text-white' : 'bg-gray-600 text-white';
                    
                    return (
                      <tr key={r.userId} className="hover:bg-[#1A2318]">
                        <td className="px-4 py-2">{r.email}</td>
                        <td className="px-4 py-2">{r.fullName}</td>
                        <td className="px-4 py-2">{r.mainGoal || '-'}</td>
                        <td className="px-4 py-2">{r.completedLessons}/{r.totalLessons}</td>
                        <td className="px-4 py-2">{r.completedModules}/{r.totalModules}</td>
                        <td className="px-4 py-2">{r.totalTimeSpent > 0 ? `${r.totalTimeSpent}m` : '-'}</td>
                        <td className="px-4 py-2">{r.averageExamScore > 0 ? r.averageExamScore : '-'}</td>
                        <td className="px-4 py-2">{r.daysSinceLastActivity !== null ? `${r.daysSinceLastActivity}d` : '-'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${progressColor}`}>
                            {r.completionPercentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            ) : (
              <>
                <thead className="bg-[#232D1A] text-[#8BAE5A]">
                  <tr>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Naam</th>
                    <th className="px-4 py-3 text-left">Doel</th>
                    <th className="px-4 py-3 text-left">Punten</th>
                    <th className="px-4 py-3 text-left">Badges</th>
                    <th className="px-4 py-3 text-left">Posts</th>
                    <th className="px-4 py-3 text-left">Sessies</th>
                    <th className="px-4 py-3 text-left">Laatste</th>
                    <th className="px-4 py-3 text-left">Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B3820] text-[#B6C948]">
                  {activityRows.map((r) => {
                    const engagementColor = r.engagementLevel === 'High' ? 'bg-green-600 text-white' : 
                                          r.engagementLevel === 'Medium' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white';
                    
                    return (
                      <tr key={r.userId} className="hover:bg-[#1A2318]">
                        <td className="px-4 py-2">{r.email}</td>
                        <td className="px-4 py-2">{r.fullName}</td>
                        <td className="px-4 py-2">{r.mainGoal || '-'}</td>
                        <td className="px-4 py-2">{r.points}</td>
                        <td className="px-4 py-2">{r.badges}</td>
                        <td className="px-4 py-2">{r.posts}</td>
                        <td className="px-4 py-2">{r.totalSessions}</td>
                        <td className="px-4 py-2">{r.daysSinceLastActivity !== null ? `${r.daysSinceLastActivity}d` : '-'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${engagementColor}`}>
                            {r.engagementLevel} ({r.engagementScore})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            )}
          </table>
        </div>
      )}

      {!loading && !error && (
        <div className="text-center py-8 text-[#B6C948]">
          {activeTab === 'trainingschemas' 
            ? (trainingRows.length === 0 ? 'Geen trainingschema data gevonden.' : `${trainingRows.length} gebruikers gevonden.`)
            : activeTab === 'voedingsplannen'
            ? (nutritionRows.length === 0 ? 'Geen voedingsplan data gevonden.' : `${nutritionRows.length} gebruikers gevonden.`)
            : activeTab === 'academy-progress'
            ? (academyRows.length === 0 ? 'Geen academy progress data gevonden.' : `${academyRows.length} gebruikers gevonden.`)
            : (activityRows.length === 0 ? 'Geen activity data gevonden.' : `${activityRows.length} gebruikers gevonden.`)
          }
        </div>
      )}
    </div>
  );
}
