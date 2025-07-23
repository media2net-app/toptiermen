'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface ForumTopic {
  id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  reply_count: number;
  like_count: number;
  created_at: string;
  last_reply_at?: string;
  author: {
    first_name: string;
    last_name: string;
  };
  last_reply_author?: {
    first_name: string;
    last_name: string;
  };
}

const FitnessGezondheidCategory = () => {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      // Get category ID for fitness-gezondheid
      const { data: categoryData, error: categoryError } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('slug', 'fitness-gezondheid')
        .single();

      if (categoryError || !categoryData) {
        console.error('Error fetching category:', categoryError);
        return;
      }

      // Fetch topics for this category
      const { data: topicsData, error: topicsError } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          content,
          is_pinned,
          reply_count,
          like_count,
          created_at,
          last_reply_at,
          author_id
        `)
        .eq('category_id', categoryData.id)
        .order('is_pinned', { ascending: false })
        .order('last_reply_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (topicsError) {
        console.error('Error fetching topics:', topicsError);
        return;
      }

      // Process the data to match the interface
      const processedTopics = (topicsData || []).map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        content: topic.content,
        is_pinned: topic.is_pinned,
        reply_count: topic.reply_count,
        like_count: topic.like_count,
        created_at: topic.created_at,
        last_reply_at: topic.last_reply_at,
        author: {
          first_name: `User ${topic.author_id?.slice(0, 8) || 'Unknown'}`,
          last_name: ''
        }
      }));

      setTopics(processedTopics);
    } catch (error) {
      console.error('Error fetching forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-6"></div>
          <div className="bg-[#232D1A]/90 rounded-2xl p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Fitness & Gezondheid</h2>
          <p className="text-[#8BAE5A] text-sm">Alles over trainingsschema's, voeding, herstel en blessurepreventie.</p>
        </div>
        <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">+ Start Nieuwe Discussie</button>
      </div>
      <div className="overflow-x-auto bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-[#8BAE5A] border-b border-[#3A4D23]/40">
              <th className="text-left px-6 py-4 font-semibold">Onderwerp</th>
              <th className="text-left px-6 py-4 font-semibold">Gestart door</th>
              <th className="text-center px-4 py-4 font-semibold">Reacties</th>
              <th className="text-center px-4 py-4 font-semibold">Boks 👊</th>
              <th className="text-left px-6 py-4 font-semibold">Laatste activiteit</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              topic.is_pinned ? (
                <tr key={topic.id} className="border-b border-[#3A4D23]/20 bg-[#3A4D23]/30">
                  <td className="px-6 py-4 text-white font-semibold flex items-center gap-2">
                    <span className="text-[#FFD700]">📌</span>
                    <span>{topic.title}</span>
                  </td>
                  <td className="px-6 py-4 text-[#8BAE5A]">
                    {topic.author.first_name} {topic.author.last_name}<br />
                    <span className="text-xs text-[#8BAE5A]/70">{formatDate(topic.created_at)}</span>
                  </td>
                  <td className="px-4 py-4 text-center text-[#FFD700] font-bold">{topic.reply_count}</td>
                  <td className="px-4 py-4 text-center text-[#8BAE5A] font-bold">{topic.like_count}</td>
                  <td className="px-6 py-4 text-[#8BAE5A]">
                    <span className="font-semibold text-white">
                      {topic.last_reply_at ? topic.author.first_name : topic.author.first_name}
                    </span>
                    <span className="ml-2 text-xs text-[#8BAE5A]/70">
                      {topic.last_reply_at ? formatTime(topic.last_reply_at) : formatTime(topic.created_at)}
                    </span>
                  </td>
                </tr>
              ) : (
                <tr key={topic.id} className="border-b border-[#3A4D23]/20 hover:bg-[#181F17]/60 transition cursor-pointer">
                  <td className="px-6 py-4 text-white font-semibold flex items-center gap-2">
                    <Link href={`/dashboard/brotherhood/forum/fitness-gezondheid/thread/${topic.id}`} className="w-full block hover:underline focus:outline-none">
                      {topic.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-[#8BAE5A]">
                    {topic.author.first_name} {topic.author.last_name}<br />
                    <span className="text-xs text-[#8BAE5A]/70">{formatDate(topic.created_at)}</span>
                  </td>
                  <td className="px-4 py-4 text-center text-[#FFD700] font-bold">{topic.reply_count}</td>
                  <td className="px-4 py-4 text-center text-[#8BAE5A] font-bold">{topic.like_count}</td>
                  <td className="px-6 py-4 text-[#8BAE5A]">
                    <span className="font-semibold text-white">
                      {topic.last_reply_at ? topic.author.first_name : topic.author.first_name}
                    </span>
                    <span className="ml-2 text-xs text-[#8BAE5A]/70">
                      {topic.last_reply_at ? formatTime(topic.last_reply_at) : formatTime(topic.created_at)}
                    </span>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FitnessGezondheidCategory; 