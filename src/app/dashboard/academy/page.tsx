"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import PageLayout from '@/components/PageLayout';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Module {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  cover_image?: string;
  slug: string;
  order_index: number;
  lessons_count: number;
  status: string;
}

interface Lesson {
  id: string;
  title: string;
  module_id: string;
  order_index: number;
  status: string;
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

export default function AcademyPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressData, setProgressData] = useState<ProgressData>({});
  const [unlocks, setUnlocks] = useState<UnlockData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple data fetching without complex useCallback dependencies
  useEffect(() => {
    let isMounted = true;

    const fetchAcademyData = async () => {
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
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('completed', true);

        if (progressError) {
          console.warn('⚠️ Academy: Progress query failed:', progressError.message);
          // Don't throw error for progress - it's optional
        }

        if (!isMounted) return;

        // Step 4: Calculate progress per module
        const completedLessons = new Set((progressRows || []).map(p => p.lesson_id));
        const progressMap: ProgressData = {};
        
        (modulesData || []).forEach(module => {
          const moduleLessons = (lessonsData || []).filter(l => l.module_id === module.id);
          const completedModuleLessons = moduleLessons.filter(l => completedLessons.has(l.id));
          const progress = moduleLessons.length > 0 ? Math.round((completedModuleLessons.length / moduleLessons.length) * 100) : 0;
          progressMap[module.id] = progress;
        });

        console.log(`📈 Academy: Calculated progress for ${Object.keys(progressMap).length} modules`);

        // Step 5: Fetch module unlocks
        console.log('🔓 Academy: Fetching module unlocks...');
        const { data: unlocksData, error: unlocksError } = await supabase
          .from('user_module_unlocks')
          .select('*')
          .eq('user_id', user.id);

        if (unlocksError) {
          console.warn('⚠️ Academy: Unlocks query failed:', unlocksError.message);
          // Don't throw error for unlocks - we'll handle defaults
        }

        if (!isMounted) return;

        const unlocksMap: UnlockData = {};
        (unlocksData || []).forEach(unlock => {
          unlocksMap[unlock.module_id] = {
            unlocked_at: unlock.unlocked_at,
            opened_at: unlock.opened_at
          };
        });

        console.log(`🔑 Academy: Loaded ${Object.keys(unlocksMap).length} unlocks`);

        // Step 6: Handle first module unlock
        if ((modulesData || []).length > 0 && !unlocksMap[modulesData[0].id]) {
          console.log('🔓 Academy: Unlocking first module for new user...');
          try {
            const { error: unlockError } = await supabase
              .from('user_module_unlocks')
              .insert({
                user_id: user.id,
                module_id: modulesData[0].id,
                unlocked_at: new Date().toISOString()
              });

            if (!unlockError) {
              unlocksMap[modulesData[0].id] = {
                unlocked_at: new Date().toISOString()
              };
            }
          } catch (unlockErr) {
            console.warn('⚠️ Academy: Failed to unlock first module:', unlockErr);
          }
        }

        // Step 7: Update state with all data
        if (isMounted) {
          setModules(modulesData || []);
          setLessons(lessonsData || []);
          setProgressData(progressMap);
          setUnlocks(unlocksMap);
          console.log('🎉 Academy: All data loaded successfully!');
        }

      } catch (err) {
        console.error('❌ Academy: Error during data fetch:', err);
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          setError(`Academy kon niet worden geladen: ${errorMessage}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('⏹️ Academy: Loading completed');
        }
      }
    };

    // Only fetch if user is authenticated
    if (user) {
      fetchAcademyData();
    } else if (user === null) {
      // User is explicitly not logged in
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

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Force a re-render to trigger useEffect
    window.location.reload();
  };

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
      ) :
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {modules.map((module, index) => {
            const moduleNum = getModuleNumber(module, index);
            const locked = isModuleLocked(index);
            const firstLesson = getFirstLesson(module.id);
            const progress = progressData[module.id] || 0;
            const unlock = unlocks[module.id];
            const justUnlocked = unlock && !unlock.opened_at;
            
            // Determine link - either to first lesson or module overview
            const linkHref = locked ? '#' : 
              firstLesson ? `/dashboard/academy/${module.id}/${firstLesson.id}` : 
              `/dashboard/academy/${module.id}`;

            return (
              <div key={module.id} className={`relative ${justUnlocked ? 'animate-pulse shadow-[0_0_0_4px_#8BAE5A80]' : ''}`}>
                <Link
                  href={linkHref}
                  className={`bg-[#181F17]/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-[#3A4D23] flex flex-col gap-2 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] relative active:scale-[0.98] touch-manipulation ${locked ? 'opacity-60 pointer-events-none' : ''}`}
                  tabIndex={locked ? -1 : 0}
                  aria-disabled={locked}
                >
                  {/* Cover Image */}
                  {module.cover_image && (
                    <div className="mb-3 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
                      <img
                        src={module.cover_image}
                        alt={`Cover voor ${module.title}`}
                        className="w-full h-32 sm:h-40 object-cover rounded-t-xl sm:rounded-t-2xl"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="flex items-center gap-1 sm:gap-2 text-lg sm:text-xl font-semibold text-[#8BAE5A]">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center font-bold text-base sm:text-lg mr-2 bg-[#232D1A] border-[#8BAE5A]">
                        {moduleNum}
                      </span>
                      {module.title}
                      {locked && <LockClosedIcon className="w-5 h-5 text-[#8BAE5A] ml-2" title="Module is vergrendeld" />}
                    </span>
                    <span className="text-[#8BAE5A] font-mono text-xs sm:text-sm">{progress}%</span>
                  </div>
                  
                  <p className="text-[#A6C97B] mb-1 sm:mb-2 text-xs sm:text-sm line-clamp-2">
                    {module.short_description || module.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#8BAE5A] text-xs sm:text-sm">
                      {module.lessons_count} {module.lessons_count === 1 ? 'les' : 'lessen'}
                    </span>
                    {locked ? (
                      <span className="text-[#8BAE5A] text-xs bg-[#8BAE5A]/10 px-2 py-1 rounded">
                        Vergrendeld
                      </span>
                    ) : justUnlocked ? (
                      <span className="text-[#B6C948] text-xs bg-[#B6C948]/10 px-2 py-1 rounded animate-pulse">
                        Nieuw beschikbaar!
                      </span>
                    ) : (
                      <span className="text-[#B6C948] text-xs bg-[#B6C948]/10 px-2 py-1 rounded">
                        Beschikbaar
                      </span>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1 bg-[#8BAE5A]/20 rounded-full mt-2">
                    <div
                      className="h-1 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      }
    </PageLayout>
  );
} 