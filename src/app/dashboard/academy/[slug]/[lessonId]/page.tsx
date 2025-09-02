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



  // OPTIMIZED: Parallel data fetching with caching
  const fetchData = async () => {
    if (!user || !moduleId || !lessonId) {
      console.log('Missing data:', { user: !!user, moduleId, lessonId });
      return;
    }

    // Prevent refetching if data is already loaded
    if (isDataLoaded) {
      console.log('Data already loaded, skipping fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Fetching lesson data in parallel for:', { moduleId, lessonId });

      // OPTIMIZED: Fetch all data in parallel with optimized queries
      const [moduleResult, lessonsResult, progressResult, ebookResult] = await Promise.allSettled([
        // Fetch module with optimized query
        supabase
          .from('academy_modules')
          .select('*')
          .or(`id.eq.${moduleId},slug.eq.${moduleId}`)
          .eq('status', 'published')
          .single(),
        
        // Fetch lessons with optimized query using new indexes
        supabase
          .from('academy_lessons')
          .select('*')
          .eq('module_id', moduleId)
          .eq('status', 'published')
          .order('order_index'),
        
        // Fetch progress with optimized query using new indexes
        supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('completed', true),
        
        // Fetch ebook with optimized query
        supabase
          .from('academy_ebooks')
          .select('id, title, file_url, status')
          .eq('lesson_id', lessonId)
          .eq('status', 'published')
          .single()
      ]);

      // Process module result
      let moduleData: Module | null = null;
      if (moduleResult.status === 'fulfilled' && !moduleResult.value.error) {
        moduleData = moduleResult.value.data;
        console.log('✅ Module loaded:', moduleData?.title);
      } else {
        console.error('❌ Module error:', moduleResult.status === 'rejected' ? moduleResult.reason : moduleResult.value?.error);
        setError('Module niet gevonden');
        return;
      }

      // Process lessons result
      let lessonsData: Lesson[] = [];
      if (lessonsResult.status === 'fulfilled' && !lessonsResult.value.error) {
        lessonsData = lessonsResult.value.data || [];
        console.log('✅ Lessons loaded:', lessonsData.length);
      } else {
        console.error('❌ Lessons error:', lessonsResult.status === 'rejected' ? lessonsResult.reason : lessonsResult.value?.error);
        setError('Lessen niet gevonden');
        return;
      }

      // Process progress result
      let progressData: any[] = [];
      if (progressResult.status === 'fulfilled' && !progressResult.value.error) {
        progressData = progressResult.value.data || [];
        console.log('✅ Progress loaded:', progressData.length);
      } else {
        console.warn('⚠️ Progress warning:', progressResult.status === 'rejected' ? progressResult.reason : progressResult.value?.error);
      }

      // Find current lesson using optimized lookup
      let currentLesson = lessonsData.find(l => l.id === lessonId || (l as any).slug === lessonId);
      if (!currentLesson) {
        console.error('❌ Lesson not found:', { lessonId, availableIds: lessonsData.map(l => l.id) });
        setError('Les niet gevonden');
        return;
      }

      // Check completion with optimized lookup
      const isCompleted = progressData.some(p => p.lesson_id === currentLesson.id);
      const completedIds = progressData.map(p => p.lesson_id);

      // Process ebook result
      let ebookData: any = null;
      if (ebookResult.status === 'fulfilled' && !ebookResult.value.error) {
        ebookData = ebookResult.value.data;
        console.log('✅ Ebook loaded');
      } else if (ebookResult.status === 'rejected' || (ebookResult.value?.error && ebookResult.value.error.code !== 'PGRST116')) {
        console.warn('⚠️ Ebook warning:', ebookResult.status === 'rejected' ? ebookResult.reason : ebookResult.value?.error);
      }

      // Update state
      setModule(moduleData);
      setLessons(lessonsData);
      setLesson(currentLesson);
      setCompleted(isCompleted);
      setCompletedLessonIds(completedIds);
      setEbook(ebookData);
      setIsDataLoaded(true);

      console.log('🚀 Data loaded successfully in parallel');

    } catch (error) {
      console.error('❌ Error:', error);
      setError('Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if not already loaded and all required data is present
    if (!isDataLoaded && user && moduleId && lessonId) {
      fetchData();
    }
  }, [moduleId, lessonId]); // Removed 'user' dependency to prevent unnecessary reloads

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

  // OPTIMIZED: Smart prefetching for next lesson
  useEffect(() => {
    if (nextLesson && user) {
      console.log('🚀 Prefetching next lesson:', nextLesson.title);
      
      // Prefetch next lesson data in background
      const prefetchNextLesson = async () => {
        try {
          await Promise.allSettled([
            // Prefetch next lesson basic data
            supabase
              .from('academy_lessons')
              .select('id, title, description, duration, type, video_url, content')
              .eq('id', nextLesson.id)
              .single(),
            
            // Prefetch next lesson progress
            supabase
              .from('user_lesson_progress')
              .select('completed')
              .eq('user_id', user.id)
              .eq('lesson_id', nextLesson.id)
              .single(),
            
            // Prefetch next lesson ebook
            supabase
              .from('academy_ebooks')
              .select('id, title, file_url')
              .eq('lesson_id', nextLesson.id)
              .eq('status', 'published')
              .single()
          ]);
          
          console.log('✅ Next lesson prefetched successfully');
        } catch (error) {
          console.warn('⚠️ Next lesson prefetch warning:', error);
        }
      };
      
      // Start prefetching after current lesson is loaded
      const prefetchTimer = setTimeout(prefetchNextLesson, 1000);
      
      return () => clearTimeout(prefetchTimer);
    }
  }, [nextLesson, user]);

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

  // Get module number based on order_index
  const getModuleNumber = (orderIndex: number) => {
    return orderIndex.toString().padStart(2, '0');
  };

  return (
    <PageLayout 
      title={lesson.title}
      subtitle={`Module ${getModuleNumber(module.order_index)}: ${module.title}`}
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
              { label: `Module ${getModuleNumber(module.order_index)}: ${module.title}`, href: `/dashboard/academy/${module.id}` },
              { label: lesson.title, isCurrent: true }
            ]}
          />
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
              <div className="aspect-video bg-[#232D1A] rounded-lg overflow-hidden relative border border-[#3A4D23]">
                <video
                  ref={videoRef}
                  src={lesson.video_url}
                  controls
                  className="w-full h-full rounded-lg bg-black"
                  preload="metadata"
                  onError={(e) => {
                    console.error('❌ Video error:', e);
                    console.log('🎥 Video URL:', lesson.video_url);
                  }}
                  onLoadStart={() => {
                    console.log('🎥 Loading video:', lesson.video_url);
                  }}
                  onCanPlay={() => {
                    console.log('🎥 Video can start playing');
                  }}
                  onPlay={() => {
                    setShowVideoOverlay(false);
                  }}
                >
                  Je browser ondersteunt deze video niet.
                </video>
                
                {/* Video Play Overlay */}
                {showVideoOverlay && (
                  <div 
                    className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer group"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.play();
                      }
                    }}
                  >
                    <div className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#181F17] rounded-full p-4 transition-all duration-200 group-hover:scale-110 shadow-lg">
                      <PlayIcon className="w-12 h-12" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <p className="text-white text-sm font-medium">Klik om video af te spelen</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
         

          {/* Text content */}
          {lesson.content && (
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold text-[#8BAE5A] mb-4 mt-6">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-bold text-[#8BAE5A] mb-3 mt-5">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2 mt-4">{children}</h3>,
                    p: ({children}) => <p className="mb-3 text-gray-300 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-300">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-300">{children}</ol>,
                    li: ({children, ...props}: any) => {
                      if (props.checked !== null && props.checked !== undefined) {
                        return (
                          <li className="flex items-center gap-2 text-gray-300">
                            <input 
                              type="checkbox" 
                              checked={props.checked} 
                              readOnly 
                              className="w-4 h-4 text-[#8BAE5A] bg-[#232D1A] border-[#3A4D23] rounded focus:ring-[#8BAE5A] focus:ring-2"
                            />
                            <span>{children}</span>
                          </li>
                        );
                      }
                      return <li className="text-gray-300">{children}</li>;
                    },
                    strong: ({children}) => <strong className="font-semibold text-[#B6C948]">{children}</strong>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-[#8BAE5A] pl-4 italic text-[#8BAE5A] mb-4">{children}</blockquote>,
                  }}
                >
                  {lesson.content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Ebook Download */}
        {ebook && (
          <EbookDownload
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            moduleTitle={module.title}
            moduleNumber={getModuleNumber(module.order_index)}
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
        <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Lessen in deze module</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
    </PageLayout>
  );
} 