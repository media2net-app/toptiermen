"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  description: string;
  short_description?: string;
  duration: string;
  module_id: string;
  order_index: number;
  status: string;
}

export default function ModuleDetailPage() {
  const params = useParams();
  const moduleId = params?.slug as string;
  const { user } = useSupabaseAuth();
  
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [nextModule, setNextModule] = useState<Module | null>(null);
  const [previousModule, setPreviousModule] = useState<Module | null>(null);
  const router = useRouter();

  // Reset navigating state when navigation completes
  useEffect(() => {
    setNavigating(false);
  }, [moduleId]);

  // Enhanced page visibility handler for PDF ebook returns
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('📖 User returned from ebook, refreshing module data...');
        // Force refresh data when returning from ebook
        fetchModuleData();
      }
    };

    const handlePageFocus = () => {
      console.log('📖 Page focused, checking if we need to refresh...');
      // Only refresh if we're in a loading state or have an error
      if (loading || error) {
        console.log('🔄 Refreshing due to loading/error state...');
        fetchModuleData();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', handlePageShow);
      window.addEventListener('focus', handlePageFocus);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pageshow', handlePageShow);
        window.removeEventListener('focus', handlePageFocus);
      }
    };
  }, [loading, error, moduleId]);

  const fetchModuleData = async () => {
    const cacheKey = `academy_module_${moduleId}`;
    const cachedData = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
    const cacheTimestamp = typeof window !== 'undefined' ? sessionStorage.getItem(`${cacheKey}_timestamp`) : null;
    const now = Date.now();
    const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;

    // 1) Serve fresh-enough cache immediately (works even if user isn't ready yet)
    if (cachedData && cacheAge < 2 * 60 * 1000) {
      try {
        const parsedData = JSON.parse(cachedData);
        setModule(parsedData.module);
        setLessons(parsedData.lessons);
        setCompletedLessonIds(parsedData.completedLessonIds);
        setPreviousModule(parsedData.previousModule);
        setNextModule(parsedData.nextModule);
        setAllModules(parsedData.allModules);
        setLoading(false);
        setError(null);
        console.log('🎓 Module: Used cached data');
      } catch {
        console.warn('⚠️ Failed to parse cached data');
      }
    }

    // 2) If user not ready, defer server fetch without showing error
    if (!moduleId || !user?.id) {
      console.log('Module page: Waiting for user/moduleId before live fetch...');
      return;
    }

    // 3) Live fetch with timeout to avoid hanging after returning from PDF
    setLoading(true);
    setError(null);
    const abort = new AbortController();
    const t = setTimeout(() => abort.abort(), 12000); // 12s timeout
    try {
      const response = await fetch(`/api/academy/module-data?userId=${user.id}&moduleId=${moduleId}`, { signal: abort.signal, cache: 'no-cache' });
      clearTimeout(t);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Cache the data
      const cachePayload = {
        module: data.module,
        lessons: data.lessons,
        completedLessonIds: data.completedLessonIds,
        previousModule: data.previousModule,
        nextModule: data.nextModule,
        allModules: data.allModules
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cachePayload));
      sessionStorage.setItem(`${cacheKey}_timestamp`, now.toString());

      // Update state
      setModule(data.module);
      setLessons(data.lessons);
      setCompletedLessonIds(data.completedLessonIds);
      setPreviousModule(data.previousModule);
      setNextModule(data.nextModule);
      setAllModules(data.allModules);
    } catch (err: any) {
      console.error('❌ Error fetching module data:', err);
      // Only show an error if there is no cache to show
      if (!cachedData) {
        setError(err?.message || 'Fout bij het laden van module data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (moduleId) {
      console.log('🔄 Module page useEffect triggered:', { moduleId, user: user?.email || 'no user' });
      
      // Clear cache for other modules when navigating to a new module
      const currentCacheKey = `academy_module_${moduleId}`;
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('academy_module_') && key !== currentCacheKey) {
          sessionStorage.removeItem(key);
          sessionStorage.removeItem(`${key}_timestamp`);
        }
      });
      
      // Always fetch data when moduleId changes
      fetchModuleData();
    }
  }, [moduleId]);

  // Handle page visibility changes to reset loading states when returning from PDF ebooks
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Module page became visible, checking loading state...');
        
        // If we're stuck loading, reset the state
        if (loading && !error) {
          console.log('🔄 Resetting stuck loading state in module...');
          setLoading(false);
          setError(null);
          
          // Retry data fetch
          setTimeout(() => {
            console.log('🔄 Retrying module data fetch after visibility change...');
            fetchModuleData();
          }, 1000);
        }
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('📖 User returned from PDF ebook to module, resetting states...');
        
        // Reset loading if stuck
        if (loading && !error) {
          console.log('🔄 Resetting stuck loading after page show in module...');
          setLoading(false);
          setError(null);
          
          // Retry data fetch
          setTimeout(() => {
            console.log('🔄 Retrying module data fetch after page show...');
            fetchModuleData();
          }, 1000);
        }
      }
    };

    // Enhanced focus handler for module navigation
    const handleFocus = () => {
      console.log('🎯 Module page focused, checking if we need to refresh...');
      // Only refresh if we're in a loading state or have an error
      if (loading || error) {
        console.log('🔄 Refreshing due to loading/error state on focus...');
        fetchModuleData();
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pageshow', handlePageShow);
      window.addEventListener('focus', handleFocus);
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pageshow', handlePageShow);
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, [loading, error, moduleId]);

  // Retry function for failed data fetches
  const handleRetry = () => {
    console.log('🔄 Retrying module data fetch...');
    setRetryCount(prev => prev + 1);
    setError(null);
    fetchModuleData();
  };

  // Get module number based on order_index
  const getModuleNumber = (orderIndex: number) => {
    return orderIndex.toString().padStart(2, '0');
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1411] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
              <p className="text-gray-300">Module laden...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1411] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4 text-lg font-semibold">{error}</div>
            <button
              onClick={() => {
                setError(null);
                fetchModuleData();
              }}
              className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold mr-4"
            >
              Opnieuw proberen
            </button>
            <button
              onClick={() => {
                console.log('🔄 Navigating to academy...');
                router.push('/dashboard/academy');
              }}
              className="px-6 py-3 bg-[#232D1A] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors font-semibold"
            >
              Terug naar Academy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render module content
  if (!module || !lessons.length) {
    return (
      <div className="min-h-screen bg-[#0F1411] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">Module niet gevonden</div>
            <button
              onClick={() => {
                console.log('🔄 Navigating to academy...');
                router.push('/dashboard/academy');
              }}
              className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
            >
              Terug naar Academy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1411] text-white overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-4">
            {/* Left: Back to Academy + Previous Module */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => {
                  console.log('🔄 Navigating to academy...');
                  setNavigating(true);
                  router.push('/dashboard/academy');
                }}
                disabled={navigating}
                className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors disabled:opacity-50 flex items-center gap-2 w-full sm:w-auto"
              >
                {navigating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
                ) : (
                  "←"
                )}
                Terug naar Academy
              </button>

              {/* Previous Module Button */}
              {previousModule && (
                <button
                  onClick={() => {
                    console.log('🔄 Navigating to previous module...');
                    setNavigating(true);
                    router.push(`/dashboard/academy/${previousModule.id}`);
                  }}
                  disabled={navigating}
                  className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors disabled:opacity-50 flex items-center gap-3 group bg-[#181F17] hover:bg-[#232D1A] px-4 py-2 rounded-xl border border-[#3A4D23] hover:border-[#8BAE5A] self-start sm:self-auto w-full sm:w-auto"
                >
                  <div className="text-left min-w-0">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Vorige Module</div>
                    <div className="font-semibold text-sm md:text-base truncate">
                      Module {getModuleNumber(previousModule.order_index)}: {previousModule.title}
                    </div>
                  </div>
                  {navigating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#8BAE5A]"></div>
                  ) : (
                    <span className="group-hover:-translate-x-1 transition-transform text-lg">←</span>
                  )}
                </button>
              )}
            </div>

            {/* Right: Next Module */}
            {nextModule && (
              <button
                onClick={() => {
                  console.log('🔄 Navigating to next module...');
                  setNavigating(true);
                  router.push(`/dashboard/academy/${nextModule.id}`);
                }}
                disabled={navigating}
                className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors disabled:opacity-50 flex items-center gap-3 group bg-[#181F17] hover:bg-[#232D1A] px-4 py-2 rounded-xl border border-[#3A4D23] hover:border-[#8BAE5A] self-start sm:self-auto w-full sm:w-auto"
              >
                <div className="text-right min-w-0">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Volgende Module</div>
                  <div className="font-semibold text-sm md:text-base truncate">
                    Module {getModuleNumber(nextModule.order_index)}: {nextModule.title}
                  </div>
                </div>
                {navigating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#8BAE5A]"></div>
                ) : (
                  <span className="group-hover:translate-x-1 transition-transform text-lg">→</span>
                )}
              </button>
            )}
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-[#8BAE5A] mb-2 break-words">
            Module {getModuleNumber(module.order_index)}: {module.title}
          </h1>
          <p className="text-gray-300 text-base sm:text-lg break-words">{module.description}</p>
        </div>

        {/* Lessons - Compact table-like layout */}
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl overflow-hidden">
          {/* Header (desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-[#0F1411] border-b border-[#3A4D23] text-xs text-gray-400">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Les</div>
            <div className="col-span-5">Intro</div>
            <div className="col-span-1 text-right">Duur</div>
            <div className="col-span-1 text-center">Status</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#3A4D23]">
            {lessons.map((lesson, index) => {
              const completed = completedLessonIds.includes(lesson.id);
              const intro = (lesson.short_description?.trim() || (lesson.description || '').split(/\n|\.|\!|\?/)[0] || '').trim();
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    console.log('🔄 Navigating to lesson...');
                    setNavigating(true);
                    router.push(`/dashboard/academy/${module.id}/${lesson.id}`);
                  }}
                  disabled={navigating}
                  className={`w-full text-left group hover:bg-[#1C2417] transition-colors disabled:opacity-50`}
                >
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 items-center">
                    <div className="col-span-1">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-[#8BAE5A] text-[11px] font-bold text-[#8BAE5A]">
                        {index + 1}
                      </span>
                    </div>
                    <div className="col-span-4 pr-2 truncate text-white font-semibold">
                      {lesson.title}
                    </div>
                    <div className="col-span-5 text-gray-300">
                      <span className="line-clamp-1">{intro}</span>
                    </div>
                    <div className="col-span-1 text-right text-[#8BAE5A] font-semibold">
                      {lesson.duration}
                    </div>
                    <div className="col-span-1 text-center">
                      {/* Tiny per-lesson progress bar */}
                      <div className="w-full bg-[#232D1A] rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${completed ? 'bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] w-full' : 'bg-[#3A4D23] w-0'}`}
                        ></div>
                      </div>
                      <div className="mt-1">
                        {completed ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-600/20 text-green-400 border border-green-600/30 text-[10px] font-semibold">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#232D1A] text-gray-300 border border-[#3A4D23] text-[10px]">
                            0%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className={`md:hidden px-4 py-3 ${completed ? 'bg-[#1C2417]' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-[#8BAE5A] text-[11px] font-bold text-[#8BAE5A] flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-white font-semibold text-sm truncate">{lesson.title}</div>
                          <div className="text-[11px] text-gray-300 line-clamp-2">{intro}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-[#8BAE5A] font-semibold">{lesson.duration}</div>
                        {completed && <div className="text-green-400 text-lg leading-none">✓</div>}
                      </div>
                    </div>
                    {/* Tiny per-lesson progress bar (mobile) */}
                    <div className="mt-2 w-full bg-[#232D1A] rounded-full h-1">
                      <div className={`h-1 rounded-full transition-all duration-300 ${completed ? 'bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] w-full' : 'bg-[#3A4D23] w-0'}`}></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Summary - compact */}
        <div className="mt-6 p-4 bg-[#181F17]/90 rounded-xl border border-[#3A4D23]">
          <h3 className="text-base font-semibold text-[#8BAE5A] mb-3">Voortgang</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="w-full bg-[#232D1A] rounded-full h-1 md:h-2">
                <div
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-1 md:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedLessonIds.length / lessons.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <span className="text-[#8BAE5A] text-xs md:text-sm font-semibold whitespace-nowrap">
              {completedLessonIds.length} / {lessons.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 