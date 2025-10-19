'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [unanswered, setUnanswered] = useState<Array<{ id: number; title: string; href: string; author: string; created_at: string }>>([]);

  useEffect(() => {
    setIsClient(true);
    fetchCategories();
    fetchUnanswered();
  }, []);

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
      setInitialLoad(false);
    }
  };

  const fetchUnanswered = async () => {
    try {
      const res = await fetch('/api/forum/unanswered?limit=3', { cache: 'no-cache' });
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json as any)?.success && Array.isArray((json as any).topics)) {
        setUnanswered((json as any).topics);
      } else {
        setUnanswered([]);
      }
    } catch {
      setUnanswered([]);
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

  if (!isClient || (loading && initialLoad)) {
    return (
      <div className="w-full min-h-screen bg-[#0A0F0A]">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 xl:gap-12 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 py-10">
          <div className="flex-1">
            <div className="animate-pulse">
              <div className="h-8 bg-[#3A4D23]/30 rounded mb-6"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#232D1A]/90 rounded-2xl p-6 mb-6 border border-[#3A4D23]/20">
                  <div className="h-6 bg-[#3A4D23]/30 rounded mb-4"></div>
                  <div className="h-4 bg-[#3A4D23]/20 rounded mb-2"></div>
                  <div className="h-4 bg-[#3A4D23]/20 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-80">
            <div className="animate-pulse">
              <div className="h-8 bg-[#3A4D23]/30 rounded mb-6"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#232D1A]/90 rounded-2xl p-4 mb-4 border border-[#3A4D23]/20">
                  <div className="h-4 bg-[#3A4D23]/30 rounded mb-2"></div>
                  <div className="h-3 bg-[#3A4D23]/20 rounded w-3/4"></div>
                </div>
              ))}
            </div>
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
        <div className="mb-3 sm:mb-4 lg:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">Forum</h2>
          <p className="text-[#8BAE5A] mt-2 text-sm sm:text-base">Kies een categorie om een discussie te starten</p>
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
            {unanswered.length === 0 ? (
              <li className="text-gray-400">Geen onbeantwoorde vragen gevonden.</li>
            ) : (
              unanswered.map((t) => (
                <li key={t.id}>
                  <span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>
                  <a href={t.href} className="hover:text-[#FFD700] text-white font-medium">{t.title}</a>
                  <span className="text-[#8BAE5A]"> — door {t.author}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>
      </div>
    </div>
  );
};

export default ForumOverview; 