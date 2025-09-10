'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Breadcrumb } from '@/components/Breadcrumb';

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
  description?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  posts_count: number;
  last_post_at?: string;
  last_post_author?: string;
}

export default function AlgemeenForumPage() {
  const { user } = useSupabaseAuth();
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
      setLoading(true);
      console.log('🔍 Fetching topics for Algemeen category...');

      // Get topics for the "algemeen" category
      const { data: topicsData, error: topicsError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          forum_categories!inner(name, slug)
        `)
        .eq('forum_categories.slug', 'algemeen')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (topicsError) {
        console.error('Error fetching topics:', topicsError);
        return;
      }

      console.log('📝 Topics query result:', topicsData);

      if (topicsData && topicsData.length > 0) {
        setTopics(topicsData);

        // Get unique user IDs for profiles
        const userIds = [...new Set(topicsData.map(topic => topic.author_id))];
        const profiles = await fetchUserProfiles(userIds);
        setUserProfiles(profiles);
      } else {
        console.log('❌ No topics found for algemeen category');
        setTopics([]);
      }
    } catch (error) {
      console.error('Error in fetchTopics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Zojuist';
    if (diffInHours < 24) return `${diffInHours} uur geleden`;
    if (diffInHours < 48) return 'Gisteren';
    return date.toLocaleDateString('nl-NL');
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Brotherhood', href: '/dashboard/brotherhood' },
    { label: 'Forum', href: '/dashboard/brotherhood/forum' },
    { label: 'Algemeen', href: '/dashboard/brotherhood/forum/algemeen' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbs} />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbs} />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">💬 Algemeen</h1>
          <p className="text-[#8BAE5A] text-lg">Algemene discussies en vragen</p>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {topics.length === 0 ? (
            <div className="bg-[#232D1A]/80 rounded-2xl p-8 text-center border border-[#3A4D23]/40">
              <div className="text-[#8BAE5A] text-lg mb-4">Geen topics gevonden</div>
              <p className="text-gray-400 mb-6">Er zijn nog geen discussies gestart in deze categorie.</p>
              <Link 
                href="/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden"
                className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
              >
                👋 Stel je voor aan nieuwe leden
              </Link>
            </div>
          ) : (
            topics.map((topic) => {
              const author = userProfiles[topic.author_id];
              return (
                <Link
                  key={topic.id}
                  href={`/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden`}
                  className="block bg-[#232D1A]/80 rounded-2xl p-6 border border-[#3A4D23]/40 hover:border-[#8BAE5A]/50 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {topic.is_pinned && (
                          <span className="text-[#FFD700] text-lg">📌</span>
                        )}
                        <h3 className="text-xl font-bold text-white group-hover:text-[#8BAE5A] transition-colors">
                          {topic.title}
                        </h3>
                      </div>
                      
                      {topic.description && (
                        <p className="text-gray-300 mb-4 line-clamp-2">
                          {topic.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center text-xs font-bold text-black">
                            {author?.full_name?.charAt(0) || '?'}
                          </div>
                          <span>{author?.full_name || 'Onbekend'}</span>
                        </div>
                        <span>•</span>
                        <span>{formatDate(topic.created_at)}</span>
                        <span>•</span>
                        <span>{topic.posts_count} reacties</span>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-400 ml-4">
                      {topic.last_post_at && (
                        <>
                          <div>Laatste reactie:</div>
                          <div className="text-[#8BAE5A] font-semibold">
                            {formatDate(topic.last_post_at)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link 
            href="/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
          >
            👋 Stel je voor
          </Link>
          <Link 
            href="/dashboard/brotherhood/forum"
            className="px-6 py-3 rounded-xl bg-[#3A4D23]/60 text-[#8BAE5A] font-bold shadow hover:bg-[#3A4D23]/80 transition-all"
          >
            ← Terug naar Forum
          </Link>
        </div>
      </div>
    </div>
  );
}
