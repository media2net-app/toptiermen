'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface ForumPost {
  id: number;
  content: string;
  created_at: string;
  like_count: number;
  author: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface ForumTopic {
  id: number;
  title: string;
  content: string;
  created_at: string;
  like_count: number;
  author: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

const ThreadPage = ({ params }: { params: { id: string } }) => {
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: UserProfile }>({});

  useEffect(() => {
    fetchCurrentUser();
    fetchThreadData();
  }, [params.id]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

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

  const fetchThreadData = async () => {
    try {
      const topicId = parseInt(params.id);
      
      // Fetch topic
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          content,
          created_at,
          like_count,
          author_id
        `)
        .eq('id', topicId)
        .single();

      if (topicError) {
        console.error('Error fetching topic:', topicError);
        return;
      }

      // Fetch posts (replies)
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          id,
          content,
          created_at,
          like_count,
          author_id
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }

      // Collect all user IDs
      const userIds = new Set<string>();
      if (topicData.author_id) userIds.add(topicData.author_id);
      postsData?.forEach(post => {
        if (post.author_id) userIds.add(post.author_id);
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

      // Process topic data
      const processedTopic = {
        id: topicData.id,
        title: topicData.title,
        content: topicData.content,
        created_at: topicData.created_at,
        like_count: topicData.like_count,
        author: getAuthorInfo(topicData.author_id)
      };

      // Process posts data
      const processedPosts = (postsData || []).map((post: any) => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        like_count: post.like_count,
        author: getAuthorInfo(post.author_id)
      }));

      setTopic(processedTopic);
      setPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching thread data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!newReply.trim() || !topic || !currentUser) return;

    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          topic_id: topic.id,
          content: newReply.trim(),
          author_id: currentUser.id
        });

      if (error) {
        console.error('Error posting reply:', error);
        return;
      }

      // Refresh the thread data
      setNewReply('');
      fetchThreadData();
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="px-4 md:px-12">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-6"></div>
          <div className="bg-[#232D1A]/90 rounded-2xl p-6 mb-8">
            <div className="h-4 bg-gray-700 rounded mb-4"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="px-4 md:px-12">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Topic niet gevonden</h2>
          <p className="text-[#8BAE5A]">Het opgevraagde topic bestaat niet of is verwijderd.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#8BAE5A] mb-6 flex gap-2 items-center">
        <span>Forum</span>
        <span className="mx-1">&gt;</span>
        <span>Fitness & Gezondheid</span>
        <span className="mx-1">&gt;</span>
        <span className="text-white font-semibold">{topic.title}</span>
      </nav>

      {/* Opening Post */}
      <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border-l-4 border-[#FFD700] border border-[#3A4D23]/40 p-6 mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Image 
            src={topic.author.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'} 
            alt={`${topic.author.first_name} ${topic.author.last_name}`} 
            width={48} 
            height={48} 
            className="w-12 h-12 rounded-full border-2 border-[#8BAE5A] object-cover" 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{topic.author.first_name} {topic.author.last_name}</span>
              <span className="text-xs text-[#FFD700] bg-[#3A4D23] px-2 py-0.5 rounded">Member</span>
            </div>
            <div className="text-xs text-[#8BAE5A]">{formatDate(topic.created_at)}</div>
          </div>
        </div>
        <div className="text-white text-base mt-2 whitespace-pre-line">{topic.content}</div>
      </div>

      {/* Replies */}
      <div className="space-y-6 mb-10">
        {posts.map((post) => (
          <div key={post.id} className="bg-[#232D1A]/80 rounded-2xl shadow border border-[#3A4D23]/40 p-5 flex gap-4">
            <Image 
              src={post.author.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'} 
              alt={`${post.author.first_name} ${post.author.last_name}`} 
              width={40} 
              height={40} 
              className="w-10 h-10 rounded-full border-2 border-[#8BAE5A] object-cover" 
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white">{post.author.first_name} {post.author.last_name}</span>
                <span className="text-xs text-[#FFD700] bg-[#3A4D23] px-2 py-0.5 rounded">Member</span>
                <span className="text-xs text-[#8BAE5A] ml-2">{formatDate(post.created_at)}</span>
              </div>
              <div className="text-[#E1CBB3] mb-2">{post.content}</div>
              <div className="flex gap-4 text-[#8BAE5A] text-sm">
                <button className="hover:text-[#FFD700] transition-colors flex items-center gap-1">
                  <span role="img" aria-label="boks">👊</span> Boks ({post.like_count})
                </button>
                <button className="hover:text-[#FFD700] transition-colors flex items-center gap-1">
                  <span role="img" aria-label="reageer">💬</span> Reageer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <div className="bg-[#232D1A]/80 rounded-2xl shadow border border-[#3A4D23]/40 p-5">
        <textarea
          className="w-full bg-[#181F17] text-white rounded-xl p-3 border-none focus:ring-0 placeholder:text-[#8BAE5A] mb-3"
          rows={3}
          placeholder="Schrijf een reactie..."
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
        />
        <div className="flex justify-end">
          <button 
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
            onClick={handleSubmitReply}
            disabled={!newReply.trim() || !currentUser}
          >
            Plaats Reactie
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreadPage; 