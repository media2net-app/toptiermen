"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';

export default function ModuleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();
  const [module, setModule] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [showGraduationModal, setShowGraduationModal] = useState(false);

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
        // Fetch user progress for this module
        if (user) {
          const { data: progressData } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('completed', true);
          setCompletedLessonIds(progressData ? progressData.map((p: any) => p.lesson_id) : []);
          // Update opened_at in user_module_unlocks als nodig
          const { data: unlockRow } = await supabase
            .from('user_module_unlocks')
            .select('*')
            .eq('user_id', user.id)
            .eq('module_id', mod.id)
            .maybeSingle();
          if (unlockRow && !unlockRow.opened_at) {
            await supabase.from('user_module_unlocks').update({ opened_at: new Date().toISOString() })
              .eq('user_id', user.id)
              .eq('module_id', mod.id);
          }
        }
      } else {
        setModule(null);
        setLessons([]);
        setCompletedLessonIds([]);
      }
      setLoading(false);
    }
    if (slug && user) fetchData();
  }, [slug, user]);

  // Progressie berekenen
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => completedLessonIds.includes(l.id)).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Toon GraduationModal als 100% behaald en nog niet getoond
  useEffect(() => {
    if (progress === 100 && !showGraduationModal) {
      setShowGraduationModal(true);
    }
  }, [progress, showGraduationModal]);

  if (loading) {
    return <div className="text-[#8BAE5A] text-center py-12">Laden...</div>;
  }

  if (!module) {
    return <div className="text-center text-red-400 py-12">Module niet gevonden.</div>;
  }

  return (
    <div className="p-6 md:p-12">
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
      
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{module.title}</h1>
      <div className="text-[#B6C948] text-lg mb-6">{module.subtitle}</div>
      <div className="text-[#B6C948] mb-8">{module.description}</div>
      <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">Lessen</h2>
      <ul className="mb-8">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="flex items-center justify-between py-2 border-b border-[#232D1A]">
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/academy/${module.slug || module.id}/${lesson.id}`} className="text-white hover:text-[#8BAE5A] font-semibold">
                {lesson.title}
              </Link>
              {completedLessonIds.includes(lesson.id) && (
                <span className="ml-2 text-[#8BAE5A] text-lg" title="Voltooid">✔</span>
              )}
            </div>
            <div>
              <span className="text-[#B6C948] text-sm">{lesson.duration}</span>
            </div>
          </li>
        ))}
      </ul>
      <Link href="/dashboard/academy" className="px-6 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition">
        ← Terug naar Academy Overzicht
      </Link>
      {showGraduationModal && (
        <GraduationModal
          module={module}
          onClose={() => setShowGraduationModal(false)}
        />
      )}
    </div>
  );
}

// Generieke GraduationModal met confetti
function GraduationModal({ module, onClose }: { module: any; onClose: () => void }) {
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              {['🎉', '🏆', '⭐', '🎊', '💎'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}
      <div className="bg-[#232D1A] rounded-2xl p-8 shadow-2xl max-w-lg w-full mx-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8BAE5A]/20 to-[#B6C948]/20 rounded-2xl"></div>
        <div className="relative z-10 text-center">
          <div className="text-8xl mb-6 animate-pulse">🏆</div>
          <h2 className="text-3xl font-bold text-[#B6C948] mb-4">GEFELICITEERD!</h2>
          <p className="text-[#8BAE5A] text-lg mb-6 leading-relaxed">
            Je hebt zojuist <strong>{module?.title}</strong> succesvol afgerond.<br/>
            Je hebt de kennis verwerkt, de reflectie voltooid en een onmisbaar fundament voor je verdere groei gelegd. We zijn trots op je prestatie.
          </p>
          <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#f0a14f]/20 rounded-xl p-4 mb-6 border border-[#FFD700]/30">
            <div className="text-4xl mb-2">🏅</div>
            <h3 className="text-[#FFD700] font-bold text-lg mb-1">Module Badge</h3>
            <p className="text-[#B6C948] text-sm">Badge ontgrendeld!</p>
          </div>
          <button
            onClick={onClose}
            className="block w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-bold hover:from-[#B6C948] hover:to-[#8BAE5A] transition text-center mt-4"
          >
            Terug naar module
          </button>
        </div>
      </div>
    </div>
  );
} 