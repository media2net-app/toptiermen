"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import PageLayout from '@/components/PageLayout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HLSVideoPlayer from '@/components/HLSVideoPlayer';
// Enhanced video player with better buffering and performance
const SimpleVideoPlayer = ({ src, onEnded, onPlay, onPause, className }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferingTimeout, setBufferingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Enhanced buffering detection with timeout
    const handleWaiting = () => {
      setIsBuffering(true);
      // Clear any existing timeout
      if (bufferingTimeout) {
        clearTimeout(bufferingTimeout);
      }
      // Set timeout to show buffering indicator after 500ms
      const timeout = setTimeout(() => {
        setIsBuffering(true);
      }, 500);
      setBufferingTimeout(timeout);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
      if (bufferingTimeout) {
        clearTimeout(bufferingTimeout);
        setBufferingTimeout(null);
      }
    };

    const handleCanPlayThrough = () => {
      setIsBuffering(false);
      if (bufferingTimeout) {
        clearTimeout(bufferingTimeout);
        setBufferingTimeout(null);
      }
    };

    const handlePlay = () => {
      setIsBuffering(false);
      if (bufferingTimeout) {
        clearTimeout(bufferingTimeout);
        setBufferingTimeout(null);
      }
      onPlay?.();
    };

    const handlePause = () => {
      onPause?.();
    };

    const handleEnded = () => {
      onEnded?.();
    };

    // Handle network state changes
    const handleStalled = () => {
      setIsBuffering(true);
    };

    const handleSuspend = () => {
      setIsBuffering(false);
    };

    // Add event listeners
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('suspend', handleSuspend);

    // Cleanup function
    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('suspend', handleSuspend);
      
      if (bufferingTimeout) {
        clearTimeout(bufferingTimeout);
      }
    };
  }, [onPlay, onPause, onEnded, bufferingTimeout]);

  // Optimize video buffering when component mounts
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video properties for better buffering
    video.load(); // Force reload to apply new attributes
    
    // Add event listener for when video is ready
    const handleLoadedData = () => {
      console.log('Video data loaded successfully');
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const bufferedPercent = (bufferedEnd / duration) * 100;
          console.log(`Video buffered: ${bufferedPercent.toFixed(1)}%`);
        }
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('progress', handleProgress);
    };
  }, [src]);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className={className || 'w-full h-full object-contain'}
        controls
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        webkit-playsinline="true"
        data-setup="{}"
        poster=""
      >
        <source src={src} type="video/mp4" />
        Je browser ondersteunt geen video afspelen.
      </video>
      
      {isBuffering && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
          <div className="bg-black/80 rounded-lg p-4 flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8BAE5A]"></div>
            <div className="text-center">
              <span className="text-white text-sm font-medium">Bufferen...</span>
              <p className="text-gray-300 text-xs mt-1">Video wordt geladen</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
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
  moduleId,
  onCompletion 
}: { 
  questions: ExamQuestion[];
  lessonId: string;
  userId?: string;
  moduleId: string;
  onCompletion: (passed: boolean) => void;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [existingResult, setExistingResult] = useState<null | { score: number; total_questions: number; passed: boolean; answers: number[] | null }>(null);
  const [loadingPrevious, setLoadingPrevious] = useState<boolean>(true);

  const correctAnswers = answers.filter((answer, index) => 
    answer === questions[index].correct_answer
  ).length;
  
  const totalQuestions = questions.length;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = scorePercentage >= 70; // 7/10 requirement
  const allAnswered = !answers.includes(null);

  // Load previous exam result on mount (if any)
  useEffect(() => {
    let active = true;
    async function loadPrev() {
      if (!userId) { setLoadingPrevious(false); return; }
      try {
        const res = await fetch(`/api/academy/get-exam-result?userId=${encodeURIComponent(userId)}&lessonId=${encodeURIComponent(lessonId)}`);
        if (!res.ok) { setLoadingPrevious(false); return; }
        const data = await res.json();
        if (!active) return;
        if (data?.result) {
          const r = data.result as { score: number; total_questions: number; passed: boolean; answers: number[] | null };
          setExistingResult(r);
          if (Array.isArray(r.answers) && r.answers.length === questions.length) {
            // Prefill answers and show results without opening modal
            setAnswers(r.answers.map((v) => (typeof v === 'number' ? v : null)));
            setSubmitted(true);
            setShowResults(true);
          }
        }
      } catch (e) {
        // ignore
      } finally {
        if (active) setLoadingPrevious(false);
      }
    }
    loadPrev();
    return () => { active = false; };
  }, [userId, lessonId, questions.length]);

  const handleSubmit = async () => {
    if (!allAnswered || !userId) return;
    
    setIsSubmitting(true);
    try {
      // Save exam result via server API (service role) to avoid RLS issues
      const res = await fetch('/api/academy/save-exam-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lessonId,
          answers: answers,
          score: correctAnswers,
          totalQuestions,
          passed
        })
      });
      if (!res.ok) {
        const txt = await res.text();
        console.warn('Error saving exam result:', txt);
      }

      setSubmitted(true);
      setShowResults(true);
      onCompletion(passed);

      // Always open modal and scroll focus to it (both passed and failed)
      setShowCongratsModal(true);
      setTimeout(() => {
        modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      // Only when passed: mark lesson complete and try unlock next module
      if (passed) {
        if (userId) {
          try {
            await fetch('/api/academy/complete-lesson', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, lessonId })
            });
          } catch (e) {
            console.warn('⚠️ Failed to mark exam lesson complete');
          }
        }

        if (userId && moduleId) {
          try {
            await fetch('/api/academy/unlock-next-module', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, moduleId })
            });
          } catch (e) {
            console.warn('⚠️ Failed to unlock next module (network)');
          }
        }
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      // Still show results and modal even if saving fails
      setSubmitted(true);
      setShowResults(true);
      onCompletion(passed);
      setShowCongratsModal(true);
      setTimeout(() => {
        modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
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
      {/* Previous attempt notice */}
      {existingResult && (
        <div className={`mb-4 rounded-lg border px-3 py-3 text-sm ${existingResult.passed ? 'border-[#3A4D23] bg-[#13200f] text-[#b8e27a]' : 'border-yellow-600/40 bg-[#2a220f] text-yellow-200'}`}>
          {existingResult.passed ? (
            <div className="flex items-center gap-2">
              <span>🎉</span>
              <span>Vorige resultaat: geslaagd met {existingResult.score}/{existingResult.total_questions} ({Math.round((existingResult.score / Math.max(1, existingResult.total_questions)) * 100)}%). Je kunt het examen opnieuw maken als je wilt.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>ℹ️</span>
              <span>Vorige resultaat: niet geslaagd. Je had {Math.max(0, (existingResult.total_questions - existingResult.score))} fout van {existingResult.total_questions}. Je kunt nu opnieuw proberen.</span>
            </div>
          )}
        </div>
      )}
      {/* Passed Modal */}
      {showCongratsModal && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCongratsModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#3A4D23] bg-[#0F1411] text-white shadow-xl">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{passed ? '🎉' : '📘'}</div>
                <h3 className={`text-2xl font-bold ${passed ? 'text-[#8BAE5A]' : 'text-yellow-300'}`}>
                  {passed ? 'Geslaagd!' : 'Niet geslaagd'}
                </h3>
                {passed ? (
                  <>
                    <p className="text-gray-300 mt-3">
                      Score: <span className="font-semibold text-white">{correctAnswers}/{totalQuestions}</span> ({scorePercentage}%)
                    </p>
                    <p className="text-gray-300 mt-2">
                      Je hebt het examen behaald. Ga terug naar het Academy overzicht om met Module 2 te starten.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-300 mt-3">
                      Je had <span className="font-semibold text-white">{totalQuestions - correctAnswers}</span> fout van {totalQuestions} vragen.
                    </p>
                    <p className="text-gray-300 mt-2">
                      Ga terug naar het module-overzicht om de stof opnieuw door te nemen. Je kunt het examen later nog eens maken.
                    </p>
                  </>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowCongratsModal(false);
                    router.push('/dashboard/academy');
                  }}
                  className="w-full sm:flex-1 px-4 py-2 rounded-lg bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-colors"
                >
                  {passed ? 'Ga naar academy overzicht' : 'Terug naar module overzicht'}
                </button>
                <button
                  onClick={() => setShowCongratsModal(false)}
                  className="w-full sm:flex-1 px-4 py-2 rounded-lg border border-[#3A4D23] bg-[#181F17] hover:bg-[#232D1A] text-white transition-colors"
                >
                  Blijf op deze pagina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
                    <span className="flex-1">
                      {option}
                      {optionIndex === question.correct_answer && (
                        <span className="ml-2 inline-flex items-center text-xs px-2 py-0.5 rounded bg-green-900/40 text-green-300 border border-green-700/40">
                          (juiste antwoord)
                        </span>
                      )}
                    </span>
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
  const [ebook, setEbook] = useState<any>(null);
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [showForceButton, setShowForceButton] = useState(false);
  // Guard to prevent concurrent fetches
  const isFetchingRef = useRef(false);

  // Resolved video URL (auto-switch to HLS if available)
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);
  const [resolvedIsHls, setResolvedIsHls] = useState<boolean>(false);

  // Disable video preloading - only load current lesson video
  const isPreloading = false;
  const preloadProgress = 0;

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

  // Try to resolve HLS variant for MP4 URLs
  useEffect(() => {
    const run = async () => {
      const raw = String((lesson as any)?.video_url || '');
      if (!raw) { setResolvedVideoUrl(null); setResolvedIsHls(false); return; }
      // If already HLS, keep as-is
      if (/\.m3u8(\?.*)?$/i.test(raw) || raw.toLowerCase().includes('m3u8')) {
        setResolvedVideoUrl(raw);
        setResolvedIsHls(true);
        return;
      }
      // Build candidate HLS URLs based on common patterns
      const u = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      const pathname = u.pathname;
      const idx = pathname.lastIndexOf('/');
      const dir = idx >= 0 ? pathname.slice(0, idx + 1) : '/';
      const file = idx >= 0 ? pathname.slice(idx + 1) : pathname;
      // IMPORTANT: handle spaces correctly. Supabase paths often contain spaces URL-encoded as %20.
      // We need both decoded and encoded variants to avoid double-encoding like %2520.
      const fileDecoded = (() => { try { return decodeURIComponent(file); } catch { return file; } })();
      const baseNoExtRaw = file.replace(/\.[^.]+$/, '');
      const baseNoExtDecoded = fileDecoded.replace(/\.[^.]+$/, '');
      const baseNoExtEncoded = encodeURIComponent(baseNoExtDecoded);
      const candidates: string[] = [];
      // 0) LOCAL TEST OVERRIDE (only if it actually exists)
      //    Preferred new structure: /public/hls/<moduleId>/<lessonId>/master.m3u8
      //    Backward-compatible structure: /public/hls/<lessonId>/master.m3u8
      try {
        const lid = String(lessonId || '').trim();
        const mid = String(moduleId || '').trim();
        if (lid) {
          const tryHead = async (url: string, timeoutMs = 800) => {
            const controller = new AbortController();
            const t = setTimeout(() => controller.abort(), timeoutMs);
            try {
              const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
              return res.ok;
            } catch {
              return false;
            } finally {
              clearTimeout(t);
            }
          };

          // Preferred path with moduleId/lessonId
          if (mid) {
            const localUrlModule = `${window.location.origin}/hls/${mid}/${lid}/master.m3u8`;
            if (await tryHead(localUrlModule)) {
              setResolvedVideoUrl(localUrlModule);
              setResolvedIsHls(true);
              try { console.log('[Academy Lesson] Using LOCAL HLS override (module/lesson):', localUrlModule); } catch {}
              return;
            }
          }

          // Backward-compatible path with only lessonId
          const localUrlLegacy = `${window.location.origin}/hls/${lid}/master.m3u8`;
          if (await tryHead(localUrlLegacy)) {
            setResolvedVideoUrl(localUrlLegacy);
            setResolvedIsHls(true);
            try { console.log('[Academy Lesson] Using LOCAL HLS override (legacy):', localUrlLegacy); } catch {}
            return;
          }
        }
      } catch {}
      // Same path, .mp4 -> .m3u8
      if (/\.mp4$/i.test(file)) candidates.push(u.href.replace(/\.mp4(\?.*)?$/i, '.m3u8'));
      // master.m3u8 in same dir
      candidates.push(`${u.origin}${dir}master.m3u8`);
      // <basename>.m3u8 in same dir (try both decoded->encoded and raw filename without re-encoding)
      candidates.push(`${u.origin}${dir}${baseNoExtEncoded}.m3u8`);
      candidates.push(`${u.origin}${dir}${baseNoExtRaw}.m3u8`);
      // Subdirectory patterns: <dir>/<basename>/master.m3u8 and <dir>/<basename>/<basename>.m3u8
      const subDirDecoded = `${u.origin}${dir}${baseNoExtEncoded}/`;
      candidates.push(`${subDirDecoded}master.m3u8`);
      candidates.push(`${subDirDecoded}${baseNoExtEncoded}.m3u8`);
      // Deduplicate
      const seen = new Set<string>();
      const unique = candidates.filter(c => { if (seen.has(c)) return false; seen.add(c); return true; });
      // Probe with HEAD (1.5s timeout)
      for (const c of unique) {
        try {
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), 1500);
          const res = await fetch(c, { method: 'HEAD', signal: controller.signal });
          clearTimeout(t);
          if (res.ok) {
            setResolvedVideoUrl(c);
            setResolvedIsHls(true);
            return;
          }
        } catch {}
      }
      // Fallback to original MP4
      setResolvedVideoUrl(raw);
      setResolvedIsHls(false);
    };
    run();
  }, [lesson?.video_url]);

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
      // Show "try again" button after 10 seconds on mobile
      const forceButtonTimeout = setTimeout(() => {
        console.log('⚠️ Showing force reload button after 10s');
        setShowForceButton(true);
      }, 10000);
      
      // Increased timeout for better reliability after ebook navigation
      const timeoutId = setTimeout(() => {
        console.log('⚠️ Loading timeout reached (35s), forcing reset');
        if (lesson && lesson.id === lessonId) {
          console.log('🔄 FORCE: We have correct data, resetting loading state');
          setLoading(false);
          setIsDataLoaded(true);
          setShowForceButton(false);
        } else {
          console.log('🔄 FORCE: No correct data, retrying fetch');
          setShowForceButton(false);
          fetchData();
        }
      }, 35000); // Increased to 35s to account for 30s API timeout

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(forceButtonTimeout);
      };
    } else {
      // Reset force button when loading completes
      setShowForceButton(false);
    }
  }, [loading, lesson, lessonId]);

  // Enhanced page visibility handler for PDF ebook returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Lesson page became visible, checking loading state...');
        
        // If we're stuck loading, reset the state
        if (loading && !error) {
          console.log('🔄 Resetting stuck loading state in lesson...');
          setLoading(false);
          setError(null);
          
          // Retry data fetch
          setTimeout(() => {
            console.log('🔄 Retrying lesson data fetch after visibility change...');
            fetchData();
          }, 1000);
        }
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('📖 User returned from PDF ebook to lesson, resetting states...');
        
        // Reset loading if stuck
        if (loading && !error) {
          console.log('🔄 Resetting stuck loading after page show in lesson...');
          setLoading(false);
          setError(null);
          
          // Retry data fetch
          setTimeout(() => {
            console.log('🔄 Retrying lesson data fetch after page show...');
            fetchData();
          }, 1000);
        }
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pageshow', handlePageShow);
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pageshow', handlePageShow);
      }
    };
  }, [loading, error, lessonId]);

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
    if (isFetchingRef.current) {
      console.log('⏳ fetchData skipped: request already in-flight');
      return;
    }
    isFetchingRef.current = true;
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
      // Fetch via server API (bypasses RLS) with timeout protection
      // Increased timeout to 30s for mobile connections
      console.log('🔍 Fetching module+lessons via API for:', { moduleId, lessonId, userId: user.id });
      const controller = new AbortController();
      const t = setTimeout(() => {
        console.error('⏱️ Request timeout after 30s');
        controller.abort();
      }, 30000);
      const res = await fetch(`/api/academy/module-data?userId=${encodeURIComponent(user.id)}&moduleId=${encodeURIComponent(moduleId)}`, {
        method: 'GET',
        cache: 'no-cache',
        signal: controller.signal
      });
      clearTimeout(t);
      if (!res.ok) {
        const txt = await res.text();
        console.error('❌ API error:', res.status, txt);
        throw new Error(`API ${res.status}: ${txt}`);
      }
      const payload = await res.json();
      const moduleData = payload.module;
      const lessonsData = payload.lessons || [];

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

      // Progress is already provided by the API for module view; avoid extra client-side queries here to reduce latency
      const uniqueCompletedLessons: string[] = payload.completedLessonIds || [];
      console.log('📈 Progress data (from API):', uniqueCompletedLessons.length);

      // Fetch ebook data - use maybeSingle() to avoid error when no ebook exists
      console.log('🔍 Fetching ebook for lesson:', lessonId);
      const { data: ebookData, error: ebookError } = await supabase
        .from('academy_ebooks')
        .select('id, title, file_url, status')
        .eq('lesson_id', lessonId)
        .eq('status', 'published')
        .maybeSingle();

      if (ebookError) {
        console.warn('⚠️ Error fetching ebook (non-critical):', ebookError);
      }
      console.log('📖 Ebook data:', ebookData ? 'Found' : 'Not found');

      // Update all state
      setModule(moduleData);
      setLessons(lessonsData);
      setLesson(currentLesson);
      setCompleted(uniqueCompletedLessons.includes(currentLesson.id));
      setCompletedLessonIds(uniqueCompletedLessons);
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

    } catch (error: any) {
      console.error('❌ Fetch error:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        hint: error?.hint,
        name: error?.name,
        stack: error?.stack
      });
      
      // Provide more specific error messages
      let errorMessage = 'Er is een fout opgetreden bij het laden van de les';
      if (error?.name === 'AbortError') {
        errorMessage = 'Laden duurde te lang. Probeer het opnieuw.';
      } else if (error?.message?.includes('API')) {
        errorMessage = `API fout: ${error.message}`;
      } else if (!navigator.onLine) {
        errorMessage = 'Geen internetverbinding. Controleer je verbinding en probeer opnieuw.';
      }
      
      setError(errorMessage);
      setIsDataLoaded(false); // Reset on error
    } finally {
      console.log('🏁 Fetch finally block - setting loading to false');
      setLoading(false);
      isFetchingRef.current = false; // CRITICAL: Always reset this flag
    }
  };

  // Main data fetching effect - simplified and more reliable
  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    console.log('🔍 Main fetch effect triggered:', {
      user: !!user,
      moduleId,
      lessonId,
      hasCorrectLesson: lesson?.id === lessonId,
      loading,
      pageVisible: document.visibilityState === 'visible'
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
      // Use the new API endpoint that handles both tables
      const response = await fetch('/api/academy/complete-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          lessonId: lesson.id,
          score: 100,
          timeSpent: 300
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('Error completing lesson:', data.error);
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
              alert('🎉 gefeliciteerd! Je hebt de Academy Master badge ontgrendeld!');
            }
          } catch (e) {
            console.error('❌ Error checking academy completion badge:', e);
          }
        }, 300);
      }
    } catch (e) {
      setError('Fout bij voltooien van les');
    } finally {
      setSaving(false);
    }
  };

  // Calculate previous and next lessons based on current state
  const currentIndex = lessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  useEffect(() => {
    if (!user?.id || !moduleId || !lessonId) return;
    fetchData();
  }, [user?.id, moduleId, lessonId]);

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
            <p className="text-gray-300 mb-4">
              Les laden...
            </p>
            {showForceButton && (
              <div className="mt-6">
                <p className="text-gray-400 text-sm mb-3">Duurt het te lang?</p>
                <button
                  onClick={() => {
                    console.log('🔄 Force reload requested by user');
                    setError(null);
                    setLoading(false);
                    isFetchingRef.current = false;
                    fetchData();
                  }}
                  className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
                >
                  Opnieuw proberen
                </button>
              </div>
            )}
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
        <div className="mb-6">
          {/* Grid with 2 columns - Terug button left, Vorige/Volgende right */}
          <div className="grid grid-cols-2 gap-3">
            {/* Terug naar module overzicht - compacte knop links */}
            <button
              onClick={() => {
                console.log('🔄 Navigating to module overview...');
                setNavigating(true);
                router.push(`/dashboard/academy/${module.id}`);
              }}
              disabled={navigating}
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-[#232D1A] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {navigating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
              ) : (
                "←"
              )}
              <span className="truncate">Terug naar overzicht</span>
            </button>
            
            {/* Vorige les - compacte knop rechts (alleen als er een vorige les is) */}
            {prevLesson ? (
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
                className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-[#232D1A] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {navigating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
                ) : (
                  "←"
                )}
                <span className="truncate">Vorige les</span>
              </button>
            ) : (
              <div></div>
            )}
          </div>
          
          {/* Volgende les - full-width knop eronder */}
          {nextLesson && (
            <button
              onClick={async () => {
                console.log('🔄 Next action triggered...');
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

                // If not completed and non-exam, complete first
                if (!completed && lesson.type !== 'exam') {
                  try {
                    // Fire-and-forget, do not block navigation
                    void handleCompleteLesson();
                  } catch (e) {
                    console.warn('⚠️ Completing before navigate failed, proceeding to navigate');
                  }
                }

                setNavigating(true);
                // Use a small delay to ensure state updates
                setTimeout(() => {
                  router.push(`/dashboard/academy/${module.id}/${nextLesson.id}`);
                }, 50);
              }}
              disabled={navigating || (!completed && lesson.type !== 'exam' && saving)}
              className="w-full mt-3 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="truncate">{!completed && lesson.type !== 'exam' ? 'Voltooi & volgende' : 'Volgende les'}</span>
              {navigating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17]"></div>
              ) : (
                "→"
              )}
            </button>
          )}
        </div>

        {/* Custom Navigation with Hard Refresh */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs sm:text-sm min-w-0">
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
            className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors disabled:opacity-50 truncate max-w-[60vw] sm:max-w-none"
          >
            Module {getModuleNumber(module.order_index)}: {module.title}
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-300 truncate max-w-[70vw] sm:max-w-none">{lesson.title}</span>
        </div>

        {/* Lesson content */}
        <div className="bg-[#181F17]/90 rounded-xl p-6 border border-[#3A4D23]">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#8BAE5A] mb-2 break-words">{lesson.title}</h1>
            <p className="text-gray-300 break-words">{lesson.description}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-xs sm:text-sm text-gray-400">
              <span>Duur: {lesson.duration}</span>
              <span>Type: {lesson.type}</span>
              {completed && <span className="text-green-400">✓ Voltooid</span>}
            </div>
          </div>

          {/* Video content */}
          {(resolvedVideoUrl || lesson.video_url) && (
            <div className="mb-6">
              {(() => {
                const url = String(resolvedVideoUrl || lesson.video_url || '');
                const isHls = resolvedIsHls || /\.m3u8(\?.*)?$/i.test(url) || url.toLowerCase().includes('m3u8');
                // Debug log which player is used
                try { console.log('[Academy Lesson] Video URL:', url, '| HLS:', isHls); } catch {}
                return (
                  <div className="relative">
                    {/* Player type badge removed */}
                    {isHls ? (
                      <HLSVideoPlayer src={url} autoPlay={false} controls />
                    ) : (
                      <SimpleVideoPlayer key={lesson.id} src={url} onEnded={() => {}} />
                    )}
                  </div>
                );
              })()}
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



        {completed && (
          <div className="text-center">
            <div className="text-green-400 text-lg font-semibold mb-2">✓ Les voltooid!</div>
            <p className="text-gray-400">Ga door naar de volgende les om je voortgang te behouden.</p>
          </div>
        )}

        {/* Exam Section */}
        {lesson.type === 'exam' && (
          <ExamComponent 
            questions={lesson.exam_questions || []}
            lessonId={lesson.id}
            userId={user?.id}
            moduleId={module.id}
            onCompletion={(passed) => {
              console.log('🎯 Exam completed:', passed);
              // Don't refresh page, just show results in ExamComponent
            }}
          />
        )}

        {/* Ebook Download Section - Only show for non-exam lessons */}
        {lesson.type !== 'exam' && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#3A4D23] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Les Ebook
                  </h3>
                  {completed && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Voltooid
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Download het uitgebreide ebook voor <strong>{lesson.title}</strong> uit de module <strong>Module {module.order_index}: {module.title}</strong>. 
                  Dit ebook bevat extra lesmateriaal, praktische oefeningen en reflectie vragen.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Wat krijg je in dit ebook?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Uitgebreide samenvatting van de les</li>
                    <li>• Praktische oefeningen en opdrachten</li>
                    <li>• Dagelijkse checklists en routines</li>
                    <li>• Reflectie vragen voor persoonlijke groei</li>
                    <li>• Volgende stappen en actieplan</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <button
                    onClick={async () => {
                      // Build slug from current lesson title for ebook filename matching
                      const rawTitle = (lesson?.title || '').toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // strip accents
                      const ebookSlug = rawTitle
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      // 1) Use DB file_url if explicitly set
                      if (ebook?.file_url) {
                        const directUrl = ebook.file_url as string;
                        console.log('📖 Opening ebook via DB file_url:', directUrl);
                        window.location.href = directUrl;
                        return;
                      }
                      

                      // 3) Candidate v2 URLs to try (alias + slug)
                      const v2Alias: { [slug: string]: string } = {
                        'waarom-is-fysieke-dominantie-zo-belangrijk': 'fysieke-dominantie-belangrijk',
                        'ontdek-je-kernwaarden-en-bouw-je-top-tier-identiteit': 'top-tier-identiteit',
                        'wat-is-identiteit-en-waarom-zijn-kernwaarden-essentieel': 'identiteit-kernwaarden',
                        'discipline-van-korte-termijn-naar-een-levensstijl': 'discipline-levensstijl',
                      };

                      const candidates = [
                        `/ebooksv2/${v2Alias[ebookSlug] || ebookSlug}.html`,
                        // Also try the alternate if alias was applied first
                        v2Alias[ebookSlug] ? `/ebooksv2/${ebookSlug}.html` : ''
                      ].filter(Boolean) as string[];

                      // 4) HEAD check for first existing v2 URL
                      let targetUrl: string | null = null;
                      for (const url of candidates) {
                        try {
                          const res = await fetch(url, { method: 'HEAD' });
                          if (res.ok) {
                            targetUrl = url;
                            break;
                          }
                        } catch (e) {
                          // ignore and continue
                        }
                      }

                      // 5) Navigate to v2 if found, else fallback to legacy
                      targetUrl = targetUrl || `/ebooks/${ebookSlug}.html`;
                      console.log('📖 Opening ebook:', targetUrl);
                      window.location.href = targetUrl;
                    }}
                    disabled={false}
                    className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-semibold shadow-md bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white hover:from-[#B6C948] hover:to-[#8BAE5A] hover:shadow-lg transform hover:scale-105`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {'Bekijk E-book'}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Het ebook opent in hetzelfde tabblad met alle praktische informatie en oefeningen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Navigation buttons - Only show for non-exam lessons */}
        {lesson.type !== 'exam' && (
          <div className="mt-8">
            {/* Grid with 2 columns - Terug button left, Vorige/Volgende right */}
            <div className="grid grid-cols-2 gap-3">
              {/* Terug naar module overzicht - compacte knop links */}
              <button
                onClick={() => {
                  console.log('🔄 Navigating to module overview...');
                  setNavigating(true);
                  router.push(`/dashboard/academy/${module.id}`);
                }}
                disabled={navigating}
                className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-[#232D1A] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {navigating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
                ) : (
                  "←"
                )}
                <span className="truncate">Terug naar overzicht</span>
              </button>
              
              {/* Vorige les - compacte knop rechts (alleen als er een vorige les is) */}
              {prevLesson ? (
                <button
                  onClick={() => {
                    console.log('🔄 Navigating to previous lesson...');
                    setIsVideoLoading(false);
                    setShowVideoOverlay(true);
                    setNavigating(true);
                    
                    setTimeout(() => {
                      router.push(`/dashboard/academy/${module.id}/${prevLesson.id}`);
                    }, 50);
                  }}
                  disabled={navigating}
                  className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-[#232D1A] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {navigating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
                  ) : (
                    "←"
                  )}
                  <span className="truncate">Vorige les</span>
                </button>
              ) : (
                <div></div>
              )}
            </div>
            
            {/* Volgende les - full-width knop eronder */}
            {nextLesson && (
              <button
                onClick={async () => {
                  console.log('🔄 Next action (bottom) triggered...');
                  setIsVideoLoading(false);
                  setShowVideoOverlay(true);

                  if (!completed && lesson.type !== 'exam') {
                    try {
                      void handleCompleteLesson();
                    } catch (e) {
                      console.warn('⚠️ Completing before navigate failed, proceeding to navigate');
                    }
                  }

                  setNavigating(true);
                  
                  setTimeout(() => {
                    router.push(`/dashboard/academy/${module.id}/${nextLesson.id}`);
                  }, 50);
                }}
                disabled={navigating || (!completed && lesson.type !== 'exam' && saving)}
                className="w-full mt-3 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="truncate">
                  {(!completed && lesson.type !== 'exam')
                    ? 'Voltooi & volgende'
                    : 'Volgende les'}
                </span>
                {navigating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17]"></div>
                ) : (
                  "→"
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lesson list */}
      <div className="mt-8">
        <div className="rounded-2xl border border-[#3A4D23] bg-[#181F17] p-3 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-2xl font-extrabold text-[#8BAE5A]">Lessen in deze module</h3>
            <span className="hidden sm:inline-flex items-center justify-center text-xs font-semibold text-[#B6C948] bg-[#232D1A] border border-[#3A4D23] rounded-full w-7 h-7">
              {lessons.length}
            </span>
          </div>

          <div className="space-y-2">
            {lessons.map((l, index) => {
              const isActive = l.id === lessonId;
              const isDone = completedLessonIds.includes(l.id);
              const idx = String(index + 1).padStart(2, '0');
              const isExam = l.type === 'exam' || index === lessons.length - 1;
              const allPrevDone = lessons.slice(0, index).every(item => completedLessonIds.includes(item.id));
              const unlocked = index === 0 ? true : (isExam ? allPrevDone : completedLessonIds.includes(lessons[index - 1].id));

              if (!unlocked && !isActive) {
                return (
                  <div
                    key={l.id}
                    className={`w-full text-left px-3 py-3 sm:px-5 sm:py-4 rounded-lg border transition-all flex items-center justify-between bg-[#141a12] text-gray-400 border-[#3A4D23] opacity-60 cursor-not-allowed`}
                    title="Deze les wordt ontgrendeld nadat je de vorige les voltooit"
                  >
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                      <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-black border border-[#2A3720] text-gray-500`}>
                        {idx}
                      </span>
                      <span className={`block text-sm leading-snug sm:text-base sm:leading-normal whitespace-normal break-words max-w-[60%] sm:max-w-none`}>{l.title} <span className="text-xs text-gray-500">(vergrendeld)</span></span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-shrink-0">
                      <span className="opacity-80 text-gray-500">🔒</span>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={l.id}
                  onClick={() => {
                    if (!isActive) {
                      console.log('🔄 Navigating to lesson...');
                      setIsVideoLoading(false);
                      setShowVideoOverlay(true);
                      setNavigating(true);
                      setTimeout(() => {
                        router.push(`/dashboard/academy/${module.id}/${l.id}`);
                      }, 50);
                    }
                  }}
                  disabled={isActive || navigating}
                  className={
                    `w-full text-left px-3 py-3 sm:px-5 sm:py-4 rounded-lg border transition-all flex items-center justify-between ` +
                    (isActive
                      ? 'bg-[#8BAE5A] text-[#181F17] border-[#8BAE5A] cursor-default'
                      : isDone
                        ? 'bg-[#232D1A] text-white border-[#3A4D23] hover:bg-[#3A4D23]'
                        : 'bg-[#181F17] text-gray-200 border-[#3A4D23] hover:bg-[#232D1A]')
                  }
                >
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-black border ${isActive ? 'border-[#181F17] text-[#181F17] bg-white/20' : 'border-[#3A4D23] text-[#8BAE5A]'}`}>
                      {idx}
                    </span>
                    <span className={`${isActive ? 'font-bold' : 'font-medium'} block text-sm leading-snug sm:text-base sm:leading-normal whitespace-normal break-words max-w-[60%] sm:max-w-none`}>{l.title}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-shrink-0">
                    {isDone && (
                      <span className={`hidden sm:inline-flex items-center gap-1 ${isActive ? 'text-[#181F17]' : 'text-[#8BAE5A]'}`}>
                        <span>✓</span>
                        <span>Voltooid</span>
                      </span>
                    )}
                    {l.duration && l.type !== 'exam' && (
                      <span className={`opacity-80 ${isActive ? 'text-[#181F17]' : 'text-gray-300'}`}>{l.duration}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
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