"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/PageLayout';

interface Module {
  id: string;
  title: string;
  description: string;
  slug: string;
  order_index: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  duration: string;
  type: string;
  module_id: string;
  order_index: number;
  status: string;
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const moduleId = (params as any).slug as string;
  const lessonId = (params as any).lessonId as string;
  
  const [module, setModule] = useState<Module | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);

  // Simplified data fetching
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !moduleId || !lessonId) {
        console.log('Missing data:', { user: !!user, moduleId, lessonId });
        return;
      }

      setLoading(true);
      setError(null);
      setVideoLoading(true);

      try {
        console.log('Fetching lesson data for:', { moduleId, lessonId });

        // Fetch module
        const { data: moduleData, error: moduleError } = await supabase
          .from('academy_modules')
          .select('*')
          .eq('id', moduleId)
          .single();

        if (moduleError) {
          console.error('Module error:', moduleError);
          setError('Module niet gevonden');
          return;
        }

        // Fetch lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('academy_lessons')
          .select('*')
          .eq('module_id', moduleId)
          .eq('status', 'published')
          .order('order_index');

        if (lessonsError) {
          console.error('Lessons error:', lessonsError);
          setError('Lessen niet gevonden');
          return;
        }

        // Fetch progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('completed', true);

        if (progressError) {
          console.error('Progress error:', progressError);
        }

        // Find current lesson
        const currentLesson = lessonsData?.find(l => l.id === lessonId);
        if (!currentLesson) {
          console.error('Lesson not found:', lessonId);
          setError('Les niet gevonden');
          return;
        }

        // Check completion
        const isCompleted = progressData?.some(p => p.lesson_id === lessonId) || false;
        const completedIds = progressData?.map(p => p.lesson_id) || [];

        // Update state
        setModule(moduleData);
        setLessons(lessonsData || []);
        setLesson(currentLesson);
        setCompleted(isCompleted);
        setCompletedLessonIds(completedIds);

        console.log('Data loaded successfully');

      } catch (error) {
        console.error('Error:', error);
        setError('Er is een fout opgetreden');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, moduleId, lessonId]);

  const handleCompleteLesson = async () => {
    if (!user || !lesson) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          completed: true,
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id,lesson_id' });

      if (error) {
        console.error('Error completing lesson:', error);
        setError('Fout bij voltooien van les');
      } else {
        setCompleted(true);
        setCompletedLessonIds(prev => [...prev, lesson.id]);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      setError('Fout bij voltooien van les');
    } finally {
      setSaving(false);
    }
  };

  // Calculate progress
  const currentIndex = lessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // Render loading state
  if (loading) {
    return (
      <PageLayout 
        title="Les laden..."
        subtitle="Even geduld..."
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-gray-300">Les laden...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <PageLayout 
        title="Fout"
        subtitle="Er is een probleem opgetreden"
      >
        <div className="text-center py-12">
          <div className="text-red-400 mb-4 text-lg font-semibold">{error}</div>
          <Link
            href="/dashboard/academy"
            className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
          >
            Terug naar Academy
          </Link>
        </div>
      </PageLayout>
    );
  }

  // Render lesson content
  if (!lesson || !module) {
    return (
      <PageLayout 
        title="Les niet gevonden"
        subtitle="De opgevraagde les bestaat niet"
      >
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">Les niet gevonden</div>
          <Link
            href="/dashboard/academy"
            className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
          >
            Terug naar Academy
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={lesson.title}
      subtitle={`Module: ${module.title}`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard/academy"
            className="flex items-center gap-2 text-[#8BAE5A] hover:text-[#B6C948] transition-colors"
          >
            ← Terug naar module overzicht
          </Link>
          
          <div className="flex items-center gap-4">
            {prevLesson && (
              <Link
                href={`/dashboard/academy/${module.id}/${prevLesson.id}`}
                className="px-4 py-2 bg-[#232D1A] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors"
              >
                Vorige les
              </Link>
            )}
            
            {nextLesson && (
              <Link
                href={`/dashboard/academy/${module.id}/${nextLesson.id}`}
                className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors"
              >
                Volgende les
              </Link>
            )}
          </div>
        </div>

        {/* Lesson content */}
        <div className="bg-[#181F17]/90 rounded-xl p-6 border border-[#3A4D23]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#8BAE5A] mb-2">{lesson.title}</h1>
            <p className="text-gray-300">{lesson.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
              <span>Duur: {lesson.duration}</span>
              <span>Type: {lesson.type}</span>
              {completed && <span className="text-green-400">✓ Voltooid</span>}
            </div>
          </div>

          {/* Video content */}
          {lesson.video_url && (
            <div className="mb-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                {videoLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mb-4"></div>
                    <div className="text-[#8BAE5A] text-lg font-semibold">Video laden...</div>
                  </div>
                )}
                <video
                  src={lesson.video_url}
                  controls
                  autoPlay
                  muted
                  className="w-full h-full"
                  poster="/video-placeholder.svg"
                  onCanPlay={() => setVideoLoading(false)}
                  onLoadedData={() => setVideoLoading(false)}
                  onError={() => setVideoLoading(false)}
                >
                  Je browser ondersteunt geen video afspelen.
                </video>
              </div>
            </div>
          )}

          {/* Text content */}
          {lesson.content && (
            <div className="mb-6">
              <div className="prose prose-invert max-w-none">
                <div 
                  className="text-gray-300"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </div>
            </div>
          )}

          {/* Complete button */}
          {!completed && (
            <div className="flex justify-center">
              <button
                onClick={handleCompleteLesson}
                disabled={saving}
                className="px-8 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Bezig...' : 'Les voltooien'}
              </button>
            </div>
          )}

          {completed && (
            <div className="text-center">
              <div className="text-green-400 text-lg font-semibold mb-2">✓ Les voltooid!</div>
              <p className="text-gray-400">Ga door naar de volgende les om je voortgang te behouden.</p>
            </div>
          )}
        </div>

        {/* Lesson list */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Lessen in deze module</h3>
          <div className="space-y-2">
            {lessons.map((l, index) => (
              <Link
                key={l.id}
                href={`/dashboard/academy/${module.id}/${l.id}`}
                className={`block p-4 rounded-lg border transition-colors ${
                  l.id === lessonId
                    ? 'bg-[#8BAE5A] text-[#181F17] border-[#8BAE5A]'
                    : completedLessonIds.includes(l.id)
                    ? 'bg-[#232D1A] text-[#8BAE5A] border-[#3A4D23] hover:bg-[#3A4D23]'
                    : 'bg-[#181F17] text-gray-300 border-[#3A4D23] hover:bg-[#232D1A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span>{l.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {completedLessonIds.includes(l.id) && (
                      <span className="text-green-400">✓</span>
                    )}
                    <span className="text-sm opacity-75">{l.duration}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 