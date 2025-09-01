"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import PageLayout from '@/components/PageLayout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Breadcrumb, { createBreadcrumbs } from '@/components/Breadcrumb';
import EbookDownload from '@/components/EbookDownload';
import { PlayIcon } from '@heroicons/react/24/solid';

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
  const { user } = useSupabaseAuth();
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
  const [ebook, setEbook] = useState<any>(null);
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle page visibility changes to prevent state corruption
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page is visible again, check if we need to refresh data
        if (!isDataLoaded && !loading) {
          console.log('Page became visible, refreshing data...');
          fetchData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDataLoaded, loading]);

  // Simplified data fetching
  const fetchData = async () => {
    if (!user || !moduleId || !lessonId) {
      console.log('Missing data:', { user: !!user, moduleId, lessonId });
      return;
    }

    setLoading(true);
    setError(null);

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

      // Fetch ebook for this lesson
      const { data: ebookData, error: ebookError } = await supabase
        .from('academy_ebooks')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('status', 'published')
        .single();

      if (ebookError && ebookError.code !== 'PGRST116') {
        console.error('Ebook error:', ebookError);
      }

      // Update state
      setModule(moduleData);
      setLessons(lessonsData || []);
      setLesson(currentLesson);
      setCompleted(isCompleted);
      setCompletedLessonIds(completedIds);
      setEbook(ebookData);
      setIsDataLoaded(true);

      console.log('Data loaded successfully');

    } catch (error) {
      console.error('Error:', error);
      setError('Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        
        // Check for Academy completion after lesson is completed
        setTimeout(async () => {
          try {
            const response = await fetch('/api/badges/check-academy-completion', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const data = await response.json();

            if (response.ok && data.completed && data.newlyUnlocked) {
              // Show badge unlock modal
              const badgeData = {
                name: data.badge.title,
                icon: data.badge.icon_name,
                description: data.badge.description
              };
              
              // Store badge data in localStorage to show modal on next page load
              localStorage.setItem('academyBadgeUnlock', JSON.stringify(badgeData));
              
              // Show success message
              alert('🎉 Gefeliciteerd! Je hebt de Academy Master badge ontgrendeld!');
            }
          } catch (error) {
            console.error('Error checking academy completion:', error);
          }
        }, 1000);
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
          <button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold mr-4"
          >
            Opnieuw proberen
          </button>
          <Link
            href="/dashboard/academy"
            className="px-6 py-3 bg-[#232D1A] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors font-semibold"
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
      <div className="w-full">
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

        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: 'Academy', href: '/dashboard/academy' },
              { label: module.title, href: `/dashboard/academy/${module.id}` },
              { label: lesson.title, isCurrent: true }
            ]}
          />
        </div>

        {/* Lesson content */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
          {/* Video section */}
          {lesson.video_url && (
            <div className="mb-6">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  controls
                  preload="metadata"
                  poster={lesson.video_url.replace('.mp4', '.jpg')}
                >
                  <source src={lesson.video_url} type="video/mp4" />
                  Je browser ondersteunt geen video afspelen.
                </video>
              </div>
            </div>
          )}

          {/* Lesson description */}
          {lesson.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Over deze les</h2>
              <p className="text-gray-700 leading-relaxed">{lesson.description}</p>
            </div>
          )}

          {/* Lesson content */}
          {lesson.content && (
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-bold text-gray-900 mb-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-bold text-gray-900 mb-2">{children}</h3>,
                  p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                  ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">{children}</ol>,
                  li: ({children}) => <li className="text-gray-700">{children}</li>,
                  a: ({href, children}) => <a href={href} className="text-[#8BAE5A] hover:text-[#B6C948] underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                  code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">{children}</code>,
                  pre: ({children}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-[#8BAE5A] pl-4 italic text-[#8BAE5A] mb-4">{children}</blockquote>,
                }}
              >
                {lesson.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Ebook Download */}
        {ebook && (
          <EbookDownload
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            moduleTitle={module.title}
            ebookUrl={ebook.file_url}
            isCompleted={completed}
          />
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
        <h3 className="text-xl font-semibold text-white mb-4">Alle lessen in deze module</h3>
        <div className="space-y-2">
          {lessons.map((lessonItem, index) => {
            const isCurrent = lessonItem.id === lessonId;
            const isCompleted = completedLessonIds.includes(lessonItem.id);
            const isAccessible = index === 0 || completedLessonIds.includes(lessons[index - 1]?.id);

            return (
              <Link
                key={lessonItem.id}
                href={`/dashboard/academy/${module.id}/${lessonItem.id}`}
                className={`block p-4 rounded-lg border transition-colors ${
                  isCurrent
                    ? 'bg-[#8BAE5A] text-[#181F17] border-[#8BAE5A]'
                    : isCompleted
                    ? 'bg-[#3A4D23] text-[#B6C948] border-[#3A4D23] hover:bg-[#4A5D33]'
                    : isAccessible
                    ? 'bg-[#232D1A] text-[#8BAE5A] border-[#3A4D23] hover:bg-[#3A4D23]'
                    : 'bg-[#1A2115] text-gray-500 border-[#2A2A2A] cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-6 h-6 bg-[#B6C948] rounded-full flex items-center justify-center">
                          <span className="text-[#181F17] text-xs font-bold">✓</span>
                        </div>
                      ) : isAccessible ? (
                        <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                          <PlayIcon className="w-3 h-3 text-[#181F17]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">🔒</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{lessonItem.title}</div>
                      <div className="text-sm opacity-75">{lessonItem.duration}</div>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-sm font-medium">Huidige les</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
} 