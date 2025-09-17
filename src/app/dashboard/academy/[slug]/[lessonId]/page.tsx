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
  exam_questions?: ExamQuestion[];
}

interface ExamQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

// Exam Component
function ExamComponent({ 
  questions, 
  lessonId, 
  userId,
  onCompletion 
}: { 
  questions: ExamQuestion[];
  lessonId: string;
  userId?: string;
  onCompletion: (passed: boolean) => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const correctAnswers = answers.filter((answer, index) => 
    answer === questions[index].correct_answer
  ).length;
  
  const totalQuestions = questions.length;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = scorePercentage >= 70; // 7/10 requirement
  const allAnswered = !answers.includes(null);

  const handleSubmit = async () => {
    if (!allAnswered || !userId) return;
    
    setIsSubmitting(true);
    try {
      // Save exam result (create table if needed)
      const { error } = await supabase
        .from('user_exam_results')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          answers: answers,
          score: correctAnswers,
          total_questions: totalQuestions,
          passed: passed,
          submitted_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving exam result:', error);
      }

      setSubmitted(true);
      setShowResults(true);
      onCompletion(passed);
    } catch (error) {
      console.error('Error submitting exam:', error);
      // Still show results even if saving fails
      setSubmitted(true);
      setShowResults(true);
      onCompletion(passed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers(Array(questions.length).fill(null));
    setSubmitted(false);
    setShowResults(false);
  };

  return (
    <div className="mt-8 bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#8BAE5A]">Examen: Test je kennis</h3>
        <div className="text-sm text-gray-400">
          Slagingseis: 7/10 (70%)
        </div>
      </div>

      <div className="mb-6 text-gray-300">
        <p className="mb-2">📝 Je hebt {totalQuestions} vragen die je kennis testen.</p>
        <p className="mb-2">🎯 Je moet minimaal 7 van de 10 vragen goed hebben om te slagen.</p>
        <p className="mb-4">⏰ Je hebt onbeperkt tijd en kunt het examen opnieuw maken.</p>
      </div>

      {!showResults ? (
        <>
          {questions.map((question, index) => (
            <div key={index} className="mb-6 p-4 bg-[#232D1A] rounded-lg border border-[#3A4D23]">
              <h4 className="text-lg font-semibold text-white mb-4">
                {index + 1}. {question.question}
              </h4>
              
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      answers[index] === optionIndex
                        ? 'bg-[#8BAE5A] text-[#181F17] border-[#8BAE5A]'
                        : 'bg-[#181F17] text-gray-300 border-[#3A4D23] hover:bg-[#8BAE5A]/20'
                    } border`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optionIndex}
                      checked={answers[index] === optionIndex}
                      onChange={() => {
                        if (!submitted) {
                          const newAnswers = [...answers];
                          newAnswers[index] = optionIndex;
                          setAnswers(newAnswers);
                        }
                      }}
                      disabled={submitted}
                      className="mr-3 w-4 h-4 text-[#8BAE5A] bg-[#232D1A] border-[#3A4D23] focus:ring-[#8BAE5A] focus:ring-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-8">
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                allAnswered && !isSubmitting
                  ? 'bg-[#8BAE5A] text-[#181F17] hover:bg-[#B6C948]'
                  : 'bg-[#3A4D23] text-[#8BAE5A]/50 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17]"></div>
                  Examen indienen...
                </div>
              ) : (
                'Examen indienen'
              )}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-400">
            Beantwoord: {answers.filter(a => a !== null).length}/{totalQuestions} vragen
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className={`p-8 rounded-2xl border-2 mb-8 ${
            passed 
              ? 'bg-green-900/30 border-green-500/50' 
              : 'bg-red-900/30 border-red-500/50'
          }`}>
            <div className={`text-8xl mb-4 ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {passed ? '🎉' : '😞'}
            </div>
            
            <h4 className={`text-3xl font-bold mb-6 ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {passed ? '✅ GESLAAGD!' : '❌ NIET GESLAAGD'}
            </h4>
            
            <div className="mb-6">
              <div className={`text-5xl font-black mb-4 ${passed ? 'text-green-400' : 'text-red-400'}`}>
                {correctAnswers}/{totalQuestions}
              </div>
              <div className={`text-2xl font-bold mb-4 ${passed ? 'text-green-300' : 'text-red-300'}`}>
                ({scorePercentage}%)
              </div>
              <div className="text-lg text-gray-300 max-w-md mx-auto">
                {passed 
                  ? '🎯 Uitstekend! Je hebt het examen succesvol afgerond met meer dan 70% goed!' 
                  : '📚 Je hebt minimaal 7 van de 10 vragen (70%) correct nodig om te slagen. Probeer het nog een keer!'}
              </div>
            </div>
            
            <div className="flex justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span>{correctAnswers} correct</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">❌</span>
                <span>{totalQuestions - correctAnswers} fout</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8BAE5A]">🎯</span>
                <span>Minimaal: 7/10</span>
              </div>
            </div>
          </div>

          {/* Show answers with explanations */}
          <div className="mt-8 text-left">
            <h5 className="text-xl font-bold text-[#8BAE5A] mb-6 text-center">📋 Gedetailleerde uitslag per vraag</h5>
            <div className="grid gap-4">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correct_answer;
                
                return (
                  <div key={index} className={`p-5 rounded-xl border-2 ${
                    isCorrect 
                      ? 'bg-green-900/20 border-green-500/30' 
                      : 'bg-red-900/20 border-red-500/30'
                  }`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`text-3xl ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? '✅' : '❌'}
                      </div>
                      <div className="flex-1">
                        <h6 className="text-lg font-bold text-white mb-3">
                          Vraag {index + 1}: {question.question}
                        </h6>
                        
                        <div className="space-y-3">
                          <div className={`p-3 rounded-lg ${
                            isCorrect ? 'bg-green-800/30' : 'bg-red-800/30'
                          }`}>
                            <span className="font-semibold text-white">Jouw antwoord: </span>
                            <span className={isCorrect ? 'text-green-300' : 'text-red-300'}>
                              {question.options[userAnswer || 0]}
                            </span>
                          </div>
                          
                          {!isCorrect && (
                            <div className="p-3 rounded-lg bg-green-800/30">
                              <span className="font-semibold text-white">Juiste antwoord: </span>
                              <span className="text-green-300">
                                {question.options[question.correct_answer]}
                              </span>
                            </div>
                          )}
                          
                          <div className="p-4 bg-[#181F17] rounded-lg border border-[#3A4D23]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[#8BAE5A] text-lg">💡</span>
                              <span className="font-semibold text-[#8BAE5A]">Uitleg:</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            {passed ? (
              <div className="text-center">
                <div className="mb-4 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                  <p className="text-green-300 font-semibold">
                    🎓 Examen voltooid! Je kunt nu verder naar de volgende module.
                  </p>
                </div>
                <button
                  onClick={handleRetake}
                  className="px-4 py-2 bg-[#232D1A] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] font-medium transition-colors border border-[#3A4D23]"
                >
                  🔄 Examen opnieuw maken (optioneel)
                </button>
              </div>
            ) : (
              <button
                onClick={handleRetake}
                className="px-8 py-4 bg-[#8BAE5A] text-[#181F17] rounded-xl hover:bg-[#B6C948] font-bold transition-colors text-lg"
              >
                🔄 Examen opnieuw maken
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        console.log('👀 Page became visible, resetting stuck states');
        setNavigating(false);
        setIsVideoLoading(false);
        setShowForceButton(false);
        
        // Only reset loading if we have data but are stuck loading
        if (loading && lesson && lesson.id === lessonId) {
          console.log('🔄 Resetting stuck loading state - we have the right data');
          setLoading(false);
        }
      }
    };

    const handlePageFocus = () => {
      console.log('🎯 Page gained focus, ensuring clean state');
      setNavigating(false);
      setIsVideoLoading(false);
      setShowForceButton(false);
      
      // Reset loading if we're stuck but have the right data
      if (loading && lesson && lesson.id === lessonId) {
        console.log('🔄 Page focus: resetting stuck loading with correct data');
        setLoading(false);
      }
    };

    // Add event listeners for page visibility and focus
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handlePageFocus);
    }

    // Cleanup
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handlePageFocus);
      }
    };
  }, [loading, lesson, lessonId]); // Added lesson and lessonId to dependencies

  // Additional handler for when user returns from ebook tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('📖 User navigating away (possibly to ebook), resetting states');
      setNavigating(false);
      setIsVideoLoading(false);
      setShowForceButton(false);
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('📖 User returned from ebook tab, ensuring clean state');
        setNavigating(false);
        setIsVideoLoading(false);
        setShowForceButton(false);
        
        // Reset loading if we have data but are stuck loading
        if (loading && lesson && lesson.id === lessonId) {
          console.log('🔄 Page show: resetting stuck loading with correct data');
          setLoading(false);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pageshow', handlePageShow);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pageshow', handlePageShow);
      }
    };
  }, [loading, lesson, lessonId]);

  // CRITICAL: Safety mechanism to prevent stuck loading states
  useEffect(() => {
    if (loading) {
      // Shorter timeout for quicker recovery
      const timeoutId = setTimeout(() => {
        console.log('⚠️ Loading timeout reached (5s), forcing reset');
        if (lesson && lesson.id === lessonId) {
          console.log('🔄 FORCE: We have correct data, resetting loading state');
          setLoading(false);
          setIsDataLoaded(true);
        } else {
          console.log('🔄 FORCE: No correct data, retrying fetch');
          fetchData();
        }
      }, 5000); // Reduced from 10s to 5s

      return () => clearTimeout(timeoutId);
    }
  }, [loading, lesson, lessonId]);

  // CRITICAL: Emergency reset when user returns from external tab
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // This fires when user returns from back/forward or external tab
      if (event.persisted || performance.navigation?.type === 2) {
        console.log('🚨 EMERGENCY: Page show event detected - user returned from external source');
        if (loading) {
          console.log('🔄 EMERGENCY: Force resetting all stuck states');
          setLoading(false);
          setNavigating(false);
          setIsVideoLoading(false);
          setShowForceButton(false);
          
          // If we have correct data, mark as loaded
          if (lesson && lesson.id === lessonId) {
            setIsDataLoaded(true);
          }
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', handlePageShow);
      return () => window.removeEventListener('pageshow', handlePageShow);
    }
  }, [loading, lesson, lessonId]);

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
      if (navigating || (loading && isDataLoaded)) {
        console.log('🖱️ Global click detected while stuck, resetting states');
        setNavigating(false);
        setIsVideoLoading(false);
        setShowForceButton(false);
        
        // If we have data but are stuck loading, reset
        if (loading && lesson && lesson.id === lessonId) {
          console.log('🔄 Global click: Force resetting stuck loading');
          setLoading(false);
        }
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleGlobalClick);
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', handleGlobalClick);
      }
    };
  }, [navigating, loading, lesson, lessonId, isDataLoaded]);

  // CRITICAL: Emergency force button for stuck states
  const handleEmergencyReset = () => {
    console.log('🚨 EMERGENCY RESET: User manually triggered');
    setLoading(false);
    setNavigating(false);
    setIsVideoLoading(false);
    setShowForceButton(false);
    setError(null);
    
    if (lesson && lesson.id === lessonId) {
      setIsDataLoaded(true);
      console.log('✅ Emergency reset complete - data preserved');
    } else {
      console.log('🔄 Emergency reset - fetching fresh data');
      fetchData();
    }
  };

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
      pageVisibility: typeof document !== 'undefined' ? document.visibilityState : 'server'
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
    console.log('   - Document visibility:', typeof document !== 'undefined' ? document.visibilityState : 'server');
    console.log('   - Page focus:', typeof document !== 'undefined' ? document.hasFocus() : 'server');
    
    setLoading(true);
    setError(null);

    try {
      // Fetch module data
      console.log('🔍 Fetching module data for:', moduleId);
      const { data: moduleData, error: moduleError } = await supabase
        .from('academy_modules')
        .select('*')
        .or(`id.eq.${moduleId},slug.eq.${moduleId}`)
        .eq('status', 'published')
        .single();

      console.log('📦 Module query result:', { moduleData, moduleError });

      if (moduleError || !moduleData) {
        console.error('❌ Module error:', moduleError);
        setError('Module niet gevonden');
        setLoading(false);
        return;
      }

      console.log('✅ Module data found:', moduleData.title);

      // Fetch lessons data
      console.log('🔍 Fetching lessons for module ID:', moduleData.id);
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('academy_lessons')
        .select('*')
        .eq('module_id', moduleData.id)
        .eq('status', 'published')
        .order('order_index');

      console.log('📚 Lessons query result:', { lessonsCount: lessonsData?.length, lessonsError });

      if (lessonsError || !lessonsData) {
        console.error('❌ Lessons error:', lessonsError);
        setError('Lessen niet gevonden');
        setLoading(false);
        return;
      }

      console.log('✅ Lessons found:', lessonsData.length);

      // Find current lesson
      console.log('🔍 Looking for lesson ID:', lessonId);
      console.log('📝 Available lesson IDs:', lessonsData.map(l => ({ id: l.id, title: l.title })));
      
      const currentLesson = lessonsData.find(l => l.id === lessonId);
      if (!currentLesson) {
        console.error('❌ Lesson not found:', { lessonId, availableIds: lessonsData.map(l => l.id) });
        setError('Les niet gevonden');
        setLoading(false);
        return;
      }

      console.log('✅ Current lesson found:', currentLesson.title);

      // Fetch user progress
      console.log('🔍 Fetching progress for user:', user.id);
      const { data: progressData } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true);

      console.log('📈 Progress data:', progressData?.length, 'completed lessons');

      // Fetch ebook data
      console.log('🔍 Fetching ebook for lesson:', lessonId);
      const { data: ebookData } = await supabase
        .from('academy_ebooks')
        .select('id, title, file_url, status')
        .eq('lesson_id', lessonId)
        .eq('status', 'published')
        .single();

      console.log('📖 Ebook data:', ebookData ? 'Found' : 'Not found');

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

      console.log('🎯 All state updated, fetch complete!');

    } catch (error) {
      console.error('❌ Fetch error:', error);
      console.error('❌ Error details:', error?.message, error?.code, error?.hint);
      setError('Er is een fout opgetreden bij het laden van de les');
      setIsDataLoaded(false); // Reset on error
    } finally {
      console.log('🏁 Fetch finally block - setting loading to false');
      setLoading(false);
    }
  };

  // Main data fetching effect - simplified and more reliable
  useEffect(() => {
    console.log('🔍 Main fetch effect triggered:', {
      user: !!user,
      moduleId,
      lessonId,
      hasCorrectLesson: lesson?.id === lessonId,
      loading,
      pageVisible: typeof document !== 'undefined' ? document.visibilityState === 'visible' : 'unknown'
    });

    // Only fetch if we have required params and don't have the right data
    if (user && moduleId && lessonId && (!lesson || lesson.id !== lessonId)) {
      console.log('🚀 Need to fetch data for lesson:', lessonId);
      setIsDataLoaded(false);
      fetchData();
    } else if (lesson && lesson.id === lessonId && loading) {
      console.log('✅ Already have correct data, ensuring loading is false');
      setLoading(false);
    }
  }, [user, moduleId, lessonId]);

  // Separate effect to handle page becoming visible - only reset stuck states
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👀 Page became visible - checking for stuck states');
        
        // If we have the right data but are stuck loading, reset it
        if (lesson && lesson.id === lessonId && loading && isDataLoaded) {
          console.log('🔄 Page visible: resetting stuck loading state');
          setLoading(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lesson, lessonId, loading, isDataLoaded]);

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
  if (loading || (user && moduleId && lessonId && !isDataLoaded && typeof document !== 'undefined' && document.visibilityState === 'hidden')) {
    const isWaitingForVisibility = typeof document !== 'undefined' && document.visibilityState === 'hidden';
    
    return (
      <PageLayout 
        title="Les laden..."
        subtitle="Even geduld..."
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-gray-300">
              Les laden...
            </p>
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
                    setShowForceButton(false);
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
                    setShowForceButton(false);
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



        {/* Complete button - Only show for non-exam lessons */}
        {!completed && lesson.type !== 'exam' && (
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

        {/* Exam Section */}
        {lesson.type === 'exam' && lesson.exam_questions && (
          <ExamComponent 
            questions={lesson.exam_questions}
            lessonId={lesson.id}
            userId={user?.id}
            onCompletion={(passed) => {
              console.log('🎯 Exam completed:', passed);
              // Don't refresh page, just show results in ExamComponent
            }}
          />
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

        {/* Navigation buttons - Only show for non-exam lessons */}
        {lesson.type !== 'exam' && (
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
        )}
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