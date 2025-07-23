'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
    time: string;
  };
}

const ForumOverview = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Fetch categories with topic and post counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('forum_categories')
        .select(`
          id,
          name,
          description,
          emoji,
          slug,
          forum_topics(
            id,
            title,
            created_at,
            author_id,
            reply_count
          )
        `)
        .order('order_index');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        return;
      }

      // Process categories to get counts and last post info
      const processedCategories = categoriesData.map((category: any) => {
        const topics = category.forum_topics || [];
        const topicsCount = topics.length;
        
        // Get total posts count (topics + replies)
        const postsCount = topics.reduce((total: number, topic: any) => {
          // This is a simplified count - in a real app you'd fetch actual post counts
          return total + (topic.reply_count || 0) + 1; // +1 for the original post
        }, 0);

        // Get last post info
        const lastTopic = topics.length > 0 ? topics.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0] : null;

        const lastPost = lastTopic ? {
          title: lastTopic.title,
          author: `User ${lastTopic.author_id?.slice(0, 8) || 'Unknown'}`,
          time: formatTimeAgo(lastTopic.created_at)
        } : undefined;

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          emoji: category.emoji,
          slug: category.slug,
          topics_count: topicsCount,
          posts_count: postsCount,
          last_post: lastPost
        };
      });

      setCategories(processedCategories);
    } catch (error) {
      console.error('Error fetching forum data:', error);
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

  if (loading) {
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

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-0">
      {/* Linkerkolom: Categorieën */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Forum</h2>
          <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">+ Start Nieuwe Discussie</button>
        </div>
        {categories.map((cat, idx) => (
          idx === 0 ? (
            <Link key={cat.id} href={`/dashboard/brotherhood/forum/${cat.slug}`} className="group bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 flex flex-col gap-4 hover:shadow-2xl hover:-translate-y-1 hover:border-[#FFD700] transition-all cursor-pointer no-underline">
              <div className="flex items-center gap-4">
                <span className="text-4xl md:text-5xl">{cat.emoji}</span>
                <div>
                  <div className="text-xl font-bold text-white mb-1">{cat.name}</div>
                  <div className="text-[#8BAE5A] text-sm mb-2">{cat.description}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs mt-2">
                <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-3 py-1 rounded-full font-semibold">Topics: {cat.topics_count}</span>
                <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-3 py-1 rounded-full font-semibold">Reacties: {cat.posts_count}</span>
              </div>
              {cat.last_post && (
                <div className="flex items-center gap-2 mt-2 text-xs text-[#8BAE5A]">
                  <span className="hidden sm:inline">Laatste post:</span>
                  <span className="text-white font-semibold truncate max-w-[120px] sm:max-w-[180px]">Re: {cat.last_post.title}</span>
                  <span className="text-[#FFD700]">door {cat.last_post.author}</span>
                  <span className="text-[#8BAE5A]">- {cat.last_post.time}</span>
                </div>
              )}
            </Link>
          ) : (
            <div key={cat.id} className="group bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 flex flex-col gap-4 hover:shadow-2xl hover:-translate-y-1 hover:border-[#FFD700] transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <span className="text-4xl md:text-5xl">{cat.emoji}</span>
                <div>
                  <div className="text-xl font-bold text-white mb-1">{cat.name}</div>
                  <div className="text-[#8BAE5A] text-sm mb-2">{cat.description}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs mt-2">
                <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-3 py-1 rounded-full font-semibold">Topics: {cat.topics_count}</span>
                <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-3 py-1 rounded-full font-semibold">Reacties: {cat.posts_count}</span>
              </div>
              {cat.last_post && (
                <div className="flex items-center gap-2 mt-2 text-xs text-[#8BAE5A]">
                  <span className="hidden sm:inline">Laatste post:</span>
                  <span className="text-white font-semibold truncate max-w-[120px] sm:max-w-[180px]">Re: {cat.last_post.title}</span>
                  <span className="text-[#FFD700]">door {cat.last_post.author}</span>
                  <span className="text-[#8BAE5A]">- {cat.last_post.time}</span>
                </div>
              )}
            </div>
          )
        ))}
      </div>
      {/* Rechterkolom: Widgets */}
      <aside className="w-full md:w-[340px] flex flex-col gap-6 mt-10 md:mt-0">
        <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-5">
          <h3 className="text-lg font-bold text-white mb-3">Recente Activiteit</h3>
          <ul className="text-[#8BAE5A] text-sm space-y-2">
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
        <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-5">
          <h3 className="text-lg font-bold text-white mb-3">Populaire Topics (Deze Week)</h3>
          <ul className="text-[#8BAE5A] text-sm space-y-2">
            {categories.slice(0, 3).map((cat, idx) => (
              <li key={idx}>
                <span className="inline-block w-2 h-2 bg-[#8BAE5A] rounded-full mr-2 align-middle"></span>
                {cat.last_post?.title || 'Nieuwe discussie'} <span className="text-[#8BAE5A]">({cat.posts_count} reacties)</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-5">
          <h3 className="text-lg font-bold text-white mb-3">Onbeantwoorde Vragen</h3>
          <ul className="text-[#8BAE5A] text-sm space-y-2">
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Hoe herstel je sneller na een zware training?</li>
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Wat is de beste manier om te starten met beleggen?</li>
            <li><span className="inline-block w-2 h-2 bg-[#FFD700] rounded-full mr-2 align-middle"></span>Welke boeken raden jullie aan voor focus?</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default ForumOverview; 