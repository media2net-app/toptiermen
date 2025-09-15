'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  emoji: string;
  slug: string;
}

const CategoryPage = ({ params }: { params: { slug: string } }) => {
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: UserProfile }>({});

  useEffect(() => {
    console.log('🔄 Category page mounted, fetching data for slug:', params.slug);
    fetchCategoryAndTopics();
  }, [params.slug]);

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

  const fetchCategoryAndTopics = async () => {
    try {
      console.log('📝 Fetching category and topics...');
      setLoading(true);
      setError(null);

      // First, get the category by slug
      const { data: categoryData, error: categoryError } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (categoryError) {
        console.error('❌ Error fetching category:', categoryError);
        setError(`Category niet gevonden: ${categoryError.message}`);
        return;
      }

      console.log('✅ Category data received:', categoryData);
      setCategory(categoryData);

      // Then fetch topics for this category
      const { data: topicsData, error: topicsError } = await supabase
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
        .eq('category_id', categoryData.id)
        .order('created_at', { ascending: false });

      if (topicsError) {
        console.error('❌ Error fetching topics:', topicsError);
        setError(`Error fetching topics: ${topicsError.message}`);
        return;
      }

      console.log('✅ Topics data received:', topicsData);

      if (!topicsData || topicsData.length === 0) {
        console.log('⚠️ No topics found');
        setTopics([]);
        setLoading(false);
        return;
      }

      // Collect all user IDs
      const userIds = new Set<string>();
      topicsData.forEach(topic => {
        if (topic.author_id) userIds.add(topic.author_id);
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

      const processedTopics = topicsData.map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        created_at: topic.created_at,
        last_reply_at: topic.last_reply_at,
        reply_count: topic.reply_count || 0,
        view_count: topic.view_count || 0,
        author: getAuthorInfo(topic.author_id)
      }));

      console.log('✅ Processed topics:', processedTopics);
      setTopics(processedTopics);
    } catch (error) {
      console.error('❌ Error in fetchCategoryAndTopics:', error);
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

  if (error) {
    return (
      <div className="px-2 sm:px-4 md:px-8 lg:px-12">
        <div className="text-center text-white py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">⚠️</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">Error Loading Category</h3>
          <p className="text-[#8BAE5A] mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button 
              onClick={fetchCategoryAndTopics}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg lg:rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-sm sm:text-base shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
            >
              Try Again
            </button>
            <Link 
              href="/dashboard/brotherhood/forum"
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg lg:rounded-xl bg-[#3A4D23] text-white font-bold text-sm sm:text-base shadow hover:bg-[#4A5D33] transition-all text-center"
            >
              Back to Forum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="px-2 sm:px-4 md:px-8 lg:px-12">
        <div className="text-center text-white py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">❓</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">Category niet gevonden</h3>
          <p className="text-[#8BAE5A] mb-4 sm:mb-6 text-sm sm:text-base">De opgevraagde categorie bestaat niet.</p>
          <Link 
            href="/dashboard/brotherhood/forum"
            className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg lg:rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-sm sm:text-base shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
          >
            Terug naar Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 md:px-8 lg:px-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {category.emoji} {category.name}
          </h1>
          <p className="text-[#8BAE5A] text-sm sm:text-base">{category.description}</p>
        </div>
        <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg lg:rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-sm sm:text-base shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">
          + Start Nieuwe Topic
        </button>
      </div>

      {/* Debug Info */}
      <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-[#232D1A]/50 rounded-lg">
        <p className="text-xs sm:text-sm text-[#8BAE5A]">
          Debug: Category "{category.name}" (ID: {category.id}) | Topics: {topics.length} | Loading: {loading.toString()} | Error: {error || 'None'}
        </p>
      </div>

      {/* Topics List */}
      <div className="space-y-3 sm:space-y-4">
        {topics.map((topic) => (
          <Link 
            key={topic.id} 
            href={`/dashboard/brotherhood/forum/${category.slug}/thread/${topic.id}`}
            className="block bg-[#232D1A]/90 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border border-[#3A4D23]/40 p-4 sm:p-6 hover:shadow-2xl hover:-translate-y-1 hover:border-[#FFD700] transition-all cursor-pointer no-underline"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 hover:text-[#FFD700] transition-colors line-clamp-2">
                  {topic.title}
                </h3>
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
            </div>
          </Link>
        ))}
      </div>

      {topics.length === 0 && (
        <div className="text-center text-white py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">{category.emoji}</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">Nog geen topics</h3>
          <p className="text-[#8BAE5A] mb-4 sm:mb-6 text-sm sm:text-base">Wees de eerste om een discussie te starten in {category.name}!</p>
          <button className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg lg:rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-sm sm:text-base shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">
            Start Eerste Topic
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
