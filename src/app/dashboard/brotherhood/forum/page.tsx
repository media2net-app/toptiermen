'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  emoji: string;
  slug: string;
  topics_count: number;
  posts_count: number;
  last_post?: {
    title: string;
    author: string;
    time: string; // ISO string from API
  };
}

const ForumOverview = () => {
  const { user } = useSupabaseAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const createTopic = async () => {
    if (!user?.id) { toast.error('Log in om een topic te plaatsen'); return; }
    if (!topicCategoryId || !topicTitle.trim() || !topicContent.trim()) {
      toast.error('Kies een categorie en vul titel en bericht in');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('/api/forum/create-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: topicCategoryId,
          title: topicTitle.trim(),
          content: topicContent.trim(),
          author_id: user.id
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Aanmaken mislukt');
      }
      toast.success('Topic geplaatst');
      setShowNewTopic(false);
      setTopicCategoryId('');
      setTopicTitle('');
      setTopicContent('');
      // Refresh categories to reflect counts
      fetchCategories();
    } catch (e: any) {
      toast.error(e.message || 'Er ging iets mis');
    } finally {
      setSubmitting(false);
    }
  };
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // New Topic modal state
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [topicCategoryId, setTopicCategoryId] = useState<number | ''>('');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicContent, setTopicContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    fetchCategories();
  }, []);

  // Auto-focus when modal opens
  useEffect(() => {
    if (showNewTopic) {
      const id = window.setTimeout(() => {
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
        try { modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
        try { titleRef.current?.focus(); } catch {}
      }, 120);
      return () => window.clearTimeout(id);
    }
  }, [showNewTopic]);

  const fetchCategories = async () => {
    setError(null);
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch('/api/forum/categories', { cache: 'no-cache', signal: controller.signal });
      clearTimeout(t);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      const data = await res.json();
      const list: ForumCategory[] = (data.categories || []).map((c: any) => ({
        ...c,
        last_post: c.last_post ? { ...c.last_post, time: formatTimeAgo(c.last_post.time) } : undefined,
      }));
      setCategories(list);
    } catch (e: any) {
      console.error('Error fetching forum categories:', e);
      setError('Forum laden mislukt');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Nu';
    if (diffInMinutes < 60) return `${diffInMinutes} min geleden`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} uur geleden`;
    return `${Math.floor(diffInMinutes / 1440)} dagen geleden`;
  };

  if (!isClient || loading) {
    return (
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-0">
        <div className="flex-1">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-6"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-[#232D1A]/90 rounded-2xl p-6 mb-6">
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Graceful fallback: if categories couldn't be loaded, show a helpful message with direct link
  if (categories.length === 0) {
    return (
      <div className="w-full min-h-screen bg-[#0A0F0A]">
        <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 py-10">
          <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{error || 'Forum laden mislukt'}</h2>
            <p className="text-[#8BAE5A] mb-4">Probeer het opnieuw of ga direct naar het introductietopic om onboarding af te ronden.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={fetchCategories} className="px-5 py-2 rounded-lg bg-[#3A4D23] text-white hover:bg-[#4A5D33]">Opnieuw laden</button>
              <a href="/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden" className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold">Ga naar Introductietopic</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0A0F0A]">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 xl:gap-12 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 pb-20 sm:pb-24 lg:pb-8">
      {/* Linkerkolom: Categorieën */}
      <div className="flex-1 grid grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 lg:mb-6 gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">Forum</h2>
          <button
            onClick={() => setShowNewTopic(true)}
            className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2 lg:py-3 rounded-lg lg:rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-sm lg:text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
          >
            + Start Nieuwe Discussie
          </button>
        </div>
        {categories.map((cat, idx) => (
          <Link key={cat.id} href={`/dashboard/brotherhood/forum/${cat.slug}`} className="group bg-[#232D1A]/90 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border border-[#3A4D23]/40 p-3 sm:p-4 lg:p-6 flex flex-col gap-2 sm:gap-3 lg:gap-4 hover:shadow-2xl hover:-translate-y-1 hover:border-[#FFD700] transition-all cursor-pointer no-underline">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl flex-shrink-0">{cat.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1">{cat.name}</div>
                <div className="text-[#8BAE5A] text-xs sm:text-sm mb-2 line-clamp-2">{cat.description}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 lg:gap-4 text-xs mt-1 sm:mt-2">
              <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 sm:px-3 py-1 rounded-full font-semibold">Topics: {cat.topics_count}</span>
              <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 sm:px-3 py-1 rounded-full font-semibold">Reacties: {cat.posts_count}</span>
            </div>
            {cat.last_post && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 sm:mt-2 text-xs text-[#8BAE5A]">
                <span className="hidden sm:inline">Laatste post:</span>
                <span className="text-white font-semibold truncate max-w-[100px] sm:max-w-[120px] lg:max-w-[180px]">Re: {cat.last_post.title}</span>
                <span className="text-[#FFD700]">door {cat.last_post.author}</span>
                <span className="text-[#8BAE5A]">- {cat.last_post.time}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
      {/* Rechterkolom: Widgets - Verborgen op mobiel */}
      <aside className="hidden lg:flex w-full lg:w-[300px] xl:w-[340px] flex-col gap-4 sm:gap-6 mt-6 lg:mt-0">
        <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-white mb-3">Recente Activiteit</h3>
          <ul className="text-[#8BAE5A] text-xs sm:text-sm space-y-2">
            {categories.slice(0, 5).map((cat, idx) => (
              cat.last_post && (
                <li key={idx}>
                  <span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>
                  Re: {cat.last_post.title} <span className="text-[#FFD700]">{cat.last_post.author}</span>
                </li>
              )
            ))}
          </ul>
        </div>
        <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-white mb-3">Populaire Topics (Deze Week)</h3>
          <ul className="text-[#8BAE5A] text-xs sm:text-sm space-y-2">
            {categories.slice(0, 3).map((cat, idx) => (
              <li key={idx}>
                <span className="inline-block w-2 h-2 bg-[#8BAE5A] rounded-full mr-2 align-middle"></span>
                {cat.last_post?.title || 'Nieuwe discussie'} <span className="text-[#8BAE5A]">({cat.posts_count} reacties)</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-white mb-3">Onbeantwoorde Vragen</h3>
          <ul className="text-[#8BAE5A] text-xs sm:text-sm space-y-2">
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Hoe herstel je sneller na een zware training?</li>
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Wat is de beste manier om te starten met beleggen?</li>
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Welke boeken raden jullie aan voor focus?</li>
          </ul>
        </div>
      </aside>
      </div>

      {/* New Topic Modal */}
      {showNewTopic && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            ref={modalRef}
            tabIndex={-1}
            className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl w-full max-w-2xl text-white overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#3A4D23]">
              <h3 className="text-lg font-bold">Nieuwe discussie</h3>
              <button onClick={() => setShowNewTopic(false)} className="px-2 py-1 rounded hover:bg-[#3A4D23]">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Categorie</label>
                <select
                  value={topicCategoryId}
                  onChange={(e) => setTopicCategoryId(Number(e.target.value) as any)}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg p-2"
                >
                  <option value="">Kies een onderwerp</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Titel</label>
                <input
                  ref={titleRef}
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg p-2"
                  placeholder="Korte, duidelijke titel"
                  maxLength={120}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Bericht</label>
                <textarea
                  value={topicContent}
                  onChange={(e) => setTopicContent(e.target.value)}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg p-3 min-h-[160px]"
                  placeholder="Schrijf je bericht..."
                  maxLength={5000}
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#3A4D23] flex justify-end gap-2">
              <button onClick={() => setShowNewTopic(false)} className="px-4 py-2 bg-[#3A4D23] rounded-lg hover:bg-[#4A5D33]">Annuleren</button>
              <button onClick={() => createTopic()} disabled={submitting} className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold hover:from-[#B6C948] hover:to-[#8BAE5A] disabled:opacity-60">
                {submitting ? 'Plaatsen...' : 'Plaatsen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumOverview; 