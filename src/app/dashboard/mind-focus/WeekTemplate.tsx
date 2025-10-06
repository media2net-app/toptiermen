'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  FireIcon,
  HeartIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import type { WeekConfig as BaseWeekConfig } from './weeks.config';

type WeekConfig = BaseWeekConfig & {
  milestone?: 2 | 4 | 6;
  badgeTitle?: string;
  tasks?: {
    low?: Partial<DailyTask>[];
    medium?: Partial<DailyTask>[];
    high?: Partial<DailyTask>[];
  };
};

interface DailyTask {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  category: 'morning' | 'afternoon' | 'evening';
  type: 'focus' | 'breathing' | 'assessment';
}

export default function WeekTemplate({ config }: { config: WeekConfig }) {
  const { user } = useSupabaseAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'progress'>('overview');
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [userIntensity, setUserIntensity] = useState(3);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isWeekCompleted, setIsWeekCompleted] = useState(false);

  const defaultBaseTasks: DailyTask[] = useMemo(
    () => [
      {
        id: 'morning-focus',
        title: 'Ochtend Focus Sessie',
        description: '5–10 minuten focus training',
        duration: 8,
        completed: false,
        category: 'morning',
        type: 'focus',
      },
      {
        id: 'breathing-exercise',
        title: 'Ademhalingsoefening',
        description: '5 minuten ademhaling voor stress reductie',
        duration: 5,
        completed: false,
        category: 'afternoon',
        type: 'breathing',
      },
      {
        id: 'evening-reflection',
        title: 'Avond Reflectie',
        description: 'Korte reflectie en assessment',
        duration: 3,
        completed: false,
        category: 'evening',
        type: 'assessment',
      },
    ],
    []
  );

  const applyOverrides = (base: DailyTask[], overrides?: Partial<DailyTask>[]) => {
    if (!overrides || overrides.length === 0) return base;
    // Map by id to merge, if id matches; otherwise push new custom tasks
    const byId = new Map(base.map((t) => [t.id, { ...t }]));
    overrides.forEach((ov, idx) => {
      if (ov.id && byId.has(ov.id)) {
        byId.set(ov.id, { ...byId.get(ov.id)!, ...ov });
      } else {
        const id = ov.id || `custom-${idx}`;
        byId.set(id, {
          id,
          title: ov.title || 'Custom taak',
          description: ov.description || '',
          duration: ov.duration ?? 5,
          completed: false,
          category: ov.category || 'morning',
          type: ov.type || 'focus',
        });
      }
    });
    return Array.from(byId.values());
  };

  const generateTasksForIntensity = (intensity: number): DailyTask[] => {
    let tasks = [...defaultBaseTasks];
    // Default shaping by intensity
    if (intensity <= 2) {
      tasks = tasks.filter((t) => t.type !== 'breathing');
    } else if (intensity >= 5) {
      tasks = [
        ...tasks,
        {
          id: 'midday-reset',
          title: 'Middag Reset',
          description: '3 minuten micro-pauze met ademhaling',
          duration: 3,
          completed: false,
          category: 'afternoon',
          type: 'breathing',
        },
      ];
    }
    // Apply per-week overrides if present
    const ov = config.tasks;
    if (ov) {
      if (intensity <= 2 && ov.low) return applyOverrides(tasks, ov.low);
      if (intensity >= 5 && ov.high) return applyOverrides(tasks, ov.high);
      if (ov.medium) return applyOverrides(tasks, ov.medium);
    }
    return tasks;
  };

  const completedToday = dailyTasks.filter((t) => t.completed).length;
  const totalToday = dailyTasks.length || 1;
  const progressPercentage = (completedToday / totalToday) * 100;

  const toggleTask = (taskId: string) => {
    if (isWeekCompleted) return;
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'focus':
        return <CpuChipIcon className="w-5 h-5 text-blue-500" />;
      case 'breathing':
        return <HeartIcon className="w-5 h-5 text-green-500" />;
      case 'assessment':
        return <ChartBarIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'morning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'afternoon':
        return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      case 'evening':
        return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!user) return;
      try {
        const [progressResponse, intakeResponse] = await Promise.all([
          fetch(`/api/mind-focus/user-progress?userId=${user.id}`),
          fetch(`/api/mind-focus/intake?userId=${user.id}`),
        ]);
        const [progressData, intakeData] = await Promise.all([
          progressResponse.json(),
          intakeResponse.json(),
        ]);

        // Intensity
        const intensity =
          (intakeData.success &&
            intakeData.profile?.lifestyle_info?.mindFocusIntensity) || 3;
        setUserIntensity(intensity);
        setDailyTasks(generateTasksForIntensity(intensity));

        // Completion
        if (progressData.success && progressData.progress) {
          const { completed_weeks } = progressData.progress;
          const isDone = completed_weeks && completed_weeks.includes(config.week);
          setIsWeekCompleted(Boolean(isDone));
        }
      } catch (e) {
        setDailyTasks(generateTasksForIntensity(3));
      } finally {
        setIsLoadingStatus(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, config.week]);

  const handleCompleteWeek = async () => {
    if (!user) return;
    setIsUpdatingProgress(true);
    try {
      const res = await fetch('/api/mind-focus/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          completedWeek: config.week,
          currentActiveWeek: Math.min(config.week + 1, 24),
        }),
      });
      const result = await res.json();
      if (result.success) {
        router.push('/dashboard/mind-focus');
      }
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#8BAE5A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Week laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-[#3A4D23]/40 rounded-lg transition-colors">
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Week {config.week} - {config.title}</h1>
            {config.subtitle && <p className="text-[#8BAE5A] mt-1">{config.subtitle}</p>}
          </div>
        </div>

        {/* Progress Banner */}
        <div className={`rounded-xl p-6 mb-6 border ${
          isWeekCompleted ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30' : 'bg-gradient-to-r from-[#8BAE5A]/20 to-[#FFD700]/20 border-[#8BAE5A]/30'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{isWeekCompleted ? `Week ${config.week} Voltooid` : 'Vandaag\'s Voortgang'}</h2>
              <p className="text-[#8BAE5A] text-sm">{isWeekCompleted ? 'Alle taken van deze week zijn voltooid' : 'Voltooi je dagelijkse taken om je streak te behouden'}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{completedToday}/{totalToday}</div>
              <div className="text-sm text-[#8BAE5A]">Taken voltooid</div>
            </div>
          </div>
          {isWeekCompleted && config.milestone && (
            <div className="mt-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-yellow-300">
              🎖️ Mijlpaal bereikt: {config.badgeTitle || `Maand ${config.milestone}`} — Badge komt beschikbaar in je profiel.
            </div>
          )}
          <div className="w-full bg-[#3A4D23] rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${isWeekCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700]'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-[#232D1A] rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overzicht' },
            { id: 'tasks', label: 'Dagelijkse Taken' },
            { id: 'progress', label: 'Voortgang' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id ? 'bg-[#8BAE5A] text-[#1A2A1A] font-semibold' : 'text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23]/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
              <h3 className="text-xl font-bold text-white mb-4">Doelen</h3>
              <ul className="list-disc pl-5 space-y-1 text-[#8BAE5A]">
                {config.goals.map((goal, idx) => (
                  <li key={idx}>{goal}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {(['morning', 'afternoon', 'evening'] as const).map((category) => {
              const categoryTasks = dailyTasks.filter((t) => t.category === category);
              const completedCategory = categoryTasks.filter((t) => t.completed).length;
              return (
                <div key={category} className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white capitalize">
                      {category === 'morning' ? 'Ochtend' : category === 'afternoon' ? 'Middag' : 'Avond'} Taken
                    </h3>
                    <span className="text-sm text-[#8BAE5A]">{completedCategory}/{categoryTasks.length} voltooid</span>
                  </div>
                  <div className="space-y-3">
                    {categoryTasks.map((task) => (
                      <div key={task.id} className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        task.completed ? 'bg-[#8BAE5A]/10 border-[#8BAE5A]/30' : 'bg-[#1A2A1A] border-[#3A4D23]/40 hover:border-[#8BAE5A]/50'
                      }`}>
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            task.completed ? 'bg-[#8BAE5A] border-[#8BAE5A]' : 'border-[#3A4D23] hover:border-[#8BAE5A] hover:bg-[#8BAE5A]/20'
                          }`}
                        >
                          {task.completed && <CheckCircleIcon className="w-5 h-5 text-[#1A2A1A]" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getTaskIcon(task.type)}
                            <h4 className={`font-semibold ${task.completed ? 'text-[#8BAE5A]' : 'text-white'}`}>{task.title}</h4>
                          </div>
                          <p className="text-[#8BAE5A] text-sm mb-2">{task.description}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[#8BAE5A] text-sm">
                              <ClockIcon className="w-4 h-4" />
                              {task.duration} minuten
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(task.category)}`}>
                              {category === 'morning' ? 'Ochtend' : category === 'afternoon' ? 'Middag' : 'Avond'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
                <FireIcon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</div>
                <div className="text-[#8BAE5A] text-sm">Dagelijkse voortgang</div>
              </div>
              <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{completedToday}</div>
                <div className="text-[#8BAE5A] text-sm">Taken voltooid vandaag</div>
              </div>
              <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
                <ChartBarIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Week {config.week}</div>
                <div className="text-[#8BAE5A] text-sm">Actieve week</div>
              </div>
            </div>
          </div>
        )}

        {/* Complete Week CTA */}
        <div className="mt-8">
          <button
            onClick={handleCompleteWeek}
            disabled={isUpdatingProgress || isWeekCompleted}
            className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold transition-colors ${
              isWeekCompleted
                ? 'bg-[#3A4D23] text-[#8BAE5A]/60 cursor-not-allowed'
                : 'bg-[#8BAE5A] text-[#1A2A1A] hover:bg-[#A6C97B]'
            }`}
          >
            {isWeekCompleted ? 'Voltooid' : isUpdatingProgress ? 'Opslaan...' : 'Markeer Week als Voltooid'}
          </button>
        </div>
      </div>
    </div>
  );
}
