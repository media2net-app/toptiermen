"use client";
import Link from 'next/link';
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

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
  type?: string;
}

export default function ModulePageClient({
  initialModuleId,
}: {
  initialModuleId?: string;
}) {
  const params = useParams();
  const moduleId = (initialModuleId || (params?.slug as string));
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

  // fetch logic copied from current page (kept minimal here)
  const fetchModuleData = async () => {
    console.log('📘 ModulePageClient: fetchModuleData start', { moduleId, hasUser: !!user });
    const cacheKey = `academy_module_${moduleId}`;
    const cachedData = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
    const cacheTimestamp = typeof window !== 'undefined' ? sessionStorage.getItem(`${cacheKey}_timestamp`) : null;
    const now = Date.now();
    const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity;

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
      } catch {}
    }

    if (!moduleId) {
      console.warn('⚠️ ModulePageClient: missing moduleId');
      setError('Module niet gevonden');
      setLoading(false);
      return;
    }
    if (!user?.id) {
      // Wait for auth to hydrate; do not show an error yet
      console.warn('⚠️ ModulePageClient: no user yet, waiting for auth hydration');
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);
    const abort = new AbortController();
    const t = setTimeout(() => abort.abort(), 12000);
    try {
      console.log('🔄 ModulePageClient: fetching', { userId: user.id, moduleId });
      const response = await fetch(`/api/academy/module-data?userId=${user.id}&moduleId=${moduleId}`, { signal: abort.signal, cache: 'no-cache' });
      clearTimeout(t);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);

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

      setModule(data.module);
      setLessons(data.lessons);
      setCompletedLessonIds(data.completedLessonIds);
      setPreviousModule(data.previousModule);
      setNextModule(data.nextModule);
      setAllModules(data.allModules);
    } catch (err: any) {
      console.error('❌ ModulePageClient: fetch error', err);
      if (!cachedData) {
        setError(err?.message || 'Fout bij het laden van module data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!moduleId) return;
    const currentCacheKey = `academy_module_${moduleId}`;
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('academy_module_') && key !== currentCacheKey) {
        sessionStorage.removeItem(key);
        sessionStorage.removeItem(`${key}_timestamp`);
      }
    });
    fetchModuleData();
    // Re-fetch when user hydrates
    // If user not ready yet, a subsequent change in user?.id will trigger again
  }, [moduleId, user?.id]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1411] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4 text-lg font-semibold">{error}</div>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchModuleData();
              }}
              className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!module || !lessons.length) {
    return (
      <div className="min-h-screen bg-[#0F1411] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">Module niet gevonden</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1411] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link
            href="/dashboard/academy"
            prefetch
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#3A4D23] bg-[#181F17] hover:bg-[#232D1A] text-sm"
          >
            <span>←</span>
            <span>Terug naar module overzicht</span>
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#8BAE5A] mb-2 break-words">
          Module {String(module.order_index).padStart(2, '0')}: {module.title}
        </h1>
        {module.description && (
          <p className="text-gray-300 mb-6 max-w-3xl">{module.description}</p>
        )}

        {/* Lessons list */}
        <div className="bg-[#181F17] rounded-xl border border-[#3A4D23] p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#8BAE5A] text-[#0F1411] text-xs font-bold">
              {lessons.length}
            </span>
            Lessen in deze module
          </h2>

          {lessons.length === 0 ? (
            <div className="text-gray-400">Geen lessen gevonden voor deze module.</div>
          ) : (
            <ul className="space-y-3">
              {lessons.map((lesson, idx) => {
                const done = completedLessonIds.includes(lesson.id);
                const displayNumber = String(lesson.order_index ?? (idx + 1)).padStart(2, '0');
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/dashboard/academy/${module.id}/${lesson.id}`}
                      prefetch
                      className={`block rounded-lg border border-[#3A4D23] px-4 py-3 transition-colors ${
                        done
                          ? 'bg-[#1E2A18] hover:bg-[#232D1A]'
                          : 'bg-[#181F17] hover:bg-[#1B2417]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#3A4D23] text-[#8BAE5A] text-xs font-bold mt-0.5">
                            {displayNumber}
                          </span>
                          <div>
                            <div className="text-white font-medium">{lesson.title}</div>
                          {lesson.description && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">{lesson.description}</div>
                          )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.duration && lesson.type !== 'exam' && (
                            <span className="text-[11px] text-gray-400">{lesson.duration}</span>
                          )}
                          {done ? (
                            <span className="text-[#8BAE5A] text-xs font-semibold">Voltooid</span>
                          ) : (
                            <span className="text-[#B6C948] text-xs font-semibold">Start</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {/* Navigation between modules */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {previousModule ? (
            <Link
              href={`/dashboard/academy/${previousModule.id}`}
              prefetch
              className="px-4 py-2 rounded-lg border border-[#3A4D23] bg-[#181F17] hover:bg-[#232D1A] text-sm"
            >
              ← Vorige module
            </Link>
          ) : <span />}
          {nextModule ? (
            <Link
              href={`/dashboard/academy/${nextModule.id}`}
              prefetch
              className="px-4 py-2 rounded-lg border border-[#3A4D23] bg-[#181F17] hover:bg-[#232D1A] text-sm"
            >
              Volgende module →
            </Link>
          ) : <span />}
        </div>
      </div>
    </div>
  );
}
