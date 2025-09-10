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

interface Group {
  id: string;
  name: string;
  logo: string;
  member_count: number;
}

interface Connection {
  id: string;
  name: string;
  avatar: string;
  rank: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  attendees: number;
}

interface Topic {
  id: string;
  title: string;
  author: string;
  time: string;
}

export default function Brotherhood() {
  const { user } = useSupabaseAuth();
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [myConnections, setMyConnections] = useState<Connection[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
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

      // Fetch recent forum topics
      const { data: topics, error: topicsError } = await supabase
        .from('forum_topics')
        .select(`
          id,
          title,
          created_at,
          author_id,
          profiles!forum_topics_author_id_fkey(display_name, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      if (topicsError) {
        console.error('Error fetching topics:', topicsError);
      } else {
        const formattedTopics: Topic[] = topics?.map(topic => ({
          id: topic.id.toString(),
          title: topic.title,
          author: topic.profiles?.[0]?.display_name || topic.profiles?.[0]?.full_name || 'Onbekende gebruiker',
          time: formatTimeAgo(topic.created_at)
        })) || [];
        setRecentTopics(formattedTopics);
      }

      // Fetch recent users as connections
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, avatar_url, rank')
        .neq('id', user?.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else {
        const formattedConnections: Connection[] = profiles?.map(profile => ({
          id: profile.id,
          name: profile.display_name || profile.full_name || 'Onbekende gebruiker',
          avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          rank: profile.rank || 'Member'
        })) || [];
        setMyConnections(formattedConnections);
      }

      // Fetch real brotherhood groups from database
      const groupsResponse = await fetch('/api/brotherhood/groups?is_public=true');
      const groupsResult = await groupsResponse.json();
      
      if (groupsResult.success) {
        const formattedGroups: Group[] = groupsResult.groups.map((group: any) => ({
          id: group.id,
          name: group.name,
          logo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=150&h=150&fit=crop&crop=face", // Default logo
          member_count: group.member_count || 0
        }));
        setMyGroups(formattedGroups);
      } else {
        // Fallback to mock data
        const mockGroups: Group[] = [
          { 
            id: '1', 
            name: "Crypto & DeFi Pioniers", 
            logo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=150&h=150&fit=crop&crop=face",
            member_count: 8
          },
          { 
            id: '2', 
            name: "Mindset Masters", 
            logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            member_count: 12
          },
          { 
            id: '3', 
            name: "Fitness Tribe", 
            logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face",
            member_count: 15
          }
        ];
        setMyGroups(mockGroups);
      }

      // Fetch real brotherhood events from database
      const eventsResponse = await fetch('/api/brotherhood/events?status=upcoming');
      const eventsResult = await eventsResponse.json();
      
      if (eventsResult.success) {
        const formattedEvents: Event[] = eventsResult.events.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date).toLocaleDateString('nl-NL', { 
            day: 'numeric', 
            month: 'long' 
          }),
          type: event.type,
          attendees: event.current_attendees || 0
        }));
        setUpcomingEvents(formattedEvents);
      } else {
        // Fallback to mock data
        const mockEvents: Event[] = [
          { 
            id: '1', 
            title: "Finance Mastermind Call", 
            date: "Morgen 20:00", 
            type: "Online Workshop", 
            attendees: 12 
          },
          { 
            id: '2', 
            title: "Mindset Workshop", 
            date: "Overmorgen 19:00", 
            type: "Fysieke Meetup (Amsterdam)", 
            attendees: 8 
          },
          { 
            id: '3', 
            title: "Crypto Meetup", 
            date: "Volgende week", 
            type: "Online Workshop", 
            attendees: 15 
          }
        ];
        setUpcomingEvents(mockEvents);
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
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#232D1A]/80 rounded-xl p-3 sm:p-4 text-center border border-[#3A4D23]/40">
            <FaUsers className="w-6 h-6 sm:w-8 sm:h-8 text-[#8BAE5A] mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-white">{myConnections.length}</div>
            <div className="text-[#8BAE5A] text-xs sm:text-sm">Connecties</div>
          </div>
          <div className="bg-[#232D1A]/80 rounded-xl p-3 sm:p-4 text-center border border-[#3A4D23]/40">
            <FaTrophy className="w-6 h-6 sm:w-8 sm:h-8 text-[#8BAE5A] mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-white">{myGroups.length}</div>
            <div className="text-[#8BAE5A] text-xs sm:text-sm">Groepen</div>
          </div>
          <div className="bg-[#232D1A]/80 rounded-xl p-3 sm:p-4 text-center border border-[#3A4D23]/40">
            <FaCalendarAlt className="w-6 h-6 sm:w-8 sm:h-8 text-[#8BAE5A] mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-white">{upcomingEvents.length}</div>
            <div className="text-[#8BAE5A] text-xs sm:text-sm">Evenementen</div>
          </div>
          <div className="bg-[#232D1A]/80 rounded-xl p-3 sm:p-4 text-center border border-[#3A4D23]/40">
            <FaComments className="w-6 h-6 sm:w-8 sm:h-8 text-[#8BAE5A] mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-white">{recentTopics.length}</div>
            <div className="text-[#8BAE5A] text-xs sm:text-sm">Topics</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* My Groups */}
          <div className="bg-[#232D1A]/80 rounded-2xl p-4 sm:p-6 border border-[#3A4D23]/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Mijn Groepen</h2>
              <Link href="/dashboard/brotherhood/mijn-groepen" className="text-[#8BAE5A] hover:text-[#FFD700] text-xs sm:text-sm">
                Bekijk alle
              </Link>
            </div>
            <div className="space-y-3">
              {myGroups.map((group) => (
                <div key={group.id} className="flex items-center gap-3 p-3 bg-[#181F17] rounded-lg">
                  <Image
                    src={group.logo}
                    alt={group.name}
                    width={40}
                    height={40}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm sm:text-base truncate">{group.name}</h3>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm">{group.member_count} leden</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Connections */}
          <div className="bg-[#232D1A]/80 rounded-2xl p-4 sm:p-6 border border-[#3A4D23]/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Mijn Connecties</h2>
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

          {/* Upcoming Events */}
          <div className="bg-[#232D1A]/80 rounded-2xl p-4 sm:p-6 border border-[#3A4D23]/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Aankomende Evenementen</h2>
              <Link href="/dashboard/brotherhood/evenementen" className="text-[#8BAE5A] hover:text-[#FFD700] text-xs sm:text-sm">
                Bekijk alle
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 bg-[#181F17] rounded-lg">
                  <h3 className="font-semibold text-white text-sm sm:text-base">{event.title}</h3>
                  <p className="text-[#8BAE5A] text-xs sm:text-sm">{event.date} • {event.type}</p>
                  <p className="text-[#8BAE5A] text-xs">{event.attendees} deelnemers</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Topics */}
          <div className="bg-[#232D1A]/80 rounded-2xl p-4 sm:p-6 border border-[#3A4D23]/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Recente Topics</h2>
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