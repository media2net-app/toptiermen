"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from '@/lib/supabase';
import Link from "next/link";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import Breadcrumb, { createBreadcrumbs } from '@/components/Breadcrumb';


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

  // Refs for preventing race conditions
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const lastParamsRef = useRef<{ moduleId: string; userId?: string } | null>(null);

  const fetchModuleData = useCallback(async () => {
    if (!user || !moduleId) {
      console.log('Module page: Missing required data', { user: !!user, moduleId });
      return;
    }

    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) {
      console.log('Module page: Fetch already in progress, skipping...');
      return;
    }

    // Don't fetch if parameters haven't changed
    const currentParams = { moduleId, userId: user.id };
    if (lastParamsRef.current && 
        lastParamsRef.current.moduleId === moduleId && 
        lastParamsRef.current.userId === user.id) {
      console.log('Module page: Parameters unchanged, skipping fetch...');
      return;
    }

    console.log('Module page: Starting data fetch for:', { moduleId, user: user.email });
    fetchingRef.current = true;
    lastParamsRef.current = currentParams;
    setLoading(true);
    setError(null);

    try {
      // OPTIMIZED: Fetch all data in parallel with optimized queries
      console.log('🚀 Module page: Fetching data in parallel...');
      
      const [moduleResult, lessonsResult, progressResult, unlockResult] = await Promise.allSettled([
        // Fetch module data with optimized query
        supabase
          .from('academy_modules')
          .select('id, title, description, order_index, cover_image')
          .eq('id', moduleId)
          .single(),
        
        // Fetch lessons for this module with optimized query
        supabase
          .from('academy_lessons')
          .select('id, title, description, duration, type, order_index')
          .eq('module_id', moduleId)
          .eq('status', 'published')
          .order('order_index', { ascending: true }),
        
        // Fetch user progress for this module with optimized query
        supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('completed', true),
        
        // Update module unlock opened_at
        supabase
          .from('user_module_unlocks')
          .update({ opened_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
      ]);

      if (!mountedRef.current) return;

      // Process module result
      let moduleData: Module | null = null;
      if (moduleResult.status === 'fulfilled' && !(moduleResult.value as any).error) {
        moduleData = (moduleResult.value as any).data;
        console.log('Module page: Module loaded:', moduleData?.title);
      } else {
        console.warn('Module fetch failed:', moduleResult.status === 'rejected' ? moduleResult.reason : (moduleResult.value as any).error);
        setError('Module niet gevonden');
        return;
      }

      // Process lessons result
      let lessonsData: Lesson[] = [];
      if (lessonsResult.status === 'fulfilled' && !(lessonsResult.value as any).error) {
        lessonsData = (lessonsResult.value as any).data || [];
        console.log('Module page: Loaded', lessonsData.length, 'lessons');
      } else {
        console.warn('Lessons fetch failed:', lessonsResult.status === 'rejected' ? lessonsResult.reason : (lessonsResult.value as any).error);
      }

      // Process progress result
      let progressRows: any[] = [];
      if (progressResult.status === 'fulfilled' && !(progressResult.value as any).error) {
        progressRows = (progressResult.value as any).data || [];
        console.log('Module page: Loaded', progressRows.length, 'progress records');
      } else {
        console.warn('Progress fetch failed:', progressResult.status === 'rejected' ? progressResult.reason : (progressResult.value as any).error);
      }

      if (!mountedRef.current) return;

      // Update state
      setModule(moduleData);
      setLessons(lessonsData);
      setCompletedLessonIds(progressRows.map(p => p.lesson_id));
      
      console.log('Module page: Data loaded successfully');

    } catch (error) {
      console.error('Error fetching module data:', error);
      if (mountedRef.current) {
        setError(`Fout bij laden van module: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [user, moduleId]);

  // Single useEffect for data fetching
  useEffect(() => {
    if (user && moduleId) {
      fetchModuleData();
    } else if (user === null) {
      // User explicitly logged out
      setModule(null);
      setLessons([]);
      setCompletedLessonIds([]);
      setError('Je bent niet ingelogd. Log opnieuw in.');
      setLoading(false);
      lastParamsRef.current = null;
    }
    // If user is undefined, auth is still loading
  }, [user, moduleId, fetchModuleData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      fetchingRef.current = false;
    };
  }, []);

  // Calculate progress
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => completedLessonIds.includes(l.id)).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-gray-300">Module laden...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 font-bold mb-4">
          {error || 'Module niet gevonden'}
        </div>
        <Link 
          href="/dashboard/academy"
          className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
        >
          Terug naar Academy
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb 
          items={createBreadcrumbs(
            module.title,
            'Academy',
            '/dashboard/academy'
          )} 
        />
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#8BAE5A] font-semibold">Voortgang module</span>
          <span className="text-[#8BAE5A] font-bold">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-[#8BAE5A]/20 rounded-full">
          <div
            className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Cover Image */}
      {module.cover_image && (
        <div className="mb-8">
          <img
            src={module.cover_image}
            alt={`Cover voor ${module.title}`}
            className="w-full h-48 md:h-64 object-cover rounded-2xl border border-[#3A4D23]"
          />
        </div>
      )}
      
      {/* Module header */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{module.title}</h1>
      <div className="text-[#B6C948] text-lg mb-6">{module.short_description}</div>
      <div className="text-[#B6C948] mb-8">{module.description}</div>

      {/* Lessons list */}
      <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">Lessen</h2>
      {lessons.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>Geen lessen beschikbaar voor deze module.</p>
        </div>
      ) : (
        <ul className="mb-8 space-y-2">
          {lessons.map((lesson, index) => (
            <li key={lesson.id} className="flex items-center justify-between py-3 px-4 border border-[#232D1A] rounded-lg hover:bg-[#232D1A] transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm bg-[#232D1A] border-[#8BAE5A] text-[#8BAE5A]">
                  {index + 1}
                </span>
                <Link 
                  href={`/dashboard/academy/${module.id}/${lesson.id}`} 
                  className="text-white hover:text-[#8BAE5A] font-semibold transition-colors"
                >
                  {lesson.title}
                </Link>
                {completedLessonIds.includes(lesson.id) && (
                  <span className="text-[#8BAE5A] text-lg" title="Voltooid">✅</span>
                )}
              </div>
              <div className="text-[#B6C948] text-sm">{lesson.duration}</div>
            </li>
          ))}
        </ul>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Link 
          href="/dashboard/academy" 
          className="px-6 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition"
        >
          ← Terug naar Academy Overzicht
        </Link>
        
        {lessons.length > 0 && (
          <Link 
            href={`/dashboard/academy/${module.id}/${lessons[0].id}`}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-[#181F17] font-bold border border-[#8BAE5A] hover:from-[#B6C948] hover:to-[#8BAE5A] transition"
          >
            Start Module →
          </Link>
        )}
      </div>
    </div>
  );
} 