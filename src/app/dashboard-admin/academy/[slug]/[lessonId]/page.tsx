"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth-systems/optimal/useAuth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AdminLessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = (params as any).slug as string;
  const lessonId = (params as any).lessonId as string;
  const [module, setModule] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      }
      setLoading(false);
    }
    if (slug && lessonId) fetchData();
  }, [slug, lessonId]);

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

  const currentIndex = lessons.findIndex(l => l.id === lesson.id);
  const prev = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const next = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="p-6 md:p-12">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {lesson.title}
        </h1>
        <span className="text-[#8BAE5A] text-sm font-semibold">
          {lesson.duration}
        </span>
      </div>
      
      {lesson.video_url && (
        <div className="w-full aspect-video bg-[#181F17] rounded-xl flex items-center justify-center overflow-hidden border border-[#3A4D23] mb-6">
          <video
            src={lesson.video_url}
            controls
            className="w-full h-full rounded-xl bg-black"
            poster="/video-placeholder.svg"
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
        <div className="prose prose-lg prose-invert max-w-none text-[#B6C948]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({children}) => <h1 className="text-2xl font-bold text-[#FFD700] mb-4 mt-6">{children}</h1>,
              h2: ({children}) => <h2 className="text-xl font-bold text-[#8BAE5A] mb-3 mt-5">{children}</h2>,
              h3: ({children}) => <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2 mt-4">{children}</h3>,
              p: ({children}) => <p className="mb-3 text-[#B6C948] leading-relaxed">{children}</p>,
              ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1 text-[#B6C948]">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-1 text-[#B6C948]">{children}</ol>,
              li: ({children}) => <li className="text-[#B6C948]">{children}</li>,
              strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
              blockquote: ({children}) => (
                <blockquote className="border-l-4 border-[#FFD700] pl-4 italic text-[#B6C948] my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {lesson.content || ''}
          </ReactMarkdown>
        </div>
        
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
            href={`/dashboard-admin/academy/${module.slug || module.id}/${prev.id}`} 
            className="px-6 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition"
          >
            ← {prev.title}
          </Link>
        )}
        {next ? (
          <Link 
            href={`/dashboard-admin/academy/${module.slug || module.id}/${next.id}`} 
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-[#181F17] font-bold border border-[#8BAE5A] hover:from-[#B6C948] hover:to-[#8BAE5A] transition"
          >
            {next.title} →
          </Link>
        ) : (
          <Link 
            href={`/dashboard-admin/academy/${module.slug || module.id}`}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#f0a14f] text-[#181F17] font-bold border border-[#FFD700] hover:from-[#FFED4E] hover:to-[#FFD700] transition"
          >
            Terug naar Academy Beheer
          </Link>
        )}
      </div>
      
      <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
        <h3 className="text-lg font-bold text-[#8BAE5A] mb-4">Les Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#B6C948]">
          <div>
            <strong>ID:</strong> {lesson.id}
          </div>
          <div>
            <strong>Module ID:</strong> {lesson.module_id}
          </div>
          <div>
            <strong>Order Index:</strong> {lesson.order_index}
          </div>
          <div>
            <strong>Type:</strong> {lesson.type}
          </div>
          <div>
            <strong>Created:</strong> {new Date(lesson.created_at).toLocaleDateString()}
          </div>
          <div>
            <strong>Updated:</strong> {new Date(lesson.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
} 