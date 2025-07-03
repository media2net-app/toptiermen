"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = (params as any).slug as string;
  const lessonId = (params as any).lessonId as string;
  const [module, setModule] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let { data: mod, error: modErr } = await supabase
        .from('academy_modules')
        .select('*')
        .eq('slug', slug)
        .single();
      if (modErr) {
        const { data: modById, error: modByIdErr } = await supabase
          .from('academy_modules')
          .select('*')
          .eq('id', slug)
          .single();
        if (!modByIdErr && modById) {
          mod = modById;
          modErr = null;
        }
      }
      if (!modErr && mod) {
        setModule(mod);
        const { data: lessonData } = await supabase
          .from('academy_lessons')
          .select('*')
          .eq('module_id', mod.id)
          .order('order_index', { ascending: true });
        setLessons(lessonData || []);
        const currentLesson = lessonData?.find(l => l.id.toString() === lessonId);
        if (currentLesson) {
          setLesson(currentLesson);
        }
        // Check progressie
        if (user) {
          const { data: progress } = await supabase
            .from('user_lesson_progress')
            .select('completed')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .single();
          setCompleted(progress?.completed === true);
          // Haal alle afgeronde lessen op voor deze gebruiker
          const { data: allProgress } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('completed', true);
          setCompletedLessonIds(allProgress ? allProgress.map((p: any) => p.lesson_id) : []);
        }
      }
      setLoading(false);
    }
    if (slug && lessonId && user) fetchData();
  }, [slug, lessonId, user]);

  async function handleCompleteLesson() {
    setError(null);
    if (!user || !lesson) return;
    setSaving(true);
    // Insert or update progress, zonder module_id
    const { error: upsertError } = await supabase.from('user_lesson_progress').upsert({
      user_id: String(user.id),
      lesson_id: String(lesson.id),
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' });
    if (upsertError) {
      console.error('Supabase upsert error:', upsertError);
      setError(upsertError.message || 'Opslaan mislukt. Probeer opnieuw.');
      setSaving(false);
      return;
    }
    setCompleted(true);
    setSaving(false);
    // Navigeer naar volgende les of module-overzicht
    const currentIndex = lessons.findIndex(l => l.id === lesson.id);
    const next = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    if (next) {
      router.push(`/dashboard/academy/${module.slug || module.id}/${next.id}`);
    } else {
      router.push(`/dashboard/academy/${module.slug || module.id}`);
    }
  }

  if (loading) {
    return (
      <div className="text-[#8BAE5A] text-center py-12">
        Laden...
      </div>
    );
  }

  if (!module || !lesson) {
    return (
      <div className="text-center text-red-400 py-12">
        Les niet gevonden.
      </div>
    );
  }

  // Progressie berekenen
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => completedLessonIds.includes(l.id)).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const currentIndex = lessons.findIndex(l => l.id === lesson.id);
  const prev = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const next = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="p-6 md:p-12">
      {/* Voortgangsbalk bovenaan */}
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
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {lesson.title}
        </h1>
        <span className="text-[#8BAE5A] text-sm font-semibold">
          {lesson.duration}
        </span>
      </div>
      {lesson.video_url && (
        <div className="w-full aspect-video bg-[#181F17] rounded-xl flex items-center justify-center overflow-hidden border border-[#3A4D23] mb-6 relative">
          {videoLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70">
              <div className="text-[#8BAE5A] text-2xl font-bold mb-2">Laden...</div>
            </div>
          )}
          <video
            src={lesson.video_url}
            controls
            autoPlay
            muted
            className="w-full h-full rounded-xl bg-black"
            poster="/video-placeholder.svg"
            onCanPlay={() => setVideoLoading(false)}
            onLoadedData={() => setVideoLoading(false)}
          >
            Je browser ondersteunt deze video niet.
          </video>
        </div>
      )}
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 mb-8 border border-[#3A4D23]">
        <h2 className="text-xl font-bold text-[#8BAE5A] mb-2">
          Over deze les
        </h2>
        <p className="text-[#B6C948] text-lg mb-4">
          {lesson.description}
        </p>
        <div 
          className="prose prose-lg prose-invert max-w-none text-[#B6C948] [&_*]:text-[#B6C948] [&>h1]:text-[#FFD700] [&>h2]:text-[#8BAE5A] [&>h3]:text-[#8BAE5A] [&>strong]:text-white [&>ul]:list-disc [&>ol]:list-decimal [&>blockquote]:border-l-4 [&>blockquote]:border-[#FFD700] [&>blockquote]:pl-4 [&>blockquote]:italic"
          dangerouslySetInnerHTML={{ __html: lesson.content || '' }}
        />
        
        {/* Werkblad Download */}
        {lesson.worksheet_url && (
          <div className="mt-6 p-4 bg-[#181F17] rounded-xl border border-[#3A4D23]">
            <h3 className="text-lg font-bold text-[#8BAE5A] mb-2">📄 Werkblad</h3>
            <p className="text-[#B6C948] text-sm mb-3">
              Download het bijbehorende werkblad om de les te versterken
            </p>
            <a
              href={lesson.worksheet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-colors"
            >
              📥 Download PDF Werkblad
            </a>
          </div>
        )}
      </div>
      <div className="flex justify-between mb-8">
        {prev && (
          <Link 
            href={`/dashboard/academy/${module.slug || module.id}/${prev.id}`} 
            className="px-6 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition"
          >
            ← {prev.title}
          </Link>
        )}
        {next ? (
          <Link 
            href={`/dashboard/academy/${module.slug || module.id}/${next.id}`} 
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-[#181F17] font-bold border border-[#8BAE5A] hover:from-[#B6C948] hover:to-[#8BAE5A] transition"
          >
            {next.title} →
          </Link>
        ) : (
          <Link 
            href={`/dashboard/academy/${module.slug || module.id}`}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#f0a14f] text-[#181F17] font-bold border border-[#FFD700] hover:from-[#FFED4E] hover:to-[#FFD700] transition"
          >
            Terug naar Academy
          </Link>
        )}
      </div>
      {!completed && (
        <button
          onClick={handleCompleteLesson}
          disabled={saving}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-[#181F17] font-bold border border-[#8BAE5A] hover:from-[#B6C948] hover:to-[#8BAE5A] transition text-xl mt-4 disabled:opacity-60"
        >
          {saving ? 'Opslaan...' : (next ? 'Voltooi les, ga door naar volgende →' : 'Voltooi les')}
        </button>
      )}
      {completed && (
        <div className="w-full text-center text-[#8BAE5A] font-bold text-lg mt-4">Deze les is voltooid!</div>
      )}
      {error && (
        <div className="w-full text-center text-red-400 font-bold text-lg mt-4">{error}</div>
      )}
    </div>
  );
} 