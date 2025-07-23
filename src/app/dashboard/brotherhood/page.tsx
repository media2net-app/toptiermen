"use client";
import ClientLayout from '../../components/ClientLayout';
import PageLayout from '../../../components/PageLayout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaUsers, FaTrophy, FaCalendarAlt, FaComments } from 'react-icons/fa';
import BrotherhoodSubNav from "./SubNav";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
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

      // Generate mock groups based on user interests
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

      // Generate mock events
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
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Brotherhood
          </h1>
          <p className="text-[#8BAE5A] text-lg">
            Word onderdeel van een community van mannen die streven naar excellentie
          </p>
        </div>

        {/* Navigation */}
        <BrotherhoodSubNav />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#232D1A]/80 rounded-xl p-4 text-center border border-[#3A4D23]/40">
            <FaUsers className="w-8 h-8 text-[#8BAE5A] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{myConnections.length}</div>
            <div className="text-[#8BAE5A] text-sm">Connecties</div>
          </div>
          <div className="bg-[#232D1A]/80 rounded-xl p-4 text-center border border-[#3A4D23]/40">
            <FaTrophy className="w-8 h-8 text-[#8BAE5A] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{myGroups.length}</div>
            <div className="text-[#8BAE5A] text-sm">Groepen</div>
          </div>
          <div className="bg-[#232D1A]/80 rounded-xl p-4 text-center border border-[#3A4D23]/40">
            <FaCalendarAlt className="w-8 h-8 text-[#8BAE5A] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{upcomingEvents.length}</div>
            <div className="text-[#8BAE5A] text-sm">Evenementen</div>
          </div>
          <div className="bg-[#232D1A]/80 rounded-xl p-4 text-center border border-[#3A4D23]/40">
            <FaComments className="w-8 h-8 text-[#8BAE5A] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{recentTopics.length}</div>
            <div className="text-[#8BAE5A] text-sm">Topics</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Groups */}
          <div className="bg-[#232D1A]/80 rounded-2xl p-6 border border-[#3A4D23]/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Mijn Groepen</h2>
              <Link href="/dashboard/brotherhood/mijn-groepen" className="text-[#8BAE5A] hover:text-[#FFD700] text-sm">
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
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{group.name}</h3>
                    <p className="text-[#8BAE5A] text-sm">{group.member_count} leden</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Connections */}
          <div className="bg-[#232D1A]/80 rounded-2xl p-6 border border-[#3A4D23]/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Mijn Connecties</h2>
              <Link href="/dashboard/brotherhood/leden" className="text-[#8BAE5A] hover:text-[#FFD700] text-sm">
                Bekijk alle
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {myConnections.map((connection) => (
                <div key={connection.id} className="flex items-center gap-2 p-2 bg-[#181F17] rounded-lg">
                  <Image
                    src={connection.avatar}
                    alt={connection.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{connection.name}</h3>
                    <p className="text-[#8BAE5A] text-xs">{connection.rank}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-[#232D1A]/80 rounded-2xl p-6 border border-[#3A4D23]/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Aankomende Evenementen</h2>
              <Link href="/dashboard/brotherhood/evenementen" className="text-[#8BAE5A] hover:text-[#FFD700] text-sm">
                Bekijk alle
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 bg-[#181F17] rounded-lg">
                  <h3 className="font-semibold text-white">{event.title}</h3>
                  <p className="text-[#8BAE5A] text-sm">{event.date} • {event.type}</p>
                  <p className="text-[#8BAE5A] text-xs">{event.attendees} deelnemers</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Topics */}
          <div className="bg-[#232D1A]/80 rounded-2xl p-6 border border-[#3A4D23]/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recente Topics</h2>
              <Link href="/dashboard/brotherhood/forum" className="text-[#8BAE5A] hover:text-[#FFD700] text-sm">
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] rounded-xl font-semibold hover:from-[#A6C97B] hover:to-[#FFE55C] transition-all shadow-lg"
          >
            <FaComments className="w-5 h-5" />
            Start een Discussie
          </Link>
        </div>
      </div>
    </ClientLayout>
  );
} 