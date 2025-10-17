'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface ForumTopic {
  id: number;
  title: string;
  created_at: string;
  last_reply_at: string;
  reply_count: number;
  view_count: number;
  author: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  emoji: string;
  slug: string;
}

export default function AlgemeenForumPage() {
  const slug = 'algemeen';
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: UserProfile }>({});

  const [showNewTopic, setShowNewTopic] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicContent, setTopicContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchCategoryAndTopics();
  }, []);

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

  const fetchUserProfiles = async (userIds: string[]) => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      if (error) return {};
      const map: { [key: string]: UserProfile } = {};
      profiles?.forEach(p => { map[p.id] = p; });
      return map;
    } catch { return {}; }
  };

  const fetchCategoryAndTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      // 1) Category by slug
      const { data: categoryData, error: categoryError } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', slug)
        .single();
      if (categoryError) { setError(`Category niet gevonden`); setLoading(false); return; }
      setCategory(categoryData as any);

      // 2) Topics for category
      const { data: topicsData, error: topicsError } = await supabase
        .from('forum_topics')
        .select('id,title,created_at,last_reply_at,reply_count,view_count,author_id')
        .eq('category_id', (categoryData as any).id)
        .order('created_at', { ascending: false });
      if (topicsError) { setError(`Error fetching topics: ${topicsError.message}`); setLoading(false); return; }

      const ids = Array.from(new Set((topicsData || []).map(t => t.author_id).filter(Boolean)));
      const profiles = await fetchUserProfiles(ids);
      const getAuthor = (authorId: string) => {
        const p = (profiles as any)[authorId];
        if (!p) return { first_name: 'User', last_name: '', avatar_url: undefined };
        const parts = (p.full_name || 'User').split(' ');
        return { first_name: parts[0] || 'User', last_name: parts.slice(1).join(' ') || '', avatar_url: p.avatar_url };
      };
      const processed: ForumTopic[] = (topicsData || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        created_at: t.created_at,
        last_reply_at: t.last_reply_at,
        reply_count: t.reply_count || 0,
        view_count: t.view_count || 0,
        author: getAuthor(t.author_id)
      }));
      setTopics(processed);
    } catch (e: any) {
      setError(e?.message || 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async () => {
    if (!user?.id) { toast.error('Log in om een topic te plaatsen'); return; }
    if (!category?.id) { toast.error('Categorie niet gevonden'); return; }
    if (!topicTitle.trim() || topicTitle.trim().length < 5) { toast.error('Titel moet minimaal 5 karakters bevatten'); return; }
    if (!topicContent.trim() || topicContent.trim().length < 10) { toast.error('Bericht moet minimaal 10 karakters bevatten'); return; }
    try {
      setSubmitting(true);
      const res = await fetch('/api/forum/create-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: category.id,
          title: topicTitle.trim(),
          content: topicContent.trim(),
          author_id: user.id
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Aanmaken mislukt');
      toast.success('Topic aangemaakt! Je wordt doorgestuurd...');
      setShowNewTopic(false);
      setTopicTitle('');
      setTopicContent('');
      if (data.data?.url) router.push(data.data.url); else fetchCategoryAndTopics();
    } catch (e: any) {
      toast.error(e?.message || 'Er ging iets mis');
    } finally { setSubmitting(false); }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString); const now = new Date(); const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Nu'; if (diff < 60) return `${diff} min geleden`; if (diff < 1440) return `${Math.floor(diff/60)} uur geleden`; return `${Math.floor(diff/1440)} dagen geleden`;
  };

  if (loading) {
    return (
      <div className="px-2 sm:px-4 md:px-8 lg:px-12">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-700 rounded mb-4 sm:mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#232D1A]/90 rounded-xl lg:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="h-5 sm:h-6 bg-gray-700 rounded mb-3 sm:mb-4"></div>
              <div className="h-3 sm:h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="px-2 sm:px-4 md:px-8 lg:px-12">
        <div className="text-center text-white py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">⚠️</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">{error || 'Category niet gevonden'}</h3>
          <p className="text-[#8BAE5A] mb-4 sm:mb-6 text-sm sm:text-base">Probeer opnieuw of ga naar het introductietopic.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button onClick={fetchCategoryAndTopics} className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-[#3A4D23] text-white hover:bg-[#4A5D33]">Opnieuw laden</button>
            <Link href="/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden" className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold">Naar Introductietopic</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 md:px-8 lg:px-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{category.emoji} {category.name}</h1>
          <p className="text-[#8BAE5A] text-sm sm:text-base">{category.description}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link 
            href="/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden"
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-sm sm:text-base shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all text-center"
          >
            👋 Stel je voor
          </Link>
          <button 
            onClick={() => setShowNewTopic(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-[#3A4D23] text-white font-bold text-sm sm:text-base shadow hover:bg-[#4A5D33] transition-all"
          >
            + Start Nieuwe Topic
          </button>
        </div>
      </div>

      {/* Topics List (pinned first) */}
      <div className="space-y-3 sm:space-y-4">
        {(() => {
          const isPinned = (t: ForumTopic) => t.id === 19 || (t.title || '').toLowerCase().includes('voorstellen - nieuwe leden');
          const pinned = topics.find(isPinned);
          const rest = topics.filter(t => !isPinned(t));

          return (
            <>
              {pinned && (
                <Link 
                  key={`pinned-${pinned.id}`} 
                  href={`/dashboard/brotherhood/forum/${category.slug}/thread/${pinned.id}`}
                  className="block bg-[#232D1A]/90 rounded-xl lg:rounded-2xl shadow-lg border border-[#FFD700]/60 p-4 sm:p-6 hover:shadow-2xl hover:-translate-y-1 hover:border-[#FFD700] transition-all cursor-pointer no-underline"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-white mb-2 hover:text-[#FFD700] transition-colors line-clamp-2">
                        <span className="mr-2 text-[#FFD700]">📌</span>
                        {pinned.title}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-[#8BAE5A] mb-3">
                        <span>Door {pinned.author.first_name} {pinned.author.last_name}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formatDate(pinned.created_at)}</span>
                        {pinned.last_reply_at && (<><span className="hidden sm:inline">•</span><span>Laatste reactie {formatTimeAgo(pinned.last_reply_at)}</span></>)}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs">
                        <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 sm:px-3 py-1 rounded-full font-semibold">{pinned.reply_count} reacties</span>
                        <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 sm:px-3 py-1 rounded-full font-semibold">{pinned.view_count} views</span>
                        <span className="bg-[#FFD700]/20 text-[#FFD700] px-2 sm:px-3 py-1 rounded-full font-semibold">Pinned</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {rest.map((topic) => (
                <Link 
                  key={topic.id} 
                  href={`/dashboard/brotherhood/forum/${category.slug}/thread/${topic.id}`}
                  className="block bg-[#232D1A]/90 rounded-xl lg:rounded-2xl shadow-lg border border-[#3A4D23]/40 p-4 sm:p-6 hover:shadow-2xl hover:-translate-y-1 hover:border-[#FFD700] transition-all cursor-pointer no-underline"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-white mb-2 hover:text-[#FFD700] transition-colors line-clamp-2">{topic.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-[#8BAE5A] mb-3">
                        <span>Door {topic.author.first_name} {topic.author.last_name}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formatDate(topic.created_at)}</span>
                        {topic.last_reply_at && (<><span className="hidden sm:inline">•</span><span>Laatste reactie {formatTimeAgo(topic.last_reply_at)}</span></>)}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs">
                        <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 sm:px-3 py-1 rounded-full font-semibold">{topic.reply_count} reacties</span>
                        <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 sm:px-3 py-1 rounded-full font-semibold">{topic.view_count} views</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          );
        })()}
      </div>

      {topics.length === 0 && (
        <div className="text-center text-white py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">{category.emoji}</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">Nog geen topics</h3>
          <p className="text-[#8BAE5A] mb-4 sm:mb-6 text-sm sm:text-base">Start een discussie of stel je voor als nieuw lid.</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button onClick={() => setShowNewTopic(true)} className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-[#3A4D23] text-white font-semibold hover:bg-[#4A5D33] transition-colors">Start Eerste Topic</button>
            <Link href="/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden" className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold">👋 Stel je voor</Link>
          </div>
        </div>
      )}

      {/* New Topic Modal */}
      {showNewTopic && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div ref={modalRef} tabIndex={-1} className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl w-full max-w-2xl text-white overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#3A4D23]">
              <h3 className="text-lg font-bold">Nieuwe discussie in {category.emoji} {category.name}</h3>
              <button onClick={() => setShowNewTopic(false)} className="px-2 py-1 rounded hover:bg-[#3A4D23] transition-colors">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Titel <span className="text-red-400">*</span></label>
                <input ref={titleRef} value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors" placeholder="Korte, duidelijke titel (min. 5 karakters)" maxLength={120} />
                <div className="flex justify-between mt-1"><span className="text-xs text-gray-400">Minimaal 5, maximaal 120 karakters</span><span className={`text-xs ${topicTitle.length > 120 ? 'text-red-400' : 'text-gray-400'}`}>{topicTitle.length}/120</span></div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Bericht <span className="text-red-400">*</span></label>
                <textarea value={topicContent} onChange={(e) => setTopicContent(e.target.value)} className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg p-3 min-h-[200px] text-white placeholder-gray-500 focus:outline-none focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors resize-y" placeholder="Schrijf je bericht... (min. 10 karakters)" maxLength={5000} />
                <div className="flex justify-between mt-1"><span className="text-xs text-gray-400">Minimaal 10, maximaal 5000 karakters</span><span className={`text-xs ${topicContent.length > 5000 ? 'text-red-400' : 'text-gray-400'}`}>{topicContent.length}/5000</span></div>
              </div>
            </div>
            <div className="p-4 border-t border-[#3A4D23] flex justify-end gap-2">
              <button onClick={() => setShowNewTopic(false)} className="px-4 py-2 bg-[#3A4D23] rounded-lg hover:bg-[#4A5D33] transition-colors">Annuleren</button>
              <button onClick={createTopic} disabled={submitting || !topicTitle.trim() || !topicContent.trim()} className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold hover:from-[#B6C948] hover:to-[#8BAE5A] disabled:opacity-60 disabled:cursor-not-allowed transition-all">{submitting ? 'Plaatsen...' : 'Plaatsen'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}