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
  module_id: string;
  order_index: number;
  status: string;
  duration?: string;
  type?: string;
}

interface ProgressData {
  [moduleId: string]: number;
}

interface UnlockData {
  [moduleId: string]: {
    unlocked_at: string;
    opened_at?: string;
  };
}

interface LessonProgress {
  [lessonId: string]: {
    completed: boolean;
    completed_at?: string;
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

      // Prevent refetching if data is already loaded
      if (isDataLoaded) {
        console.log('🎓 Academy: Data already loaded, skipping fetch...');
        return;
      }

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
        // PARALLEL DATA FETCHING for better performance
        console.log('🚀 Starting parallel data fetch...');
        
        const [modulesResult, lessonsResult, progressResult, unlockResult] = await Promise.all([
          supabase
            .from('academy_modules')
            .select('*')
            .eq('status', 'published')
            .order('order_index'),
          
          supabase
            .from('academy_lessons')
            .select('*')
            .eq('status', 'published')
            .order('order_index'),
          
          supabase
            .from('user_lesson_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id)
            .eq('completed', true),
          
          supabase
            .from('user_module_unlocks')
            .select('module_id, unlocked_at, opened_at')
            .eq('user_id', user.id)
        ]);

        // Check for errors
        if (modulesResult.error || !modulesResult.data) {
          console.error('❌ Modules error:', modulesResult.error);
          setError('Modules niet gevonden');
          setLoading(false);
          return;
        }

        if (lessonsResult.error || !lessonsResult.data) {
          console.error('❌ Lessons error:', lessonsResult.error);
          setError('Lessen niet gevonden');
          setLoading(false);
          return;
        }

        const modulesData = modulesResult.data;
        const lessonsData = lessonsResult.data;
        const progressData = progressResult.data;
        const unlockData = unlockResult.data;

        // OPTIMIZED DATA PROCESSING for better performance
        console.log('⚡ Processing data...');
        
        // Create lookup maps for O(1) access
        const lessonProgressSet = new Set(progressData?.map(p => p.lesson_id) || []);
        const unlockMap: UnlockData = {};
        const progressMap: ProgressData = {};
        const lessonProgressMap: LessonProgress = {};

        // Process unlocks (O(n))
        unlockData?.forEach(unlock => {
          unlockMap[unlock.module_id] = {
            unlocked_at: unlock.unlocked_at,
            opened_at: unlock.opened_at
          };
        });

        // Process lesson progress (O(n))
        progressData?.forEach(progress => {
          lessonProgressMap[progress.lesson_id] = {
            completed: progress.completed,
            completed_at: progress.completed
          };
        });

        // Calculate module progress efficiently (O(n))
        modulesData.forEach(module => {
          const moduleLessons = lessonsData.filter(l => l.module_id === module.id);
          const completedCount = moduleLessons.filter(lesson => lessonProgressSet.has(lesson.id)).length;
          
          progressMap[module.id] = moduleLessons.length > 0 ? 
            Math.round((completedCount / moduleLessons.length) * 100) : 0;
        });

        // Clear timeout since data loaded successfully
        clearTimeout(timeoutId);

        // Update state
        setModules(modulesData);
        setLessons(lessonsData);
        setProgressData(progressMap);
        setLessonProgress(lessonProgressMap);
        setUnlocks(unlockMap);
        setIsDataLoaded(true);

        console.log('✅ Academy data loaded successfully:', {
          modulesCount: modulesData.length,
          lessonsCount: lessonsData.length,
          progressCount: progressData?.length || 0
        });

      } catch (error) {
        console.error('❌ Academy fetch error:', error);
        clearTimeout(timeoutId);
        setError('Er is een fout opgetreden bij het laden van de Academy');
      } finally {
        setLoading(false);
      }
    };

    fetchAcademyData();
  }, [user, isDataLoaded]);

  // Check for badge unlock on mount
  useEffect(() => {
    if (user && !loading) {
      const badgeData = localStorage.getItem('academyBadgeUnlock');
      if (badgeData) {
        try {
          const badge = JSON.parse(badgeData);
          setBadgeData(badge);
          setShowBadgeModal(true);
          localStorage.removeItem('academyBadgeUnlock');
        } catch (error) {
          console.error('Error parsing badge data:', error);
        }
      }
    }
  }, [user, loading]);

  // Calculate total progress
  const totalLessons = lessons.length;
  const totalCompleted = Object.values(lessonProgress).filter(p => p.completed).length;
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

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
          <span className="text-[#8BAE5A] font-bold">{overallProgress}%</span>
        </div>
        <div className="w-full bg-[#232D1A] rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-3 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        <div className="mt-2 text-sm text-gray-400">
          {totalCompleted} van {totalLessons} lessen voltooid
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {modules.map((module) => {
          const moduleLessons = lessons.filter(l => l.module_id === module.id);
          const completedLessons = moduleLessons.filter(l => 
            lessonProgress[l.id]?.completed
          ).length;
          const progress = moduleLessons.length > 0 ? 
            Math.round((completedLessons / moduleLessons.length) * 100) : 0;
          const isUnlocked = unlocks[module.id]?.unlocked_at;
          const isCompleted = progress === 100;

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
                  <span className="w-10 h-10 rounded-full border-2 border-[#8BAE5A] flex items-center justify-center text-sm font-bold text-[#8BAE5A]">
                    {getModuleNumber(module.order_index)}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{module.title}</h3>
                    <p className="text-gray-400 text-sm">{module.short_description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  )}
                  {!isUnlocked && (
                    <LockClosedIcon className="w-6 h-6 text-gray-500" />
                  )}
                </div>
              </div>

              <p className="text-gray-300 mb-4 line-clamp-2">{module.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#8BAE5A]">Voortgang</span>
                  <span className="text-[#8BAE5A] font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-[#232D1A] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {completedLessons} van {moduleLessons.length} lessen
                </div>
              </div>

              {/* Action Info */}
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
            </button>
          );
        })}
      </div>

      {/* Badge Unlock Modal */}
      {showBadgeModal && badgeData && (
        <BadgeUnlockModal
          isOpen={showBadgeModal}
          badge={badgeData}
          onClose={() => {
            setShowBadgeModal(false);
            setBadgeData(null);
          }}
        />
      )}
    </PageLayout>
  );
}
