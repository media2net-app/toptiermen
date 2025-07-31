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
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";

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

  // Simple data fetching without complex useCallback dependencies
  useEffect(() => {
    let isMounted = true;

    const fetchAcademyData = async () => {
      // Check if user exists
      if (!user) {
        console.log('🎓 Academy: No user, skipping data fetch...');
        return;
      }

      // Reset state
      if (isMounted) {
        setLoading(true);
        setError(null);
        console.log('🎓 Academy: Starting data fetch...');
      }

      try {
        // Step 1: Fetch modules
        console.log('📚 Academy: Fetching modules...');
        const { data: modulesData, error: modulesError } = await supabase
          .from('academy_modules')
          .select('*')
          .eq('status', 'published')
          .order('order_index');

        if (modulesError) {
          throw new Error(`Modules query failed: ${modulesError.message}`);
        }

        if (!isMounted) return;
        console.log(`✅ Academy: Loaded ${modulesData?.length || 0} modules`);

        // Step 2: Fetch lessons
        console.log('📖 Academy: Fetching lessons...');
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('academy_lessons')
          .select('*')
          .eq('status', 'published')
          .order('order_index');

        if (lessonsError) {
          throw new Error(`Lessons query failed: ${lessonsError.message}`);
        }

        if (!isMounted) return;
        console.log(`✅ Academy: Loaded ${lessonsData?.length || 0} lessons`);

        // Step 3: Fetch user progress
        console.log('📊 Academy: Fetching user progress...');
        const { data: progressRows, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('content_type', 'module');

        if (progressError) {
          console.warn('⚠️ Progress query failed, continuing without progress data:', progressError.message);
        }

        if (!isMounted) return;

        // Step 4: Fetch lesson progress
        console.log('📊 Academy: Fetching lesson progress...');
        const { data: lessonProgressRows, error: lessonProgressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('content_type', 'lesson');

        if (lessonProgressError) {
          console.warn('⚠️ Lesson progress query failed, continuing without lesson progress data:', lessonProgressError.message);
        }

        if (!isMounted) return;

        // Step 5: Fetch module unlocks
        console.log('🔓 Academy: Fetching module unlocks...');
        const { data: unlockRows, error: unlockError } = await supabase
          .from('module_unlocks')
          .select('*')
          .eq('user_id', user.id);

        if (unlockError) {
          console.warn('⚠️ Unlocks query failed, continuing without unlock data:', unlockError.message);
        }

        if (!isMounted) return;

        // Process progress data
        const progressMap: ProgressData = {};
        if (progressRows) {
          progressRows.forEach(row => {
            progressMap[row.content_id] = row.progress_percentage || 0;
          });
        }

        // Process lesson progress data
        const lessonProgressMap: LessonProgress = {};
        if (lessonProgressRows) {
          lessonProgressRows.forEach(row => {
            lessonProgressMap[row.content_id] = {
              completed: row.progress_percentage === 100,
              completed_at: row.completed_at,
              time_spent: row.time_spent
            };
          });
        }

        // Process unlock data
        const unlockMap: UnlockData = {};
        if (unlockRows) {
          unlockRows.forEach(row => {
            unlockMap[row.module_id] = {
              unlocked_at: row.unlocked_at,
              opened_at: row.opened_at
            };
          });
        }

        // Update state
        if (isMounted) {
          setModules(modulesData || []);
          setLessons(lessonsData || []);
          setProgressData(progressMap);
          setLessonProgress(lessonProgressMap);
          setUnlocks(unlockMap);
          setLoading(false);
          console.log('✅ Academy: All data loaded successfully');
        }

      } catch (err) {
        console.error('❌ Academy: Error fetching data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Onbekende fout opgetreden');
          setLoading(false);
        }
      }
    };

    // Only fetch if user exists
    if (user) {
      fetchAcademyData();
    } else if (user === null) {
      // User is explicitly null (not logged in)
      setLoading(false);
      setError('Je bent niet ingelogd. Log opnieuw in.');
    }
    // If user is undefined, auth is still loading

    // Cleanup function
    return () => {
      isMounted = false;
      console.log('🧹 Academy: Component unmounted, stopping any pending operations');
    };
  }, [user]); // Only depend on user

  // Helper functions
  const getFirstLesson = (moduleId: string) => {
    return lessons.find(l => l.module_id === moduleId && l.status === 'published');
  };

  const getModuleLessons = (moduleId: string) => {
    return lessons.filter(l => l.module_id === moduleId && l.status === 'published').sort((a, b) => a.order_index - b.order_index);
  };

  const getCompletedLessons = (moduleId: string) => {
    const moduleLessons = getModuleLessons(moduleId);
    return moduleLessons.filter(lesson => lessonProgress[lesson.id]?.completed).length;
  };

  const isModuleLocked = (moduleIndex: number) => {
    // TEMPORARILY DISABLED: All modules unlocked for checking lessons
    return false;
    
    // Original lock logic (commented out):
    // if (moduleIndex === 0) return false; // First module is always unlocked
    // const module = modules[moduleIndex];
    // const prevModule = modules[moduleIndex - 1];
    // 
    // // Check if previous module is completed AND current module is unlocked
    // return progressData[prevModule.id] < 100 || !unlocks[module.id];
  };

  const getModuleNumber = (module: Module, index: number) => {
    return index + 1;
  };

  const getModuleStatus = (module: Module, index: number) => {
    const progress = progressData[module.id] || 0;
    const completedLessons = getCompletedLessons(module.id);
    const totalLessons = getModuleLessons(module.id).length;
    const locked = isModuleLocked(index);

    if (locked) return 'locked';
    if (progress === 100) return 'completed';
    if (completedLessons > 0) return 'in_progress';
    return 'not_started';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'in_progress':
        return <PlayIcon className="w-5 h-5 text-blue-400" />;
      case 'locked':
        return <LockClosedIcon className="w-5 h-5 text-gray-400" />;
      default:
        return <BookOpenIcon className="w-5 h-5 text-gray-400" />;
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
        return 'text-green-400 bg-green-400/10';
      case 'in_progress':
        return 'text-blue-400 bg-blue-400/10';
      case 'locked':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Force a re-render to trigger useEffect
    window.location.reload();
  };

  const handleModuleClick = (moduleId: string) => {
    setSelectedModule(selectedModule === moduleId ? null : moduleId);
  };

  // Calculate overall progress
  const totalModules = modules.length;
  const completedModules = modules.filter((_, index) => getModuleStatus(_, index) === 'completed').length;
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Render loading state
  if (loading) {
    return (
      <PageLayout 
        title="Academy"
        subtitle="Overzicht van alle modules en jouw voortgang"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-gray-300">Academy laden...</p>
            <p className="text-gray-500 text-sm mt-2">Dit kan even duren...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <PageLayout 
        title="Academy"
        subtitle="Overzicht van alle modules en jouw voortgang"
      >
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
      </PageLayout>
    );
  }

  // Render success state
  return (
    <PageLayout 
      title="Academy"
      subtitle="Overzicht van alle modules en jouw voortgang"
    >
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

      {modules.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-lg font-medium mb-2">Geen modules gevonden</div>
          <div className="text-sm mb-4">Er zijn momenteel geen gepubliceerde modules beschikbaar.</div>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
          >
            Vernieuwen
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {modules.map((module, index) => {
            const moduleNum = getModuleNumber(module, index);
            const status = getModuleStatus(module, index);
            const locked = status === 'locked';
            const firstLesson = getFirstLesson(module.id);
            const progress = progressData[module.id] || 0;
            const unlock = unlocks[module.id];
            const justUnlocked = unlock && !unlock.opened_at;
            const moduleLessons = getModuleLessons(module.id);
            const completedLessons = getCompletedLessons(module.id);
            const isExpanded = selectedModule === module.id;
            
            // Determine link - either to first lesson or module overview
            const linkHref = locked ? '#' : 
              firstLesson ? `/dashboard/academy/${module.id}/${firstLesson.id}` : 
              `/dashboard/academy/${module.id}`;

            return (
              <div key={module.id} className={`relative ${justUnlocked ? 'animate-pulse shadow-[0_0_0_4px_#8BAE5A80]' : ''}`}>
                <div className={`bg-[#181F17]/90 rounded-xl sm:rounded-2xl shadow-xl border border-[#3A4D23] overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-[#8BAE5A]' : ''}`}>
                  {/* Module Header */}
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center font-bold text-lg sm:text-xl bg-[#232D1A] border-[#8BAE5A] text-[#8BAE5A]">
                          {moduleNum}
                        </span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-[#8BAE5A] flex items-center gap-2">
                            {module.title}
                            {getStatusIcon(status)}
                          </h3>
                          <p className="text-[#A6C97B] text-sm">
                            {completedLessons} van {moduleLessons.length} lessen voltooid
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                        <span className="text-[#8BAE5A] font-mono text-sm">{progress}%</span>
                      </div>
                    </div>

                    {/* Cover Image */}
                    {module.cover_image && (
                      <div className="mb-4 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
                        <img
                          src={module.cover_image}
                          alt={`Cover voor ${module.title}`}
                          className="w-full h-32 sm:h-40 object-cover"
                        />
                      </div>
                    )}
                    
                    <p className="text-[#A6C97B] mb-4 text-sm line-clamp-2">
                      {module.short_description || module.description}
                    </p>
                    
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-[#8BAE5A]/20 rounded-full mb-4">
                      <div
                        className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#8BAE5A] text-sm">
                        <ClockIcon className="w-4 h-4" />
                        <span>{moduleLessons.length} lessen</span>
                        {moduleLessons.some(l => l.duration) && (
                          <>
                            <span>•</span>
                            <span>{moduleLessons.reduce((total, l) => total + (parseInt(l.duration?.split(' ')[0] || '0') || 0), 0)} min</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleModuleClick(module.id)}
                          className="px-3 py-1 text-[#8BAE5A] text-sm border border-[#8BAE5A] rounded hover:bg-[#8BAE5A]/10 transition-colors"
                        >
                          {isExpanded ? 'Verberg' : 'Details'}
                        </button>
                        
                        {!locked && (
                          <Link
                            href={linkHref}
                            className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold text-sm flex items-center gap-2"
                          >
                            {status === 'completed' ? 'Herbekijken' : 'Start'}
                            <ArrowRightIcon className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Lessons List */}
                  {isExpanded && (
                    <div className="border-t border-[#3A4D23] bg-[#232D1A]/50">
                      <div className="p-4 sm:p-6">
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
      )}
    </PageLayout>
  );
} 