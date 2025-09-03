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
  const router = useRouter();

  // Reset navigating state when navigation completes
  useEffect(() => {
    setNavigating(false);
  }, [moduleId]);

  const fetchModuleData = async () => {
    if (!moduleId) {
      console.log('Module page: Missing moduleId');
      setError('Module ID ontbreekt');
      setLoading(false);
      return;
    }

    console.log('Module page: Starting data fetch for:', { moduleId, user: user?.email || 'no user' });
    setLoading(true);
    setError(null);

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⏰ Module data fetch timeout - setting error');
      setError('Timeout bij het laden van module data');
      setLoading(false);
    }, 10000); // 10 second timeout

    try {
      // Fetch module data
      const { data: moduleData, error: moduleError } = await supabase
        .from('academy_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (moduleError || !moduleData) {
        console.error('❌ Module error:', moduleError);
        setError('Module niet gevonden');
        setLoading(false);
        return;
      }

      // Fetch lessons for this module
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('academy_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .eq('status', 'published')
        .order('order_index', { ascending: true });

      if (lessonsError || !lessonsData) {
        console.error('❌ Lessons error:', lessonsError);
        setError('Lessen niet gevonden');
        setLoading(false);
        return;
      }

      // Fetch user progress for this module (only if user is available)
      let progressData: { lesson_id: string }[] | null = null;
      if (user) {
        const { data: userProgress } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('completed', true);
        progressData = userProgress;
      }

      // Update state
      setModule(moduleData);
      setLessons(lessonsData);
      setCompletedLessonIds(progressData?.map(p => p.lesson_id) || []);

      console.log('✅ Module data loaded successfully:', {
        module: moduleData.title,
        lessonsCount: lessonsData.length,
        completedCount: progressData?.length || 0
      });



    } catch (error) {
      console.error('❌ Fetch error:', error);
      setError('Er is een fout opgetreden bij het laden van de module');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (moduleId) {
      console.log('🔄 Module page useEffect triggered:', { moduleId, user: user?.email || 'no user' });
      
      // Always fetch data when moduleId changes
      fetchModuleData();
    }
  }, [moduleId]);

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
    <div className="min-h-screen bg-[#0F1411] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => {
                console.log('🔄 Navigating to academy...');
                setNavigating(true);
                router.push('/dashboard/academy');
              }}
              disabled={navigating}
              className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {navigating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
              ) : (
                "←"
              )}
              Terug naar Academy
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">
            Module {getModuleNumber(module.order_index)}: {module.title}
          </h1>
          <p className="text-gray-300 text-lg">{module.description}</p>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => {
                console.log('🔄 Navigating to lesson...');
                setNavigating(true);
                router.push(`/dashboard/academy/${module.id}/${lesson.id}`);
              }}
              disabled={navigating}
              className="block w-full text-left p-6 rounded-xl border transition-all duration-200 hover:scale-105 disabled:opacity-50 ${
                completedLessonIds.includes(lesson.id)
                  ? 'bg-[#232D1A] text-[#8BAE5A] border-[#3A4D23] hover:bg-[#3A4D23]'
                  : 'bg-[#181F17] text-gray-300 border-[#3A4D23] hover:bg-[#232D1A]'
              }"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full border-2 border-[#8BAE5A] flex items-center justify-center text-sm font-bold text-[#8BAE5A]">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-semibold">{lesson.title}</h3>
                </div>
                {completedLessonIds.includes(lesson.id) && (
                  <span className="text-green-400 text-2xl">✓</span>
                )}
              </div>
              
              <p className="text-gray-400 mb-4 line-clamp-3">{lesson.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8BAE5A]">Duur: {lesson.duration}</span>
                {navigating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="mt-8 p-6 bg-[#181F17]/90 rounded-xl border border-[#3A4D23]">
          <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Voortgang</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-[#232D1A] rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(completedLessonIds.length / lessons.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <span className="text-[#8BAE5A] font-semibold">
              {completedLessonIds.length} van {lessons.length} lessen voltooid
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 