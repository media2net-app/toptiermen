'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';

// Force dynamic rendering to prevent navigator errors
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

const FitnessGezondheidPage = () => {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<ForumTopic | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicContent, setTopicContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    const allowlist = new Set<string>(['chiel@media2net.nl','rick@media2net.nl']);
    const userEmailRaw = (user as any)?.email || (user as any)?.user_metadata?.email;
    const userEmail = typeof userEmailRaw === 'string' ? userEmailRaw.toLowerCase() : undefined;
    const isAllowlisted = userEmail ? allowlist.has(userEmail) : false;
    if (isAllowlisted) setIsAdmin(true);
    const run = async () => {
      try {
        if (!user?.id) { if (!userEmail) setIsAdmin(false); return; }
        const { data } = await supabase
          .from('profiles')
          .select('is_admin, role, email')
          .eq('id', user.id)
          .single();
        const emailRaw = userEmail || (data as any)?.email;
        const email = typeof emailRaw === 'string' ? emailRaw.toLowerCase() : undefined;
        const isAllow = email ? allowlist.has(email) : false;
        const flag = Boolean((data as any)?.is_admin) || (data as any)?.role === 'admin' || isAllow;
        setIsAdmin(!!flag);
      } catch {
        setIsAdmin(isAllowlisted);
      }
    };
    run();
  }, [user?.id]);

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

  const createTopic = async () => {
    if (!user?.id) { 
      toast.error('Log in om een topic te plaatsen'); 
      return; 
    }
    
    // Validation
    if (!topicTitle.trim()) {
      toast.error('Vul een titel in');
      return;
    }
    if (topicTitle.trim().length < 5) {
      toast.error('Titel moet minimaal 5 karakters bevatten');
      return;
    }
    if (topicTitle.trim().length > 120) {
      toast.error('Titel mag maximaal 120 karakters bevatten');
      return;
    }
    if (!topicContent.trim()) {
      toast.error('Vul een bericht in');
      return;
    }
    if (topicContent.trim().length < 10) {
      toast.error('Bericht moet minimaal 10 karakters bevatten');
      return;
    }
    if (topicContent.trim().length > 5000) {
      toast.error('Bericht mag maximaal 5000 karakters bevatten');
      return;
    }
    
    try {
      setSubmitting(true);
      const res = await fetch('/api/forum/create-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: 1, // Fitness & Gezondheid
          title: topicTitle.trim(),
          content: topicContent.trim(),
          author_id: user.id
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Aanmaken mislukt');
      }
      toast.success('Topic aangemaakt! Je wordt doorgestuurd...');
      setShowNewTopic(false);
      setTopicTitle('');
      setTopicContent('');
      
      // Redirect to the new topic
      if (data.data?.url) {
        router.push(data.data.url);
      } else {
        // Fallback: refresh topics
        fetchTopics();
      }
    } catch (e: any) {
      toast.error(e.message || 'Er ging iets mis');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: topicsData, error } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          created_at,
          last_reply_at,
          reply_count,
          view_count,
          author_id
        `)
        .eq('category_id', 1) // Fitness & Gezondheid category
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching topics:', error);
        setError(`Error fetching topics: ${error.message}`);
        return;
      }

      console.log('✅ Topics data received:', topicsData);

      if (!topicsData || topicsData.length === 0) {
        console.log('⚠️ No topics found');
        setTopics([]);
        setLoading(false);
        return;
      }

      const processedTopics = topicsData.map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        created_at: topic.created_at,
        last_reply_at: topic.last_reply_at,
        reply_count: topic.reply_count || 0,
        view_count: topic.view_count || 0,
        author: { first_name: 'User', last_name: '', avatar_url: undefined }
      }));

      console.log('✅ Processed topics:', processedTopics);
      setTopics(processedTopics);
    } catch (error) {
      console.error('❌ Error in fetchTopics:', error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfiles = async (userIds: string[]) => {
    try {
      console.log('👤 Fetching user profiles for:', userIds);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (error) {
        console.error('❌ Error fetching profiles:', error);
        return {};
      }

      const profilesMap: { [key: string]: UserProfile } = {};
      profiles?.forEach(profile => {
        profilesMap[profile.id] = profile;
      });

      console.log('✅ User profiles fetched:', profilesMap);
      return profilesMap;
    } catch (error) {
      console.error('❌ Error fetching profiles:', error);
      return {};
    }
  };

  const deleteTopic = async () => {
    if (!topicToDelete) return;
    try {
      setDeleting(true);
      const res = await fetch('/api/admin/forum/delete-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic_id: topicToDelete!.id })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Verwijderen mislukt');
      }
      toast.success('Topic verwijderd');
      setShowDeleteModal(false);
      setTopicToDelete(null);
      await fetchTopics();
    } catch (e: any) {
      toast.error(e?.message || 'Kon topic niet verwijderen');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  return (
    <div className="px-2 sm:px-4 md:px-8 lg:px-12">
      {error && (
        <div className="text-center text-white py-6 sm:py-8 mb-4 sm:mb-6 bg-red-900/20 border border-red-600/30 rounded-xl">
          <div className="text-3xl sm:text-5xl mb-2">⚠️</div>
          <h3 className="text-base sm:text-lg font-bold mb-1">Error Loading Topics</h3>
          <p className="text-[#8BAE5A] mb-3 text-xs sm:text-sm">{error}</p>
          <button
            onClick={fetchTopics}
            className="px-4 sm:px-5 py-2 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
          >
            Probeer opnieuw
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">💪 Fitness & Gezondheid</h1>
          <p className="text-[#8BAE5A] text-sm sm:text-base">Alles over trainingsschema's, voeding, herstel en blessurepreventie.</p>
        </div>
        <button 
          onClick={() => setShowNewTopic(true)}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg lg:rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-sm sm:text-base shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
        >
          + Start Nieuwe Topic
        </button>
      </div>

      {/* Debug Info */}
      <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-[#232D1A]/50 rounded-lg">
        <p className="text-xs sm:text-sm text-[#8BAE5A]">
          Debug: {topics.length} topics loaded | Loading: {loading.toString()} | Error: {error || 'None'}
        </p>
      </div>

      {/* Topics List */}
      <div className="space-y-3 sm:space-y-4">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-[#232D1A]/90 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border border-[#3A4D23]/40 p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-1">
                <Link href={`/dashboard/brotherhood/forum/fitness-gezondheid/thread/${topic.id}`} className="block no-underline">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 hover:text-[#FFD700] transition-colors line-clamp-2">
                    {topic.title}
                  </h3>
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-[#8BAE5A] mb-3">
                  <span>Door {topic.author.first_name} {topic.author.last_name}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{formatDate(topic.created_at)}</span>
                  {topic.last_reply_at && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span>Laatste reactie {formatTimeAgo(topic.last_reply_at)}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-xs">
                  <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 sm:px-3 py-1 rounded-full font-semibold">
                    {topic.reply_count} reacties
                  </span>
                  <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 sm:px-3 py-1 rounded-full font-semibold">
                    {topic.view_count} views
                  </span>
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => { setTopicToDelete(topic); setShowDeleteModal(true); }}
                  className="ml-3 px-3 py-1.5 bg-red-600/20 border border-red-500/30 text-red-400 rounded hover:bg-red-600/30 text-xs"
                  title="Verwijder topic"
                >
                  Verwijderen
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {topics.length === 0 && (
        <div className="text-center text-white py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">💪</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">Nog geen topics</h3>
          <p className="text-[#8BAE5A] mb-4 sm:mb-6 text-sm sm:text-base">Wees de eerste om een discussie te starten over fitness en gezondheid!</p>
          <button 
            onClick={() => setShowNewTopic(true)}
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg lg:rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-sm sm:text-base shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
          >
            Start Eerste Topic
          </button>
        </div>
      )}

      {/* New Topic Modal */}
      {showNewTopic && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            ref={modalRef}
            tabIndex={-1}
            className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl w-full max-w-2xl text-white overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#3A4D23]">
              <h3 className="text-lg font-bold">Nieuwe discussie in 💪 Fitness & Gezondheid</h3>
              <button onClick={() => setShowNewTopic(false)} className="px-2 py-1 rounded hover:bg-[#3A4D23] transition-colors">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Titel <span className="text-red-400">*</span>
                </label>
                <input
                  ref={titleRef}
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                  placeholder="Korte, duidelijke titel voor je discussie (min. 5 karakters)"
                  maxLength={120}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Minimaal 5, maximaal 120 karakters</span>
                  <span className={`text-xs ${topicTitle.length > 120 ? 'text-red-400' : 'text-gray-400'}`}>
                    {topicTitle.length}/120
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Bericht <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={topicContent}
                  onChange={(e) => setTopicContent(e.target.value)}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg p-3 min-h-[200px] text-white placeholder-gray-500 focus:outline-none focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors resize-y"
                  placeholder="Schrijf je bericht... (min. 10 karakters)"
                  maxLength={5000}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Minimaal 10, maximaal 5000 karakters</span>
                  <span className={`text-xs ${topicContent.length > 5000 ? 'text-red-400' : 'text-gray-400'}`}>
                    {topicContent.length}/5000
                  </span>
                </div>
              </div>
              <div className="bg-[#3A4D23]/30 rounded-lg p-3 text-xs text-[#8BAE5A]">
                <strong>💡 Tips voor een goede discussie:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Gebruik een duidelijke, beschrijvende titel</li>
                  <li>Geef voldoende context in je bericht</li>
                  <li>Blijf respectvol en constructief</li>
                  <li>Check of je topic nog niet bestaat</li>
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-[#3A4D23] flex justify-end gap-2">
              <button 
                onClick={() => setShowNewTopic(false)} 
                className="px-4 py-2 bg-[#3A4D23] rounded-lg hover:bg-[#4A5D33] transition-colors"
              >
                Annuleren
              </button>
              <button 
                onClick={createTopic} 
                disabled={submitting || !topicTitle.trim() || !topicContent.trim()}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold hover:from-[#B6C948] hover:to-[#8BAE5A] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? 'Plaatsen...' : 'Plaatsen'}
              </button>
            </div>
          </div>
        </div>
      )}

    {/* Delete Topic Modal */}
    {showDeleteModal && topicToDelete && (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div
          className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl w-full max-w-md text-white overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-[#3A4D23]">
            <h3 className="text-lg font-bold">Verwijder topic</h3>
            <button onClick={() => setShowDeleteModal(false)} className="px-2 py-1 rounded hover:bg-[#3A4D23] transition-colors">✕</button>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-[#8BAE5A]">Weet je zeker dat je het topic "{topicToDelete.title}" wilt verwijderen?</p>
          </div>
          <div className="p-4 border-t border-[#3A4D23] flex justify-end gap-2">
            <button 
              onClick={() => setShowDeleteModal(false)} 
              className="px-4 py-2 bg-[#3A4D23] rounded-lg hover:bg-[#4A5D33] transition-colors"
            >
              Annuleren
            </button>
            <button 
              onClick={deleteTopic} 
              className="px-5 py-2 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition-colors"
              disabled={deleting}
            >
              Verwijderen
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default FitnessGezondheidPage;