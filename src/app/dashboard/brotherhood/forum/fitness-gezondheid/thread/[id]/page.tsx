'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
  author_id: string;
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
  author_id: string;
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
  const [error, setError] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: UserProfile }>({});

  useEffect(() => {
    console.log('🔄 Thread page mounted, fetching data for topic ID:', params.id);
    fetchThreadData();
  }, [params.id]);

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

  const fetchThreadData = async () => {
    try {
      console.log('📝 Fetching thread data...');
      setLoading(true);
      setError(null);

      const topicId = parseInt(params.id);
      console.log('🔍 Topic ID:', topicId);

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
        console.error('❌ Error fetching topic:', topicError);
        setError(`Topic niet gevonden: ${topicError.message}`);
        return;
      }

      console.log('✅ Topic data received:', topicData);

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          id,
          content,
          created_at,
          author_id
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (postsError) {
        console.error('❌ Error fetching posts:', postsError);
        setError(`Error fetching posts: ${postsError.message}`);
        return;
      }

      console.log('✅ Posts data received:', postsData);

      // Collect all user IDs
      const userIds = new Set<string>();
      if (topicData.author_id) userIds.add(topicData.author_id);
      postsData?.forEach(post => {
        if (post.author_id) userIds.add(post.author_id);
      });

      console.log('👥 Unique user IDs found:', Array.from(userIds));

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

      // Process topic
      const processedTopic: ForumTopic = {
        id: topicData.id,
        title: topicData.title,
        content: topicData.content,
        created_at: topicData.created_at,
        like_count: topicData.like_count || 0,
        author_id: topicData.author_id,
        author: getAuthorInfo(topicData.author_id)
      };

      // Process posts
      const processedPosts = (postsData || []).map((post: any) => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        author_id: post.author_id,
        author: getAuthorInfo(post.author_id)
      }));

      console.log('✅ Processed topic:', processedTopic);
      console.log('✅ Processed posts:', processedPosts);

      setTopic(processedTopic);
      setPosts(processedPosts);
    } catch (error) {
      console.error('❌ Error in fetchThreadData:', error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
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
          <div className="h-8 bg-gray-700 rounded mb-6"></div>
          <div className="bg-[#232D1A]/90 rounded-2xl p-6 mb-6">
            <div className="h-6 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-12">
        <div className="text-center text-white py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Error Loading Thread</h3>
          <p className="text-[#8BAE5A] mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={fetchThreadData}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
            >
              Try Again
            </button>
            <Link 
              href="/dashboard/brotherhood/forum/fitness-gezondheid"
              className="px-6 py-3 rounded-xl bg-[#3A4D23] text-white font-bold shadow hover:bg-[#4A5D33] transition-all"
            >
              Back to Forum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="px-4 md:px-12">
        <div className="text-center text-white py-12">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-xl font-bold mb-2">Topic niet gevonden</h3>
          <p className="text-[#8BAE5A] mb-6">Het opgevraagde topic bestaat niet of is verwijderd.</p>
          <Link 
            href="/dashboard/brotherhood/forum/fitness-gezondheid"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
          >
            Terug naar Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12">
      {/* Debug Info */}
      <div className="mb-4 p-4 bg-[#232D1A]/50 rounded-lg">
        <p className="text-sm text-[#8BAE5A]">
          Debug: Topic ID {topic.id} | Posts: {posts.length} | Loading: {loading.toString()} | Error: {error || 'None'}
        </p>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <Link 
          href="/dashboard/brotherhood/forum/fitness-gezondheid"
          className="inline-flex items-center gap-2 text-[#8BAE5A] hover:text-[#FFD700] transition-colors"
        >
          ← Terug naar Fitness & Gezondheid
        </Link>
      </div>

      {/* Topic */}
      <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">{topic.title}</h1>
        <div className="prose prose-invert max-w-none mb-6">
          <p className="text-[#E5E5E5] whitespace-pre-wrap">{topic.content}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-[#8BAE5A]">
          <div className="flex items-center gap-4">
            <span>Door {topic.author.first_name} {topic.author.last_name}</span>
            <span>•</span>
            <span>{formatDate(topic.created_at)}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>❤️ {topic.like_count}</span>
            <span>💬 {posts.length} reacties</span>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Reacties ({posts.length})</h2>
        {posts.map((post) => (
          <div key={post.id} className="bg-[#232D1A]/70 rounded-xl p-6 border border-[#3A4D23]/30">
            <div className="prose prose-invert max-w-none mb-4">
              <p className="text-[#E5E5E5] whitespace-pre-wrap">{post.content}</p>
            </div>
            <div className="flex items-center justify-between text-sm text-[#8BAE5A]">
              <span>Door {post.author.first_name} {post.author.last_name}</span>
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center text-white py-12">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-bold mb-2">Nog geen reacties</h3>
          <p className="text-[#8BAE5A]">Wees de eerste om te reageren op dit topic!</p>
        </div>
      )}

      {/* Reply Form */}
      <div className="mt-8 bg-[#232D1A]/90 rounded-2xl p-6 border border-[#3A4D23]/40">
        <h3 className="text-lg font-bold text-white mb-4">Plaats een reactie</h3>
        <textarea 
          className="w-full h-32 bg-[#3A4D23]/50 border border-[#8BAE5A]/30 rounded-lg p-4 text-white placeholder-[#8BAE5A]/50 focus:outline-none focus:border-[#FFD700] resize-none"
          placeholder="Schrijf je reactie hier..."
        />
        <div className="flex justify-end mt-4">
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">
            Plaats Reactie
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreadPage; 