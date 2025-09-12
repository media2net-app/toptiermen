"use client";
import ClientLayout from '@/app/components/ClientLayout';
import PageLayout from '../../../components/PageLayout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaUsers, FaTrophy, FaCalendarAlt, FaComments } from 'react-icons/fa';
import BrotherhoodSubNav from "./SubNav";
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import Breadcrumb, { createBreadcrumbs } from '@/components/Breadcrumb';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Connection {
  id: string;
  name: string;
  avatar: string;
  rank: string;
}

interface Topic {
  id: string;
  title: string;
  author: string;
  time: string;
}

export default function Brotherhood() {
  const { user } = useSupabaseAuth();
  const [myConnections, setMyConnections] = useState<Connection[]>([]);
  const [recentTopics, setRecentTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBrotherhoodData();
    }
  }, [user]);

  const fetchBrotherhoodData = async () => {
    try {
      setLoading(true);

      // Only fetch forum topics and user profiles - remove slow API calls
      const [topicsResponse, profilesResponse] = await Promise.all([
        supabase
          .from('forum_topics')
          .select(`
            id,
            title,
            created_at,
            author_id,
            profiles!forum_topics_author_id_fkey(display_name, full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('profiles')
          .select('id, display_name, full_name, avatar_url, rank')
          .neq('id', user?.id)
          .order('created_at', { ascending: false })
          .limit(6)
      ]);

      // Handle forum topics
      if (topicsResponse.error) {
        console.error('Error fetching topics:', topicsResponse.error);
      } else {
        const formattedTopics: Topic[] = topicsResponse.data?.map(topic => ({
          id: topic.id.toString(),
          title: topic.title,
          author: topic.profiles?.[0]?.display_name || topic.profiles?.[0]?.full_name || 'Onbekende gebruiker',
          time: formatTimeAgo(topic.created_at)
        })) || [];
        setRecentTopics(formattedTopics);
      }

      // Handle user profiles
      if (profilesResponse.error) {
        console.error('Error fetching profiles:', profilesResponse.error);
      } else {
        const formattedConnections: Connection[] = profilesResponse.data?.map(profile => ({
          id: profile.id,
          name: profile.display_name || profile.full_name || 'Onbekende gebruiker',
          avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          rank: profile.rank || 'Member'
        })) || [];
        setMyConnections(formattedConnections);
      }

    } catch (error) {
      console.error('Error fetching brotherhood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Zojuist';
    if (diffInHours < 24) return `${diffInHours}u geleden`;
    if (diffInHours < 48) return 'Gisteren';
    return `${Math.floor(diffInHours / 24)} dagen geleden`;
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={createBreadcrumbs('Brotherhood')} />
      </div>
      
      <div className="space-y-8">
        {/* Stats Overview - Only Leden and Forum */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-[#232D1A]/80 rounded-xl p-4 sm:p-6 text-center border border-[#3A4D23]/40">
            <FaUsers className="w-8 h-8 sm:w-10 sm:h-10 text-[#8BAE5A] mx-auto mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-white">{myConnections.length}</div>
            <div className="text-[#8BAE5A] text-sm sm:text-base">Leden</div>
          </div>
          <div className="bg-[#232D1A]/80 rounded-xl p-4 sm:p-6 text-center border border-[#3A4D23]/40">
            <FaComments className="w-8 h-8 sm:w-10 sm:h-10 text-[#8BAE5A] mx-auto mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-white">{recentTopics.length}</div>
            <div className="text-[#8BAE5A] text-sm sm:text-base">Forum Topics</div>
          </div>
        </div>

        {/* Content Grid - Only Leden and Forum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* My Connections */}
          <div className="bg-[#232D1A]/80 rounded-2xl p-4 sm:p-6 border border-[#3A4D23]/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Leden</h2>
              <Link href="/dashboard/brotherhood/leden" className="text-[#8BAE5A] hover:text-[#FFD700] text-xs sm:text-sm">
                Bekijk alle
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myConnections.map((connection) => (
                <div key={connection.id} className="flex items-center gap-2 p-2 bg-[#181F17] rounded-lg">
                  <Image
                    src={connection.avatar}
                    alt={connection.name}
                    width={32}
                    height={32}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-xs sm:text-sm truncate">{connection.name}</h3>
                    <p className="text-[#8BAE5A] text-xs">{connection.rank}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Topics */}
          <div className="bg-[#232D1A]/80 rounded-2xl p-4 sm:p-6 border border-[#3A4D23]/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Forum</h2>
              <Link href="/dashboard/brotherhood/forum" className="text-[#8BAE5A] hover:text-[#FFD700] text-xs sm:text-sm">
                Bekijk alle
              </Link>
            </div>
            <div className="space-y-3">
              {recentTopics.map((topic) => (
                <div key={topic.id} className="p-3 bg-[#181F17] rounded-lg">
                  <h3 className="font-semibold text-white text-sm">{topic.title}</h3>
                  <p className="text-[#8BAE5A] text-xs">
                    door {topic.author} • {topic.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link
            href="/dashboard/brotherhood/forum"
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] rounded-xl font-semibold hover:from-[#A6C97B] hover:to-[#FFE55C] transition-all shadow-lg text-sm sm:text-base"
          >
            <FaComments className="w-4 h-4 sm:w-5 sm:h-5" />
            Start een Discussie
          </Link>
        </div>
      </div>
    </ClientLayout>
  );
} 