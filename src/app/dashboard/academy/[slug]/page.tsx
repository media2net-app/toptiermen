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

  if (loading) {
    return <div className="text-[#8BAE5A] text-center py-12">Laden...</div>;
  }

  if (!module) {
    return <div className="text-center text-red-400 py-12">Module niet gevonden.</div>;
  }

  // Progressie berekenen
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => completedLessonIds.includes(l.id)).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
    </div>
  );
} 