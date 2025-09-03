"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import PageLayout from '@/components/PageLayout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EbookDownload from '@/components/EbookDownload';
import { PlayIcon } from '@heroicons/react/24/solid';
import { academyNav } from '@/utils/academyNavigation';

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
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [showForceButton, setShowForceButton] = useState(false);

  // Reset navigating state when navigation completes
  useEffect(() => {
    setNavigating(false);
  }, [moduleId, lessonId]);

  // Reset video state when lesson changes
  useEffect(() => {
    setShowVideoOverlay(true);
    setIsVideoLoading(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [lessonId]);

  // Handle page visibility changes to prevent loading issues when returning from other tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👀 Page became visible, resetting navigation state');
        setNavigating(false);
        setIsVideoLoading(false);
        // Reset any stuck loading states when returning to the page
        if (loading && isDataLoaded) {
          console.log('🔄 Resetting stuck loading state');
          setLoading(false);
        }
      }
    };

    const handlePageFocus = () => {
      console.log('🎯 Page gained focus, ensuring clean state');
      setNavigating(false);
      setIsVideoLoading(false);
    };

    // Add event listeners for page visibility and focus
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handlePageFocus);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handlePageFocus);
    };
  }, [loading, isDataLoaded]);

  // Add a safety timeout to reset stuck navigation states
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let forceButtonTimeoutId: NodeJS.Timeout;
    
    if (navigating) {
      console.log('⏰ Starting navigation timeout (5 seconds)');
      
      // Show force button after 3 seconds
      forceButtonTimeoutId = setTimeout(() => {
        console.log('⚠️ Showing force continue button');
        setShowForceButton(true);
      }, 3000);
      
      // Auto-reset after 5 seconds
      timeoutId = setTimeout(() => {
        console.log('🚨 Navigation timeout reached, resetting states');
        setNavigating(false);
        setIsVideoLoading(false);
        setShowForceButton(false);
        // Force a page refresh if we're still stuck
        if (loading && isDataLoaded) {
          console.log('🔄 Force resetting loading state due to timeout');
          setLoading(false);
        }
      }, 5000); // 5 second timeout
    } else {
      setShowForceButton(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (forceButtonTimeoutId) {
        clearTimeout(forceButtonTimeoutId);
      }
    };
  }, [navigating, loading, isDataLoaded]);

  // Add global click handler to reset states when user interacts with page
  useEffect(() => {
    const handleGlobalClick = () => {
      // Reset states if user clicks anything while stuck
      if (navigating) {
        console.log('🖱️ Global click detected while navigating, resetting states');
        setNavigating(false);
        setIsVideoLoading(false);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [navigating]);

  const videoRef = useRef<HTMLVideoElement>(null);

  // ENHANCED: Debug data fetching with detailed logging
  const fetchData = async () => {
    console.log('🔍 fetchData called with:', { 
      user: !!user, 
      moduleId, 
      lessonId, 
      loading, 
      isDataLoaded, 
      navigating,
      hasLesson: !!lesson,
      lessonIdMatch: lesson?.id === lessonId,
      pageVisibility: document.visibilityState
    });

    if (!user || !moduleId || !lessonId) {
      console.log('❌ Missing required data:', { user: !!user, moduleId, lessonId });
      return;
    }

    // Don't skip fetch anymore - let the useEffect handle this logic
    console.log('📥 Proceeding with fetch - no skipping logic');
    
    // Reset navigation state if we're actually fetching new data
    if (navigating) {
      console.log('🔄 Resetting navigation state before fetch');
      setNavigating(false);
    }

    console.log('🚀 Starting data fetch for:', { moduleId, lessonId });
    console.log('   - Current loading state:', loading);
    console.log('   - Document visibility:', document.visibilityState);
    console.log('   - Page focus:', document.hasFocus());
    
    setLoading(true);
    setError(null);

    try {
      // Fetch module data
      const { data: moduleData, error: moduleError } = await supabase
        .from('academy_modules')
        .select('*')
        .or(`id.eq.${moduleId},slug.eq.${moduleId}`)
        .eq('status', 'published')
        .single();

      if (moduleError || !moduleData) {
        console.error('❌ Module error:', moduleError);
        setError('Module niet gevonden');
        setLoading(false);
        return;
      }

      // Fetch lessons data
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('academy_lessons')
        .select('*')
        .eq('module_id', moduleData.id)
        .eq('status', 'published')
        .order('order_index');

      if (lessonsError || !lessonsData) {
        console.error('❌ Lessons error:', lessonsError);
        setError('Lessen niet gevonden');
        setLoading(false);
        return;
      }

      // Find current lesson
      const currentLesson = lessonsData.find(l => l.id === lessonId);
      if (!currentLesson) {
        console.error('❌ Lesson not found:', { lessonId, availableIds: lessonsData.map(l => l.id) });
        setError('Les niet gevonden');
        setLoading(false);
        return;
      }

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true);

      // Fetch ebook data
      const { data: ebookData } = await supabase
        .from('academy_ebooks')
        .select('id, title, file_url, status')
        .eq('lesson_id', lessonId)
        .eq('status', 'published')
        .single();

      // Update all state
      setModule(moduleData);
      setLessons(lessonsData);
      setLesson(currentLesson);
      setCompleted(progressData?.some(p => p.lesson_id === currentLesson.id) || false);
      setCompletedLessonIds(progressData?.map(p => p.lesson_id) || []);
      setEbook(ebookData);
      setIsDataLoaded(true);

      console.log('✅ Data loaded successfully:', {
        module: moduleData.title,
        lesson: currentLesson.title,
        lessonsCount: lessonsData.length,
        hasEbook: !!ebookData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Fetch error:', error);
      setError('Er is een fout opgetreden bij het laden van de les');
      setIsDataLoaded(false); // Reset on error
    } finally {
      console.log('🏁 Fetch completed, setting loading to false');
      setLoading(false);
    }
  };

  // SUPER SIMPLE: Just fetch data when needed, period.
  useEffect(() => {
    console.log('🔍 Checking if we need to fetch data:', {
      user: !!user,
      moduleId,
      lessonId,
      hasCorrectLesson: lesson?.id === lessonId,
      isDataLoaded,
      loading,
      pageVisible: document.visibilityState === 'visible'
    });

    if (user && moduleId && lessonId) {
      // Always fetch if we don't have the right lesson data
      if (!lesson || lesson.id !== lessonId || !isDataLoaded) {
        console.log('🚀 Need to fetch data, doing it now');
        setIsDataLoaded(false);
        fetchData();
      } else {
        console.log('✅ Already have correct data, no need to fetch');
      }
    }
  }, [user, moduleId, lessonId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting');
      setIsDataLoaded(false);
    };
  }, []);

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

  // Get module number based on order_index
  const getModuleNumber = (orderIndex: number) => {
    return orderIndex.toString().padStart(2, '0');
  };

  // Force continue function with multiple strategies
  const handleForceContinue = () => {
    console.log('🚀 Force continue triggered - trying multiple strategies');
    
    // Strategy 1: Reset all states
    setNavigating(false);
    setLoading(false);
    setIsVideoLoading(false);
    setShowForceButton(false);
    setIsDataLoaded(false);
    setError(null);
    
    // Strategy 2: Clear any cached data
    setModule(null);
    setLesson(null);
    setLessons([]);
    setEbook(null);
    
    // Strategy 3: Force a new fetch
    setTimeout(() => {
      console.log('🔄 Force fetching new data');
      if (user && moduleId && lessonId) {
        fetchData();
      } else {
        console.log('🚨 Missing data for fetch, refreshing page');
        window.location.reload();
      }
    }, 100);
  };

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
            
            {/* Debug info and force continue button */}
            <div className="mt-6 space-y-3">
              {/* Debug info */}
              <details className="text-left bg-gray-800 p-4 rounded-lg text-xs">
                <summary className="cursor-pointer text-yellow-400">🔍 Debug Info (klik om uit te klappen)</summary>
                <div className="mt-2 space-y-1 text-gray-300">
                  <div>User: {user ? '✅' : '❌'}</div>
                  <div>Module ID: {moduleId || 'undefined'}</div>
                  <div>Lesson ID: {lessonId || 'undefined'}</div>
                  <div>Loading: {loading ? '✅' : '❌'}</div>
                  <div>Data Loaded: {isDataLoaded ? '✅' : '❌'}</div>
                  <div>Navigating: {navigating ? '✅' : '❌'}</div>
                  <div>Has Lesson: {lesson ? '✅' : '❌'}</div>
                  <div>Lesson Match: {lesson?.id === lessonId ? '✅' : '❌'}</div>
                  <div>Page Visible: {document.visibilityState}</div>
                  <div>Page Focus: {document.hasFocus() ? '✅' : '❌'}</div>
                </div>
              </details>
              
              {/* Force continue button */}
              {showForceButton && (
                <div>
                  <p className="text-yellow-400 text-sm mb-3">Laden duurt langer dan verwacht...</p>
                  <button
                    onClick={handleForceContinue}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    🔄 Forceer doorgaan
                  </button>
                </div>
              )}
              
              {/* Manual refresh button - always available */}
              <div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🔄 Pagina verversen
                </button>
              </div>
            </div>
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
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={lesson.title}
      subtitle={`Module ${getModuleNumber(module.order_index)}: ${module.title}`}
    >
      <div className="w-full">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              console.log('🔄 Navigating to module overview...');
              setNavigating(true);
              router.push(`/dashboard/academy/${module.id}`);
            }}
            disabled={navigating}
            className="flex items-center gap-2 text-[#8BAE5A] hover:text-[#B6C948] transition-colors disabled:opacity-50"
          >
            {navigating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
            ) : (
              "←"
            )}
            Terug naar module overzicht
          </button>
          
          <div className="flex items-center gap-4">
            {prevLesson && (
              <button
                onClick={() => {
                  console.log('🔄 Navigating to previous lesson...');
                  // If already navigating, force reset and continue
                  if (navigating) {
                    console.log('⚠️ Already navigating, forcing reset...');
                    setNavigating(false);
                    setLoading(false);
                    setIsDataLoaded(false);
                  }
                  
                  // Reset any stuck states before navigation
                  setIsVideoLoading(false);
                  setShowVideoOverlay(true);
                  setNavigating(true);
                  
                  // Use a small delay to ensure state updates
                  setTimeout(() => {
                    router.push(`/dashboard/academy/${module.id}/${prevLesson.id}`);
                  }, 50);
                }}
                disabled={navigating}
                className="px-4 py-2 bg-[#232D1A] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {navigating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
                ) : null}
                Vorige les
              </button>
            )}
            
            {nextLesson && (
              <button
                onClick={() => {
                  console.log('🔄 Navigating to next lesson...');
                  // If already navigating, force reset and continue
                  if (navigating) {
                    console.log('⚠️ Already navigating, forcing reset...');
                    setNavigating(false);
                    setLoading(false);
                    setIsDataLoaded(false);
                  }
                  
                  // Reset any stuck states before navigation
                  setIsVideoLoading(false);
                  setShowVideoOverlay(true);
                  setNavigating(true);
                  
                  // Use a small delay to ensure state updates
                  setTimeout(() => {
                    router.push(`/dashboard/academy/${module.id}/${nextLesson.id}`);
                  }, 50);
                }}
                disabled={navigating}
                className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {navigating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17]"></div>
                ) : null}
                Volgende les
              </button>
            )}
          </div>
        </div>

        {/* Custom Navigation with Hard Refresh */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <button
            onClick={() => {
              console.log('🔄 Navigating to academy...');
              setNavigating(true);
              router.push('/dashboard/academy');
            }}
            disabled={navigating}
            className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors disabled:opacity-50"
          >
            Academy
          </button>
          <span className="text-gray-400">/</span>
          <button
            onClick={() => {
              console.log('🔄 Navigating to module...');
              setNavigating(true);
              router.push(`/dashboard/academy/${module.id}`);
            }}
            disabled={navigating}
            className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors disabled:opacity-50"
          >
            Module {getModuleNumber(module.order_index)}: {module.title}
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-300">{lesson.title}</span>
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
                  key={lesson.id} // Unieke key om video te behouden bij les wissel
                  ref={videoRef}
                  src={lesson.video_url}
                  controls
                  className="w-full h-full rounded-lg bg-black"
                  preload="metadata"
                  onError={(e) => {
                    console.error('❌ Video error:', e);
                    console.log('🎥 Video URL:', lesson.video_url);
                    // Toon een fallback bericht
                    setShowVideoOverlay(true);
                  }}
                  onLoadStart={() => {
                    console.log('🎥 Loading video:', lesson.video_url);
                    setIsVideoLoading(true);
                  }}
                  onCanPlay={() => {
                    console.log('🎥 Video can start playing');
                    setIsVideoLoading(false);
                  }}
                  onPlay={() => {
                    setShowVideoOverlay(false);
                    setIsVideoLoading(false);
                  }}
                  onPause={() => {
                    setShowVideoOverlay(true);
                  }}
                  onEnded={() => {
                    setShowVideoOverlay(true);
                  }}
                  onAbort={() => {
                    console.log('🎥 Video loading aborted');
                    setShowVideoOverlay(true);
                    setIsVideoLoading(false);
                  }}
                  onSuspend={() => {
                    console.log('🎥 Video loading suspended');
                    setIsVideoLoading(false);
                  }}
                >
                  Je browser ondersteunt deze video niet.
                </video>
                
                {/* Video Play Overlay */}
                {showVideoOverlay && (
                  <div 
                    className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer group"
                    onClick={() => {
                      if (videoRef.current && !isVideoLoading) {
                        try {
                          setIsVideoLoading(true);
                          const playPromise = videoRef.current.play();
                          if (playPromise !== undefined) {
                            playPromise
                              .then(() => {
                                console.log('🎥 Video started playing successfully');
                                setShowVideoOverlay(false);
                                setIsVideoLoading(false);
                              })
                              .catch((error) => {
                                console.error('❌ Video play error:', error);
                                setIsVideoLoading(false);
                                // Fallback: probeer opnieuw na een korte vertraging
                                setTimeout(() => {
                                  if (videoRef.current) {
                                    setIsVideoLoading(true);
                                    videoRef.current.play()
                                      .then(() => {
                                        setShowVideoOverlay(false);
                                        setIsVideoLoading(false);
                                      })
                                      .catch(e => {
                                        console.error('❌ Retry video play failed:', e);
                                        setIsVideoLoading(false);
                                      });
                                  }
                                }, 100);
                              });
                          }
                        } catch (error) {
                          console.error('❌ Video play error:', error);
                          setIsVideoLoading(false);
                        }
                      }
                    }}
                  >
                    <div className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#181F17] rounded-full p-4 transition-all duration-200 group-hover:scale-110 shadow-lg">
                      {isVideoLoading ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#181F17]"></div>
                      ) : (
                        <PlayIcon className="w-12 h-12" />
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <p className="text-white text-sm font-medium">
                        {isVideoLoading ? 'Video laden...' : 'Klik om video af te spelen'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Video Error Fallback */}
                {!showVideoOverlay && videoRef.current?.error && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="text-center text-white p-6">
                      <div className="text-red-400 mb-2 text-lg">❌ Video kan niet worden afgespeeld</div>
                      <p className="text-sm mb-4">Er is een probleem met het laden van de video</p>
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.load();
                            setShowVideoOverlay(true);
                          }
                        }}
                        className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors"
                      >
                        Opnieuw proberen
                      </button>
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

        {/* Ebook Download Section */}
        <div className="mt-8">
          <EbookDownload
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            moduleTitle={module.title}
            moduleNumber={module.order_index.toString()}
            ebookData={ebook}
            isCompleted={completed}
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-8">
          {prevLesson ? (
            <button
              onClick={() => {
                console.log('🔄 Navigating to previous lesson...');
                // Reset any stuck states before navigation
                setIsVideoLoading(false);
                setShowVideoOverlay(true);
                setNavigating(true);
                
                // Use a small delay to ensure state updates
                setTimeout(() => {
                  router.push(`/dashboard/academy/${module.id}/${prevLesson.id}`);
                }, 50);
              }}
              disabled={navigating}
              className="px-6 py-3 bg-[#232D1A] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {navigating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
              ) : (
                "←"
              )}
              Vorige les: {prevLesson.title}
            </button>
          ) : (
            <div></div>
          )}
          
          {nextLesson ? (
            <button
              onClick={() => {
                console.log('🔄 Navigating to next lesson...');
                // Reset any stuck states before navigation
                setIsVideoLoading(false);
                setShowVideoOverlay(true);
                setNavigating(true);
                
                // Use a small delay to ensure state updates
                setTimeout(() => {
                  router.push(`/dashboard/academy/${module.id}/${nextLesson.id}`);
                }, 50);
              }}
              disabled={navigating}
              className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              Volgende les: {nextLesson.title}
              {navigating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17]"></div>
              ) : (
                "→"
              )}
            </button>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      {/* Lesson list */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Lessen in deze module</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {lessons.map((l, index) => (
              <button
                key={l.id}
                onClick={() => {
                  if (l.id !== lessonId) {
                    console.log('🔄 Navigating to lesson...');
                    // Reset any stuck states before navigation
                    setIsVideoLoading(false);
                    setShowVideoOverlay(true);
                    setNavigating(true);
                    
                    // Use a small delay to ensure state updates
                    setTimeout(() => {
                      router.push(`/dashboard/academy/${module.id}/${l.id}`);
                    }, 50);
                  }
                }}
                disabled={l.id === lessonId || navigating}
                className={`block w-full text-left p-4 rounded-lg border transition-colors ${
                  l.id === lessonId
                    ? 'bg-[#8BAE5A] text-[#181F17] border-[#8BAE5A] cursor-default'
                    : completedLessonIds.includes(l.id)
                    ? 'bg-[#232D1A] text-[#8BAE5A] border-[#3A4D23] hover:bg-[#3A4D23] cursor-pointer'
                    : 'bg-[#181F17] text-gray-300 border-[#3A4D23] hover:bg-[#232D1A] cursor-pointer'
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
              </button>
            ))}
          </div>
        </div>
        
        {/* Emergency navigation reset button */}
        {navigating && showForceButton && (
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={handleForceContinue}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg border border-red-500 flex items-center gap-2"
              title="Klik hier als de pagina vast blijft laden"
            >
              <span className="text-xl">🚨</span>
              Reset Navigatie
            </button>
          </div>
        )}
    </PageLayout>
  );
} 