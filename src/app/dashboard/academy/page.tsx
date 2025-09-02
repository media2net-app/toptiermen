"use client";

import { useState, useEffect } from 'react';
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
import Breadcrumb, { createBreadcrumbs } from '@/components/Breadcrumb';
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
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressData, setProgressData] = useState<ProgressData>({});
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>({});
  const [unlocks, setUnlocks] = useState<UnlockData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeData, setBadgeData] = useState<any>(null);
  const [academyCompleted, setAcademyCompleted] = useState(false);
  const [hasAcademyBadge, setHasAcademyBadge] = useState(false);
  const [academyBadgeData, setAcademyBadgeData] = useState<any>(null);

  // Fetch academy data
  useEffect(() => {
    let isMounted = true;

    const fetchAcademyData = async () => {
      if (!user) {
        console.log('🎓 Academy: No user, skipping data fetch...');
        return;
      }

      if (isMounted) {
        setLoading(true);
        setError(null);
        console.log('🎓 Academy: Starting data fetch...');
      }

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('⚠️ Academy: Data fetch timeout, setting loading to false');
          setLoading(false);
          setError('Het laden duurde te lang. Probeer de pagina te verversen.');
        }
      }, 10000); // 10 second timeout

      try {
        // OPTIMIZED: Fetch all data in parallel with optimized queries
        console.log('🚀 Academy: Fetching all data in parallel...');
        
        const [modulesResult, lessonsResult, progressResult, lessonProgressResult, unlocksResult] = await Promise.allSettled([
          // Fetch modules with optimized query
          supabase
            .from('academy_modules')
            .select('*')
            .eq('status', 'published')
            .order('order_index'),
          
          // Fetch lessons with optimized query
          supabase
            .from('academy_lessons')
            .select('*')
            .eq('status', 'published')
            .order('order_index'),
          
          // Fetch user progress with optimized query
          supabase
            .from('user_module_progress')
            .select('*')
            .eq('user_id', user.id),
          
          // Fetch lesson progress with optimized query
          supabase
            .from('user_lesson_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('completed', true),
          
          // Fetch module unlocks with optimized query
          supabase
            .from('user_module_unlocks')
            .select('*')
            .eq('user_id', user.id)
        ]);

        // Process modules result
        let modulesData: any[] = [];
        if (modulesResult.status === 'fulfilled' && !modulesResult.value.error) {
          modulesData = modulesResult.value.data || [];
          console.log('✅ Academy: Modules loaded:', modulesData.length);
        } else {
          console.error('❌ Academy: Modules error:', modulesResult.status === 'rejected' ? modulesResult.reason : modulesResult.value?.error);
          throw new Error('Modules niet geladen');
        }

        // Process lessons result
        let lessonsData: any[] = [];
        if (lessonsResult.status === 'fulfilled' && !lessonsResult.value.error) {
          lessonsData = lessonsResult.value.data || [];
          console.log('✅ Academy: Lessons loaded:', lessonsData.length);
        } else {
          console.error('❌ Academy: Lessons error:', lessonsResult.status === 'rejected' ? lessonsResult.reason : lessonsResult.value?.error);
          throw new Error('Lessen niet geladen');
        }

        // Process progress result
        let progressData: any[] = [];
        if (progressResult.status === 'fulfilled' && !progressResult.value.error) {
          progressData = progressResult.value.data || [];
          console.log('✅ Academy: Progress loaded:', progressData.length);
        } else {
          console.warn('⚠️ Academy: Progress warning:', progressResult.status === 'rejected' ? progressResult.reason : progressResult.value?.error);
        }

        // Process lesson progress result
        let lessonProgressData: any[] = [];
        if (lessonProgressResult.status === 'fulfilled' && !lessonProgressResult.value.error) {
          lessonProgressData = lessonProgressResult.value.data || [];
          console.log('✅ Academy: Lesson progress loaded:', lessonProgressData.length);
        } else {
          console.warn('⚠️ Academy: Lesson progress warning:', lessonProgressResult.status === 'rejected' ? lessonProgressResult.reason : lessonProgressResult.value?.error);
        }

        // Process unlocks result
        let unlocksData: any[] = [];
        if (unlocksResult.status === 'fulfilled' && !unlocksResult.value.error) {
          unlocksData = unlocksResult.value.data || [];
          console.log('✅ Academy: Unlocks loaded:', unlocksData.length);
        } else {
          console.warn('⚠️ Academy: Unlocks warning:', unlocksResult.status === 'rejected' ? unlocksResult.reason : unlocksResult.value?.error);
        }

        if (isMounted) {
          setModules(modulesData || []);
          setLessons(lessonsData || []);
          
          // Transform progress data
          const progressMap: ProgressData = {};
          (progressData || []).forEach((progress: any) => {
            progressMap[progress.module_id] = progress.progress_percentage || 0;
          });
          setProgressData(progressMap);

          // Transform lesson progress data
          const lessonProgressMap: LessonProgress = {};
          (lessonProgressData || []).forEach((progress: any) => {
            lessonProgressMap[progress.lesson_id] = {
              completed: progress.completed || false,
              completed_at: progress.completed_at,
              time_spent: progress.time_spent
            };
          });
          setLessonProgress(lessonProgressMap);

          // Transform unlocks data
          const unlocksMap: UnlockData = {};
          (unlocksData || []).forEach((unlock: any) => {
            unlocksMap[unlock.module_id] = {
              unlocked_at: unlock.unlocked_at,
              opened_at: unlock.opened_at
            };
          });
          setUnlocks(unlocksMap);

          setLoading(false);
          console.log('✅ Academy: Data fetch completed successfully');
        }
      } catch (error) {
        console.error('❌ Academy: Error fetching data:', error);
        if (isMounted) {
          setError('Er is een fout opgetreden bij het laden van de academy data.');
          setLoading(false);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchAcademyData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Check academy completion
  useEffect(() => {
    const checkAcademyCompletion = async () => {
      if (!user || modules.length === 0) return;

      try {
        // First check if user has Academy Master badge
        const { data: academyBadge, error: badgeError } = await supabase
          .from('user_badges')
          .select(`
            id,
            unlocked_at,
            status,
            badges!inner(
              id,
              title,
              description,
              icon_name,
              rarity_level,
              xp_reward
            )
          `)
          .eq('user_id', user.id)
          .eq('badges.title', 'Academy Master')
          .single();

        if (badgeError && badgeError.code !== 'PGRST116') {
          console.error('Error checking Academy Master badge:', badgeError);
        }

        // Check if all modules are completed
        const totalModules = modules.length;
        const completedModules = modules.filter((_, index) => getModuleStatus(_, index) === 'completed').length;
        const allModulesCompleted = completedModules === totalModules && totalModules > 0;

        console.log('🎓 Academy completion check:', {
          totalModules,
          completedModules,
          allModulesCompleted,
          hasBadge: !!academyBadge
        });

        setAcademyCompleted(allModulesCompleted);
        setHasAcademyBadge(!!academyBadge);
        setAcademyBadgeData(academyBadge?.badges || null);

        // If newly completed and has badge, show modal (but only once)
        const hasShownBadge = localStorage.getItem('academyBadgeShown') === 'true';
        if (allModulesCompleted && academyBadge && !showBadgeModal && !hasShownBadge) {
          console.log('🎉 Showing Academy Master badge modal');
          setBadgeData(academyBadge.badges);
          setShowBadgeModal(true);
          
          // Store in localStorage to prevent showing again
          localStorage.setItem('academyBadgeShown', 'true');
        }
      } catch (error) {
        console.error('Error checking academy completion:', error);
      }
    };

    checkAcademyCompletion();
  }, [user, modules, lessonProgress, showBadgeModal]);

  // Check for badge unlock from localStorage
  useEffect(() => {
    const storedBadgeData = localStorage.getItem('academyBadgeUnlock');
    if (storedBadgeData) {
      try {
        const badgeData = JSON.parse(storedBadgeData);
        setBadgeData(badgeData);
        setShowBadgeModal(true);
        localStorage.removeItem('academyBadgeUnlock');
      } catch (error) {
        console.error('Error parsing stored badge data:', error);
        localStorage.removeItem('academyBadgeUnlock');
      }
    }
  }, []);

  // Debug function to reset badge modal (for testing)
  const resetBadgeModal = () => {
    localStorage.removeItem('academyBadgeShown');
    console.log('🔄 Badge modal reset for testing');
  };

  // Add reset function to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).resetAcademyBadgeModal = resetBadgeModal;
    }
  }, []);

  // Helper functions
  const getModuleLessons = (moduleId: string) => {
    return lessons.filter(lesson => lesson.module_id === moduleId);
  };

  const getCompletedLessonsCount = (moduleId: string) => {
    const moduleLessons = getModuleLessons(moduleId);
    return moduleLessons.filter(lesson => lessonProgress[lesson.id]?.completed).length;
  };

  const isModuleLocked = (module: Module, index: number) => {
    if (index === 0) return false;
    const previousModule = modules[index - 1];
    const previousLessons = getModuleLessons(previousModule.id);
    const completedPreviousLessons = previousLessons.filter(lesson => lessonProgress[lesson.id]?.completed).length;
    return completedPreviousLessons < previousLessons.length;
  };

  const getModuleNumber = (index: number) => {
    return (index + 1).toString().padStart(2, '0');
  };

  const getFirstLesson = (moduleId: string) => {
    const moduleLessons = getModuleLessons(moduleId);
    return moduleLessons[0];
  };

  const getModuleStatus = (module: Module, index: number) => {
    if (isModuleLocked(module, index)) return 'locked';
    
    const moduleLessons = getModuleLessons(module.id);
    const completedLessons = getCompletedLessonsCount(module.id);
    
    if (completedLessons === 0) return 'not_started';
    if (completedLessons === moduleLessons.length) return 'completed';
    return 'in_progress';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
      case 'in_progress':
        return <PlayIcon className="w-6 h-6 text-blue-400" />;
      case 'locked':
        return <LockClosedIcon className="w-6 h-6 text-gray-400" />;
      default:
        return <StarIcon className="w-6 h-6 text-[#8BAE5A]" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Voltooid';
      case 'in_progress':
        return 'Bezig';
      case 'locked':
        return 'Vergrendeld';
      default:
        return 'Niet gestart';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-400/10 text-green-400 border-green-400/30';
      case 'in_progress':
        return 'bg-blue-400/10 text-blue-400 border-blue-400/30';
      case 'locked':
        return 'bg-gray-400/10 text-gray-400 border-gray-400/30';
      default:
        return 'bg-[#8BAE5A]/10 text-[#8BAE5A] border-[#8BAE5A]/30';
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  // Calculate overall progress
  const totalModules = modules.length;
  const completedModules = modules.filter((_, index) => getModuleStatus(_, index) === 'completed').length;
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <PageLayout 
      title="Academy"
      subtitle="Overzicht van alle modules en jouw voortgang"
    >
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={createBreadcrumbs('Academy')} />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-gray-300">Academy laden...</p>
            <p className="text-gray-500 text-sm mt-2">Dit kan even duren...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-400 mb-4 text-lg font-semibold">{error}</div>
          <div className="text-gray-400 mb-6 text-sm">
            Er is een probleem opgetreden bij het laden van de academy data.
          </div>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
          >
            Opnieuw proberen
          </button>
        </div>
      )}

      {/* Success State */}
      {!loading && !error && (
        <>
          {/* Overall Progress Section */}
          <div className="mb-8 p-6 bg-[#181F17]/90 rounded-xl border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TrophyIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h2 className="text-xl font-semibold text-[#8BAE5A]">Jouw Voortgang</h2>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#8BAE5A]">{overallProgress}%</div>
                <div className="text-sm text-[#A6C97B]">{completedModules} van {totalModules} modules voltooid</div>
              </div>
            </div>
            
            {/* Overall Progress Bar */}
            <div className="w-full h-3 bg-[#8BAE5A]/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-[#8BAE5A]">{completedModules}</div>
                <div className="text-xs text-[#A6C97B]">Voltooid</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#8BAE5A]">
                  {modules.filter((_, index) => getModuleStatus(_, index) === 'in_progress').length}
                </div>
                <div className="text-xs text-[#A6C97B]">Bezig</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#8BAE5A]">
                  {modules.filter((_, index) => getModuleStatus(_, index) === 'not_started').length}
                </div>
                <div className="text-xs text-[#A6C97B]">Niet gestart</div>
              </div>
            </div>
          </div>

          {/* Academy Completion Info Box */}
          {academyCompleted && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <TrophyIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-400">Academy Voltooid! 🎉</h3>
              </div>
              
              <div className="space-y-3">
                <p className="text-green-300">
                  Gefeliciteerd! Je hebt alle Academy modules succesvol voltooid.
                </p>
                
                {hasAcademyBadge && academyBadgeData ? (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <span className="text-2xl">{academyBadgeData.icon_name}</span>
                    <div>
                      <div className="font-semibold text-green-400">
                        {academyBadgeData.title} Badge Unlocked!
                      </div>
                      <div className="text-sm text-green-300">
                        {academyBadgeData.description}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="font-semibold text-yellow-400">
                        Badge Check Status
                      </div>
                      <div className="text-sm text-yellow-300">
                        Academy voltooid maar badge status wordt gecontroleerd...
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-[#8BAE5A]/70">
                  Debug Info: Academy Completed = {academyCompleted.toString()}, Has Badge = {hasAcademyBadge.toString()}
                </div>
              </div>
            </div>
          )}

          {/* Almost Complete Info Box */}
          {!academyCompleted && overallProgress >= 90 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <TrophyIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-400">Bijna Klaar! 🔥</h3>
              </div>
              
              <div className="space-y-3">
                <p className="text-blue-300">
                  Je bent bijna klaar met de Academy! Nog even doorzetten voor de Academy Master badge.
                </p>
                
                <div className="text-xs text-blue-400/70">
                  Debug Info: Progress = {overallProgress}%, Academy Completed = {academyCompleted.toString()}
                </div>
              </div>
            </div>
          )}

          {/* Modules Grid */}
          <div className="space-y-6">
            {modules.map((module, index) => {
              const status = getModuleStatus(module, index);
              const isLocked = isModuleLocked(module, index);
              const moduleLessons = getModuleLessons(module.id);
              const completedLessons = getCompletedLessonsCount(module.id);
              const totalLessons = moduleLessons.length;
              const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
              const isExpanded = selectedModule === module.id;

              return (
                <div key={module.id} className="bg-[#181F17] rounded-xl border border-[#3A4D23] overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center">
                          <span className="text-[#8BAE5A] font-bold text-lg">{getModuleNumber(index)}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{module.title}</h3>
                          <p className="text-[#A6C97B] text-sm">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status)}
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-[#8BAE5A]">
                          {completedLessons} van {totalLessons} lessen voltooid
                        </div>
                        <div className="text-sm text-[#A6C97B]">
                          {progress}% voltooid
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isLocked && (
                          <Link
                            href={`/dashboard/academy/${module.id}/${getFirstLesson(module.id)?.id || ''}`}
                            className={`px-4 py-2 rounded-lg transition-colors font-semibold ${
                              progress === 100 
                                ? 'bg-[#B6C948] text-[#181F17] hover:bg-[#C6D958]' 
                                : 'bg-[#8BAE5A] text-[#181F17] hover:bg-[#B6C948]'
                            }`}
                          >
                            {progress === 100 ? 'Bekijk opnieuw' : 'Start Module'}
                          </Link>
                        )}
                        {moduleLessons.length > 0 && (
                          <button
                            onClick={() => setSelectedModule(isExpanded ? null : module.id)}
                            className="p-2 text-[#8BAE5A] hover:bg-[#3A4D23] rounded-lg transition-colors"
                          >
                            <BookOpenIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#3A4D23] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Lessons List */}
                    {isExpanded && (
                      <div className="border-t border-[#3A4D23] bg-[#232D1A]/50 mt-6">
                        <div className="p-4">
                          <h4 className="text-[#8BAE5A] font-semibold mb-4 flex items-center gap-2">
                            <BookOpenIcon className="w-5 h-5" />
                            Lessen in deze module
                          </h4>
                          
                          <div className="space-y-3">
                            {moduleLessons.map((lesson, lessonIndex) => {
                              const currentLessonProgress = lessonProgress[lesson.id];
                              const isCompleted = currentLessonProgress?.completed;
                              const isCurrent = !isCompleted && (lessonIndex === 0 || moduleLessons[lessonIndex - 1] && lessonProgress[moduleLessons[lessonIndex - 1].id]?.completed);
                              
                              return (
                                <Link
                                  key={lesson.id}
                                  href={`/dashboard/academy/${module.id}/${lesson.id}`}
                                  className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                                    isCompleted 
                                      ? 'bg-green-400/10 border-green-400/30' 
                                      : isCurrent 
                                      ? 'bg-blue-400/10 border-blue-400/30' 
                                      : 'bg-[#3A4D23]/30 border-[#3A4D23]'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                      isCompleted 
                                        ? 'bg-green-400 text-[#181F17]' 
                                        : isCurrent 
                                        ? 'bg-blue-400 text-[#181F17]' 
                                        : 'bg-[#8BAE5A]/20 text-[#8BAE5A]'
                                    }`}>
                                      {isCompleted ? (
                                        <CheckCircleIcon className="w-4 h-4" />
                                      ) : isCurrent ? (
                                        <PlayIcon className="w-4 h-4" />
                                      ) : (
                                        <span className="text-xs font-bold">{lessonIndex + 1}</span>
                                      )}
                                    </div>
                                    <div>
                                      <div className={`font-medium ${
                                        isCompleted 
                                          ? 'text-green-400' 
                                          : isCurrent 
                                          ? 'text-blue-400' 
                                          : 'text-[#A6C97B]'
                                      }`}>
                                        {lesson.title}
                                      </div>
                                      {lesson.duration && (
                                        <div className="text-xs text-[#8BAE5A]/70 flex items-center gap-1">
                                          <ClockIcon className="w-3 h-3" />
                                          {lesson.duration}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {isCompleted && (
                                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                                        Voltooid
                                      </span>
                                    )}
                                    {isCurrent && (
                                      <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                                        Volgende
                                      </span>
                                    )}
                                    <ArrowRightIcon className="w-4 h-4 text-[#8BAE5A]" />
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Badge Unlock Modal */}
      {badgeData && (
        <BadgeUnlockModal
          isOpen={showBadgeModal}
          onClose={() => setShowBadgeModal(false)}
          badge={badgeData}
          hasUnlockedBadge={false}
        />
      )}
    </PageLayout>
  );
}
