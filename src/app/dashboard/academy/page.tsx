"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AcademyPage() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressData, setProgressData] = useState<ProgressData>({});
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>({});
  const [unlocks, setUnlocks] = useState<UnlockData>({});
  const [loading, setLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeData, setBadgeData] = useState<any>(null);
  const [academyCompleted, setAcademyCompleted] = useState(false);
  const [hasAcademyBadge, setHasAcademyBadge] = useState(false);
  const [academyBadgeData, setAcademyBadgeData] = useState<any>(null);
  const [navigating, setNavigating] = useState(false);

  // Reset navigating state when navigation completes
  useEffect(() => {
    setNavigating(false);
  }, []);

  // Fetch academy data with performance optimizations
  useEffect(() => {
    const fetchAcademyData = async () => {
      if (!user) {
        console.log('🎓 Academy: No user, skipping data fetch...');
        return;
      }

      // Always fetch fresh data to ensure we have the latest progress
      console.log('🎓 Academy: Starting fresh data fetch for user:', user.id);

      console.log('🎓 Academy: Starting data fetch...');
      setLoading(true);
      setError(null);

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Academy data fetch timeout, showing error...');
        setError('Data laden duurde te lang. Probeer de pagina te verversen.');
        setLoading(false);
      }, 10000); // 10 second timeout

      try {
        // Fetch academy data via API endpoint (bypasses RLS)
        const response = await fetch(`/api/academy/progress?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch academy data');
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch academy data');
        }

        const {
          modules: processedModules,
          lessons: processedLessons,
          progressData: progressMap,
          lessonProgress: lessonProgressMap,
          unlocks: unlocksMap,
          academyCompleted: isAcademyCompleted,
          academyBadge: academyBadgeData,
          badgeAwarded,
          stats
        } = result.data;

        console.log('🎯 Academy Data Fetch Debug:', {
          modules: processedModules?.length || 0,
          lessons: processedLessons?.length || 0,
          progressData: Object.keys(progressMap || {}).length,
          lessonProgress: Object.keys(lessonProgressMap || {}).length,
          stats: stats
        });

        // Debug logging before setting state
        console.log('🎯 Setting Academy State:', {
          processedModules: processedModules?.length || 0,
          processedLessons: processedLessons?.length || 0,
          progressMapKeys: Object.keys(progressMap || {}).length,
          lessonProgressMapKeys: Object.keys(lessonProgressMap || {}).length,
          completedLessons: Object.values(lessonProgressMap || {}).filter((p: any) => p.completed).length,
          isAcademyCompleted,
          hasAcademyBadge: !!academyBadgeData,
          stats: stats
        });

        // Set state
        setModules(processedModules || []);
        setLessons(processedLessons || []);
        setProgressData(progressMap || {});
        setLessonProgress(lessonProgressMap || {});
        setUnlocks(unlocksMap || {});
        setAcademyCompleted(isAcademyCompleted);
        setHasAcademyBadge(!!academyBadgeData);
        setAcademyBadgeData(academyBadgeData);
        setIsDataLoaded(true);
        setLoading(false);

        // Debug logging for Chiel
        if (user?.email === 'chiel@media2net.nl') {
          console.log('🔍 Academy Data Debug for Chiel:', {
            modulesCount: processedModules?.length || 0,
            lessonsCount: processedLessons?.length || 0,
            unlocksData: unlocksMap,
            unlocksKeys: Object.keys(unlocksMap || {}),
            academyCompleted: isAcademyCompleted
          });
        }

        // Show badge modal if badge was just awarded
        if (badgeAwarded && academyBadgeData) {
          setBadgeData(academyBadgeData);
          setShowBadgeModal(true);
        }

        // Clear timeout
        clearTimeout(timeoutId);

        console.log('✅ Academy data loaded successfully:', {
          modules: processedModules?.length || 0,
          lessons: processedLessons?.length || 0,
          progress: Object.keys(progressMap || {}).length,
          lessonProgress: Object.keys(lessonProgressMap || {}).length,
          unlocks: Object.keys(unlocksMap || {}).length,
          academyCompleted: isAcademyCompleted,
          hasAcademyBadge: !!academyBadgeData,
          stats: stats
        });

        // Debug: Check state immediately after setting
        setTimeout(() => {
          console.log('🔍 State Check After Setting:', {
            lessonProgressStateKeys: Object.keys(lessonProgressMap || {}).length,
            lessonProgressStateValues: Object.values(lessonProgressMap || {}).filter((p: any) => p.completed).length,
            lessonProgressMapRaw: lessonProgressMap
          });
        }, 100);

      } catch (error) {
        console.error('❌ Academy data fetch error:', error);
        setError(error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden');
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    fetchAcademyData();
  }, [user?.id]);

  // Calculate totals
  const totalLessons = lessons.length;
  const totalCompleted = Object.values(lessonProgress).filter(p => p.completed).length;
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  // Debug logging (simplified)
  console.log('🎯 Academy Progress Debug:', {
    totalLessons,
    totalCompleted,
    overallProgress,
    lessonProgressKeys: Object.keys(lessonProgress).length
  });

  // Get module number based on order_index
  const getModuleNumber = (orderIndex: number) => {
    return orderIndex.toString().padStart(2, '0');
  };

  // Render loading state
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

  // Render error state
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#8BAE5A]">Algemene Voortgang</h2>
          <div className="flex items-center gap-3">
          <span className="text-[#8BAE5A] font-bold">{overallProgress}%</span>
            <button
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
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

      {/* Academy Completion Badge */}
      {academyCompleted && !hasAcademyBadge && (
        <div className="mb-8 p-6 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-xl border border-[#3A4D23]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TrophyIcon className="w-12 h-12 text-[#181F17]" />
              <div>
                <h3 className="text-xl font-bold text-[#181F17]">Academy Voltooid!</h3>
                <p className="text-[#181F17]/80">Gefeliciteerd! Je hebt alle lessen afgerond.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setBadgeData({
                  type: 'academy_completion',
                  title: 'Academy Master',
                  description: 'Je hebt alle academy lessen voltooid!',
                  icon: 'TrophyIcon'
                });
                setShowBadgeModal(true);
              }}
              className="px-6 py-3 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#232D1A] transition-colors font-semibold"
            >
              Badge Bekijken
            </button>
          </div>
        </div>
      )}

      {/* Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {modules.map((module) => {
          const moduleLessons = lessons.filter(lesson => lesson.module_id === module.id);
          const completedLessons = moduleLessons.filter(lesson => 
            lessonProgress[lesson.id]?.completed
          ).length;
          const progress = moduleLessons.length > 0 ? 
            Math.round((completedLessons / moduleLessons.length) * 100) : 0;
          const isUnlocked = unlocks[module.id]?.unlocked_at || module.order_index === 1;
          const isCompleted = progress === 100;

          // Debug logging for Chiel
          if (user?.email === 'chiel@media2net.nl') {
            console.log(`🔍 Module ${module.title}:`, {
              moduleId: module.id,
              orderIndex: module.order_index,
              isUnlocked,
              unlockData: unlocks[module.id],
              progress,
              completedLessons,
              totalLessons: moduleLessons.length
            });
          }

          return (
            <button
              key={module.id}
              onClick={() => {
                if (isUnlocked) {
                  console.log('🔄 Navigating to module...');
                  setNavigating(true);
                  router.push(`/dashboard/academy/${module.id}`);
                }
              }}
              disabled={!isUnlocked || navigating}
              className={`w-full p-6 rounded-xl border transition-all duration-200 hover:scale-105 relative overflow-hidden text-left ${
                isCompleted
                  ? 'border-[#3A4D23] hover:bg-[#232D1A]/95'
                  : isUnlocked
                  ? 'border-[#3A4D23] hover:bg-[#181F17]/95'
                  : 'border-[#3A4D23] opacity-60 cursor-not-allowed'
              } ${navigating ? 'opacity-50' : ''}`}
              style={{
                backgroundImage: 'url(/wallpaper-academy.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Dark overlay for readability */}
              <div className={`absolute inset-0 ${
                isCompleted
                  ? 'bg-[#232D1A]/90'
                  : isUnlocked
                  ? 'bg-[#181F17]/90'
                  : 'bg-[#181F17]/90'
              }`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#8BAE5A] rounded-lg flex items-center justify-center">
                      <span className="text-[#181F17] font-bold text-lg">
                        {getModuleNumber(module.order_index)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{module.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{module.short_description || module.description}</p>
                    </div>
                  </div>
                  
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A] flex-shrink-0" />
                  ) : !isUnlocked ? (
                    <LockClosedIcon className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  ) : (
                    <PlayIcon className="w-6 h-6 text-[#8BAE5A] flex-shrink-0" />
                  )}
                </div>

                <p className="text-gray-300 mb-4 line-clamp-2">{module.description}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Voortgang</span>
                    <span className="text-sm text-[#8BAE5A] font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-[#232D1A] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Info (formerly button) */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>{moduleLessons.length} lessen</span>
                  </div>
                  
                  {isUnlocked ? (
                    <div className="flex items-center gap-2 text-sm text-[#8BAE5A] font-semibold">
                      {isCompleted ? 'Bekijk Module' : 'Start Module'}
                      {navigating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
                      ) : (
                        <ArrowRightIcon className="w-4 h-4" />
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Module vergrendeld</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Badge Unlock Modal */}
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