'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: UserProfile }>({});

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchUserProfiles = async (userIds: string[]) => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (error) {
        console.error('Error fetching profiles:', error);
        return {};
      }

      const profilesMap: { [key: string]: UserProfile } = {};
      profiles?.forEach(profile => {
        profilesMap[profile.id] = profile;
      });

      return profilesMap;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return {};
    }
  };

  const fetchTopics = async () => {
    try {
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
        console.error('Error fetching topics:', error);
        return;
      }

      // Collect all user IDs
      const userIds = new Set<string>();
      topicsData?.forEach(topic => {
        if (topic.author_id) userIds.add(topic.author_id);
      });

      // Fetch user profiles
      const profiles = await fetchUserProfiles(Array.from(userIds));
      setUserProfiles(profiles);

      // Helper function to get author info
      const getAuthorInfo = (authorId: string) => {
        const profile = profiles[authorId];
        if (profile) {
          const nameParts = profile.full_name.split(' ');
          return {
            first_name: nameParts[0] || 'User',
            last_name: nameParts.slice(1).join(' ') || '',
            avatar_url: profile.avatar_url
          };
        }
        return {
          first_name: 'User',
          last_name: '',
          avatar_url: undefined
        };
      };

      const processedTopics = (topicsData || []).map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        created_at: topic.created_at,
        last_reply_at: topic.last_reply_at,
        reply_count: topic.reply_count || 0,
        view_count: topic.view_count || 0,
        author: getAuthorInfo(topic.author_id)
      }));

      setTopics(processedTopics);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
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
      <div className="px-4 md:px-12">
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
    );
  }

  return (
    <div className="px-4 md:px-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">💪 Fitness & Gezondheid</h1>
          <p className="text-[#8BAE5A]">Alles over trainingsschema's, voeding, herstel en blessurepreventie.</p>
        </div>
        <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">
          + Start Nieuwe Topic
        </button>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {topics.map((topic) => (
          <Link 
            key={topic.id} 
            href={`/dashboard/brotherhood/forum/fitness-gezondheid/thread/${topic.id}`}
            className="block bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 hover:shadow-2xl hover:-translate-y-1 hover:border-[#FFD700] transition-all cursor-pointer no-underline"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2 hover:text-[#FFD700] transition-colors">
                  {topic.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-[#8BAE5A] mb-3">
                  <span>Door {topic.author.first_name} {topic.author.last_name}</span>
                  <span>•</span>
                  <span>{formatDate(topic.created_at)}</span>
                  {topic.last_reply_at && (
                    <>
                      <span>•</span>
                      <span>Laatste reactie {formatTimeAgo(topic.last_reply_at)}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-3 py-1 rounded-full font-semibold">
                    {topic.reply_count} reacties
                  </span>
                  <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-3 py-1 rounded-full font-semibold">
                    {topic.view_count} views
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {topics.length === 0 && (
        <div className="text-center text-white py-12">
          <div className="text-6xl mb-4">💪</div>
          <h3 className="text-xl font-bold mb-2">Nog geen topics</h3>
          <p className="text-[#8BAE5A] mb-6">Wees de eerste om een discussie te starten over fitness en gezondheid!</p>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">
            Start Eerste Topic
          </button>
        </div>
      )}
    </div>
  );
};

export default FitnessGezondheidPage; 