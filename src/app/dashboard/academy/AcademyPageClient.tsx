"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  LockClosedIcon, 
  CheckCircleIcon, 
  PlayIcon, 
  BookOpenIcon,
  ClockIcon,
  TrophyIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import PageLayout from '@/components/PageLayout';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from "@/lib/supabase";
import BadgeUnlockModal from '@/components/BadgeUnlockModal';

interface Module {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  cover_image?: string;
  slug: string;
  order_index: number;
  status: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  type?: string;
  module_id: string;
}

interface ProgressData {
  [moduleId: string]: {
    completed: boolean;
    progress_percentage: number;
    completed_lessons: number;
    total_lessons: number;
  };
}

interface UnlockData {
  [moduleId: string]: {
    unlocked_at?: string;
    opened_at?: string;
  };
}

interface LessonProgress {
  [lessonId: string]: {
    completed: boolean;
    time_spent?: number;
  };
}

export default function AcademyPageClient() {
  const { user } = useSupabaseAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressData, setProgressData] = useState<ProgressData>({});
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>({});
  const [unlocks, setUnlocks] = useState<UnlockData>({});
  const [loading, setLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeData, setBadgeData] = useState<any>(null);
  const [academyCompleted, setAcademyCompleted] = useState(false);
  const [hasAcademyBadge, setHasAcademyBadge] = useState(false);
  const [academyBadgeData, setAcademyBadgeData] = useState<any>(null);

  // Handle page visibility changes to reset loading states when returning from PDF ebooks
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (loading && !error) {
          setLoading(false);
          setError(null);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        if (loading && !error) {
          setLoading(false);
          setError(null);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pageshow', handlePageShow);
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pageshow', handlePageShow);
      }
    };
  }, [loading, error]);

  // Fetch academy data
  useEffect(() => {
    const fetchAcademyData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      const timeoutId = setTimeout(() => {
        setError('Data laden duurde te lang. Probeer de pagina te verversen.');
        setLoading(false);
      }, 30000);

      try {
        const response = await fetch(`/api/academy/progress?userId=${user.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache'
        });
        if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to fetch academy data');

        const {
          modules: processedModules,
          lessons: processedLessons,
          progressData: progressMap,
          lessonProgress: lessonProgressMap,
          unlocks: unlocksMap,
          academyCompleted: isAcademyCompleted,
          academyBadge: academyBadge,
          badgeAwarded,
        } = result.data;

        setModules(processedModules || []);
        setLessons(processedLessons || []);
        setProgressData(progressMap || {});
        setLessonProgress(lessonProgressMap || {});
        setUnlocks(unlocksMap || {});
        setAcademyCompleted(isAcademyCompleted);
        setHasAcademyBadge(!!academyBadge);
        setAcademyBadgeData(academyBadge);
        setIsDataLoaded(true);
        setLoading(false);

        if (badgeAwarded && academyBadge) {
          setBadgeData(academyBadge);
          setShowBadgeModal(true);
        }
        clearTimeout(timeoutId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden';
        setError(errorMessage);
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    fetchAcademyData();
  }, [user?.id]);

  // Totals
  const totalLessons = lessons.length;
  const totalCompleted = Object.values(lessonProgress).filter(p => p.completed).length;
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  // Group lessons by module
  const lessonsByModule = useMemo(() => {
    const map: Record<string, Lesson[]> = {};
    for (const l of lessons) {
      (map[l.module_id] ||= []).push(l);
    }
    return map;
  }, [lessons]);

  const getModuleProgress = (moduleId: string) => {
    const list = lessonsByModule[moduleId] || [];
    if (list.length === 0) return { count: 0, completed: 0, percent: 0 };
    let completed = 0;
    for (const l of list) {
      if (lessonProgress[l.id]?.completed) completed++;
    }
    const percent = Math.round((completed / list.length) * 100);
    return { count: list.length, completed, percent };
  };

  // Format module number (e.g., 1 -> "01")
  const getModuleNumber = (orderIndex: number) => {
    return orderIndex?.toString().padStart(2, '0');
  };

  if (loading) {
    return (
      <PageLayout title="Academy" subtitle="Laden...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-gray-300">Academy laden...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Academy" subtitle="Fout opgetreden">
        <div className="text-center py-12">
          <div className="text-red-400 mb-4 text-lg font-semibold">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
          >
            Opnieuw proberen
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Academy" subtitle="Leer en groei met onze uitgebreide cursussen">
      {/* Overall Progress */}
      <div className="mb-8 p-6 bg-[#181F17]/90 rounded-xl border border-[#3A4D23]">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-semibold text-[#8BAE5A]">Algemene Voortgang</h2>
          <div className="flex items-center gap-3">
            <span className="text-[#8BAE5A] font-bold">{overallProgress}%</span>
            <button
              onClick={() => {
                setIsDataLoaded(false);
                setLoading(true);
              }}
              className="px-3 py-1 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors text-sm"
              title="Ververs data"
            >
              🔄
            </button>
          </div>
        </div>
        <div className="w-full bg-[#232D1A] rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-3 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          {totalCompleted} van {totalLessons} lessen voltooid
        </p>
      </div>

      {/* Modules - Mobile compact list */}
      <div className="sm:hidden space-y-3">
        {modules.map((module) => {
          const { count, percent } = getModuleProgress(module.id);
          const isUnlocked = unlocks[module.id]?.unlocked_at || module.order_index === 1;
          const isCompleted = percent === 100;
          const intro = (module.short_description || module.description || '').split(/\n|\.|\!|\?/)[0] || '';

          return (
            isUnlocked ? (
              <Link
                key={module.id}
                href={`/dashboard/academy/${module.id}`}
                prefetch
                className={`block w-full p-4 rounded-xl border border-[#3A4D23] bg-[#181F17] text-left overflow-hidden`}
              >
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 bg-[#8BAE5A] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-[#181F17] font-bold text-xs">{getModuleNumber(module.order_index)}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold text-sm truncate break-words">{module.title}</div>
                      <div className="text-[11px] text-gray-300 line-clamp-2 break-words">{intro}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1"><ClockIcon className="w-3 h-3" />{count}</div>
                    {isCompleted ? (
                      <CheckCircleIcon className="w-4 h-4 text-[#8BAE5A]" />
                    ) : (
                      <PlayIcon className="w-4 h-4 text-[#8BAE5A]" />
                    )}
                  </div>
                </div>
                <div className="mt-2 w-full bg-[#232D1A] rounded-full h-1">
                  <div className="h-1 rounded-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] transition-all duration-300" style={{ width: `${percent}%` }}></div>
                </div>
              </Link>
            ) : (
              <div
                key={module.id}
                className={`w-full p-4 rounded-xl border border-[#3A4D23] bg-[#181F17] text-left overflow-hidden opacity-60 cursor-not-allowed`}
              >
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 bg-[#8BAE5A] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-[#181F17] font-bold text-xs">{getModuleNumber(module.order_index)}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold text-sm truncate break-words">{module.title}</div>
                      <div className="text-[11px] text-gray-300 line-clamp-2 break-words">{intro}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1"><ClockIcon className="w-3 h-3" />{count}</div>
                    <LockClosedIcon className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
                <div className="mt-2 w-full bg-[#232D1A] rounded-full h-1">
                  <div className="h-1 rounded-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] transition-all duration-300" style={{ width: `${percent}%` }}></div>
                </div>
              </div>
            )
          );
        })}
      </div>

      {/* Modules - Desktop grid */}
      <div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {modules.map((module) => {
          const { count, percent } = getModuleProgress(module.id);
          const isUnlocked = unlocks[module.id]?.unlocked_at || module.order_index === 1;
          const isCompleted = percent === 100;

          return (
            isUnlocked ? (
              <Link
                key={module.id}
                href={`/dashboard/academy/${module.id}`}
                prefetch
                className={`w-full max-w-full sm:max-w-none mx-auto sm:mx-0 p-6 rounded-xl border transition-all duration-200 sm:hover:scale-105 relative overflow-hidden text-left ${
                  isCompleted
                    ? 'border-[#3A4D23] hover:bg-[#232D1A]/95'
                    : 'border-[#3A4D23] hover:bg-[#181F17]/95'
                }`}
                style={{
                  backgroundImage: 'url(/wallpaper-academy.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className={`absolute inset-0 ${
                  isCompleted ? 'bg-[#232D1A]/90' : 'bg-[#181F17]/90'
                }`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#8BAE5A] rounded-lg flex items-center justify-center">
                        <span className="text-[#181F17] font-bold text-xs sm:text-sm">
                          {getModuleNumber(module.order_index)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-white mb-0 sm:mb-1 truncate">{module.title}</h3>
                      </div>
                    </div>
                    {isCompleted ? (
                      <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#8BAE5A] flex-shrink-0" />
                    ) : (
                      <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#8BAE5A] flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-gray-300 mb-2 text-xs sm:text-sm line-clamp-2">{module.description}</p>

                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs sm:text-sm text-gray-400">Voortgang</span>
                      <span className="text-xs sm:text-sm text-[#8BAE5A] font-semibold">{percent}%</span>
                    </div>
                    <div className="w-full bg-[#232D1A] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <ClockIcon className="w-3 h-3" />
                      <span>{count} lessen</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-[#8BAE5A] font-semibold">
                      <span className="hidden sm:inline">{isCompleted ? 'Bekijk Module' : 'Start Module'}</span>
                      <span className="sm:hidden">{isCompleted ? 'Bekijk' : 'Start'}</span>
                      <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div
                key={module.id}
                className={`w-full max-w-full sm:max-w-none mx-auto sm:mx-0 p-6 rounded-xl border transition-all duration-200 relative overflow-hidden text-left border-[#3A4D23] opacity-60 cursor-not-allowed`}
                style={{
                  backgroundImage: 'url(/wallpaper-academy.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="absolute inset-0 bg-[#181F17]/90"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#8BAE5A] rounded-lg flex items-center justify-center">
                        <span className="text-[#181F17] font-bold text-xs sm:text-sm">
                          {getModuleNumber(module.order_index)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-white mb-0 sm:mb-1 truncate">{module.title}</h3>
                      </div>
                    </div>
                    <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  </div>
                  <p className="text-gray-300 mb-2 text-xs sm:text-sm line-clamp-2">{module.description}</p>
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs sm:text-sm text-gray-400">Voortgang</span>
                      <span className="text-xs sm:text-sm text-[#8BAE5A] font-semibold">{percent}%</span>
                    </div>
                    <div className="w-full bg-[#232D1A] rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-2 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <ClockIcon className="w-3 h-3" />
                      <span>{count} lessen</span>
                    </div>
                    <span className="text-gray-500 text-sm">Module vergrendeld</span>
                  </div>
                </div>
              </div>
            )
          );
        })}
      </div>

      {showBadgeModal && badgeData && (
        <BadgeUnlockModal
          isOpen={showBadgeModal}
          badge={badgeData}
          hasUnlockedBadge={true}
          onClose={() => {
            setShowBadgeModal(false);
            setBadgeData(null);
          }}
        />
      )}
    </PageLayout>
  );
}
